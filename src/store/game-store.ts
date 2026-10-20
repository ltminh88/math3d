import type { SessionDelta } from '../learning/learning-types';
import { assertActiveProfile, ProfileSwitchedError } from './active-profile-guard';
import {
  type PurchaseResult,
  purchaseDelta,
  purchaseInTransaction,
} from './cosmetic-purchase-transaction';
import { validateDelta } from './delta-validation';
import type { GameStore, OpenStoreOptions, SessionCommittedEvent } from './game-store-api';
import { isMemoryGameDb } from './memory-database';
import { openDbOrMemory } from './open-game-db-with-memory-fallback';
import { hasLegacyImportMarker, writeReplacementProfile } from './profile-replacement';
import { loadOrCreateActiveProfile } from './profile-repository';
import {
  appendOutbox,
  applyDelta,
  type GameSnapshot,
  loadSnapshot,
  newLevelProgress,
  readSessionCount,
} from './progress-repository';
import { metaGameKey, metaSessionCountKey, type Profile } from './save-schema';
import { inTransaction } from './store-transaction';

export { ProfileSwitchedError } from './active-profile-guard';
export type { PurchaseResult } from './cosmetic-purchase-transaction';
export type { GameStore, OpenStoreOptions, SessionCommittedEvent } from './game-store-api';
export type { GameSnapshot } from './progress-repository';

function notify<A>(listeners: Set<(a: A) => void>, arg: A): void {
  for (const l of listeners) {
    try {
      l(arg);
    } catch (err) {
      console.error('Game store listener failed', err);
    }
  }
}

