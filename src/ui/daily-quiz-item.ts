// One daily-practice × / : item in the shared dialog (phase 11): the quiz dialog's 3-choice
// rendering (quizBodyHtml), its hint ladder, and a visible "Dừng lại" button. A correct
// answer pays +5 coins, no XP; a wrong answer just climbs the hint ladder — the child keeps
// trying until it is right, or leaves (a half-answered item is recorded as missed).
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { COINS_PER_CORRECT } from '../learning/scoring';
import type { QuestionOutcome } from '../learning/session-recorder';
import { hintText } from '../quiz/hint-text';
import type { Question } from '../quiz/question-types';
import { td } from './daily-practice-strings';
import { gameState } from './game-state';
import { byId } from './icons';
import { quizBodyHtml } from './quiz-dialog-templates';

export interface DailyQuizCallbacks {
  /** The item is finished (solved): record it and pay the per-answer coins. */
  onAnswered(outcome: QuestionOutcome): void;
  /** The child asked for the next item (or the results, on the last one). */
  onNext(): void;
  /** The child left mid-item. */
  onLeave(): void;
}

/** Body HTML for the item: an already-counted note, then the quiz dialog's rendering. */
export function quizItemHtml(question: Question, alreadyCounted: boolean): string {
  const note = alreadyCounted ? `<p class="daily-note">${td('alreadyDone')}</p>` : '';
  return `${note}${quizBodyHtml(question, { bridgeMode: false, bridge: 0, segments: BRIDGE_SEGMENTS })}`;
}

function hintHtml(question: Question, level: number): string {
  if (question.factKey.startsWith('div:')) {
    const { a: dividend, b: divisor, answer: quotient } = question;
    if (level === 1)
      return `<p>Chia ${dividend} viên đá đều cho ${divisor} bạn. Mỗi bạn được mấy viên? Đếm từng nhóm nhé!</p><div class="stone-groups" aria-label="${divisor} nhóm, mỗi nhóm có ${quotient} viên đá">${Array.from(
        { length: divisor },
        () => `<div class="stone-group">${'<i></i>'.repeat(quotient)}</div>`,
      ).join('')}</div>`;
    if (level === 2) {
      const multiples = Array.from({ length: quotient }, (_, i) => (i + 1) * divisor).join(', ');
      return `<p>Đếm thêm ${divisor}: ${multiples}… Đếm xem có mấy lần ${divisor}?</p>`;
    }
    return `<p>${dividend} : ${divisor} = ${quotient}. Mình cùng thử lại nhé!</p>`;
  }
  return `<p>${hintText(question, level)}</p><div class="stone-groups" aria-label="${question.a} nhóm, mỗi nhóm có ${question.b} viên đá">${Array.from(
    { length: question.a },
    () => `<div class="stone-group">${'<i></i>'.repeat(question.b)}</div>`,
  ).join('')}</div>`;
}

/**
 * Wires the item's buttons inside the open dialog. Returns the outcome of the item left
 * unfinished (wrong answers only), for the run's leave path — null when nothing to record.
 */
export function mountQuizItem(
  question: Question,
  isLast: boolean,
  cb: DailyQuizCallbacks,
): () => QuestionOutcome | null {
  const startedAt = performance.now();
  const wrongAnswers: number[] = [];
  let hintLevel = 0;
  let answered = false;
  const outcome = (correct: boolean): QuestionOutcome => ({
    factKey: question.factKey,
    ms: Math.round(performance.now() - startedAt),
    correct,
    firstTry: wrongAnswers.length === 0,
    usedHint: hintLevel > 0,
    wrongAnswers: [...wrongAnswers],
  });

  const renderHint = () => {
    const area = byId('hint-area');
    area.hidden = false;
    area.innerHTML = hintHtml(question, hintLevel);
  };
  const feedback = (text: string, tone: 'success' | 'gentle') => {
    const el = byId('feedback');
    el.textContent = text;
    el.className = `feedback ${tone}`;
  };

  for (const button of document.querySelectorAll<HTMLButtonElement>('.answers .answer')) {
    button.onclick = () => {
      if (answered || button.disabled) return;
      const value = Number(button.dataset.value);
      if (value === question.answer) {
        answered = true;
        for (const b of document.querySelectorAll<HTMLButtonElement>('.answers .answer'))
          b.disabled = true;
        button.classList.add('correct');
        const key = question.factKey.startsWith('div:') ? 'correctDiv' : 'correctMul';
        feedback(td(key, { a: question.a, b: question.b, answer: question.answer }), 'success');
        const pop = document.createElement('b');
        pop.className = 'reward-pop';
        pop.textContent = `+${COINS_PER_CORRECT} xu`;
        button.append(pop);
        pop.addEventListener('animationend', () => pop.remove());
        byId('next-question').hidden = false;
        byId('next-question').textContent = isLast ? td('seeResult') : td('next');
        byId('hint').hidden = true;
        gameState.audio.correct();
        cb.onAnswered(outcome(true));
      } else {
        wrongAnswers.push(value);
        hintLevel = Math.min(3, hintLevel + 1);
        button.classList.add('incorrect');
        button.disabled = true;
        feedback(td('wrong'), 'gentle');
        renderHint();
        gameState.audio.hint();
      }
    };
  }
  byId('hint').onclick = () => {
    hintLevel = Math.min(3, hintLevel + 1);
    renderHint();
  };
  byId('next-question').onclick = () => cb.onNext();
  const leave = document.createElement('button');
  leave.type = 'button';
  leave.className = 'text-button daily-leave';
  leave.textContent = td('leave');
  leave.onclick = () => cb.onLeave();
  byId('dialog-content').append(leave);
  return () => (!answered && wrongAnswers.length > 0 ? outcome(false) : null);
}
