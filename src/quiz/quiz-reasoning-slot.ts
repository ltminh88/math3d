// When the bridge/practice quiz asks a reasoning word problem instead of a multiplication fact
// (pure): every 5th question once the chosen table's facts average Leitner box 3, so a fresh
// profile (and the seeded parity playthrough) always keeps the original multiplication quiz.
import { type FactKey, skillKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';

export const WORD_PROBLEM_EVERY = 5;
export const WORD_PROBLEM_MIN_AVERAGE_BOX = 3;

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

/** Mean Leitner box over `pool`; a fact never answered counts as box 1. */
export function averageBox(stats: Stats, pool: readonly FactKey[]): number {
  if (pool.length === 0) return 1;
  return pool.reduce((sum, key) => sum + (stats[key]?.box ?? 1), 0) / pool.length;
}

/** `questionNo` is 1-based over the planner's life (the quiz session). */
export function wordProblemDue(
  questionNo: number,
  stats: Stats,
  pool: readonly FactKey[],
): boolean {
  return (
    questionNo % WORD_PROBLEM_EVERY === 0 && averageBox(stats, pool) >= WORD_PROBLEM_MIN_AVERAGE_BOX
  );
}

/** The skill seen least so far (skills take turns); list order breaks ties. */
export function chooseWordProblemSkill<T extends string>(stats: Stats, skills: readonly T[]): T {
  const attempts = (id: T) => stats[skillKey(id)]?.attempts ?? 0;
  return skills.reduce((best, id) => (attempts(id) < attempts(best) ? id : best));
}
