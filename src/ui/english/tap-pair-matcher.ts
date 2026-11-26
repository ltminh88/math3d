// Tap-pair matcher (Phase 1B): tap a word, then its picture. Tap-to-place only —
// no drag, so there is nothing a keyboard or a touch screen cannot do (every
// tile is a real <button>). A wrong pair counts one miss and stays playable.
import type { MatchPairsItem } from '../../english/english-types';
import { createUiButton } from '../kit/ui-button';
import { tei } from './english-strings';
import {
  type EnglishWidget,
  type EnglishWidgetHooks,
  type EnglishWidgetOptions,
  renderGloss,
  widgetRoot,
} from './english-widget-layout';

function shuffled<T>(items: readonly T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}

export function mountTapPairMatcher(
  item: MatchPairsItem,
  hooks: EnglishWidgetHooks,
  options: EnglishWidgetOptions,
): EnglishWidget {
  const doc = options.doc ?? document;
  const { root, body, gloss } = widgetRoot(item, tei('cuePairs'), doc, options);
  const columns = doc.createElement('div');
  columns.className = 'english-pair-columns';
  const wordsCol = doc.createElement('div');
  wordsCol.className = 'english-pair-column';
  wordsCol.setAttribute('role', 'group');
  const picturesCol = doc.createElement('div');
  picturesCol.className = 'english-pair-column';
  picturesCol.setAttribute('role', 'group');
  columns.append(wordsCol, picturesCol);
  body.appendChild(columns);

  let done = false;
  let matched = 0;
  let selected: { side: 'word' | 'picture'; key: string } | null = null;
  const wordButtons = new Map<string, HTMLButtonElement>();
  const pictureButtons = new Map<string, HTMLButtonElement>();

  const clearSelection = () => {
    selected = null;
    for (const b of [...wordButtons.values(), ...pictureButtons.values()]) {
      b.classList.remove('selected');
    }
  };

  /** The wrong-pair marks stay until the next tap, so the child sees what missed. */
  const clearWrong = () => {
    for (const b of [...wordButtons.values(), ...pictureButtons.values()]) {
      b.classList.remove('wrong');
    }
  };

  const tryPair = (word: string, picture: string) => {
    const verdict = hooks.onAttempt({ kind: 'match-pairs', word, picture });
    const wordButton = wordButtons.get(word) as HTMLButtonElement;
    const pictureButton = pictureButtons.get(picture) as HTMLButtonElement;
    if (verdict.correct) {
      matched += 1;
      wordButton.classList.add('matched');
      pictureButton.classList.add('matched');
      wordButton.disabled = true;
      pictureButton.disabled = true;
      clearSelection();
      if (matched === item.pairs.length) {
        done = true;
        hooks.onSolved();
      }
    } else if (!verdict.reveal) {
      wordButton.classList.add('wrong');
      pictureButton.classList.add('wrong');
      clearSelection();
    }
  };

  const select = (side: 'word' | 'picture', key: string) => {
    if (done) return;
    clearWrong();
    if (selected?.side === side && selected.key === key) {
      clearSelection();
      return;
    }
    if (selected && selected.side !== side) {
      const word = side === 'word' ? key : selected.key;
      const picture = side === 'picture' ? key : selected.key;
      tryPair(word, picture);
      return;
    }
    clearSelection();
    selected = { side, key };
    const button = side === 'word' ? wordButtons.get(key) : pictureButtons.get(key);
    button?.classList.add('selected');
  };

  for (const pair of shuffled(item.pairs)) {
    const button = createUiButton(
      { label: pair.word, variant: 'secondary', onClick: () => select('word', pair.word) },
      doc,
    );
    button.classList.add('english-choice', 'english-pair-word');
    button.lang = 'en';
    button.translate = false;
    wordsCol.appendChild(button);
    wordButtons.set(pair.word, button);
  }
  for (const pair of shuffled(item.pairs)) {
    const button = createUiButton(
      { label: pair.picture, variant: 'secondary', onClick: () => select('picture', pair.picture) },
      doc,
    );
    button.classList.add('english-choice', 'english-picture-choice');
    picturesCol.appendChild(button);
    pictureButtons.set(pair.picture, button);
  }

  const lockPair = (word: string) => {
    const pair = item.pairs.find((p) => p.word === word);
    if (!pair) return;
    const wordButton = wordButtons.get(word) as HTMLButtonElement;
    const pictureButton = pictureButtons.get(pair.picture) as HTMLButtonElement;
    if (wordButton.disabled) return;
    matched += 1;
    wordButton.classList.add('matched');
    pictureButton.classList.add('matched');
    wordButton.disabled = true;
    pictureButton.disabled = true;
  };

  return {
    element: root,
    revealAnswer() {
      done = true;
      clearSelection();
      for (const pair of item.pairs) lockPair(pair.word);
    },
    helpOnce() {
      if (done) return;
      clearSelection();
      const open = item.pairs.find((p) => !wordButtons.get(p.word)?.disabled);
      if (!open) return;
      lockPair(open.word);
      if (matched === item.pairs.length) {
        done = true;
        hooks.onSolved();
      }
    },
    showGloss() {
      renderGloss(gloss, options, doc);
    },
    destroy() {
      root.remove();
    },
  };
}
