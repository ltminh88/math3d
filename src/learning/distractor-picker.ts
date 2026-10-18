import {
  classCandidates,
  DISTRACTOR_CLASSES,
  type DistractorClass,
  type DistractorContext,
  inRange,
} from './distractor-classes';
import { pick, type Rng, shuffle } from './seeded-rng';

const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));

type Pred = (n: number) => boolean;

/**
 * Pick `count` (default 3) unique distractors in 1..100, never the answer, drawn from different
 * classes (personal errors first), then enforce: one shares a factor with the question, and the
 * answer is neither the largest nor the smallest option whenever that is achievable.
 */
export function pickDistractors(ctx: DistractorContext, rng: Rng, count = 3): number[] {
  const classes = Object.keys(DISTRACTOR_CLASSES) as DistractorClass[];
  const order = [
    'personal' as const,
    ...shuffle(
      rng,
      classes.filter((c) => c !== 'personal'),
    ),
  ];
  const perClass = order.map((c) => classCandidates(c, ctx));
  const everything = [...new Set(perClass.flat())];
  const anyNumber = Array.from({ length: 100 }, (_, i) => i + 1).filter((n) => n !== ctx.answer);

  const picked: number[] = [];
  const take = (pool: readonly number[]): boolean => {
    const free = pool.filter((n) => !picked.includes(n));
    if (free.length === 0) return false;
    picked.push(pick(rng, free));
    return true;
  };
  for (let round = 0; round < 2 && picked.length < count; round++) {
    for (const pool of perClass) {
      if (picked.length >= count) break;
      take(pool);
    }
  }
  while (picked.length < count) if (!take(anyNumber)) break;

  const factors = [ctx.a, ctx.b, ...(ctx.dividend !== undefined ? [ctx.dividend] : [])];
  const constraints: Pred[] = [
    (n) => factors.some((f) => f > 1 && gcd(n, f) > 1),
    (n) => n > ctx.answer,
    (n) => n < ctx.answer,
  ];
  for (let i = 0; i < constraints.length; i++) {
    const wanted = constraints[i] as Pred;
    if (picked.some(wanted)) continue;
    const candidates = [...everything, ...anyNumber].filter(
      (n) => wanted(n) && !picked.includes(n) && inRange(n),
    );
    const next = candidates.length > 0 ? pick(rng, candidates) : undefined;
    if (next === undefined) continue;
    // Replace a slot whose removal keeps every earlier constraint satisfied.
    for (let idx = 0; idx < picked.length; idx++) {
      const trial = picked.slice();
      trial[idx] = next;
      if (constraints.slice(0, i).every((p) => trial.some(p))) {
        picked[idx] = next;
        break;
      }
    }
  }
  return picked;
}

/** Shuffle answer among the distractors; position is uniform. */
export function placeAnswer(
  answer: number,
  distractors: readonly number[],
  rng: Rng,
): { choices: number[]; answerIndex: number } {
  const choices = shuffle(rng, [answer, ...distractors]);
  return { choices, answerIndex: choices.indexOf(answer) };
}
