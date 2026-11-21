// Fraction-family skill entries (phase 12): all six skills practise B14 (một phần mấy,
// unit fractions 1/2..1/9). Scene-free skills (fraction-read, fraction-of-set-number,
// fraction-wp) render in the shared dialog today; the three picture skills carry a scene
// the phase-16 renderer draws.

import type { SkillEntry } from '../learning/skill-entry';
import { entry, t1 } from '../learning/skill-entry';

/** Fraction skills, in catalog order. */
export const FRACTION_ENTRIES: readonly SkillEntry[] = Object.freeze([
  entry('fraction-read', 'fraction', [t1(14)]),
  entry('fraction-shaded', 'fraction', [t1(14)]),
  entry('fraction-pick-picture', 'fraction', [t1(14)]),
  entry('fraction-of-set-circle', 'fraction', [t1(14)]),
  entry('fraction-of-set-number', 'fraction', [t1(14)]),
  entry('fraction-wp', 'fraction', [t1(14)]),
]);
