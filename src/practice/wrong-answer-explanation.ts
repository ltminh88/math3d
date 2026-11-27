// Wrong-answer explanations (R35): pure logic that picks the explanation for one wrong
// answer in the lesson/daily dialog. The UI calls this on a 'wrong' verdict; null means
// "no per-skill explanation — keep the generic sentence". The selector never states the
// answer: it only names the likely confusion, with the question's own numbers.
// Lanes 1–3 cover groups 1–10; the hint ladder is untouched (golden).
import type { SkillTier } from '../learning/skill-tiers';
import {
  firstWrongPair,
  isStepAnswerCorrect,
  playableSteps,
  type StepAnswer,
} from '../reasoning/reasoning-step-answers';
import type { ChoiceOption, Misconception, ReasoningStep } from '../reasoning/reasoning-types';
import type { PracticeItem } from './practice-scene';
import { explainArea } from './wrong-answer-area';
import { explainCarry } from './wrong-answer-carry';
import { explainClock } from './wrong-answer-clock';
import { explainData } from './wrong-answer-data';
import { explainFraction } from './wrong-answer-fraction';
import { LENGTH_BUG_EXPLAINERS } from './wrong-answer-length';
import { explainMidpoint } from './wrong-answer-midpoint';
import { explainMoney } from './wrong-answer-money';
import { explainRemainder } from './wrong-answer-remainder';
import type { WrongAnswerKey } from './wrong-answer-strings';
import { explainTwoStep } from './wrong-answer-two-step';
import { explainUnknown } from './wrong-answer-unknown';

export interface WrongAnswerInput {
  readonly skillId: string;
  readonly tier: SkillTier;
  readonly item: PracticeItem;
  readonly stepIndex: number;
  readonly answer: StepAnswer;
  /**
   * 1 = first miss on this step, 2 = second miss. The same explanation is
   * shown for both (reviewer Q1, R38: explanation only — the hint button
   * leads to the answer, so the selector never states it).
   */
  readonly missNumber: number;
}

export interface WrongAnswerExplanation {
  readonly key: WrongAnswerKey;
  readonly params?: Record<string, string | number>;
}

/** What a matcher sees: the live step, plus the wrong answer already resolved. */
export interface WrongAnswerContext {
  readonly skillId: string;
  readonly tier: SkillTier;
  readonly item: PracticeItem;
  readonly step: ReasoningStep;
  /** Index into playableSteps(item) — which step the wrong answer belongs to. */
  readonly stepIndex: number;
  /** The chosen option for choice steps (undefined when the id did not match). */
  readonly option?: ChoiceOption;
  /** The wrong number for number steps (and for choice steps with a numeric label). */
  readonly wrongNumber?: number;
  /** The chosen option ids for multi steps (money-pick-notes). */
  readonly chosenIds?: readonly string[];
  readonly missNumber: number;
}

export type WrongAnswerMatcher = (ctx: WrongAnswerContext) => WrongAnswerExplanation | null;

/**
 * Bug explainer registry (boost, Phase 0): a later lane registers one explainer
 * per bug id (add/sub, length). The router checks the chosen option's bug first
 * and falls back to today's per-skill routing when the explainer is missing or
 * returns null — with no bug, the output is byte-equal to before.
 */
export type BugExplainer = (ctx: WrongAnswerContext) => WrongAnswerExplanation | null;

const bugExplainables = new Map<Misconception, BugExplainer>();

// Boost, Phase 1B: the length lane's explainers, merged at load. This import is
// data-only (wrong-answer-length imports no runtime value from this file), so
// the merge cannot run into the Map's TDZ.
for (const [bug, fn] of LENGTH_BUG_EXPLAINERS) bugExplainables.set(bug, fn);

export function registerBugExplainer(bug: Misconception, fn: BugExplainer): void {
  bugExplainables.set(bug, fn);
}

/** Read a numeric story param (`{a, n, ...}`); undefined when absent or not a number. */
export function numParam(
  params: Readonly<Record<string, number | string>> | undefined,
  key: string,
): number | undefined {
  const value = params?.[key];
  return typeof value === 'number' ? value : undefined;
}

