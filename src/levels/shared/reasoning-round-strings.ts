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
    revealed: 'Không sao đâu! Mình đã điền đáp án rồi, mình làm tiếp nhé.',
    stepRight: 'Đúng rồi! Làm tiếp bước sau nhé.',
    reward: '+{xp} XP',
    encourage: 'Đọc lại đề thật chậm nhé. Bài cho biết gì? Bài hỏi gì?',
    thisStep: 'Bước này: {op}',
    opThenAdd: '{a} × {n} = ? rồi cộng thêm {a}',
    opDivRem: '{total} : {per} = ? (dư ?)',
    lookWp:
      'Vẽ sơ đồ đoạn thẳng nhé. Mỗi bạn (hay mỗi rổ) là một đoạn. Gấp mấy lần thì vẽ bấy nhiêu đoạn bằng nhau.',
    planTimesAdd:
      'Tìm số của bạn thứ hai trước, bằng phép nhân. Sau đó cộng thêm số của bạn thứ nhất.',
    planTimesCompare: 'Hỏi “gấp mấy lần” thì lấy số lớn chia cho số bé, không làm phép trừ.',
    lookPattern: 'Mỗi số hơn số đứng trước bao nhiêu? Đó là bước đếm.',
    planPattern: 'Lấy số đứng trước cộng thêm bước đếm là ra số tiếp theo.',
    lookDiv: 'Lấy tất cả chia cho số ở mỗi phần. Số dư luôn bé hơn số chia.',
    planFloor: 'Thương là số hộp xếp đầy. Số dư là số còn thừa.',
    planCeil: 'Còn thừa dù chỉ một bạn thì cũng cần thêm một xe nữa đấy!',
    lookUnknown: 'Muốn tìm thừa số, lấy tích chia cho thừa số kia.',
    planUnknown: 'Thử lại nhé: thay số vừa tìm vào dấu ?, xem hai bên có bằng nhau không.',
    lookExpr: 'Có ngoặc thì tính trong ngoặc trước. Nhân, chia trước; cộng, trừ sau.',
    planExpr: 'Tính phần làm trước rồi viết kết quả vào. Sau đó tính tiếp từ trái sang phải.',
    lookClaim: 'Bạn tự tính lại, rồi so với số bạn Nam nói.',
    planClaim: 'Hai số khác nhau thì bạn Nam nói sai. Hãy điền số bạn vừa tính.',
  },
  en: {
    badge: 'Thinking challenge',
    hint: 'Hint',
    wrong: 'Not quite, try again. Press Hint if you need it!',
    correct: 'Brilliant! You solved the challenge.',
    revealed: 'That’s okay! The answer is filled in; let’s keep going.',
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
    planPattern: 'Add the step to the number before to get the next one.',
    lookDiv:
      'Share equally: divide the whole by the size of each part. The remainder is always smaller than the divisor.',
    planFloor: 'The quotient is the number of full boxes. The remainder is what is left.',
    planCeil: 'Even one child left over needs one more car!',
    lookUnknown: 'The missing factor = the product divided by the other factor.',
    planUnknown: 'Check: put your number in place of ? and see if both sides match.',
    lookExpr: 'Brackets first; then × and :, then + and −.',
    planExpr: 'Write down the part you work out first, then go on from left to right.',
    lookClaim: 'Work it out yourself and compare with what Nam says.',
    planClaim: 'If they differ the sentence is false: put in the result you worked out.',
  },
});

export type ReasoningStringKey = Parameters<typeof trr>[0];
