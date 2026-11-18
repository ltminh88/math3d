// The city's reasoning round (phase 04): once tables 6-9 are known, the last delivery is a parcel
// puzzle — "gấp mấy lần?" (wp-times-compare) or the missing number (unknown-mul-div, "? × 7 =
// 56") — on the step kit (choice + pad). The run keeps its six rounds. Planning lives in
// city-stage-plan.ts (phase 05); this file only mounts the round.
import type { LevelContext } from '../shared/level-types';
import { mountReasoningRound } from '../shared/reasoning-round-panel';
import type { ReasoningRoundPlan } from '../shared/reasoning-round-slot';
import type { CityPanel } from './city-panel';
import type { CityRoundController } from './city-round-controller';
import type { CityStrings } from './city-strings';
import type { CityRun } from './city-stage-plan';

/** Shows the parcel puzzle; the city panel gives way and the controller's tally counts it. */
export function startCityReasoningRound(
  ctx: LevelContext,
  ts: CityStrings,
  panel: CityPanel,
  controller: CityRoundController,
  run: CityRun & { reasoning: ReasoningRoundPlan },
  onNext: () => void,
): void {
  panel.hide();
  panel.say(ts('reasoningLine'));
  const round = mountReasoningRound({
    ui: ctx.ui,
    signal: ctx.disposer.signal,
    audio: ctx.audio,
    announce: ctx.announce,
    plan: run.reasoning,
    eyebrow: ts('round', { n: run.total, total: run.total }).toUpperCase(),
    title: ts('reasoningTitle'),
    onRecorded: (outcome) => {
      ctx.learning.record(outcome);
      return controller.tally.add(outcome);
    },
    nextLabel: ts('next'),
    onNext: () => {
      round.destroy();
      onNext();
    },
  });
}
