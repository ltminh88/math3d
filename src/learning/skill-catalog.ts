/**
 * Skills that are not a single × / : fact (word problems, geometry, measurement) still get Leitner
 * stats, under the fact key `sk:<id>`. The catalog is APPEND-ONLY: ids are part of the save code
 * (M3D3 decodes only ids listed here) and of the future SQL check, so an id is never renamed or
 * removed. A new id needs a new save-code version (M3D4), or old clients reject the code.
 * `lessons` is the structured SGK Toán 3 Kết nối tri thức lesson the skill follows
 * (`book`: 1 | 2 = tập 1/2, `n`: lesson numbers). The display string `lesson` is derived from
 * `lessons` by `lessonLabel` — never stored twice — for the sticker book and pool counter.
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

export interface SkillLessonRef {
  readonly book: 1 | 2;
  readonly n: readonly number[];
}

export interface SkillEntry {
  readonly id: string;
  readonly family: SkillFamily;
  readonly lessons: readonly SkillLessonRef[];
  /** Display string derived from `lessons` (see `lessonLabel`). */
  readonly lesson: string;
}

export const SKILL_ID_PATTERN_SOURCE = '[a-z][a-z0-9-]{1,38}';
const SKILL_ID_PATTERN = new RegExp(`^${SKILL_ID_PATTERN_SOURCE}$`);

/** `T1 B24, B28`; a run of 3+ consecutive numbers compresses to `T1 B4-B12`. */
export function lessonLabel(lessons: readonly SkillLessonRef[]): string {
  return lessons.map(({ book, n }) => `T${book} ${formatLessonNumbers(n)}`).join(', ');
}

function formatLessonNumbers(ns: readonly number[]): string {
  const sorted = [...ns].sort((a, b) => a - b);
  const [first, ...rest] = sorted;
  if (first === undefined) return '';
  const parts: string[] = [];
  let start = first;
  let prev = first;
  const flush = () => {
    if (prev - start + 1 >= 3) parts.push(`B${start}-B${prev}`);
    else if (prev === start) parts.push(`B${start}`);
    else parts.push(`B${start}, B${prev}`);
  };
  for (const n of rest) {
    if (n === prev + 1) prev = n;
    else {
      flush();
      start = n;
      prev = n;
    }
  }
  flush();
  return parts.join(', ');
}

const t1 = (...n: number[]): SkillLessonRef => ({ book: 1, n });
const t2 = (...n: number[]): SkillLessonRef => ({ book: 2, n });

const entry = (
  id: string,
  family: SkillFamily,
  lessons: readonly SkillLessonRef[],
): SkillEntry => ({
  id,
  family,
  lessons,
  lesson: lessonLabel(lessons),
});

export const SKILL_CATALOG: readonly SkillEntry[] = Object.freeze([
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
  entry('pattern-skip-count', 'pattern', [t1(4, 5, 6, 7, 8, 9, 10, 11, 12)]),
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
  entry('geo-right-angle', 'geometry', [t1(18)]),
  entry('geo-count-right-angles', 'geometry', [t1(18)]),
  entry('geo-shape-classify', 'geometry', [t1(19)]),
  entry('geo-shape-count', 'geometry', [t1(19)]),
  entry('geo-solid-identify', 'geometry', [t1(21)]),
  entry('geo-solid-parts', 'geometry', [t1(21)]),
  // Measurement (phase 02)
  entry('meas-ruler-read', 'measurement', [t1(30)]),
  entry('meas-mm-convert', 'measurement', [t1(30)]),
  entry('meas-gram', 'measurement', [t1(31)]),
  entry('meas-ml', 'measurement', [t1(32)]),
  entry('meas-temperature', 'measurement', [t1(33)]),
  entry('meas-perimeter-polygon', 'measurement', [t2(50)]),
  entry('meas-perimeter-rect', 'measurement', [t2(50)]),
  entry('meas-perimeter-square', 'measurement', [t2(50)]),
  entry('meas-area-count', 'measurement', [t2(51)]),
  entry('meas-area-rect', 'measurement', [t2(52)]),
  entry('meas-area-square', 'measurement', [t2(52)]),
  entry('meas-wp-fence', 'measurement', [t2(50, 53)]),
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
