// Daily practice (phase 11): "Luyện tập hôm nay" in the shared world dialog (same layer
// as the bridge quiz). Up to 10 items due from the Leitner boxes; × / : items use the quiz
// dialog, `sk:` skills the step kit. +5 coins per correct answer, +10 for a counted finish.
// The run loop itself lives in practice-run.ts (phase 06 extraction, no behaviour change);
// this module only plans the daily set and shows the streak finish screen.
import { dayNumber } from '../learning/daily-intervals';
import { dailySeed, dailyUnlocked, planDailySet } from '../learning/daily-planner';
import { DAILY_FINISH_COINS, dailyCountedToday } from '../learning/daily-streak';
import type { FactKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { COINS_PER_CORRECT } from '../learning/scoring';
import { isLevelRunning } from '../levels/shared/level-gates';
import type { GameStore } from '../store/game-store-api';
import { finishScreenHtml } from './daily-finish-screen';
import { td } from './daily-practice-strings';
import { installDailyTestHook } from './daily-test-hook';
import { closeDialog, openDialog } from './dialog';
import { gameState, getWorld } from './game-state';
import { refreshHud } from './hud';
import { byId } from './icons';
import {
  destroyPracticeRun,
  isKeyRenderable,
  type PracticeRunState,
  startPracticeRun,
} from './practice-run';
import { connectedStore } from './progress-sync';
import { showToast } from './toast-and-persist';

/** The daily run is a practice run; the alias keeps the test hook's type stable. */
export type DailyRunState = PracticeRunState;

/**
 * Learned pool without skills whose item the dialog cannot draw. Item-based (phase 04,
 * le 21/11 11:01 — never by family): the generated item is the ground truth. The planner
 * itself stays unaware of the UI: the call site filters the pool, so a smaller pool
 * just plans fewer items.
 */
function renderableStats(
  stats: Readonly<Record<FactKey, FactStat | undefined>>,
): Readonly<Record<FactKey, FactStat | undefined>> {
  const out: Record<FactKey, FactStat | undefined> = {};
  for (const [key, stat] of Object.entries(stats)) {
    if (!isKeyRenderable(key as FactKey, stat?.box ?? 1)) continue;
    out[key as FactKey] = stat;
  }
  return out;
}

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
  // English books (Phase 6 + two-modes Phase 4): the island opens when the
  // bridge quest is done (gameState.progress.questComplete), and the Look
  // gate opens on the same bridge (Phase 3's Look gate also requires it).
  // Until a book's gate is open the planner drops every key of that book,
  // and afterwards it caps English items at 2 per day.
  const keys = planDailySet({
    stats: renderableStats(snapshot.factStats),
    today,
    seed,
    islandUnlocked: gameState.progress.questComplete,
    lookUnlocked: gameState.progress.questComplete,
  });
  if (keys.length === 0) {
    openDialog(td('title'), `<p class="dialog-copy">${td('locked')}</p>`, 'daily');
    return;
  }
  startDailyRun(store, keys, today, seed);
}

function startDailyRun(store: GameStore, keys: FactKey[], today: number, seed: number): void {
  const snapshot = store.getSnapshot();
  const alreadyCounted = dailyCountedToday(snapshot.daily, today);
  startPracticeRun({
    store,
    keys,
    seed,
    kind: 'daily',
    titleFor: (index, total) => `${td('title')} · ${td('itemOf', { n: index + 1, total })}`,
    alreadyCounted,
    onFinish: (correctCount) => void finishDailyRun(store, today, correctCount),
    testHook: {
      install: installDailyTestHook,
      remove: () => {
        delete window.__daily;
      },
    },
  });
}

async function finishDailyRun(
  store: GameStore,
  today: number,
  correctCount: number,
): Promise<void> {
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
    destroyPracticeRun();
    closeDialog();
  };
  gameState.audio.celebrate();
}
