// Stage plan for the city (phase 05, pure, seeded): which kinds a stage drills, which
// reasoning skills it may use, and whether its reasoning round is forced or slot-gated.
// Stage 1 is today's run; later stages reuse the same kinds with a different mix. Tiers
// always come from the Leitner box, never from the stage number. The plan maps stage to
// its config, so the 7th-stage contingency (phase 00) is one more table row plus strings.
import { mulFactsForTables } from '../../learning/curriculum-tables';
import { type FactKey, parseFactKey } from '../../learning/fact-key';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  planReasoningRound,
  type ReasoningRoundPlan,
  standardFacts,
} from '../shared/reasoning-round-slot';
import { type CityRound, type CityRoundKind, planCityRounds, REVERSE_BOX } from './city-round-flow';

/** The parcel puzzle of today: "gấp mấy lần?" or the missing number. */
export const CITY_REASONING_SKILLS = ['wp-times-compare', 'unknown-mul-div'];
/** Word problems of stage 4 (and the mastery review of stage 6). */
export const CITY_WORD_SKILLS_S4 = ['wp-times-then-add', 'wp-unit-then-times', 'wp-times-compare'];
/** The two-step delivery of stage 5: one skill only, slot-gated (risk table). */
export const CITY_TWO_STEP_SKILLS_S5 = ['wp-times-then-add'];

export interface CityRun {
  rounds: CityRound[];
  reasoning: ReasoningRoundPlan | null;
  /** Rounds of the run, the reasoning round included. */
  total: number;
}

/** Reasoning round in a stage: 'today' (slot-gated), 'forced' (S3, S4). */
export type ReasoningMode = 'today' | 'forced';

type StageKindMix = 'today' | 'reverse' | 'deliver' | 'rotate';

interface CityStageConfig {
  readonly mode: ReasoningMode;
  readonly skills: readonly string[];
  readonly kind: StageKindMix;
}

/** Stage → config. S7 (contingency) is one more row here, not a redesign. */
const STAGE_1: CityStageConfig = {
  mode: 'today',
  skills: CITY_REASONING_SKILLS,
  kind: 'today',
};
const CITY_STAGE_PLAN: Record<number, CityStageConfig> = {
  1: STAGE_1,
  2: { mode: 'today', skills: CITY_REASONING_SKILLS, kind: 'reverse' },
  3: { mode: 'forced', skills: CITY_REASONING_SKILLS, kind: 'today' },
  4: { mode: 'forced', skills: CITY_WORD_SKILLS_S4, kind: 'today' },
  5: { mode: 'today', skills: CITY_TWO_STEP_SKILLS_S5, kind: 'deliver' },
  6: { mode: 'today', skills: CITY_WORD_SKILLS_S4, kind: 'rotate' },
};

function stageConfig(stage: number): CityStageConfig {
  return CITY_STAGE_PLAN[stage] ?? STAGE_1;
}

export function stageReasoningMode(stage: number): ReasoningMode {
  return stageConfig(stage).mode;
}

export function stageReasoningSkills(stage: number): readonly string[] {
  return stageConfig(stage).skills;
}

/**
 * The standard-round kind for one fact in a stage. Known facts (box 3+) are always
 * reverse deliveries, in every stage — the city's "known" format, like the field's
 * recall. Stage 1 is today's rule (box 3+ reverse, otherwise deliver/windows by
 * index); later stages lean on one kind each, and stage 6 rotates them.
 */
export function stageRoundKind(
  stage: number,
  fact: FactKey,
  index: number,
  box: number,
): CityRoundKind {
  const parsed = parseFactKey(fact);
  if (parsed?.op !== 'mul') throw new Error(`City stages need multiplication facts: ${fact}`);
  if (box >= REVERSE_BOX) return 'reverse';
  switch (stageConfig(stage).kind) {
    case 'reverse':
      return 'reverse';
    case 'deliver':
      return 'deliver';
    case 'rotate':
      return index % 3 === 0 ? 'deliver' : index % 3 === 1 ? 'windows' : 'reverse';
    default:
      return index % 2 === 0 ? 'deliver' : 'windows';
  }
}

/** The run's rounds for a stage: the host planner picks the facts over tables 6-9. */
export function planCityRun(
  learning: LevelLearning,
  definition: LevelDefinition,
  stage = 1,
): CityRun {
  const stats = learning.stats();
  const facts = learning.planSession(mulFactsForTables(definition.tables), definition.rounds);
  const { rng } = learning;
  const mode = stageReasoningMode(stage);
  const reasoning = planReasoningRound({
    stats,
    facts,
    skills: stageReasoningSkills(stage),
    rng,
    force: mode === 'forced',
  });
  const rounds = planCityRounds({
    facts: standardFacts(facts, reasoning),
    boxOf: (key) => stats[key]?.box ?? 1,
    errorsOf: (key) => stats[key]?.errs ?? [],
    rng,
    kindFor: (fact, index, box) => stageRoundKind(stage, fact, index, box),
  });
  return { rounds, reasoning, total: rounds.length + (reasoning ? 1 : 0) };
}
