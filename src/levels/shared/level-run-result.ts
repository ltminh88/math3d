// A finished level run -> the session to commit. Round rewards come from src/learning/scoring.ts
// through the recorder (level rounds only; the bridge quiz keeps its frozen rewards); the first
// completion adds the same one-time bonus the bridge quest pays.
import type { SessionRecorder, SessionResult } from '../../learning/session-recorder';
import { QUEST_COMPLETE_REWARD } from '../../quiz/quiz-rewards';
import type { LevelResult } from './level-types';

/** First completion of a level: +50 XP, +10 coins (same as finishing the bridge quest). */
export const LEVEL_COMPLETE_BONUS = QUEST_COMPLETE_REWARD;

/** The session to commit, or undefined when the run recorded nothing (left before answering). */
export function levelRunToCommit(
  recorder: SessionRecorder,
  result: LevelResult,
  options: { firstCompletion: boolean },
): SessionResult | undefined {
  const run = recorder.finish(result.completed);
  const { delta } = run;
  if (!result.completed && Object.keys(delta.facts).length === 0 && delta.xp === 0) {
    return undefined;
  }
  if (result.completed && options.firstCompletion) {
    delta.xp += LEVEL_COMPLETE_BONUS.xp;
    delta.coins += LEVEL_COMPLETE_BONUS.coins;
  }
  return run;
}
