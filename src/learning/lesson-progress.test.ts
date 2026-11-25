// Lesson progress (phase 05): stars are derived from the stats, never stored.
// Oracles below are computed by hand:
//   stars: 1 = every skill attempted, 2 = every box >= 3, 3 = every box >= 4;
//   tables lessons use the 70% share (like the sticker rule): 14/19 facts = 74% earns,
//   13/19 = 68% does not.
//   B25 = div-rem-floor, div-rem-ceil, choose-all-correct, tf-explain.
//   B9  = tables [6]: 9 mul (6x2..6x10) + 9 div (12/6..60/6).
//   Topic 2 (B9-B15) has 7 playable lessons: B9-B15 (B14's fraction skills landed in
//   phase 12).
//   Next lesson with no stats is B1: its six number skills (phase 07) are the
//   first playable skills.
import { describe, expect, it } from 'vitest';
import { divFactsForTables, mulFactsForTables } from './curriculum-tables';
import type { FactKey } from './fact-key';
import { ALL_LESSONS, skillsOfLesson } from './kntt-lesson-index';
import type { FactStat } from './learning-types';
import { lessonStars, nextLesson, topicProgress } from './lesson-progress';

const stat = (box: number, attempts = 1): FactStat => ({
  attempts,
  correct: attempts,
  totalMs: 1000,
  box,
  lastSeenSession: 1,
  lastSeenAt: 1000,
  streak: 0,
  fluent: false,
  errs: [],
});
const statsOf = (keys: readonly FactKey[], box: number): Record<FactKey, FactStat> =>
  Object.fromEntries(keys.map((k) => [k, stat(box)]));

