import type { Misconception } from '../reasoning/reasoning-types';
import type { FactStat } from './learning-types';

/** All tuning knobs in one place; playtesting (phase 10) adjusts these only. */
export const LEITNER = {
  minBox: 1,
  maxBox: 5,
  /** First-try correct under this advances the box. */
  advanceMs: 8000,
  /** First-try correct under this marks the fact fluent. */
  fluentMs: 3000,
  errsKept: 3,
  /** Bugs kept per fact (oldest first). */
  bugsKept: 5,
  /** First tries kept in the `recent` bitmask. */
  recentKept: 10,
} as const;

export interface Attempt {
  correct: boolean;
  /** No wrong answer was given earlier for this question. */
  firstTry: boolean;
  usedHint: boolean;
  ms: number;
  /** The wrong answer given, kept in the error bank. */
  wrongAnswer?: number;
  /** The bug the wrong pick stands for, kept in the bug bank (boost Phase 0). */
  bug?: Misconception;
  sessionNo: number;
  /** epoch ms */
  at: number;
}

export function newFactStat(): FactStat {
  return {
    attempts: 0,
    correct: 0,
    totalMs: 0,
    box: LEITNER.minBox,
    lastSeenSession: 0,
    lastSeenAt: 0,
    streak: 0,
    fluent: false,
    errs: [],
  };
}

/** Pure: returns a new stat. Counters are additive totals (never averages) so sync can add them. */
export function applyAttempt(stat: FactStat, attempt: Attempt): FactStat {
  const next: FactStat = {
    ...stat,
    errs: stat.errs.slice(),
    bugs: stat.bugs?.slice(),
    attempts: stat.attempts + 1,
    totalMs: stat.totalMs + Math.max(0, Math.round(attempt.ms)),
    lastSeenSession: attempt.sessionNo,
    lastSeenAt: attempt.at,
  };
  // The first attempt of a question decides its first try: shift the recent
  // bitmask once per question (bit 0 = most recent, 1 = correct). The recorder
  // passes firstTry per attempt, so this runs exactly once per question.
  if (attempt.firstTry) {
    const mask = (1 << LEITNER.recentKept) - 1;
    next.recent = (((stat.recent ?? 0) << 1) | (attempt.correct ? 1 : 0)) & mask;
  }
  if (!attempt.correct) {
    next.box = Math.max(LEITNER.minBox, stat.box - 1);
    next.streak = 0;
    next.fluent = false;
    if (attempt.wrongAnswer !== undefined) {
      next.errs = [...next.errs, attempt.wrongAnswer].slice(-LEITNER.errsKept);
    }
    if (attempt.bug !== undefined) {
      next.bugs = [...(stat.bugs ?? []), attempt.bug].slice(-LEITNER.bugsKept);
    }
    return next;
  }
  next.correct = stat.correct + 1;
  const clean = attempt.firstTry && !attempt.usedHint;
  if (clean && attempt.ms < LEITNER.advanceMs) next.box = Math.min(LEITNER.maxBox, stat.box + 1);
  next.streak = clean ? stat.streak + 1 : 0;
  if (clean && attempt.ms < LEITNER.fluentMs) next.fluent = true;
  return next;
}
