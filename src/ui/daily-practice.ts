// Daily practice (phase 11): "Luyện tập hôm nay" in the shared world dialog (same layer
// as the bridge quiz). Up to 10 items due from the Leitner boxes; × / : items use the quiz
// dialog, `sk:` skills the step kit. +5 coins per correct answer, +10 for a counted finish.
import { dayNumber } from '../learning/daily-intervals';
import { dailySeed, dailyUnlocked, planDailySet } from '../learning/daily-planner';
import { DAILY_FINISH_COINS, dailyCountedToday } from '../learning/daily-streak';
import { type FactKey, isSkillKey, parseKey } from '../learning/fact-key';
import { COINS_PER_CORRECT } from '../learning/scoring';
import { mulberry32, type Rng } from '../learning/seeded-rng';
import type { QuestionOutcome } from '../learning/session-recorder';
import { isLevelRunning } from '../levels/shared/level-gates';
import type { ReasoningRoundPlan } from '../levels/shared/reasoning-round-slot';
import { buildDailyQuestion } from '../quiz/daily-question';
import { createQuizAnswerBatch, type QuizAnswerBatch } from '../quiz/quiz-answer-batch';
import type { GameStore } from '../store/game-store-api';
import { newId } from '../store/new-id';
import { finishScreenHtml } from './daily-finish-screen';
import { td } from './daily-practice-strings';
import { mountQuizItem, quizItemHtml } from './daily-quiz-item';
import { mountSkillItem, skillItemHtml, skillPlan } from './daily-skill-item';
import { installDailyTestHook } from './daily-test-hook';
import { closeDialog, openDialog } from './dialog';
import { gameState, getWorld } from './game-state';
import { refreshHud } from './hud';
import { byId } from './icons';
import { commitDailyAnswers, connectedStore } from './progress-sync';
import { showToast } from './toast-and-persist';

export interface DailyRunState {
  readonly keys: readonly FactKey[];
  index: number;
  plan: ReasoningRoundPlan | null;
  readonly today: number;
  readonly store: GameStore;
  readonly batch: QuizAnswerBatch;
  readonly alreadyCounted: boolean;
  correctCount: number;
  committed: boolean;
  readonly rng: Rng;
  readonly signal: AbortController;
  current: { destroy(): void; missed(): QuestionOutcome | null } | null;
}

let run: DailyRunState | null = null;

export function openDailyPractice(): void {
  const world = getWorld();
  // A level owns the screen (the daily run is a world dialog, never a level). A paused world
  // is fine: the VLM entry replaces the Milo dialog's content in the same shared <dialog>.
  if (!world.active || isLevelRunning()) return;
  gameState.audio.unlock();
  const store = connectedStore();
  if (!store) {
    showToast('Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.');
    return;
  }
  const snapshot = store.getSnapshot();
  const today = dayNumber(Date.now());
  if (!dailyUnlocked(snapshot.levelProgress)) {
    openDialog(td('title'), `<p class="dialog-copy">${td('locked')}</p>`, 'daily');
    return;
  }
  const seed = dailySeed(today, snapshot.profile.id);
  const keys = planDailySet({ stats: snapshot.factStats, today, seed });
  if (keys.length === 0) {
    openDialog(td('title'), `<p class="dialog-copy">${td('locked')}</p>`, 'daily');
    return;
  }
  startRun(store, keys, today, seed);
}

function startRun(store: GameStore, keys: FactKey[], today: number, seed: number): void {
  const snapshot = store.getSnapshot();
  run = {
    keys,
    index: 0,
    plan: null,
    today,
    store,
    batch: createQuizAnswerBatch({
      profileId: snapshot.profile.id,
      sessionNo: store.nextSessionNo(),
      getStat: (key) => store.getSnapshot().factStats[key],
      now: Date.now,
      newId,
    }),
    alreadyCounted: dailyCountedToday(snapshot.daily, today),
    correctCount: 0,
    committed: false,
    rng: mulberry32(seed ^ 0x9e3779b9),
    signal: new AbortController(),
    current: null,
  };
  byId<HTMLDialogElement>('dialog').addEventListener('close', onDialogClosed, { once: true });
  if (import.meta.env.MODE === 'test') installDailyTestHook(() => run);
  renderItem();
}

const onDialogClosed = (): void => {
  if (!run) return;
  if (run.committed) destroyRun();
  else void leaveRun();
};

const onAnswered = (outcome: QuestionOutcome): void => {
  if (!run) return;
  run.batch.recordQuestion(outcome, { xp: 0, coins: outcome.correct ? COINS_PER_CORRECT : 0 });
  if (outcome.correct) {
    run.correctCount += 1;
    gameState.progress.coins += COINS_PER_CORRECT;
    refreshHud();
  }
};

const onNext = (): void => {
  if (!run) return;
  run.index += 1;
  if (run.index >= run.keys.length) void finishRun();
  else renderItem();
};

function renderItem(): void {
  if (!run) return;
  const { keys, index, store } = run;
  const key = keys[index] as FactKey;
  const title = `${td('title')} · ${td('itemOf', { n: index + 1, total: keys.length })}`;
  const isLast = index === keys.length - 1;
  run.current?.destroy();
  run.plan = null;
  if (isSkillKey(key)) {
    const parsed = parseKey(key);
    const id = parsed?.op === 'skill' ? parsed.id : '';
    const plan = skillPlan(id, store.getSnapshot().factStats[key]?.box ?? 1, run.rng);
    run.plan = plan;
    openDialog(title, skillItemHtml(index, keys.length, run.alreadyCounted), 'daily');
    const skill = mountSkillItem(plan, isLast, run.signal.signal, {
      onAnswered,
      onNext,
      onLeave: () => void leaveRun(),
    });
    run.current = { destroy: () => skill.destroy(), missed: () => null };
    return;
  }
  const question = buildDailyQuestion(key, store.getSnapshot().factStats[key], run.rng);
  openDialog(title, quizItemHtml(question, run.alreadyCounted), 'daily');
  const missed = mountQuizItem(question, isLast, {
    onAnswered,
    onNext,
    onLeave: () => void leaveRun(),
  });
  run.current = { destroy: () => {}, missed };
}

async function finishRun(): Promise<void> {
  if (!run || run.committed) return;
  run.committed = true;
  const { batch, today, correctCount, store } = run;
  await commitDailyAnswers(batch.finish());
  let daily = store.getSnapshot().daily;
  let counted = false;
  try {
    const commit = await store.commitDailyRun(today);
    daily = commit.daily;
    counted = commit.counted;
  } catch (err) {
    console.error('Saving daily progress failed', err);
    showToast('Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.');
  }
  if (counted) {
    gameState.progress.coins += DAILY_FINISH_COINS;
    refreshHud();
  }
  const coins = correctCount * COINS_PER_CORRECT + (counted ? DAILY_FINISH_COINS : 0);
  openDialog(td('finishTitle'), finishScreenHtml(daily, coins, counted), 'daily');
  byId('daily-back').onclick = () => {
    destroyRun();
    closeDialog();
  };
  gameState.audio.celebrate();
}

async function leaveRun(): Promise<void> {
  if (!run || run.committed) return;
  run.committed = true;
  const { batch, current } = run;
  const missed = current?.missed() ?? null;
  if (missed) batch.recordQuestion(missed, { xp: 0, coins: 0 });
  if (batch.size > 0) await commitDailyAnswers(batch.finish());
  destroyRun();
  closeDialog();
}

function destroyRun(): void {
  if (!run) return;
  run.current?.destroy();
  run.signal.abort();
  if (import.meta.env.MODE === 'test') delete window.__daily;
  run = null;
}
