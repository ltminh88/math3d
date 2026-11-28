import { describe, expect, it } from 'vitest';
import { newFactStat } from '../learning/leitner-box';
import { type FactStatRow, mergeFactStat } from './progress-local-merge';

const row = (over: Partial<FactStatRow> = {}): FactStatRow => ({
  ...newFactStat(),
  profileId: 'p1',
  key: 'mul:2x3',
  ...over,
});
const fact = (over: Record<string, number> = {}) => ({
  a: 1,
  c: 1,
  ms: 1000,
  box: 2,
  seenAt: 2000,
  ...over,
});

describe('mergeFactStat', () => {
  it('adds counters and takes the box from the newest seenAt', () => {
    const next = mergeFactStat(row({ attempts: 4, box: 1 }), fact(), undefined, 3);
    expect(next).toMatchObject({ attempts: 5, correct: 1, totalMs: 1000, box: 2 });
    expect(next.lastSeenSession).toBe(3);
    const stale = mergeFactStat(row({ box: 4, lastSeenAt: 3000 }), fact(), undefined, 3);
    expect(stale.box).toBe(4);
    expect(stale.lastSeenSession).toBe(0);
  });

  it('carries seen from local like bugs, else keeps the stored list', () => {
    const local = { streak: 0, fluent: false, errs: [], seen: [11, 22] };
    expect(mergeFactStat(row(), fact(), local, 3).seen).toEqual([11, 22]);
    expect(mergeFactStat(row({ seen: [7] }), fact(), undefined, 3).seen).toEqual([7]);
    expect(
      mergeFactStat(row(), fact(), { streak: 0, fluent: false, errs: [] }, 3).seen,
    ).toBeUndefined();
    expect(mergeFactStat(row({ seen: [7] }), fact(), local, 3).seen).toEqual([11, 22]);
  });
});
