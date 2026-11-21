// One entry point for the fractions family (phase 12): a fraction-family skill id + rng + tier
// -> item. Empty until phase 12 adds the first generator; the dispatcher already consults it.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';

export type FractionGenerator = (rng: Rng, tier: SkillTier) => PracticeItem;

const GENERATORS: Readonly<Record<string, FractionGenerator>> = {};

/** The fraction skills (catalog order) that have a generator (none yet). */
export const FRACTION_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isFractionSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a fraction generator. */
export function fractionItemForSkill(id: string, rng: Rng, tier: SkillTier): PracticeItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`fraction: no generator for skill "${id}"`);
  return generate(rng, tier);
}
