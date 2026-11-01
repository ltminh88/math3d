// Pure run logic of the garden: the current round and step, answers checked against the item,
// the hint ladder (it restarts at each new step; hints taken still count for the round) and one
// recorded outcome per round. Rules: no timer, no lives; three misses reveal the round.
import {
  createHintState,
  type HintRung,
  type HintState,
  recordWrong,
  shouldOfferHint,
  takeHint,
  toQuestionResult,
} from '../../learning/hint-ladder';
import type { QuestionOutcome } from '../../learning/session-recorder';
import {
  isStepAnswerCorrect,
  playableSteps,
  type StepAnswer,
} from '../../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
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
  hint: HintState = createHintState();
  roundComplete = false;
  private wrongAnswers: number[] = [];
  private startedAt: number;

  constructor(
    readonly rounds: readonly GardenRound[],
    private readonly now: () => number,
  ) {
    this.startedAt = now();
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
    if (isStepAnswerCorrect(step, answer)) {
      this.stepIndex += 1;
      if (this.stepIndex < this.steps.length) {
        this.hint = { ...this.hint, rung: 0 };
        return { verdict: 'correct' };
      }
      return { verdict: 'correct', outcome: this.finish(round, true) };
    }
    const value = wrongValue(step, answer);
    if (value !== undefined) this.wrongAnswers.push(value);
    this.hint = recordWrong(this.hint);
    if (!this.hint.revealed) return { verdict: 'wrong' };
    return { verdict: 'revealed', outcome: this.finish(round, false) };
  }

  hintOffered(idleMs: number): boolean {
    return !this.done && !this.roundComplete && shouldOfferHint(this.hint, idleMs);
  }

  takeHint(): HintRung {
    this.hint = takeHint(this.hint);
    return this.hint.rung;
  }

  /** Moves on after a finished round. */
  next(): void {
    if (!this.roundComplete) return;
    this.index += 1;
    this.stepIndex = 0;
    this.hint = createHintState();
    this.roundComplete = false;
    this.wrongAnswers = [];
    this.startedAt = this.now();
  }

  private finish(round: GardenRound, solved: boolean): QuestionOutcome {
    this.roundComplete = true;
    const result = toQuestionResult(this.hint, solved);
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
