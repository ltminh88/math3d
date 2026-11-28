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

describe('focus mix (Phase 4A)', () => {
  // Weak focus skills (no `recent`: the seeded-stat fallback reads correct/attempts).
  const weakFocus = (id: string, correct: number, box: number): [FactKey, FactStat] => [
    `sk:${id}` as FactKey,
    { ...newFactStat(), attempts: 10, correct, box, lastSeenAt: dayMs(2026, 10, 20) },
  ];
  const focusStats = (): Record<FactKey, FactStat> => ({
    ...Object.fromEntries([
      weakFocus('add-sub-1000', 2, 1), // score 0.8
      weakFocus('meas-len-convert', 5, 2), // score 0.5
      weakFocus('add-sub-column', 8, 1), // score 0.2
      weakFocus('meas-ruler-read', 9, 3), // score 0.1
    ]),
    'mul:3x4': stat(1, [2026, 10, 19]),
    'mul:3x5': stat(2, [2026, 10, 18]),
    'mul:3x6': stat(1, [2026, 10, 18]),
    'mul:4x6': stat(4, [2026, 10, 10]),
    'mul:3x7': stat(3, [2026, 10, 21]),
    'mul:4x5': stat(4, [2026, 10, 21]),
    'mul:4x4': stat(5, [2026, 10, 1]),
  });

  it('a seeded weak profile gets 6 focus items, weakest first', () => {
    const picked = pickDailyItems({ stats: focusStats(), today: TODAY, seed: 7 });
    expect(picked).toEqual([
      'sk:add-sub-1000',
      'sk:meas-len-convert',
      'sk:add-sub-column',
      'sk:meas-ruler-read',
      'sk:add-sub-1000',
      'sk:meas-len-convert',
      'mul:3x6',
      'mul:3x4',
      'mul:3x5',
      'mul:4x4',
    ]);
    expect(picked.filter((k) => k.startsWith('sk:'))).toHaveLength(6);
  });

  it('the interleaved set keeps 6 focus items', () => {
    const set = planDailySet({ stats: focusStats(), today: TODAY, seed: 7 });
    expect(set).toHaveLength(DAILY_LENGTH);
    expect(set.filter((k) => k.startsWith('sk:'))).toHaveLength(6);
  });

  it('is deterministic for (seed, today, stats)', () => {
    const input = { stats: focusStats(), today: TODAY, seed: 11 };
    expect(pickDailyItems(input)).toEqual(pickDailyItems(input));
  });

  it('fewer than 3 focus skills: exactly today’s set (regression guard)', () => {
    // Same pool as the first test plus two focus skills — hand-traced through
    // the old 6-due/3-weak/1-mastered rule (no ties in (box, lastSeenAt)).
    const stats = statsOf({
      'mul:3x4': stat(1, [2026, 10, 19]),
      'mul:3x5': stat(2, [2026, 10, 18]),
      'mul:3x6': stat(1, [2026, 10, 18]),
      'mul:4x6': stat(4, [2026, 10, 10]),
      'mul:3x7': stat(3, [2026, 10, 21]),
      'mul:4x5': stat(4, [2026, 10, 21]),
      'mul:4x4': stat(5, [2026, 10, 1]),
      'sk:add-sub-1000': stat(1, [2026, 10, 20]),
      'sk:meas-len-convert': stat(2, [2026, 10, 19]),
    });
    expect(pickDailyItems({ stats, today: TODAY, seed: 7 })).toEqual([
      'mul:3x6',
      'mul:3x4',
      'sk:add-sub-1000',
      'mul:3x5',
      'sk:meas-len-convert',
      'mul:4x6',
      'mul:3x7',
      'mul:4x5',
      'mul:4x4',
    ]);
  });

  it('no focus attempts: exactly today’s set', () => {
    const stats = statsOf({
      'mul:3x4': stat(1, [2026, 10, 20]),
      'mul:3x5': stat(2, [2026, 10, 19]),
      'mul:3x6': stat(1, [2026, 10, 19]),
      'mul:4x6': stat(4, [2026, 10, 10]),
      'mul:3x7': stat(3, [2026, 10, 21]),
      'mul:4x5': stat(4, [2026, 10, 21]),
      'mul:4x4': stat(5, [2026, 10, 1]),
    });
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
});

describe('dailyUnlocked', () => {
  it('opens after field stage 1 (stars >= 1), not before', () => {
    expect(dailyUnlocked({})).toBe(false);
    expect(dailyUnlocked({ field: { stars: 0 } })).toBe(false);
    expect(dailyUnlocked({ field: { stars: 1 } })).toBe(true);
    expect(dailyUnlocked({ field: { stars: 3 } })).toBe(true);
  });
});

describe('English in daily practice (Phase 6)', () => {
  const enDue = statsOf({
    'sk:en-letters-a-d': stat(1, [2026, 10, 20]),
    'sk:en-words-a-d': stat(1, [2026, 10, 20]),
    'sk:en-topic-animals': stat(1, [2026, 10, 20]),
  });
  const mathDue = statsOf({
    'mul:3x4': stat(1, [2026, 10, 20]),
    'mul:3x5': stat(1, [2026, 10, 20]),
    'mul:3x6': stat(1, [2026, 10, 20]),
    'mul:3x7': stat(1, [2026, 10, 20]),
    'mul:4x4': stat(1, [2026, 10, 20]),
    'mul:4x5': stat(1, [2026, 10, 20]),
    'mul:4x6': stat(1, [2026, 10, 20]),
    'mul:4x7': stat(1, [2026, 10, 20]),
    'div:12/3': stat(1, [2026, 10, 20]),
    'div:20/4': stat(1, [2026, 10, 20]),
  });

  it('locked island (default and explicit): no English items', () => {
    const stats = statsOf({ ...enDue, ...mathDue });
    for (const input of [
      { stats, today: TODAY, seed: 7 },
      { stats, today: TODAY, seed: 7, islandUnlocked: false },
    ]) {
      const set = planDailySet(input);
      expect(set).not.toContain('sk:en-letters-a-d');
      expect(set).not.toContain('sk:en-words-a-d');
      expect(set).not.toContain('sk:en-topic-animals');
    }
  });

  it('unlocked island: at most 2 English items, the day stays full', () => {
    const stats = statsOf({ ...enDue, ...mathDue });
    const set = planDailySet({ stats, today: TODAY, seed: 7, islandUnlocked: true });
    expect(set).toHaveLength(DAILY_LENGTH);
    expect(set.filter((k) => k.startsWith('sk:en-'))).toHaveLength(2);
  });

  it('unlocked island with only English learned: the day is 2 items, both English', () => {
    const set = planDailySet({ stats: enDue, today: TODAY, seed: 7, islandUnlocked: true });
    expect(set).toHaveLength(2);
    expect(set.every((k) => k.startsWith('sk:en-'))).toBe(true);
  });

  it('an untaught English skill never appears, unlocked or not', () => {
    const stats = statsOf({
      'sk:en-letters-a-d': { ...newFactStat(), attempts: 0, box: 1, lastSeenAt: 0 },
      'mul:3x4': stat(1, [2026, 10, 20]),
    });
    expect(planDailySet({ stats, today: TODAY, seed: 7, islandUnlocked: true })).toEqual([
      'mul:3x4',
    ]);
  });

  it('locked island: the deck equals the math-only deck (R114)', () => {
    // The English filter runs before the shuffle, so English stats on a locked
    // island cannot change the rng or the deck (was 158/2000 off main).
    const stats = statsOf({ ...enDue, ...mathDue });
    const mathOnly = statsOf({ ...mathDue });
    for (const seed of [7, 11, 23, 42]) {
      expect(planDailySet({ stats, today: TODAY, seed, islandUnlocked: false })).toEqual(
        planDailySet({ stats: mathOnly, today: TODAY, seed, islandUnlocked: false }),
      );
    }
  });

  it('is deterministic for (seed, today, stats, islandUnlocked)', () => {
    const stats = statsOf({ ...enDue, ...mathDue });
    const input = { stats, today: TODAY, seed: 11, islandUnlocked: true };
    expect(planDailySet(input)).toEqual(planDailySet(input));
  });
});
