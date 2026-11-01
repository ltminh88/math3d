// Quiz dialog: bridge-building (pick the expression for N stones) or practice (a × b = ?); once
// the table is mastered every 5th question is a word problem (quiz-dialog-templates.ts).
// Number keys 1-3 answer while it is open (see keyboard-joystick.ts). Facts come from the
// Leitner planner over the chosen table (progress-sync.ts -> learning-quiz-adapter.ts).
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import type { QuizMode } from '../quiz/question-types';
import { closeDialog, openDialog } from './dialog';
import { gameState } from './game-state';
import { byId } from './icons';
import { nextQuizQuestion } from './progress-sync';
import { answerQuestion, renderHint } from './quiz-answer';
import { quizBodyHtml } from './quiz-dialog-templates';
import './quiz-touch-and-word-problem.css';
import { showToast } from './toast-and-persist';

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
    quizBodyHtml(question, {
      bridgeMode: gameState.quizMode === 'bridge',
      bridge: gameState.progress.bridge,
      segments: BRIDGE_SEGMENTS,
    }),
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
