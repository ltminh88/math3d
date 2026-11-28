// Focus skills (boost, Phase 4A): the fixed set the daily planner and "Học tiếp"
// lean toward. Add/sub ids (B2, B54/55/63/64 calc + the 1A/2A/3A formats) plus the
// length ids (meas-ruler-read, meas-mm-convert, every meas-len-*). Which skills
// inside the set are weak is computed from the stats (weak-skill-score.ts); the
// set itself is a constant (author decision D2). Every id must be a catalog id
// with a generator — pinned by focus-skills.test.ts.
import { hasGenerator } from './lesson-planner';
import { isSkillId } from './skill-catalog';

/** Add/sub ids: B2 mental/1000/wp/chain + find-error/missing-digit, B54/55/63/64 calc. */
const ADD_SUB_BASE: readonly string[] = [
  'add-sub-mental-round',
  'add-sub-1000',
  'add-sub-1000-wp',
  'add-sub-1000-chain',
  'add-sub-find-error',
  'add-missing-digit',
  'add-4digit',
  'sub-4digit',
  'add-sub-10000-wp',
  'add-5digit',
  'sub-5digit',
  'add-sub-100000-wp',
];

/** Add/sub formats (1A/2A/3A): bug-choice, true-false, compare-estimate, number-line, */
/** bar-model, column, match, and the 10000/100000 bug-choice variants. */
const ADD_SUB_FORMATS: readonly string[] = [
  'add-sub-bug-choice',
  'add-sub-true-false',
  'add-sub-compare-estimate',
  'add-sub-number-line',
  'add-sub-bar-model-wp',
  'add-sub-column',
  'add-sub-match',
  'add-sub-10000-bug-choice',
  'add-sub-100000-bug-choice',
];

/** Length ids: the two B7/B30 measurement skills plus every length-ladder id. */
const LENGTH: readonly string[] = [
  'meas-ruler-read',
  'meas-mm-convert',
  'meas-len-ladder',
  'meas-len-convert',
  'meas-len-convert-far',
  'meas-len-compare',
  'meas-len-order',
  'meas-len-choose-unit',
  'meas-len-mixed',
  'meas-len-add-sub',
];

export const FOCUS_SKILL_IDS: readonly string[] = Object.freeze([
  ...ADD_SUB_BASE,
  ...ADD_SUB_FORMATS,
  ...LENGTH,
]);

const FOCUS_SET: ReadonlySet<string> = new Set(FOCUS_SKILL_IDS);

/** True when the id is in the fixed focus set (and a catalog id). */
export function isFocusSkillId(id: string): boolean {
  return FOCUS_SET.has(id);
}

/** True when the fact key is a focus skill (`sk:<id>` in the set). */
export function isFocusSkillKey(key: string): boolean {
  return key.startsWith('sk:') && isFocusSkillId(key.slice(3));
}

/** The focus group of an id: length skills are the `meas-*` ids, the rest add/sub. */
export function focusGroupOf(id: string): 'add-sub' | 'length' {
  return id.startsWith('meas-') ? 'length' : 'add-sub';
}

/** Every focus id is a catalog id with a generator (guards a typo in the list). */
export function focusSkillsValid(): boolean {
  return FOCUS_SKILL_IDS.every((id) => isSkillId(id) && hasGenerator(`sk:${id}`));
}
