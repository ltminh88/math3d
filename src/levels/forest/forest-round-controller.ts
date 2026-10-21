// Runs the forest rounds: story setup, dealing/moving fruit, checking, answers, hints, rewards
// and the hand-over to the celebration. Rules live in sharing-model.ts and forest-round-flow.ts.
import { questionReward } from '../../learning/scoring';
import type { LevelContext } from '../shared/level-types';
import type { FactFamilyCard } from './fact-family-card';
import type { ForestCountLabels } from './forest-count-labels';
import { renderHint } from './forest-hints';
import type { ForestPanel } from './forest-panel';
import { CONCRETE_MAX_FRUIT, type ForestRound, type ForestRoundFlow } from './forest-round-flow';
import { roundTexts } from './forest-round-texts';
import type { ForestStrings } from './forest-strings';
import { type ForestTableView, zoneSpot } from './forest-table-view';
import {
  checkSharing,
  createSharing,
  dealStep,
  moveFruit,
  pileCount,
  type SharingState,
} from './sharing-model';

/** Seconds between automatic deal steps of the rung 2 model. */
const AUTO_DEAL_STEP = 0.45;

export interface ForestRoundHooks {
  /** Table layout changed (new round, fruit moved): refresh pickables, zones, chips, camera. */
  onTableChanged(snap: boolean): void;
  onLevelDone(earned: { xp: number; coins: number }): void;
}

export class ForestRoundController {
  sharing: SharingState = createSharing({ total: 2, groups: 1 });
  private idle = 0;
  private autoDeal = -1;
  private earned = { xp: 0, coins: 0 };

  constructor(
    private readonly ctx: LevelContext,
    private readonly ts: ForestStrings,
    readonly flow: ForestRoundFlow,
    private readonly panel: ForestPanel,
    private readonly card: FactFamilyCard,
    readonly table: ForestTableView,
    private readonly labels: ForestCountLabels,
    private readonly hooks: ForestRoundHooks,
  ) {}

  get round(): ForestRound | undefined {
    return this.flow.round;
  }

  /** The round is a story with fruit the child can move. */
  get interactive(): boolean {
    const round = this.round;
    return !!round && round.kind !== 'family' && !this.flow.roundComplete;
  }

  startRound(): void {
    const round = this.round;
    if (!round) return;
    const { kind, dividend: total, divisor, quotient } = round;
    this.sharing =
      kind === 'pack'
        ? createSharing({ total, groups: quotient, capacity: divisor })
        : createSharing({ total, groups: divisor });
    if (kind === 'family')
      while (pileCount(this.sharing) > 0) this.sharing = dealStep(this.sharing);
    this.table.show(
      kind === 'pack' ? 'pack' : 'share',
      this.sharing,
      true,
      total <= CONCRETE_MAX_FRUIT,
    );
    const texts = roundTexts(this.ts, round);
    this.panel.showRound(round, this.flow.index, this.flow.rounds.length, texts);
    this.card.render(round);
    this.idle = 0;
    this.autoDeal = -1;
    this.panel.panel.dataset.pile = String(pileCount(this.sharing));
    this.hooks.onTableChanged(true);
    this.ctx.announce(texts.prompt);
  }

  private changed(): void {
    this.idle = 0;
    this.panel.panel.dataset.pile = String(pileCount(this.sharing));
    this.panel.deal.disabled = pileCount(this.sharing) === 0 || this.flow.roundComplete;
    this.table.show(this.round?.kind === 'pack' ? 'pack' : 'share', this.sharing, false);
    this.hooks.onTableChanged(false);
  }

  deal(): void {
    if (!this.interactive) return;
    this.sharing = dealStep(this.sharing);
    this.ctx.audio.tone(660, 0.08);
    this.changed();
  }

  move(fruit: number, zoneId: string | null): void {
    if (this.interactive && zoneId !== null) {
      const next = moveFruit(this.sharing, fruit, zoneSpot(zoneId));
      if (next !== this.sharing) this.ctx.audio.tone(587, 0.07);
      this.sharing = next;
    }
    this.changed();
  }

  check(): void {
    if (!this.interactive) return;
    const result = checkSharing(this.sharing);
    this.labels.set(this.table.labels(this.sharing), result.marks);
    const pack = this.round?.kind === 'pack';
    const text = !result.complete
      ? this.ts('pileLeft', { n: result.pile })
      : result.equal
        ? this.ts(pack ? 'equalPack' : 'equalShare')
        : this.ts('unequal');
    this.panel.setFeedback(text, result.equal ? 'success' : 'gentle');
    if (result.equal) this.ctx.audio.tone(784, 0.2);
    else this.ctx.audio.hint();
    this.ctx.announce(text);
  }

  hint(): void {
    const round = this.round;
    if (!round || this.flow.roundComplete) return;
    const rung = this.flow.takeHint();
    const text = renderHint(this.panel.hintArea, this.ts, rung, round);
    this.panel.offerHint(false);
    this.ctx.audio.hint();
    this.ctx.announce(text);
    if (rung === 2 && this.interactive) this.autoDeal = 0;
    this.idle = 0;
  }

  submit(value: number): void {
    const round = this.round;
    if (!round) return;
    const blank = this.flow.blank;
    const result = this.flow.submit(value);
    if (result.verdict === 'ignored') return;
    this.panel.pad.clear();
    this.idle = 0;
    if (result.verdict === 'wrong') {
      this.card.shake();
      this.panel.setFeedback(this.ts('wrong'), 'gentle');
      this.panel.offerHint(this.flow.hintOffered(0));
      this.ctx.audio.hint();
      this.ctx.announce(this.ts('wrong'));
      return;
    }
    if (result.verdict === 'correct') this.card.fill(blank, value);
    else this.card.revealFrom(blank, this.flow.answers());
    if (!result.outcome) {
      this.card.setActive(this.flow.blank);
      this.panel.setFeedback(this.ts('correctBlank'), 'success');
      this.ctx.audio.tone(698, 0.12);
      return;
    }
    this.ctx.learning.record(result.outcome);
    const reward = questionReward(result.outcome);
    this.earned.xp += reward.xp;
    this.earned.coins += reward.coins;
    const equation = this.card.equationText(this.card.storyEquation(round));
    const correct = result.verdict === 'correct';
    const text = this.ts(correct ? 'correct' : 'revealed', { equation });
    this.panel.setFeedback(text, correct ? 'success' : 'gentle');
    if (reward.xp > 0)
      this.panel.popReward(this.ts('reward', { xp: reward.xp }), this.ctx.disposer.signal);
    if (correct) this.ctx.audio.correct();
    else this.ctx.audio.hint();
    this.ctx.announce(text);
    this.panel.setAnswered(true);
  }

  next(): void {
    if (!this.flow.roundComplete) return;
    this.flow.next();
    if (this.flow.done) this.hooks.onLevelDone(this.earned);
    else this.startRound();
  }

  update(dt: number): void {
    if (this.flow.done) return;
    this.idle += dt * 1000;
    if (!this.panel.hint.classList.contains('offer') && this.flow.hintOffered(this.idle)) {
      this.panel.offerHint(true);
    }
    if (this.autoDeal < 0) return;
    this.autoDeal -= dt;
    if (this.autoDeal > 0) return;
    const reduced = this.ctx.reducedMotion;
    do this.sharing = dealStep(this.sharing);
    while (reduced && pileCount(this.sharing) > 0);
    this.autoDeal = pileCount(this.sharing) > 0 ? AUTO_DEAL_STEP : -1;
    this.changed();
  }
}