export async function openGameStore(options: OpenStoreOptions = {}): Promise<GameStore> {
  const now = options.now ?? Date.now;
  const newId = options.newId ?? (() => crypto.randomUUID());
  const db = await openDbOrMemory(options);
  const profile = await loadOrCreateActiveProfile(db, newId);
  let snapshot = await loadSnapshot(db, profile);
  const snapshotListeners = new Set<(s: GameSnapshot) => void>();
  const commitListeners = new Set<(e: SessionCommittedEvent) => void>();

  const refresh = async (): Promise<void> => {
    snapshot = await loadSnapshot(db, snapshot.profile);
    notify(snapshotListeners, snapshot);
  };
  /** After a durable commit: listeners hear about the outbox item even if the refresh fails. */
  const afterCommit = async (delta: SessionDelta): Promise<void> => {
    try {
      await refresh();
    } finally {
      notify(commitListeners, { delta });
    }
  };
  // Writes are serialized so snapshot refreshes never interleave.
  let queue: Promise<unknown> = Promise.resolve();
  const serial = <T>(job: () => Promise<T>): Promise<T> => {
    const run = queue.then(job, job);
    queue = run.catch(() => undefined);
    return run;
  };
  /** Re-reads the active profile (another tab replaced it, or lost the legacy-import race). */
  const followActiveProfile = async (): Promise<void> => {
    const active = await loadOrCreateActiveProfile(db, newId);
    if (active.id === snapshot.profile.id) return;
    snapshot = await loadSnapshot(db, active);
    notify(snapshotListeners, snapshot);
  };
  /** A serialized write to the held profile; a stale profile is refused and then followed. */
  const write = <T>(job: () => Promise<T>): Promise<T> =>
    serial(async () => {
      try {
        return await job();
      } catch (err) {
        if (err instanceof ProfileSwitchedError) await followActiveProfile();
        throw err;
      }
    });
  const saveHeldProfile = async (profile: Profile): Promise<void> => {
    await inTransaction(db, async (tx) => {
      await assertActiveProfile(tx, profile.id);
      await tx.objectStore('profiles').put(profile);
    });
    snapshot = { ...snapshot, profile };
    notify(snapshotListeners, snapshot);
  };

  return {
    persistent: !isMemoryGameDb(db),
    getSnapshot: () => snapshot,
    subscribe(listener) {
      snapshotListeners.add(listener);
      return () => snapshotListeners.delete(listener);
    },
    on(_event, listener) {
      commitListeners.add(listener);
      return () => commitListeners.delete(listener);
    },
    nextSessionNo: () => snapshot.sessionCount + 1,

    commitSession(delta, local) {
      return write(async () => {
        validateDelta(delta, snapshot.profile.id);
        if (delta.coins < 0 || (delta.cosmetics?.length ?? 0) > 0) {
          throw new Error(
            'commitSession cannot spend coins or grant cosmetics; use purchaseCosmetic',
          );
        }
        const at = now();
        await inTransaction(db, async (tx) => {
          await assertActiveProfile(tx, delta.profileId);
          // Retry of a delta that already committed (e.g. the refresh failed afterwards): no-op.
          if (await tx.objectStore('outbox').index('byBatchId').get(delta.batchId)) return;
          const sessionNo = (await readSessionCount(tx, delta.profileId)) + 1;
          await applyDelta(tx, delta, { now: at, sessionNo, local });
          await tx
            .objectStore('meta')
            .put({ key: metaSessionCountKey(delta.profileId), value: sessionNo });
          await appendOutbox(tx, delta, at);
        });
        await afterCommit(delta);
      });
    },

    purchaseCosmetic(cosmeticId, price) {
      return write(async () => {
        const at = now();
        const delta = purchaseDelta(snapshot.profile.id, cosmeticId, price, at, newId);
        const result = await inTransaction<PurchaseResult>(db, (tx) =>
          purchaseInTransaction(tx, delta, price, at, snapshot.sessionCount),
        );
        if (result.ok) await afterCommit(delta);
        return result;
      });
    },

    equipCosmetic(slot, cosmeticId) {
      return write(async () => {
        if (slot === '' || cosmeticId === '')
          throw new Error('equipCosmetic: slot and id are required');
        const { profile: current } = snapshot;
        await saveHeldProfile({
          ...current,
          settings: {
            ...current.settings,
            equipped: { ...current.settings.equipped, [slot]: cosmeticId },
          },
        });
      });
    },

    setAvatar(avatarId) {
      return write(() => saveHeldProfile({ ...snapshot.profile, avatarId }));
    },

    updateGameMeta(patch) {
      return write(async () => {
        const gameMeta = { ...snapshot.gameMeta, ...patch };
        const profileId = snapshot.profile.id;
        await inTransaction(db, async (tx) => {
          await assertActiveProfile(tx, profileId);
          await tx.objectStore('meta').put({ key: metaGameKey(profileId), value: gameMeta });
        });
        snapshot = { ...snapshot, gameMeta };
        notify(snapshotListeners, snapshot);
      });
    },

    acceptLevel(levelId) {
      return write(async () => {
        const profileId = snapshot.profile.id;
        await inTransaction(db, async (tx) => {
          await assertActiveProfile(tx, profileId);
          const levels = tx.objectStore('levelProgress');
          const prev = {
            ...newLevelProgress(profileId, levelId),
            ...(await levels.get([profileId, levelId])),
          };
          if (prev.acceptedAt === 0) await levels.put({ ...prev, acceptedAt: now() });
        });
        await refresh();
      });
    },

    replaceProgress(records, replaceOptions = {}) {
      return serial(async () => {
        const profileId = newId();
        const profile = await inTransaction(db, async (tx) => {
          if (replaceOptions.legacyImport && (await hasLegacyImportMarker(tx))) return undefined;
          return writeReplacementProfile(tx, profileId, records, now(), replaceOptions);
        });
        if (!profile) {
          // Another tab imported first and switched the active profile: follow it.
          await followActiveProfile();
          return 'already-imported';
        }
        snapshot = await loadSnapshot(db, profile);
        notify(snapshotListeners, snapshot);
        return 'replaced';
      });
    },

    close() {
      snapshotListeners.clear();
      commitListeners.clear();
      db.close();
    },
  };
}
