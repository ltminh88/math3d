// Hint ladder text (Vietnamese verbatim): 1 = count groups, 2 = repeated addition,
// anything else (0, 3+) = full worked answer.
import type { Question } from './question-types';

export function hintText(question: Pick<Question, 'a' | 'b' | 'answer'>, level: number): string {
  const { a, b, answer } = question;
  switch (level) {
    case 1:
      return `Có ${a} nhóm, mỗi nhóm ${b} viên đá. Hãy đếm từng nhóm nhé!`;
    case 2:
      return `Cộng các nhóm lại: ${Array(a).fill(b).join(' + ')} = ?`;
    default:
      return `${a} nhóm, mỗi nhóm ${b} viên đá: ${a} × ${b} = ${answer}. Mình cùng thử lại nhé!`;
  }
}
