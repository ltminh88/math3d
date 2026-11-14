import type { DBSchema, IDBPDatabase, IDBPTransaction, StoreNames } from 'idb';
import type {
  FactStatRecord,
  LevelProgress,
  MetaRecord,
  OutboxItem,
  OwnedCosmetic,
  Profile,
  Wallet,
} from './save-schema';

export interface NumberStoneDb extends DBSchema {
  profiles: { key: string; value: Profile };
  factStats: { key: [string, string]; value: FactStatRecord; indexes: { byProfile: string } };
  levelProgress: { key: [string, string]; value: LevelProgress; indexes: { byProfile: string } };
  wallet: { key: string; value: Wallet };
  ownedCosmetics: { key: [string, string]; value: OwnedCosmetic; indexes: { byProfile: string } };
  meta: { key: string; value: MetaRecord };
  outbox: { key: number; value: OutboxItem; indexes: { byBatchId: string } };
}

export type UpgradeTx = IDBPTransaction<
  NumberStoneDb,
  StoreNames<NumberStoneDb>[],
  'versionchange'
>;

export interface Migration {
  /** Schema version this step upgrades TO. */
  version: number;
  up: (db: IDBPDatabase<NumberStoneDb>, tx: UpgradeTx) => void | Promise<void>;
}

/** Ordered, append-only. Never edit a shipped step; add a new version instead. */
export const MIGRATIONS: readonly Migration[] = [
  {
    version: 1,
    up(db) {
      db.createObjectStore('profiles', { keyPath: 'id' });
      db.createObjectStore('factStats', { keyPath: ['profileId', 'key'] }).createIndex(
        'byProfile',
        'profileId',
      );
      db.createObjectStore('levelProgress', { keyPath: ['profileId', 'levelId'] }).createIndex(
        'byProfile',
        'profileId',
      );
      db.createObjectStore('wallet', { keyPath: 'profileId' });
      db.createObjectStore('ownedCosmetics', { keyPath: ['profileId', 'cosmeticId'] }).createIndex(
        'byProfile',
        'profileId',
      );
      db.createObjectStore('meta', { keyPath: 'key' });
      db.createObjectStore('outbox', { keyPath: 'seq', autoIncrement: true }).createIndex(
        'byBatchId',
        'batchId',
        {
          unique: true,
        },
      );
    },
  },
];

export function latestVersion(migrations: readonly Migration[]): number {
  return migrations.reduce((max, m) => Math.max(max, m.version), 0);
}

/**
 * Record migration for stages (phase 01, not an IndexedDB schema step — the store holds
 * whole objects, so a new optional field needs no version bump). A record written before
 * stages existed has no `stageStars`: stage 1 inherits the level's stars, stages 2+
 * open at 0. A record with `stars = 0` becomes all zeros.
 *
 * Invariant: `stageStars[0] === stars`. A record written before the invariant was enforced
 * can drift (stage 1 replayed better without sending `stageStars`); reading it repairs
 * stage 1 to `stars` and keeps stages 2+ as written.
 */
export function migrateLevelProgress<T extends { stars: number; stageStars?: readonly number[] }>(
  record: T,
): T & { stageStars: readonly number[] } {
  const raw = record.stageStars;
  if (Array.isArray(raw) && raw.length > 0) {
    if (raw[0] !== record.stars) return { ...record, stageStars: [record.stars, ...raw.slice(1)] };
    return { ...record, stageStars: raw };
  }
  return { ...record, stageStars: record.stars > 0 ? [record.stars] : [] };
}

/** Runs every step in (oldVersion, newVersion], in version order. Throws (aborting the upgrade) on gaps. */
export async function runMigrations(
  db: IDBPDatabase<NumberStoneDb>,
  tx: UpgradeTx,
  oldVersion: number,
  newVersion: number,
  migrations: readonly Migration[] = MIGRATIONS,
): Promise<void> {
  const steps = migrations
    .filter((m) => m.version > oldVersion && m.version <= newVersion)
    .sort((a, b) => a.version - b.version);
  let expected = oldVersion + 1;
  for (const step of steps) {
    if (step.version !== expected) throw new Error(`Missing save migration to version ${expected}`);
    await step.up(db, tx);
    expected += 1;
  }
  if (expected - 1 !== newVersion)
    throw new Error(`Missing save migration to version ${newVersion}`);
}
