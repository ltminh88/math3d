// Shared widget contract + helpers (Phase 1B): every English widget is tap-only
// (real <button>s, so keyboard focus/Enter works too — no drag anywhere), mounts
// into the run's item area, and answers through `onAttempt`. The run owns the
// feedback line, the hint button and the Next button; the widget only reports
// taps and paints its own states (correct / wrong / revealed / gloss).
import type { EnglishAttempt } from '../../english/engine/answer-check';
import type { EnglishItem } from '../../english/english-types';
import { createUiButton } from '../kit/ui-button';
import { tei } from './english-strings';

export interface EnglishWidgetHooks {
  /** One user action; the run checks it and returns the verdict. */
  onAttempt(attempt: EnglishAttempt): { correct: boolean; reveal: boolean };
  /** The widget calls this when the item is fully solved (right answer, all pairs matched). */
  onSolved(): void;
}

export interface EnglishWidgetOptions {
  /** Word → Vietnamese gloss pairs to reveal after the item is done. */
  readonly glosses: readonly { word: string; vi: string }[];
  readonly doc?: Document;
  /** "🔊 Nghe" button: the run speaks the item's text (3B). */
  readonly speak?: { readonly onSpeak: () => void };
  /** Tier 3 listen-only: hide the word text when audio exists (3B). */
  readonly hideWord?: boolean;
}

export interface EnglishWidget {
  readonly element: HTMLElement;
  /** Third miss: highlight the right answer and lock the widget. */
  revealAnswer(): void;
  /** Hint rung 2: drop one wrong option, or place one correct element. */
  helpOnce(): void;
  /** Show the "word = nghĩa" line(s) after the item is done. */
  showGloss(): void;
  destroy(): void;
}

/** An English word span: never translated, always `lang="en"`. */
export function englishWordEl(text: string, doc: Document): HTMLSpanElement {
  const el = doc.createElement('span');
  el.className = 'english-word';
  el.lang = 'en';
  el.translate = false;
  el.textContent = text;
  return el;
}

/**
 * The displayed question for an item that answers one (what-is: "What is
 * this?" above the answer tiles). Null when the item carries no question.
 */
export function questionParagraph(
  question: string | undefined,
  doc: Document,
): HTMLParagraphElement | null {
  if (!question) return null;
  const el = doc.createElement('p');
  el.className = 'english-question';
  for (const [index, word] of question.split(' ').entries()) {
    if (index > 0) el.append(doc.createTextNode(' '));
    el.appendChild(englishWordEl(word, doc));
  }
  return el;
}

/** A large tap target (kit-button, 56 px) for one choice, labelled for e2e by index. */
export function choiceButton(
  label: string,
  index: number,
  onClick: () => void,
  doc: Document,
  english = false,
): HTMLButtonElement {
  const button = createUiButton({ label, variant: 'secondary', onClick, ariaLabel: label }, doc);
  button.classList.add('english-choice');
  button.dataset.choiceIndex = String(index);
  if (english) {
    button.lang = 'en';
    button.translate = false;
  }
  return button;
}

/** Base root every widget mounts into (cue line + listen button + body + gloss line). */
export function widgetRoot(
  item: EnglishItem,
  cue: string,
  doc: Document,
  options?: Pick<EnglishWidgetOptions, 'speak'>,
): { root: HTMLElement; body: HTMLElement; gloss: HTMLElement } {
  const root = doc.createElement('div');
  root.className = 'english-widget';
  root.dataset.kind = item.kind;
  const cueEl = doc.createElement('p');
  cueEl.className = 'english-cue';
  cueEl.textContent = cue;
  root.appendChild(cueEl);
  if (options?.speak) {
    const { onSpeak } = options.speak;
    const listen = createUiButton(
      { label: `🔊 ${tei('listen')}`, variant: 'secondary', onClick: onSpeak },
      doc,
    );
    listen.classList.add('english-listen');
    root.appendChild(listen);
  }
  const body = doc.createElement('div');
  body.className = 'english-widget__body';
  const gloss = doc.createElement('p');
  gloss.className = 'english-gloss';
  gloss.hidden = true;
  root.append(body, gloss);
  return { root, body, gloss };
}

/** Fill a widget's gloss line from its options (one "word = nghĩa" per line). */
export function renderGloss(
  glossEl: HTMLElement,
  options: EnglishWidgetOptions,
  doc: Document,
): void {
  glossEl.textContent = '';
  for (const { word, vi } of options.glosses) {
    const line = doc.createElement('span');
    line.className = 'english-gloss__line';
    line.append(englishWordEl(word, doc), doc.createTextNode(` = ${vi}`));
    glossEl.appendChild(line);
  }
  glossEl.hidden = options.glosses.length === 0;
}
