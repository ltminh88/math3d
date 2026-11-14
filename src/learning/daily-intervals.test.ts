import { describe, expect, it } from 'vitest';
import { DAILY_BOX_INTERVAL, dailyIntervalDays, dayNumber } from './daily-intervals';

describe('daily intervals', () => {
  it('mirrors the session intervals, on days', () => {
    expect(DAILY_BOX_INTERVAL).toEqual({ 1: 1, 2: 2, 3: 4, 4: 8, 5: 16 });
    expect(dailyIntervalDays(1)).toBe(1);
    expect(dailyIntervalDays(5)).toBe(16);
    expect(dailyIntervalDays(99)).toBe(16);
  });

  it('dayNumber counts whole local days', () => {
    const a = new Date(2026, 10, 13, 8, 30).getTime();
    const b = new Date(2026, 10, 13, 23, 59).getTime();
    const c = new Date(2026, 10, 14, 0, 1).getTime();
    expect(dayNumber(b)).toBe(dayNumber(a));
    expect(dayNumber(c)).toBe(dayNumber(a) + 1);
  });
});
