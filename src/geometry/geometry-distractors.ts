// Builders shared by the geometry and measurement generators: items with a scene, quantity
// options ("28 cm" vs "49 cm²"), letter options for labelled figures and the unit-choice step.
// Numeric distractors reuse the reasoning rules: misconception values first, then near misses,
// all inside the number cap, never equal to the answer.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  type Candidate,
  optionsFrom,
  reasoningItem,
  ref,
} from '../reasoning/reasoning-distractors';
import { withinCap } from '../reasoning/reasoning-ranges';
import type {
  ChoiceOption,
  Misconception,
  PromptRef,
  ReasoningStep,
} from '../reasoning/reasoning-types';
import type { GeoItem, GeoScene, SceneBody, Unit } from './geo-scene-types';
import { MIN_UNIT_PX } from './geometry-ranges';

export const LETTERS = ['A', 'B', 'C', 'D'] as const;

export const scene = (body: SceneBody, minUnitPx = MIN_UNIT_PX): GeoScene => ({
  ...body,
  minUnitPx,
});

export const geoItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  sceneData: GeoScene,
  unit: Unit | null,
  work: readonly number[] = [],
): GeoItem => ({ ...reasoningItem(skillId, tier, story, steps, work), scene: sceneData, unit });

/** "7 cm", "49 cm²"... (`num` when the answer is a plain count). */
export const qtyLabel = (n: number, unit: Unit | null): PromptRef =>
  unit ? ref(`q_${unit}`, { n }) : ref('num', { n });

const NEAR = [1, -1, 2, -2, 10, -10, 3, -3];

/** A choice of 3-4 quantities: the answer, misconception values, then near misses. */
export function qtyChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  unit: Unit | null,
  candidates: readonly Candidate<number>[],
): ReasoningStep {
  const valid = candidates.filter((c) => withinCap(c.value) && c.value > 0 && c.value !== answer);
  const near = NEAR.map((d) => ({ value: answer + d, misconception: 'near-miss' as const })).filter(
    (c) => withinCap(c.value) && c.value > 0,
  );
  const options = optionsFrom(rng, answer, [...valid, ...near], (n) => qtyLabel(n, unit));
  return { kind: 'choice', prompt, options };
}

/** "Đơn vị đúng là:" cm² vs cm vs mm (the misconception is the unit itself). */
export function unitChoiceStep(rng: Rng, unit: Unit, wrong: readonly Unit[]): ReasoningStep {
  const candidates = wrong.map((u) => ({ value: u, misconception: 'wrong-unit' as const }));
  const options = optionsFrom(rng, unit, candidates, (u) => ref(`u_${u}`));
  return { kind: 'choice', prompt: ref('pickUnit'), options };
}

export interface LetterOption {
  readonly correct: boolean;
  readonly misconception?: Misconception;
}

/** Options A-D for labelled figures, in figure order (the figures are already shuffled). */
export function letterOptions(figures: readonly LetterOption[]): ChoiceOption[] {
  return figures.map((f, i) => {
    const label = ref('letter', { l: LETTERS[i] as string });
    return f.correct
      ? { id: `o${i}`, label, correct: true }
      : { id: `o${i}`, label, correct: false, misconception: f.misconception ?? 'near-miss' };
  });
}
