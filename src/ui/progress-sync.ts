// Writes the UI's optimistic progress view through to the game store (IndexedDB). Quiz answers
// are committed in batches (every 5 questions, when the quiz closes, or when the page hides);
// every other change is written at once. Writes run in order through one queue.
import type { FactKey } from '../learning/fact-key';
import type { QuestionOutcome, SessionResult } from '../learning/session-recorder';
import { createQuizPlanner } from '../quiz/learning-quiz-adapter';
import type { Question, QuizMode } from '../quiz/question-types';
import {
  createQuizAnswerBatch,
  type QuizAnswerBatch,
  questCompleteDelta,
} from '../quiz/quiz-answer-batch';
import type { GameStore } from '../store/game-store-api';
import { BRIDGE_LEVEL_ID } from '../store/legacy-save-import';
import type { ProgressRecords } from '../store/profile-replacement';
import type { GameMeta } from '../store/save-schema';
import { progressViewFromSnapshot } from '../store/store-to-save-v1';
import { gameState } from './game-state';
import { showToast } from './toast-and-persist';

export const QUIZ_BATCH_SIZE = 5;

let store: GameStore | undefined;
let batch: QuizAnswerBatch | undefined;
/** Finished batches whose commit has not succeeded yet (retried with the same batchId). */
const unsent: SessionResult[] = [];
let queue: Promise<void> = Promise.resolve();
// Math.random is seeded in parity runs, so quiz content stays deterministic there.
const planner = createQuizPlanner(Math.random);

function reportFailure(err: unknown): void {
  console.error('Saving progress failed', err);
  if (!gameState.saveFailWarned) {
    gameState.saveFailWarned = true;
    showToast('Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.');
  }
}

/**
 * Runs store writes one after another; resolves false (after reporting) when the write failed or
 * no store is connected yet. A failure never blocks later writes.
 */
function enqueue(job: (s: GameStore) => Promise<unknown>): Promise<boolean> {
  const s = store;
  if (!s) return Promise.resolve(false);
  const run = queue
    .then(() => job(s))
    .then(
      () => true,
      (err: unknown) => {
        reportFailure(err);
        return false;
      },
    );
  queue = run.then(() => undefined);
  return run;
}

export function connectStore(connected: GameStore): void {
  store = connected;
  batch = undefined;
  unsent.length = 0;
  gameState.progress = progressViewFromSnapshot(connected.getSnapshot());
}

export const connectedStore = (): GameStore | undefined => store;

export function nextQuizQuestion(mode: QuizMode, lastKey: string): Question {
  return planner.next(
    {
      mode,
      table: gameState.progress.table,
      stats: store?.getSnapshot().factStats ?? {},
      sessionNo: store?.nextSessionNo() ?? 1,
    },
    lastKey,
  );
}

/** One finished question (solved or abandoned) with its frozen reward. */
export function recordQuizQuestion(
  outcome: QuestionOutcome,
  reward: { xp: number; coins: number },
): void {
  const s = store;
  if (!s) return;
  batch ??= createQuizAnswerBatch({
    profileId: s.getSnapshot().profile.id,
    sessionNo: s.nextSessionNo(),
    getStat: (key) => s.getSnapshot().factStats[key],
    now: Date.now,
    newId: () => crypto.randomUUID(),
  });
  batch.recordQuestion(outcome, reward);
  if (gameState.quizMode === 'bridge')
    batch.setLevelProgress(BRIDGE_LEVEL_ID, gameState.progress.bridge);
  if (batch.size >= QUIZ_BATCH_SIZE) void flushProgress();
}

/** Commits pending quiz answers and the combo. */
export function flushProgress(): Promise<boolean> {
  if (batch && batch.size > 0) unsent.push(batch.finish());
  batch = undefined;
  return enqueue(async (s) => {
    while (unsent.length > 0) {
      const next = unsent[0] as SessionResult;
      await s.commitSession(next.delta, next.local);
      unsent.shift();
    }
    const { combo } = gameState.progress;
    if (s.getSnapshot().gameMeta.combo !== combo) await s.updateGameMeta({ combo });
  });
}

export const saveAvatar = (avatar: string): Promise<boolean> => enqueue((s) => s.setAvatar(avatar));
export const saveGameMeta = (patch: Partial<GameMeta>): Promise<boolean> =>
  enqueue((s) => s.updateGameMeta(patch));
export const saveQuestAccepted = (): Promise<boolean> =>
  enqueue((s) => s.acceptLevel(BRIDGE_LEVEL_ID));

export function saveQuestComplete(): Promise<boolean> {
  void flushProgress();
  return enqueue((s) =>
    s.commitSession(
      questCompleteDelta(s.getSnapshot().profile.id, crypto.randomUUID(), Date.now()),
    ),
  );
}

/**
 * Replaces all progress (reset, save-code import) and re-hydrates the view; pending answers
 * belonged to the old progress and are dropped. False when the store refused (view unchanged).
 */
export async function replaceAllProgress(records: ProgressRecords): Promise<boolean> {
  batch = undefined;
  unsent.length = 0;
  const ok = await enqueue((s) => s.replaceProgress(records));
  if (ok && store) gameState.progress = progressViewFromSnapshot(store.getSnapshot());
  return ok;
}

/** Committed + pending attempts/correct per fact (book check marks, settings summary). */
export function factCountsView(): Record<FactKey, { attempts: number; correct: number }> {
  const counts: Record<FactKey, { attempts: number; correct: number }> = {};
  const add = (key: FactKey, attempts: number, correct: number): void => {
    const c = counts[key] ?? { attempts: 0, correct: 0 };
    counts[key] = { attempts: c.attempts + attempts, correct: c.correct + correct };
  };
  for (const [key, f] of Object.entries(store?.getSnapshot().factStats ?? {}))
    add(key, f.attempts, f.correct);
  for (const { delta } of unsent)
    for (const [key, f] of Object.entries(delta.facts)) add(key, f.a, f.c);
  for (const [key, f] of Object.entries(batch?.pendingCounts() ?? {}))
    add(key, f.attempts, f.correct);
  return counts;
}
