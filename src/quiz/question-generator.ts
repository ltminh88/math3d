// Question building and next-fact picking (recovered verbatim, including RNG call order).
import { TABLES } from '../config/world-constants';
import type { SaveV1 } from '../save/save-types';
import type { Question, QuizMode, Rng } from './question-types';

/** Probability of drawing from the review queue when it has eligible facts. */
const REVIEW_CHANCE = 0.7;

/** Fisher-Yates shuffle of a copy (one rng call per position, from the end). */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const held = result[i] as T;
    result[i] = result[j] as T;
    result[j] = held;
  }
  return result;
}

/** Question `a × b` with the answer and two neighbouring products, shuffled. */
export function buildQuestion(
  a: number,
  b: number,
  mode: QuizMode,
  rng: Rng = Math.random,
): Question {
  const answer = a * b;
  const distractorFactors = [b > 1 ? b - 1 : b + 2, b < 10 ? b + 1 : b - 2];
  const options = [b, ...distractorFactors].map((factor) => ({
    value: a * factor,
    label: mode === 'bridge' ? `${a} × ${factor}` : `${a * factor}`,
  }));
  return {
    id: `m${a}_${b}`,
    a,
    b,
    answer,
    options: shuffle(options, rng),
    review: false,
  };
}

const tableOfId = (id: string): number => Number((id.split('_')[0] ?? '').slice(1));

/**
 * Next question for the save's table filter, never repeating `lastId`. With eligible review ids,
 * 70% of the time one is re-asked; otherwise a uniform fact from the allowed tables.
 */
export function pickNextFact(
  save: Pick<SaveV1, 'table' | 'review'>,
  mode: QuizMode,
  lastId = '',
  rng: Rng = Math.random,
): Question {
  const tables = save.table ? [save.table] : [...TABLES];
  const reviewIds = save.review.filter((id) => id !== lastId && tables.includes(tableOfId(id)));
  if (reviewIds.length && rng() < REVIEW_CHANCE) {
    const id = reviewIds[Math.floor(rng() * reviewIds.length)] as string;
    const [a, b] = id.slice(1).split('_').map(Number) as [number, number];
    return {
      ...buildQuestion(a, b, mode, rng),
      review: true,
    };
  }
  const candidates = tables
    .flatMap((a) => Array.from({ length: 10 }, (_, i) => ({ a, b: i + 1 })))
    .filter(({ a, b }) => `m${a}_${b}` !== lastId);
  const fact = candidates[Math.floor(rng() * candidates.length)] as { a: number; b: number };
  return buildQuestion(fact.a, fact.b, mode, rng);
}
