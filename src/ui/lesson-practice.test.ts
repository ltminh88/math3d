// Lesson seed (phase 06 review fix): the seed mixes in the total attempts on the
// lesson's skills, so a replay after a round plans different items instead of the
// same 6 questions with the same numbers.
import { describe, expect, it } from 'vitest';
import type { FactKey } from '../learning/fact-key';
import { skillsOfLesson } from '../learning/kntt-lesson-index';
import type { FactStat } from '../learning/learning-types';
import { planLessonRun } from '../learning/lesson-planner';
import { mulberry32 } from '../learning/seeded-rng';
import { lessonSeed } from './lesson-practice';

const stat = (attempts: number): FactStat => ({
  attempts,
  correct: attempts,
  totalMs: 1000 * attempts,
  box: 1,
  lastSeenSession: 1,
  lastSeenAt: 1000,
  streak: 0,
  fluent: false,
  errs: [],
});

/** Total attempts on the lesson's skills — the same sum startLessonRun feeds the seed. */
const totalAttempts = (lessonN: number, stats: Readonly<Record<FactKey, FactStat>>): number =>
  skillsOfLesson(lessonN).reduce((sum, k) => sum + (stats[k]?.attempts ?? 0), 0);

describe('lessonSeed', () => {
  it('is deterministic for the same inputs', () => {
    expect(lessonSeed(25, 'p1', 4)).toBe(lessonSeed(25, 'p1', 4));
  });

  it('changes when the attempts total grows', () => {
    expect(lessonSeed(25, 'p1', 0)).not.toBe(lessonSeed(25, 'p1', 4));
  });

  it('two consecutive runs (attempts grow, boxes unchanged) plan at least one different item', () => {
    const lessonN = 25;
    const keys = skillsOfLesson(lessonN);
    const first: Record<FactKey, FactStat> = {};
    for (const k of keys) first[k] = stat(0);
    const run1 = planLessonRun(
      lessonN,
      first,
      mulberry32(lessonSeed(lessonN, 'p1', totalAttempts(lessonN, first))),
    );
    // Second run: every key attempted once more; boxes unchanged, so only the seed moves.
    const second: Record<FactKey, FactStat> = {};
    for (const k of keys) second[k] = stat(1);
    const run2 = planLessonRun(
      lessonN,
      second,
      mulberry32(lessonSeed(lessonN, 'p1', totalAttempts(lessonN, second))),
    );
    expect(run1).toHaveLength(6);
    expect(run2).toHaveLength(6);
    expect(run2.some((key, i) => key !== run1[i])).toBe(true);
  });
});
