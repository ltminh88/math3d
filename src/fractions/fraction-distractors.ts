// Builders shared by the fraction generators: items with or without a scene, fraction and
// word options, and letter options for labelled figures. Distractors each stand for a named
// misconception; numeric distractors stay inside the number cap, never equal to the answer.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  type Candidate,
  optionsFrom,
  reasoningItem,
  ref,
} from '../reasoning/reasoning-distractors';
import type {
  ChoiceOption,
  Misconception,
  PromptRef,
  ReasoningStep,
} from '../reasoning/reasoning-types';
import { MIN_UNIT_PX } from './fraction-ranges';
import type {
  FractionItem,
  FractionPickScene,
  FractionScene,
  FractionSetScene,
  FractionShapeBody,
  FractionShapeScene,
  Labeled,
} from './fraction-scene-types';

export const LETTERS = ['A', 'B', 'C', 'D'] as const;

/** The symbol "1/3" (or any n/d) as a prompt. */
export const fracLabel = (n: number, d: number): PromptRef => ref('frac', { n, d });

/** The word "một phần ba" (or one third) as a prompt. */
export const wordLabel = (n: number): PromptRef => ref(`word_${n}`);

/** A shape scene: circle sectors, bar columns or grid cells, with `minUnitPx` attached. */
export const shapeScene = (body: FractionShapeBody): FractionShapeScene => ({
  kind: 'fraction-shape',
  ...body,
  minUnitPx: MIN_UNIT_PX,
});

/** A set scene: `count` objects with the `marked` ones circled, `cols` per row. */
export const setScene = (
  count: number,
  marked: readonly number[],
  cols: number,
): FractionSetScene => ({ kind: 'fraction-set', count, marked, cols, minUnitPx: MIN_UNIT_PX });

/** A pick scene: 3-4 labelled shapes to choose from. */
export const pickScene = (
  figures: readonly (Labeled & FractionShapeBody)[],
): FractionPickScene => ({ kind: 'fraction-pick', figures, minUnitPx: MIN_UNIT_PX });

/** A scene-free item (fraction-read, fraction-of-set-number, fraction-wp): it renders in the
 * shared dialog today, with no phase-16 renderer needed. */
export const fractionItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  work: readonly number[] = [],
): FractionItem => reasoningItem(skillId, tier, story, steps, work);

/** An item with a picture: the scene is exactly what the phase-16 renderer draws. */
export const fractionSceneItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  sceneData: FractionScene,
  work: readonly number[] = [],
): FractionItem => ({ ...reasoningItem(skillId, tier, story, steps, work), scene: sceneData });

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

/** A choice of 3-4 fractions: the answer 1/n, then misconception fractions. */
export function fractionChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  n: number,
  candidates: readonly Candidate<readonly [number, number]>[],
): ReasoningStep {
  return labelChoiceStep(
    rng,
    prompt,
    fracLabel(1, n),
    candidates.map((c) => ({
      value: fracLabel(c.value[0], c.value[1]),
      misconception: c.misconception,
    })),
  );
}

/** A choice of 3-4 fraction words: the answer word_n, then wrong-denominator words. */
export function wordChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  n: number,
  candidates: readonly Candidate<number>[],
): ReasoningStep {
  return labelChoiceStep(
    rng,
    prompt,
    wordLabel(n),
    candidates.map((c) => ({ value: wordLabel(c.value), misconception: c.misconception })),
  );
}

/** Options A-D for labelled figures, in figure order (the figures are already shuffled). */
export function letterOptions(
  figures: readonly { correct: boolean; misconception?: Misconception }[],
): ChoiceOption[] {
  return figures.map((f, i) => {
    const label = ref('letter', { l: LETTERS[i] as string });
    return f.correct
      ? { id: `o${i}`, label, correct: true }
      : { id: `o${i}`, label, correct: false, misconception: f.misconception ?? 'near-miss' };
  });
}
