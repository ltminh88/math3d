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
} as const;

export interface Attempt {
  correct: boolean;
  /** No wrong answer was given earlier for this question. */
  firstTry: boolean;
  usedHint: boolean;
  ms: number;
  /** The wrong answer given, kept in the error bank. */
  wrongAnswer?: number;
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
    attempts: stat.attempts + 1,
    totalMs: stat.totalMs + Math.max(0, Math.round(attempt.ms)),
    lastSeenSession: attempt.sessionNo,
    lastSeenAt: attempt.at,
  };
  if (!attempt.correct) {
    next.box = Math.max(LEITNER.minBox, stat.box - 1);
    next.streak = 0;
    next.fluent = false;
    if (attempt.wrongAnswer !== undefined) {
      next.errs = [...next.errs, attempt.wrongAnswer].slice(-LEITNER.errsKept);
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
