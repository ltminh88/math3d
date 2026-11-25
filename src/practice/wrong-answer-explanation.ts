// Wrong-answer explanations (R35): pure logic that picks the explanation for one wrong
// answer in the lesson/daily dialog. The UI calls this on a 'wrong' verdict; null means
// "no per-skill explanation — keep the generic sentence". The selector never states the
// answer: it only names the likely confusion, with the question's own numbers.
// Lane 1 covers groups 1–3; lanes 2–3 add their matchers here and their keys to
// wrong-answer-strings.ts. The hint ladder is untouched (golden).
import type { SkillTier } from '../learning/skill-tiers';
import {
  isStepAnswerCorrect,
  playableSteps,
  type StepAnswer,
} from '../reasoning/reasoning-step-answers';
import type { ChoiceOption, ReasoningStep } from '../reasoning/reasoning-types';
import type { PracticeItem } from './practice-scene';
import { explainMidpoint } from './wrong-answer-midpoint';
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
   * 1 = first miss on this step, 2 = second miss. Lane 1 returns the same explanation
   * for both (reviewer Q1 about leading to the answer on the second miss is pending).
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
  /** The chosen option for choice steps (undefined when the id did not match). */
  readonly option?: ChoiceOption;
  /** The wrong number for number steps (and for choice steps with a numeric label). */
  readonly wrongNumber?: number;
  readonly missNumber: number;
}

export type WrongAnswerMatcher = (ctx: WrongAnswerContext) => WrongAnswerExplanation | null;

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
): { option?: ChoiceOption; wrongNumber?: number } {
  if (step.kind === 'choice' && typeof answer === 'string') {
    const option = step.options.find((o) => o.id === answer);
    const n = option?.label.params?.n;
    return { option, wrongNumber: typeof n === 'number' ? n : undefined };
  }
  if (step.kind === 'number' && typeof answer === 'number') return { wrongNumber: answer };
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
    missNumber: input.missNumber,
    ...resolveAnswer(step, input.answer),
  };
  if (input.skillId.startsWith('unknown-')) return explainUnknown(ctx);
  if (input.skillId === 'wp-times-then-sub' || input.skillId === 'wp-divide-then-sub')
    return explainTwoStep(ctx);
  if (input.skillId === 'geo-midpoint-length') return explainMidpoint(ctx);
  return null;
}
