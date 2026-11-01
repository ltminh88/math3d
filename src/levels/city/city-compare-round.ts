// The city's reasoning round (phase 04): once tables 6-9 are known, the last delivery is a parcel
// puzzle — "gấp mấy lần?" (wp-times-compare) or the missing number (unknown-mul-div, "? × 7 =
// 56") — on the step kit (choice + pad). The run keeps its six rounds.
import { mulFactsForTables } from '../../learning/curriculum-tables';
import type { LevelContext, LevelDefinition, LevelLearning } from '../shared/level-types';
import { mountReasoningRound } from '../shared/reasoning-round-panel';
import {
  planReasoningRound,
  type ReasoningRoundPlan,
  standardFacts,
} from '../shared/reasoning-round-slot';
import type { CityPanel } from './city-panel';
import type { CityRoundController } from './city-round-controller';
import { type CityRound, planCityRounds } from './city-round-flow';
import type { CityStrings } from './city-strings';

export const CITY_REASONING_SKILLS = ['wp-times-compare', 'unknown-mul-div'];

export interface CityRun {
  rounds: CityRound[];
  reasoning: ReasoningRoundPlan | null;
  /** Rounds of the run, the reasoning round included. */
  total: number;
}

/** The run's rounds: the host planner picks the facts over the level's tables (6-9). */
export function planCityRun(learning: LevelLearning, definition: LevelDefinition): CityRun {
  const stats = learning.stats();
  const facts = learning.planSession(mulFactsForTables(definition.tables), definition.rounds);
  const { rng } = learning;
  const reasoning = planReasoningRound({ stats, facts, skills: CITY_REASONING_SKILLS, rng });
  const rounds = planCityRounds({
    facts: standardFacts(facts, reasoning),
    boxOf: (key) => stats[key]?.box ?? 1,
    errorsOf: (key) => stats[key]?.errs ?? [],
    rng,
  });
  return { rounds, reasoning, total: rounds.length + (reasoning ? 1 : 0) };
}

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
