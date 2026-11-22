// Arithmetic-family skill entries (phase 09: `entry('…', 'arithmetic', [t1(n)])`
// from '../learning/skill-entry'; the catalog concatenates this list after the legacy
// entries). Order is the phase file's listed order, so skillsOfLesson(2) reads in
// skill order.

import type { SkillEntry } from '../learning/skill-entry';
import { entry, t1, t2 } from '../learning/skill-entry';

/**
 * Arithmetic skills, in catalog order. The two cross-range skills (find-error,
 * missing-digit) scale range by tier — T1 ≤ 1 000, T2 ≤ 10 000, T3 ≤ 100 000 —
 * so a fresh skill always starts within 1 000 and a B2 run never goes over-scope.
 */
export const ARITHMETIC_ENTRIES: readonly SkillEntry[] = Object.freeze([
  entry('add-sub-mental-round', 'arithmetic', [t1(2)]),
  entry('add-sub-1000', 'arithmetic', [t1(2)]),
  entry('add-sub-1000-wp', 'arithmetic', [t1(2)]),
  entry('add-sub-1000-chain', 'arithmetic', [t1(2)]),
  entry('add-4digit', 'arithmetic', [t2(54)]),
  entry('sub-4digit', 'arithmetic', [t2(55)]),
  entry('add-sub-10000-wp', 'arithmetic', [t2(54), t2(55)]),
  entry('add-5digit', 'arithmetic', [t2(63)]),
  entry('sub-5digit', 'arithmetic', [t2(64)]),
  entry('add-sub-100000-wp', 'arithmetic', [t2(63), t2(64)]),
  entry('add-sub-find-error', 'arithmetic', [t1(2), t2(54), t2(55), t2(63), t2(64)]),
  entry('add-missing-digit', 'arithmetic', [t1(2), t2(54), t2(55), t2(63), t2(64)]),
]);
