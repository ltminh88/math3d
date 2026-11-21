// Builders shared by the money generators: items with or without a notes scene, amount
// options, and the letter multi-pick. Distractors each stand for a named misconception.
// Amount options never use the legacy ≤100 cap (reasoning-ranges): near misses are
// money-scaled (±1 000 … ±10 000) and stay inside the skill's own max.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  type Candidate,
  optionsFrom,
  reasoningItem,
  ref,
} from '../reasoning/reasoning-distractors';
import type { ChoiceOption, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import { MIN_UNIT_PX, TOTAL_MAX } from './money-ranges';
import type { MoneyItem, MoneyNote, MoneyScene } from './money-scene-types';
import { formatMoney } from './money-strings';

/** An amount as an option label: "10 000 đồng" (SGK grouping via formatMoney). */
export const moneyLabel = (n: number): PromptRef => ref('vnd', { s: formatMoney(n) });

/** A letter option label: "A" (pick-notes cards are lettered like fraction figures). */
export const letterLabel = (l: string): PromptRef => ref('letter', { l });

export const LETTERS: readonly string[] = Object.freeze(['A', 'B', 'C', 'D', 'E']);

/** A notes scene: the cards on the table, lettered when the child must pick them. */
export const notesScene = (notes: readonly MoneyNote[]): MoneyScene => ({
  kind: 'notes',
  notes,
  minUnitPx: MIN_UNIT_PX,
});

/** A scene-free item (money-change-back, money-wp): it renders in the shared dialog today. */
export const moneyItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  work: readonly number[] = [],
): MoneyItem => reasoningItem(skillId, tier, story, steps, work);

/** An item with a picture: the scene is exactly what the phase-17 renderer draws. */
export const moneySceneItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  sceneData: MoneyScene,
  work: readonly number[] = [],
): MoneyItem => ({ ...reasoningItem(skillId, tier, story, steps, work), scene: sceneData });

const NEAR_MONEY: readonly number[] = [1000, -1000, 2000, -2000, 5000, -5000, 10000, -10000];

/** Amount options (3-4): misconception values first, then money-scaled near misses. */
export function moneyOptions(
  rng: Rng,
  answer: number,
  candidates: readonly Candidate<number>[],
  max: number = TOTAL_MAX,
): ChoiceOption[] {
  const valid = candidates.filter((c) => c.value > 0 && c.value <= max && c.value !== answer);
  const near: Candidate<number>[] = NEAR_MONEY.map((d) => ({
    value: answer + d,
    misconception: 'near-miss' as const,
  })).filter((c) => c.value > 0 && c.value <= max);
  return optionsFrom(rng, answer, [...valid, ...near], moneyLabel, 4);
}

/** A choice among amounts: the answer, then misconception amounts. */
export function moneyChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  candidates: readonly Candidate<number>[],
  max: number = TOTAL_MAX,
): ReasoningStep {
  return { kind: 'choice', prompt, options: moneyOptions(rng, answer, candidates, max) };
}

/**
 * A choice among real denominations only (recognize, review #40): no money-scaled near
 * misses — a ±1 000 miss on a 500 000 note would invent "499 000 đồng", which is not a
 * real note. Every option must be a denomination.
 */
export function denominationChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  candidates: readonly Candidate<number>[],
): ReasoningStep {
  return { kind: 'choice', prompt, options: optionsFrom(rng, answer, candidates, moneyLabel, 4) };
}

/** Count options (exchange): named traps first, then near counts, all positive. */
export function countChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  candidates: readonly Candidate<number>[],
): ReasoningStep {
  const near: Candidate<number>[] = [1, -1, 2, -2]
    .map((d) => ({ value: answer + d, misconception: 'near-miss' as const }))
    .filter((c) => c.value > 0);
  const label = (n: number): PromptRef => ref('num', { n });
  return {
    kind: 'choice',
    prompt,
    options: optionsFrom(rng, answer, [...candidates, ...near], label),
  };
}

/** A choice among prompt labels: the correct one first, then misconception distractors. */
export function labelChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  correct: PromptRef,
  candidates: readonly Candidate<PromptRef>[],
): ReasoningStep {
  const options = optionsFrom(rng, correct, candidates, (label) => label);
  return { kind: 'choice', prompt, options };
}

/** Letter options for a multi-pick: each card's letter, flagged correct or not. */
export function letterOptions(
  flags: readonly { correct: boolean; misconception?: ChoiceOption['misconception'] }[],
): ChoiceOption[] {
  return flags.map((f, i) => ({
    id: `o${i}`,
    label: letterLabel(LETTERS[i] as string),
    correct: f.correct,
    ...(f.correct ? {} : { misconception: f.misconception ?? 'wrong-note' }),
  }));
}

/** A multi-pick step: choose all correct letters, then "Xong". */
export function multiPickStep(prompt: PromptRef, options: readonly ChoiceOption[]): ReasoningStep {
  return { kind: 'multi', prompt, options };
}
