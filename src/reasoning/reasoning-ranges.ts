// Number ranges for reasoning items, one place (verified against SGK Toán 3 KNTT, see
// plans/.../research/researcher-02-kntt-reasoning-verification.md). Author cap 2026-10-31: every
// number in a prompt, every intermediate result and every answer is <= 100 in all tiers. Tiers
// raise the reasoning (steps, brackets, distractors), never the size of the numbers.
import type { SkillTier } from '../learning/skill-tiers';

export const MAX_NUMBER = 100;

export interface TierRange {
  /** Factors / divisors drawn from the tables (B4-B12, B24-B27). */
  readonly factors: readonly number[];
  /** Largest first quantity in a word problem. */
  readonly maxBase: number;
  /** Largest addend / difference in more-less and unknown-addend items. */
  readonly maxAddend: number;
}

export const TIER_RANGES: Readonly<Record<SkillTier, TierRange>> = {
  1: { factors: [2, 3, 4, 5], maxBase: 20, maxAddend: 30 },
  2: { factors: [2, 3, 4, 5, 6, 7, 8, 9], maxBase: 50, maxAddend: 60 },
  3: { factors: [2, 3, 4, 5, 6, 7, 8, 9], maxBase: 90, maxAddend: 90 },
};

/** Divisors in remainder items (B25: số dư bé hơn số chia; tier 1 small divisors). */
export const REMAINDER_DIVISORS: Readonly<Record<SkillTier, readonly number[]>> = {
  1: [2, 3, 4, 5],
  2: [3, 4, 5, 6, 7, 8, 9],
  3: [4, 5, 6, 7, 8, 9],
};

/** Pattern steps: tier 1 counts by small steps, later tiers by table steps and round tens. */
export const PATTERN_STEPS: Readonly<Record<SkillTier, readonly number[]>> = {
  1: [1, 2, 5, 10],
  2: [2, 3, 4, 5, 10],
  3: [3, 4, 6, 7, 8, 9, 11],
};

export const withinCap = (n: number): boolean => Number.isInteger(n) && n >= 0 && n <= MAX_NUMBER;
