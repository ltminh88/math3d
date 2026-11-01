// Answers and hints of a level's reasoning round (pure). The step card checks each answer; this
// keeps the shared hint ladder: three misses over the item reveal the answer (recorded, not
// correct). Hints: 1 encourage, 2 the picture, 3 the strategy + this step's operation (no rung 4).
import {
  createHintState,
  type HintState,
  recordWrong,
  takeHint,
  toQuestionResult,
} from '../../learning/hint-ladder';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { playableSteps, type StepAnswer } from '../../reasoning/reasoning-step-answers';
import { reasoningHint } from './reasoning-round-hints';
import type { ReasoningRoundPlan } from './reasoning-round-slot';

export const LAST_REASONING_RUNG = 3;

export interface ReasoningAnswer {
  stepIndex: number;
  correct: boolean;
  answer: StepAnswer;
}

export interface ReasoningVerdict {
  verdict: 'step' | 'correct' | 'wrong' | 'revealed' | 'ignored';
  /** Set when the round just ended: record it with `learning.record`. */
  outcome?: QuestionOutcome;
}

export class ReasoningRoundFlow {
  hint: HintState = createHintState();
  done = false;
  private stepIndex = 0;
  private readonly stepCount: number;
  private readonly wrongAnswers: number[] = [];
  private readonly startedAt: number;

  constructor(
    readonly plan: ReasoningRoundPlan,
    private readonly now: () => number,
  ) {
    this.stepCount = playableSteps(plan.item).length;
    this.startedAt = now();
  }

  get canHint(): boolean {
    return !this.done && this.hint.rung < LAST_REASONING_RUNG;
  }

  answer({ stepIndex, correct, answer }: ReasoningAnswer): ReasoningVerdict {
    if (this.done || stepIndex !== this.stepIndex) return { verdict: 'ignored' };
    if (correct) {
      this.stepIndex += 1;
      if (this.stepIndex < this.stepCount) return { verdict: 'step' };
      return { verdict: 'correct', outcome: this.finish(true) };
    }
    if (typeof answer === 'number') this.wrongAnswers.push(answer);
    this.hint = recordWrong(this.hint);
    if (!this.hint.revealed) return { verdict: 'wrong' };
    return { verdict: 'revealed', outcome: this.finish(false) };
  }

  /** Next hint text (the same last one once the ladder is spent). */
  takeHint(): string {
    if (this.canHint) this.hint = takeHint(this.hint);
    return reasoningHint(this.plan.item, Math.max(1, this.hint.rung), this.stepIndex);
  }

  private finish(solved: boolean): QuestionOutcome {
    this.done = true;
    const result = toQuestionResult(this.hint, solved);
    return {
      factKey: this.plan.factKey,
      ms: this.now() - this.startedAt,
      correct: result.correct,
      firstTry: result.firstTry,
      usedHint: result.usedHint,
      wrongAnswers: [...this.wrongAnswers],
    };
  }
}
