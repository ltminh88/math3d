// Stage plan for the forest (phase 04, pure, seeded): which kinds a stage drills, which
// reasoning skills it may use, and whether its reasoning round is forced, gated as today,
// or skipped. Stage 1 is today's run; later stages reuse the same formats with a different
// mix. Tiers always come from the Leitner box, never from the stage number.
import { type FactKey, parseFactKey } from '../../learning/fact-key';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  planReasoningRound,
  type ReasoningRoundPlan,
  standardFacts,
} from '../shared/reasoning-round-slot';
import type { AnimalKind } from './animal-friend-factory';
import { varyForestFacts } from './forest-fact-variety';
import {
  CONCRETE_MAX_FRUIT,
  FOREST_ROUND_KINDS,
  type ForestRound,
  forestFactPool,
  planForestRounds,
  type RoundKind,
  SYMBOLIC_BOX,
} from './forest-round-flow';

/** Remainder skills of the forest; stage 4 swaps them for word-problem skills. */
export const FOREST_REASONING_SKILLS = ['div-rem-floor', 'div-rem-ceil'];
/** Word problems in division contexts (stage 4). */
export const FOREST_REASONING_SKILLS_S4 = ['wp-divide-then-add', 'wp-more-less-then-total'];

export interface ForestRun {
  rounds: ForestRound[];
  reasoning: ReasoningRoundPlan | null;
  /** Rounds of the run, the reasoning round included. */
  total: number;
}

/** Reasoning round in a stage: 'today' (slot-gated), 'forced' (S2, S4), 'none' (S5). */
export type ReasoningMode = 'today' | 'forced' | 'none';

export function stageReasoningMode(stage: number): ReasoningMode {
  if (stage === 2 || stage === 4) return 'forced';
  if (stage === 5) return 'none';
  return 'today';
}

export function stageReasoningSkills(stage: number): readonly string[] {
  return stage === 4 ? FOREST_REASONING_SKILLS_S4 : FOREST_REASONING_SKILLS;
}

/**
 * The standard-round kind for one fact in a stage. Stage 1 is today's rule (box 3+ and piles
 * over 20 fruit go symbolic, the rest rotate share/pack/family); stage 3 leans on fact
 * families and stage 5 is symbolic only (no fruit dealing in either), so both plan family
 * rounds for every fact. A fact's box, not its stage, decides whether it is symbolic.
 */
export function stageRoundKind(
  stage: number,
  fact: FactKey,
  index: number,
  box: number,
): RoundKind {
  const parsed = parseFactKey(fact);
  if (parsed?.op !== 'div') throw new Error(`Forest stages need division facts: ${fact}`);
  if (box >= SYMBOLIC_BOX || parsed.dividend > CONCRETE_MAX_FRUIT) return 'family';
  if (stage === 3 || stage === 5) return 'family';
  return FOREST_ROUND_KINDS[index % FOREST_ROUND_KINDS.length] as RoundKind;
}

/** Friends taking part, rotated by stage: the same five friends, a different one first. */
const STAGE_ANIMALS: readonly AnimalKind[] = ['rabbit', 'squirrel', 'fox', 'hedgehog', 'bear'];

export function stageAnimalOrder(stage: number): readonly AnimalKind[] {
  const shift =
    (((stage - 1) % STAGE_ANIMALS.length) + STAGE_ANIMALS.length) % STAGE_ANIMALS.length;
  return [...STAGE_ANIMALS.slice(shift), ...STAGE_ANIMALS.slice(0, shift)];
}

/** The run's rounds for a stage: the host planner picks the facts over tables 2 to 5. */
export function planForestRun(
  learning: LevelLearning,
  definition: LevelDefinition,
  stage = 1,
): ForestRun {
  const stats = learning.stats();
  const pool = forestFactPool(stats);
  const planned = learning.planSession(pool, definition.rounds);
  const facts = varyForestFacts(planned, pool, learning.rng);
  const mode = stageReasoningMode(stage);
  const reasoning =
    mode === 'none'
      ? null
      : planReasoningRound({
          stats,
          facts,
          skills: stageReasoningSkills(stage),
          rng: learning.rng,
          force: mode === 'forced',
        });
  const rounds = planForestRounds(standardFacts(facts, reasoning), stats, (fact, index, box) =>
    stageRoundKind(stage, fact, index, box),
  );
  return { rounds, reasoning, total: rounds.length + (reasoning ? 1 : 0) };
}
