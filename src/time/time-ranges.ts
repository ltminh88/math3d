// Value ranges and small pure helpers for the time family (phase 13). Weekdays are
// 0 = Sunday .. 6 = Saturday, matching `weekdayOf` in calendar-math.ts.
export const ROMAN: readonly string[] = [
  '',
  'I',
  'II',
  'III',
  'IV',
  'V',
  'VI',
  'VII',
  'VIII',
  'IX',
  'X',
  'XI',
  'XII',
];

/** The Roman numeral for an hour 1..12. */
export const romanFor = (h: number): string => ROMAN[h] ?? '';

/** Calendar years the textbook's calendar pages use (2024 is the leap year). */
export const YEARS = [2024, 2025, 2026, 2027] as const;
/** Non-leap years (February has 28 days). */
export const NON_LEAP_YEARS = [2025, 2026, 2027] as const;
/** The leap year (February has 29 days). */
export const LEAP_YEAR = 2024;

/** Layout hint for the phase-17 scene renderer, in px per unit. */
export const MIN_UNIT_PX = 24;
/** Longest elapsed span a clock-elapsed item asks for, in minutes (inside the 100 cap). */
export const MAX_ELAPSED_MIN = 100;

/** Minutes after midnight on a 12-hour face (12 means 720, never 0). */
export const toMinutes12 = (h: number, m: number): number => (h === 12 ? 720 : h * 60) + m;

/** The 12-hour face reading of `totalMin` minutes after midnight (1:00..12:59). */
export const clock12 = (totalMin: number): { h: number; m: number } => ({
  h: ((Math.floor(totalMin / 60) - 1) % 12) + 1,
  m: totalMin % 60,
});

/** "8:15" (hour without a leading zero, minutes two digits). */
export const digitalText = (h: number, m: number): string => `${h}:${String(m).padStart(2, '0')}`;
