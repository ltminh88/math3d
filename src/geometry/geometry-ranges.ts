// Geometry ranges in one place, locked after the KNTT check (plans/.../research/
// researcher-03-kntt-geometry-measurement-verification.md). Author cap: every number <= 100.
// Tiers raise the reasoning (rotated figures, choose-all, two steps), never the numbers.
import type { SkillTier } from '../learning/skill-tiers';

/** B16: even segment lengths so the midpoint lands on whole centimetres. */
export const MIDPOINT_LENGTHS: Readonly<Record<SkillTier, readonly [number, number]>> = {
  1: [2, 12],
  2: [2, 20],
  3: [4, 20],
};

/** B17: radius in cm; tier 3 puts up to 3 equal circles in a row (6 × 16 = 96). */
export const RADIUS_MAX: Readonly<Record<SkillTier, number>> = { 1: 10, 2: 25, 3: 16 };
export const CIRCLE_ROW_COUNTS = [2, 3] as const;

/** B18: angles that are clearly not right next to 90 (tier 3 adds the closer 75 / 105). */
export const NOT_RIGHT_DEGREES: Readonly<Record<SkillTier, readonly number[]>> = {
  1: [45, 60, 120, 135],
  2: [45, 60, 120, 135],
  3: [60, 75, 105, 120, 135],
};
/** A turned figure (tier 2+) is drawn rotated by 20-70 degrees. */
export const ROTATION_RANGE = [20, 70] as const;

/** B19 / B21: grid figures fit in an 8 × 6 box; solid edges 1-9 cm. */
export const GRID_MAX = { w: 8, h: 6 } as const;
export const SOLID_EDGE_MAX = 9;

/** B21 tier 3: things on each vertex / edge / face, keeping parts × per <= 100. */
export const DECOR_PER_MAX = { vertex: 9, edge: 8, face: 9 } as const;

/** Scene unit hint for 06/07: a grid unit is at least this many CSS px on phone and tablet. */
export const MIN_UNIT_PX = 24;
