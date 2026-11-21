// One entry point for the data family (phase 15): a data-family skill id + rng + tier -> item.
// Empty until phase 15 adds the first generator; the dispatcher already consults it.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';

export type DataGenerator = (rng: Rng, tier: SkillTier) => PracticeItem;

const GENERATORS: Readonly<Record<string, DataGenerator>> = {};

/** The data skills (catalog order) that have a generator (none yet). */
export const DATA_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isDataSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a data generator. */
export function dataItemForSkill(id: string, rng: Rng, tier: SkillTier): PracticeItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`data: no generator for skill "${id}"`);
  return generate(rng, tier);
}
