// Arithmetic item helpers (phase 09): build items, and wrong results built from the
// misconceptions a child actually makes (forgot the carry, no borrowing, a small slip).
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { numberStep, reasoningItem, ref } from '../reasoning/reasoning-distractors';
import type { PromptRef, ReasoningItem, ReasoningStep } from '../reasoning/reasoning-types';
import { digitsOf, fromDigits } from './arithmetic-ranges';

export { numberStep, ref };

/** An arithmetic item: a plain calculation or word problem, never a scene. */
export const arithmeticItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  work: readonly number[] = [],
): ReasoningItem => reasoningItem(skillId, tier, story, steps, work);

/** Wrong sum from "forgot the carry": each digit column added mod 10, no carry propagates. */
export function wrongAddByForgotCarry(a: number, b: number): number {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const len = Math.max(da.length, db.length);
  const out: number[] = [];
  for (let i = 0; i < len; i++)
    out.unshift(((da[da.length - 1 - i] ?? 0) + (db[db.length - 1 - i] ?? 0)) % 10);
  return fromDigits(out);
}

/** Wrong difference from "no borrowing": each digit column subtracted absolutely. */
export function wrongSubByNoBorrow(a: number, b: number): number {
  const da = digitsOf(a);
  const db = digitsOf(b);
  const len = Math.max(da.length, db.length);
  const out: number[] = [];
  for (let i = 0; i < len; i++)
    out.unshift(Math.abs((da[da.length - 1 - i] ?? 0) - (db[db.length - 1 - i] ?? 0)));
  return fromDigits(out);
}

/** A small slip on the right answer (±10 or ±1), for tiers with no carry to forget. */
export function wrongBySlip(correct: number, rng: Rng): number {
  const deltas = [10, -10, 1, -1].filter((d) => correct + d >= 0 && correct + d !== correct);
  const d = deltas[Math.floor(rng() * deltas.length)] as number;
  return correct + d;
}

/** Wrong product from "forgot the carry": each digit × b, mod 10, no carry propagates. */
export function wrongMulByForgotCarry(a: number, b: number): number {
  const out: number[] = [];
  for (const d of digitsOf(a)) out.push((d * b) % 10);
  return fromDigits(out);
}
