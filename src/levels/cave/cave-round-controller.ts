// Runs the cave: chamber setup with the kit step card (number pad, choices, toggles + Xong,
// Đúng/Sai), answers checked by the round flow, hints, the reveal after three misses, rewards,
// lighting the crystal and walking on, then the hand-over to the celebration.
import type { QuestionOutcome } from '../../learning/session-recorder';
import { createStepCard, type StepAnswerEvent, type StepCard } from '../../ui/kit/step-card';
import { createLevelRunTally } from '../shared/level-run-tally';
import type { LevelContext } from '../shared/level-types';
import type { CaveFormat } from './cave-chamber-formats';
import { caveHintText, renderOf } from './cave-hints';
import type { CavePanel } from './cave-panel';
import { CAVE_LAST_RUNG, type CaveRoundFlow } from './cave-round-flow';
import type { CaveStrings } from './cave-strings';

export interface CaveRoundHooks {
  /** Chamber `i` (0-based) is finished: light its crystal and walk to the next one. */
  onChamberDone(i: number): void;
  onLevelDone(earned: { xp: number; coins: number }, stars: number): void;
}

type CaveKey = Parameters<CaveStrings>[0];
const FORMAT_TEXT: Readonly<Record<CaveFormat, readonly [CaveKey, CaveKey]>> = {
  word: ['formatWord', 'guideWord'],
  remainder: ['formatRemainder', 'guideRemainder'],
  'choose-all': ['formatChooseAll', 'guideChooseAll'],
  'tf-explain': ['formatTf', 'guideTf'],
  expression: ['formatExpression', 'guideExpression'],
  'geo-meas': ['formatGeoMeas', 'guideGeoMeas'],
};

export class CaveRoundController {
  private idle = 0;
  private card: StepCard | null = null;
  private readonly tally = createLevelRunTally();

  constructor(
    private readonly ctx: LevelContext,
    private readonly cs: CaveStrings,
    readonly flow: CaveRoundFlow,
    private readonly panel: CavePanel,
    private readonly hooks: CaveRoundHooks,
  ) {}

  /** The chamber's step card (keys reach its buttons through it). */
  get cardElement(): HTMLElement | null {
    return this.card?.element ?? null;
  }

  startRound(): void {
    const chamber = this.flow.chamber;
    if (!chamber) return;
    const [title, guide] = FORMAT_TEXT[chamber.format];
    const total = this.flow.chambers.length;
    this.panel.showChamber(this.flow.index, total, chamber.format, this.cs(title), this.cs(guide));
    this.card?.destroy();
    const render = renderOf(chamber.family);
    this.card = createStepCard(chamber.item, {
      onAnswer: (event) => this.answer(event),
      onComplete: () => {},
      render,
    });
    this.panel.cardHost.replaceChildren(this.card.element);
    this.idle = 0;
    this.ctx.announce(`${this.cs(title)}. ${render(chamber.item.story)}`);
  }

  private answer(event: StepAnswerEvent): void {
    const chamber = this.flow.chamber;
    if (!chamber) return;
    const result = this.flow.answer(event.answer);
    if (result.verdict === 'ignored') return;
    this.idle = 0;
    if (result.verdict === 'wrong') {
      this.panel.setFeedback(this.cs('wrong'), 'gentle');
      this.panel.offerHint(this.flow.hintOffered(0));
      this.ctx.audio.hint();
      this.ctx.announce(this.cs('wrong'));
      return;
    }
    if (result.verdict === 'revealed') {
      // After the card has handled this try: show every remaining step's answer.
      const card = this.card;
      queueMicrotask(() => {
        while (card && card.currentStep() < chamber.steps.length) card.reveal();
      });
    }
    if (!result.outcome) {
      this.panel.setFeedback(this.cs('correctStep'), 'success');
      this.ctx.audio.tone(698, 0.12);
      return;
    }
    this.finishChamber(result.verdict === 'correct', result.outcome);
  }

  private finishChamber(correct: boolean, outcome: QuestionOutcome): void {
    this.ctx.learning.record(outcome);
    const reward = this.tally.add(outcome);
    const text = this.cs(correct ? 'correct' : 'revealed');
    this.panel.setFeedback(text, correct ? 'success' : 'gentle');
    if (reward.xp > 0) {
      this.panel.popReward(this.cs('reward', { xp: reward.xp }), this.ctx.disposer.signal);
    }
    if (correct) this.ctx.audio.correct();
    else this.ctx.audio.hint();
    this.hooks.onChamberDone(this.flow.index);
    this.ctx.announce(`${text} ${this.cs('lit', { n: this.flow.index + 1 })}`);
    this.panel.setAnswered(true);
  }

  hint(): void {
    const chamber = this.flow.chamber;
    if (!chamber || this.flow.roundComplete) return;
    const rung = this.flow.takeHint();
    const text = caveHintText(this.cs, rung, chamber, this.flow.stepIndex);
    this.panel.showHint(rung, text);
    this.panel.offerHint(false);
    // The last taught rung is shown: the button is spent until the next chamber.
    this.panel.hint.disabled = rung >= CAVE_LAST_RUNG;
    this.ctx.audio.hint();
    this.ctx.announce(text);
    this.idle = 0;
  }

  next(): void {
    if (!this.flow.roundComplete) return;
    this.flow.next();
    if (this.flow.done) {
      this.card?.destroy();
      this.card = null;
      this.hooks.onLevelDone(this.tally.earned(), this.tally.stars());
    } else this.startRound();
  }

  update(dt: number): void {
    if (this.flow.done) return;
    this.idle += dt * 1000;
    if (!this.panel.hint.classList.contains('offer') && this.flow.hintOffered(this.idle)) {
      this.panel.offerHint(true);
    }
  }

  destroy(): void {
    this.card?.destroy();
    this.card = null;
  }
}
