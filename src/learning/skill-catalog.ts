/**
 * Skills that are not a single × / : fact (word problems, geometry, measurement) still get Leitner
 * stats, under the fact key `sk:<id>`. The catalog is APPEND-ONLY: ids are part of the save code
 * (M3D3 decodes only ids listed here) and of the future SQL check, so an id is never renamed or
 * removed. A new id needs no new save-code version (M3D5 is lenient: a well-formed unknown id
 * is dropped on import), but an old client still rejects a code carrying it — old clients only
 * decode up to M3D4.
 * `lessons` is the structured SGK Toán 3 Kết nối tri thức lesson the skill follows
 * (`book`: 1 | 2 = tập 1/2, `n`: lesson numbers). The display string `lesson` is derived from
 * `lessons` by `lessonLabel` — never stored twice — for the sticker book and pool counter.
 * The catalog concatenates the legacy list with one per-family list
 * (`src/<family>/*-skill-entries.ts`); a family phase appends to its own list only.
 * The entry kit lives in `skill-entry.ts` so family lists can build entries without a cycle.
 */
import { ARITHMETIC_ENTRIES } from '../arithmetic/arithmetic-skill-entries';
import { DATA_ENTRIES } from '../data/data-skill-entries';
import { FRACTION_ENTRIES } from '../fractions/fraction-skill-entries';
import { MONEY_ENTRIES } from '../money/money-skill-entries';
import { NUMBER_ENTRIES } from '../numbers/number-skill-entries';
import { TIME_ENTRIES } from '../time/time-skill-entries';
import { entry, type SkillEntry, type SkillFamily, t1, t2 } from './skill-entry';

export type { SkillEntry, SkillFamily, SkillLessonRef } from './skill-entry';
export { lessonLabel } from './skill-entry';

export const SKILL_ID_PATTERN_SOURCE = '[a-z][a-z0-9-]{1,38}';
const SKILL_ID_PATTERN = new RegExp(`^${SKILL_ID_PATTERN_SOURCE}$`);

const LEGACY_CATALOG: readonly SkillEntry[] = Object.freeze([
  // Reasoning (phase 01)
  entry('wp-times-then-add', 'word-problem', [t1(24, 28)]),
  entry('wp-divide-then-add', 'word-problem', [t1(27, 28)]),
  entry('wp-more-less-then-total', 'word-problem', [t1(28)]),
  entry('wp-unit-then-times', 'word-problem', [t1(28)]),
  entry('wp-times-compare', 'word-problem', [t1(39)]),
  entry('div-rem-floor', 'remainder', [t1(25)]),
  entry('div-rem-ceil', 'remainder', [t1(25)]),
  entry('unknown-add-sub', 'unknown', [t1(3)]),
  entry('unknown-mul-div', 'unknown', [t1(13)]),
  // Pattern skills had no lesson number in the old free text ('T1 luyện tập (dãy số)').
  // Mapped to B8, the first luyện tập lesson: it reviews chủ đề 1, whose B1 teaches
  // number sequences (dãy số). Skip-counting is the tables, B4–B12.
  entry('pattern-add', 'pattern', [t1(8)]),
  entry('pattern-sub', 'pattern', [t1(8)]),
  entry('pattern-skip-count', 'pattern', [t1(4, 5, 6, 9, 10, 11, 12)]),
  entry('expr-order', 'expression', [t1(38)]),
  entry('expr-brackets', 'expression', [t1(38)]),
  entry('expr-from-story', 'expression', [t1(38, 42)]),
  entry('choose-all-correct', 'logic', [t1(25, 38, 39)]),
  entry('tf-explain', 'logic', [t1(25, 38, 39)]),
  entry('wp-difference-compare', 'word-problem', [t1(39)]),
  // Geometry (phase 02)
  entry('geo-midpoint', 'geometry', [t1(16)]),
  entry('geo-circle-parts', 'geometry', [t1(17)]),
  entry('geo-radius-diameter', 'geometry', [t1(17)]),
  entry('geo-right-angle', 'geometry', [t1(7), t1(18)]),
  entry('geo-count-right-angles', 'geometry', [t1(18)]),
  entry('geo-shape-classify', 'geometry', [t1(7), t1(19)]),
  entry('geo-shape-count', 'geometry', [t1(19)]),
  entry('geo-solid-identify', 'geometry', [t1(21)]),
  entry('geo-solid-parts', 'geometry', [t1(21)]),
  // Measurement (phase 02)
  entry('meas-ruler-read', 'measurement', [t1(7), t1(30)]),
  entry('meas-mm-convert', 'measurement', [t1(30)]),
  entry('meas-gram', 'measurement', [t1(31)]),
  entry('meas-ml', 'measurement', [t1(32)]),
  entry('meas-temperature', 'measurement', [t1(7), t1(33)]),
  entry('meas-perimeter-polygon', 'measurement', [t2(50)]),
  entry('meas-perimeter-rect', 'measurement', [t2(50)]),
  entry('meas-perimeter-square', 'measurement', [t2(50)]),
  entry('meas-area-count', 'measurement', [t2(51)]),
  entry('meas-area-rect', 'measurement', [t2(52)]),
  entry('meas-area-square', 'measurement', [t2(52)]),
  entry('meas-wp-fence', 'measurement', [t2(50, 53)]),
]);

export const SKILL_CATALOG: readonly SkillEntry[] = Object.freeze([
  ...LEGACY_CATALOG,
  ...NUMBER_ENTRIES,
  ...ARITHMETIC_ENTRIES,
  ...FRACTION_ENTRIES,
  ...TIME_ENTRIES,
  ...MONEY_ENTRIES,
  ...DATA_ENTRIES,
]);

const BY_ID: ReadonlyMap<string, SkillEntry> = new Map(SKILL_CATALOG.map((s) => [s.id, s]));

export type SkillId = string;

export function isSkillId(id: string): boolean {
  return SKILL_ID_PATTERN.test(id) && BY_ID.has(id);
}

export function skillEntry(id: string): SkillEntry | undefined {
  return BY_ID.get(id);
}

export function skillsOfFamily(family: SkillFamily): SkillId[] {
  return SKILL_CATALOG.filter((s) => s.family === family).map((s) => s.id);
}
