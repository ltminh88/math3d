// Stage plan for the numberfort (phase 20, pure, seeded): which skills a stage drills.
// Stages follow the textbook order — 1 numbers to 10 000 + compare, 2 rounding + Roman,
// 3 +/−/×/: within 10 000, 4 numbers to 100 000, 5 +/−/×/: within 100 000 + mix — so a
// stage never introduces a skill from another stage's range. Tiers always come from the
// Leitner box, never from the stage number. Stages 2–5 re-select from the attempted pool
// weakest-first (as in the market); unlike the market's stage 5 (four families), the
// numberfort mix interleaves the two 100 000 groups (stage-4 numbers + stage-5 arithmetic),
// so the final stage always holds both. The fallback tops up from the stage's own family
// instead of today's plan, so a stage always plays its range even when the attempted pool
// is small (stage 4 has only four number skills for six rounds, so skills repeat —
// round-robin, never twice in a row while the pool holds two or more).

import { type FactKey, skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { skillTierOf } from '../../learning/skill-tiers';
import { itemForSkill } from '../../practice/item-for-skill';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import type { ReasoningRoundPlan } from '../shared/reasoning-round-slot';
import { withBugChoiceRound } from './numberfort-bug-choice-slots';

/** Rounds per numberfort run (a lesson run is six items, as in "Ôn theo bài"). */
export const NUMBERFORT_ROUNDS = 6;

/** Numbers to 10 000 + compare (B1, B45, B46). */
export const NUMBERFORT_TEN_THOUSAND_SKILLS: readonly string[] = [
  'num-read-write-1000',
  'num-place-value-1000',
  'num-neighbors-1000',
  'num-compare-1000',
  'num-order-1000',
  'num-sequence-1000',
  'num-read-write-10000',
  'num-place-value-10000',
  'num-compare-10000',
  'num-order-10000',
] as const;

/** Rounding + Roman numerals (B47, B48, B61). */
export const NUMBERFORT_ROUNDING_ROMAN_SKILLS: readonly string[] = [
  'round-tens',
  'round-hundreds',
  'round-thousands',
  'round-ten-thousands',
  'round-which-place',
  'roman-to-number',
  'number-to-roman',
  'roman-sequence',
] as const;

/** +/−/×/: within 10 000 (B54, B55, B56, B57). */
export const NUMBERFORT_TEN_THOUSAND_ARITHMETIC_SKILLS: readonly string[] = [
  'add-4digit',
  'sub-4digit',
  'add-sub-10000-wp',
  'mul-4d-1d',
  'mul-thousands-mental',
  'div-4d-1d',
  'div-4d-1d-remainder',
  'div-thousands-mental',
  // Boost Phase 3A: one bug-choice round per stage-3 run, at the 10 000 range.
  'add-sub-10000-bug-choice',
] as const;

/** Numbers to 100 000 (B59, B60). */
export const NUMBERFORT_HUNDRED_THOUSAND_SKILLS: readonly string[] = [
  'num-read-write-100000',
  'num-expand-100000',
  'num-compare-100000',
  'num-order-100000',
] as const;

/** +/−/×/: within 100 000 (B63, B64, B70, B71). */
export const NUMBERFORT_HUNDRED_THOUSAND_ARITHMETIC_SKILLS: readonly string[] = [
  'add-5digit',
  'sub-5digit',
  'add-sub-100000-wp',
  'mul-5d-1d',
  'div-5d-1d',
  'div-5d-1d-remainder',
  'mul-div-large-wp',
  'mul-chain-operators',
  // Boost Phase 3A: one bug-choice round per stage-5 run, at the 100 000 range.
  'add-sub-100000-bug-choice',
] as const;

/** The stage's family, in catalog order (stage 5 is the mix of the two 100 000 groups). */
export const NUMBERFORT_STAGE_SKILLS: Readonly<Record<number, readonly string[]>> = {
  1: NUMBERFORT_TEN_THOUSAND_SKILLS,
  2: NUMBERFORT_ROUNDING_ROMAN_SKILLS,
  3: NUMBERFORT_TEN_THOUSAND_ARITHMETIC_SKILLS,
  4: NUMBERFORT_HUNDRED_THOUSAND_SKILLS,
  5: NUMBERFORT_HUNDRED_THOUSAND_ARITHMETIC_SKILLS,
};

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

const boxOf = (stats: Stats, id: string): number => stats[skillKey(id)]?.box ?? 1;

/** The stage's family weakest box first, ties in catalog order (deterministic). */
function rankedFamily(stats: Stats, stage: number): string[] {
  const family = NUMBERFORT_STAGE_SKILLS[stage] ?? NUMBERFORT_TEN_THOUSAND_SKILLS;
  return [...family].sort(
    (a, b) => boxOf(stats, a) - boxOf(stats, b) || family.indexOf(a) - family.indexOf(b),
  );
}

/**
 * The pool a stage picks from, in pick order. Stages 1–4 take their family weakest-first.
 * Stage 5 interleaves the two 100 000 groups (numbers, then arithmetic, weakest of each in
 * turn), so a six-round mix run always holds both instead of the first six of the catalog.
 */
function stageOrder(stats: Stats, stage: number): string[] {
  if (stage !== 5) return rankedFamily(stats, stage);
  const groups = [
    NUMBERFORT_HUNDRED_THOUSAND_SKILLS,
    NUMBERFORT_HUNDRED_THOUSAND_ARITHMETIC_SKILLS,
  ].map((family) =>
    [...family].sort(
      (a, b) => boxOf(stats, a) - boxOf(stats, b) || family.indexOf(a) - family.indexOf(b),
    ),
  );
  const order: string[] = [];
  for (let i = 0; i < Math.max(...groups.map((f) => f.length)); i++) {
    for (const family of groups) {
      const id = family[i];
      if (id !== undefined) order.push(id);
    }
  }
  return order;
}

/** Stage 1 plays the whole family; later stages play only skills the child has attempted. */
export function stagePool(stats: Stats, stage: number): readonly string[] {
  if (stage <= 1) return NUMBERFORT_STAGE_SKILLS[stage] ?? NUMBERFORT_TEN_THOUSAND_SKILLS;
  const family = NUMBERFORT_STAGE_SKILLS[stage] ?? NUMBERFORT_TEN_THOUSAND_SKILLS;
  return family.filter((id) => (stats[skillKey(id)]?.attempts ?? 0) > 0);
}

/**
 * The stage's skill ids for a run: attempted skills weakest-first, round-robin, topped up from
 * the family's unattempted skills (still weakest-first) so the run always fills its rounds
 * with the stage's range. No skill twice in a row while the pool holds two or more.
 */
export function planNumberfortStageSkills(stats: Stats, length: number, stage: number): string[] {
  const ranked = stageOrder(stats, stage);
  const attempted = ranked.filter((id) => (stats[skillKey(id)]?.attempts ?? 0) > 0);
  const pool =
    stage <= 1 ? ranked : [...attempted, ...ranked.filter((id) => !attempted.includes(id))];
  if (pool.length === 0) return [];
  const picked: string[] = [];
  let i = 0;
  while (picked.length < length) {
    const next = pool[i % pool.length];
    if (next === undefined) break;
    // Round-robin already spaces repeats; with a one-skill pool repeats are unavoidable.
    picked.push(next);
    i += 1;
  }
  return picked;
}

export interface NumberfortRun {
  rounds: ReasoningRoundPlan[];
  total: number;
}

/** The numberfort's rounds for a stage: one generated item per skill, tier from its Leitner box. */
export function planNumberfortRun(
  learning: LevelLearning,
  definition: LevelDefinition,
  stage = 1,
): NumberfortRun {
  const stats = learning.stats();
  const { rng } = learning;
  const rounds = Math.min(definition.rounds, NUMBERFORT_ROUNDS);
  const ids = withBugChoiceRound(planNumberfortStageSkills(stats, rounds, stage), stage);
  const plans: ReasoningRoundPlan[] = ids.map((skillId) => {
    const tier = skillTierOf(stats[skillKey(skillId)]);
    return { skillId, tier, factKey: skillKey(skillId), item: itemForSkill(skillId, rng, tier) };
  });
  return { rounds: plans, total: plans.length };
}
