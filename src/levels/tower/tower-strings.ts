import type { defineStrings } from '../../i18n/i18n';

/**
 * Tower strings (vi source). The division sign is `:` in Vietnamese (GDPT 2018), `÷` in English;
 * `divSign` carries it for equations built in code. VLM is named through `tc('guideName')`.
 */
const define = (defineFn: typeof defineStrings) =>
  defineFn('tower', {
    vi: {
      title: 'Tháp Toán Học',
      mulSign: '×',
      divSign: ':',
      intro:
        'Những viên đá số của tháp rơi hết xuống đất rồi! Mỗi câu đúng đưa một viên đá về chỗ cũ, mình cùng leo lên đỉnh nhé!',
      floor: 'Tầng {n}/{total}',
      promptChoice: 'Chọn kết quả đúng nhé!',
      promptPad: 'Bấm số để trả lời phép chia nhé!',
      promptMissing: 'Số nào còn thiếu?',
      promptFamily: 'Ba số {a}, {b} và {p} là một nhà. Điền các số còn thiếu nhé!',
      promptClaim: 'Đố vui: phép tính này đúng hay sai?',
      promptFix: 'Vậy kết quả đúng là bao nhiêu?',
      guideChoice: 'Chọn một trong ba số. Bấm phím 1, 2 hoặc 3 cũng được.',
      guidePad: 'Phép chia là phép nhân làm ngược lại đấy.',
      guideMissing: 'Số nào nhân với {y} thì được {z} nhỉ?',
      guideFamily: 'Một phép nhân cho ta hai phép chia đó!',
      guideClaim: 'Bạn tính thử, rồi bấm Đúng hoặc Sai nhé.',
      yes: 'Đúng',
      no: 'Sai',
      hint: 'Gợi ý',
      next: 'Lên tầng tiếp',
      nextTop: 'Lên đỉnh tháp',
      correct: 'Đúng rồi! {equation}',
      correctStep: 'Đúng rồi! Điền tiếp nhé.',
      claimCaught: 'Bạn tinh mắt quá, câu này sai thật! Giờ sửa lại cho đúng nhé.',
      wrong: 'Gần đúng rồi, mình thử lại nhé!',
      revealed: 'Mình cùng xem nhé: {equation}. Viên đá vẫn bay lên tầng!',
      lit: 'Tầng {n} sáng đèn rồi!',
      hint1: 'Đọc lại phép tính thật chậm nhé. Bạn làm được mà!',
      hint2Div: 'Nghĩ ngược lại: số nào chia cho {x} thì được {y}?',
      hint2Mul: 'Nhớ phép nhân nhé: ? × {d} = {p}',
      hint2DivOf: 'Nhớ phép chia nhé: {p} : {d} = ?',
      hint3Split: 'Tách ra cho dễ: {a} × {b} = {a} × 5 + {a} × {rest} = {five} + {more}',
      hint3Count: 'Đếm thêm {step}: {sequence}',
      hint3CountTo: 'Đếm thêm {step} cho tới {p}: {sequence}. Đếm xem mấy bước nhé!',
      hint4: 'Bước tiếp theo nè: {equation}',
      doneTitle: 'Bạn đã lên tới đỉnh tháp!',
      doneLine:
        'Ngọn đèn trên đỉnh tháp sáng rực rồi. Bạn đã ôn cả phép nhân lẫn phép chia, giỏi quá!',
      doneScore: '+{xp} XP · +{coins} xu',
      stars: '{n}/3 sao',
      backToGate: 'Về cổng',
      keysHelp: 'Phím 1, 2, 3 để chọn. Gõ số rồi Enter để trả lời.',
      reward: '+{xp} XP',
    },
    en: {
      title: 'Math Tower',
      mulSign: '×',
      divSign: '÷',
      intro:
        'The tower’s number stones have all fallen down! Each right answer puts one back. Let’s climb to the top!',
      floor: 'Floor {n}/{total}',
      promptChoice: 'Pick the right answer!',
      promptPad: 'Type the answer to the division!',
      promptMissing: 'Which number is missing?',
      promptFamily: '{a}, {b} and {p} are one family. Fill in the missing numbers!',
      promptClaim: 'Riddle: is this right or wrong?',
      promptFix: 'So what is the right answer?',
      guideChoice: 'Pick one of the three numbers. Keys 1, 2 or 3 work too.',
      guidePad: 'Dividing is multiplying backwards.',
      guideMissing: 'Which number times {y} makes {z}?',
      guideFamily: 'One multiplication gives two divisions!',
      guideClaim: 'Work it out, then press Right or Wrong.',
      yes: 'Right',
      no: 'Wrong',
      hint: 'Hint',
      next: 'Next floor',
      nextTop: 'To the top',
      correct: 'Right! {equation}',
      correctStep: 'Right! Keep going.',
      claimCaught: 'Sharp eyes, that one is wrong! Now fix it.',
      wrong: 'Almost! Let’s try again.',
      revealed: 'Let’s look together: {equation}. The stone still flies up!',
      lit: 'Floor {n} is lit!',
      hint1: 'Read the problem again slowly. You can do it!',
      hint2Div: 'Think backwards: which number divided by {x} gives {y}?',
      hint2Mul: 'Think multiplication: ? × {d} = {p}',
      hint2DivOf: 'Think division: {p} ÷ {d} = ?',
      hint3Split: 'Split it: {a} × {b} = {a} × 5 + {a} × {rest} = {five} + {more}',
      hint3Count: 'Count by {step}: {sequence}',
      hint3CountTo: 'Count by {step} up to {p}: {sequence}. How many steps?',
      hint4: 'Next step: {equation}',
      doneTitle: 'You reached the top of the tower!',
      doneLine: 'The light on top of the tower is shining. You practised multiplying and dividing!',
      doneScore: '+{xp} XP · +{coins} coins',
      stars: '{n}/3 stars',
      backToGate: 'Back to the gate',
      keysHelp: 'Keys 1, 2, 3 pick an answer. Type a number and Enter to answer.',
      reward: '+{xp} XP',
    },
  });

export type TowerStrings = ReturnType<typeof define>;
let cached: TowerStrings | undefined;

/** The tower translator (namespace registered on first use, reused by later runs). */
export function towerStrings(defineFn: typeof defineStrings): TowerStrings {
  cached ??= define(defineFn);
  return cached;
}
