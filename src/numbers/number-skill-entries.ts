// Number-family skill entries (phase 07): `entry('num-…', 'number', [t1(n)])` from
// '../learning/skill-entry'; the catalog concatenates this list after the legacy entries.
// Lesson refs: B1 (T1) numbers to 1 000; B45/B46 (T2) numbers to 10 000; B59/B60 (T2)
// numbers to 100 000.
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
]);
