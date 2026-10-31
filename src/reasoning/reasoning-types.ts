// Reasoning items: pure data a level or the bridge quiz turns into a step card. Text is never
// built here: every prompt is a string key + params, rendered by reasoning-strings.ts.

import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';

/** Params of a prompt. A string starting with `i:` names an item noun (`i:candy`), translated when rendered. */
export type PromptParams = Readonly<Record<string, number | string>>;

export interface PromptRef {
  readonly key: string;
  readonly params?: PromptParams;
}

/** Named wrong ideas a distractor stands for (also used for hints later). */
export type Misconception =
  | 'add-instead-of-times'
  | 'minus-instead-of-divide'
  | 'one-step-only'
  | 'difference-not-quotient'
  | 'quotient-not-difference'
  | 'round-down-trap'
  | 'remainder-too-big'
  | 'left-to-right'
  | 'ignore-brackets'
  | 'wrong-inverse'
  | 'wrong-step'
  | 'near-miss'
  // Geometry and measurement (src/geometry, src/measurement)
  | 'whole-not-half'
  | 'half-not-double'
  | 'radius-diameter-swap'
  | 'not-through-centre'
  | 'all-sides'
  | 'upright-only'
  | 'not-a-right-angle'
  | 'missed-count'
  | 'right-angles-only'
  | 'equal-sides-only'
  | 'wrong-shape'
  | 'flat-not-solid'
  | 'two-equal-is-cube'
  | 'visible-only'
  | 'read-end-not-length'
  | 'ignore-unit'
  | 'count-marks'
  | 'count-weights'
  | 'one-side-missed'
  | 'half-perimeter'
  | 'square-times-two'
  | 'perimeter-not-area'
  | 'area-not-perimeter'
  | 'wrong-unit';

export interface ChoiceOption {
  readonly id: string;
  readonly label: PromptRef;
  readonly correct: boolean;
  /** Set on every wrong option. */
  readonly misconception?: Misconception;
}

export type ReasoningStep =
  | { readonly kind: 'number'; readonly prompt: PromptRef; readonly answer: number }
  | {
      readonly kind: 'choice';
      readonly prompt: PromptRef;
      readonly options: readonly ChoiceOption[];
    }
  /** Choose all correct options, then "Xong". */
  | {
      readonly kind: 'multi';
      readonly prompt: PromptRef;
      readonly options: readonly ChoiceOption[];
    }
  /** Đúng / Sai about `statement`; when false and `fix` is set, a number step asks the right value. */
  | {
      readonly kind: 'verdict';
      readonly prompt: PromptRef;
      readonly statement: PromptRef;
      readonly answer: boolean;
      readonly fix?: { readonly prompt: PromptRef; readonly answer: number };
    };

export interface ReasoningItem {
  readonly skillId: string;
  readonly tier: SkillTier;
  /** The situation or task shown above the steps. */
  readonly story: PromptRef;
  readonly steps: readonly ReasoningStep[];
  /** Intermediate results the solution passes through (all within the number cap). */
  readonly work: readonly number[];
}

export type ReasoningGenerator = (rng: Rng, tier: SkillTier) => ReasoningItem;
