// Length skill entries (boost, Phase 1B): the `meas-len-*` ladder over m/dm/cm/mm.
// KNTT frame: m, dm are grade-2 content reviewed in T1 B7; mm in T1 B30 — every
// id carries both lessons (the ladder gates the content by tier: m<->mm from L2).

import type { SkillEntry } from '../learning/skill-entry';
import { entry, t1 } from '../learning/skill-entry';

export const LENGTH_SKILL_ENTRIES: readonly SkillEntry[] = [
  entry('meas-len-ladder', 'measurement', [t1(7), t1(30)]),
  entry('meas-len-convert', 'measurement', [t1(7), t1(30)]),
  entry('meas-len-convert-far', 'measurement', [t1(7), t1(30)]),
  entry('meas-len-compare', 'measurement', [t1(7), t1(30)]),
  entry('meas-len-order', 'measurement', [t1(7), t1(30)]),
  entry('meas-len-choose-unit', 'measurement', [t1(7), t1(30)]),
  entry('meas-len-mixed', 'measurement', [t1(7), t1(30)]),
  entry('meas-len-add-sub', 'measurement', [t1(7), t1(30)]),
];
