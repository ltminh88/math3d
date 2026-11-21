// One entry point for the numbers family (phase 07): a number-family skill id + rng + tier
// -> item. Empty until phase 07 adds the first generator; the dispatcher already consults it.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';

export type NumberGenerator = (rng: Rng, tier: SkillTier) => PracticeItem;

const GENERATORS: Readonly<Record<string, NumberGenerator>> = {};

/** The number skills (catalog order) that have a generator (none yet). */
export const NUMBER_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isNumberSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a number generator. */
export function numberItemForSkill(id: string, rng: Rng, tier: SkillTier): PracticeItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`number: no generator for skill "${id}"`);
  return generate(rng, tier);
}
