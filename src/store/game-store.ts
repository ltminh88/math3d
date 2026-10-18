import type { FactKey } from '../learning/fact-key';
import type { FactLocalState, SessionDelta } from '../learning/learning-types';
import { validateDelta } from './delta-validation';
import { isMemoryGameDb } from './memory-database';
import { type OpenDbOrMemoryOptions, openDbOrMemory } from './open-game-db-with-memory-fallback';
import { loadOrCreateActiveProfile, saveProfile } from './profile-repository';
import {
  appendOutbox,
  applyDelta,
  type GameSnapshot,
  loadSnapshot,
  readSessionCount,
} from './progress-repository';
import { metaSessionCountKey } from './save-schema';
import { inTransaction } from './store-transaction';

export type { GameSnapshot } from './progress-repository';

export type PurchaseResult =
  | { ok: true }
  | { ok: false; reason: 'insufficient-coins' | 'already-owned' };

/** Fired after the outbox gained an item (session finished or cosmetic bought). Phase 09 flushes on it. */
export interface SessionCommittedEvent {
  delta: SessionDelta;
}

export interface GameStore {
  /** false: IndexedDB was unavailable, progress lives in memory only (phase 04 shows a toast). */
  readonly persistent: boolean;
  getSnapshot(): GameSnapshot;
  subscribe(listener: (snapshot: GameSnapshot) => void): () => void;
  on(event: 'session-committed', listener: (e: SessionCommittedEvent) => void): () => void;
  /**
   * Number to stamp on the next session (for the planner and recorder). A hint from the snapshot:
   * the committed counter is re-derived inside the commit transaction, so tabs never collide.
   */
  nextSessionNo(): number;
  /**
   * Atomic: facts + levels + wallet + session counter + one outbox record, or nothing.
   * Idempotent per batchId: a retry of an already committed delta is a no-op success.
   */
  commitSession(delta: SessionDelta, local?: Record<FactKey, FactLocalState>): Promise<void>;
  /** Atomic debit + ownership + outbox record. Price semantics live in src/shop. */
  purchaseCosmetic(cosmeticId: string, price: number): Promise<PurchaseResult>;
  /** Stored in profile settings; ownership is the shop's concern (default items are never "purchased"). */
  equipCosmetic(slot: string, cosmeticId: string): Promise<void>;
  close(): void;
}

export interface OpenStoreOptions extends OpenDbOrMemoryOptions {
  now?: () => number;
  newId?: () => string;
}

export async function openGameStore(options: OpenStoreOptions = {}): Promise<GameStore> {
  const now = options.now ?? Date.now;
  const newId = options.newId ?? (() => crypto.randomUUID());
  const db = await openDbOrMemory(options);
  const profile = await loadOrCreateActiveProfile(db, newId);
  let snapshot = await loadSnapshot(db, profile);
  const snapshotListeners = new Set<(s: GameSnapshot) => void>();
  const commitListeners = new Set<(e: SessionCommittedEvent) => void>();

  const notify = <A>(listeners: Set<(a: A) => void>, arg: A): void => {
    for (const l of listeners) {
      try {
        l(arg);
      } catch (err) {
        console.error('Game store listener failed', err);
      }
    }
  };
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
      return serial(async () => {
        validateDelta(delta, snapshot.profile.id);
        if (delta.coins < 0 || (delta.cosmetics?.length ?? 0) > 0) {
          throw new Error(
            'commitSession cannot spend coins or grant cosmetics; use purchaseCosmetic',
          );
        }
        const at = now();
        await inTransaction(db, async (tx) => {
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
      return serial(async () => {
        if (cosmeticId === '') throw new Error('purchaseCosmetic: empty cosmetic id');
        if (!Number.isInteger(price) || price <= 0)
          throw new Error('purchaseCosmetic: price must be a positive integer');
        const profileId = snapshot.profile.id;
        const at = now();
        const delta: SessionDelta = {
          batchId: newId(),
          profileId,
          clientTs: at,
          v: 1,
          facts: {},
          levels: {},
          xp: 0,
          coins: -price,
          cosmetics: [cosmeticId],
        };
        const result = await inTransaction<PurchaseResult>(db, async (tx) => {
          if (await tx.objectStore('ownedCosmetics').get([profileId, cosmeticId]))
            return { ok: false, reason: 'already-owned' };
          const wallet = await tx.objectStore('wallet').get(profileId);
          if ((wallet?.coins ?? 0) < price) return { ok: false, reason: 'insufficient-coins' };
          await applyDelta(tx, delta, { now: at, sessionNo: snapshot.sessionCount });
          await appendOutbox(tx, delta, at);
          return { ok: true };
        });
        if (result.ok) await afterCommit(delta);
        return result;
      });
    },

    equipCosmetic(slot, cosmeticId) {
      return serial(async () => {
        if (slot === '' || cosmeticId === '')
          throw new Error('equipCosmetic: slot and id are required');
        const { profile: current } = snapshot;
        const profile = {
          ...current,
          settings: {
            ...current.settings,
            equipped: { ...current.settings.equipped, [slot]: cosmeticId },
          },
        };
        await saveProfile(db, profile);
        snapshot = { ...snapshot, profile };
        notify(snapshotListeners, snapshot);
      });
    },

    close() {
      snapshotListeners.clear();
      commitListeners.clear();
      db.close();
    },
  };
}
