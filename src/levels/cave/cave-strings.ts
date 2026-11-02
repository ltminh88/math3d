import type { defineStrings } from '../../i18n/i18n';

/**
 * Cave strings (vi source, en mirror) for 7-9 year olds: short sentences, VLM named through
 * `tc('guideName')`. Key hints (`keysHelp`) are hidden on coarse pointers by the stylesheet.
 */
const define = (defineFn: typeof defineStrings) =>
  defineFn('cave', {
    vi: {
      title: 'Hang Đố Vui',
      intro:
        'Hang tối quá! Mỗi câu đố giải xong sẽ thắp sáng một viên pha lê và mở phòng tiếp theo.',
      chamber: 'Phòng {n}/{total}',
      formatWord: 'Câu đố có lời văn',
      formatRemainder: 'Câu đố chia có dư',
      formatChooseAll: 'Chọn tất cả câu đúng',
      formatTf: 'Đúng hay sai, vì sao?',
      formatExpression: 'Tính giá trị biểu thức',
      formatGeoMeas: 'Câu đố hình và đo',
      guideWord: 'Đọc kĩ từng câu, rồi giải từng bước nhé.',
      guideRemainder: 'Nhớ nhé: số dư luôn bé hơn số chia.',
      guideChooseAll: 'Chạm vào mọi câu đúng, rồi bấm Xong.',
      guideTf: 'Bạn tự tính thử, rồi bấm Đúng hoặc Sai.',
      guideExpression: 'Nhân, chia trước; cộng, trừ sau.',
      guideGeoMeas: 'Nhìn kĩ các số đo nhé.',
      hint: 'Gợi ý',
      next: 'Sang phòng tiếp',
      nextLast: 'Mở rương báu',
      correct: 'Đúng rồi! Viên pha lê sáng lên rồi!',
      correctStep: 'Đúng rồi! Làm tiếp bước sau nhé.',
      wrong: 'Chưa đúng, mình thử lại nhé!',
      revealed: 'Mình cùng xem lời giải nhé. Viên pha lê vẫn sáng!',
      lit: 'Phòng {n} sáng rồi!',
      hint1: 'Đọc lại câu đố thật chậm nhé. Bạn làm được mà!',
      hint2Word:
        'Vẽ sơ đồ đoạn thẳng nhé: mỗi số là một đoạn, số lớn thì đoạn dài. Câu hỏi là: {ask}',
      hint2Remainder: 'Số dư luôn bé hơn số chia. Câu hỏi là: {ask}',
      hint2Ceil: 'Không được để bạn nào ở lại nhé! Câu hỏi là: {ask}',
      hint2ChooseAll: 'Đọc từng câu một, tự tính rồi mới chọn. Có thể có nhiều câu đúng.',
      hint2Tf: 'Bạn tự tính lại, rồi so với số bạn Nam nói nhé. {ask}',
      hint2Expression: 'Nhân, chia trước; cộng, trừ sau. Có ngoặc thì làm trong ngoặc trước. {ask}',
      hint2Perimeter: 'Chu vi là tổng độ dài các cạnh của hình. Câu hỏi là: {ask}',
      hint2Fence: 'Hàng rào chạy quanh mảnh vườn: đó là chu vi. Câu hỏi là: {ask}',
      hint2Area: 'Diện tích hình chữ nhật bằng chiều dài nhân chiều rộng. Câu hỏi là: {ask}',
      hint2Circle: 'Đường kính dài bằng hai bán kính: bán kính + bán kính. Câu hỏi là: {ask}',
      hint3First: 'Làm phép tính này trước: {expr} = ? Rồi trả lời: {ask}',
      hint3Radius: 'Bán kính + bán kính = {d}. Vậy bán kính dài bao nhiêu? Rồi trả lời: {ask}',
      hint3Wrong: 'Câu “{label}” chưa đúng đâu. Kiểm tra các câu còn lại nhé.',
      hint3Each: 'Tính từng câu một. Câu nào tính ra đúng như đã viết thì mới chọn.',
      hint3Ask: 'Làm từng bước một nhé: {ask}',
      doneTitle: 'Bạn đã giải hết câu đố trong hang!',
      doneLine: 'Rương báu sáng rực rồi! Bạn đã đi hết chương 2, giỏi quá!',
      doneScore: '+{xp} XP · +{coins} xu',
      bonusLine: 'Thưởng lần đầu hoàn thành: +{xp} XP · +{coins} xu',
      stars: '{n}/3 sao',
      backToGate: 'Về cổng',
      keysHelp: 'Phím số và Enter để trả lời, 1–4 để chọn, H để xem gợi ý.',
      reward: '+{xp} XP',
    },
    en: {
      title: 'Puzzle Cave',
      intro:
        'It is dark in here! Each riddle you solve lights a crystal and opens the next chamber.',
      chamber: 'Chamber {n}/{total}',
      formatWord: 'Word problem',
      formatRemainder: 'Division with remainder',
      formatChooseAll: 'Choose every true sentence',
      formatTf: 'True or false, and why?',
      formatExpression: 'Work out the expression',
      formatGeoMeas: 'Shapes and measures',
      guideWord: 'Read each sentence carefully, then solve it step by step.',
      guideRemainder: 'Remember: the remainder is always less than the divisor.',
      guideChooseAll: 'Tap every true sentence, then Done.',
      guideTf: 'Work it out yourself, then tap True or False.',
      guideExpression: '× and : first, then + and −.',
      guideGeoMeas: 'Look carefully at the measurements.',
      hint: 'Hint',
      next: 'Next chamber',
      nextLast: 'Open the chest',
      correct: 'Right! The crystal lights up!',
      correctStep: 'Right! Now the next step.',
      wrong: 'Not yet, let us try again!',
      revealed: 'Let us look at the answer together. The crystal still lights up!',
      lit: 'Chamber {n} is lit!',
      hint1: 'Read the riddle again slowly. You can do it!',
      hint2Word:
        'Draw a line diagram: one segment per number, a longer one for the bigger number. The question is: {ask}',
      hint2Remainder: 'The remainder is always less than the divisor. The question is: {ask}',
      hint2Ceil: 'Nobody may be left behind! The question is: {ask}',
      hint2ChooseAll:
        'Read one sentence at a time and work it out first. More than one can be true.',
      hint2Tf: 'Work it out yourself and compare with Nam’s number. {ask}',
      hint2Expression: '× and : before + and −; brackets first. {ask}',
      hint2Perimeter: 'The perimeter is all the sides added up. The question is: {ask}',
      hint2Fence:
        'The fence goes all round the garden: that is the perimeter. The question is: {ask}',
      hint2Area: 'A rectangle’s area is length times width. The question is: {ask}',
      hint2Circle: 'The diameter is as long as two radii: radius + radius. The question is: {ask}',
      hint3First: 'How to start: {expr} = ? Then answer: {ask}',
      hint3Radius: 'How to start: radius + radius = {d}, find the radius. Then answer: {ask}',
      hint3Wrong: '“{label}” is not true. Check the others.',
      hint3Each: 'Work out each sentence. Pick only those whose result matches.',
      hint3Ask: 'One step at a time: {ask}',
      doneTitle: 'You solved every riddle in the cave!',
      doneLine: 'The treasure chest is glowing! You finished chapter 2, well done!',
      doneScore: '+{xp} XP · +{coins} coins',
      bonusLine: 'First clear bonus: +{xp} XP · +{coins} coins',
      stars: '{n}/3 stars',
      backToGate: 'Back to the gate',
      keysHelp: 'Digits and Enter answer, 1–4 pick, H for a hint.',
      reward: '+{xp} XP',
    },
  });

export type CaveStrings = ReturnType<typeof define>;
let cached: CaveStrings | undefined;

/** The cave translator (namespace registered on first use, reused by later runs). */
export function caveStrings(defineFn: typeof defineStrings): CaveStrings {
  cached ??= define(defineFn);
  return cached;
}
