import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { openGameDb } from './idb-database';
import { MIGRATIONS, type Migration } from './save-migrations';

let n = 0;
const name = () => `mig-db-${++n}`;

describe('save migrations', () => {
  it('v1 creates every store the sync and shop phases rely on', async () => {
    const db = await openGameDb({ name: name() });
    expect([...db.objectStoreNames].sort()).toEqual([
      'factStats',
      'levelProgress',
      'meta',
      'outbox',
      'ownedCosmetics',
      'profiles',
      'wallet',
    ]);
    expect(db.version).toBe(1);
    db.close();
  });

  it('upgrades a saved v1 database to v2 keeping the data', async () => {
    const dbName = name();
    const v1 = await openGameDb({ name: dbName });
    await v1.put('wallet', { profileId: 'p', coins: 12, xp: 3 });
    v1.close();

    const v2: Migration = {
      version: 2,
      async up(_db, tx) {
        const store = tx.objectStore('wallet');
        for (const w of await store.getAll()) await store.put({ ...w, coins: w.coins * 2 });
      },
    };
    const upgraded = await openGameDb({ name: dbName, migrations: [...MIGRATIONS, v2] });
    expect(upgraded.version).toBe(2);
    expect(await upgraded.get('wallet', 'p')).toEqual({ profileId: 'p', coins: 24, xp: 3 });
    upgraded.close();
  });

  it('a failing step aborts the upgrade and keeps the old save intact', async () => {
    const dbName = name();
    const v1 = await openGameDb({ name: dbName });
    await v1.put('wallet', { profileId: 'p', coins: 5, xp: 0 });
    v1.close();
    const broken: Migration = {
      version: 2,
      up: () => {
        throw new Error('bad step');
      },
    };
    await expect(
      openGameDb({ name: dbName, migrations: [...MIGRATIONS, broken] }),
    ).rejects.toThrow();
    const still = await openGameDb({ name: dbName });
    expect(still.version).toBe(1);
    expect(await still.get('wallet', 'p')).toMatchObject({ coins: 5 });
    still.close();
  });

  it('refuses to skip a version', async () => {
    const dbName = name();
    const gap: Migration = { version: 3, up: () => undefined };
    await expect(openGameDb({ name: dbName, migrations: [...MIGRATIONS, gap] })).rejects.toThrow();
  });
});
