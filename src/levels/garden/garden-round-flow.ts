// Pure run logic of the garden: the current round and step, answers checked against the item,
// the hint ladder (it restarts at each new step; hints taken still count for the round) and one
// recorded outcome per round. Rules: no timer, no lives; three misses on a step show that step's
// answer and the round goes on (recorded as not correct).
import { type HintRung, type HintState, shouldOfferHint } from '../../learning/hint-ladder';
import type { QuestionOutcome } from '../../learning/session-recorder';
import {
  isStepAnswerCorrect,
  playableSteps,
  type StepAnswer,
} from '../../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
import { StepMissBudget } from '../shared/step-miss-budget';
import type { GardenRound } from './garden-round-plan';

export interface GardenSubmitResult {
  verdict: 'correct' | 'wrong' | 'revealed' | 'ignored';
  /** Set when the round just ended: record it with `learning.record`. */
  outcome?: QuestionOutcome;
}

/** A wrong answer as a number for the recorder (a number, or the number on a chosen card). */
function wrongValue(step: ReasoningStep, answer: StepAnswer): number | undefined {
  if (typeof answer === 'number') return answer;
  if (step.kind !== 'choice' || typeof answer !== 'string') return undefined;
  const n = step.options.find((o) => o.id === answer)?.label.params?.n;
  return typeof n === 'number' ? n : undefined;
}

export class GardenRoundFlow {
  index = 0;
  stepIndex = 0;
  roundComplete = false;
  private readonly budget = new StepMissBudget();
  private wrongAnswers: number[] = [];
  private startedAt: number;

  constructor(
    readonly rounds: readonly GardenRound[],
    private readonly now: () => number,
  ) {
    this.startedAt = now();
  }

  /** The live step's hint ladder (its misses and rungs). */
  get hint(): HintState {
    return this.budget.hint;
  }

  get round(): GardenRound | undefined {
    return this.rounds[this.index];
  }

  get steps(): ReasoningStep[] {
    const round = this.round;
    return round ? playableSteps(round.item) : [];
  }

  get step(): ReasoningStep | undefined {
    return this.roundComplete ? undefined : this.steps[this.stepIndex];
  }

  get done(): boolean {
    return this.index >= this.rounds.length;
  }

  submit(answer: StepAnswer): GardenSubmitResult {
    const round = this.round;
    const step = this.step;
    if (!round || !step) return { verdict: 'ignored' };
    if (isStepAnswerCorrect(step, answer)) return this.advance(round, 'correct');
    const value = wrongValue(step, answer);
    if (value !== undefined) this.wrongAnswers.push(value);
    if (!this.budget.miss()) return { verdict: 'wrong' };
    return this.advance(round, 'revealed');
  }

  /** The live step is answered or shown: the next step, or the round's outcome after the last. */
  private advance(round: GardenRound, verdict: 'correct' | 'revealed'): GardenSubmitResult {
    this.stepIndex += 1;
    if (this.stepIndex < this.steps.length) {
      this.budget.nextStep();
      return { verdict };
    }
    return { verdict, outcome: this.finish(round) };
  }

  hintOffered(idleMs: number): boolean {
    return !this.done && !this.roundComplete && shouldOfferHint(this.hint, idleMs);
  }

  takeHint(): HintRung {
    return this.budget.takeHint(4);
  }

  /** Moves on after a finished round. */
  next(): void {
    if (!this.roundComplete) return;
    this.index += 1;
    this.stepIndex = 0;
    this.budget.reset();
    this.roundComplete = false;
    this.wrongAnswers = [];
    this.startedAt = this.now();
  }

  private finish(round: GardenRound): QuestionOutcome {
    this.roundComplete = true;
    const result = this.budget.result();
    return {
      factKey: round.factKey,
      ms: this.now() - this.startedAt,
      correct: result.correct,
      firstTry: result.firstTry,
      usedHint: result.usedHint,
      wrongAnswers: [...this.wrongAnswers],
    };
  }
}
