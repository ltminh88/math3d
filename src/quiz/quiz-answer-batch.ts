// A batch of quiz answers committed to the store as one SessionDelta (every 5 questions or when
// the dialog closes). Facts and Leitner boxes come from the learning session recorder; XP, coins
// and bridge progress are the frozen original rewards, never src/learning/scoring.ts.
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import type { FactKey } from '../learning/fact-key';
import type { FactStat, SessionDelta } from '../learning/learning-types';
import {
  createSessionRecorder,
  type QuestionOutcome,
  type SessionResult,
} from '../learning/session-recorder';
import { BRIDGE_LEVEL_ID } from '../store/legacy-save-import';
import { QUEST_COMPLETE_REWARD } from './quiz-rewards';

export interface QuizAnswerBatchOptions {
  profileId: string;
  sessionNo: number;
  getStat: (key: FactKey) => FactStat | undefined;
  now: () => number;
  newId: () => string;
}

export interface QuizAnswerBatch {
  /** Questions recorded so far. */
  readonly size: number;
  recordQuestion(outcome: QuestionOutcome, reward: { xp: number; coins: number }): void;
  setLevelProgress(levelId: string, progress: number): void;
  /** Attempts/correct not yet committed, per fact (for the book and the settings summary). */
  pendingCounts(): Record<FactKey, { attempts: number; correct: number }>;
  /** The delta to commit; built once, so a retry after a failed commit reuses the batchId. */
  finish(): SessionResult;
}

export function createQuizAnswerBatch(opts: QuizAnswerBatchOptions): QuizAnswerBatch {
  const recorder = createSessionRecorder({ ...opts, levelId: BRIDGE_LEVEL_ID });
  const counts: Record<FactKey, { attempts: number; correct: number }> = {};
  const levels: Record<string, number> = {};
  let xp = 0;
  let coins = 0;
  let size = 0;
  let result: SessionResult | undefined;

  return {
    get size() {
      return size;
    },
    recordQuestion(outcome, reward) {
      if (result) throw new Error('quiz answer batch already finished');
      recorder.recordQuestion(outcome);
      const count = counts[outcome.factKey] ?? { attempts: 0, correct: 0 };
      count.attempts += outcome.wrongAnswers.length + (outcome.correct ? 1 : 0);
      count.correct += outcome.correct ? 1 : 0;
      counts[outcome.factKey] = count;
      xp += reward.xp;
      coins += reward.coins;
      size += 1;
    },
    setLevelProgress(levelId, progress) {
      levels[levelId] = Math.max(levels[levelId] ?? 0, progress);
    },
    pendingCounts: () => structuredClone(counts),
    finish() {
      if (!result) {
        // finish(false): the recorder's star rating would complete the level; the bridge
        // completes only by crossing it (questCompleteDelta).
        const recorded = recorder.finish(false);
        const delta: SessionDelta = {
          ...recorded.delta,
          xp,
          coins,
          levels: Object.fromEntries(
            Object.entries(levels).map(([id, progress]) => [
              id,
              { stars: 0, bestScore: 0, progress },
            ]),
          ),
        };
        result = { delta, local: recorded.local };
      }
      return result;
    },
  };
}

/** Crossing the finished bridge: +50 XP, +10 coins, bridge level completed. */
export function questCompleteDelta(profileId: string, batchId: string, now: number): SessionDelta {
  return {
    batchId,
    profileId,
    clientTs: now,
    v: 1,
    facts: {},
    levels: { [BRIDGE_LEVEL_ID]: { stars: 1, bestScore: 0, progress: BRIDGE_SEGMENTS } },
    xp: QUEST_COMPLETE_REWARD.xp,
    coins: QUEST_COMPLETE_REWARD.coins,
  };
}
