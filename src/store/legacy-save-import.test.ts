import 'fake-indexeddb/auto';
import { describe, expect, it, vi } from 'vitest';
import { loadGoldenTrace } from '../config/load-golden-trace-for-tests';
import { SAVE_KEY, TABLES } from '../config/world-constants';
import { decodeSaveV1, defaultSave } from '../save/save-storage';
import type { SaveV1 } from '../save/save-types';
import { openGameStore } from './game-store';
import {
  importLegacySave,
  mapSaveV1ToProgress,
  readLegacySaveRaw,
  seedLeitnerBox,
} from './legacy-save-import';
import { createMemoryGameDb } from './memory-database';

let dbCounter = 0;
const freshName = () => `legacy-import-db-${++dbCounter}`;
const AT = Date.UTC(2026, 9, 20);

const sums = (save: SaveV1) => {
  const stats = Object.values(save.questionStats);
  return {
    attempts: stats.reduce((n, s) => n + s.attempts, 0),
    correct: stats.reduce((n, s) => n + s.correct, 0),
  };
};
const factSums = (facts: Record<string, { attempts: number; correct: number }>) => ({
  attempts: Object.values(facts).reduce((n, f) => n + f.attempts, 0),
  correct: Object.values(facts).reduce((n, f) => n + f.correct, 0),
});

/** Every valid fact id once: m2_1 .. m10_10 (90 stats, 3x past the original 30-entry cap). */
function ninetyStatSave(): string {
  const questionStats: Record<string, unknown> = {};
  for (const a of TABLES) {
    for (let b = 1; b <= 10; b++) {
      questionStats[`m${a}_${b}`] = {
        attempts: 99,
        correct: (a + b) % 4,
        wrong: (a * b) % 3,
        responseTime: 1000 + a * 10 + b,
        lastAnsweredAt: new Date(AT - a * 1000 - b).toISOString(),
      };
    }
  }
  return JSON.stringify({ ...defaultSave(), xp: 480, coins: 230, questionStats, review: ['m7_3'] });
}

describe('mapSaveV1ToProgress', () => {
  const fixtures =
    loadGoldenTrace<Array<{ name: string; input: string | null }>>('save-parse.json');

  it.each(fixtures.map((f) => [f.name, f.input] as const))(
    'fixture %s: never throws, totals equal the source sums',
    (_name, input) => {
      const save = decodeSaveV1(input, { cap: false }) ?? defaultSave();
      const records = mapSaveV1ToProgress(save, AT);
      expect(records.wallet).toEqual({ xp: save.xp, coins: save.coins });
      expect(factSums(records.facts)).toEqual(sums(save));
      expect(records.avatarId).toBe(save.avatar);
    },
  );

  it('maps a 90-stat save without the 30 cap, pooling commutative facts', () => {
    const save = decodeSaveV1(ninetyStatSave(), { cap: false }) as SaveV1;
    expect(Object.keys(save.questionStats)).toHaveLength(90);
    const { facts } = mapSaveV1ToProgress(save, AT);
    expect(Object.keys(facts)).toHaveLength(54);
    expect(factSums(facts)).toEqual(sums(save));
    const m37 = save.questionStats.m3_7;
    const m73 = save.questionStats.m7_3;
    expect(facts['mul:3x7']).toMatchObject({
      attempts: (m37?.attempts ?? 0) + (m73?.attempts ?? 0),
      correct: (m37?.correct ?? 0) + (m73?.correct ?? 0),
      totalMs:
        (m37?.responseTime ?? 0) * (m37?.attempts ?? 0) +
        (m73?.responseTime ?? 0) * (m73?.attempts ?? 0),
      lastSeenAt: Math.max(
        Date.parse(m37?.lastAnsweredAt ?? ''),
        Date.parse(m73?.lastAnsweredAt ?? ''),
      ),
      box: 1, // m7_3 is queued for review
    });
    expect(facts['mul:1x2']).toBeDefined(); // m2_1
  });

  it('maps bridge, quest flags, table/combo/started', () => {
    const save = { ...defaultSave(), bridge: 6, questAccepted: true, questComplete: true };
    const records = mapSaveV1ToProgress({ ...save, table: 7, combo: 4, started: true }, AT);
    expect(records.levels.bridge).toEqual({
      stars: 1,
      bestScore: 0,
      completedAt: AT,
      progress: 6,
      acceptedAt: AT,
    });
    expect(records.gameMeta).toEqual({ table: 7, combo: 4, started: true });
    expect(mapSaveV1ToProgress(defaultSave(), AT).levels).toEqual({});
  });

  it('seeds Leitner boxes from the original stats', () => {
    expect(seedLeitnerBox({ correct: 5, wrong: 0 }, true)).toBe(1);
    expect(seedLeitnerBox({ correct: 3, wrong: 0 }, false)).toBe(3);
    expect(seedLeitnerBox({ correct: 3, wrong: 1 }, false)).toBe(2);
    expect(seedLeitnerBox({ correct: 1, wrong: 4 }, false)).toBe(2);
    expect(seedLeitnerBox({ correct: 0, wrong: 2 }, false)).toBe(1);
  });
});