function resolveAnswer(
  step: ReasoningStep,
  answer: StepAnswer,
): {
  option?: ChoiceOption;
  wrongNumber?: number;
  chosenIds?: readonly string[];
} {
  if (step.kind === 'choice' && typeof answer === 'string') {
    const option = step.options.find((o) => o.id === answer);
    const n = option?.label.params?.n;
    return { option, wrongNumber: typeof n === 'number' ? n : undefined };
  }
  if (step.kind === 'multi' && Array.isArray(answer)) return { chosenIds: answer };
  if (step.kind === 'number' && typeof answer === 'number') return { wrongNumber: answer };
  if (step.kind === 'order') return {};
  if (step.kind === 'match') {
    // A wrong pair whose right option carries a bug becomes the "chosen
    // option", so the Phase 0 bug registry explains it like a choice pick.
    const wrong = firstWrongPair(step, answer);
    if (!wrong?.misconception) return {};
    const label = step.right[wrong.right]?.label;
    if (!label) return {};
    return {
      option: {
        id: `match-${wrong.left}`,
        label,
        correct: false,
        misconception: wrong.misconception,
      },
    };
  }
  return {};
}

export function explainWrongAnswer(input: WrongAnswerInput): WrongAnswerExplanation | null {
  const step = playableSteps(input.item)[input.stepIndex];
  if (!step) return null;
  // Defensive: the UI only calls this on a wrong verdict, but a right answer must
  // never be "explained" (some trap values coincide with the answer on other forms).
  if (isStepAnswerCorrect(step, input.answer)) return null;
  const ctx: WrongAnswerContext = {
    skillId: input.skillId,
    tier: input.tier,
    item: input.item,
    step,
    stepIndex: input.stepIndex,
    missNumber: input.missNumber,
    ...resolveAnswer(step, input.answer),
  };
  // Boost (Phase 0): the chosen option's bug wins when a lane registered an
  // explainer for it; anything else falls through to today's routing.
  const bug = ctx.option?.misconception;
  if (bug) {
    const explain = bugExplainables.get(bug)?.(ctx);
    if (explain) return explain;
  }
  if (input.skillId.startsWith('unknown-')) return explainUnknown(ctx);
  if (input.skillId === 'wp-times-then-sub' || input.skillId === 'wp-divide-then-sub')
    return explainTwoStep(ctx);
  if (input.skillId === 'geo-midpoint-length') return explainMidpoint(ctx);
  if (input.skillId === 'meas-area-count' || input.skillId === 'meas-area-equal')
    return explainArea(ctx);
  if (
    input.skillId === 'fraction-wp' ||
    input.skillId === 'fraction-of-set-number' ||
    input.skillId === 'fraction-of-set-circle'
  )
    return explainFraction(ctx);
  if (input.skillId === 'roman-clock-hour' || input.skillId === 'clock-sang-chieu-24h')
    return explainClock(ctx);
  if (
    input.skillId === 'money-change-back' ||
    input.skillId === 'money-total-notes' ||
    input.skillId === 'money-pick-notes' ||
    input.skillId === 'money-wp'
  )
    return explainMoney(ctx);
  if (
    input.skillId === 'tally-count' ||
    input.skillId === 'table-read' ||
    input.skillId === 'table-max-min' ||
    input.skillId === 'table-sums' ||
    input.skillId === 'table-fill-missing' ||
    input.skillId === 'chance-bag' ||
    input.skillId === 'chance-dice'
  )
    return explainData(ctx);
  if (
    input.skillId === 'add-sub-1000' ||
    input.skillId === 'add-sub-1000-wp' ||
    input.skillId === 'add-sub-10000-wp' ||
    input.skillId === 'add-sub-100000-wp' ||
    input.skillId === 'add-sub-1000-chain' ||
    input.skillId === 'add-4digit' ||
    input.skillId === 'sub-4digit' ||
    input.skillId === 'add-5digit' ||
    input.skillId === 'sub-5digit' ||
    input.skillId === 'add-sub-find-error' ||
    input.skillId === 'add-missing-digit'
  )
    return explainCarry(ctx);
  if (
    input.skillId === 'div-2d-1d-remainder' ||
    input.skillId === 'div-3d-1d-remainder' ||
    input.skillId === 'div-4d-1d-remainder' ||
    input.skillId === 'div-5d-1d-remainder' ||
    input.skillId === 'div-rem-floor' ||
    input.skillId === 'div-rem-ceil'
  )
    return explainRemainder(ctx);
  return null;
}
