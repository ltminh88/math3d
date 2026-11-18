// The tower's reasoning floor (phase 04): once the facts are known, the top floor's stone carries
// an expression — brackets (expr-brackets), order of operations (expr-order) or Nam's claim to
// judge and fix (tf-explain, verdict then the fixed value) — on the step kit. Seven floors stay.
// Stage 4 swaps the expression line for a word-problem line, stage 5 for a remainder line.
import type { LevelContext } from '../shared/level-types';
import { mountReasoningRound } from '../shared/reasoning-round-panel';
import type { ReasoningRoundPlan } from '../shared/reasoning-round-slot';
import type { TowerPanel } from './tower-panel';
import type { TowerRoundController } from './tower-round-controller';
import type { TowerRun } from './tower-stage-plan';
import type { TowerStrings } from './tower-strings';

/** Shows the expression floor; solving it lights the top floor before the celebration. */
export function startTowerReasoningFloor(
  ctx: LevelContext,
  ts: TowerStrings,
  panel: TowerPanel,
  controller: TowerRoundController,
  run: TowerRun & { reasoning: ReasoningRoundPlan },
  hooks: { onFloorDone(floor: number): void; onNext(): void },
  stage = 1,
): void {
  panel.pad.destroy();
  panel.hide();
  panel.say(
    stage === 4 ? ts('reasoningLineS4') : stage === 5 ? ts('reasoningLineS5') : ts('reasoningLine'),
  );
  const floor = run.total - 1;
  const round = mountReasoningRound({
    ui: ctx.ui,
    signal: ctx.disposer.signal,
    audio: ctx.audio,
    announce: ctx.announce,
    plan: run.reasoning,
    eyebrow: ts('floor', { n: run.total, total: run.total }).toUpperCase(),
    title: ts('reasoningTitle'),
    onRecorded: (outcome) => {
      ctx.learning.record(outcome);
      const reward = controller.tally.add(outcome);
      hooks.onFloorDone(floor);
      return reward;
    },
    nextLabel: ts('nextTop'),
    onNext: () => {
      round.destroy();
      hooks.onNext();
    },
  });
}
