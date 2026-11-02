// Runs the orders: builds each round's board and step card (answers by taps or keys through the
// kit), counts misses into hints and the reveal, records the `sk:` outcome with its reward, and
// hands over to the celebration after the last order. Rules live in workshop-round-flow.ts.
import { renderMeasurementPrompt } from '../../measurement/measurement-strings';
import type { StepAnswer } from '../../reasoning/reasoning-step-answers';
import { playableSteps } from '../../reasoning/reasoning-step-answers';
import { createStepCard, type StepAnswerEvent, type StepCard } from '../../ui/kit/step-card';
import { createLevelRunTally } from '../shared/level-run-tally';
import type { LevelContext } from '../shared/level-types';
import { createWorkshopBoard, type WorkshopBoard } from './workshop-board';
import type { WorkshopHintStrings } from './workshop-hint-strings';
import { misconceptionNote, workshopHint } from './workshop-hints';
import type { WorkshopPanel } from './workshop-panel';
import type { WorkshopRoundFlow } from './workshop-round-flow';
import type { WorkshopRound } from './workshop-round-plan';
import type { WorkshopStrings } from './workshop-strings';
import type { WorkshopTileGrid } from './workshop-tile-grid';

export interface WorkshopRoundHooks {
  onRound(round: WorkshopRound): void;
  onTiles(grids: readonly WorkshopTileGrid[]): void;
  onLevelDone(earned: { xp: number; coins: number }, stars: number): void;
}

const GUIDE = {
  ruler: 'guideRuler',
  fence: 'guideFence',
  tiles: 'guideTiles',
  balance: 'guideBalance',
  jug: 'guideJug',
  thermometer: 'guideThermometer',
} as const;

export class WorkshopRoundController {
  board: WorkshopBoard | null = null;
  card: StepCard | null = null;
  private readonly tally = createLevelRunTally();

  constructor(
    private readonly ctx: LevelContext,
    private readonly ws: WorkshopStrings,
    private readonly hs: WorkshopHintStrings,
    readonly flow: WorkshopRoundFlow,
    private readonly panel: WorkshopPanel,
    private readonly hooks: WorkshopRoundHooks,
  ) {}

  startRound(): void {
    const round = this.flow.round;
    if (!round) return;
    this.clear();
    this.board = createWorkshopBoard(round, this.ws, (grids) => this.hooks.onTiles(grids));
    this.card = createStepCard(round.item, {
      render: renderMeasurementPrompt,
      onAnswer: (event) => this.onAnswer(round, event),
      signal: this.ctx.disposer.signal,
      onComplete: () => this.finishRound(),
    });
    this.panel.boardHost.replaceChildren(this.board.element);
    this.panel.cardHost.replaceChildren(this.card.element);
    const guide =
      round.station === 'tiles' && !round.tiling ? 'guideTilesFormula' : GUIDE[round.station];
    this.panel.showRound(this.flow.index, this.flow.rounds.length, round.station, this.ws(guide));
    this.hooks.onRound(round);
    this.ctx.announce(renderMeasurementPrompt(round.item.story));
  }

  private onAnswer(round: WorkshopRound, event: StepAnswerEvent): void {
    const step = playableSteps(round.item)[event.stepIndex];
    const result = this.flow.answer(event.correct, wrongValue(step, event.answer));
    if (result === 'correct') {
      if (this.flow.roundComplete) return;
      this.panel.clearHint();
      this.panel.setFeedback(this.ws('correctStep'), 'success');
      this.ctx.audio.tone(698, 0.12);
      return;
    }
    if (result === 'reveal') {
      // After the card has handled this try (its "try again" and pad reset), as in the garden.
      const card = this.card;
      queueMicrotask(() => {
        if (!card || card !== this.card) return;
        card.reveal();
        if (!this.flow.roundComplete) {
          this.panel.clearHint();
          this.panel.setFeedback(this.ws('revealed'), 'gentle');
        }
      });
      return;
    }
    const chosen =
      step && (step.kind === 'choice' || step.kind === 'multi')
        ? step.options.find((o) => o.id === event.answer)
        : undefined;
    const note = misconceptionNote(chosen?.misconception);
    const text = note ? this.hs(note.key as never) : this.ws('wrong');
    this.panel.setFeedback(text, 'gentle');
    this.panel.offerHint(true);
    this.ctx.audio.hint();
    this.ctx.announce(text);
  }

  hint(): void {
    const round = this.flow.round;
    if (!round || this.flow.roundComplete) return;
    const rung = this.flow.takeHint();
    const ref = workshopHint(round.item, rung, this.flow.stepIndex);
    const text = this.hs(ref.key as never, ref.params);
    this.panel.offerHint(false);
    this.panel.showHint(rung, text);
    // The last rung is shown: the button rests until the next step.
    this.panel.hint.disabled = rung >= 3;
    this.ctx.audio.hint();
    this.ctx.announce(text);
  }

  private finishRound(): void {
    const outcome = this.flow.finishRound();
    this.ctx.learning.record(outcome);
    const reward = this.tally.add(outcome);
    const text = this.ws(outcome.correct ? 'correct' : 'revealed');
    this.panel.clearHint();
    this.panel.setFeedback(text, outcome.correct ? 'success' : 'gentle');
    if (reward.xp > 0)
      this.panel.popReward(this.ws('reward', { xp: reward.xp }), this.ctx.disposer.signal);
    if (outcome.correct) this.ctx.audio.correct();
    else this.ctx.audio.hint();
    this.ctx.announce(text);
    this.panel.setAnswered(true);
  }

  next(): void {
    if (!this.flow.roundComplete) return;
    this.flow.next();
    if (!this.flow.done) {
      this.startRound();
      return;
    }
    this.clear();
    this.hooks.onLevelDone(this.tally.earned(), this.tally.stars());
  }

  walkNext(): void {
    this.board?.walkNext();
  }

  placeRow(): void {
    this.board?.placeRow();
  }

  /** Removes the board and the step card (and the card's key listener). */
  clear(): void {
    this.card?.destroy();
    this.card = null;
    this.board?.element.remove();
    this.board = null;
  }
}

/** A wrong try as a number for the error bank: the typed number, a choice's quantity, else 0. */
function wrongValue(
  step: ReturnType<typeof playableSteps>[number] | undefined,
  answer: StepAnswer,
) {
  if (typeof answer === 'number') return Math.max(0, Math.min(answer, 999));
  if (step && step.kind === 'choice') {
    const n = step.options.find((o) => o.id === answer)?.label.params?.n;
    if (typeof n === 'number') return n;
  }
  return 0;
}
