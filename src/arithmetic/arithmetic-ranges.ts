// Number ranges per arithmetic skill (phase 09). Tiers raise traps (carries), never
// size — except the two cross-range skills (find-error, missing-digit), which scale
// range by tier instead (T1 ≤ 1 000, T2 ≤ 10 000, T3 ≤ 100 000): a fresh skill always
// starts at T1, so a B2 run starts within 1 000, and items are never over-scope for
// their lesson while the tier is below the lesson's range (only ever under-scope).
import type { SkillTier } from '../learning/skill-tiers';

export const RANGE_1000 = 1000;
export const RANGE_10000 = 10000;
export const RANGE_100000 = 100000;

/** Phase 10 caps: 2-digit mul/div (B23, B26) ≤ 99, 3-digit (B36, B37) ≤ 999. */
export const RANGE_99 = 99;
export const RANGE_999 = 999;

const FIXED_RANGES: Record<string, number> = {
  'add-sub-mental-round': RANGE_1000,
  'add-sub-1000': RANGE_1000,
  'add-sub-1000-wp': RANGE_1000,
  'add-sub-1000-chain': RANGE_1000,
  // Boost Phase 1A: the new formats practise to 1 000 at every tier.
  'add-sub-bug-choice': RANGE_1000,
  'add-sub-true-false': RANGE_1000,
  'add-sub-compare-estimate': RANGE_1000,
  'add-sub-number-line': RANGE_1000,
  'add-sub-bar-model-wp': RANGE_1000,
  'add-4digit': RANGE_10000,
  'sub-4digit': RANGE_10000,
  'add-sub-10000-wp': RANGE_10000,
  'add-5digit': RANGE_100000,
  'sub-5digit': RANGE_100000,
  'add-sub-100000-wp': RANGE_100000,
  'mul-2d-1d': RANGE_99,
  'mul-tens-mental': RANGE_99,
  'mul-2d-1d-wp': RANGE_99,
  'div-2d-1d': RANGE_99,
  'div-2d-1d-remainder': RANGE_99,
  'div-tens-mental': RANGE_99,
  'div-2d-1d-wp': RANGE_99,
  'mul-3d-1d': RANGE_999,
  'mul-hundreds-mental': RANGE_999,
  'mul-3d-1d-wp': RANGE_999,
  'div-3d-1d': RANGE_999,
  'div-3d-1d-remainder': RANGE_999,
  'div-hundreds-mental': RANGE_999,
  'div-reduce-times': RANGE_999,
  'mul-4d-1d': RANGE_10000,
  'mul-thousands-mental': RANGE_10000,
  'div-4d-1d': RANGE_10000,
  'div-4d-1d-remainder': RANGE_10000,
  'div-thousands-mental': RANGE_10000,
  'mul-5d-1d': RANGE_100000,
  'div-5d-1d': RANGE_100000,
  'div-5d-1d-remainder': RANGE_100000,
};

/** The range cap for a cross-range skill at a tier (find-error, missing-digit). */
export const tierRangeCap = (tier: SkillTier): number =>
  tier === 1 ? RANGE_1000 : tier === 2 ? RANGE_10000 : RANGE_100000;

/** The range cap for the phase-11 cross-lesson skills (mul-div-large-wp,
 *  mul-chain-operators): T1 stays in the 4-digit lessons (B56, B57), T2–T3 reach
 *  the 5-digit lessons (B70, B71). */
export const tierRangeCapLarge = (tier: SkillTier): number =>
  tier === 1 ? RANGE_10000 : RANGE_100000;

/** The range cap for the mul/div find-error skill at a tier (T1 ≤ 99, T2–T3 ≤ 999). */
export const tierRangeCapMulDiv = (tier: SkillTier): number => (tier === 1 ? RANGE_99 : RANGE_999);

/** The largest number an item of a skill at a tier may show. */
export function rangeCapOfSkill(skillId: string, tier: SkillTier): number {
  const fixed = FIXED_RANGES[skillId];
  if (fixed !== undefined) return fixed;
  if (skillId === 'mul-div-find-error') return tierRangeCapMulDiv(tier);
  if (skillId === 'mul-div-large-wp' || skillId === 'mul-chain-operators')
    return tierRangeCapLarge(tier);
  return tierRangeCap(tier);
}

/** Digits of `n`, most significant first. */
export const digitsOf = (n: number): number[] => String(n).split('').map(Number);

/** The number formed by the given digits (most significant first). */
export const fromDigits = (digits: readonly number[]): number => Number(digits.join(''));
