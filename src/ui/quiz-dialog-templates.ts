// Quiz dialog body markup. The multiplication template is the recovered one, byte-identical (DOM
// parity; quiz-dialog-templates.test.ts snapshots it); the word-problem template (phase 04) shares
// its answer buttons and footer.
import type { Question } from '../quiz/question-types';
import { icon } from './icons';
import { wordProblemTexts } from './quiz-word-problem-strings';

export interface QuizView {
  bridgeMode: boolean;
  /** Built bridge segments and their total (the bridge eyebrow). */
  bridge: number;
  segments: number;
}

const answersHtml = (question: Question): string =>
  `<div class="answers">${question.options.map((option, index) => `<button class="answer" data-value="${option.value}"><kbd>${index + 1}</kbd><span>${option.label}</span></button>`).join('')}</div>`;

const footerHtml = (): string =>
  `<div id="feedback" class="feedback" aria-live="polite"></div><div id="hint-area" class="hint-area" hidden></div><div class="quiz-footer"><button id="hint" class="text-button">${icon('help')} Gợi ý cho mình</button><span>Không giới hạn thời gian</span></div><button id="next-question" class="primary wide" hidden>Tiếp tục ${icon('arrow')}</button>`;

const bridgeEyebrow = (view: QuizView): string => `ĐOẠN CẦU ${view.bridge + 1} / ${view.segments}`;

function mulBodyHtml(question: Question, view: QuizView): string {
  const { bridgeMode } = view;
  return `<div class="dialog-eyebrow">${bridgeMode ? bridgeEyebrow(view) : question.review ? 'ÔN LẠI PHÉP NHÂN' : 'LUYỆN TẬP CÙNG VLM'}</div><p class="question-intro">${bridgeMode ? `Mình cần <strong>${question.answer} viên đá</strong>. Phép nhân nào đúng?` : 'Bạn tìm được kết quả không?'}</p><div class="equation">${bridgeMode ? `<span class="stone-symbol">◆</span> ${question.answer} <small>viên đá</small>` : `${question.a} <span>×</span> ${question.b} <span>=</span> ?`}</div>${answersHtml(question)}${footerHtml()}`;
}

/** Story + question of a word problem (text only: numbers from the generator, no user input). */
function wordBodyHtml(question: Question, view: QuizView): string {
  const texts = wordProblemTexts(question);
  const eyebrow = view.bridgeMode ? bridgeEyebrow(view) : texts.eyebrow;
  return `<div class="dialog-eyebrow">${eyebrow}</div><p class="question-intro quiz-word-badge">${texts.badge}</p><p class="quiz-word-story">${texts.story}</p><p class="quiz-word-ask">${texts.ask}</p>${answersHtml(question)}${footerHtml()}`;
}

export function quizBodyHtml(question: Question, view: QuizView): string {
  return question.word ? wordBodyHtml(question, view) : mulBodyHtml(question, view);
}
