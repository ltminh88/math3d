// Lesson progress (phase 05): stars are derived from the stats, never stored.
//   1 star: every skill of the lesson attempted; 2 stars: every box >= 3;
//   3 stars: every box >= 4. A `tables` lesson uses its facts' boxes with the 70% share
//   (like the sticker rule): 70% of its facts attempted / at box >= 3 / at box >= 4.
//   "Next lesson" is the first practicable lesson in textbook order that has something
//   playable and is below 3 stars. A lesson with nothing playable yet (its family phase
//   has not landed) is skipped, never pointed at.
import type { FactKey } from './fact-key';
import { ALL_LESSONS, lessonByNumber, skillsOfLesson } from './kntt-lesson-index';
import type { FactStat } from './learning-types';
import { plannableKeys } from './lesson-planner';
import { TABLE_STICKER_SHARE } from './sticker-book';

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

export interface LessonProgressOpts {
  /** True when the key can be shown in the lesson dialog; default: everything renders. */
  renderable?: (key: FactKey) => boolean;
}

/** Stars (0-3) of lesson `n`, derived from the stats. Throws for an unknown lesson. */
export function lessonStars(lessonN: number, stats: Stats): number {
  const lesson = lessonByNumber(lessonN);
  if (!lesson) throw new Error(`lessonStars: unknown lesson ${lessonN}`);
  const keys = skillsOfLesson(lessonN);
  if (keys.length === 0) return 0;
  const boxOf = (k: FactKey): number => stats[k]?.box ?? 1;
  if (lesson.kind === 'tables') {
    const share = (pred: (k: FactKey) => boolean): number => keys.filter(pred).length / keys.length;
    if (share((k) => boxOf(k) >= 4) >= TABLE_STICKER_SHARE) return 3;
    if (share((k) => boxOf(k) >= 3) >= TABLE_STICKER_SHARE) return 2;
    if (share((k) => (stats[k]?.attempts ?? 0) > 0) >= TABLE_STICKER_SHARE) return 1;
    return 0;
  }
  if (keys.every((k) => boxOf(k) >= 4)) return 3;
  if (keys.every((k) => boxOf(k) >= 3)) return 2;
  if (keys.every((k) => (stats[k]?.attempts ?? 0) > 0)) return 1;
  return 0;
}

/** First practicable lesson with something playable and below 3 stars, or undefined. */
export function nextLesson(stats: Stats, opts: LessonProgressOpts = {}): number | undefined {
  const renderable = opts.renderable ?? (() => true);
  for (const lesson of ALL_LESSONS) {
    if (!lesson.practicable) continue;
    if (plannableKeys(lesson.n, renderable).length === 0) continue;
    if (lessonStars(lesson.n, stats) < 3) return lesson.n;
  }
  return undefined;
}

/**
 * One topic's progress: `completed` = its playable lessons at 3 stars, `total` = its
 * playable lessons. A lesson with nothing playable yet counts in neither.
 */
export function topicProgress(
  topic: number,
  stats: Stats,
  opts: LessonProgressOpts = {},
): { completed: number; total: number } {
  const renderable = opts.renderable ?? (() => true);
  const lessons = ALL_LESSONS.filter(
    (l) => l.topic === topic && l.practicable && plannableKeys(l.n, renderable).length > 0,
  );
  return {
    completed: lessons.filter((l) => lessonStars(l.n, stats) >= 3).length,
    total: lessons.length,
  };
}
