// Daily-practice intervals (phase 01): Leitner box -> days between due dates. Mirrors the
// session intervals in session-planner.ts, but on calendar days (lastSeenAt) instead of
// sessions. Phase 11 owns the planner; this module only freezes the numbers.
export const DAILY_BOX_INTERVAL: Readonly<Record<number, number>> = {
  1: 1,
  2: 2,
  3: 4,
  4: 8,
  5: 16,
} as const;

/** Days a box waits before its items are due again (box 1: tomorrow, box 5: 16 days). */
export function dailyIntervalDays(box: number): number {
  return DAILY_BOX_INTERVAL[box] ?? 16;
}

/** Whole calendar days between two epoch-ms timestamps (device-local day boundary). */
export function dayNumber(atMs: number): number {
  const d = new Date(atMs);
  return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86_400_000;
}
