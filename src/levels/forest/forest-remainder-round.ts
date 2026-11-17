// The forest's reasoning round (phase 04): once the divisions are known, the last round shares
// fruit with leftovers — the quotient, then the remainder (div-rem-floor) or "cần mấy giỏ?" with
// the round-up (div-rem-ceil) — on the step kit. Stage 4 swaps the remainder puzzle for word
// problems in division contexts; the run keeps its five rounds.
import { questionReward } from '../../learning/scoring';
import type { LevelContext } from '../shared/level-types';
import { mountReasoningRound } from '../shared/reasoning-round-panel';
import type { ReasoningRoundPlan } from '../shared/reasoning-round-slot';
import type { ForestPanel } from './forest-panel';
import type { ForestRunTally } from './forest-run-tally';
import type { ForestRun } from './forest-stage-plan';
import type { ForestStrings } from './forest-strings';

/**
 * Shows the reasoning round; the forest panel (and its pad) give way to it. Stage 4 swaps the
 * remainder line for the word-problem line (the title fits both). The outcome counts toward
 * the run's stars through the tally, like the standard rounds.
 */
export function startForestReasoningRound(
  ctx: LevelContext,
  ts: ForestStrings,
  panel: ForestPanel,
  run: ForestRun & { reasoning: ReasoningRoundPlan },
  earned: { xp: number; coins: number },
  onNext: () => void,
  tally: ForestRunTally,
  stage = 1,
): void {
  panel.pad.destroy();
  panel.hide();
  panel.say(stage === 4 ? ts('reasoningLineS4') : ts('reasoningLine'));
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
      tally.add(outcome);
      const reward = questionReward(outcome);
      earned.xp += reward.xp;
      earned.coins += reward.coins;
      return reward;
    },
    nextLabel: ts('next'),
    onNext: () => {
      round.destroy();
      onNext();
    },
  });
}
