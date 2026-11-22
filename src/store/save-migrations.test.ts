import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { openGameDb } from './idb-database';
import { MIGRATIONS, type Migration, migrateLevelProgress } from './save-migrations';
import { newProfile } from './save-schema';

let n = 0;
const name = () => `mig-db-${++n}`;

describe('save migrations', () => {
  it('v1 creates every store the sync and shop phases rely on', async () => {
    const db = await openGameDb({ name: name(), migrations: MIGRATIONS.slice(0, 1) });
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

  it('upgrades a saved v1 database to v3 keeping the data', async () => {
    const dbName = name();
    const v1 = await openGameDb({ name: dbName, migrations: MIGRATIONS.slice(0, 1) });
    await v1.put('wallet', { profileId: 'p', coins: 12, xp: 3 });
    v1.close();

    const v3: Migration = {
      version: 3,
      async up(_db, tx) {
        const store = tx.objectStore('wallet');
        for (const w of await store.getAll()) await store.put({ ...w, coins: w.coins * 2 });
      },
    };
    const upgraded = await openGameDb({ name: dbName, migrations: [...MIGRATIONS, v3] });
    expect(upgraded.version).toBe(3);
    expect(await upgraded.get('wallet', 'p')).toEqual({ profileId: 'p', coins: 24, xp: 3 });
    upgraded.close();
  });

  it('a failing step aborts the upgrade and keeps the old save intact', async () => {
    const dbName = name();
    const v1 = await openGameDb({ name: dbName, migrations: MIGRATIONS.slice(0, 1) });
    await v1.put('wallet', { profileId: 'p', coins: 5, xp: 0 });
    v1.close();
    const broken: Migration = {
      version: 3,
      up: () => {
        throw new Error('bad step');
      },
    };
    await expect(
      openGameDb({ name: dbName, migrations: [...MIGRATIONS, broken] }),
    ).rejects.toThrow();
    const still = await openGameDb({ name: dbName });
    expect(still.version).toBe(2);
    expect(await still.get('wallet', 'p')).toMatchObject({ coins: 5 });
    still.close();
  });

  it('refuses to skip a version', async () => {
    const dbName = name();
    const gap: Migration = { version: 4, up: () => undefined };
    await expect(openGameDb({ name: dbName, migrations: [...MIGRATIONS, gap] })).rejects.toThrow();
  });
});

describe('stage migration (phase 01)', () => {
  it('a finished pre-stage record keeps its stars on stage 1', () => {
    expect(
      migrateLevelProgress({
        stars: 2,
        bestScore: 100,
        completedAt: 1,
        progress: 0,
        acceptedAt: 0,
      }),
    ).toMatchObject({ stars: 2, stageStars: [2] });
  });

  it('an unfinished pre-stage record becomes all zeros', () => {
    expect(
      migrateLevelProgress({ stars: 0, bestScore: 0, completedAt: 0, progress: 0, acceptedAt: 0 }),
    ).toMatchObject({ stars: 0, stageStars: [] });
  });

  it('a record that already has stage stars is untouched', () => {
    const rec = { stars: 3, stageStars: [3, 1, 0] };
    expect(migrateLevelProgress(rec)).toMatchObject({ stageStars: [3, 1, 0] });
  });

  it('a drifted record (stageStars[0] below stars) is repaired to the invariant on read', () => {
    expect(migrateLevelProgress({ stars: 3, stageStars: [1, 2] })).toMatchObject({
      stars: 3,
      stageStars: [3, 2],
    });
  });
});

describe('v2 equipped migration (phase 23)', () => {
  it('upgrades a v1 profile: the old slot -> id map becomes the multi-equip model', async () => {
    const dbName = name();
    const v1 = await openGameDb({ name: dbName, migrations: MIGRATIONS.slice(0, 1) });
    expect(v1.version).toBe(1);
    // A v1 profile stores the old slot -> id map (cast: the current Profile type
    // already carries the new shape).
    const oldProfile = newProfile('p1');
    (oldProfile.settings as { equipped: unknown }).equipped = {
      'vlm-outfit': 'vlm-red-scarf',
      'avatar-outfit': 'avatar-gold-crown',
      'village-decor': 'decor-fountain',
    };
    await v1.put('profiles', oldProfile);
    const stale = newProfile('p2');
    (stale.settings as { equipped: unknown }).equipped = {
      'vlm-outfit': 'none',
      'avatar-outfit': 'retired-item',
    };
    await v1.put('profiles', stale);
    v1.close();

    const upgraded = await openGameDb({ name: dbName });
    expect(upgraded.version).toBe(2);
    expect((await upgraded.get('profiles', 'p1'))?.settings.equipped).toEqual({
      vlm: { neck: 'vlm-red-scarf' },
      avatar: { head: 'avatar-gold-crown' },
      decor: ['decor-fountain'],
    });
    expect((await upgraded.get('profiles', 'p2'))?.settings.equipped).toEqual({
      vlm: {},
      avatar: {},
      decor: [],
    });
    upgraded.close();
  });

  it('leaves a profile that already wears the new model untouched', async () => {
    const dbName = name();
    const v1 = await openGameDb({ name: dbName, migrations: MIGRATIONS.slice(0, 1) });
    const profile = newProfile('p1');
    (profile.settings as { equipped: unknown }).equipped = {
      vlm: { head: 'vlm-star-band', neck: 'vlm-red-scarf' },
      avatar: {},
      decor: ['decor-flower-pots'],
    };
    await v1.put('profiles', profile);
    v1.close();

    const upgraded = await openGameDb({ name: dbName });
    expect((await upgraded.get('profiles', 'p1'))?.settings.equipped).toEqual({
      vlm: { head: 'vlm-star-band', neck: 'vlm-red-scarf' },
      avatar: {},
      decor: ['decor-flower-pots'],
    });
    upgraded.close();
  });
});
