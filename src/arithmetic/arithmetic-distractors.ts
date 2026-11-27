// Arithmetic item helpers (phase 09): build items, and wrong results built from the
// misconceptions a child actually makes (forgot the carry, no borrowing, a small slip).
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem, PracticeScene } from '../practice/practice-scene';
import type { Candidate } from '../reasoning/reasoning-distractors';
import { numberStep, optionsFrom, reasoningItem, ref } from '../reasoning/reasoning-distractors';
import type { ChoiceOption, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { digitsOf, fromDigits } from './arithmetic-ranges';

export { numberStep, ref };

/** An arithmetic item: a plain calculation or word problem, never a scene — except
 *  add-sub-number-line (Phase 1A), which carries its number-line scene. */
export const arithmeticItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  work: readonly number[] = [],
  scene?: PracticeScene,
): PracticeItem => {
  const item = reasoningItem(skillId, tier, story, steps, work);
  return scene ? { ...item, scene } : item;
};

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

const NEAR_CAPPED = [1, -1, 2, -2, 10, -10, 3, -3];

const cappedNumberLabel = (n: number): PromptRef => ({ key: 'num', params: { n } });

/**
 * Like reasoning's numberOptions, but capped at the skill's range (1 000),
 * not at 100: the arithmetic family practises to the lesson range, and a bug
 * value above 100 (say 324) is a real option here. Candidates are the
 * bug-tagged values first; near-miss fillers top the list up to `count`.
 */
export function numberOptionsCapped(
  rng: Rng,
  answer: number,
  candidates: readonly Candidate<number>[],
  cap: number,
  count = 4,
): ChoiceOption[] {
  const within = (n: number) => n >= 0 && n <= cap;
  const valid = candidates.filter((c) => within(c.value) && c.value !== answer);
  const near: Candidate<number>[] = NEAR_CAPPED.map((d) => ({
    value: answer + d,
    misconception: 'near-miss' as const,
  })).filter((c) => within(c.value));
  return optionsFrom(rng, answer, [...valid, ...near], cappedNumberLabel, count);
}

/** A choice step over numbers capped at the skill's range. */
export function numberChoiceStepCapped(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  candidates: readonly Candidate<number>[],
  cap: number,
  count = 4,
): ReasoningStep {
  return {
    kind: 'choice',
    prompt,
    options: numberOptionsCapped(rng, answer, candidates, cap, count),
  };
}
