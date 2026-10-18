import { describe, expect, it } from 'vitest';
import { questionReward, starsFor } from './scoring';

describe('scoring', () => {
  it('rewards first-try, hinted and wrong answers', () => {
    expect(questionReward({ correct: true, firstTry: true, usedHint: false })).toEqual({
      xp: 10,
      coins: 5,
    });
    expect(questionReward({ correct: true, firstTry: true, usedHint: true })).toEqual({
      xp: 5,
      coins: 5,
    });
    expect(questionReward({ correct: true, firstTry: false, usedHint: false })).toEqual({
      xp: 5,
      coins: 5,
    });
    expect(questionReward({ correct: false, firstTry: false, usedHint: true })).toEqual({
      xp: 0,
      coins: 0,
    });
  });

  it('awards stars at the thresholds', () => {
    const t = (firstTryClean: number, hintsUsed = 0, completed = true) => ({
      total: 10,
      firstTryClean,
      hintsUsed,
      completed,
    });
    expect(starsFor(t(9))).toBe(3);
    expect(starsFor(t(9, 1))).toBe(3);
    expect(starsFor(t(9, 2))).toBe(2);
    expect(starsFor(t(7))).toBe(2);
    expect(starsFor(t(6))).toBe(1);
    expect(starsFor(t(10, 0, false))).toBe(0);
    expect(starsFor({ total: 0, firstTryClean: 0, hintsUsed: 0, completed: true })).toBe(0);
  });
});
