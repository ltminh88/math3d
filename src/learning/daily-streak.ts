// Daily streak (phase 11, pure): the next streak from (last counted run, today).
// A day is a local day number (daily-intervals.ts dayNumber). The streak counts consecutive
// days with a completed run; a missed day restarts it silently at 1 on the next completion —
// the code path that resets it never renders any "lost" copy (that is asserted in e2e).
import type { DailyProgress } from '../store/save-schema';

/** Coins for finishing a counted daily run (once per day; +5 per correct answer). */
export const DAILY_FINISH_COINS = 10;

/** Next streak from (last counted run, today). Same day or a backwards clock: unchanged. */
export function nextDailyStreak(last: DailyProgress, today: number): DailyProgress {
  if (today <= last.lastDailyDay) return last;
  if (today === last.lastDailyDay + 1)
    return { lastDailyDay: today, dailyStreak: last.dailyStreak + 1 };
  return { lastDailyDay: today, dailyStreak: 1 };
}

/** A run was already counted today (a second run is practice only). */
export function dailyCountedToday(daily: DailyProgress | undefined, today: number): boolean {
  return (daily?.lastDailyDay ?? 0) === today;
}
