// A finished level run -> the session to commit. Round rewards come from src/learning/scoring.ts
// through the recorder (level rounds only; the bridge quiz keeps its frozen rewards). The first
// completion adds the same one-time bonus the bridge quest pays, decided inside the queued commit
// (progress-sync) from the store as it is then, so two runs behind a stalled queue cannot both
// get it.
import type { SessionRecorder, SessionResult } from '../../learning/session-recorder';
import { QUEST_COMPLETE_REWARD } from '../../quiz/quiz-rewards';
import type { GameStore } from '../../store/game-store-api';
import type { CommitBonus } from '../../ui/pending-session-commits';
import type { LevelResult } from './level-types';

/** First completion of a level: +50 XP, +10 coins (same as finishing the bridge quest). */
export const LEVEL_COMPLETE_BONUS = QUEST_COMPLETE_REWARD;
const NO_BONUS = { xp: 0, coins: 0 } as const;

/** The session to commit, or undefined when the run recorded nothing (left before answering). */
export function levelRunToCommit(
  recorder: SessionRecorder,
  result: LevelResult,
): SessionResult | undefined {
  const run = recorder.finish(result.completed);
  if (Object.keys(run.delta.facts).length > 0 || run.delta.xp > 0) return run;
  // No round recorded. A "completed" exit is a level bug: nothing earned stars, completedAt or
  // the bonus, so it is handled like leaving before answering (abandoned, nothing to commit).
  if (result.completed) console.error('Level reported completed without a recorded round');
  return undefined;
}

/**
 * The first-completion bonus for `run`, decided against the store at commit time: only a run that
 * completes `levelId` (stars >= 1, which is what sets `completedAt`) while the store has no
 * completion of it yet.
 */
export function firstCompletionBonus(levelId: string, run: SessionResult): CommitBonus {
  return (store: GameStore) => {
    const completes = (run.delta.levels[levelId]?.stars ?? 0) >= 1;
    const done = (store.getSnapshot().levelProgress[levelId]?.completedAt ?? 0) > 0;
    return completes && !done ? LEVEL_COMPLETE_BONUS : NO_BONUS;
  };
}
