import { describe, expect, it, vi } from 'vitest';
import { mulKey } from '../../learning/fact-key';
import { createSessionRecorder } from '../../learning/session-recorder';
import type { GameStore } from '../../store/game-store-api';
import { firstCompletionBonus, LEVEL_COMPLETE_BONUS, levelRunToCommit } from './level-run-result';

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
  it('a completed run gets scoring rewards and stars (the bonus is decided at commit time)', () => {
    const r = recorder();
    r.recordQuestion(answer());
    r.recordQuestion(answer(true, true));
    const run = levelRunToCommit(r, { completed: true });
    expect(run?.delta.levels).toEqual({ field: { stars: 1, bestScore: 15 } });
    // scoring.ts: 10 first try + 5 with hint, 5 coins per correct.
    expect(run?.delta.xp).toBe(15);
    expect(run?.delta.coins).toBe(10);
  });

  it('the one-time bonus goes to a completed run only while the store has no completion', () => {
    const r = recorder();
    r.recordQuestion(answer());
    const run = levelRunToCommit(r, { completed: true });
    if (!run) throw new Error('expected a run');
    const storeWith = (completedAt: number) =>
      ({
        getSnapshot: () => ({ levelProgress: { field: { completedAt } } }),
      }) as unknown as GameStore;
    const bonus = firstCompletionBonus('field', run);
    expect(bonus(storeWith(0))).toEqual({ xp: 50, coins: 10 });
    expect(bonus(storeWith(1_700_000_000_000))).toEqual({ xp: 0, coins: 0 });
    expect(LEVEL_COMPLETE_BONUS).toEqual({ xp: 50, coins: 10 });
    // A run that did not complete this level (no stars for it) never earns its bonus.
    expect(firstCompletionBonus('forest', run)(storeWith(0))).toEqual({ xp: 0, coins: 0 });
  });

  it('an abandoned run keeps its answers but marks no level progress', () => {
    const r = recorder();
    r.recordQuestion(answer(false));
    const run = levelRunToCommit(r, { completed: false });
    expect(run?.delta.levels).toEqual({});
    expect(run?.delta.xp).toBe(0);
    expect(Object.keys(run?.delta.facts ?? {})).toEqual(['mul:3x4']);
  });

  it('leaving before any answer commits nothing', () => {
    expect(levelRunToCommit(recorder(), { completed: false })).toBe(undefined);
  });

  it('a "completed" run without any recorded round is committed as abandoned', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(levelRunToCommit(recorder(), { completed: true })).toBe(undefined);
    expect(error).toHaveBeenCalledTimes(1);
    error.mockRestore();
  });
});
