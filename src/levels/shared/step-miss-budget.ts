// Miss budget of a multi-step round (pure): every step has its own three tries, as in the
// workshop (author decision 2026-11-02). The third miss on a step shows that step's answer and the
// next step starts again from zero misses; the round is still recorded once, not correct as soon
// as any step was shown. Hints taken on any step count for the round.
import {
  createHintState,
  type HintRung,
  type HintState,
  recordWrong,
  takeHint,
} from '../../learning/hint-ladder';

export interface RoundResult {
  correct: boolean;
  firstTry: boolean;
  usedHint: boolean;
}

export class StepMissBudget {
  /** The live step's ladder: its misses, its reveal, its hints. */
  hint: HintState = createHintState();
  private taught: HintRung = 0;
  private missed = false;
  private revealed = false;
  private hinted = false;

  /** `keepRung`: the hint rung carries over to the next step (one ladder for the whole round). */
  constructor(private readonly keepRung = false) {}

  /** A miss on the live step; true when it was the step's third (show its answer, move on). */
  miss(): boolean {
    this.hint = recordWrong(this.hint);
    return this.hint.revealed;
  }

  /** The next rung of the live step, never past `lastRung`. */
  takeHint(lastRung: number): HintRung {
    if (this.hint.rung < lastRung) {
      this.hint = takeHint(this.hint);
      this.taught = this.hint.rung;
    }
    return this.hint.rung;
  }

  /** The live step is answered or shown: the next one starts with a fresh budget. */
  nextStep(): void {
    this.fold();
    this.hint = createHintState();
    if (this.keepRung) this.hint.rung = this.taught;
    else this.taught = 0;
  }

  /** The round's result over all its steps (the round reached its end). */
  result(): RoundResult {
    this.fold();
    return {
      correct: !this.revealed,
      firstTry: !this.missed,
      usedHint: this.hinted || this.revealed,
    };
  }

  /** A new round. */
  reset(): void {
    this.hint = createHintState();
    this.taught = 0;
    this.missed = false;
    this.revealed = false;
    this.hinted = false;
  }

  private fold(): void {
    this.missed ||= this.hint.wrongAttempts > 0;
    this.revealed ||= this.hint.revealed;
    this.hinted ||= this.hint.hintsTaken > 0;
  }
}
