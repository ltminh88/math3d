// Number-family skill entries (phase 07): `entry('num-…', 'number', [t1(n)])` from
// '../learning/skill-entry'; the catalog concatenates this list after the legacy entries.
// Lesson refs: B1 (T1) numbers to 1 000; B45/B46 (T2) numbers to 10 000; B59/B60 (T2)
// numbers to 100 000; B47 (T2) Roman numerals; B48 (T2) rounding to tens/hundreds;
// B61 (T2) rounding to thousands/ten-thousands (phase 08).
import { entry, type SkillEntry, t1, t2 } from '../learning/skill-entry';

/** Number skills, in catalog order. */
export const NUMBER_ENTRIES: readonly SkillEntry[] = Object.freeze([
  entry('num-read-write-1000', 'number', [t1(1)]),
  entry('num-place-value-1000', 'number', [t1(1)]),
  entry('num-neighbors-1000', 'number', [t1(1)]),
  entry('num-compare-1000', 'number', [t1(1)]),
  entry('num-order-1000', 'number', [t1(1)]),
  entry('num-sequence-1000', 'number', [t1(1)]),
  entry('num-read-write-10000', 'number', [t2(45)]),
  entry('num-place-value-10000', 'number', [t2(45)]),
  entry('num-compare-10000', 'number', [t2(46)]),
  entry('num-order-10000', 'number', [t2(46)]),
  entry('num-read-write-100000', 'number', [t2(59)]),
  entry('num-expand-100000', 'number', [t2(59)]),
  entry('num-compare-100000', 'number', [t2(60)]),
  entry('num-order-100000', 'number', [t2(60)]),
  entry('round-tens', 'number', [t2(48)]),
  entry('round-hundreds', 'number', [t2(48)]),
  entry('round-thousands', 'number', [t2(61)]),
  entry('round-ten-thousands', 'number', [t2(61)]),
  entry('round-which-place', 'number', [t2(61)]),
  entry('roman-to-number', 'number', [t2(47)]),
  entry('number-to-roman', 'number', [t2(47)]),
  entry('roman-sequence', 'number', [t2(47)]),
]);
