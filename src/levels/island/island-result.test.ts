// Stars shown on the island celebration, from what `startEnglishRun` returns.
// Same thresholds as `starsFor` (scoring.ts): 3 at ≥90% correct, 2 at ≥70%, 1 when the
// run completed, 0 otherwise. The stars the store commits come from the session
// recorder (first-try + hints); this card shows the round ratio, which can only differ
// when the child used hints.
import { describe, expect, it } from 'vitest';
import { islandStarsForResult } from './island-result';

describe('islandStarsForResult', () => {
  it('0 when the run did not complete, or played no round', () => {
    expect(islandStarsForResult({ completed: false, roundsPlayed: 8, correctCount: 8 })).toBe(0);
    expect(islandStarsForResult({ completed: true, roundsPlayed: 0, correctCount: 0 })).toBe(0);
    expect(islandStarsForResult({ completed: false, roundsPlayed: 0, correctCount: 0 })).toBe(0);
  });

  it('3 at 8/8, 2 at 6/8, 1 below 70% when completed', () => {
    expect(islandStarsForResult({ completed: true, roundsPlayed: 8, correctCount: 8 })).toBe(3);
    expect(islandStarsForResult({ completed: true, roundsPlayed: 8, correctCount: 7 })).toBe(2);
    expect(islandStarsForResult({ completed: true, roundsPlayed: 8, correctCount: 6 })).toBe(2);
    expect(islandStarsForResult({ completed: true, roundsPlayed: 8, correctCount: 5 })).toBe(1);
    expect(islandStarsForResult({ completed: true, roundsPlayed: 8, correctCount: 0 })).toBe(1);
  });
});
