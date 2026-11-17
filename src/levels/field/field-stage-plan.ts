// Stage plan for the field (phase 03, pure, seeded): which formats a stage drills, which
// reasoning skills it may use, and whether its reasoning round is forced, gated as today,
// or skipped. Stage 1 is today's run; later stages reuse the same formats with a different
// mix. Tiers always come from the Leitner box, never from the stage number.
import { mulFactsForTables } from '../../learning/curriculum-tables';
import { type FactKey, parseFactKey } from '../../learning/fact-key';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  planReasoningRound,
  type ReasoningRoundPlan,
  standardFacts,
} from '../shared/reasoning-round-slot';
import {
  type FieldRound,
  type FieldRoundType,
  planFieldRounds,
  RECALL_BOX,
} from './field-round-flow';

/** Reasoning skills of the field; stage 4 adds two more word-problem skills to the rotation. */
export const FIELD_REASONING_SKILLS = ['wp-times-then-add', 'pattern-skip-count'];
export const FIELD_REASONING_SKILLS_S4 = [
  ...FIELD_REASONING_SKILLS,
  'wp-more-less-then-total',
  'wp-unit-then-times',
];

export interface FieldRun {
  rounds: FieldRound[];
  reasoning: ReasoningRoundPlan | null;
  /** Patches of the run, the reasoning round included. */
  total: number;
}

/** Reasoning round in a stage: 'today' (slot-gated), 'forced' (S4), 'none' (S5, recall only). */
export type ReasoningMode = 'today' | 'forced' | 'none';

export function stageReasoningMode(stage: number): ReasoningMode {
  if (stage === 4) return 'forced';
  if (stage === 5) return 'none';
  return 'today';
}

export function stageReasoningSkills(stage: number): readonly string[] {
  return stage >= 4 ? FIELD_REASONING_SKILLS_S4 : FIELD_REASONING_SKILLS;
}

/**
 * The standard-round format for one fact in a stage. Stage 1 is today's rule (box 3+
 * recalls, odd-index non-squares take equations, the rest build); later stages lean on one
 * format each, and stage 6 rotates them. A square plot never takes equations (both orders
 * would read the same).
 */
export function stageRoundType(
  stage: number,
  fact: FactKey,
  index: number,
  box: number,
): FieldRoundType {
  const parsed = parseFactKey(fact);
  if (parsed?.op !== 'mul') throw new Error(`Field stages need multiplication facts: ${fact}`);
  const square = parsed.min === parsed.max;
  if (box >= RECALL_BOX) return 'recall';
  // A square plot can never ask for its missing factor: the shown factor would equal the
  // answer ("3 × ? = 9"), so squares build instead.
  if (square) return 'build';
  switch (stage) {
    case 2:
      return 'equations';
    case 3:
      return 'missing';
    case 4:
      return index % 2 === 0 ? 'equations' : 'missing';
    case 5:
      return 'missing';
    case 6:
      return index % 3 === 0 ? 'build' : index % 3 === 1 ? 'equations' : 'missing';
    default:
      return index % 2 === 1 ? 'equations' : 'build';
  }
}

/** The run's rounds for a stage: the host planner picks the facts over tables 3 and 4. */
export function planFieldRun(
  learning: LevelLearning,
  definition: LevelDefinition,
  stage = 1,
): FieldRun {
  const facts = learning.planSession(mulFactsForTables(definition.tables), definition.rounds);
  const stats = learning.stats();
  const { rng } = learning;
  const mode = stageReasoningMode(stage);
  const reasoning =
    mode === 'none'
      ? null
      : planReasoningRound({
          stats,
          facts,
          skills: stageReasoningSkills(stage),
          rng,
          force: mode === 'forced',
        });
  const rounds = planFieldRounds({
    facts: standardFacts(facts, reasoning),
    boxOf: (key) => stats[key]?.box ?? 1,
    rng,
    typeFor: (fact, index, box) => stageRoundType(stage, fact, index, box),
  });
  return { rounds, reasoning, total: rounds.length + (reasoning ? 1 : 0) };
}
