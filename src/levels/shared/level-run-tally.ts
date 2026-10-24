// Per-run tally a level shows on its celebration card: rewards and stars of the recorded
// questions, with the same rules the host's session recorder stores (`learning/scoring.ts`).
import { questionReward, type SessionTally, starsFor } from '../../learning/scoring';
import type { QuestionOutcome } from '../../learning/session-recorder';

export function createLevelRunTally() {
  const tally: SessionTally = { total: 0, firstTryClean: 0, hintsUsed: 0, completed: true };
  const earned = { xp: 0, coins: 0 };
  return {
    /** Counts a recorded question and returns its reward (for the "+10 XP" pop). */
    add(outcome: QuestionOutcome): { xp: number; coins: number } {
      const reward = questionReward(outcome);
      earned.xp += reward.xp;
      earned.coins += reward.coins;
      tally.total += 1;
      if (outcome.correct && outcome.firstTry && !outcome.usedHint) tally.firstTryClean += 1;
      if (outcome.usedHint) tally.hintsUsed += 1;
      return reward;
    },
    earned: () => ({ ...earned }),
    stars: () => starsFor(tally),
  };
}

export type LevelRunTally = ReturnType<typeof createLevelRunTally>;
