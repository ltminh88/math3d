// Number ranges per arithmetic skill (phase 09). Tiers raise traps (carries), never
// size — except the two cross-range skills (find-error, missing-digit), which scale
// range by tier instead (T1 ≤ 1 000, T2 ≤ 10 000, T3 ≤ 100 000): a fresh skill always
// starts at T1, so a B2 run starts within 1 000, and items are never over-scope for
// their lesson while the tier is below the lesson's range (only ever under-scope).
import type { SkillTier } from '../learning/skill-tiers';

export const RANGE_1000 = 1000;
export const RANGE_10000 = 10000;
export const RANGE_100000 = 100000;

const FIXED_RANGES: Record<string, number> = {
  'add-sub-mental-round': RANGE_1000,
  'add-sub-1000': RANGE_1000,
  'add-sub-1000-wp': RANGE_1000,
  'add-sub-1000-chain': RANGE_1000,
  'add-4digit': RANGE_10000,
  'sub-4digit': RANGE_10000,
  'add-sub-10000-wp': RANGE_10000,
  'add-5digit': RANGE_100000,
  'sub-5digit': RANGE_100000,
  'add-sub-100000-wp': RANGE_100000,
};

/** The range cap for a cross-range skill at a tier (find-error, missing-digit). */
export const tierRangeCap = (tier: SkillTier): number =>
  tier === 1 ? RANGE_1000 : tier === 2 ? RANGE_10000 : RANGE_100000;

/** The largest number an item of a skill at a tier may show. */
export function rangeCapOfSkill(skillId: string, tier: SkillTier): number {
  const fixed = FIXED_RANGES[skillId];
  if (fixed !== undefined) return fixed;
  return tierRangeCap(tier);
}

/** Digits of `n`, most significant first. */
export const digitsOf = (n: number): number[] => String(n).split('').map(Number);

/** The number formed by the given digits (most significant first). */
export const fromDigits = (digits: readonly number[]): number => Number(digits.join(''));
