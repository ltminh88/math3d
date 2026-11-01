// The forest's reasoning round (phase 04): once the divisions are known, the last round shares
// fruit with leftovers — the quotient, then the remainder (div-rem-floor) or "cần mấy giỏ?" with
// the round-up (div-rem-ceil) — on the step kit. The run keeps its five rounds.
import { questionReward } from '../../learning/scoring';
import type { LevelContext, LevelDefinition, LevelLearning } from '../shared/level-types';
import { mountReasoningRound } from '../shared/reasoning-round-panel';
import {
  planReasoningRound,
  type ReasoningRoundPlan,
  standardFacts,
} from '../shared/reasoning-round-slot';
import { varyForestFacts } from './forest-fact-variety';
import type { ForestPanel } from './forest-panel';
import { type ForestRound, forestFactPool, planForestRounds } from './forest-round-flow';
import type { ForestStrings } from './forest-strings';

export const FOREST_REASONING_SKILLS = ['div-rem-floor', 'div-rem-ceil'];

export interface ForestRun {
  rounds: ForestRound[];
  reasoning: ReasoningRoundPlan | null;
  /** Rounds of the run, the reasoning round included. */
  total: number;
}

export function planForestRun(learning: LevelLearning, definition: LevelDefinition): ForestRun {
  const stats = learning.stats();
  const pool = forestFactPool(stats);
  const planned = learning.planSession(pool, definition.rounds);
  const facts = varyForestFacts(planned, pool, learning.rng);
  const reasoning = planReasoningRound({
    stats,
    facts,
    skills: FOREST_REASONING_SKILLS,
    rng: learning.rng,
  });
  const rounds = planForestRounds(standardFacts(facts, reasoning), stats);
  return { rounds, reasoning, total: rounds.length + (reasoning ? 1 : 0) };
}

/** Shows the remainder round; the forest panel (and its pad) give way to it. */
export function startForestReasoningRound(
  ctx: LevelContext,
  ts: ForestStrings,
  panel: ForestPanel,
  run: ForestRun & { reasoning: ReasoningRoundPlan },
  earned: { xp: number; coins: number },
  onNext: () => void,
): void {
  panel.pad.destroy();
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
