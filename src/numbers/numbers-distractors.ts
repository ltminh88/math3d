// Builders shared by the numbers generators: items with an optional scene, number / word /
// expanded-sum options and the sign choice. Distractors carry the phase-07 misconception
// tags (swapped digits, dropped zero, off-by-ten, wrong place, wrong sign); every option
// stays inside the skill's range (1 000 / 10 000 / 100 000), never the legacy ≤100 cap.
import type { Rng } from '../learning/seeded-rng';
import { shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';
import {
  type Candidate,
  expressionChoiceStep,
  optionsFrom,
  reasoningItem,
  ref,
} from '../reasoning/reasoning-distractors';
import type { ChoiceOption, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { numberToVietnameseWords } from './number-words-vi';
import { digitAt, digitsOf, fromDigits, PLACES_OF_RANGE } from './numbers-ranges';
import type { NumberScene, PlaceName } from './numbers-scene-types';

const NEAR = [1, -1, 2, -2, 10, -10, 3, -3];

/** A numbers item: a ReasoningItem, optionally carrying a plain-data scene. */
export const numberItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  scene?: NumberScene,
  work: readonly number[] = [],
): PracticeItem => {
  const item = reasoningItem(skillId, tier, story, steps, work);
  return scene ? { ...item, scene } : item;
};

/** Swap the first adjacent pair of digits that differ (345 → 354); undefined if none. */
export function swappedDigits(n: number): number | undefined {
  const ds = digitsOf(n);
  for (let i = 0; i + 1 < ds.length; i++) {
    if (ds[i] !== ds[i + 1]) {
      const swapped = [...ds];
      [swapped[i], swapped[i + 1]] = [swapped[i + 1] as number, swapped[i] as number];
      return fromDigits(swapped);
    }
  }
  return undefined;
}

/** Drop the first zero digit (4035 → 435); undefined when the number has no zero. */
export function droppedZero(n: number): number | undefined {
  const ds = digitsOf(n);
  const zero = ds.indexOf(0);
  if (zero === -1) return undefined;
  const kept = ds.filter((_, i) => i !== zero);
  return kept.length === 0 ? undefined : fromDigits(kept);
}

/** ±10, kept inside (0, range]. */
export function offByTen(n: number, range: number): number[] {
  return [n + 10, n - 10].filter((v) => v > 0 && v <= range);
}

/**
 * Copy a digit into the neighbouring place (345 → 335: the hundreds digit lands in the
 * tens); undefined when every neighbour holds the same digit.
 */
export function wrongPlaceCopy(n: number): number | undefined {
  const ds = digitsOf(n);
  for (let i = 0; i < ds.length; i++) {
    const neighbour = ds[i + 1] ?? ds[i - 1];
    if (neighbour !== undefined && neighbour !== ds[i]) {
      const copied = [...ds];
      copied[i] = neighbour;
      return fromDigits(copied);
    }
  }
  return undefined;
}

/** The four tagged distractor numbers for `n` (each present only when it applies). */
export function taggedDistractors(n: number, range: number): Candidate<number>[] {
  const out: Candidate<number>[] = [];
  const swap = swappedDigits(n);
  if (swap !== undefined) out.push({ value: swap, misconception: 'swapped-digits' });
  const dropped = droppedZero(n);
  if (dropped !== undefined) out.push({ value: dropped, misconception: 'dropped-zero' });
  for (const v of offByTen(n, range)) out.push({ value: v, misconception: 'off-by-ten' });
  const wrong = wrongPlaceCopy(n);
  if (wrong !== undefined) out.push({ value: wrong, misconception: 'wrong-place' });
  return out;
}

/** A choice among exactly the given numbers (max/min): no near misses from outside. */
export function numberChoiceStepFromList(
  rng: Rng,
  prompt: PromptRef,
  numbers: readonly number[],
  want: number,
): ReasoningStep {
  const options: ChoiceOption[] = numbers.map((v, i) => ({
    id: `o${i}`,
    label: ref('num', { n: v }),
    correct: v === want,
    ...(v === want ? {} : { misconception: 'near-miss' as const }),
  }));
  return { kind: 'choice', prompt, options: shuffle(rng, options) };
}

/** A choice of 3–4 readings: the answer's words, the distractors' words, then near misses. */
export function wordsChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  candidates: readonly Candidate<number>[],
  range: number,
): ReasoningStep {
  const valid = candidates.filter((c) => c.value > 0 && c.value <= range && c.value !== answer);
  const near: Candidate<number>[] = NEAR.map((d) => ({
    value: answer + d,
    misconception: 'near-miss' as const,
  })).filter((c) => c.value > 0 && c.value <= range);
  const label = (v: number): PromptRef => ref('wordsText', { w: numberToVietnameseWords(v) });
  return { kind: 'choice', prompt, options: optionsFrom(rng, answer, [...valid, ...near], label) };
}