describe('lessonStars', () => {
  it('B25: 0-3 by hand', () => {
    const keys = [
      'sk:div-rem-floor',
      'sk:div-rem-ceil',
      'sk:choose-all-correct',
      'sk:tf-explain',
    ] as const;
    expect(lessonStars(25, {})).toBe(0);
    expect(lessonStars(25, statsOf(keys, 2))).toBe(1); // all attempted, none >= 3
    expect(lessonStars(25, statsOf(keys, 3))).toBe(2);
    expect(lessonStars(25, { 'sk:div-rem-floor': stat(4) })).toBe(0); // rest unattempted
    expect(
      lessonStars(25, {
        'sk:div-rem-floor': stat(4),
        'sk:div-rem-ceil': stat(3),
        'sk:choose-all-correct': stat(4),
        'sk:tf-explain': stat(4),
      }),
    ).toBe(2); // not all >= 4
    expect(lessonStars(25, statsOf(keys, 4))).toBe(3);
  });

  it('B14: 0-3 by hand (phase 12 fraction skills)', () => {
    const keys = [
      'sk:fraction-read',
      'sk:fraction-shaded',
      'sk:fraction-pick-picture',
      'sk:fraction-of-set-circle',
      'sk:fraction-of-set-number',
      'sk:fraction-wp',
    ] as const;
    expect(lessonStars(14, {})).toBe(0);
    expect(lessonStars(14, statsOf(keys, 2))).toBe(1); // all attempted, none >= 3
    expect(lessonStars(14, statsOf(keys, 3))).toBe(2);
    expect(lessonStars(14, statsOf(keys, 4))).toBe(3);
  });

  it('B66: 0-3 by hand (phase 13 time skills)', () => {
    const keys = [
      'sk:clock-read-hour-half',
      'sk:clock-read-5min',
      'sk:clock-read-minute',
      'sk:clock-sang-chieu-24h',
      'sk:clock-elapsed-minutes',
      'sk:times-order-digital',
      'sk:months-days-count',
      'sk:calendar-weekday',
      'sk:calendar-days-between',
      'sk:time-set-clock',
    ] as const;
    expect(lessonStars(66, {})).toBe(0);
    expect(lessonStars(66, statsOf(keys, 2))).toBe(1); // all attempted, none >= 3
    expect(lessonStars(66, statsOf(keys, 3))).toBe(2);
    expect(lessonStars(66, statsOf(keys, 4))).toBe(3);
  });

  it('B68: 0-3 by hand (phase 14 money skills)', () => {
    const keys = [
      'sk:money-recognize',
      'sk:money-total-notes',
      'sk:money-exchange',
      'sk:money-change-back',
      'sk:money-pick-notes',
      'sk:money-wp',
    ] as const;
    expect(lessonStars(68, {})).toBe(0);
    expect(lessonStars(68, statsOf(keys, 2))).toBe(1); // all attempted, none >= 3
    expect(lessonStars(68, statsOf(keys, 3))).toBe(2);
    expect(lessonStars(68, statsOf(keys, 4))).toBe(3);
  });

  it('B73: 0-3 by hand (phase 15 data table skills)', () => {
    const keys = [
      'sk:tally-count',
      'sk:table-read',
      'sk:table-max-min',
      'sk:table-sums',
      'sk:table-fill-missing',
    ] as const;
    expect(lessonStars(73, {})).toBe(0);
    expect(lessonStars(73, statsOf(keys, 2))).toBe(1); // all attempted, none >= 3
    expect(lessonStars(73, statsOf(keys, 3))).toBe(2);
    expect(lessonStars(73, statsOf(keys, 4))).toBe(3);
  });

  it('B74: 0-3 by hand (phase 15 chance skills)', () => {
    const keys = ['sk:chance-bag', 'sk:chance-dice'] as const;
    expect(lessonStars(74, {})).toBe(0);
    expect(lessonStars(74, statsOf(keys, 2))).toBe(1); // all attempted, none >= 3
    expect(lessonStars(74, statsOf(keys, 3))).toBe(2);
    expect(lessonStars(74, statsOf(keys, 4))).toBe(3);
  });

  it('B2: 0-3 by hand (phase 09 arithmetic skills)', () => {
    const keys = [
      'sk:add-sub-mental-round',
      'sk:add-sub-1000',
      'sk:add-sub-1000-wp',
      'sk:add-sub-1000-chain',
      'sk:add-sub-find-error',
      'sk:add-missing-digit',
    ] as const;
    expect(lessonStars(2, {})).toBe(0);
    expect(lessonStars(2, statsOf(keys, 2))).toBe(1); // all attempted, none >= 3
    expect(lessonStars(2, statsOf(keys, 3))).toBe(2);
    expect(lessonStars(2, statsOf(keys, 4))).toBe(3);
  });

  it('B54: 0-3 by hand (phase 09 4-digit skills)', () => {
    const keys = [
      'sk:add-4digit',
      'sk:add-sub-10000-wp',
      'sk:add-sub-find-error',
      'sk:add-missing-digit',
    ] as const;
    expect(lessonStars(54, {})).toBe(0);
    expect(lessonStars(54, statsOf(keys, 2))).toBe(1); // all attempted, none >= 3
    expect(lessonStars(54, statsOf(keys, 3))).toBe(2);
    expect(lessonStars(54, statsOf(keys, 4))).toBe(3);
  });

  it('tables B5: the 70% share decides', () => {
    const facts = [...mulFactsForTables([3]), ...divFactsForTables([3])];
    expect(facts).toHaveLength(18);
    // B5 has 19 keys: the 18 facts plus sk:pattern-skip-count (tagged 4-12).
    expect(lessonStars(5, statsOf(facts.slice(0, 13), 1))).toBe(0); // 13/19 = 68%
    expect(lessonStars(5, statsOf(facts.slice(0, 14), 1))).toBe(1); // 14/19 = 74%
    expect(lessonStars(5, statsOf(facts.slice(0, 14), 3))).toBe(2);
    expect(lessonStars(5, statsOf(facts.slice(0, 14), 4))).toBe(3);
  });

  it('a lesson with no keys has 0 stars', () => {
    expect(lessonStars(1, {})).toBe(0);
  });

  it('throws for an unknown lesson', () => {
    expect(() => lessonStars(99, {})).toThrow();
  });
});

