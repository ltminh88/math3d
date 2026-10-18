import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { DbBlockedError, openGameDb } from './idb-database';
import { MIGRATIONS, type Migration } from './save-migrations';

let n = 0;
const name = () => `open-db-${++n}`;
const withV2: Migration[] = [...MIGRATIONS, { version: 2, up() {} }];

function openRawIgnoringVersionChange(dbName: string): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(dbName, 1);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

describe('openGameDb connection lifecycle', () => {
  it('rejects with DbBlockedError instead of hanging when an old connection will not close', async () => {
    const dbName = name();
    const stale = await openRawIgnoringVersionChange(dbName);
    await expect(
      openGameDb({ name: dbName, migrations: withV2, blockedTimeoutMs: 20 }),
    ).rejects.toBeInstanceOf(DbBlockedError);
    stale.close();
  });

  it('closes its own connection when a newer version needs to upgrade, and reports it', async () => {
    const dbName = name();
    const onVersionChange = vi.fn();
    const old = await openGameDb({ name: dbName, onVersionChange });
    const upgraded = await openGameDb({ name: dbName, migrations: withV2, blockedTimeoutMs: 500 });
    expect(upgraded.version).toBe(2);
    expect(onVersionChange).toHaveBeenCalledTimes(1);
    expect(() => old.transaction('meta')).toThrow();
    upgraded.close();
  });
});
