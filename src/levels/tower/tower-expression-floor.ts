// The tower's reasoning floor (phase 04): once the facts are known, the top floor's stone carries
// an expression — brackets (expr-brackets), order of operations (expr-order) or Nam's claim to
// judge and fix (tf-explain, verdict then the fixed value) — on the step kit. Seven floors stay.
import type { FactKey } from '../../learning/fact-key';
import type { LevelContext, LevelLearning } from '../shared/level-types';
import { mountReasoningRound } from '../shared/reasoning-round-panel';
import {
  planReasoningRound,
  type ReasoningRoundPlan,
  standardFacts,
} from '../shared/reasoning-round-slot';
import type { TowerPanel } from './tower-panel';
import type { TowerQuestion } from './tower-question-formats';
import type { TowerRoundController } from './tower-round-controller';
import { planTowerFacts, planTowerQuestions, towerFactPool } from './tower-round-flow';
import type { TowerStrings } from './tower-strings';

export const TOWER_REASONING_SKILLS = ['expr-brackets', 'expr-order', 'tf-explain'];

export interface TowerRun {
  questions: TowerQuestion[];
  reasoning: ReasoningRoundPlan | null;
  /** Floors of the climb, the reasoning floor included. */
  total: number;
}

export function planTowerRun(learning: LevelLearning, floors: number): TowerRun {
  const stats = learning.stats();
  const { rng } = learning;
  const planned = learning.planSession(towerFactPool(), floors);
  const facts: FactKey[] = planTowerFacts(planned, stats, rng, floors);
  const reasoning = planReasoningRound({ stats, facts, skills: TOWER_REASONING_SKILLS, rng });
  const questions = planTowerQuestions(standardFacts(facts, reasoning), stats, rng);
  return { questions, reasoning, total: questions.length + (reasoning ? 1 : 0) };
}

/** Shows the expression floor; solving it lights the top floor before the celebration. */
export function startTowerReasoningFloor(
  ctx: LevelContext,
  ts: TowerStrings,
  panel: TowerPanel,
  controller: TowerRoundController,
  run: TowerRun & { reasoning: ReasoningRoundPlan },
  hooks: { onFloorDone(floor: number): void; onNext(): void },
): void {
  panel.pad.destroy();
  panel.hide();
  panel.say(ts('reasoningLine'));
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
