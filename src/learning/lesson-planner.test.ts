// Lesson planner (phase 05): a run is a list of fact keys for one lesson, weakest box
// first, round-robin. Oracles below are computed by hand from the catalog (phase 01),
// not by calling the helpers under test:
//   B25 = div-rem-floor, div-rem-ceil, choose-all-correct, tf-explain (catalog lines 36-37, 49-50)
//   B3  = unknown-add-sub only; B1 has the six number skills (phase 07); B2 has
//         the six arithmetic skills (phase 09); B7 mixes nothing; B14 =
//         the six fraction skills (phase 12); B23/B26/B36/B37 have the
//         mul/div arithmetic skills (phase 10)
//   B5  = tables [3]: 9 mul facts (3x2..3x10) + 9 div facts (6/3..30/3), plus
//         sk:pattern-skip-count (tagged 4, 5, 6, 9-12)
//   B44 = mix of [8, 15, 22, 29, 35, 40, 41, 42, 43]: facts (via B8) and skills (via B13/B15)
import { describe, expect, it } from 'vitest';
import { divFactsForTables, mulFactsForTables } from './curriculum-tables';
import type { FactKey } from './fact-key';
import { skillsOfLesson } from './kntt-lesson-index';
import type { FactStat } from './learning-types';
import { planLessonRun } from './lesson-planner';
import { mulberry32 } from './seeded-rng';

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

const B25_SKILLS: readonly FactKey[] = [
  'sk:div-rem-floor',
  'sk:div-rem-ceil',
  'sk:choose-all-correct',
  'sk:tf-explain',
];

