// Round flow of the workshop (pure): which round and step is live, misses and hint rungs per step,
// the reveal after three misses, and the outcome recorded under the skill's `sk:` key. The step
// card checks each answer; the controller reports it here with `answer(correct, wrongValue)`.
import type { QuestionOutcome } from '../../learning/session-recorder';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import type { WorkshopRound } from './workshop-round-plan';

/** Misses on one step before its answer is shown. */
export const MAX_MISSES = 3;
/** Hint rungs: encourage, the rule in words, a partial step. */
export const HINT_RUNGS = 3;

export type TryResult = 'correct' | 'wrong' | 'reveal';

export class WorkshopRoundFlow {
  index = 0;
  stepIndex = 0;
  misses = 0;
  hintRung = 0;
  private wrongs: number[] = [];
  private usedHint = false;
  private revealed = false;
  private startedAt: number;

  constructor(
    readonly rounds: readonly WorkshopRound[],
    private readonly now: () => number,
  ) {
    this.startedAt = now();
  }

  get round(): WorkshopRound | null {
    return this.rounds[this.index] ?? null;
  }

  get done(): boolean {
    return this.index >= this.rounds.length;
  }

  get stepCount(): number {
    return this.round ? playableSteps(this.round.item).length : 0;
  }

  get roundComplete(): boolean {
    return !this.done && this.stepIndex >= this.stepCount;
  }

  get hintOffered(): boolean {
    return this.misses > 0 && !this.roundComplete;
  }

  /** One try on the live step; a wrong try counts `wrongValue` (0..). */
  answer(correct: boolean, wrongValue = 0): TryResult {
    if (this.done || this.roundComplete) return 'correct';
    if (correct) {
      this.nextStep();
      return 'correct';
    }
    this.wrongs.push(wrongValue);
    this.misses += 1;
    if (this.misses < MAX_MISSES) return 'wrong';
    this.revealed = true;
    this.nextStep();
    return 'reveal';
  }

  /** The next hint rung of the live step (stays on the last one). */
  takeHint(): number {
    this.usedHint = true;
    this.hintRung = Math.min(this.hintRung + 1, HINT_RUNGS);
    return this.hintRung;
  }

  finishRound(): QuestionOutcome {
    return {
      factKey: this.round?.factKey ?? '',
      ms: Math.max(0, this.now() - this.startedAt),
      correct: !this.revealed,
      firstTry: this.wrongs.length === 0,
      usedHint: this.usedHint,
      wrongAnswers: [...this.wrongs],
    };
  }

  next(): void {
    this.index += 1;
    this.stepIndex = 0;
    this.misses = 0;
    this.hintRung = 0;
    this.wrongs = [];
    this.usedHint = false;
    this.revealed = false;
    this.startedAt = this.now();
  }

  private nextStep(): void {
    this.stepIndex += 1;
    this.misses = 0;
    this.hintRung = 0;
  }
}
