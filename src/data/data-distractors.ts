// Builders shared by the data generators: items with their picture, count options, and
// the three fixed chance choices. Distractors each stand for a named misconception.
// Count options never use the legacy ≤100 cap (reasoning-ranges): table values run to
// 999, so near misses are data-scaled (±1, ±2, ±10, ±100) inside the skill's own max.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import {
  type Candidate,
  optionsFrom,
  reasoningItem,
  ref,
} from '../reasoning/reasoning-distractors';
import type { ChoiceOption, PromptRef, ReasoningStep } from '../reasoning/reasoning-types';
import type { Colour } from './data-ranges';
import { DATA_CAP, MIN_UNIT_PX } from './data-ranges';
import type { BagItem, DataItem, DataScene, DataTableScene, DiceScene } from './data-scene-types';

/** A count as an option label: "42" (plain number, no grouping needed below 1000). */
export const numLabel = (n: number): PromptRef => ref('num', { n });

/** A table scene: headers, rows, and row labels / a hidden cell when the skill needs them. */
export function tableScene(
  headers: readonly string[],
  rows: readonly (readonly (number | null)[])[],
  rowLabels?: readonly string[],
  hiddenCell?: { readonly row: number; readonly col: number },
): DataTableScene {
  return {
    kind: 'data-table',
    headers,
    rows,
    ...(rowLabels ? { rowLabels } : {}),
    ...(hiddenCell ? { hiddenCell } : {}),
    minUnitPx: MIN_UNIT_PX,
  };
}

/** A tally scene: the strip of O/X marks. */
export const tallyScene = (marks: readonly boolean[]): DataScene => ({
  kind: 'tally',
  marks,
  minUnitPx: MIN_UNIT_PX,
});

/** A bag scene: how many marbles of each colour, and how many are drawn at once. */
export const bagScene = (items: readonly BagItem[], pick: number): DataScene => ({
  kind: 'bag',
  items,
  pick,
  minUnitPx: MIN_UNIT_PX,
});

/** A dice scene: the face on top, a second view, and faces covered over (T3). */
export function diceScene(up: number, other?: number, hidden?: readonly number[]): DiceScene {
  return {
    kind: 'dice',
    up,
    ...(other !== undefined ? { other } : {}),
    ...(hidden ? { hidden } : {}),
    minUnitPx: MIN_UNIT_PX,
  };
}

/** An item with a picture: the scene is exactly what the phase-17 renderer draws. */
export const dataSceneItem = (
  skillId: string,
  tier: SkillTier,
  story: PromptRef,
  steps: readonly ReasoningStep[],
  sceneData: DataScene,
  work: readonly number[] = [],
): DataItem => ({ ...reasoningItem(skillId, tier, story, steps, work), scene: sceneData });

const NEAR_DATA: readonly number[] = [1, -1, 2, -2, 10, -10, 100, -100];

/** Count options (3-4): misconception values first, then data-scaled near misses. */
export function dataOptions(
  rng: Rng,
  answer: number,
  candidates: readonly Candidate<number>[],
  max: number = DATA_CAP,
): ChoiceOption[] {
  const valid = candidates.filter((c) => c.value > 0 && c.value <= max && c.value !== answer);
  const near: Candidate<number>[] = NEAR_DATA.map((d) => ({
    value: answer + d,
    misconception: 'near-miss' as const,
  })).filter((c) => c.value > 0 && c.value <= max);
  return optionsFrom(rng, answer, [...valid, ...near], numLabel, 4);
}

/** A choice among counts: the answer, then misconception counts. */
export function dataChoiceStep(
  rng: Rng,
  prompt: PromptRef,
  answer: number,
  candidates: readonly Candidate<number>[],
  max: number = DATA_CAP,
): ReasoningStep {
  return { kind: 'choice', prompt, options: dataOptions(rng, answer, candidates, max) };
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

export type ChanceVerdict = 'certain' | 'possible' | 'impossible';

/** One of the three fixed chance answers: "Chắc chắn" / "Có thể" / "Không thể". */
export const chanceLabel = (verdict: ChanceVerdict): PromptRef => ref(`chance_${verdict}`);

/** A table header ref ('i:dog') as a prompt label: the translated item noun. */
export const nounRef = (iRef: string): PromptRef => ref(`item_${iRef.slice(2)}`);

/** A row-label ref ('l:week_this') as a prompt label: the translated label key. */
export const labelRef = (lRef: string): PromptRef => ref(lRef.slice(2));

/** A bag colour as a prompt param: 'c:red' (renderDataPrompt translates it in place). */
export const colourParam = (colour: Colour): string => `c:${colour}`;
