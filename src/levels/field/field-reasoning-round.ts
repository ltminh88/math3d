// The field's reasoning round (phase 04): once the tables are known, the last patch is a word
// problem about rows of plants ("mỗi luống 6 cây, gấp 4 lần…") or a skip-count pattern, answered
// with the step kit. The run keeps its five patches; a fresh profile never gets one.
import { mulFactsForTables } from '../../learning/curriculum-tables';
import { questionReward } from '../../learning/scoring';
import type { LevelContext, LevelDefinition, LevelLearning } from '../shared/level-types';
import { mountReasoningRound, type ReasoningRoundPanel } from '../shared/reasoning-round-panel';
import {
  planReasoningRound,
  type ReasoningRoundPlan,
  standardFacts,
} from '../shared/reasoning-round-slot';
import type { FieldHud } from './field-hud';
import { type FieldRound, planFieldRounds } from './field-round-flow';
import type { FieldRunTally } from './field-run-tally';
import { tf } from './field-strings';

export const FIELD_REASONING_SKILLS = ['wp-times-then-add', 'pattern-skip-count'];

export interface FieldRun {
  rounds: FieldRound[];
  reasoning: ReasoningRoundPlan | null;
  /** Patches of the run, the reasoning round included. */
  total: number;
}

/** The run's rounds: the host planner picks the facts over tables 3 and 4. */
export function planFieldRun(learning: LevelLearning, definition: LevelDefinition): FieldRun {
  const facts = learning.planSession(mulFactsForTables(definition.tables), definition.rounds);
  const stats = learning.stats();
  const { rng } = learning;
  const reasoning = planReasoningRound({ stats, facts, skills: FIELD_REASONING_SKILLS, rng });
  const rounds = planFieldRounds({
    facts: standardFacts(facts, reasoning),
    boxOf: (key) => stats[key]?.box ?? 1,
    rng,
  });
  return { rounds, reasoning, total: rounds.length + (reasoning ? 1 : 0) };
}

/** Shows the reasoning round over the field; the field's own panel hides meanwhile. */
export function startFieldReasoningRound(
  ctx: LevelContext,
  hud: FieldHud,
  plan: ReasoningRoundPlan,
  tally: FieldRunTally,
  onNext: () => void,
): ReasoningRoundPanel {
  hud.panel.hidden = true;
  hud.speak(tf('reasoningLine'));
  const total = tally.score().total + 1;
  const panel = mountReasoningRound({
    ui: ctx.ui,
    signal: ctx.disposer.signal,
    audio: ctx.audio,
    announce: ctx.announce,
    plan,
    eyebrow: tf('round', { n: total, total }).toUpperCase(),
    title: tf('reasoningTitle'),
    onRecorded: (outcome) => {
      ctx.learning.record(outcome);
      tally.add(outcome);
      return questionReward(outcome);
    },
    nextLabel: tf('finish'),
    onNext: () => {
      panel.destroy();
      hud.panel.hidden = false;
      onNext();
    },
  });
  return panel;
}
