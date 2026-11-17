// Daily planner tests (phase 11): due ordering, no top-up, no repeats, determinism,
// empty pool, unlock. A day is built from a local date so the tests hold in any timezone.
import { describe, expect, it } from 'vitest';
import { dayNumber } from './daily-intervals';
import { DAILY_LENGTH, dailyUnlocked, pickDailyItems, planDailySet } from './daily-planner';
import type { FactKey } from './fact-key';
import type { FactStat } from './learning-types';
import { newFactStat } from './leitner-box';

const dayMs = (y: number, m: number, d: number): number => new Date(y, m, d).getTime();
const TODAY = dayNumber(dayMs(2026, 10, 21));

const stat = (box: number, seenYmd: [number, number, number], attempts = 3): FactStat => ({
  ...newFactStat(),
  attempts,
  correct: attempts,
  box,
  lastSeenAt: dayMs(...seenYmd),
  lastSeenSession: 4,
});

const statsOf = (entries: Readonly<Record<string, FactStat>>): Record<FactKey, FactStat> =>
  entries as Record<FactKey, FactStat>;

describe('pickDailyItems', () => {
  it('picks due/weak first: lowest box, then oldest lastSeenAt', () => {
    const stats = statsOf({
      'mul:3x4': stat(1, [2026, 10, 20]),
      'mul:3x5': stat(2, [2026, 10, 19]),
      'mul:3x6': stat(1, [2026, 10, 19]),
      'mul:4x6': stat(4, [2026, 10, 10]),
      'mul:3x7': stat(3, [2026, 10, 21]),
      'mul:4x5': stat(4, [2026, 10, 21]),
      'mul:4x4': stat(5, [2026, 10, 1]),
    });
    // Due: 3x6 (box 1, 2d), 3x4 (box 1, 1d), 3x5 (box 2, 2d), 4x6 (box 4, 11d).
    // Not due: 3x7 (box 3), 4x5 (box 4) — both seen today, weakest first. Mastered: 4x4.
    expect(pickDailyItems({ stats, today: TODAY, seed: 7 })).toEqual([
      'mul:3x6',
      'mul:3x4',
      'mul:3x5',
      'mul:4x6',
      'mul:3x7',
      'mul:4x5',
      'mul:4x4',
    ]);
  });

  it('a fact seen today in box 1 is not due, but is still offered as weakest not-due', () => {
    const stats = statsOf({ 'mul:3x4': stat(1, [2026, 10, 21]) });
    expect(pickDailyItems({ stats, today: TODAY, seed: 5 })).toEqual(['mul:3x4']);
  });

  it('a fact seen yesterday in box 1 is due today', () => {
    const stats = statsOf({ 'mul:3x4': stat(1, [2026, 10, 20]) });
    expect(pickDailyItems({ stats, today: TODAY, seed: 5 })).toEqual(['mul:3x4']);
  });
});

describe('planDailySet', () => {
  it('never introduces an untaught fact and never repeats within a day', () => {
    const stats = statsOf({
      'mul:3x4': stat(1, [2026, 10, 20]),
      'mul:3x5': stat(1, [2026, 10, 20]),
      'mul:3x6': stat(1, [2026, 10, 20]),
      'mul:3x7': stat(1, [2026, 10, 20]),
      'mul:4x4': { ...newFactStat(), attempts: 0, box: 1, lastSeenAt: 0 },
    });
    const set = planDailySet({ stats, today: TODAY, seed: 3 });
    expect(set).toHaveLength(4);
    expect(new Set(set).size).toBe(4);
    expect(set).not.toContain('mul:4x4');
  });

  it('returns an empty set for an empty pool', () => {
    expect(planDailySet({ stats: {}, today: TODAY, seed: 1 })).toEqual([]);
  });

  it('is deterministic for (seed, today, stats) and caps at 10', () => {
    const stats = statsOf({
      'mul:3x4': stat(1, [2026, 10, 20]),
      'mul:3x5': stat(2, [2026, 10, 18]),
      'mul:3x6': stat(1, [2026, 10, 19]),
      'mul:3x7': stat(3, [2026, 10, 17]),
      'mul:4x4': stat(1, [2026, 10, 20]),
      'mul:4x5': stat(2, [2026, 10, 20]),
      'mul:4x6': stat(5, [2026, 10, 1]),
      'mul:4x7': stat(4, [2026, 10, 5]),
      'sk:wp-times-then-add': stat(2, [2026, 10, 18]),
      'sk:pattern-skip-count': stat(1, [2026, 10, 20]),
      'div:12/3': stat(1, [2026, 10, 19]),
      'div:20/4': stat(3, [2026, 10, 15]),
    });
    const first = planDailySet({ stats, today: TODAY, seed: 11 });
    const second = planDailySet({ stats, today: TODAY, seed: 11 });
    expect(first).toEqual(second);
    expect(first).toHaveLength(DAILY_LENGTH);
    expect(new Set(first).size).toBe(DAILY_LENGTH);
  });

  it('interleaves tables where avoidable: no two neighbours from the same table', () => {
    const entries: Record<string, FactStat> = {};
    for (let m = 4; m <= 8; m++) entries[`mul:3x${m}`] = stat(1, [2026, 10, 20]);
    for (let m = 4; m <= 8; m++) entries[`mul:4x${m}`] = stat(1, [2026, 10, 20]);
    const set = planDailySet({ stats: statsOf(entries), today: TODAY, seed: 9 });
    expect(set).toHaveLength(DAILY_LENGTH);
    const tableOf = (k: string): number => Number(k.split(':')[1]?.split('x')[0]);
    for (let i = 1; i < set.length; i++) {
      expect(tableOf(set[i] as string)).not.toBe(tableOf(set[i - 1] as string));
    }
  });
});

describe('dailyUnlocked', () => {
  it('opens after field stage 1 (stars >= 1), not before', () => {
    expect(dailyUnlocked({})).toBe(false);
    expect(dailyUnlocked({ field: { stars: 0 } })).toBe(false);
    expect(dailyUnlocked({ field: { stars: 1 } })).toBe(true);
    expect(dailyUnlocked({ field: { stars: 3 } })).toBe(true);
  });
});
