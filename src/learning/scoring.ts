export const XP_FIRST_TRY = 10;
export const XP_WITH_HINT = 5;
export const COINS_PER_CORRECT = 5;

export interface QuestionResult {
  /** Final outcome: false when the answer was revealed or attempts ran out. */
  correct: boolean;
  firstTry: boolean;
  usedHint: boolean;
}

export function questionReward(r: QuestionResult): { xp: number; coins: number } {
  if (!r.correct) return { xp: 0, coins: 0 };
  return { xp: r.firstTry && !r.usedHint ? XP_FIRST_TRY : XP_WITH_HINT, coins: COINS_PER_CORRECT };
}

export interface SessionTally {
  total: number;
  firstTryClean: number;
  hintsUsed: number;
  completed: boolean;
}

/** 3 stars: >= 90% first-try (no hint) and <= 1 hint; 2: >= 70%; 1: completed; 0: abandoned. */
export function starsFor(t: SessionTally): 0 | 1 | 2 | 3 {
  if (!t.completed || t.total <= 0) return 0;
  const ratio = t.firstTryClean / t.total;
  if (ratio >= 0.9 && t.hintsUsed <= 1) return 3;
  if (ratio >= 0.7) return 2;
  return 1;
}
