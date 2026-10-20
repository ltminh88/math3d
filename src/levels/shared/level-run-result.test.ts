import { describe, expect, it } from 'vitest';
import { mulKey } from '../../learning/fact-key';
import { createSessionRecorder } from '../../learning/session-recorder';
import { LEVEL_COMPLETE_BONUS, levelRunToCommit } from './level-run-result';

const recorder = () =>
  createSessionRecorder({
    profileId: 'p1',
    levelId: 'field',
    sessionNo: 4,
    getStat: () => undefined,
    now: () => 1_700_000_000_000,
    newId: () => 'batch-1',
  });

const answer = (correct = true, usedHint = false) => ({
  factKey: mulKey(3, 4),
  ms: 2000,
  correct,
  firstTry: true,
  usedHint,
  wrongAnswers: [],
});

describe('level run result', () => {
  it('a completed first run gets scoring rewards, stars and the one-time bonus', () => {
    const r = recorder();
    r.recordQuestion(answer());
    r.recordQuestion(answer(true, true));
    const run = levelRunToCommit(r, { completed: true }, { firstCompletion: true });
    expect(run?.delta.levels).toEqual({ field: { stars: 1, bestScore: 15 } });
    // scoring.ts: 10 first try + 5 with hint, 5 coins per correct; plus the bonus once.
    expect(run?.delta.xp).toBe(15 + LEVEL_COMPLETE_BONUS.xp);
    expect(run?.delta.coins).toBe(10 + LEVEL_COMPLETE_BONUS.coins);
    expect(LEVEL_COMPLETE_BONUS).toEqual({ xp: 50, coins: 10 });
  });

  it('a repeat completion gets no bonus', () => {
    const r = recorder();
    r.recordQuestion(answer());
    const run = levelRunToCommit(r, { completed: true }, { firstCompletion: false });
    expect(run?.delta.xp).toBe(10);
    expect(run?.delta.coins).toBe(5);
  });

  it('an abandoned run keeps its answers but marks no level progress', () => {
    const r = recorder();
    r.recordQuestion(answer(false));
    const run = levelRunToCommit(r, { completed: false }, { firstCompletion: true });
    expect(run?.delta.levels).toEqual({});
    expect(run?.delta.xp).toBe(0);
    expect(Object.keys(run?.delta.facts ?? {})).toEqual(['mul:3x4']);
  });

  it('leaving before any answer commits nothing', () => {
    expect(levelRunToCommit(recorder(), { completed: false }, { firstCompletion: true })).toBe(
      undefined,
    );
  });
});
