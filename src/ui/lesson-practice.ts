// Lesson mode runs (phase 06): one lesson's 6 items through the shared practice run loop.
// A run introduces untaught skills (unlike daily) and pays +5 coins per correct answer,
// no streak, no finish bonus. The finish screen shows the lesson's stars before/after,
// and a way back to the picker or straight into a replay.
import { getLanguage } from '../i18n/i18n';
import type { FactKey } from '../learning/fact-key';
import { lessonByNumber, skillsOfLesson } from '../learning/kntt-lesson-index';
import { planLessonRun } from '../learning/lesson-planner';
import { lessonStars } from '../learning/lesson-progress';
import { COINS_PER_CORRECT } from '../learning/scoring';
import { mulberry32 } from '../learning/seeded-rng';
import { isLevelRunning } from '../levels/shared/level-gates';
import type { GameStore } from '../store/game-store-api';
import { openDialog } from './dialog';
import { gameState, getWorld } from './game-state';
import { byId } from './icons';
import { openLessonPicker as showLessonPicker } from './lesson-picker';
import { tl } from './lesson-practice-strings';
import { installLessonTestHook } from './lesson-test-hook';
import { destroyPracticeRun, isKeyRenderable, startPracticeRun } from './practice-run';
import { connectedStore } from './progress-sync';
import { showToast } from './toast-and-persist';

/** Deterministic run seed per (lesson, profile, total attempts on the lesson's
 * skills): a replay re-plans once the previous round's attempts are recorded,
 * so "Luyện lại bài này" never deals the same 6 items back-to-back. */
export function lessonSeed(lessonN: number, profileId: string, totalAttempts: number): number {
  let h = 0x811c9dc5;
  const s = `${profileId}:lesson:${lessonN}:attempts:${totalAttempts}`;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** Opens the picker; a picked lesson starts its run. */
export function openLessonPicker(): void {
  showLessonPicker(startLessonRun);
}

export function startLessonRun(lessonN: number): void {
  const world = getWorld();
  // A level owns the screen (the lesson run is a world dialog, never a level).
  if (!world.active || isLevelRunning()) return;
  gameState.audio.unlock();
  const store = connectedStore();
  if (!store) {
    showToast('Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.');
    return;
  }
  const snapshot = store.getSnapshot();
  const stats = snapshot.factStats;
  const renderable = (key: FactKey): boolean => isKeyRenderable(key, stats[key]?.box ?? 1);
  // The seed mixes in the total attempts on this lesson's skills, so a replay
  // after a round plans different items instead of the same 6 questions.
  const totalAttempts = skillsOfLesson(lessonN).reduce(
    (sum, key) => sum + (stats[key]?.attempts ?? 0),
    0,
  );
  const seed = lessonSeed(lessonN, snapshot.profile.id, totalAttempts);
  const keys = planLessonRun(lessonN, stats, mulberry32(seed), { renderable });
  if (keys.length === 0) {
    // Nothing playable (yet): back to the picker, where the lesson shows "Sắp có".
    showLessonPicker(startLessonRun);
    return;
  }
  const starsBefore = lessonStars(lessonN, stats);
  const lesson = lessonByNumber(lessonN);
  const title = lesson ? (getLanguage() === 'en' ? lesson.titleEn : lesson.titleVi) : '';
  startPracticeRun({
    store,
    keys,
    seed,
    kind: 'lesson',
    titleFor: (index, total) => tl('runTitle', { n: lessonN, title, i: index + 1, total }),
    onFinish: (correctCount) => finishLessonRun(store, lessonN, starsBefore, correctCount),
    testHook: {
      install: installLessonTestHook,
      remove: () => {
        delete window.__lesson;
      },
    },
  });
}

function finishLessonRun(
  store: GameStore,
  lessonN: number,
  starsBefore: number,
  correctCount: number,
): void {
  const starsAfter = lessonStars(lessonN, store.getSnapshot().factStats);
  const stars = (n: number): string => '★'.repeat(n) + '☆'.repeat(3 - n);
  const coins = correctCount * COINS_PER_CORRECT;
  openDialog(
    tl('finishTitle', { n: lessonN }),
    `<p class="dialog-copy">${tl('finishStars', { before: stars(starsBefore), after: stars(starsAfter) })}</p><p class="dialog-copy">${tl('finishCoins', { coins })}</p><div class="lesson-finish-buttons"><button type="button" class="secondary" id="lesson-replay">${tl('replay')}</button><button type="button" class="primary" id="lesson-back">${tl('backToPicker')}</button></div>`,
    'lesson',
  );
  byId('lesson-back').onclick = () => {
    destroyPracticeRun();
    showLessonPicker(startLessonRun);
  };
  byId('lesson-replay').onclick = () => {
    destroyPracticeRun();
    startLessonRun(lessonN);
  };
  gameState.audio.celebrate();
}
