// One entry point for the money family (phase 14): a money-family skill id + rng + tier -> item.
// Empty until phase 14 adds the first generator; the dispatcher already consults it.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';

export type MoneyGenerator = (rng: Rng, tier: SkillTier) => PracticeItem;

const GENERATORS: Readonly<Record<string, MoneyGenerator>> = {};

/** The money skills (catalog order) that have a generator (none yet). */
export const MONEY_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isMoneySkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a money generator. */
export function moneyItemForSkill(id: string, rng: Rng, tier: SkillTier): PracticeItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`money: no generator for skill "${id}"`);
  return generate(rng, tier);
}
