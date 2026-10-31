// Step and option building for reasoning items: the correct answer plus distractors that each stand for a
// named misconception. Candidates outside the number cap, duplicates and the answer itself are
// dropped; missing slots are filled with near misses (answer ± 1, ± 2, ± 10).
import { pick, type Rng, shuffle } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { withinCap } from './reasoning-ranges';
import type {
  ChoiceOption,
  Misconception,
  PromptRef,
  ReasoningItem,
  ReasoningStep,
} from './reasoning-types';

export interface Candidate<T> {
  readonly value: T;
  readonly misconception: Misconception;
}

const NEAR = [1, -1, 2, -2, 10, -10, 3, -3];

const numberLabel = (n: number): PromptRef => ({ key: 'num', params: { n } });

/** Correct first, then misconception distractors in order, capped at `count`, shuffled. */
export function optionsFrom<T>(
  rng: Rng,
  correct: T,
  candidates: readonly Candidate<T>[],
  toLabel: (value: T) => PromptRef,
  count = 4,
): ChoiceOption[] {
  const seen = new Set([JSON.stringify(toLabel(correct))]);
  const options: ChoiceOption[] = [{ id: 'o0', label: toLabel(correct), correct: true }];
  for (const c of candidates) {
    if (options.length >= count) break;
    const label = toLabel(c.value);
    const key = JSON.stringify(label);
    if (seen.has(key)) continue;
    seen.add(key);
    options.push({
      id: `o${options.length}`,
      label,
      correct: false,
      misconception: c.misconception,
    });
  }
  return shuffle(rng, options);
}

/** Numeric options (3-4): misconception values first, then near misses, all within the cap. */
export function numberOptions(
  rng: Rng,
  answer: number,
  candidates: readonly Candidate<number>[],
  count = 4,
): ChoiceOption[] {
  const valid = candidates.filter((c) => withinCap(c.value) && c.value !== answer);
  const near: Candidate<number>[] = NEAR.map((d) => ({
    value: answer + d,
    misconception: 'near-miss' as const,
  })).filter((c) => withinCap(c.value));
  return optionsFrom(rng, answer, [...valid, ...near], numberLabel, count);
}

export const numberStep = (prompt: PromptRef, answer: number): ReasoningStep => ({
  kind: 'number',
  prompt,
  answer,
});

export function numberChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  candidates: readonly Candidate<number>[],
): ReasoningStep {
  return { kind: 'choice', prompt, options: numberOptions(rng, answer, candidates) };
}

/** Expression options shown as text (`6 × 4 + 6`); the strings are language-neutral symbols. */
export function expressionChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  correct: string,
  candidates: readonly Candidate<string>[],
): ReasoningStep {
  const label = (text: string): PromptRef => ({ key: 'expr', params: { text } });
  return { kind: 'choice', prompt, options: optionsFrom(rng, correct, candidates, label) };
}

export const ref = (key: string, params?: PromptRef['params']): PromptRef =>
  params ? { key, params } : { key };

export const reasoningItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  work: readonly number[] = [],
): ReasoningItem => ({ skillId, tier, story, steps, work });

const NOUNS = ['i:marble', 'i:candy', 'i:flower', 'i:book', 'i:apple', 'i:fish'] as const;
const NAMES = [
  ['Mai', 'Nam'],
  ['An', 'Bình'],
  ['Lan', 'Hùng'],
] as const;

export const pickNoun = (rng: Rng): string => pick(rng, NOUNS);
export const pickNames = (rng: Rng): readonly [string, string] => pick(rng, NAMES);
