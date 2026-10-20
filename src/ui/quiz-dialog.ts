// Quiz dialog: bridge-building (pick the expression for N stones) or practice (a × b = ?).
// Number keys 1-3 answer while it is open (see keyboard-joystick.ts). Facts come from the
// Leitner planner over the chosen table (progress-sync.ts -> learning-quiz-adapter.ts).
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import type { Question, QuizMode } from '../quiz/question-types';
import { closeDialog, openDialog } from './dialog';
import { gameState } from './game-state';
import { byId, icon } from './icons';
import { nextQuizQuestion } from './progress-sync';
import { answerQuestion, renderHint } from './quiz-answer';
import { showToast } from './toast-and-persist';

function quizBodyHtml(question: Question): string {
  const bridgeMode = gameState.quizMode === 'bridge';
  return `<div class="dialog-eyebrow">${bridgeMode ? `ĐOẠN CẦU ${gameState.progress.bridge + 1} / ${BRIDGE_SEGMENTS}` : question.review ? 'ÔN LẠI PHÉP NHÂN' : 'LUYỆN TẬP CÙNG VLM'}</div><p class="question-intro">${bridgeMode ? `Mình cần <strong>${question.answer} viên đá</strong>. Phép nhân nào đúng?` : 'Bạn tìm được kết quả không?'}</p><div class="equation">${bridgeMode ? `<span class="stone-symbol">◆</span> ${question.answer} <small>viên đá</small>` : `${question.a} <span>×</span> ${question.b} <span>=</span> ?`}</div><div class="answers">${question.options.map((option, index) => `<button class="answer" data-value="${option.value}"><kbd>${index + 1}</kbd><span>${option.label}</span></button>`).join('')}</div><div id="feedback" class="feedback" aria-live="polite"></div><div id="hint-area" class="hint-area" hidden></div><div class="quiz-footer"><button id="hint" class="text-button">${icon('help')} Gợi ý cho mình</button><span>Không giới hạn thời gian</span></div><button id="next-question" class="primary wide" hidden>Tiếp tục ${icon('arrow')}</button>`;
}

/** Draws a new question for `mode` (never repeating the fact `lastKey`) and shows it. */
export function openQuiz(mode: QuizMode, lastKey = ''): void {
  gameState.quizMode = mode;
  gameState.question = nextQuizQuestion(mode, lastKey);
  gameState.hintLevel = 0;
  gameState.answered = false;
  gameState.wrongAnswers = [];
  gameState.questionStartedAt = performance.now();
  gameState.questionShownAt = gameState.questionStartedAt;
  const question = gameState.question;
  openDialog(
    gameState.quizMode === 'bridge' ? 'Cùng xây cây cầu!' : 'Mỗi ngày, giỏi hơn một chút',
    quizBodyHtml(question),
    'quiz',
  );
  for (const button of document.querySelectorAll<HTMLButtonElement>('.answer')) {
    button.onclick = () => answerQuestion(Number(button.dataset.value), button);
  }
  byId('hint').onclick = () => {
    gameState.hintLevel = Math.min(3, gameState.hintLevel + 1);
    renderHint();
  };
  byId('next-question').onclick = () => {
    if (gameState.quizMode === 'bridge' && gameState.progress.bridge === BRIDGE_SEGMENTS) {
      closeDialog();
      showToast('Tuyệt vời! Cầu đã xây xong. Cùng đi qua cầu đến khu vườn nhé!');
    } else {
      openQuiz(gameState.quizMode, question.factKey);
    }
  };
}