describe('planLessonRun', () => {
  it('B25 run uses only B25 skills', () => {
    const run = planLessonRun(25, {}, mulberry32(1));
    expect(run).toHaveLength(6);
    for (const key of run) expect(B25_SKILLS).toContain(key);
    expect(run).toContain('sk:div-rem-floor');
    expect(run).toContain('sk:div-rem-ceil');
    expect(run.every((k) => k.startsWith('sk:'))).toBe(true);
  });

  it('weakest box first', () => {
    const stats: Record<FactKey, FactStat> = {
      'sk:div-rem-floor': stat(5),
      'sk:div-rem-ceil': stat(1),
      'sk:choose-all-correct': stat(5),
      'sk:tf-explain': stat(5),
    };
    const run = planLessonRun(25, stats, mulberry32(2));
    expect(run[0]).toBe('sk:div-rem-ceil');
  });

  it('tables run gives distinct facts, never the same question twice', () => {
    // B5 also carries sk:pattern-skip-count (tagged 4-12); it may appear once, but a
    // fact key never repeats.
    const run = planLessonRun(5, {}, mulberry32(3));
    expect(run).toHaveLength(6);
    const facts = run.filter((k) => k.startsWith('mul:') || k.startsWith('div:'));
    expect(new Set(facts).size).toBe(facts.length);
    const b5Keys = ['sk:pattern-skip-count', ...mulFactsForTables([3]), ...divFactsForTables([3])];
    for (const key of run) expect(b5Keys).toContain(key);
  });

  it('B44 mix spreads over its source lessons', () => {
    // Attribution via the public lesson table (the oracle — 6 distinct sources — is
    // hand-decided from the round-robin design, not computed by the planner).
    const mixOf = [8, 15, 22, 29, 35, 40, 41, 42, 43];
    const sourceOf = (key: FactKey): number => {
      const src = mixOf.find((m) => skillsOfLesson(m).includes(key));
      if (src === undefined) throw new Error(`no source for ${key}`);
      return src;
    };
    const run = planLessonRun(44, {}, mulberry32(7));
    expect(run).toHaveLength(6);
    expect(new Set(run.map(sourceOf)).size).toBe(6);
    expect(run.some((k) => k.startsWith('sk:'))).toBe(true);
  });

  it('a lesson with no plannable skills returns [] (UI shows "Sắp có")', () => {
    for (const n of [7]) expect(planLessonRun(n, {}, mulberry32(4))).toEqual([]);
    // B7 yields nothing again: pattern-skip-count is tables-only since the phase-12
    // legacy fix (it is not practicable, so the picker still shows "Sắp có" for it).
    // B14 plans its six fraction skills now that phase 12 landed them.
    const b14 = planLessonRun(14, {}, mulberry32(4));
    expect(b14).toHaveLength(6);
    expect(new Set(b14).size).toBe(6);
    expect(b14.every((k) => k.startsWith('sk:fraction-'))).toBe(true);
    // B66 plans its nine time skills now that phase 13 landed them.
    const b66 = planLessonRun(66, {}, mulberry32(4));
    expect(b66).toHaveLength(6);
    expect(new Set(b66).size).toBe(6);
    expect(
      b66.every((k) => /^(sk:clock-|sk:times-|sk:roman-|sk:months-|sk:calendar-)/.test(k)),
    ).toBe(true);
    // B47 has one time skill (roman-clock-hour) plus three number skills now that
    // phase 08 landed Roman numerals: six items, the four unique, two repeats.
    const b47 = planLessonRun(47, {}, mulberry32(4));
    expect(b47).toHaveLength(6);
    expect(new Set(b47).size).toBe(4);
    expect(b47.every((k) => /^(sk:roman-|sk:number-to-roman)/.test(k))).toBe(true);
    // B48 plans its two rounding skills now that phase 08 landed them: six items,
    // three rounds of the two.
    const b48 = planLessonRun(48, {}, mulberry32(4));
    expect(b48).toHaveLength(6);
    expect(new Set(b48).size).toBe(2);
    expect(b48.every((k) => k.startsWith('sk:round-'))).toBe(true);
    // B61 plans its three rounding skills now that phase 08 landed them: six items,
    // two rounds of the three.
    const b61 = planLessonRun(61, {}, mulberry32(4));
    expect(b61).toHaveLength(6);
    expect(new Set(b61).size).toBe(3);
    expect(b61.every((k) => k.startsWith('sk:round-'))).toBe(true);
    // B68 plans its six money skills now that phase 14 landed them.
    const b68 = planLessonRun(68, {}, mulberry32(4));
    expect(b68).toHaveLength(6);
    expect(new Set(b68).size).toBe(6);
    expect(b68.every((k) => k.startsWith('sk:money-'))).toBe(true);
    // B69 mixes B66, B67 and B68: six items, all time or money keys.
    const b69 = planLessonRun(69, {}, mulberry32(4));
    expect(b69).toHaveLength(6);
    expect(new Set(b69).size).toBe(6);
    expect(
      b69.every((k) =>
        /^(sk:clock-|sk:times-|sk:roman-|sk:months-|sk:calendar-|sk:money-)/.test(k),
      ),
    ).toBe(true);
    // B73 plans its five data table skills now that phase 15 landed them: six items,
    // the first five unique, the sixth a repeat of one skill.
    const b73 = planLessonRun(73, {}, mulberry32(4));
    expect(b73).toHaveLength(6);
    expect(new Set(b73).size).toBe(5);
    expect(b73.every((k) => /^(sk:tally-|sk:table-)/.test(k))).toBe(true);
    // B74 has two chance skills: six items, three rounds of the two.
    const b74 = planLessonRun(74, {}, mulberry32(4));
    expect(b74).toHaveLength(6);
    expect(new Set(b74).size).toBe(2);
    expect(b74.every((k) => k.startsWith('sk:chance-'))).toBe(true);
    // B75 and B80 mix B73 and B74: six items, all data keys.
    for (const n of [75, 80]) {
      const run = planLessonRun(n, {}, mulberry32(4));
      expect(run).toHaveLength(6);
      expect(run.every((k) => /^(sk:tally-|sk:table-|sk:chance-)/.test(k))).toBe(true);
    }
    // B2 plans its six arithmetic skills now that phase 09 landed them.
    const b2 = planLessonRun(2, {}, mulberry32(4));
    expect(b2).toHaveLength(6);
    expect(new Set(b2).size).toBe(6);
    expect(b2.every((k) => /^(sk:add-|sk:sub-)/.test(k))).toBe(true);
    // B54/B55/B63/B64 plan their four arithmetic skills each: six items, four distinct.
    const B54_SKILLS = [
      'sk:add-4digit',
      'sk:add-sub-10000-wp',
      'sk:add-sub-find-error',
      'sk:add-missing-digit',
    ] as const;
    const B55_SKILLS = [
      'sk:sub-4digit',
      'sk:add-sub-10000-wp',
      'sk:add-sub-find-error',
      'sk:add-missing-digit',
    ] as const;
    const B63_SKILLS = [
      'sk:add-5digit',
      'sk:add-sub-100000-wp',
      'sk:add-sub-find-error',
      'sk:add-missing-digit',
    ] as const;
    const B64_SKILLS = [
      'sk:sub-5digit',
      'sk:add-sub-100000-wp',
      'sk:add-sub-find-error',
      'sk:add-missing-digit',
    ] as const;
    for (const [n, skills] of [
      [54, B54_SKILLS],
      [55, B55_SKILLS],
      [63, B63_SKILLS],
      [64, B64_SKILLS],
    ] as const) {
      const run = planLessonRun(n, {}, mulberry32(4));
      expect(run).toHaveLength(6);
      expect(new Set(run).size).toBe(4);
      for (const key of run) expect(skills).toContain(key);
    }
    // B58/B65/B77 mix the 4-digit and 5-digit lessons: six items; B58 has six
    // distinct skills now that phase 11 landed B56/B57, B65 has five, B77 six
    // (eight skills in its pool). B58's run now mixes mul/div skills in with the
    // add/sub ones; B65/B77 stay add/sub only.
    for (const [n, distinct, pattern] of [
      [58, 6, /^(sk:add-|sk:sub-|sk:mul-|sk:div-)/],
      [65, 5, /^(sk:add-|sk:sub-)/],
      [77, 6, /^(sk:add-|sk:sub-)/],
    ] as const) {
      const run = planLessonRun(n, {}, mulberry32(4));
      expect(run).toHaveLength(6);
      expect(new Set(run).size).toBe(distinct);
      expect(run.every((k) => pattern.test(k))).toBe(true);
    }
    // B23/B26/B36/B37 plan their mul/div arithmetic skills now that phase 10 landed them.
    const B23_SKILLS = ['sk:mul-2d-1d', 'sk:mul-tens-mental', 'sk:mul-2d-1d-wp'] as const;
    const B26_SKILLS = [
      'sk:div-2d-1d',
      'sk:div-2d-1d-remainder',
      'sk:div-tens-mental',
      'sk:div-2d-1d-wp',
      'sk:mul-div-find-error',
    ] as const;
    const B36_SKILLS = ['sk:mul-3d-1d', 'sk:mul-hundreds-mental', 'sk:mul-3d-1d-wp'] as const;
    const B37_SKILLS = [
      'sk:div-3d-1d',
      'sk:div-3d-1d-remainder',
      'sk:div-hundreds-mental',
      'sk:div-reduce-times',
      'sk:mul-div-find-error',
    ] as const;
    for (const [n, skills, distinct] of [
      [23, B23_SKILLS, 3],
      [26, B26_SKILLS, 5],
      [36, B36_SKILLS, 3],
      [37, B37_SKILLS, 5],
    ] as const) {
      const run = planLessonRun(n, {}, mulberry32(4));
      expect(run).toHaveLength(6);
      expect(new Set(run).size).toBe(distinct);
      for (const key of run) expect(skills).toContain(key);
    }
  });

  it('renderable filter excludes skills; none renderable means []', () => {
    const onlyCeil = planLessonRun(25, {}, mulberry32(5), {
      renderable: (k) => k === 'sk:div-rem-ceil',
    });
    expect(onlyCeil).toHaveLength(3); // one skill, at most 3 items
    expect(onlyCeil.every((k) => k === 'sk:div-rem-ceil')).toBe(true);
    expect(planLessonRun(25, {}, mulberry32(5), { renderable: () => false })).toEqual([]);
  });

  it('one skill contributes at most 3 items; items opt is honoured', () => {
    expect(planLessonRun(25, {}, mulberry32(6), { items: 2 })).toHaveLength(2);
    const one = planLessonRun(3, {}, mulberry32(6)); // B3: unknown-add-sub only
    expect(one).toHaveLength(3);
    expect(one.every((k) => k === 'sk:unknown-add-sub')).toBe(true);
  });

  it('is deterministic per (seed, stats)', () => {
    const a = planLessonRun(25, {}, mulberry32(11));
    const b = planLessonRun(25, {}, mulberry32(11));
    expect(a).toEqual(b);
  });

  it('throws for an unknown lesson', () => {
    expect(() => planLessonRun(99, {}, mulberry32(1))).toThrow();
  });
});
