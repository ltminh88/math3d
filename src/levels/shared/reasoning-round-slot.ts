// When an old level (field, forest, city, tower) plays its one reasoning round (pure; phases
// 05-08 do not use it). Only once the child knows the run's facts (3+ of them in Leitner box 3+)
// or has met one of the level's reasoning skills before, so a fresh profile and the seeded parity
// playthrough never see one. The round takes the last slot: the run keeps its length.
import { type FactKey, skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import type { Rng } from '../../learning/seeded-rng';
import { type SkillTier, skillTierOf } from '../../learning/skill-tiers';
import { reasoningItemForSkill } from '../../reasoning/reasoning-item-for-skill';
import type { ReasoningItem } from '../../reasoning/reasoning-types';

export const MASTERED_BOX = 3;
export const MIN_MASTERED_FACTS = 3;

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

export function reasoningSlot(
  stats: Stats,
  facts: readonly FactKey[],
  skills: readonly string[],
): boolean {
  if (facts.length < 2) return false;
  const mastered = facts.filter((k) => (stats[k]?.box ?? 0) >= MASTERED_BOX).length;
  const seen = skills.some((id) => (stats[skillKey(id)]?.attempts ?? 0) > 0);
  return mastered >= MIN_MASTERED_FACTS || seen;
}

/** Skills take turns: the one seen least, list order on ties. */
export function chooseReasoningSkill(stats: Stats, skills: readonly string[]): string {
  const attempts = (id: string) => stats[skillKey(id)]?.attempts ?? 0;
  const first = skills[0];
  if (first === undefined) throw new Error('reasoning round: no skills');
  return skills.reduce((best, id) => (attempts(id) < attempts(best) ? id : best), first);
}

export interface ReasoningRoundPlan {
  readonly skillId: string;
  readonly tier: SkillTier;
  /** `sk:<skillId>`: what the round is recorded under. */
  readonly factKey: FactKey;
  readonly item: ReasoningItem;
}

export interface PlanReasoningInput {
  stats: Stats;
  /** The run's planned facts (before the reasoning round takes the last slot). */
  facts: readonly FactKey[];
  skills: readonly string[];
  rng: Rng;
}

/** The run's reasoning round, or null; the rng is only used when there is one. */
export function planReasoningRound(input: PlanReasoningInput): ReasoningRoundPlan | null {
  const { stats, facts, skills, rng } = input;
  if (!reasoningSlot(stats, facts, skills)) return null;
  const skillId = chooseReasoningSkill(stats, skills);
  const factKey = skillKey(skillId);
  const tier = skillTierOf(stats[factKey]);
  return { skillId, tier, factKey, item: reasoningItemForSkill(skillId, rng, tier) };
}

/** Facts of the standard rounds: the last one gives way to the reasoning round. */
export const standardFacts = (
  facts: readonly FactKey[],
  plan: ReasoningRoundPlan | null,
): FactKey[] => (plan ? facts.slice(0, -1) : [...facts]);
