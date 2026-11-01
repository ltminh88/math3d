// Texts of the old levels' reasoning round (vi source, en mirror): the panel, and the hint ladder
// per skill (built in reasoning-round-hints.ts) — 1 encourage, 2 the picture ("sơ đồ đoạn
// thẳng"), 3 the strategy plus the current step's operation with "?".
import { defineStrings } from '../../i18n/i18n';

export const trr = defineStrings('reasoningRound', {
  vi: {
    badge: 'Thử thách suy luận',
    hint: 'Gợi ý',
    wrong: 'Chưa đúng rồi, bạn thử lại nhé. Bấm Gợi ý nếu cần!',
    correct: 'Giỏi quá! Bạn đã giải xong thử thách.',
    revealed: 'Không sao đâu! Mình đã điền đáp án, lần sau bạn thử lại nhé.',
    stepRight: 'Đúng rồi! Làm tiếp bước sau nhé.',
    reward: '+{xp} XP',
    encourage: 'Bình tĩnh đọc lại đề nhé: bài cho biết gì, bài hỏi gì?',
    thisStep: 'Bước này: {op}',
    opThenAdd: '{a} × {n} = ? rồi cộng thêm {a}',
    opDivRem: '{total} : {per} = ? (dư ?)',
    lookWp:
      'Vẽ sơ đồ đoạn thẳng: mỗi bạn (mỗi rổ) là một đoạn, “gấp mấy lần” là mấy đoạn bằng nhau.',
    planTimesAdd: 'Tìm phần của bạn thứ hai trước (phép nhân), rồi cộng với phần của bạn thứ nhất.',
    planTimesCompare: '“Gấp mấy lần” thì lấy số lớn chia cho số bé, không phải trừ.',
    lookPattern: 'Xem mỗi số hơn số đứng trước bao nhiêu: đó là bước đếm.',
    planPattern: 'Lấy số cuối cùng cộng thêm bước đếm để ra số tiếp theo.',
    lookDiv: 'Chia đều: lấy tất cả chia cho số mỗi phần. Số dư luôn bé hơn số chia.',
    planFloor: 'Thương là số phần đủ, số dư là số còn thừa.',
    planCeil: 'Còn thừa dù chỉ một chút thì cần thêm một chỗ nữa đấy!',
    lookUnknown: 'Thừa số chưa biết = tích chia cho thừa số kia.',
    planUnknown: 'Thử lại: nhân số vừa tìm với thừa số kia xem có ra tích không.',
    lookExpr: 'Có ngoặc thì tính trong ngoặc trước; nhân, chia trước rồi mới cộng, trừ.',
    planExpr: 'Viết kết quả của phần làm trước, rồi tính tiếp từ trái sang phải.',
    lookClaim: 'Tự tính lại phép tính rồi so với kết quả bạn Nam nói.',
    planClaim: 'Nếu khác nhau thì câu đó sai: điền kết quả bạn vừa tính.',
  },
  en: {
    badge: 'Thinking challenge',
    hint: 'Hint',
    wrong: 'Not quite, try again. Press Hint if you need it!',
    correct: 'Brilliant! You solved the challenge.',
    revealed: 'That’s okay! The answer is filled in; try again next time.',
    stepRight: 'Right! On to the next step.',
    reward: '+{xp} XP',
    encourage: 'Take your time and read it again: what do you know, what is asked?',
    thisStep: 'This step: {op}',
    opThenAdd: '{a} × {n} = ?, then add {a}',
    opDivRem: '{total} : {per} = ? (remainder ?)',
    lookWp:
      'Draw a bar model: each person (or basket) is a bar; “n times as many” is n equal bars.',
    planTimesAdd: 'Find the second amount first (multiply), then add the first amount.',
    planTimesCompare:
      '“How many times” means dividing the big number by the small one, not subtracting.',
    lookPattern: 'See how much each number grows from the one before: that is the step.',
    planPattern: 'Add the step to the last number to get the next one.',
    lookDiv:
      'Share equally: divide the whole by the size of each part. The remainder is always smaller than the divisor.',
    planFloor: 'The quotient is the number of full parts, the remainder is what is left.',
    planCeil: 'Anything left over, even a little, needs one more!',
    lookUnknown: 'The missing factor = the product divided by the other factor.',
    planUnknown: 'Check: multiply your number by the other factor and see if you get the product.',
    lookExpr: 'Brackets first; then × and :, then + and −.',
    planExpr: 'Write down the part you work out first, then go on from left to right.',
    lookClaim: 'Work it out yourself and compare with what Nam says.',
    planClaim: 'If they differ the sentence is false: put in the result you worked out.',
  },
});

export type ReasoningStringKey = Parameters<typeof trr>[0];
