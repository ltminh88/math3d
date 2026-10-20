import { describe, expect, it } from 'vitest';
import { loadGoldenTrace } from '../config/load-golden-trace-for-tests';
import { decodeSaveV1, defaultSave, parseSave } from './save-storage';

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
