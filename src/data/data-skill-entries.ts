// Data-family skill entries (phase 15: tables and chance, B73-B74).

import type { SkillEntry } from '../learning/skill-entry';
import { entry, t2 } from '../learning/skill-entry';

/** Data skills, in catalog order. */
export const DATA_ENTRIES: readonly SkillEntry[] = Object.freeze([
  entry('tally-count', 'data', [t2(73)]),
  entry('table-read', 'data', [t2(73)]),
  entry('table-max-min', 'data', [t2(73)]),
  entry('table-sums', 'data', [t2(73)]),
  entry('table-fill-missing', 'data', [t2(73)]),
  entry('chance-bag', 'data', [t2(74)]),
  entry('chance-dice', 'data', [t2(74)]),
]);
