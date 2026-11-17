// Daily streak tests (phase 11): consecutive / same day / gap / clock-backwards.
// A day is a local day number (daily-intervals.ts dayNumber); the streak never shows a
// penalty — a missed day restarts the count silently at 1 on the next completion.
import { describe, expect, it } from 'vitest';
import type { DailyProgress } from '../store/save-schema';
import { dailyCountedToday, nextDailyStreak } from './daily-streak';

const D = (day: number, streak: number): DailyProgress => ({
  lastDailyDay: day,
  dailyStreak: streak,
});

describe('nextDailyStreak', () => {
  it('starts at 1 on the first counted run', () => {
    expect(nextDailyStreak({ lastDailyDay: 0, dailyStreak: 0 }, 20345)).toEqual({
      lastDailyDay: 20345,
      dailyStreak: 1,
    });
  });

  it('increments on the next consecutive day', () => {
    expect(nextDailyStreak(D(20345, 3), 20346)).toEqual({ lastDailyDay: 20346, dailyStreak: 4 });
  });

  it('is unchanged on the same day (a second run does not extend the streak)', () => {
    const last = D(20345, 3);
    expect(nextDailyStreak(last, 20345)).toEqual(last);
  });

  it('restarts at 1 after a skipped day, with no other trace of the gap', () => {
    expect(nextDailyStreak(D(20345, 7), 20347)).toEqual({ lastDailyDay: 20347, dailyStreak: 1 });
    expect(nextDailyStreak(D(20345, 7), 20400)).toEqual({ lastDailyDay: 20400, dailyStreak: 1 });
  });

  it('a backwards clock never increments the streak and never corrupts it', () => {
    const last = D(20345, 3);
    expect(nextDailyStreak(last, 20344)).toEqual(last);
    expect(nextDailyStreak(last, 20000)).toEqual(last);
  });
});

describe('dailyCountedToday', () => {
  it('is true only on the last counted day', () => {
    expect(dailyCountedToday(D(20345, 2), 20345)).toBe(true);
    expect(dailyCountedToday(D(20345, 2), 20346)).toBe(false);
    expect(dailyCountedToday(undefined, 20345)).toBe(false);
    expect(dailyCountedToday({ lastDailyDay: 0, dailyStreak: 0 }, 20345)).toBe(false);
  });
});
