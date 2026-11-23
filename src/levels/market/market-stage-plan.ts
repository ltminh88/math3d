// Stage plan for the market (phase 19, pure, seeded): which family a stage drills. Stages follow
// the textbook order — 1 clock, 2 calendar, 3 money, 4 data/chance, 5 a mix of all four — so a
// stage never introduces a skill from another family. Tiers always come from the Leitner box,
// never from the stage number. Stages 2–5 re-select from the attempted pool weakest-first (as
// in the cave); unlike the cave, the fallback tops up from the stage's own family instead of
// today's plan, so a stage always plays its family even when the attempted pool is small
// (stage 2 has only three calendar skills for six rounds, so skills repeat — round-robin, never
// twice in a row while the pool holds two or more).

import { DATA_SKILLS } from '../../data/data-item-for-skill';
import { type FactKey, skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { skillTierOf } from '../../learning/skill-tiers';
import { MONEY_SKILLS } from '../../money/money-item-for-skill';
import { itemForSkill } from '../../practice/item-for-skill';
import { TIME_SKILLS } from '../../time/time-item-for-skill';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import type { ReasoningRoundPlan } from '../shared/reasoning-round-slot';

/** Rounds per market run (a lesson run is six items, as in "Ôn theo bài"). */
export const MARKET_ROUNDS = 6;

/** Clock skills (B66): reading the clock face, elapsed time, Roman hours, ordering times. */
export const MARKET_CLOCK_SKILLS: readonly string[] = [
  'clock-read-hour-half',
  'clock-read-5min',
  'clock-read-minute',
  'clock-sang-chieu-24h',
  'clock-elapsed-minutes',
  'roman-clock-hour',
  'times-order-digital',
] as const;

/** Calendar skills (B66): month lengths, weekdays, days between dates. */
export const MARKET_CALENDAR_SKILLS: readonly string[] = [
  'months-days-count',
  'calendar-weekday',
  'calendar-days-between',
] as const;

/** The stage's family, in catalog order (stage 5 is the mix of all four). */
export const MARKET_STAGE_SKILLS: Readonly<Record<number, readonly string[]>> = {
  1: MARKET_CLOCK_SKILLS,
  2: MARKET_CALENDAR_SKILLS,
  3: MONEY_SKILLS,
  4: DATA_SKILLS,
  5: [...TIME_SKILLS, ...MONEY_SKILLS, ...DATA_SKILLS],
};

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

const boxOf = (stats: Stats, id: string): number => stats[skillKey(id)]?.box ?? 1;

/** The stage's family weakest box first, ties in catalog order (deterministic). */
function rankedFamily(stats: Stats, stage: number): string[] {
  const family = MARKET_STAGE_SKILLS[stage] ?? MARKET_CLOCK_SKILLS;
  return [...family].sort(
    (a, b) => boxOf(stats, a) - boxOf(stats, b) || family.indexOf(a) - family.indexOf(b),
  );
}

/**
 * The pool a stage picks from, in pick order. Stages 1–4 take their family weakest-first.
 * Stage 5 interleaves the four families (weakest of each in turn), so a six-round mix run
 * always holds every family instead of the first six of the catalog.
 */
function stageOrder(stats: Stats, stage: number): string[] {
  if (stage !== 5) return rankedFamily(stats, stage);
  const families = [MARKET_CLOCK_SKILLS, MARKET_CALENDAR_SKILLS, MONEY_SKILLS, DATA_SKILLS].map(
    (family) =>
      [...family].sort(
        (a, b) => boxOf(stats, a) - boxOf(stats, b) || family.indexOf(a) - family.indexOf(b),
      ),
  );
  const order: string[] = [];
  for (let i = 0; i < Math.max(...families.map((f) => f.length)); i++) {
    for (const family of families) {
      const id = family[i];
      if (id !== undefined) order.push(id);
    }
  }
  return order;
}

/** Stage 1 plays the whole family; later stages play only skills the child has attempted. */
export function stagePool(stats: Stats, stage: number): readonly string[] {
  if (stage <= 1) return MARKET_STAGE_SKILLS[stage] ?? MARKET_CLOCK_SKILLS;
  const family = MARKET_STAGE_SKILLS[stage] ?? MARKET_CLOCK_SKILLS;
  return family.filter((id) => (stats[skillKey(id)]?.attempts ?? 0) > 0);
}

/**
 * The stage's skill ids for a run: attempted skills weakest-first, round-robin, topped up from
 * the family's unattempted skills (still weakest-first) so the run always fills its rounds
 * with the stage's family. No skill twice in a row while the pool holds two or more.
 */
export function planMarketStageSkills(stats: Stats, length: number, stage: number): string[] {
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

export interface MarketRun {
  rounds: ReasoningRoundPlan[];
  total: number;
}

/** The market's rounds for a stage: one generated item per skill, tier from its Leitner box. */
export function planMarketRun(
  learning: LevelLearning,
  definition: LevelDefinition,
  stage = 1,
): MarketRun {
  const stats = learning.stats();
  const { rng } = learning;
  const rounds = Math.min(definition.rounds, MARKET_ROUNDS);
  const ids = planMarketStageSkills(stats, rounds, stage);
  const plans: ReasoningRoundPlan[] = ids.map((skillId) => {
    const tier = skillTierOf(stats[skillKey(skillId)]);
    return { skillId, tier, factKey: skillKey(skillId), item: itemForSkill(skillId, rng, tier) };
  });
  return { rounds: plans, total: plans.length };
}
