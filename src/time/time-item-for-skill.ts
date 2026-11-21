// One entry point for the time family (phase 13): a time-family skill id + rng + tier -> item.
// Empty until phase 13 adds the first generator; the dispatcher already consults it.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';

export type TimeGenerator = (rng: Rng, tier: SkillTier) => PracticeItem;

const GENERATORS: Readonly<Record<string, TimeGenerator>> = {};

/** The time skills (catalog order) that have a generator (none yet). */
export const TIME_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isTimeSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a time generator. */
export function timeItemForSkill(id: string, rng: Rng, tier: SkillTier): PracticeItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`time: no generator for skill "${id}"`);
  return generate(rng, tier);
}
