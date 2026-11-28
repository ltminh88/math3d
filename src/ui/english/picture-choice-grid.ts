// Picture-choice grid (Phase 1B): hear/read the word, tap its picture.
// Wrong taps stay enabled (a retry is a new miss — the 3-miss budget needs it),
// the right tap locks the grid and ends the item.
import { expectedOf } from '../../english/engine/answer-check';
import type { ListenPickPictureItem } from '../../english/english-types';
import { tei } from './english-strings';
import {
  type EnglishWidget,
  type EnglishWidgetHooks,
  type EnglishWidgetOptions,
  englishWordEl,
  pictureChoiceButton,
  renderGloss,
  widgetRoot,
} from './english-widget-layout';

export function mountPictureChoiceGrid(
  item: ListenPickPictureItem,
  hooks: EnglishWidgetHooks,
  options: EnglishWidgetOptions,
): EnglishWidget {
  const doc = options.doc ?? document;
  const { root, body, gloss } = widgetRoot(item, tei('cueListen'), doc, options);
  const prompt = doc.createElement('p');
  prompt.className = 'english-prompt';
  prompt.append(englishWordEl(item.word, doc));
  // Tier 3 listen-only (3B): the word stays hidden while audio exists.
  if (!options.hideWord) body.appendChild(prompt);
  const grid = doc.createElement('div');
  grid.className = 'english-choice-grid';
  grid.setAttribute('role', 'group');
  body.appendChild(grid);
  const expected = expectedOf(item);
  const answerIndex = expected.kind === 'listen-pick-picture' ? expected.index : -1;
  let done = false;
  const buttons = item.choices.map((choice, index) => {
    // R147: the picture renders through the shared helper — a data-URI
    // picture becomes a real <img>, never button text.
    const button = pictureChoiceButton(
      choice.picture,
      choice.word,
      index,
      () => {
        if (done) return;
        const verdict = hooks.onAttempt({ kind: 'listen-pick-picture', index });
        if (verdict.correct) {
          done = true;
          button.classList.add('correct');
          for (const b of buttons) b.disabled = true;
          hooks.onSolved();
        } else if (!verdict.reveal) {
          button.classList.add('wrong');
        }
      },
      doc,
    );
    button.classList.add('english-picture-choice');
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
