// Fraction ranges in one place (KNTT T1 B14, Q7: unit fractions only).
import type { SkillTier } from '../learning/skill-tiers';

/** Denominators of unit fractions 1/2..1/9. */
export const DENOMINATORS = [2, 3, 4, 5, 6, 7, 8, 9] as const;

/** Tier 1 denominators: the book introduces 1/2, 1/3, 1/4 first. */
export const DENOMINATORS_T1 = [2, 3, 4] as const;

/** Denominators a grid shape can show (parts = rows × cols). */
export const GRID_DENOMINATORS = [4, 6, 8, 9] as const;

/** Grid columns per denominator (rows = parts / cols). */
export const GRID_COLS: Readonly<Record<number, number>> = { 4: 2, 6: 3, 8: 2, 9: 3 };

/** Fraction of a set: N divisible by n, N ≤ 45 (phase 12). */
export const SET_MAX = 45;

/** Scene unit hint: a shape part is at least this many CSS px on phone and tablet. */
export const MIN_UNIT_PX = 24;

export type { SkillTier };
