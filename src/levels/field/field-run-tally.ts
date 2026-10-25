// Per-run tally of finished rounds for the celebration card (stars follow scoring.ts; the stored
// stars come from the host's session recorder, which applies the same rule).
import { starsFor } from '../../learning/scoring';
import type { QuestionOutcome } from '../../learning/session-recorder';

export function createRunTally() {
  const tally = { total: 0, correct: 0, firstTryClean: 0, hintsUsed: 0 };
  return {
    add(outcome: QuestionOutcome): void {
      tally.total += 1;
      if (outcome.correct) tally.correct += 1;
      if (outcome.correct && outcome.firstTry && !outcome.usedHint) tally.firstTryClean += 1;
      if (outcome.usedHint) tally.hintsUsed += 1;
    },
    stars: () => starsFor({ ...tally, completed: true }),
    score: () => ({ correct: tally.correct, total: tally.total }),
  };
}

export type FieldRunTally = ReturnType<typeof createRunTally>;
