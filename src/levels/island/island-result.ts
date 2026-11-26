// Stars shown on the island celebration, from what `startEnglishRun` returns.
// Same thresholds as `starsFor` (scoring.ts): 3 at ≥90% correct, 2 at ≥70%, 1 when the
// run completed, 0 otherwise. The stars the store commits come from the session
// recorder (first-try + hints); this card shows the round ratio, which can only differ
// when the child used hints.
import type { EnglishRunResult } from '../../ui/english/english-run';

export function islandStarsForResult(result: EnglishRunResult): 0 | 1 | 2 | 3 {
  if (!result.completed || result.roundsPlayed <= 0) return 0;
  const ratio = result.correctCount / result.roundsPlayed;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.7) return 2;
  return 1;
}
