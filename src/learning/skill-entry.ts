/**
 * The entry kit for the skill catalog (phase 02): the `SkillFamily` union, the structured
 * SGK lesson reference, the `entry` builder and the `lessonLabel` derivation. It lives apart
 * from `skill-catalog.ts` so the per-family lists (`src/<family>/*-skill-entries.ts`) can
 * build entries without importing the catalog (which imports those lists — a cycle).
 * The catalog is APPEND-ONLY: ids are part of the save code (M3D3 decodes only ids listed
 * here) and of the future SQL check, so an id is never renamed or removed. A new id needs
 * a new save-code version (M3D4), or old clients reject the code.
 */
export type SkillFamily =
  | 'word-problem'
  | 'remainder'
  | 'unknown'
  | 'pattern'
  | 'expression'
  | 'logic'
  | 'geometry'
  | 'measurement'
  | 'number'
  | 'arithmetic'
  | 'fraction'
  | 'time'
  | 'money'
  | 'data';

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

export const t1 = (...n: number[]): SkillLessonRef => ({ book: 1, n });
export const t2 = (...n: number[]): SkillLessonRef => ({ book: 2, n });

export const entry = (
  id: string,
  family: SkillFamily,
  lessons: readonly SkillLessonRef[],
): SkillEntry => ({
  id,
  family,
  lessons,
  lesson: lessonLabel(lessons),
});
