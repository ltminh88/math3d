// Hand fixtures for the pure calendar math (phase 13): leap years, month lengths and
// weekdays checked against the real calendar (2026-01-01 is a Thursday, 2024-02-29 is
// a Thursday, 2026-03-01 is a Sunday). No `Date` is used by the helper itself.
import { describe, expect, it } from 'vitest';
import { daysInMonth, firstWeekday, isLeapYear, weekdayOf } from './calendar-math';

describe('calendar math', () => {
  it('leap years: divisible by 4, except centuries unless divisible by 400', () => {
    expect(isLeapYear(2024)).toBe(true);
    expect(isLeapYear(2025)).toBe(false);
    expect(isLeapYear(1900)).toBe(false);
    expect(isLeapYear(2000)).toBe(true);
    expect(isLeapYear(2100)).toBe(false);
  });

  it('month lengths: 30/31, February 29 in a leap year', () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2025, 2)).toBe(28);
    expect(daysInMonth(2024, 4)).toBe(30);
    expect(daysInMonth(2024, 1)).toBe(31);
    expect(daysInMonth(2026, 11)).toBe(30);
    expect(daysInMonth(2027, 12)).toBe(31);
    expect(() => daysInMonth(2026, 13)).toThrow();
  });

  it('weekdays by hand (0 = Sunday): 2026-01-01 Thursday, 2024-02-29 Thursday', () => {
    expect(weekdayOf(2026, 1, 1)).toBe(4);
    expect(weekdayOf(2024, 1, 1)).toBe(1);
    expect(weekdayOf(2024, 2, 1)).toBe(4);
    expect(weekdayOf(2024, 2, 29)).toBe(4);
    expect(weekdayOf(2025, 3, 1)).toBe(6);
    expect(weekdayOf(2026, 3, 1)).toBe(0);
    expect(weekdayOf(2026, 3, 15)).toBe(0);
    expect(weekdayOf(2026, 2, 28)).toBe(6);
    expect(weekdayOf(2027, 12, 25)).toBe(6);
    expect(weekdayOf(2025, 12, 31)).toBe(3);
  });

  it('first weekday of a month is the weekday of its 1st', () => {
    expect(firstWeekday(2026, 3)).toBe(0);
    expect(firstWeekday(2024, 2)).toBe(4);
    expect(firstWeekday(2025, 3)).toBe(6);
  });
});
