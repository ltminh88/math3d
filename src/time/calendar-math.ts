// Pure integer calendar math (phase 13): leap years, month lengths and weekdays from
// days counted since 0001-01-01 (a Monday). No `Date`, no locale, no timezone — the same
// input gives the same weekday on every machine. Weekdays are 0 = Sunday .. 6 = Saturday.

/** True for leap years (divisible by 4, except centuries unless divisible by 400). */
export function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

const MONTH_DAYS = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31] as const;

/** Days in `month` (1..12) of `year`; February has 29 in a leap year. */
export function daysInMonth(year: number, month: number): number {
  if (month < 1 || month > 12) throw new Error(`calendar: bad month ${month}`);
  return month === 2 && isLeapYear(year) ? 29 : (MONTH_DAYS[month - 1] ?? 31);
}

/** Weekday of a date (0 = Sunday .. 6 = Saturday). */
export function weekdayOf(year: number, month: number, day: number): number {
  const y = year - 1;
  const daysBeforeYear = y * 365 + Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400);
  let daysBeforeMonth = 0;
  for (let m = 1; m < month; m++) daysBeforeMonth += daysInMonth(year, m);
  const days = daysBeforeYear + daysBeforeMonth + (day - 1);
  return (days + 1) % 7;
}

/** Weekday of the 1st of `month` (0 = Sunday .. 6 = Saturday). */
export const firstWeekday = (year: number, month: number): number => weekdayOf(year, month, 1);
