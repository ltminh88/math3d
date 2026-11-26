// Word-tile order (Phase 1B): tap tiles into the slots to build the sentence,
// then tap Check. Tap-to-place only — no drag, so touch and keyboard play the
// same way (every tile is a real <button>). A wrong order stays in the slots
// for the child to rearrange.
import type { OrderWordsItem } from '../../english/english-types';
import { createUiButton } from '../kit/ui-button';
import { tei } from './english-strings';
import {
  type EnglishWidget,
  type EnglishWidgetHooks,
  type EnglishWidgetOptions,
  renderGloss,
  widgetRoot,
} from './english-widget-layout';

export function mountWordTileOrder(
  item: OrderWordsItem,
  hooks: EnglishWidgetHooks,
  options: EnglishWidgetOptions,
): EnglishWidget {
  const doc = options.doc ?? document;
  const { root, body, gloss } = widgetRoot(item, tei('cueOrder'), doc);
  const slots = doc.createElement('div');
  slots.className = 'english-slots';
  slots.setAttribute('role', 'group');
  slots.setAttribute('aria-label', tei('cueOrder'));
  const bank = doc.createElement('div');
  bank.className = 'english-bank';
  bank.setAttribute('role', 'group');

  let done = false;
  const tiles: HTMLButtonElement[] = [];
  const slotWords = (): string[] =>
    [...slots.querySelectorAll('.english-tile')].map((t) => t.textContent ?? '');

  const check = createUiButton(
    {
      label: tei('check'),
      onClick: () => {
        if (done || slotWords().length !== item.words.length) return;
        const verdict = hooks.onAttempt({ kind: 'order-words', words: slotWords() });
        if (verdict.correct) {
          done = true;
          for (const tile of tiles) {
            tile.classList.add('correct');
            tile.disabled = true;
          }
          check.disabled = true;
          hooks.onSolved();
        } else if (!verdict.reveal) {
          for (const tile of slots.querySelectorAll('.english-tile')) {
            tile.classList.add('wrong');
          }
        }
      },
    },
    doc,
  );
  check.classList.add('english-check');
  check.disabled = true;

  const refreshCheck = () => {
    check.disabled = done || slotWords().length !== item.words.length;
  };

  /** One tap moves the tile: bank -> first empty slot, slot -> back to the bank. */
  const toggleTile = (tile: HTMLButtonElement) => {
    if (done) return;
    tile.classList.remove('wrong');
    const inSlot = tile.parentElement?.classList.contains('english-slot') ?? false;
    if (inSlot) {
      bank.appendChild(tile);
    } else {
      const empty = [...slots.children].find((s) => s.childElementCount === 0);
      if (empty) empty.appendChild(tile);
    }
    refreshCheck();
  };

  const bankOrder = [...item.words];
  for (let i = bankOrder.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [bankOrder[i], bankOrder[j]] = [bankOrder[j] as string, bankOrder[i] as string];
  }
  for (const word of bankOrder) {
    const tile = createUiButton(
      { label: word, variant: 'secondary', onClick: () => toggleTile(tile) },
      doc,
    );
    tile.classList.add('english-choice', 'english-tile');
    tile.lang = 'en';
    tile.translate = false;
    tiles.push(tile);
    bank.appendChild(tile);
  }
  for (let i = 0; i < item.words.length; i++) {
    const slot = doc.createElement('div');
    slot.className = 'english-slot';
    slots.appendChild(slot);
  }
  body.append(slots, bank, check);

  return {
    element: root,
    revealAnswer() {
      done = true;
      for (const slot of [...slots.children]) slot.textContent = '';
      for (const [index, word] of item.words.entries()) {
        const tile = tiles.find((t) => t.textContent === word) as HTMLButtonElement;
        (slots.children[index] as HTMLElement).appendChild(tile);
        tile.classList.add('correct');
        tile.disabled = true;
      }
      check.disabled = true;
    },
    helpOnce() {
      if (done) return;
      for (const tile of tiles) bank.appendChild(tile);
      const first = tiles.find((t) => t.textContent === item.words[0]) as HTMLButtonElement;
      const empty = [...slots.children].find((s) => s.childElementCount === 0);
      if (empty) empty.appendChild(first);
      refreshCheck();
    },
    showGloss() {
      renderGloss(gloss, options, doc);
    },
    destroy() {
      root.remove();
    },
  };
}
