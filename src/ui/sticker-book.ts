// The sticker book (phase 12): a world dialog with six topic pages. It reads the store's
// fact/skill stats and derives the stickers (learning/sticker-book.ts) — it never touches
// coins or the shop. It never opens while a level runs (openDialog enforces that).

import { skillEntry } from '../learning/skill-catalog';
import {
  createEarningTracker,
  deriveStickers,
  STICKER_TOPICS,
  type Sticker,
  type StickerTopic,
  TOPIC_SKILLS,
  topicProgress,
} from '../learning/sticker-book';
import { openDialog } from './dialog';
import { byId } from './icons';
import { connectedStore } from './progress-sync';
import './sticker-book.css';
import { stickerName, ts } from './sticker-book-strings';

const TOPIC_TITLE: Record<StickerTopic, Parameters<typeof ts>[0]> = {
  tables: 'topicTables',
  remainder: 'topicRemainder',
  'unknown-pattern': 'topicUnknownPattern',
  'expression-logic': 'topicExpressionLogic',
  geometry: 'topicGeometry',
  measurement: 'topicMeasurement',
};

/** One emoji per sticker, in derivation order (TOPIC_SKILLS order per topic, tables 2–9). */
const TOPIC_EMOJI: Record<StickerTopic, readonly string[]> = {
  tables: ['🌱', '🌻', '🌷', '🌼', '🌿', '🍀', '🌸', '🌺'],
  remainder: ['🍰', '🍕'],
  'unknown-pattern': ['🔍', '❓', '➕', '➖', '🎵'],
  'expression-logic': ['🧮', '🔣', '📖', '✅', '💡', '🛒', '🍎', '🎈', '🧺', '🏃', '🎲'],
  geometry: ['📍', '⭕', '🛞', '📐', '🔲', '🟦', '🔺', '📦', '🧊'],
  measurement: ['📏', '🔎', '⚖️', '🥛', '🌡️', '⬡', '▭', '◼', '🟫', '🟥', '⬛', '🏡'],
};

function stickerEmoji(sticker: Sticker): string {
  if (sticker.topic === 'tables')
    return TOPIC_EMOJI.tables[Number(sticker.id.slice(6)) - 2] ?? '⭐';
  const index = TOPIC_SKILLS[sticker.topic].indexOf(sticker.id.slice(3));
  return TOPIC_EMOJI[sticker.topic]?.[index] ?? '⭐';
}

function stickerButtonHtml(sticker: Sticker): string {
  const name = stickerName(sticker.id);
  const state = ts(sticker.earned ? 'earnedState' : 'unearnedState');
  return `<button type="button" class="sticker${sticker.earned ? ' earned' : ''}" data-sticker="${sticker.id}" aria-label="${name}, ${state}"><span class="sticker-emoji" aria-hidden="true">${stickerEmoji(sticker)}</span><span class="sticker-name">${name}</span></button>`;
}

/** The tapped sticker's name + earned line (and its SGK lesson for a skill sticker). */
function showDetail(sticker: Sticker): void {
  const detail = document.querySelector('.sticker-detail');
  if (!detail) return;
  const line = ts(sticker.earned ? 'earnedLine' : 'unearnedLine', {
    name: stickerName(sticker.id),
  });
  const lesson = sticker.id.startsWith('sk:') ? skillEntry(sticker.id.slice(3))?.lesson : undefined;
  detail.textContent = lesson ? `${line} ${ts('lessonLine', { lesson })}` : line;
}

const topicAt = (index: number): StickerTopic =>
  STICKER_TOPICS[
    ((index % STICKER_TOPICS.length) + STICKER_TOPICS.length) % STICKER_TOPICS.length
  ] as StickerTopic;

/** Opens the book on `topic` (default: the first page). Re-renders on every page flip. */
export function openStickerBook(topic: StickerTopic = 'tables'): void {
  const stickers = deriveStickers(connectedStore()?.getSnapshot().factStats ?? {});
  const page = stickers.filter((s) => s.topic === topic);
  const { earned, total } = topicProgress(stickers, topic);
  openDialog(
    ts('title'),
    `<div class="dialog-eyebrow">${ts('eyebrow')}</div><div class="sticker-tabs" role="group" aria-label="${ts('title')}">${STICKER_TOPICS.map((t) => `<button type="button" data-topic="${t}" aria-pressed="${t === topic}">${ts(TOPIC_TITLE[t])}</button>`).join('')}</div><p class="sticker-count" aria-label="${ts('countLabel', { earned, total })}">${earned}/${total}</p><div class="sticker-grid">${page.map(stickerButtonHtml).join('')}</div><p class="sticker-detail" aria-live="polite">${ts('bookNote')}</p><div class="sticker-nav"><button type="button" id="sticker-prev" class="secondary">← ${ts('prevPage')}</button><button type="button" id="sticker-next" class="secondary">${ts('nextPage')} →</button></div>`,
    'sticker-book',
  );
  // openDialog refuses while a level runs: nothing to wire then (the book stays closed).
  const dialog = document.getElementById('dialog');
  if (!(dialog instanceof HTMLDialogElement) || !dialog.open) return;
  for (const tab of document.querySelectorAll<HTMLButtonElement>('[data-topic]')) {
    tab.onclick = () => openStickerBook(tab.dataset.topic as StickerTopic);
  }
  for (const button of document.querySelectorAll<HTMLButtonElement>('[data-sticker]')) {
    button.onclick = () => {
      const sticker = page.find((s) => s.id === button.dataset.sticker);
      if (sticker) showDetail(sticker);
    };
  }
  const index = STICKER_TOPICS.indexOf(topic);
  byId('sticker-prev').onclick = () => openStickerBook(topicAt(index - 1));
  byId('sticker-next').onclick = () => openStickerBook(topicAt(index + 1));
}

/** Earning lines VLM has not said yet, oldest first (the guide-dialog patch reads these). */
const pendingLines: string[] = [];
const tracker = createEarningTracker();

/**
 * Subscribes to session commits once the store is connected (called from bootstrap after
 * bootStore): the baseline is the child's already-owned stickers, so an old save never
 * announces; each sticker earned during play is announced exactly once.
 */
export function wireStickerEarning(): void {
  const store = connectedStore();
  if (!store) return;
  tracker.noteBaseline(store.getSnapshot().factStats);
  store.on('session-committed', () => {
    const fresh = tracker.check(store.getSnapshot().factStats);
    for (const sticker of fresh) {
      pendingLines.push(ts('earningLine', { name: stickerName(sticker.id) }));
      if (pendingLines.length > 10) pendingLines.shift();
    }
  });
}

/** Earning lines VLM has not said yet; clears them. */
export function takePendingEarningLines(): string[] {
  return pendingLines.splice(0, pendingLines.length);
}

/** Non-consuming read of the pending lines, for the test hook. */
export function pendingEarningLines(): string[] {
  return [...pendingLines];
}
