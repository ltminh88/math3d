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
