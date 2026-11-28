import type { Misconception } from '../reasoning/reasoning-types';
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
  /** Last 5 bugs the wrong picks stood for, oldest first (boost Phase 0). Device-only, never in a save code. */
  bugs?: Misconception[];
  /** Bitmask of the last 10 first tries, bit 0 = most recent (1 = correct). Device-only, never in a save code. */
  recent?: number;
  /** How many first tries `recent` actually records (R133): `attempts` also counts retries and seeded/imported attempts the mask never saw, so it must not be the denominator for `recent`. Device-only, never in a save code. */
  recentCount?: number;
  /** Last 24 fingerprints of shown items, newest last. Device-only, never in a save code. */
  seen?: number[];
}

/** Device-only fields the server never receives. */
export interface FactLocalState {
  streak: number;
  fluent: boolean;
  errs: number[];
  bugs?: Misconception[];
  recent?: number;
  recentCount?: number;
  seen?: number[];
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
  /** Level progress counter reached (e.g. bridge segments); merged with max. */
  progress?: number;
  /** Best stars per stage to merge (max wins per stage); stages 2+ are committed by
   * level phases, the test hook seeds them. */
  stageStars?: readonly number[];
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
