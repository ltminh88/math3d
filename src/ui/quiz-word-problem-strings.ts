// Texts of the quiz word problems (vi source, en mirror; at most two short sentences so the story
// fits the phone dialog) and their hint ladder: 1 re-read / what to find first, 2 the "sơ đồ đoạn
// thẳng" picture, 3 the operations with "?" (never the answer: the worked answer is only in the
// feedback after a right answer). The multiplication hint ladder (hint-text.ts) is untouched.
import { defineStrings } from '../i18n/i18n';
import type { Question } from '../quiz/question-types';

const tw = defineStrings('quizWord', {
  vi: {
    eyebrow: 'BÀI TOÁN CÓ LỜI VĂN',
    badge: 'Thử thách suy luận',
    addStory: 'Đội Mai chở được {a} viên đá. Đội Nam chở được gấp {n} lần đội Mai.',
    addAsk: 'Cả hai đội chở được bao nhiêu viên đá?',
    cmpStory: 'Bờ bên này có {big} viên đá, bờ bên kia có {small} viên đá.',
    cmpAsk: 'Số đá bờ bên này gấp mấy lần bờ bên kia?',
    addHint1: 'Đọc lại đề nhé: tìm số đá của đội Nam trước, rồi mới tính cả hai đội.',
    addHint2: 'Sơ đồ đoạn thẳng: đội Mai là 1 đoạn {a} viên, đội Nam là {n} đoạn như thế.',
    addHint3: 'Đội Nam: {a} × {n} = ?. Cả hai đội: lấy số đó cộng thêm {a}.',
    cmpHint1: 'Hỏi “gấp mấy lần” thì mình làm phép chia, không phải phép trừ nhé!',
    cmpHint2: 'Sơ đồ đoạn thẳng: đặt mấy đoạn {small} viên nối nhau thì dài bằng đoạn {big} viên?',
    cmpHint3: 'Bờ bên này gấp mấy lần bờ bên kia: {big} : {small} = ?',
    addSolved: '{a} × {n} + {a} = {answer}',
    cmpSolved: '{big} : {small} = {n}',
    correct: '✓ Chính xác! {solved}. +10 XP · +5 xu',
    wrong: '↻ Chưa đúng rồi. Mình cùng đọc lại đề nhé!',
  },
  en: {
    eyebrow: 'WORD PROBLEM',
    badge: 'Thinking challenge',
    addStory: 'Team Mai carried {a} stones. Team Nam carried {n} times as many as Team Mai.',
    addAsk: 'How many stones did the two teams carry altogether?',
    cmpStory: 'This bank has {big} stones, the other bank has {small} stones.',
    cmpAsk: 'How many times as many stones does this bank have?',
    addHint1: 'Read it again: find Team Nam’s stones first, then both teams together.',
    addHint2: 'Bar model: Team Mai is 1 bar of {a}, Team Nam is {n} bars like that.',
    addHint3: 'Team Nam: {a} × {n} = ?. Both teams: add {a} to that.',
    cmpHint1: '“How many times as many” means dividing, not taking away!',
    cmpHint2: 'Bar model: how many bars of {small} laid end to end make the bar of {big}?',
    cmpHint3: 'How many times as many: {big} : {small} = ?',
    addSolved: '{a} × {n} + {a} = {answer}',
    cmpSolved: '{big} : {small} = {n}',
    correct: '✓ Correct! {solved}. +10 XP · +5 coins',
    wrong: '↻ Not quite. Let’s read it again!',
  },
});

const isAdd = (q: Question): boolean => q.word?.skillId === 'wp-times-then-add';

function params(q: Question): Record<string, number> {
  const p = q.word?.params ?? {};
  return isAdd(q)
    ? { a: q.a, n: q.b, answer: q.answer }
    : { big: p.big ?? 0, small: p.small ?? 0, n: q.answer };
}

export function wordProblemTexts(q: Question) {
  const p = params(q);
  return {
    eyebrow: tw('eyebrow'),
    badge: tw('badge'),
    story: tw(isAdd(q) ? 'addStory' : 'cmpStory', p),
    ask: tw(isAdd(q) ? 'addAsk' : 'cmpAsk', p),
  };
}

/** Hint rung 1-2, anything else (0, 3+) rung 3: the operations with "?", never the answer. */
export function wordProblemHint(q: Question, level: number): string {
  const rung = level === 1 || level === 2 ? level : 3;
  return tw(`${isAdd(q) ? 'add' : 'cmp'}Hint${rung}` as 'addHint1', params(q));
}

/** Feedback after the right answer, with the combo tail of the original line. */
export function wordProblemCorrect(q: Question, comboTail: string): string {
  const solved = tw(isAdd(q) ? 'addSolved' : 'cmpSolved', params(q));
  return `${tw('correct', { solved })}${comboTail}`;
}

export const wordProblemWrong = (): string => tw('wrong');
