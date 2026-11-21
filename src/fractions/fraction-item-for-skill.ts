// One entry point for the fractions family (phase 12): a fraction-family skill id + rng + tier
// -> item. The dispatcher already consults it; the six generators live in
// fraction-generators.ts (shape skills) and fraction-set-generators.ts (set skills).
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { fractionPickPicture, fractionRead, fractionShaded } from './fraction-generators';
import type { FractionGenerator, FractionItem } from './fraction-scene-types';
import { fractionOfSetCircle, fractionOfSetNumber, fractionWp } from './fraction-set-generators';

const GENERATORS: Readonly<Record<string, FractionGenerator>> = {
  'fraction-read': fractionRead,
  'fraction-shaded': fractionShaded,
  'fraction-pick-picture': fractionPickPicture,
  'fraction-of-set-circle': fractionOfSetCircle,
  'fraction-of-set-number': fractionOfSetNumber,
  'fraction-wp': fractionWp,
};

/** The fraction skills (catalog order) that have a generator. */
export const FRACTION_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isFractionSkill = (id: string): boolean => id in GENERATORS;

/**
 * Skills whose items never carry a scene: they render in the shared dialog today, so the
 * lesson run can include them before the phase-16 scene renderer lands (the picture skills
 * stay filtered out until then). Phase 06 composes its renderable predicate from this.
 */
export const FRACTION_SCENE_FREE_SKILLS: readonly string[] = [
  'fraction-read',
  'fraction-of-set-number',
  'fraction-wp',
];

export const isFractionSceneFreeSkill = (id: string): boolean =>
  FRACTION_SCENE_FREE_SKILLS.includes(id);

/** Pure and deterministic for a seeded `rng`; throws for skills without a fraction generator. */
export function fractionItemForSkill(id: string, rng: Rng, tier: SkillTier): FractionItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`fraction: no generator for skill "${id}"`);
  return generate(rng, tier);
}
