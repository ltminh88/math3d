// Pure run logic of the cave: the answer and hint state of the current chamber. Rules: no timer,
// no lives; a chamber is one recorded question (a verdict and its fix included); three misses in a
// chamber reveal the worked answer (recorded not correct) and the cave goes on. The hint ladder
// restarts at each new step (hints taken still count for the chamber), as in the garden.
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
import { isStepAnswerCorrect, type StepAnswer } from '../../reasoning/reasoning-step-answers';
import type { ReasoningStep } from '../../reasoning/reasoning-types';
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
  hint: HintState = createHintState();
  roundComplete = false;
  private wrongAnswers: number[] = [];
  private startedAt: number;

  constructor(
    readonly chambers: readonly CaveChamber[],
    private readonly now: () => number,
  ) {
    this.startedAt = now();
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
    if (isStepAnswerCorrect(step, value)) {
      this.stepIndex += 1;
      if (this.stepIndex < chamber.steps.length) {
        this.hint = { ...this.hint, rung: 0 };
        return { verdict: 'correct' };
      }
      return { verdict: 'correct', outcome: this.finish(chamber, true) };
    }
    if (typeof value === 'number') this.wrongAnswers.push(value);
    this.hint = recordWrong(this.hint);
    if (!this.hint.revealed) return { verdict: 'wrong' };
    this.stepIndex = chamber.steps.length;
    return { verdict: 'revealed', outcome: this.finish(chamber, false) };
  }

  hintOffered(idleMs: number): boolean {
    return (
      !this.roundComplete && this.hint.rung < CAVE_LAST_RUNG && shouldOfferHint(this.hint, idleMs)
    );
  }

  takeHint(): HintRung {
    if (this.hint.rung < CAVE_LAST_RUNG) this.hint = takeHint(this.hint);
    return this.hint.rung;
  }

  /** Into the next chamber after a finished one. */
  next(): void {
    if (!this.roundComplete) return;
    this.index += 1;
    this.stepIndex = 0;
    this.hint = createHintState();
    this.roundComplete = false;
    this.wrongAnswers = [];
    this.startedAt = this.now();
  }

  private finish(chamber: CaveChamber, solved: boolean): QuestionOutcome {
    this.roundComplete = true;
    const result = toQuestionResult(this.hint, solved);
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
