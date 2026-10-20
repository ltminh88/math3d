// Two tabs share one database: when one switches the active profile (legacy import, reset,
// save-code import), the other must stop writing to the old profile and follow the new one.
import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import type { SessionDelta } from '../learning/learning-types';
import { type GameStore, openGameStore } from './game-store';
import { importLegacySave } from './legacy-save-import';
import { createMemoryGameDb } from './memory-database';
import { emptyProgressRecords } from './profile-replacement';

let dbCounter = 0;
const LEGACY = '{"version":1,"xp":110,"coins":40,"bridge":3,"questAccepted":true,"avatar":"girl"}';

/** Opens two "tabs" over the same database (one IndexedDB name, or one shared memory db). */
const backends: Array<[string, () => () => Promise<GameStore>]> = [
  [
    'indexeddb',
    () => {
      const dbName = `cross-tab-db-${++dbCounter}`;
      return () => openGameStore({ dbName });
    },
  ],
  [
    'memory',
    () => {
      const db = createMemoryGameDb();
      return () => openGameStore({ db });
    },
  ],
];

const delta = (profileId: string, batchId: string): SessionDelta => ({
  batchId,
  profileId,
  clientTs: 1,
  v: 1,
  facts: {},
  levels: {},
  xp: 10,
  coins: 5,
});

describe.each(backends)('cross-tab active profile on %s', (_label, sharedDb) => {
  it('a tab that lost the legacy-import race follows the imported profile', async () => {
    const open = sharedDb();
    const tabB = await open();
    const tabA = await open();
    expect(await importLegacySave(tabA, LEGACY)).toBe('imported');
    expect(await importLegacySave(tabB, LEGACY)).toBe('already-imported');
    expect(tabB.getSnapshot().profile.id).toBe(tabA.getSnapshot().profile.id);
    expect(tabB.getSnapshot().wallet).toEqual({ xp: 110, coins: 40 });
    tabA.close();
  });

  it('writes from a tab holding a replaced profile are refused, and it follows the new one', async () => {
    const open = sharedDb();
    const tabA = await open();
    const tabB = await open();
    const stale = tabB.getSnapshot().profile.id;
    await tabA.replaceProgress(emptyProgressRecords());
    const active = tabA.getSnapshot().profile.id;
    expect(active).not.toBe(stale);

    const switched = { name: 'ProfileSwitchedError' };
    await expect(tabB.commitSession(delta(stale, 'b1'))).rejects.toMatchObject(switched);
    expect(tabB.getSnapshot().profile.id).toBe(active);
    expect(tabB.getSnapshot().wallet).toEqual({ xp: 0, coins: 0 });

    // A store reopened on the stale profile id cannot write it either.
    const tabC = await open();
    await tabA.replaceProgress(emptyProgressRecords());
    await expect(tabC.updateGameMeta({ started: true })).rejects.toMatchObject(switched);
    await expect(tabB.setAvatar('girl')).rejects.toMatchObject(switched);
    const tabD = await open();
    await tabA.replaceProgress(emptyProgressRecords());
    await expect(tabD.acceptLevel('bridge')).rejects.toMatchObject(switched);

    const fresh = await open();
    expect(fresh.getSnapshot().profile.id).toBe(tabA.getSnapshot().profile.id);
    expect(fresh.getSnapshot()).toMatchObject({
      wallet: { xp: 0, coins: 0 },
      gameMeta: { started: false },
      levelProgress: {},
      sessionCount: 0,
    });
    tabA.close();
  });
});
