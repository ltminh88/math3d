// Answer checking and per-fact statistics update (recovered verbatim).
import type { QuestionStat, SaveV1 } from '../save/save-types';
import type { Question } from './question-types';

export const isCorrect = (question: Pick<Question, 'answer'>, value: number): boolean =>
  value === question.answer;

/**
 * Records one answer: bumps attempts and correct/wrong, stamps the time, queues wrong answers
 * for review and updates the combo. Not capped here (the 30-entry cap applies on reload only).
 */
export function applyAnswerStats(
  save: Pick<SaveV1, 'questionStats' | 'review' | 'combo'>,
  question: Pick<Question, 'id'>,
  correct: boolean,
  responseMs: number,
): void {
  const stat: QuestionStat = save.questionStats[question.id] ?? {
    attempts: 0,
    correct: 0,
    wrong: 0,
    lastAnsweredAt: '',
    responseTime: 0,
  };
  stat.attempts++;
  stat[correct ? 'correct' : 'wrong']++;
  stat.lastAnsweredAt = new Date().toISOString();
  stat.responseTime = Math.round(responseMs);
  save.questionStats[question.id] = stat;
  if (!correct && !save.review.includes(question.id)) {
    save.review.push(question.id);
  }
  save.combo = correct ? save.combo + 1 : 0;
}
