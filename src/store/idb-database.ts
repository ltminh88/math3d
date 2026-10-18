import { type IDBPDatabase, openDB } from 'idb';
import {
  latestVersion,
  MIGRATIONS,
  type Migration,
  type NumberStoneDb,
  runMigrations,
} from './save-migrations';
import { DB_NAME } from './save-schema';

export type GameDb = IDBPDatabase<NumberStoneDb>;

export const DEFAULT_BLOCKED_TIMEOUT_MS = 3000;

/** Another tab or PWA window holds an older schema open; boot should ask the user to close it. */
export class DbBlockedError extends Error {
  constructor() {
    super('Save database upgrade is blocked by another open tab or window');
    this.name = 'DbBlockedError';
  }
}

export interface OpenOptions {
  name?: string;
  /** Override for migration tests; production uses MIGRATIONS. */
  migrations?: readonly Migration[];
  /** How long to wait on a `blocked` open before rejecting with DbBlockedError. */
  blockedTimeoutMs?: number;
  /** This connection was closed so a newer version (another tab) can upgrade: prompt a reload. */
  onVersionChange?: () => void;
  /** The browser killed the connection abnormally (storage cleared, crash): prompt a reload. */
  onTerminated?: () => void;
}

/**
 * Opens (and upgrades) the save database.
 * - Rejects when IndexedDB is unavailable or the open fails.
 * - Rejects with DbBlockedError when an older connection elsewhere stays open past the timeout.
 * - Closes itself (and calls onVersionChange) when a newer version elsewhere needs to upgrade.
 */
export function openGameDb(options: OpenOptions = {}): Promise<GameDb> {
  const migrations = options.migrations ?? MIGRATIONS;
  const blockedTimeoutMs = options.blockedTimeoutMs ?? DEFAULT_BLOCKED_TIMEOUT_MS;
  return new Promise<GameDb>((resolve, reject) => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let gaveUp = false;
    openDB<NumberStoneDb>(options.name ?? DB_NAME, latestVersion(migrations), {
      upgrade(db, oldVersion, newVersion, tx) {
        // The abort below rejects tx.done; openDB already reports the failure, so mark it handled.
        tx.done.catch(() => undefined);
        // idb ignores a rejected upgrade promise unless it aborts the transaction, so do that explicitly.
        runMigrations(
          db,
          tx,
          oldVersion,
          newVersion ?? latestVersion(migrations),
          migrations,
        ).catch((err: unknown) => {
          console.error('Save migration failed', err);
          tx.abort();
        });
      },
      blocked() {
        timer ??= setTimeout(() => {
          gaveUp = true;
          reject(new DbBlockedError());
        }, blockedTimeoutMs);
      },
      blocking(_current, _blocked, event) {
        (event.target as IDBDatabase).close();
        options.onVersionChange?.();
      },
      terminated() {
        options.onTerminated?.();
      },
    }).then(
      (db) => {
        clearTimeout(timer);
        // The blocker went away after we gave up: the caller already moved on, so release it.
        if (gaveUp) db.close();
        else resolve(db);
      },
      (err: unknown) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });
}