describe('nextLesson', () => {
  it('points at B1 with no stats', () => {
    expect(nextLesson({})).toBe(1);
  });

  it('moves on once B3 is at 3 stars', () => {
    // B1's six number skills and B2's six arithmetic skills are at box 4 too, so B1
    // and B2 are done; B3 at 3 stars (box 4) moves the pointer to B4.
    const stats = statsOf(
      [
        'sk:num-read-write-1000',
        'sk:num-place-value-1000',
        'sk:num-neighbors-1000',
        'sk:num-compare-1000',
        'sk:num-order-1000',
        'sk:num-sequence-1000',
        'sk:add-sub-mental-round',
        'sk:add-sub-1000',
        'sk:add-sub-1000-wp',
        'sk:add-sub-1000-chain',
        'sk:add-sub-find-error',
        'sk:add-missing-digit',
        'sk:unknown-add-sub',
        'sk:unknown-add-sub-wp',
      ] as const,
      4,
    );
    expect(nextLesson(stats)).toBe(4);
  });

  it('skips lessons with nothing playable yet', () => {
    // B2 is the first lesson below 3 stars (its arithmetic skills landed in phase 09,
    // but none are practised yet). B1's six number skills are at box 4 too.
    const stats = statsOf(
      [
        'sk:num-read-write-1000',
        'sk:num-place-value-1000',
        'sk:num-neighbors-1000',
        'sk:num-compare-1000',
        'sk:num-order-1000',
        'sk:num-sequence-1000',
        'sk:unknown-add-sub',
        ...mulFactsForTables([2, 5]),
        ...divFactsForTables([2, 5]),
        ...mulFactsForTables([3]),
        ...divFactsForTables([3]),
      ],
      4,
    );
    expect(nextLesson(stats)).toBe(2);
  });

  it('is undefined when every playable lesson is at 3 stars', () => {
    // Input built from the lesson table; the expected value (undefined) is hand-decided.
    const stats: Record<FactKey, FactStat> = {};
    for (const lesson of ALL_LESSONS)
      for (const key of skillsOfLesson(lesson.n)) stats[key] = stat(4);
    expect(nextLesson(stats)).toBeUndefined();
  });
});

describe('topicProgress', () => {
  it('topic 1 has 8 playable lessons (B1-B8; B7 via phase 21 review skills)', () => {
    expect(topicProgress(1, {})).toEqual({ completed: 0, total: 8 });
  });

  it('topic 2 has 7 playable lessons', () => {
    expect(topicProgress(2, {})).toEqual({ completed: 0, total: 7 });
    const b9 = [...mulFactsForTables([6]), ...divFactsForTables([6])];
    expect(topicProgress(2, statsOf(b9, 4))).toEqual({ completed: 1, total: 7 });
  });

  it('topic 8 has 5 playable lessons (B45, B46, B47, B48, B49; B45/B46 via phase 07 numbers, B48 via phase 08 rounding)', () => {
    expect(topicProgress(8, {})).toEqual({ completed: 0, total: 5 });
    // B49 mixes B45-B48. B45/B46 now have skills (phase 07 numbers), so the
    // Roman clock alone no longer completes B47 (phase 08 added three Roman skills).
    expect(topicProgress(8, statsOf(['sk:roman-clock-hour'], 4))).toEqual({
      completed: 0,
      total: 5,
    });
    // All four B47 skills at box 4 complete B47.
    expect(
      topicProgress(
        8,
        statsOf(
          ['sk:roman-clock-hour', 'sk:roman-to-number', 'sk:number-to-roman', 'sk:roman-sequence'],
          4,
        ),
      ),
    ).toEqual({ completed: 1, total: 5 });
  });

  it('topic 13 has 4 playable lessons (B66, B67, B68, B69)', () => {
    expect(topicProgress(13, {})).toEqual({ completed: 0, total: 4 });
  });

  it('topic 15 has 3 playable lessons (B73, B74, B75)', () => {
    expect(topicProgress(15, {})).toEqual({ completed: 0, total: 3 });
  });

  it('topic 16 has 6 playable lessons (B76 via the Roman clock, B77 via phase 09 arithmetic, B78 via phase 11 arithmetic, B79, B80, B81)', () => {
    expect(topicProgress(16, {})).toEqual({ completed: 0, total: 6 });
  });

  it('an unknown topic is empty', () => {
    expect(topicProgress(99, {})).toEqual({ completed: 0, total: 0 });
  });
});
