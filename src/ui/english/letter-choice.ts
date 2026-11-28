// Letter choice (Phase 1B): hear the word, tap its first letter — or, for
// alphabet-order, tap the letter that comes next. Same tap flow as the
// picture grid: wrong taps stay enabled, the right tap locks the widget.
// R146: the word itself is never shown before the answer (except
// alphabet-order, where the letter IS the question) — the child hears the
// word and sees its picture instead, and the spelling appears only once the
// item is solved or revealed.
import { expectedOf } from '../../english/engine/answer-check';
import type { LetterPickItem } from '../../english/english-types';
import { pictureEl, pictureForWord } from './english-picture';
import { tei } from './english-strings';
import {
  choiceButton,
  type EnglishWidget,
  type EnglishWidgetHooks,
  type EnglishWidgetOptions,
  englishWordEl,
  renderGloss,
  widgetRoot,
} from './english-widget-layout';

export function mountLetterChoice(
  item: LetterPickItem,
  hooks: EnglishWidgetHooks,
  options: EnglishWidgetOptions,
): EnglishWidget {
  const doc = options.doc ?? document;
  const isAlphabetOrder = item.skillId === 'en-alphabet-order';
  const cue = isAlphabetOrder ? tei('cueNextLetter') : tei('cueFirstLetter');
  const { root, body, gloss } = widgetRoot(item, cue, doc, options);
  const prompt = doc.createElement('p');
  prompt.className = 'english-prompt';
  // R146: the spelling stays hidden until the answer is known. The picture
  // stands in for the word; the speaker button (in the widget root) reads
  // it, and it auto-plays once when the item opens if sound is on.
  let showWord: (() => void) | null = null;
  if (isAlphabetOrder) {
    prompt.append(englishWordEl(item.prompt, doc));
  } else {
    // R146: the item's own picture first (a pack word's picture lives on
    // the item), then the bank lookup, then a generic picture.
    const picture = item.picture ?? pictureForWord(item.prompt) ?? '🖼️';
    prompt.appendChild(pictureEl(picture, doc));
    prompt.classList.add('english-prompt--picture');
    showWord = () => {
      prompt.textContent = '';
      prompt.classList.remove('english-prompt--picture');
      prompt.append(englishWordEl(item.prompt, doc));
    };
    options.speak?.onSpeak();
  }
  body.appendChild(prompt);
  const grid = doc.createElement('div');
  grid.className = 'english-choice-grid';
  grid.setAttribute('role', 'group');
  body.appendChild(grid);
  const expected = expectedOf(item);
  const answerIndex = expected.kind === 'letter-pick' ? expected.index : -1;
  let done = false;
  const buttons = item.choices.map((letter, index) => {
    const button = choiceButton(
      letter,
      index,
      () => {
        if (done) return;
        const verdict = hooks.onAttempt({ kind: 'letter-pick', index });
        if (verdict.correct) {
          done = true;
          button.classList.add('correct');
          for (const b of buttons) b.disabled = true;
          showWord?.();
          hooks.onSolved();
        } else if (!verdict.reveal) {
          button.classList.add('wrong');
        }
      },
      doc,
      true,
    );
    grid.appendChild(button);
    return button;
  });
  return {
    element: root,
    revealAnswer() {
      done = true;
      for (const [index, button] of buttons.entries()) {
        button.disabled = true;
        if (index === answerIndex) button.classList.add('correct');
      }
      showWord?.();
    },
    helpOnce() {
      if (done) return;
      const wrong = buttons.filter((b, i) => i !== answerIndex && !b.disabled);
      if (wrong.length === 0) return;
      const pick = wrong[Math.floor(Math.random() * wrong.length)] as HTMLButtonElement;
      pick.disabled = true;
      pick.classList.add('eliminated');
    },
    showGloss() {
      renderGloss(gloss, options, doc);
    },
    destroy() {
      root.remove();
    },
  };
}
