import 'fake-indexeddb/auto';
import { describe, expect, it } from 'vitest';
import { newFactStat } from '../learning/leitner-box';
import { type GameStore, openGameStore } from './game-store';
import { createMemoryGameDb } from './memory-database';
import { emptyProgressRecords, type ProgressRecords } from './profile-replacement';

let dbCounter = 0;
const freshName = () => `profile-state-db-${++dbCounter}`;
const ids = () => {
  let n = 0;
  return () => `id-${++n}`;
};

const imported = (): ProgressRecords => ({
  avatarId: 'girl',
  wallet: { coins: 40, xp: 110 },
  levels: {
    bridge: { stars: 1, bestScore: 0, completedAt: 5, progress: 6, acceptedAt: 5 },
  },
  facts: { 'mul:2x8': { ...newFactStat(), attempts: 3, correct: 2, totalMs: 48, box: 2 } },
  gameMeta: { table: 4, combo: 5, started: true },
});

const backends: Array<[string, () => Promise<GameStore>]> = [
  ['indexeddb', () => openGameStore({ dbName: freshName(), newId: ids(), now: () => 77 })],
  ['memory', () => openGameStore({ db: createMemoryGameDb(), newId: ids(), now: () => 77 })],
];

describe.each(backends)('profile state on %s', (_label, open) => {
  it('starts with empty game meta and level progress', async () => {
    const store = await open();
    expect(store.getSnapshot().gameMeta).toEqual({ table: 0, combo: 0, started: false });
    expect(store.getSnapshot().levelProgress).toEqual({});
    store.close();
  });

  it('setAvatar, updateGameMeta and acceptLevel update the snapshot', async () => {
    const store = await open();
    await store.setAvatar('girl');
    await store.updateGameMeta({ started: true, table: 7 });
    await store.updateGameMeta({ combo: 2 });
    await store.acceptLevel('bridge');
    await store.acceptLevel('bridge');
    const snap = store.getSnapshot();
    expect(snap.profile.avatarId).toBe('girl');
    expect(snap.gameMeta).toEqual({ table: 7, combo: 2, started: true });
    expect(snap.levelProgress.bridge).toMatchObject({ acceptedAt: 77, progress: 0, stars: 0 });
    store.close();
  });

  it('commitSession merges level progress with max', async () => {
    const store = await open();
    const pid = store.getSnapshot().profile.id;
    const delta = (batchId: string, progress: number) => ({
      batchId,
      profileId: pid,
      clientTs: 1,
      v: 1 as const,
      facts: {},
      levels: { bridge: { stars: 0, bestScore: 0, progress } },
      xp: 10,
      coins: 5,
    });
    await store.commitSession(delta('a', 3));
    await store.commitSession(delta('b', 2));
    expect(store.getSnapshot().levelProgress.bridge).toMatchObject({ progress: 3, completedAt: 0 });
    await expect(store.commitSession(delta('c', -1))).rejects.toThrow();
    store.close();
  });

  it('replaceProgress swaps in a new active profile with exactly the given records', async () => {
    const store = await open();
    const oldId = store.getSnapshot().profile.id;
    await store.updateGameMeta({ combo: 9 });
    expect(await store.replaceProgress(imported())).toBe('replaced');
    const snap = store.getSnapshot();
    expect(snap.profile.id).not.toBe(oldId);
    expect(snap.profile.avatarId).toBe('girl');
    expect(snap.wallet).toEqual({ coins: 40, xp: 110 });
    expect(snap.gameMeta).toEqual({ table: 4, combo: 5, started: true });
    expect(snap.levelProgress.bridge).toMatchObject({ progress: 6, completedAt: 5, stars: 1 });
    expect(snap.factStats['mul:2x8']).toMatchObject({ attempts: 3, correct: 2, box: 2 });
    expect(snap.sessionCount).toBe(0);

    expect(await store.replaceProgress(emptyProgressRecords())).toBe('replaced');
    expect(store.getSnapshot().wallet).toEqual({ coins: 0, xp: 0 });
    expect(store.getSnapshot().factStats).toEqual({});
    store.close();
  });

  it('replaceProgress restores owned and equipped cosmetics and the session counter', async () => {
    const store = await open();
    await store.replaceProgress({
      ...imported(),
      levels: {
        ...imported().levels,
        tower: { stars: 2, bestScore: 9, completedAt: 6, progress: 0, acceptedAt: 6 },
      },
      cosmetics: {
        owned: ['avatar-gold-crown', 'decor-fountain'],
        equipped: { 'avatar-outfit': 'avatar-gold-crown' },
      },
      sessionCount: 12,
    });
    const snap = store.getSnapshot();
    expect([...snap.ownedCosmetics].sort()).toEqual(['avatar-gold-crown', 'decor-fountain']);
    expect(snap.profile.settings.equipped).toEqual({ 'avatar-outfit': 'avatar-gold-crown' });
    expect(snap.sessionCount).toBe(12);
    expect(snap.levelProgress.tower).toMatchObject({ stars: 2, completedAt: 6 });
    expect(store.nextSessionNo()).toBe(13);
    store.close();
  });

  it('a legacy import happens once (marker written in the same transaction)', async () => {
    const store = await open();
    expect(await store.replaceProgress(imported(), { legacyImport: true })).toBe('replaced');
    const after = store.getSnapshot();
    expect(await store.replaceProgress(emptyProgressRecords(), { legacyImport: true })).toBe(
      'already-imported',
    );
    expect(store.getSnapshot()).toEqual(after);
    store.close();
  });
});

describe('profile state across reloads and tabs', () => {
  it('replaced profile and game meta survive a reload', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name, newId: ids() });
    await store.replaceProgress(imported(), { legacyImport: true });
    await store.updateGameMeta({ table: 3 });
    const before = store.getSnapshot();
    store.close();
    const reopened = await openGameStore({ dbName: name, newId: ids() });
    expect(reopened.getSnapshot()).toEqual(before);
    reopened.close();
  });

  it('a second tab sees the marker and does not import again', async () => {
    const name = freshName();
    const tabA = await openGameStore({ dbName: name, newId: () => `a${Math.random()}` });
    const tabB = await openGameStore({ dbName: name, newId: () => `b${Math.random()}` });
    const results = await Promise.all([
      tabA.replaceProgress(imported(), { legacyImport: true }),
      tabB.replaceProgress(imported(), { legacyImport: true }),
    ]);
    expect([...results].sort()).toEqual(['already-imported', 'replaced']);
    tabA.close();
    tabB.close();
  });
});
