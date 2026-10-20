import type { IDBPTransaction, StoreNames } from 'idb';
import type { FactKey } from '../learning/fact-key';
import type { FactLocalState, FactStat, SessionDelta } from '../learning/learning-types';
import { newFactStat } from '../learning/leitner-box';
import type { GameDb } from './idb-database';
import type { NumberStoneDb } from './save-migrations';
import {
  DEFAULT_GAME_META,
  type GameMeta,
  type LevelProgress,
  metaGameKey,
  metaSessionCountKey,
  type Profile,
} from './save-schema';

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
  gameMeta: GameMeta;
}

/** Keeps only correctly typed fields of a stored game meta record. */
export function sanitizeGameMeta(raw: unknown): GameMeta {
  const r = (typeof raw === 'object' && raw !== null ? raw : {}) as Record<string, unknown>;
  const int = (v: unknown, fallback: number): number =>
    Number.isInteger(v) && (v as number) >= 0 ? (v as number) : fallback;
  return {
    table: int(r.table, DEFAULT_GAME_META.table),
    combo: int(r.combo, DEFAULT_GAME_META.combo),
    started: typeof r.started === 'boolean' ? r.started : DEFAULT_GAME_META.started,
  };
}

export function newLevelProgress(profileId: string, levelId: string): LevelProgress {
  return { profileId, levelId, stars: 0, bestScore: 0, completedAt: 0, progress: 0, acceptedAt: 0 };
}

export async function loadSnapshot(db: GameDb, profile: Profile): Promise<GameSnapshot> {
  const id = profile.id;
  const tx = db.transaction(ALL_STORES, 'readonly');
  const [facts, levels, wallet, owned, count, game] = await Promise.all([
    tx.objectStore('factStats').index('byProfile').getAll(id),
    tx.objectStore('levelProgress').index('byProfile').getAll(id),
    tx.objectStore('wallet').get(id),
    tx.objectStore('ownedCosmetics').index('byProfile').getAll(id),
    tx.objectStore('meta').get(metaSessionCountKey(id)),
    tx.objectStore('meta').get(metaGameKey(id)),
    tx.done,
  ]);
  const factStats: Record<FactKey, FactStat> = {};
  for (const { profileId: _p, key, ...stat } of facts) factStats[key] = stat;
  return {
    profile,
    factStats,
    levelProgress: Object.fromEntries(
      levels.map((l) => [l.levelId, { ...newLevelProgress(id, l.levelId), ...l }]),
    ),
    wallet: { coins: wallet?.coins ?? 0, xp: wallet?.xp ?? 0 },
    ownedCosmetics: owned.map((o) => o.cosmeticId),
    sessionCount: typeof count?.value === 'number' ? count.value : 0,
    gameMeta: sanitizeGameMeta(game?.value),
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
    const prev = {
      ...newLevelProgress(profileId, levelId),
      ...(await levels.get([profileId, levelId])),
    };
    await levels.put({
      ...prev,
      stars: Math.max(prev.stars, l.stars),
      bestScore: Math.max(prev.bestScore, l.bestScore),
      completedAt: l.stars >= 1 ? prev.completedAt || ctx.now : prev.completedAt,
      progress: Math.max(prev.progress, l.progress ?? 0),
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
