/**
 * Skills that are not a single × / : fact (word problems, geometry, measurement) still get Leitner
 * stats, under the fact key `sk:<id>`. The catalog is APPEND-ONLY: ids are part of the save code
 * (M3D3 decodes only ids listed here) and of the future SQL check, so an id is never renamed or
 * removed. A new id needs a new save-code version (M3D4), or old clients reject the code.
 * `lesson` is the SGK Toán 3 Kết nối tri thức lesson (T1/T2 = tập 1/2) the skill follows.
 */
export type SkillFamily =
  | 'word-problem'
  | 'remainder'
  | 'unknown'
  | 'pattern'
  | 'expression'
  | 'logic'
  | 'geometry'
  | 'measurement';

export interface SkillEntry {
  readonly id: string;
  readonly family: SkillFamily;
  readonly lesson: string;
}

export const SKILL_ID_PATTERN_SOURCE = '[a-z][a-z0-9-]{1,38}';
const SKILL_ID_PATTERN = new RegExp(`^${SKILL_ID_PATTERN_SOURCE}$`);

const entry = (id: string, family: SkillFamily, lesson: string): SkillEntry => ({
  id,
  family,
  lesson,
});

export const SKILL_CATALOG: readonly SkillEntry[] = Object.freeze([
  // Reasoning (phase 01)
  entry('wp-times-then-add', 'word-problem', 'T1 B24, B28'),
  entry('wp-divide-then-add', 'word-problem', 'T1 B27, B28'),
  entry('wp-more-less-then-total', 'word-problem', 'T1 B28'),
  entry('wp-unit-then-times', 'word-problem', 'T1 B28'),
  entry('wp-times-compare', 'word-problem', 'T1 B39'),
  entry('div-rem-floor', 'remainder', 'T1 B25'),
  entry('div-rem-ceil', 'remainder', 'T1 B25'),
  entry('unknown-add-sub', 'unknown', 'T1 B3'),
  entry('unknown-mul-div', 'unknown', 'T1 B13'),
  entry('pattern-add', 'pattern', 'T1 luyện tập (dãy số)'),
  entry('pattern-sub', 'pattern', 'T1 luyện tập (dãy số)'),
  entry('pattern-skip-count', 'pattern', 'T1 B4-B12 (bảng nhân)'),
  entry('expr-order', 'expression', 'T1 B38'),
  entry('expr-brackets', 'expression', 'T1 B38'),
  entry('expr-from-story', 'expression', 'T1 B38, B42'),
  entry('choose-all-correct', 'logic', 'T1 B25, B38, B39'),
  entry('tf-explain', 'logic', 'T1 B25, B38, B39'),
  entry('wp-difference-compare', 'word-problem', 'T1 B39'),
  // Geometry (phase 02)
  entry('geo-midpoint', 'geometry', 'T1 B16'),
  entry('geo-circle-parts', 'geometry', 'T1 B17'),
  entry('geo-radius-diameter', 'geometry', 'T1 B17'),
  entry('geo-right-angle', 'geometry', 'T1 B18'),
  entry('geo-count-right-angles', 'geometry', 'T1 B18'),
  entry('geo-shape-classify', 'geometry', 'T1 B19'),
  entry('geo-shape-count', 'geometry', 'T1 B19'),
  entry('geo-solid-identify', 'geometry', 'T1 B21'),
  entry('geo-solid-parts', 'geometry', 'T1 B21'),
  // Measurement (phase 02)
  entry('meas-ruler-read', 'measurement', 'T1 B30'),
  entry('meas-mm-convert', 'measurement', 'T1 B30'),
  entry('meas-gram', 'measurement', 'T1 B31'),
  entry('meas-ml', 'measurement', 'T1 B32'),
  entry('meas-temperature', 'measurement', 'T1 B33'),
  entry('meas-perimeter-polygon', 'measurement', 'T2 B50'),
  entry('meas-perimeter-rect', 'measurement', 'T2 B50'),
  entry('meas-perimeter-square', 'measurement', 'T2 B50'),
  entry('meas-area-count', 'measurement', 'T2 B51'),
  entry('meas-area-rect', 'measurement', 'T2 B52'),
  entry('meas-area-square', 'measurement', 'T2 B52'),
  entry('meas-wp-fence', 'measurement', 'T2 B50, B53'),
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
