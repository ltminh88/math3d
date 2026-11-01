// Runs the garden: per round a kit step card for the item (number pad, seed packets, "which part
// first?" choices), the flow's verdicts (three misses reveal the round), hints, rewards and the
// round's 3D reply (a flower grows, the balance levels, a sprout pushes out of its bag). Rules
// live in garden-round-flow.ts, garden-round-plan.ts and garden-hints.ts.
import { createStepCard, type StepAnswerEvent, type StepCard } from '../../ui/kit/step-card';
import { createLevelRunTally } from '../shared/level-run-tally';
import type { LevelContext } from '../shared/level-types';
import type { GardenBalanceView } from './garden-balance-view';
import { renderGardenHint } from './garden-hints';
import type { GardenPanel } from './garden-panel';
import type { GardenPatternRowView } from './garden-pattern-row-view';
import type { PromptRenderer } from './garden-prompt-render';
import type { GardenRoundFlow } from './garden-round-flow';
import type { GardenKind } from './garden-round-plan';
import type { GardenSeedBagView } from './garden-seed-bag-view';
import type { GardenStrings } from './garden-strings';

export interface GardenViews {
  readonly row: GardenPatternRowView;
  readonly balance: GardenBalanceView;
  readonly bags: GardenSeedBagView;
}

export interface GardenRoundHooks {
  onLevelDone(earned: { xp: number; coins: number }, stars: number): void;
}

const GUIDE_KEYS = { pattern: 'guidePattern', balance: 'guideBalance', bag: 'guideBag' } as const;

export class GardenRoundController {
  private card: StepCard | undefined;
  private idle = 0;
  private readonly tally = createLevelRunTally();

  constructor(
    private readonly ctx: LevelContext,
    private readonly gs: GardenStrings,
    readonly flow: GardenRoundFlow,
    private readonly panel: GardenPanel,
    private readonly views: GardenViews,
    private readonly render: PromptRenderer,
    private readonly hooks: GardenRoundHooks,
  ) {}

  startRound(): void {
    const round = this.flow.round;
    if (!round) return;
    const guide = this.gs(GUIDE_KEYS[round.kind]);
    this.panel.showRound(this.flow.index, this.flow.rounds.length, round.kind, guide);
    this.showKind(round.kind);
    this.card?.destroy();
    this.card = createStepCard(round.item, {
      onAnswer: (event) => this.answer(event),
      onComplete: () => {},
      render: this.render,
      signal: this.ctx.disposer.signal,
    });
    this.panel.mountCard(this.card.element);
    this.refreshPots();
    this.idle = 0;
    this.ctx.announce(`${guide} ${this.render(round.item.story)}`);
  }

  private showKind(kind: GardenKind): void {
    const { row, balance, bags } = this.views;
    const steps = this.flow.steps;
    row.group.visible = kind === 'pattern';
    balance.group.visible = kind === 'balance';
    bags.group.visible = kind === 'bag';
    if (kind === 'pattern') row.show(this.hiddenPots());
    if (kind === 'balance') balance.tip();
    if (kind === 'bag') bags.show(steps.length);
  }

  /** 0-based pots a pattern round still asks, in step order. */
  private hiddenPots(): number[] {
    return this.flow.steps.map((s) => Number(s.prompt.params?.pos ?? 5) - 1);
  }

  private refreshPots(): void {
    const round = this.flow.round;
    if (round?.kind !== 'pattern') return;
    const hidden = this.hiddenPots();
    const open = hidden.slice(this.flow.roundComplete ? hidden.length : this.flow.stepIndex);
    const values = round.item.work.map((n, i) => (open.includes(i) ? null : n));
    this.panel.showPots(values, open[0] ?? -1);
  }

  private answer(event: StepAnswerEvent): void {
    const round = this.flow.round;
    const stepIndex = this.flow.stepIndex;
    if (!round || event.stepIndex !== stepIndex) return;
    const result = this.flow.submit(event.answer);
    if (result.verdict === 'ignored') return;
    this.idle = 0;
    if (result.verdict === 'wrong') {
      this.panel.setFeedback(this.gs('wrong'), 'gentle');
      this.panel.offerHint(this.flow.hintOffered(0));
      this.ctx.audio.hint();
      this.ctx.announce(this.gs('wrong'));
      return;
    }
    if (result.verdict === 'revealed') {
      // The card shows the remaining answers once its own handling of this try is over.
      queueMicrotask(() => {
        const card = this.card;
        while (card && card.currentStep() < this.flow.steps.length) card.reveal();
      });
    }
    const last = result.verdict === 'revealed' ? this.flow.steps.length - 1 : stepIndex;
    for (let i = stepIndex; i <= last; i++) this.stepDone(round.kind, i);
    if (!result.outcome) {
      this.panel.clearHint();
      this.panel.hint.disabled = false;
      this.panel.setFeedback(this.gs('correctStep'), 'success');
      this.ctx.audio.tone(698, 0.12);
      this.ctx.announce(this.gs('correctStep'));
      return;
    }
    this.ctx.learning.record(result.outcome);
    const reward = this.tally.add(result.outcome);
    const correct = result.verdict === 'correct';
    const text = this.gs(correct ? 'correct' : 'revealed');
    this.panel.setFeedback(text, correct ? 'success' : 'gentle');
    if (reward.xp > 0) {
      this.panel.popReward(this.gs('reward', { xp: reward.xp }), this.ctx.disposer.signal);
    }
    if (correct) this.ctx.audio.correct();
    else this.ctx.audio.hint();
    this.ctx.announce(text);
    this.panel.setAnswered(true);
  }

  /** The 3D reply to a finished step. */
  private stepDone(kind: GardenKind, stepIndex: number): void {
    if (kind === 'pattern') {
      this.views.row.bloom(this.hiddenPots()[stepIndex] ?? -1);
      this.refreshPots();
    } else if (kind === 'bag') {
      this.views.bags.sprout(stepIndex);
    } else if (stepIndex === this.flow.steps.length - 1) {
      this.views.balance.level();
    }
  }

  hint(): void {
    const round = this.flow.round;
    if (!round || this.flow.roundComplete) return;
    const rung = this.flow.takeHint();
    const text = renderGardenHint(
      this.panel.hintArea,
      this.gs,
      rung,
      round.item,
      this.flow.stepIndex,
    );
    this.panel.offerHint(false);
    // The last taught rung is shown: the button is spent until the next step.
    this.panel.hint.disabled = rung >= 4;
    this.ctx.audio.hint();
    this.ctx.announce(text);
    this.idle = 0;
  }

  next(): void {
    if (!this.flow.roundComplete) return;
    this.flow.next();
    if (this.flow.done) {
      this.card?.destroy();
      this.card = undefined;
      this.hooks.onLevelDone(this.tally.earned(), this.tally.stars());
    } else this.startRound();
  }

  /** The current step's choice buttons (seed packets, "which part first?"), for keys 1-4. */
  choiceButtons(): HTMLButtonElement[] {
    const row = this.card?.element.querySelector('.kit-step:last-child:not(.kit-step--done)');
    return [...(row?.querySelectorAll<HTMLButtonElement>('.kit-choices button') ?? [])];
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
  }
}
