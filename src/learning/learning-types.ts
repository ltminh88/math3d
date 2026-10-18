import type { FactKey } from './fact-key';

/** Per-fact learning state. Counters are additive (sync adds them); `box` resolves by newest `lastSeenAt`. */
export interface FactStat {
  attempts: number;
  correct: number;
  totalMs: number;
  /** Leitner box 1..5 */
  box: number;
  lastSeenSession: number;
  lastSeenAt: number;
  /** Consecutive first-try correct answers without hints. */
  streak: number;
  fluent: boolean;
  /** Last 3 wrong answers given for this fact, oldest first. */
  errs: number[];
}

/** Device-only fields the server never receives. */
export interface FactLocalState {
  streak: number;
  fluent: boolean;
  errs: number[];
}

export interface DeltaFact {
  /** attempts in this session */
  a: number;
  /** correct in this session */
  c: number;
  /** total milliseconds in this session */
  ms: number;
  /** resulting Leitner box */
  box: number;
  /** epoch ms of the last attempt */
  seenAt: number;
}

export interface DeltaLevel {
  stars: number;
  bestScore: number;
}

/** Session summary; also the outbox payload sent to `sync_batch`. */
export interface SessionDelta {
  batchId: string;
  profileId: string;
  clientTs: number;
  v: 1;
  facts: Record<FactKey, DeltaFact>;
  levels: Record<string, DeltaLevel>;
  xp: number;
  /** negative on a cosmetic purchase */
  coins: number;
  /** newly owned cosmetic ids */
  cosmetics?: string[];
}
