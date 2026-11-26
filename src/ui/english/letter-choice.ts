// Letter choice (Phase 1B): read the word, tap its first letter — or, for
// alphabet-order, tap the letter that comes next. Same tap flow as the
// picture grid: wrong taps stay enabled, the right tap locks the widget.
import { expectedOf } from '../../english/engine/answer-check';
import type { LetterPickItem } from '../../english/english-types';
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
  const cue = item.skillId === 'en-alphabet-order' ? tei('cueNextLetter') : tei('cueFirstLetter');
  const { root, body, gloss } = widgetRoot(item, cue, doc);
  const prompt = doc.createElement('p');
  prompt.className = 'english-prompt';
  prompt.append(englishWordEl(item.prompt, doc));
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
