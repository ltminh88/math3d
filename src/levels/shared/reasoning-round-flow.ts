// Answers and hints of a level's reasoning round (pure). The step card checks each answer; three
// misses on a step show that step's answer and the round goes on (recorded once, not correct).
// One hint ladder for the round: 1 encourage, 2 the picture, 3 the strategy + this step's
// operation (no rung 4).
import type { HintState } from '../../learning/hint-ladder';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { playableSteps, type StepAnswer } from '../../reasoning/reasoning-step-answers';
import { reasoningHint } from './reasoning-round-hints';
import type { ReasoningRoundPlan } from './reasoning-round-slot';
import { StepMissBudget } from './step-miss-budget';

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
  done = false;
  /** The rung carries over from step to step (one ladder per round); misses do not. */
  private readonly budget = new StepMissBudget(true);
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

  /** The live step's hint ladder (its misses, the round's rung). */
  get hint(): HintState {
    return this.budget.hint;
  }

  get canHint(): boolean {
    return !this.done && this.hint.rung < LAST_REASONING_RUNG;
  }

  answer({ stepIndex, correct, answer }: ReasoningAnswer): ReasoningVerdict {
    if (this.done || stepIndex !== this.stepIndex) return { verdict: 'ignored' };
    if (correct) return this.advance('step');
    if (typeof answer === 'number') this.wrongAnswers.push(answer);
    if (!this.budget.miss()) return { verdict: 'wrong' };
    return this.advance('revealed');
  }

  /** The live step is answered or shown: the next step, or the round's outcome after the last. */
  private advance(verdict: 'step' | 'revealed'): ReasoningVerdict {
    this.stepIndex += 1;
    if (this.stepIndex < this.stepCount) {
      this.budget.nextStep();
      return { verdict };
    }
    return { verdict: verdict === 'step' ? 'correct' : 'revealed', outcome: this.finish() };
  }

  /** Next hint text (the same last one once the ladder is spent). */
  takeHint(): string {
    if (!this.done) this.budget.takeHint(LAST_REASONING_RUNG);
    return reasoningHint(this.plan.item, Math.max(1, this.hint.rung), this.stepIndex);
  }

  private finish(): QuestionOutcome {
    this.done = true;
    const result = this.budget.result();
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
