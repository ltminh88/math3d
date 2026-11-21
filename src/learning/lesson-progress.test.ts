// Lesson progress (phase 05): stars are derived from the stats, never stored.
// Oracles below are computed by hand:
//   stars: 1 = every skill attempted, 2 = every box >= 3, 3 = every box >= 4;
//   tables lessons use the 70% share (like the sticker rule): 14/19 facts = 74% earns,
//   13/19 = 68% does not.
//   B25 = div-rem-floor, div-rem-ceil, choose-all-correct, tf-explain.
//   B9  = tables [6]: 9 mul (6x2..6x10) + 9 div (12/6..60/6).
//   Topic 2 (B9-B15) has 7 playable lessons: B9-B15 (B14's fraction skills landed in
//   phase 12).
//   Next lesson with no stats is B3: B1/B2 have no skills yet, B3's unknown-add-sub is
//   the first playable skill.
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
  it('points at B3 with no stats', () => {
    expect(nextLesson({})).toBe(3);
  });

  it('moves on once B3 is at 3 stars', () => {
    expect(nextLesson({ 'sk:unknown-add-sub': stat(4) })).toBe(4);
  });

  it('skips lessons with nothing playable yet', () => {
    // B6 is the first lesson below 3 stars (B14's fraction skills landed in phase 12,
    // but B6 comes first in textbook order).
    const stats = statsOf(
      [
        'sk:unknown-add-sub',
        ...mulFactsForTables([2, 5]),
        ...divFactsForTables([2, 5]),
        ...mulFactsForTables([3]),
        ...divFactsForTables([3]),
      ],
      4,
    );
    expect(nextLesson(stats)).toBe(6);
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
  it('topic 2 has 7 playable lessons', () => {
    expect(topicProgress(2, {})).toEqual({ completed: 0, total: 7 });
    const b9 = [...mulFactsForTables([6]), ...divFactsForTables([6])];
    expect(topicProgress(2, statsOf(b9, 4))).toEqual({ completed: 1, total: 7 });
  });

  it('topic 8 has 2 playable lessons (B47, B49 via the Roman clock)', () => {
    expect(topicProgress(8, {})).toEqual({ completed: 0, total: 2 });
    // B49 mixes B45-B48, whose other skills have not landed yet, so the Roman clock
    // alone completes both B47 and B49.
    expect(topicProgress(8, statsOf(['sk:roman-clock-hour'], 4))).toEqual({
      completed: 2,
      total: 2,
    });
  });

  it('topic 13 has 4 playable lessons (B66, B67, B68, B69)', () => {
    expect(topicProgress(13, {})).toEqual({ completed: 0, total: 4 });
  });

  it('topic 15 has 3 playable lessons (B73, B74, B75)', () => {
    expect(topicProgress(15, {})).toEqual({ completed: 0, total: 3 });
  });

  it('topic 16 has 4 playable lessons (B76 via the Roman clock, B79, B80, B81; B77-B78 wait for numbers/arithmetic)', () => {
    expect(topicProgress(16, {})).toEqual({ completed: 0, total: 4 });
  });

  it('an unknown topic is empty', () => {
    expect(topicProgress(99, {})).toEqual({ completed: 0, total: 0 });
  });
});
