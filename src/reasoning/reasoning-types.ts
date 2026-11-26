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
  | 'wrong-unit'
  // Fractions (src/fractions)
  | 'unequal-parts'
  | 'wrong-denominator'
  | 'not-unit'
  | 'forget-divide'
  // Time (src/time)
  | 'swapped-hands'
  | 'five-min-misread'
  | 'next-hour'
  | 'am-pm-12h'
  | 'inclusive-count'
  | 'wrong-month-length'
  | 'roman-subtractive'
  | 'wrong-weekday'
  | 'wrong-order'
  | 'elapsed-hour'
  // Money (src/money)
  | 'extra-zero'
  | 'wrong-note'
  | 'missed-note'
  | 'double-counted'
  | 'wrong-exchange'
  // Data (src/data)
  | 'counted-all'
  | 'counted-miss'
  | 'wrong-cell'
  | 'wrong-total'
  | 'wrong-category'
  | 'wrong-row'
  | 'wrong-column'
  | 'missed-one'
  | 'certain-when-possible'
  | 'possible-when-certain'
  | 'impossible-when-certain'
  | 'certain-when-impossible'
  | 'possible-when-impossible'
  | 'impossible-when-possible'
  | 'wrong-face'
  // Numbers (src/numbers)
  | 'swapped-digits'
  | 'dropped-zero'
  | 'off-by-ten'
  | 'wrong-place'
  | 'wrong-sign'
  // Add/sub with regrouping (boost, Phase 0: src/arithmetic 1A)
  | 'forgot-carry'
  | 'carry-not-added'
  | 'smaller-from-larger'
  | 'borrow-no-decrement'
  | 'zero-borrow-skip'
  | 'zero-minus-n-zero'
  | 'misaligned-columns'
  | 'second-regroup-dropped'
  // Length conversion (boost, Phase 0: src/measurement 1B; 'ignore-unit' reused)
  | 'unit-direction'
  | 'unit-factor'
  | 'dm-skipped'
  | 'mixed-concat'
  | 'mixed-drop-big';

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
    }
  /** Set the clock hands to the target time (R37): the child drags the hands or uses
   * the +/− buttons, then "Xong". `snapMinutes` is the minute-hand grid (5 or 1). */
  | {
      readonly kind: 'set-clock';
      readonly prompt: PromptRef;
      readonly h: number;
      readonly m: number;
      readonly snapMinutes: 5 | 1;
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
