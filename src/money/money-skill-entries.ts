// Money-family skill entries (phase 14): B68, Vietnamese notes. Catalog order follows the
// phase file's list.

import type { SkillEntry } from '../learning/skill-entry';
import { entry, t2 } from '../learning/skill-entry';

/** Money skills, in catalog order. */
export const MONEY_ENTRIES: readonly SkillEntry[] = Object.freeze([
  entry('money-recognize', 'money', [t2(68)]),
  entry('money-total-notes', 'money', [t2(68)]),
  entry('money-exchange', 'money', [t2(68)]),
  entry('money-change-back', 'money', [t2(68)]),
  entry('money-pick-notes', 'money', [t2(68)]),
  entry('money-wp', 'money', [t2(68)]),
]);
