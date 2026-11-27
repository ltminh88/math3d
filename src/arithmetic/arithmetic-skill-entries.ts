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
 * Phase 10 appends the mul/div skills (B23, B26, B36, B37); mul-div-find-error
 * spans the 2-digit (B26) and 3-digit (B37) lessons, T1 ≤ 99, T2–T3 ≤ 999.
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
  entry('mul-2d-1d', 'arithmetic', [t1(23)]),
  entry('mul-tens-mental', 'arithmetic', [t1(23)]),
  entry('mul-2d-1d-wp', 'arithmetic', [t1(23)]),
  entry('div-2d-1d', 'arithmetic', [t1(26)]),
  entry('div-2d-1d-remainder', 'arithmetic', [t1(26)]),
  entry('div-tens-mental', 'arithmetic', [t1(26)]),
  entry('div-2d-1d-wp', 'arithmetic', [t1(26)]),
  entry('mul-3d-1d', 'arithmetic', [t1(36)]),
  entry('mul-hundreds-mental', 'arithmetic', [t1(36)]),
  entry('mul-3d-1d-wp', 'arithmetic', [t1(36)]),
  entry('div-3d-1d', 'arithmetic', [t1(37)]),
  entry('div-3d-1d-remainder', 'arithmetic', [t1(37)]),
  entry('div-hundreds-mental', 'arithmetic', [t1(37)]),
  entry('div-reduce-times', 'arithmetic', [t1(37)]),
  entry('mul-div-find-error', 'arithmetic', [t1(26), t1(37)]),
  entry('mul-4d-1d', 'arithmetic', [t2(56)]),
  entry('mul-thousands-mental', 'arithmetic', [t2(56)]),
  entry('div-4d-1d', 'arithmetic', [t2(57)]),
  entry('div-4d-1d-remainder', 'arithmetic', [t2(57)]),
  entry('div-thousands-mental', 'arithmetic', [t2(57)]),
  entry('mul-5d-1d', 'arithmetic', [t2(70)]),
  entry('div-5d-1d', 'arithmetic', [t2(71)]),
  entry('div-5d-1d-remainder', 'arithmetic', [t2(71)]),
  entry('mul-div-large-wp', 'arithmetic', [t2(56), t2(57), t2(70), t2(71)]),
  entry('mul-chain-operators', 'arithmetic', [t2(56), t2(57), t2(70), t2(71)]),
  // Boost Phase 1A: the five new add/sub formats, B2 (book 1, lesson 2).
  entry('add-sub-bug-choice', 'arithmetic', [t1(2)]),
  entry('add-sub-true-false', 'arithmetic', [t1(2)]),
  entry('add-sub-compare-estimate', 'arithmetic', [t1(2)]),
  entry('add-sub-number-line', 'arithmetic', [t1(2)]),
  entry('add-sub-bar-model-wp', 'arithmetic', [t1(2)]),
  // Boost Phase 2A: the column-calc scene skill, B2.
  entry('add-sub-column', 'arithmetic', [t1(2)]),
]);
