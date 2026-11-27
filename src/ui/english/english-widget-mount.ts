// Mounting one English item's widget (Phase 6): shared by the island run
// (8 rounds) and the daily adapter (1 item). The run owns the feedback line,
// the hint button and the Next button; the widget only reports taps and
// paints its own states (correct / wrong / revealed / gloss).
import { ENGLISH_WORD_BANK } from '../../english/content/word-bank';
import type { EnglishItem } from '../../english/english-types';
import type {
  EnglishWidget,
  EnglishWidgetHooks,
  EnglishWidgetOptions,
} from './english-widget-layout';
import { mountFillChoice } from './fill-choice';
import { mountLetterChoice } from './letter-choice';
import { mountPictureChoiceGrid } from './picture-choice-grid';
import { mountTapPairMatcher } from './tap-pair-matcher';
import { mountWordTileOrder } from './word-tile-order';

/**
 * Word → gloss pairs the widget reveals after the item is done. Looked up in
 * the whole word bank, not the stage unit: pattern sentences come from the
 * shared sentence bank, so a stage-1 sentence may teach a word from a later
 * block ("I can swim", "I see the sun") — its gloss must still show.
 */
export function glossesFor(item: EnglishItem): { word: string; vi: string }[] {
  const byWord = new Map(ENGLISH_WORD_BANK.map((w) => [w.word, w.gloss]));
  const singular = (word: string): string =>
    byWord.has(word) ? word : word.endsWith('s') ? word.slice(0, -1) : word;
  const words: string[] =
    item.kind === 'listen-pick-picture'
      ? [item.word]
      : item.kind === 'letter-pick'
        ? [item.prompt]
        : item.kind === 'fill-pattern'
          ? [item.sentence[item.blankIndex] as string]
          : item.kind === 'match-pairs'
            ? item.pairs.map((p) => p.word)
            : item.words.map(singular).filter((w) => byWord.has(w));
  const out: { word: string; vi: string }[] = [];
  for (const word of words) {
    const key = singular(word);
    const vi = byWord.get(key);
    if (vi && !out.some((g) => g.word === key)) out.push({ word: key, vi });
  }
  return out;
}

/** The text "🔊 Nghe" speaks for each kind (the word, or the whole sentence). */
export function speakTextFor(item: EnglishItem): string {
  switch (item.kind) {
    case 'listen-pick-picture':
      return item.word;
    case 'letter-pick':
      return item.prompt;
    case 'fill-pattern':
      return item.question
        ? `${item.question} ${item.sentence.join(' ')}`
        : item.sentence.join(' ');
    case 'match-pairs':
      return item.pairs.map((p) => p.word).join(', ');
    case 'order-words':
      return item.question ? `${item.question} ${item.words.join(' ')}` : item.words.join(' ');
  }
}

export function mountWidget(
  item: EnglishItem,
  hooks: EnglishWidgetHooks,
  onSpeak: (text: string) => void,
  hideWord: boolean,
): EnglishWidget {
  const options: EnglishWidgetOptions = {
    glosses: glossesFor(item),
    speak: { onSpeak: () => onSpeak(speakTextFor(item)) },
    hideWord,
  };
  switch (item.kind) {
    case 'listen-pick-picture':
      return mountPictureChoiceGrid(item, hooks, options);
    case 'letter-pick':
      return mountLetterChoice(item, hooks, options);
    case 'fill-pattern':
      return mountFillChoice(item, hooks, options);
    case 'match-pairs':
      return mountTapPairMatcher(item, hooks, options);
    case 'order-words':
      return mountWordTileOrder(item, hooks, options);
  }
}
