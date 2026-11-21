// The lesson picker (phase 06): 81 lessons grouped by 16 topics, collapsible, the current
// topic open. Each row shows "Bài n · tên ngắn · ★★☆"; a lesson with no plannable keys
// yet shows "Sắp có" (disabled). "Học tiếp: Bài n" on top points at the first unfinished
// lesson. Opens from day one; stars are derived from the stats, never stored. The pick
// callback (startLessonRun) is passed in so this module never imports the run module.
import { getLanguage } from '../i18n/i18n';
import type { FactKey } from '../learning/fact-key';
import { ALL_LESSONS, lessonByNumber, topicsInOrder } from '../learning/kntt-lesson-index';
import type { FactStat } from '../learning/learning-types';
import { plannableKeys } from '../learning/lesson-planner';
import { lessonStars, nextLesson, topicProgress } from '../learning/lesson-progress';
import { isLevelRunning } from '../levels/shared/level-gates';
import { openDialog } from './dialog';
import { gameState, getWorld } from './game-state';
import { byId } from './icons';
import { tl } from './lesson-practice-strings';
import { isKeyRenderable } from './practice-run';
import { connectedStore } from './progress-sync';
import { showToast } from './toast-and-persist';

type Stats = Readonly<Record<FactKey, FactStat | undefined>>;

const starsText = (stars: number): string => '★'.repeat(stars) + '☆'.repeat(3 - stars);

const lessonTitle = (n: number): string => {
  const lesson = lessonByNumber(n);
  if (!lesson) return '';
  return getLanguage() === 'en' ? lesson.titleEn : lesson.titleVi;
};

/** Picker body HTML from the live stats (pure except for the language setting). */
export function lessonPickerHtml(stats: Stats, renderable?: (key: FactKey) => boolean): string {
  const isRenderable = renderable ?? ((key: FactKey) => isKeyRenderable(key, stats[key]?.box ?? 1));
  const next = nextLesson(stats, { renderable: isRenderable });
  const currentTopic = next === undefined ? 1 : (lessonByNumber(next)?.topic ?? 1);
  const lang = getLanguage();

  const continueHtml =
    next === undefined
      ? `<p class="lesson-all-done">${tl('allDone')}</p>`
      : `<button type="button" id="lesson-continue" class="primary wide lesson-continue" data-lesson="${next}">${tl('continue', { n: next })} · ${lessonTitle(next)}</button>`;

  const rowHtml = (n: number): string => {
    const lesson = lessonByNumber(n);
    if (!lesson) return '';
    const title = lang === 'en' ? lesson.titleEn : lesson.titleVi;
    const num = `<span class="lesson-row__num">${tl('lesson', { n })}</span>`;
    if (plannableKeys(n, isRenderable).length === 0)
      return `<button type="button" class="lesson-row" data-lesson="${n}" disabled>${num}<span class="lesson-row__title">${title}</span><span class="lesson-row__coming">${tl('comingSoon')}</span></button>`;
    const stars = lessonStars(n, stats);
    return `<button type="button" class="lesson-row" data-lesson="${n}">${num}<span class="lesson-row__title">${title}</span><span class="lesson-row__stars" data-stars="${stars}">${starsText(stars)}</span></button>`;
  };

  const topicHtml = (topicId: number): string => {
    const topic = topicsInOrder().find((t) => t.id === topicId);
    if (!topic) return '';
    const name = lang === 'en' ? topic.nameEn : topic.nameVi;
    const { completed, total } = topicProgress(topicId, stats, { renderable: isRenderable });
    const open = topicId === currentTopic ? ' open' : '';
    const rows = ALL_LESSONS.filter((l) => l.topic === topicId)
      .map((l) => rowHtml(l.n))
      .join('');
    return `<details class="lesson-topic" data-topic="${topicId}"${open}><summary><span class="lesson-topic__name">${tl('topic', { n: topicId })} · ${name}</span><span class="lesson-topic__progress">${completed}/${total}</span></summary><div class="lesson-rows">${rows}</div></details>`;
  };

  return `${continueHtml}${topicsInOrder()
    .map((t) => topicHtml(t.id))
    .join('')}`;
}

/** Opens the picker in the shared dialog; a picked lesson runs through `onPick`. */
export function openLessonPicker(onPick: (lessonN: number) => void): void {
  const world = getWorld();
  // A level owns the screen (the picker is a world dialog, never a level).
  if (!world.active || isLevelRunning()) return;
  gameState.audio.unlock();
  const store = connectedStore();
  if (!store) {
    showToast('Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.');
    return;
  }
  openDialog(tl('pickerTitle'), lessonPickerHtml(store.getSnapshot().factStats), 'lesson');
  const content = byId('dialog-content');
  const cont = content.querySelector<HTMLElement>('#lesson-continue');
  if (cont) cont.onclick = () => onPick(Number(cont.dataset.lesson));
  for (const row of content.querySelectorAll<HTMLButtonElement>(
    'button.lesson-row:not([disabled])',
  )) {
    row.onclick = () => onPick(Number(row.dataset.lesson));
  }
}
