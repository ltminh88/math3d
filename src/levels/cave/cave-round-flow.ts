// Pure run logic of the cave: the answer and hint state of the current chamber. Rules: no timer,
// no lives; a chamber is one recorded question (a verdict and its fix included); three misses on
// a step show that step's answer and the chamber goes on (recorded not correct). The hint ladder
// restarts at each new step (hints taken still count for the chamber), as in the garden.
import { type HintRung, type HintState, shouldOfferHint } from '../../learning/hint-ladder';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { isStepAnswerCorrect, type StepAnswer } from '../../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
import { StepMissBudget } from '../shared/step-miss-budget';
import type { CaveChamber } from './cave-chamber-formats';

/** Rungs taught in the cave: encourage, line diagram / restate, first step worked with "?". */
export const CAVE_LAST_RUNG = 3;

export interface CaveAnswerResult {
  verdict: 'correct' | 'wrong' | 'revealed' | 'ignored';
  /** Set when the chamber just ended: record it with `learning.record`. */
  outcome?: QuestionOutcome;
}

export class CaveRoundFlow {
  index = 0;
  stepIndex = 0;
  roundComplete = false;
  private readonly budget = new StepMissBudget();
  private wrongAnswers: number[] = [];
  private startedAt: number;

  constructor(
    readonly chambers: readonly CaveChamber[],
    private readonly now: () => number,
  ) {
    this.startedAt = now();
  }

  /** The live step's hint ladder (its misses and rungs). */
  get hint(): HintState {
    return this.budget.hint;
  }

  get chamber(): CaveChamber | undefined {
    return this.chambers[this.index];
  }

  get step(): ReasoningStep | undefined {
    return this.chamber?.steps[this.stepIndex];
  }

  get done(): boolean {
    return this.index >= this.chambers.length;
  }

  answer(value: StepAnswer): CaveAnswerResult {
    const chamber = this.chamber;
    const step = this.step;
    if (!chamber || !step || this.roundComplete) return { verdict: 'ignored' };
    if (isStepAnswerCorrect(step, value)) return this.advance(chamber, 'correct');
    if (typeof value === 'number') this.wrongAnswers.push(value);
    if (!this.budget.miss()) return { verdict: 'wrong' };
    return this.advance(chamber, 'revealed');
  }

  /** The live step is answered or shown: the next step, or the chamber's outcome after the last. */
  private advance(chamber: CaveChamber, verdict: 'correct' | 'revealed'): CaveAnswerResult {
    this.stepIndex += 1;
    if (this.stepIndex < chamber.steps.length) {
      this.budget.nextStep();
      return { verdict };
    }
    return { verdict, outcome: this.finish(chamber) };
  }

  hintOffered(idleMs: number): boolean {
    return (
      !this.roundComplete && this.hint.rung < CAVE_LAST_RUNG && shouldOfferHint(this.hint, idleMs)
    );
  }

  takeHint(): HintRung {
    return this.budget.takeHint(CAVE_LAST_RUNG);
  }

  /** Into the next chamber after a finished one. */
  next(): void {
    if (!this.roundComplete) return;
    this.index += 1;
    this.stepIndex = 0;
    this.budget.reset();
    this.roundComplete = false;
    this.wrongAnswers = [];
    this.startedAt = this.now();
  }

  private finish(chamber: CaveChamber): QuestionOutcome {
    this.roundComplete = true;
    const result = this.budget.result();
    return {
      factKey: `sk:${chamber.skillId}`,
      ms: this.now() - this.startedAt,
      correct: result.correct,
      firstTry: result.firstTry,
      usedHint: result.usedHint,
      wrongAnswers: [...this.wrongAnswers],
    };
  }
}
