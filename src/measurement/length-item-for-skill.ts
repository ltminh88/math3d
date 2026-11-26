// One entry point for the length-ladder skills (boost, Phase 1B): a meas-len-*
// skill id + rng + tier -> a plain ReasoningItem (no scene until 2B draws the
// `length-ladder` scene). The ladder level defaults to the tier's ladder
// (tier 1 -> L0-1, tier 2 -> L2-3, tier 3 -> L4-5); 4A will feed the real
// `ladderTierOf(stat)` here when weak-spot weighting lands.
import type { Rng } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import type { ReasoningItem } from '../reasoning/reasoning-types';
import { measLenAddSub } from './length-add-sub-generators';
import { measLenChooseUnit, measLenCompare, measLenOrder } from './length-compare-order-generators';
import { measLenConvert, measLenConvertFar, measLenLadder } from './length-ladder-generators';
import { measLenMixed } from './length-mixed-unit-generators';
import { ladderForTier } from './length-units';

/** A length generator takes the ladder level too (L0-L5). */
export type LengthGenerator = (rng: Rng, tier: SkillTier, ladder: number) => ReasoningItem;

const GENERATORS: Readonly<Record<string, LengthGenerator>> = {
  'meas-len-ladder': measLenLadder,
  'meas-len-convert': measLenConvert,
  'meas-len-convert-far': measLenConvertFar,
  'meas-len-compare': measLenCompare,
  'meas-len-order': measLenOrder,
  'meas-len-choose-unit': measLenChooseUnit,
  'meas-len-mixed': measLenMixed,
  'meas-len-add-sub': measLenAddSub,
};

/** The length-ladder skills (catalog order) that have a generator. */
export const LENGTH_SKILLS: readonly string[] = Object.keys(GENERATORS);

export const isLengthSkill = (id: string): boolean => id in GENERATORS;

/** Pure and deterministic for a seeded `rng`; throws for skills without a generator. */
export function lengthItemForSkill(
  id: string,
  rng: Rng,
  tier: SkillTier,
  ladder: number = ladderForTier(tier, rng),
): ReasoningItem {
  const generate = GENERATORS[id];
  if (!generate) throw new Error(`length: no generator for skill "${id}"`);
  return generate(rng, tier, ladder);
}