describe('importLegacySave', () => {
  const live =
    '{"version":1,"xp":110,"coins":40,"bridge":6,"questAccepted":true,"questComplete":true,"avatar":"girl","table":0,"sound":true,"music":false,"combo":5,"questionStats":{"m2_8":{"attempts":3,"correct":2,"wrong":1,"lastAnsweredAt":"2026-10-18T12:00:01.744Z","responseTime":16}},"review":[],"started":true}';

  it('imports once into IndexedDB and survives a reload', async () => {
    const name = freshName();
    const store = await openGameStore({ dbName: name });
    expect(await importLegacySave(store, live, AT)).toBe('imported');
    const snap = store.getSnapshot();
    expect(snap.wallet).toEqual({ xp: 110, coins: 40 });
    expect(snap.profile.avatarId).toBe('girl');
    expect(snap.levelProgress.bridge).toMatchObject({ progress: 6, completedAt: AT });
    expect(snap.factStats['mul:2x8']).toMatchObject({ attempts: 3, correct: 2, box: 2 });
    store.close();
    const again = await openGameStore({ dbName: name });
    expect(await importLegacySave(again, live)).toBe('already-imported');
    expect(again.getSnapshot().wallet).toEqual({ xp: 110, coins: 40 });
    again.close();
  });

  it('absent, garbage and version-2 saves import nothing and leave the store unchanged', async () => {
    const store = await openGameStore({ db: createMemoryGameDb() });
    const before = store.getSnapshot();
    expect(await importLegacySave(store, null)).toBe('absent');
    for (const raw of ['{garbage', '{"version":2,"xp":500}', '[1,2]', '']) {
      expect(await importLegacySave(store, raw)).toBe('invalid');
    }
    expect(store.getSnapshot()).toEqual(before);
    // No marker was written: a later valid save still imports.
    expect(await importLegacySave(store, '{"version":1,"xp":5}')).toBe('imported');
    expect(store.getSnapshot().wallet.xp).toBe(5);
    store.close();
  });

  it('missing keys fall back to the original defaults', async () => {
    const store = await openGameStore({ db: createMemoryGameDb() });
    expect(await importLegacySave(store, '{"version":1,"coins":12}')).toBe('imported');
    expect(store.getSnapshot()).toMatchObject({
      wallet: { xp: 0, coins: 12 },
      gameMeta: { table: 0, combo: 0, started: false },
      factStats: {},
      levelProgress: {},
    });
    store.close();
  });

  it('a failing store leaves no marker so the next boot retries', async () => {
    const store = await openGameStore({ db: createMemoryGameDb() });
    const spy = vi.spyOn(store, 'replaceProgress').mockRejectedValueOnce(new Error('disk'));
    await expect(importLegacySave(store, live)).rejects.toThrow('disk');
    spy.mockRestore();
    expect(await importLegacySave(store, live)).toBe('imported');
    store.close();
  });

  it('reads the raw blob, tolerating storage that throws (private mode)', () => {
    const data = new Map([[SAVE_KEY, live]]);
    expect(readLegacySaveRaw({ getItem: (k) => data.get(k) ?? null, setItem() {} })).toBe(live);
    const throwing = {
      getItem: () => {
        throw new Error('SecurityError');
      },
      setItem() {},
    };
    expect(readLegacySaveRaw(throwing)).toBeNull();
    expect(readLegacySaveRaw(null)).toBeNull();
  });
});
