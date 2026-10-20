import { afterEach, describe, expect, it, vi } from 'vitest';
import { loadGoldenTrace } from '../config/load-golden-trace-for-tests';
import { SAVE_KEY } from '../config/world-constants';
import { decodeSaveV1, defaultSave, loadSave, parseSave, writeSave } from './save-storage';

interface SaveFixture {
  name: string;
  input: string | null;
  output: unknown;
}

describe('parseSave golden traces', () => {
  const fixtures = loadGoldenTrace<SaveFixture[]>('save-parse.json');

  it('covers all 40 original fixtures', () => {
    expect(fixtures).toHaveLength(40);
  });

  it.each(fixtures.map((f) => [f.name, f] as const))('%s', (_name, fixture) => {
    const parsed = parseSave(fixture.input);
    expect(parsed).toEqual(fixture.output);
    // Same JSON bytes (key order included) as the original would write back.
    expect(JSON.stringify(parsed)).toBe(JSON.stringify(fixture.output));
  });
});

describe('loadSave / writeSave', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('round-trips through localStorage under the original key', () => {
    const store = new Map<string, string>();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => store.set(key, value),
    });
    const save = { ...defaultSave(), xp: 120, review: ['m7_8'] };
    expect(writeSave(save)).toBe(true);
    expect(store.get(SAVE_KEY)).toBe(JSON.stringify(save));
    expect(loadSave()).toEqual(save);
  });

  it('falls back safely when storage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('denied');
      },
      setItem: () => {
        throw new Error('quota');
      },
    });
    expect(loadSave()).toEqual(defaultSave());
    expect(writeSave(defaultSave())).toBe(false);
  });
});

// Legacy v1 compatibility: the original reload kept only 30 stats / 30 review ids. That cap is
// the default of parseSave (golden-exact above); migration reads with { cap: false }.
describe('legacy v1 compatibility: 30-entry cap', () => {
  interface StatsTrace {
    trace: Array<{ id: string; stat: unknown }>;
    finalStatsCount: number;
    reparsed: { questionStats: Record<string, unknown>; review: string[] };
  }
  const golden = loadGoldenTrace<StatsTrace>('stats-update.json');
  // Rebuild the original 60-answer save (insertion order = first answer per fact) from the trace.
  const questionStats: Record<string, unknown> = {};
  for (const { id, stat } of golden.trace) questionStats[id] = stat;
  const review = Object.keys(questionStats);
  const raw = JSON.stringify({ ...defaultSave(), questionStats, review });

  it('default parse reproduces the original capped reload', () => {
    expect(Object.keys(questionStats)).toHaveLength(golden.finalStatsCount);
    expect(golden.finalStatsCount).toBeGreaterThan(30);
    expect(parseSave(raw).questionStats).toEqual(golden.reparsed.questionStats);
  });

  it('{ cap: false } keeps every valid stat and review id', () => {
    const save = parseSave(raw, { cap: false });
    expect(Object.keys(save.questionStats)).toHaveLength(golden.finalStatsCount);
    expect(save.review).toHaveLength(golden.finalStatsCount);
  });

  it('decodeSaveV1 tells invalid input apart from a default save', () => {
    for (const bad of [null, '', '{nope', '[]', '{"version":2}', '"x"', '{}']) {
      expect(decodeSaveV1(bad)).toBeNull();
    }
    expect(decodeSaveV1('{"version":1}')).toEqual(defaultSave());
  });
});
