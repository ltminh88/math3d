// Local merge (anti-repeat Phase 2): how one session delta fact merges into the
// stored fact row. Extracted pure from progress-repository.ts so the merge rules
// (counters add, box follows the newest `seenAt`, device-only fields carried
// through like `bugs`) are testable without IndexedDB.
import type { FactKey } from '../learning/fact-key';
import type { DeltaFact, FactLocalState, FactStat } from '../learning/learning-types';

/** A stored fact row: the stat plus its identity columns. */
export type FactStatRow = FactStat & { profileId: string; key: FactKey };

/** Pure: merges one session delta fact into the stored row. */
export function mergeFactStat(
  prev: FactStatRow,
  fact: DeltaFact,
  local: FactLocalState | undefined,
  sessionNo: number,
): FactStatRow {
  const newest = fact.seenAt >= prev.lastSeenAt;
  return {
    ...prev,
    attempts: prev.attempts + fact.a,
    correct: prev.correct + fact.c,
    totalMs: prev.totalMs + fact.ms,
    box: newest ? fact.box : prev.box,
    lastSeenAt: Math.max(prev.lastSeenAt, fact.seenAt),
    lastSeenSession: newest ? sessionNo : prev.lastSeenSession,
    streak: local?.streak ?? prev.streak,
    fluent: local?.fluent ?? prev.fluent,
    errs: local?.errs ?? prev.errs,
    bugs: local?.bugs ?? prev.bugs,
    recent: local?.recent ?? prev.recent,
    recentCount: local?.recentCount ?? prev.recentCount,
    seen: local?.seen ?? prev.seen,
  };
}
