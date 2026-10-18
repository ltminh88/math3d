import type { IDBPTransaction, StoreNames } from 'idb';
import type { FactKey } from '../learning/fact-key';
import type { FactLocalState, FactStat, SessionDelta } from '../learning/learning-types';
import { newFactStat } from '../learning/leitner-box';
import type { GameDb } from './idb-database';
import type { NumberStoneDb } from './save-migrations';
import { type LevelProgress, metaSessionCountKey, type Profile } from './save-schema';

export type StoreName = StoreNames<NumberStoneDb>;
export const ALL_STORES: StoreName[] = [
  'profiles',
  'factStats',
  'levelProgress',
  'wallet',
  'ownedCosmetics',
  'meta',
  'outbox',
];
export type WriteTx = IDBPTransaction<NumberStoneDb, StoreName[], 'readwrite'>;

export interface GameSnapshot {
  profile: Profile;
  factStats: Record<FactKey, FactStat>;
  levelProgress: Record<string, LevelProgress>;
  wallet: { coins: number; xp: number };
  ownedCosmetics: string[];
  /** Committed sessions so far; the next session is `sessionCount + 1`. */
  sessionCount: number;
}

export async function loadSnapshot(db: GameDb, profile: Profile): Promise<GameSnapshot> {
  const id = profile.id;
  const tx = db.transaction(ALL_STORES, 'readonly');
  const [facts, levels, wallet, owned, count] = await Promise.all([
    tx.objectStore('factStats').index('byProfile').getAll(id),
    tx.objectStore('levelProgress').index('byProfile').getAll(id),
    tx.objectStore('wallet').get(id),
    tx.objectStore('ownedCosmetics').index('byProfile').getAll(id),
    tx.objectStore('meta').get(metaSessionCountKey(id)),
    tx.done,
  ]);
  const factStats: Record<FactKey, FactStat> = {};
  for (const { profileId: _p, key, ...stat } of facts) factStats[key] = stat;
  return {
    profile,
    factStats,
    levelProgress: Object.fromEntries(levels.map((l) => [l.levelId, l])),
    wallet: { coins: wallet?.coins ?? 0, xp: wallet?.xp ?? 0 },
    ownedCosmetics: owned.map((o) => o.cosmeticId),
    sessionCount: typeof count?.value === 'number' ? count.value : 0,
  };
}

/** Committed session count read inside the caller's transaction (shared by every tab). */
export async function readSessionCount(tx: WriteTx, profileId: string): Promise<number> {
  const count = await tx.objectStore('meta').get(metaSessionCountKey(profileId));
  return typeof count?.value === 'number' ? count.value : 0;
}

export interface ApplyContext {
  now: number;
  sessionNo: number;
  local?: Record<FactKey, FactLocalState>;
}

/**
 * Applies a delta inside the caller's transaction: counters add, box follows the newest `seenAt`,
 * level stars/score keep the best, wallet adds (and never goes negative).
 */
export async function applyDelta(
  tx: WriteTx,
  delta: SessionDelta,
  ctx: ApplyContext,
): Promise<void> {
  const profileId = delta.profileId;
  const facts = tx.objectStore('factStats');
  for (const [key, f] of Object.entries(delta.facts)) {
    const prev = (await facts.get([profileId, key])) ?? { ...newFactStat(), profileId, key };
    const local = ctx.local?.[key];
    const newest = f.seenAt >= prev.lastSeenAt;
    await facts.put({
      ...prev,
      attempts: prev.attempts + f.a,
      correct: prev.correct + f.c,
      totalMs: prev.totalMs + f.ms,
      box: newest ? f.box : prev.box,
      lastSeenAt: Math.max(prev.lastSeenAt, f.seenAt),
      lastSeenSession: newest ? ctx.sessionNo : prev.lastSeenSession,
      streak: local?.streak ?? prev.streak,
      fluent: local?.fluent ?? prev.fluent,
      errs: local?.errs ?? prev.errs,
    });
  }

  const levels = tx.objectStore('levelProgress');
  for (const [levelId, l] of Object.entries(delta.levels)) {
    const prev = await levels.get([profileId, levelId]);
    await levels.put({
      profileId,
      levelId,
      stars: Math.max(prev?.stars ?? 0, l.stars),
      bestScore: Math.max(prev?.bestScore ?? 0, l.bestScore),
      completedAt: l.stars >= 1 ? prev?.completedAt || ctx.now : (prev?.completedAt ?? 0),
    });
  }

  const wallet = (await tx.objectStore('wallet').get(profileId)) ?? { profileId, coins: 0, xp: 0 };
  const coins = wallet.coins + delta.coins;
  if (coins < 0) throw new Error('Wallet cannot go negative');
  await tx.objectStore('wallet').put({ profileId, coins, xp: wallet.xp + delta.xp });

  for (const cosmeticId of delta.cosmetics ?? []) {
    await tx.objectStore('ownedCosmetics').put({ profileId, cosmeticId, acquiredAt: ctx.now });
  }
}

/** Appends the outbox record, last in a commit. The unique byBatchId index is a backstop for the store's idempotency check. */
export async function appendOutbox(tx: WriteTx, delta: SessionDelta, now: number): Promise<void> {
  await tx
    .objectStore('outbox')
    .add({ batchId: delta.batchId, profileId: delta.profileId, createdAt: now, payload: delta });
}
