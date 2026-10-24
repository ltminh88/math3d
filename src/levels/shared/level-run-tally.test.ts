import { describe, expect, it } from 'vitest';
import type { QuestionOutcome } from '../../learning/session-recorder';
import { createLevelRunTally } from './level-run-tally';

const outcome = (o: Partial<QuestionOutcome> = {}): QuestionOutcome => ({
  factKey: 'mul:7x8',
  ms: 1000,
  correct: true,
  firstTry: true,
  usedHint: false,
  wrongAnswers: [],
  ...o,
});

describe('level run tally (celebration stars and rewards)', () => {
  it('a clean run earns three stars and sums the rewards', () => {
    const tally = createLevelRunTally();
    for (let i = 0; i < 5; i++) expect(tally.add(outcome())).toEqual({ xp: 10, coins: 5 });
    expect(tally.stars()).toBe(3);
    expect(tally.earned()).toEqual({ xp: 50, coins: 25 });
  });

  it('follows the recorder rule: hints and reveals lower the stars', () => {
    const tally = createLevelRunTally();
    tally.add(outcome());
    tally.add(outcome({ usedHint: true, firstTry: false }));
    tally.add(outcome({ correct: false, usedHint: true, firstTry: false }));
    expect(tally.stars()).toBe(1);
    expect(tally.earned()).toEqual({ xp: 15, coins: 10 });
  });
});
