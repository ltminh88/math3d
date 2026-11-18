// Stage plan for the tower (phase 06, pure, seeded): which formats a stage drills, which
// reasoning skills it may use, and whether its reasoning round is forced or slot-gated.
// Stage 1 is today's run; later stages reuse the same formats with a different mix. Tiers
// always come from the Leitner box, never from the stage number. The plan maps stage to
// its config, so the 7th-stage contingency (phase 00) is one more table row plus strings.
import type { FactKey } from '../../learning/fact-key';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  planReasoningRound,
  type ReasoningRoundPlan,
  standardFacts,
} from '../shared/reasoning-round-slot';
import type { TowerFormat, TowerQuestion } from './tower-question-formats';
import { planTowerFacts, planTowerQuestions, towerFactPool } from './tower-round-flow';

/** The expression stone of today: brackets, order of operations, or Nam's claim to judge. */
export const TOWER_REASONING_SKILLS = ['expr-brackets', 'expr-order', 'tf-explain'];
/** Word problems of stage 4 (and the mastery review of stage 6). */
export const TOWER_WORD_SKILLS_S4 = [
  'wp-times-then-add',
  'wp-divide-then-add',
  'wp-more-less-then-total',
];
/** The remainder floors of stage 5: forced, same wiring as stage 4, one skill list. */
export const TOWER_REM_SKILLS_S5 = ['div-rem-floor', 'div-rem-ceil'];

export interface TowerRun {
  questions: TowerQuestion[];
  reasoning: ReasoningRoundPlan | null;
  /** Floors of the climb, the reasoning floor included. */
  total: number;
}

/** Reasoning round in a stage: 'today' (slot-gated), 'forced' (S2, S4, S5). */
export type ReasoningMode = 'today' | 'forced';

export function stageReasoningMode(stage: number): ReasoningMode {
  if (stage === 2 || stage === 4 || stage === 5) return 'forced';
  return 'today';
}

export function stageReasoningSkills(stage: number): readonly string[] {
  if (stage === 4) return TOWER_WORD_SKILLS_S4;
  if (stage === 5) return TOWER_REM_SKILLS_S5;
  return TOWER_REASONING_SKILLS;
}

/**
 * Stage 3 drills the true/false floors: every floor asks for a verdict, then the result.
 * Every other stage keeps today's rotation (undefined), so stage 1's rng order is untouched.
 */
export function stageForcedFormat(stage: number): TowerFormat | undefined {
  return stage === 3 ? 'truefalse' : undefined;
}

/** The run's floors for a stage: the host planner picks the facts over tables 2-9. */
export function planTowerRun(
  learning: LevelLearning,
  definition: LevelDefinition,
  stage = 1,
): TowerRun {
  const stats = learning.stats();
  const { rng } = learning;
  const planned = learning.planSession(towerFactPool(), definition.rounds);
  const facts: FactKey[] = planTowerFacts(planned, stats, rng, definition.rounds);
  const mode = stageReasoningMode(stage);
  const reasoning = planReasoningRound({
    stats,
    facts,
    skills: stageReasoningSkills(stage),
    rng,
    force: mode === 'forced',
  });
  const forced = stageForcedFormat(stage);
  const questions = planTowerQuestions(
    standardFacts(facts, reasoning),
    stats,
    rng,
    forced ? () => forced : undefined,
  );
  return { questions, reasoning, total: questions.length + (reasoning ? 1 : 0) };
}
