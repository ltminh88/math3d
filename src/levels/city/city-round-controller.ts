// Runs the city rounds: sets up the street or the building, turns deliveries, lit floors and pad
// entries into answers, hints, rewards and the hand-over to the celebration. Rules live in
// city-round-flow.ts and city-hints.ts.
import { createLevelRunTally } from '../shared/level-run-tally';
import type { LevelContext } from '../shared/level-types';
import type { CityBuildingView } from './city-building-view';
import { renderCityHint } from './city-hint-view';
import { cityHint } from './city-hints';
import { REVERSE_HOUSE } from './city-layout';
import type { CityPanel } from './city-panel';
import type { CityRound, CityRoundFlow } from './city-round-flow';
import { type CityStreetView, houseIndexOf } from './city-street-view';
import type { CityStrings } from './city-strings';

export interface CityRoundHooks {
  /** Props changed (new round, delivery, lit floor, hint): refresh pickables, labels, camera. */
  onChanged(newRound: boolean): void;
  onLevelDone(earned: { xp: number; coins: number }, stars: number): void;
}

export class CityRoundController {
  /** Running totals per floor (hint 3) and the band chips (hint 2) of a windows round. */
  floorSteps: readonly string[] = [];
  bandTexts: readonly [string, string] | null = null;
  private idle = 0;
  readonly tally = createLevelRunTally();

  constructor(
    private readonly ctx: LevelContext,
    private readonly ts: CityStrings,
    readonly flow: CityRoundFlow,
    private readonly panel: CityPanel,
    private readonly street: CityStreetView,
    readonly building: CityBuildingView,
    private readonly houses: { visible: boolean },
    private readonly hooks: CityRoundHooks,
  ) {}

  get round(): CityRound | undefined {
    return this.flow.round;
  }

  /** The round still takes answers. */
  get active(): boolean {
    return !!this.round && !this.flow.roundComplete;
  }

  startRound(): void {
    const round = this.round;
    if (!round) return;
    const { table: t, other: m, product: p } = round;
    const windows = round.kind === 'windows';
    this.houses.visible = !windows;
    if (windows) {
      this.street.hide();
      this.building.show(m, t);
    } else {
      this.building.hide();
      this.street.show(round);
    }
    this.floorSteps = [];
    this.bandTexts = null;
    const prompt = this.ts(`${round.kind}Prompt`, { t, m, p });
    const guide = this.ts(`${round.kind}Guide`);
    this.panel.showRound(round, this.flow.index, this.flow.total, prompt, guide);
    this.updateCount();
    this.idle = 0;
    this.hooks.onChanged(true);
    this.ctx.announce(prompt);
  }

  private updateCount(): void {
    const round = this.round;
    if (round?.kind !== 'windows') return;
    // Lit floors only: a running window total would give the answer away.
    const floors = this.building.litFloors;
    this.panel.count.textContent = this.ts('litCount', { floors, total: round.other });
    this.panel.panel.dataset.lit = String(floors);
    this.panel.light.disabled = this.building.darkFloors().length === 0 || this.flow.roundComplete;
  }

  /** Lights `floor` (or the lowest dark one) in a windows round. */
  light(floor?: number): void {
    const round = this.round;
    if (!this.active || round?.kind !== 'windows') return;
    const target = floor ?? this.building.darkFloors()[0];
    if (target === undefined || !this.building.light(target)) return;
    this.idle = 0;
    this.ctx.audio.tone(523 + this.building.litFloors * 40, 0.08);
    this.updateCount();
    const floors = this.building.litFloors;
    this.ctx.announce(this.ts('floorLit', { n: target + 1, floors, total: round.other }));
    this.hooks.onChanged(false);
  }

  /** A parcel was dropped (drag, tap or keyboard) on a house zone, or missed (`zoneId` null). */
  drop(parcel: number, zoneId: string | null): void {
    const round = this.round;
    if (!round || !this.active || zoneId === null) {
      this.street.returnHome(parcel);
      this.hooks.onChanged(false);
      return;
    }
    const house = houseIndexOf(zoneId);
    const value = round.kind === 'reverse' ? round.parcels[parcel]?.value : round.houses[house];
    if (value === undefined) return;
    this.answer(value, { parcel, house });
  }

  /** A house/parcel card or the number pad gave `value`. */
  answer(value: number, moved?: { parcel: number; house: number }): void {
    const round = this.round;
    if (!round) return;
    const result = this.flow.submit(value);
    if (result.verdict === 'ignored') return;
    this.idle = 0;
    this.panel.clearPad();
    if (round.kind !== 'windows') this.panel.choices.mark(value, result.verdict === 'correct');
    if (result.verdict === 'wrong') {
      if (moved) this.street.returnHome(moved.parcel);
      this.street.reject(value);
      this.panel.setFeedback(this.ts('wrong'), 'gentle');
      this.panel.offerHint(this.flow.hintOffered(0));
      this.ctx.audio.hint();
      this.ctx.announce(this.ts('wrong'));
      this.hooks.onChanged(false);
      return;
    }
    this.showSolution(round, moved);
    if (!result.outcome) return;
    this.ctx.learning.record(result.outcome);
    const reward = this.tally.add(result.outcome);
    const equation = `${round.table} × ${round.other} = ${round.product}`;
    const correct = result.verdict === 'correct';
    const text = this.ts(correct ? 'correct' : 'revealed', { equation });
    this.panel.setFeedback(text, correct ? 'success' : 'gentle');
    if (reward.xp > 0)
      this.panel.popReward(this.ts('reward', { xp: reward.xp }), this.ctx.disposer.signal);
    if (correct) this.ctx.audio.correct();
    else this.ctx.audio.hint();
    this.ctx.announce(text);
    this.panel.setAnswered(true);
    this.hooks.onChanged(false);
  }

  /** The right parcel reaches the right house, or every floor lights up. */
  private showSolution(round: CityRound, moved?: { parcel: number; house: number }): void {
    if (round.kind === 'windows') {
      this.building.lightAll();
      this.updateCount();
    } else if (round.kind === 'reverse') {
      this.street.deliver(
        moved?.parcel ?? round.parcels.findIndex((p) => p.correct),
        REVERSE_HOUSE,
      );
    } else {
      this.street.deliver(0, moved?.house ?? round.houses.indexOf(round.product));
    }
    if (round.kind !== 'windows') this.panel.choices.mark(round.product, true);
  }

  hint(): void {
    const round = this.round;
    if (!round || !this.active) return;
    const hint = cityHint(this.flow.takeHint(), round, this.flow.tried);
    const text = renderCityHint(this.panel.hintArea, this.ts, hint);
    if (round.kind === 'windows') {
      this.building.setBands(hint.bands);
      this.bandTexts = hint.bands
        ? [`■ ${this.ts('bandFirst')}`, `● ${this.ts('bandRest', { n: hint.bands.rest })}`]
        : null;
      if (hint.steps.length > 0) this.floorSteps = hint.steps;
    }
    this.panel.offerHint(false);
    this.ctx.audio.hint();
    this.ctx.announce(text);
    this.idle = 0;
    this.hooks.onChanged(false);
  }

  next(): void {
    if (!this.flow.roundComplete) return;
    this.flow.next();
    if (this.flow.done) this.hooks.onLevelDone(this.tally.earned(), this.tally.stars());
    else this.startRound();
  }

  update(dt: number): void {
    if (this.flow.done) return;
    this.idle += dt * 1000;
    if (!this.panel.hint.classList.contains('offer') && this.flow.hintOffered(this.idle)) {
      this.panel.offerHint(true);
    }
  }
}
