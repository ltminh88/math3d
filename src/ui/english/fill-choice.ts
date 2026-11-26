// Fill choice (Phase 1B): a sentence with one blank, tap the word that fits.
// Same tap flow as the picture grid: wrong taps stay enabled, the right tap
// locks the widget.
import { expectedOf } from '../../english/engine/answer-check';
import type { FillPatternItem } from '../../english/english-types';
import { tei } from './english-strings';
import {
  choiceButton,
  type EnglishWidget,
  type EnglishWidgetHooks,
  type EnglishWidgetOptions,
  englishWordEl,
  questionParagraph,
  renderGloss,
  widgetRoot,
} from './english-widget-layout';

export function mountFillChoice(
  item: FillPatternItem,
  hooks: EnglishWidgetHooks,
  options: EnglishWidgetOptions,
): EnglishWidget {
  const doc = options.doc ?? document;
  const { root, body, gloss } = widgetRoot(item, tei('cueFill'), doc, options);
  const question = questionParagraph(item.question, doc);
  if (question) body.appendChild(question);
  const sentence = doc.createElement('p');
  sentence.className = 'english-prompt';
  for (const [index, word] of item.sentence.entries()) {
    if (index > 0) sentence.append(doc.createTextNode(' '));
    if (index === item.blankIndex) {
      const blank = doc.createElement('span');
      blank.className = 'english-blank';
      blank.textContent = '___';
      sentence.appendChild(blank);
    } else {
      sentence.append(englishWordEl(word, doc));
    }
  }
  body.appendChild(sentence);
  const grid = doc.createElement('div');
  grid.className = 'english-choice-grid';
  grid.setAttribute('role', 'group');
  body.appendChild(grid);
  const expected = expectedOf(item);
  const answerIndex = expected.kind === 'fill-pattern' ? expected.index : -1;
  let done = false;
  const buttons = item.options.map((option, index) => {
    const button = choiceButton(
      option,
      index,
      () => {
        if (done) return;
        const verdict = hooks.onAttempt({ kind: 'fill-pattern', index });
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
