// Write-through queue between the UI's progress view and the game store.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { QuestionOutcome } from '../learning/session-recorder';
import type { GameStore } from '../store/game-store';

const { showToast } = vi.hoisted(() => ({ showToast: vi.fn() }));
vi.mock('./toast-and-persist', () => ({ showToast }));

const reward = { xp: 10, coins: 5 };
const outcome = (factKey: string, correct = true): QuestionOutcome => ({
  factKey,
  ms: 1200,
  correct,
  firstTry: correct,
  usedHint: false,
  wrongAnswers: correct ? [] : [7],
});

/**
 * Fresh progress-sync module state (queue, batches, game state). Store classes come from the same
 * module graph so `instanceof` checks inside progress-sync hold.
 */
async function freshSync() {
  vi.resetModules();
  const [sync, { gameState }, { InvalidDeltaError }, { openGameStore }, memory, replacement] =
    await Promise.all([
      import('./progress-sync'),
      import('./game-state'),
      import('../store/delta-validation'),
      import('../store/game-store'),
      import('../store/memory-database'),
      import('../store/profile-replacement'),
    ]);
  const { createMemoryGameDb } = memory;
  const { emptyProgressRecords } = replacement;
  return {
    sync,
    gameState,
    InvalidDeltaError,
    openGameStore,
    createMemoryGameDb,
    emptyProgressRecords,
  };
}

beforeEach(() => {
  showToast.mockClear();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

describe('progress-sync', () => {
  it('a write before any store is connected reports the failure', async () => {
    const { sync } = await freshSync();
    expect(await sync.saveAvatar('girl')).toBe(false);
    expect(showToast).toHaveBeenCalledTimes(1);
  });

  it('a batch the store refuses for good is dropped, later batches still commit', async () => {
    const { sync, gameState, InvalidDeltaError, openGameStore, createMemoryGameDb } =
      await freshSync();
    const store = await openGameStore({ db: createMemoryGameDb() });
    let poisoned = '';
    const realCommit = store.commitSession;
    const failing: GameStore = {
      ...store,
      commitSession(delta, local) {
        poisoned ||= delta.batchId;
        if (delta.batchId === poisoned) return Promise.reject(new InvalidDeltaError('test'));
        return realCommit(delta, local);
      },
    };
    sync.connectStore(failing);
    gameState.quizMode = 'practice';
    sync.recordQuizQuestion(outcome('mul:2x3'), reward);
    expect(await sync.flushProgress()).toBe(false);
    expect(showToast).toHaveBeenCalledTimes(1);
    sync.recordQuizQuestion(outcome('mul:4x5'), reward);
    expect(await sync.flushProgress()).toBe(true);
    expect(store.getSnapshot().wallet).toEqual({ xp: 10, coins: 5 });
    expect(Object.keys(store.getSnapshot().factStats)).toEqual(['mul:4x5']);
    expect(Object.keys(sync.factCountsView())).toEqual(['mul:4x5']);
    store.close();
  });

  it('a correct bridge answer is committed at once', async () => {
    const { sync, gameState, openGameStore, createMemoryGameDb } = await freshSync();
    const store = await openGameStore({ db: createMemoryGameDb() });
    sync.connectStore(store);
    gameState.quizMode = 'bridge';
    gameState.progress.bridge = 1;
    sync.recordQuizQuestion(outcome('mul:2x3'), reward);
    expect(await sync.saveGameMeta({})).toBe(true);
    expect(store.getSnapshot().wallet).toEqual({ xp: 10, coins: 5 });
    expect(store.getSnapshot().levelProgress.bridge?.progress).toBe(1);
    store.close();
  });

  it('another tab switching the profile drops pending answers, re-hydrates and notifies', async () => {
    const { sync, gameState, openGameStore, createMemoryGameDb, emptyProgressRecords } =
      await freshSync();
    const db = createMemoryGameDb();
    const tab = await openGameStore({ db });
    const other = await openGameStore({ db });
    const switched = vi.fn();
    sync.connectStore(tab, { onProfileSwitched: switched });
    gameState.quizMode = 'practice';
    gameState.progress.xp = 999;
    sync.recordQuizQuestion(outcome('mul:2x3'), reward);
    await other.replaceProgress({ ...emptyProgressRecords(), wallet: { xp: 40, coins: 3 } });
    expect(await sync.flushProgress()).toBe(false);
    expect(switched).toHaveBeenCalledTimes(1);
    expect(showToast).not.toHaveBeenCalled();
    expect(gameState.progress.xp).toBe(40);
    expect(sync.factCountsView()).toEqual({});
    expect(await sync.saveGameMeta({ started: true })).toBe(true);
    expect(other.getSnapshot().profile.id).toBe(tab.getSnapshot().profile.id);
    tab.close();
  });

  it('a level run commits after pending quiz answers and adds its rewards to the view', async () => {
    const { sync, gameState, openGameStore, createMemoryGameDb } = await freshSync();
    const { createSessionRecorder } = await import('../learning/session-recorder');
    const store = await openGameStore({ db: createMemoryGameDb() });
    sync.connectStore(store);
    gameState.quizMode = 'practice';
    sync.recordQuizQuestion(outcome('mul:2x3'), reward);
    const recorder = createSessionRecorder({
      profileId: store.getSnapshot().profile.id,
      levelId: 'field',
      sessionNo: store.nextSessionNo(),
      getStat: () => undefined,
      now: Date.now,
      newId: () => 'level-run-1',
    });
    recorder.recordQuestion(outcome('mul:3x4'));
    expect(await sync.commitLevelRun(recorder.finish(true))).toBe(true);
    const snapshot = store.getSnapshot();
    expect(Object.keys(snapshot.factStats).sort()).toEqual(['mul:2x3', 'mul:3x4']);
    expect(snapshot.levelProgress.field?.completedAt).toBeGreaterThan(0);
    expect(snapshot.wallet).toEqual({ xp: 20, coins: 10 });
    expect(gameState.progress.xp).toBe(10);
    store.close();
  });
});
