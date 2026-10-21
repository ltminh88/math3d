// Write-through queue between the UI's progress view and the game store.
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createSessionRecorder, type QuestionOutcome } from '../learning/session-recorder';
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
    expect(await sync.commitLevelRun(recorder.finish(true))).toMatchObject({ xp: 10, coins: 5 });
    const snapshot = store.getSnapshot();
    expect(Object.keys(snapshot.factStats).sort()).toEqual(['mul:2x3', 'mul:3x4']);
    expect(snapshot.levelProgress.field?.completedAt).toBeGreaterThan(0);
    expect(snapshot.wallet).toEqual({ xp: 20, coins: 10 });
    expect(gameState.progress.xp).toBe(10);
    store.close();
  });

  it('a level run whose commit fails for now is kept and retried by the next flush', async () => {
    const { sync, gameState, openGameStore, createMemoryGameDb } = await freshSync();
    const store = await openGameStore({ db: createMemoryGameDb() });
    let failures = 1;
    const flaky: GameStore = {
      ...store,
      commitSession(delta, local) {
        if (failures-- > 0) return Promise.reject(new Error('transient: connection closing'));
        return store.commitSession(delta, local);
      },
    };
    sync.connectStore(flaky);
    expect(await sync.commitLevelRun(levelRun(store, 'run-1'))).toBeFalsy();
    expect(store.getSnapshot().levelProgress.field).toBeUndefined();
    expect(await sync.flushProgress()).toBe(true);
    expect(store.getSnapshot().levelProgress.field?.completedAt).toBeGreaterThan(0);
    expect(store.getSnapshot().wallet).toEqual({ xp: 10, coins: 5 });
    expect(gameState.progress.xp).toBe(10);
    store.close();
  });

  it('two completed runs behind a stalled queue get the first-completion bonus once', async () => {
    const { sync, openGameStore, createMemoryGameDb } = await freshSync();
    const { firstCompletionBonus } = await import('../levels/shared/level-run-result');
    const store = await openGameStore({ db: createMemoryGameDb() });
    let failures = 1;
    const stalled: GameStore = {
      ...store,
      commitSession(delta, local) {
        if (failures-- > 0) return Promise.reject(new Error('transient: quota'));
        return store.commitSession(delta, local);
      },
    };
    sync.connectStore(stalled);
    const first = levelRun(store, 'run-1');
    const second = levelRun(store, 'run-2');
    expect(await sync.commitLevelRun(first, firstCompletionBonus('field', first))).toBeFalsy();
    const committed = await sync.commitLevelRun(second, firstCompletionBonus('field', second));
    expect(committed).toMatchObject({ xp: 10, coins: 5 });
    // 10 XP / 5 coins per run, +50 XP / +10 coins once.
    expect(store.getSnapshot().wallet).toEqual({ xp: 70, coins: 20 });
    store.close();
  });
});

/** A completed field run with one correct answer (10 XP, 5 coins, 1+ star). */
function levelRun(store: GameStore, batchId: string) {
  // Imported statically: the recorder has no module state, so it is safe across resetModules.
  const recorder = createSessionRecorder({
    profileId: store.getSnapshot().profile.id,
    levelId: 'field',
    sessionNo: store.nextSessionNo(),
    getStat: () => undefined,
    now: Date.now,
    newId: () => batchId,
  });
  recorder.recordQuestion(outcome('mul:3x4'));
  return recorder.finish(true);
}
