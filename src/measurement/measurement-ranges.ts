// Measurement ranges in one place, locked after the KNTT check (plans/.../research/
// researcher-03-kntt-geometry-measurement-verification.md). Author cap: every number <= 100, so
// there is no kg ↔ g, l ↔ ml or m ↔ mm; only cm ↔ mm (1 cm = 10 mm). Tiers raise the reasoning.
import type { SkillTier } from '../learning/skill-tiers';

/** B30: a 10 cm ruler with mm ticks keeps every reading <= 100 mm. */
export const RULER_MAX_CM = 10;

/** B31: gram weights on the balance (the book uses 20 g, 50 g, 100 g...; 100 g would fill the cap). */
export const WEIGHTS = [50, 20, 10, 5, 2, 1] as const;

/** B32: a 100 ml jug; marks per tier (10 ml a mark, then 4 or 5 marks to work out). */
export const JUG_CAPACITY = 100;
export const JUG_MARKS: Readonly<Record<SkillTier, readonly number[]>> = {
  1: [10],
  2: [4, 5],
  3: [10],
};

/** B33: air temperatures 5-40 °C as in the book (Sa Pa 10, Hà Nội 30); scale 0-100. */
export const TEMP_RANGE = [5, 40] as const;
export const PLACES = ['Hà Nội', 'Lào Cai', 'Sa Pa', 'Huế', 'Đà Lạt', 'Cần Thơ'] as const;

/** B50: sides 2-20 cm, so a quadrilateral's perimeter stays <= 80. */
export const SIDE_RANGE = [2, 20] as const;
/** B50 bài 3: a garden fence in metres, with a 1-3 m gate. */
export const FENCE_SIDE_RANGE = [4, 20] as const;
export const GATE_RANGE = [1, 3] as const;

/** B51: shapes of 1 cm² cells inside a 6 × 5 grid, sizes per tier. */
export const CELL_GRID = { w: 6, h: 5 } as const;
export const AREA_CELLS: Readonly<Record<SkillTier, readonly [number, number]>> = {
  1: [4, 10],
  2: [6, 16],
  3: [8, 20],
};

/** B52: sides <= 10 cm, so every area is <= 100 cm². */
export const AREA_SIDE_MAX = 10;
