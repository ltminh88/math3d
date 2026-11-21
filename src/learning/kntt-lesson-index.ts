/**
 * The static 81-lesson table for SGK Toán 3 Kết nối tri thức, and the derived
 * lesson → fact-key mapping. Skills declare their lessons in the catalog; the table
 * holds only lesson facts, so family phases never edit it. `skillsOfLesson` is the
 * single answer for lesson mode (phase 05/06) and the phase-21 coverage test.
 * `practicable` is a content judgement (can this lesson be practised with MCQ /
 * number-pad items at all); whether it has skills *yet* is `skillsOfLesson(n).length`.
 */
import { divFactsForTables, mulFactsForTables } from './curriculum-tables';
import type { FactKey } from './fact-key';
import { KNTT_LESSONS_TAP1 } from './kntt-lessons-tap1';
import { KNTT_LESSONS_TAP2 } from './kntt-lessons-tap2';
import { SKILL_CATALOG } from './skill-catalog';

export type KnttLessonKind = 'skills' | 'tables' | 'mix';

export interface KnttLesson {
  readonly n: number;
  readonly book: 1 | 2;
  /** Chủ đề 1–16, in textbook order. */
  readonly topic: number;
  /** Short paraphrase (vi ≤ 40 chars), never a copied sentence from the book. */
  readonly titleVi: string;
  readonly titleEn: string;
  readonly kind: KnttLessonKind;
  /** For `tables`: the multiplication/division tables this lesson drills. */
  readonly tables?: readonly number[];
  /** For `mix`: the earlier lessons whose skills this lesson reviews. */
  readonly mixOf?: readonly number[];
  readonly practicable: boolean;
}

export interface KnttTopic {
  readonly id: number;
  readonly nameVi: string;
  readonly nameEn: string;
}

const TOPICS: readonly KnttTopic[] = [
  { id: 1, nameVi: 'Ôn tập và bổ sung', nameEn: 'Review and supplement' },
  { id: 2, nameVi: 'Bảng nhân, bảng chia', nameEn: 'Multiplication and division tables' },
  { id: 3, nameVi: 'Hình phẳng, hình khối', nameEn: 'Plane shapes and solids' },
  { id: 4, nameVi: 'Nhân, chia trong phạm vi 100', nameEn: 'Multiply and divide within 100' },
  { id: 5, nameVi: 'Đơn vị đo', nameEn: 'Units of measure' },
  { id: 6, nameVi: 'Nhân, chia trong phạm vi 1 000', nameEn: 'Multiply and divide within 1 000' },
  { id: 7, nameVi: 'Ôn tập học kì 1', nameEn: 'First-semester review' },
  { id: 8, nameVi: 'Các số đến 10 000', nameEn: 'Numbers to 10 000' },
  { id: 9, nameVi: 'Chu vi, diện tích', nameEn: 'Perimeter and area' },
  {
    id: 10,
    nameVi: 'Cộng, trừ, nhân, chia trong phạm vi 10 000',
    nameEn: 'Operations within 10 000',
  },
  { id: 11, nameVi: 'Các số đến 100 000', nameEn: 'Numbers to 100 000' },
  { id: 12, nameVi: 'Cộng, trừ trong phạm vi 100 000', nameEn: 'Add and subtract within 100 000' },
  {
    id: 13,
    nameVi: 'Đồng hồ, tháng – năm, tiền Việt Nam',
    nameEn: 'Clock, calendar, Vietnamese money',
  },
  {
    id: 14,
    nameVi: 'Nhân, chia trong phạm vi 100 000',
    nameEn: 'Multiply and divide within 100 000',
  },
  { id: 15, nameVi: 'Thống kê, xác suất', nameEn: 'Statistics and chance' },
  { id: 16, nameVi: 'Ôn tập cuối năm', nameEn: 'End-of-year review' },
];

export const ALL_LESSONS: readonly KnttLesson[] = Object.freeze([
  ...KNTT_LESSONS_TAP1,
  ...KNTT_LESSONS_TAP2,
]);

const BY_NUMBER: ReadonlyMap<number, KnttLesson> = new Map(ALL_LESSONS.map((l) => [l.n, l]));

export function lessonByNumber(n: number): KnttLesson | undefined {
  return BY_NUMBER.get(n);
}

export function topicsInOrder(): readonly KnttTopic[] {
  return TOPICS;
}

/**
 * Fact keys that practise lesson `n`, in a stable order: `skills` → catalog skills
 * tagged with this lesson (`sk:<id>`, catalog order); `tables` → the mul/div fact
 * keys of the lesson's tables; `mix` → the union of its `mixOf` lessons, deduped.
 * Throws for an unknown lesson number.
 */
export function skillsOfLesson(n: number): FactKey[] {
  const lesson = BY_NUMBER.get(n);
  if (!lesson) throw new Error(`skillsOfLesson: unknown lesson ${n}`);
  if (lesson.kind === 'tables') {
    const tables = lesson.tables ?? [];
    return [...mulFactsForTables(tables), ...divFactsForTables(tables)];
  }
  if (lesson.kind === 'mix') {
    const keys: FactKey[] = [];
    const seen = new Set<FactKey>();
    for (const m of lesson.mixOf ?? []) {
      for (const k of skillsOfLesson(m)) {
        if (!seen.has(k)) {
          seen.add(k);
          keys.push(k);
        }
      }
    }
    return keys;
  }
  return SKILL_CATALOG.filter((s) =>
    s.lessons.some((ref) => ref.book === lesson.book && ref.n.includes(n)),
  ).map((s) => `sk:${s.id}`);
}