/** The '>' / '<' / '=' choice for comparing `a` and `b` (wrong signs are 'wrong-sign'). */
export function signChoiceStep(rng: Rng, prompt: PromptRef, a: number, b: number): ReasoningStep {
  const signs: readonly { key: string; correct: boolean }[] = [
    { key: 'signGt', correct: a > b },
    { key: 'signLt', correct: a < b },
    { key: 'signEq', correct: a === b },
  ];
  const options: ChoiceOption[] = signs.map((s, i) => ({
    id: `o${i}`,
    label: ref(s.key),
    correct: s.correct,
    ...(s.correct ? {} : { misconception: 'wrong-sign' }),
  }));
  return { kind: 'choice', prompt, options: shuffle(rng, options) };
}

/** The expanded sum of `n`: "4000 + 30 + 5" (zero terms are left out). */
export function expandedSumText(n: number): string {
  const ds = digitsOf(n);
  const terms: number[] = [];
  for (let i = 0; i < ds.length; i++) {
    const d = ds[i] as number;
    if (d !== 0) terms.push(d * 10 ** (ds.length - 1 - i));
  }
  return terms.length === 0 ? '0' : terms.join(' + ');
}

/**
 * The expansion with one term moved to the wrong place (4035 → "4000 + 300 + 5": the tens
 * written as hundreds); undefined when no term can move without leaving the range — the
 * wrong term AND the wrong sum both stay inside the range.
 */
export function wrongPlaceExpansion(n: number, range: number): string | undefined {
  const ds = digitsOf(n);
  for (let i = 1; i < ds.length; i++) {
    const d = ds[i] as number;
    if (d === 0) continue;
    const term = d * 10 ** (ds.length - 1 - i);
    const wrong = term * 10;
    if (wrong > range || n - term + wrong > range) continue;
    const terms: number[] = [];
    for (let j = 0; j < ds.length; j++) {
      const dj = ds[j] as number;
      if (dj === 0) continue;
      terms.push(j === i ? wrong : dj * 10 ** (ds.length - 1 - j));
    }
    return terms.join(' + ');
  }
  return undefined;
}

/** A choice of expanded sums: the right one, tagged wrong expansions, then near misses. */
export function expandedChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  range: number,
): ReasoningStep {
  const candidates: Candidate<string>[] = [];
  const wrong = wrongPlaceExpansion(answer, range);
  if (wrong !== undefined) candidates.push({ value: wrong, misconception: 'wrong-place' });
  for (const c of taggedDistractors(answer, range))
    candidates.push({ value: expandedSumText(c.value), misconception: c.misconception });
  for (const d of NEAR) {
    const v = answer + d;
    if (v > 0 && v <= range)
      candidates.push({ value: expandedSumText(v), misconception: 'near-miss' });
  }
  return expressionChoiceStep(rng, prompt, expandedSumText(answer), candidates);
}

/** The place-value scene for `n`: one column per place of the range, blocks = the digit. */
export function placeValueScene(n: number, range: number): NumberScene {
  const places = PLACES_OF_RANGE[range] ?? PLACES_OF_RANGE[1000] ?? [];
  return {
    kind: 'place-value',
    columns: places.map((place: PlaceName) => ({ place, blocks: digitAt(n, place) })),
  };
}

/** The number-line scene for a sequence: the marks, with '?' at the missing indices. */
export function numberLineScene(
  marks: readonly number[],
  missing: readonly number[],
  step: 1 | -1,
): NumberScene {
  return { kind: 'number-line', start: marks[0] ?? 0, step, marks, missing };
}
