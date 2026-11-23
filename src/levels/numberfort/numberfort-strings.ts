import type { defineStrings } from '../../i18n/i18n';

/**
 * Numberfort strings (vi source, en mirror) for 7-9 year olds: short sentences, VLM named
 * through `tc('guideName')`. Key hints (`keysHelp`) are hidden on coarse pointers by the
 * stylesheet.
 */
const define = (defineFn: typeof defineStrings) =>
  defineFn('numberfort', {
    vi: {
      title: 'Lâu Đài Số',
      intro:
        'Lâu đài mở rồi! Mỗi câu trả lời đúng là một viên đá bạn đặt lên tường thành, đủ sáu viên thì lâu đài hoàn thành.',
      round: 'Viên đá {n}/{total}',
      stageTenThousand: 'Số đến 10 000',
      stageRoundingRoman: 'Làm tròn và số La Mã',
      stageArithmetic10000: 'Tính với 10 000',
      stageHundredThousand: 'Số đến 100 000',
      stageMix: 'Trộn các dạng',
      guideTenThousand: 'Đọc, viết và so sánh các số lớn nhé.',
      guideRoundingRoman: 'Làm tròn số rồi đọc số La Mã nhé.',
      guideArithmetic10000: 'Cộng, trừ, nhân, chia với số có bốn chữ số nhé.',
      guideHundredThousand: 'Đọc, viết và so sánh các số đến 100 000 nhé.',
      guideMix: 'Mỗi viên đá một dạng bài, làm chậm mà chắc nhé.',
      hint: 'Gợi ý',
      next: 'Viên đá tiếp theo',
      nextLast: 'Hoàn thành lâu đài',
      correct: 'Đúng rồi! Bạn đặt được một viên đá!',
      correctStep: 'Đúng rồi! Làm tiếp bước sau nhé.',
      wrong: 'Chưa đúng, mình thử lại nhé!',
      revealed: 'Mình cùng xem lời giải nhé. Cố lên, mình đi tiếp nào!',
      doneTitle: 'Bạn đã xây xong lâu đài số!',
      doneLine: 'Tường thành đã đủ sáu viên đá! Bạn đã đi hết chặng hai chương 3, giỏi quá!',
      doneScore: '+{xp} XP · +{coins} xu',
      bonusLine: 'Thưởng lần đầu hoàn thành: +{xp} XP · +{coins} xu',
      stars: '{n}/3 sao',
      stageLine: 'Chặng {n}/{m} · {stars} sao',
      zoomIn: 'Phóng to',
      zoomOut: 'Thu nhỏ',
      backToGate: 'Về cổng',
      keysHelp: 'Phím số và Enter để trả lời, 1–4 để chọn, H để xem gợi ý.',
      reward: '+{xp} XP',
    },
    en: {
      title: 'Number Castle',
      intro:
        'The castle is open! Every right answer lays one stone in the wall; six stones and the castle is done.',
      round: 'Stone {n}/{total}',
      stageTenThousand: 'Numbers to 10 000',
      stageRoundingRoman: 'Rounding and Roman numerals',
      stageArithmetic10000: 'Calculating with 10 000',
      stageHundredThousand: 'Numbers to 100 000',
      stageMix: 'Mixed',
      guideTenThousand: 'Read, write and compare big numbers.',
      guideRoundingRoman: 'Round the numbers, then read the Roman numerals.',
      guideArithmetic10000: 'Add, subtract, multiply and divide with four-digit numbers.',
      guideHundredThousand: 'Read, write and compare numbers to 100 000.',
      guideMix: 'A different kind each time — slow and steady.',
      hint: 'Hint',
      next: 'Next stone',
      nextLast: 'Finish the castle',
      correct: 'Right! You laid one stone!',
      correctStep: 'Right! Now the next step.',
      wrong: 'Not yet, let us try again!',
      revealed: 'Let us look at the answer together. Keep going!',
      doneTitle: 'You built the number castle!',
      doneLine:
        'The wall has all six stones! You finished the second stage of chapter 3, well done!',
      doneScore: '+{xp} XP · +{coins} coins',
      bonusLine: 'First clear bonus: +{xp} XP · +{coins} coins',
      stars: '{n}/3 stars',
      stageLine: 'Stage {n}/{m} · {stars} stars',
      zoomIn: 'Zoom in',
      zoomOut: 'Zoom out',
      backToGate: 'Back to the gate',
      keysHelp: 'Digits and Enter answer, 1–4 pick, H for a hint.',
      reward: '+{xp} XP',
    },
  });

export type NumberfortStrings = ReturnType<typeof define>;
let cached: NumberfortStrings | undefined;

export function numberfortStrings(defineFn: typeof defineStrings): NumberfortStrings {
  cached ??= define(defineFn);
  return cached;
}
