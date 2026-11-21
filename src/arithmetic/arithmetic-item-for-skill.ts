// One entry point for the arithmetic family (phase 09): an arithmetic-family skill id + rng
// + tier -> item. Empty until phase 09 adds the first generator; the dispatcher already
// consults it.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { PracticeItem } from '../practice/practice-scene';

export type ArithmeticGenerator = (rng: Rng, tier: SkillTier) => PracticeItem;

const GENERATORS: Readonly<Record<string, ArithmeticGenerator>> = {};

/** The arithmetic skills (catalog order) that have a generator (none yet). */
export const ARITHMETIC_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isArithmeticSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without an arithmetic generator. */
export function arithmeticItemForSkill(id: string, rng: Rng, tier: SkillTier): PracticeItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`arithmetic: no generator for skill "${id}"`);
  return generate(rng, tier);
}
