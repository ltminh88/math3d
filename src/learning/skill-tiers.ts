import type { FactStat } from './learning-types';

/** Reasoning difficulty: tiers raise the reasoning (steps, brackets, distractors), never the numbers. */
export type SkillTier = 1 | 2 | 3;

/** Leitner box -> tier: box 1-2 -> 1, 3-4 -> 2, 5 -> 3. */
export function tierOfBox(box: number): SkillTier {
  if (box >= 5) return 3;
  return box >= 3 ? 2 : 1;
}

/** Tier for a skill's stat; a skill never seen starts in box 1 (tier 1). */
export function skillTierOf(stat: Pick<FactStat, 'box'> | undefined): SkillTier {
  return tierOfBox(stat?.box ?? 1);
}
