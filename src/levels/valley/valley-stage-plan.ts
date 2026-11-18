// Stage plan for the valley (phase 08, pure, seeded): stage -> skill subset + tier floor.
// Stage 1 is today's run; later stages reuse the same kinds with a different mix. Tiers
// always come from the Leitner box for ordering (weakest first); a tier floor only lifts
// the generated item's tier, so the format a stage needs appears (rotated figures, the
// choose-all step), and never touches the child's box.
//
// Two honest limits of the stage table, kept here so the tests and the review can see them:
// - S2 and S4 drill two skills over six rounds, so a skill must recur across the run. The
//   planner alternates them (an unused skill always wins the cost), so no skill repeats
//   back-to-back, and every round is a fresh seeded item. "No skill twice in one run"
//   holds only where the subset is at least as large as the round count.
// - S4 is choose-all through the step kit's multi-select, which the valley already mounts
//   on the step card (the board taps toggle it, the test hook reports it). A multi step
//   appears only for geo-shape-classify at tier 2+; geo-shape-count never yields one (its
//   generator gives a choice step at tier 1, a number step at tier 2+). The tier floor of
//   2 guarantees the classify rounds are choose-all; the count rounds stay number answers.
import { GEOMETRY_SKILLS } from '../../geometry/geometry-item-for-skill';
import { skillKey } from '../../learning/fact-key';
import type { SkillTier } from '../../learning/skill-tiers';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import { planValleyRounds, type ValleyRoundSpec, valleyFactPool } from './valley-round-plan';

/** The valley has 5 stages (phase 08). */
export const VALLEY_STAGE_COUNT = 5;

/** Counting skills of stage 2 (count-right-angles + shape-count). */
export const VALLEY_COUNT_SKILLS_S2: readonly string[] = [
  'geo-count-right-angles',
  'geo-shape-count',
];
/** Rotated figures + solid parts of stage 3 (tier floor 2, so the figures rotate). */
export const VALLEY_ROTATED_SKILLS_S3: readonly string[] = [
  'geo-shape-classify',
  'geo-right-angle',
  'geo-count-right-angles',
  'geo-solid-parts',
];
/** Choose-all skills of stage 4 (tier floor 2, so classify rounds are multi-select). */
export const VALLEY_CHOOSE_ALL_SKILLS_S4: readonly string[] = [
  'geo-shape-classify',
  'geo-shape-count',
];

interface ValleyStageConfig {
  /** 'today' keeps stage 1 identical to the current run; otherwise the skill subset. */
  readonly skills: 'today' | readonly string[];
  readonly tierFloor?: SkillTier;
}

/** Stage -> config. An unknown stage plays stage 1. */
const VALLEY_STAGE_PLAN: Record<number, ValleyStageConfig> = {
  1: { skills: 'today' },
  2: { skills: VALLEY_COUNT_SKILLS_S2 },
  3: { skills: VALLEY_ROTATED_SKILLS_S3, tierFloor: 2 },
  4: { skills: VALLEY_CHOOSE_ALL_SKILLS_S4, tierFloor: 2 },
  5: { skills: [...GEOMETRY_SKILLS] },
};

export function stageConfig(stage: number): ValleyStageConfig {
  return VALLEY_STAGE_PLAN[stage] ?? (VALLEY_STAGE_PLAN[1] as ValleyStageConfig);
}

/** The skill subset a stage drills (stage 1 is today's pool; see `planValleyRun`). */
export function stageSkills(stage: number): readonly string[] {
  const skills = stageConfig(stage).skills;
  return skills === 'today' ? [...GEOMETRY_SKILLS] : [...skills];
}

/** The tier floor a stage applies (1 when the stage sets none). */
export function stageTierFloor(stage: number): SkillTier {
  return stageConfig(stage).tierFloor ?? 1;
}

export interface ValleyRun {
  readonly rounds: ValleyRoundSpec[];
}

/** The run's round specs for a stage: the host planner picks the skills over the pool. */
export function planValleyRun(
  learning: LevelLearning,
  definition: LevelDefinition,
  stage = 1,
): ValleyRun {
  const config = stageConfig(stage);
  const stats = learning.stats();
  const pool = config.skills === 'today' ? valleyFactPool(stats) : config.skills.map(skillKey);
  const planned = learning.planSession(pool, definition.rounds);
  const rounds = planValleyRounds(planned, stats, definition.rounds, {
    skills: config.skills === 'today' ? undefined : [...config.skills],
    tierFloor: config.tierFloor,
  });
  return { rounds };
}
