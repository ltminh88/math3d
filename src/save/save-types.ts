// Shape of the v1 save stored under SAVE_KEY (user-facing contract; key order matters for JSON).

/** Stats key for a multiplication fact: `m{table}_{factor}`, e.g. `m7_8`. */
export type StatKey = `m${number}_${number}`;

/** Matches a valid stats/review key: tables 2..10, factors 1..10. */
export const STAT_KEY_PATTERN = /^m([2-9]|10)_([1-9]|10)$/;

export interface QuestionStat {
  attempts: number;
  correct: number;
  wrong: number;
  responseTime: number;
  /** ISO timestamp of the last answer, or '' when unknown. */
  lastAnsweredAt: string;
}

export type Avatar = 'boy' | 'girl';

export interface SaveV1 {
  version: 1;
  xp: number;
  coins: number;
  /** Bridge segments built, 0..BRIDGE_SEGMENTS. */
  bridge: number;
  questAccepted: boolean;
  questComplete: boolean;
  avatar: Avatar;
  /** Selected table, or 0 for all tables. */
  table: number;
  sound: boolean;
  music: boolean;
  combo: number;
  questionStats: Record<string, QuestionStat>;
  /** Fact ids queued for review (answered wrong, not yet cleared). */
  review: string[];
  started: boolean;
}
