// Lesson progress (phase 05): stars are derived from the stats, never stored.
//   1 star: every skill of the lesson attempted; 2 stars: every box >= 3;
//   3 stars: every box >= 4. A `tables` lesson uses its facts' boxes with the 70% share
//   (like the sticker rule): 70% of its facts attempted / at box >= 3 / at box >= 4.
//   "Next lesson" is the first practicable lesson in textbook order that has something
//   playable and is below 3 stars. A lesson with nothing playable yet (its family phase
//   has not landed) is skipped, never pointed at.
import type { FactKey } from './fact-key';
import { isFocusSkillId } from './focus-skills';
import { ALL_LESSONS, lessonByNumber, skillsOfLesson } from './kntt-lesson-index';
import type { FactStat } from './learning-types';
import { plannableKeys } from './lesson-planner';
import { skillEntry } from './skill-catalog';
import { TABLE_STICKER_SHARE } from './sticker-book';
import { weakScore } from './weak-skill-score';

/** A focus skill at or above this weak score may trigger a review (boost, Phase 4A). */
export const FOCUS_REVIEW_MIN_SCORE = 0.4;
/** A review is offered at most once per this many runs. */
export const FOCUS_REVIEW_EVERY_N_RUNS = 3;

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
  // Boost, Phase 4A: a weak focus skill's done lesson reviews first (at most one
  // in three runs) — the picker shows it as "Học tiếp" so progress still moves.
  const review = focusReviewLesson(stats, opts);
  if (review !== undefined) return review;
  for (const lesson of ALL_LESSONS) {
    if (!lesson.practicable) continue;
    if (plannableKeys(lesson.n, renderable).length === 0) continue;
    if (lessonStars(lesson.n, stats) < 3) return lesson.n;
  }
  return undefined;
}

/** The next run's number, from the latest session any fact was seen in. */
const nextRunNo = (stats: Stats): number => {
  let latest = 0;
  for (const s of Object.values(stats)) latest = Math.max(latest, s?.lastSeenSession ?? 0);
  return latest + 1;
};

/** Earliest done lesson teaching the skill, or undefined when none is done. */
const doneLessonOf = (
  skillId: string,
  stats: Stats,
  renderable: (k: FactKey) => boolean,
): number | undefined => {
  const entry = skillEntry(skillId);
  if (!entry) return undefined;
  const lessons: number[] = [];
  for (const ref of entry.lessons) lessons.push(...ref.n);
  lessons.sort((a, b) => a - b);
  for (const n of lessons) {
    if (lessonStars(n, stats) >= 3 && plannableKeys(n, renderable).length > 0) return n;
  }
  return undefined;
};

/**
 * Focus review for "Học tiếp" (boost, Phase 4A): the lesson of the weakest focus
 * skill (weakScore ≥ FOCUS_REVIEW_MIN_SCORE) whose lesson is done, or undefined.
 * At most one in three runs is a review: a review is offered only when the next
 * run's number is a multiple of 3, so after a review the next two runs move on
 * even if the score stays weak.
 */
export function focusReviewLesson(stats: Stats, opts: LessonProgressOpts = {}): number | undefined {
  if (nextRunNo(stats) % FOCUS_REVIEW_EVERY_N_RUNS !== 0) return undefined;
  const renderable = opts.renderable ?? (() => true);
  const weak = (Object.keys(stats) as FactKey[])
    .filter((k) => k.startsWith('sk:') && isFocusSkillId(k.slice(3)))
    .map((k) => ({ key: k, score: weakScore(stats[k] ?? { attempts: 0, correct: 0 }) }))
    .filter((c) => c.score >= FOCUS_REVIEW_MIN_SCORE)
    .sort((a, b) => b.score - a.score || (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));
  for (const { key } of weak) {
    const lesson = doneLessonOf(key.slice(3), stats, renderable);
    if (lesson !== undefined) return lesson;
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
