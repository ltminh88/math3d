// Measurement ranges in one place, locked after the KNTT check (plans/.../research/
// researcher-03-kntt-geometry-measurement-verification.md). Author cap: every number <= 100, so
// there is no kg ↔ g, l ↔ ml or m ↔ mm; only cm ↔ mm (1 cm = 10 mm). Tiers raise the reasoning.
// Boost D1 (Phase 1B) relaxes the cap for the new `meas-len-*` skills only: whole numbers
// <= 1000, m/dm/cm/mm, m↔mm from ladder L2, no decimals. Legacy skills keep <= 100.
import type { SkillTier } from '../learning/skill-tiers';

/** Boost (Phase 1B, D1): the number cap for the new `meas-len-*` skills only. */
export const LENGTH_LADDER_MAX = 1000;

/** B30: a 10 cm ruler with mm ticks keeps every reading <= 100 mm. */
export const RULER_MAX_CM = 10;

/** B31: gram weights on the balance (the book uses 20 g, 50 g, 100 g...; 100 g would fill the cap). */
export const WEIGHTS = [50, 20, 10, 5, 2, 1] as const;

/** B32: jugs by tier. A jug is a (capacity, marks) pair; one mark is capacity / marks ml.
 * Tier 1 asks one step only, so every mark is the book's 10 ml: a 100 ml jug with
 * 10 marks and a 50 ml jug with 5 marks. Tier 2 asks per-mark first, so other
 * per-mark values are fair: 25 ml (100 ml / 4 marks), 20 ml (100 ml / 5),
 * 5 ml (50 ml / 10). Two phase-02 sets were not real questions and are gone: the
 * 5-mark 100 ml jug at tier 1 (one step would force the child to work out 20 ml
 * a mark with no lead-in — that is tier 2 reasoning) and the 10-mark 100 ml jug
 * at tier 2 (per = 10 makes the 'wrong-step' distractor, level × 10, equal the
 * right answer). Counts after the fix: tier 1 is 9 + 4 = 13, tier 2 is 3 + 4 + 9 = 16. */
export interface JugSet {
  readonly capacity: number;
  readonly marks: number;
}
export const JUG_SETS: Readonly<Record<SkillTier, readonly JugSet[]>> = {
  1: [
    { capacity: 100, marks: 10 },
    { capacity: 50, marks: 5 },
  ],
  2: [
    { capacity: 100, marks: 4 },
    { capacity: 100, marks: 5 },
    { capacity: 50, marks: 10 },
  ],
  3: [{ capacity: 100, marks: 10 }],
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
