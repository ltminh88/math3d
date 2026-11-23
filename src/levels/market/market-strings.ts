import type { defineStrings } from '../../i18n/i18n';

/**
 * Market strings (vi source, en mirror) for 7-9 year olds: short sentences, VLM named through
 * `tc('guideName')`. Key hints (`keysHelp`) are hidden on coarse pointers by the stylesheet.
 */
const define = (defineFn: typeof defineStrings) =>
  defineFn('market', {
    vi: {
      title: 'Chợ Phiên Tí Hon',
      intro:
        'Chợ mở rồi! Mỗi câu trả lời đúng là một món hàng bạn mua được, đủ sáu món thì hết phiên chợ.',
      round: 'Món {n}/{total}',
      stageClock: 'Đồng hồ',
      stageCalendar: 'Lịch',
      stageMoney: 'Tiền',
      stageData: 'Số liệu',
      stageMix: 'Trộn các loại',
      guideClock: 'Nhìn đồng hồ trong hình, rồi trả lời nhé.',
      guideCalendar: 'Nhìn lịch trong hình, rồi tính nhé.',
      guideMoney: 'Đếm tiền trong hình, rồi trả lời nhé.',
      guideData: 'Nhìn bảng số liệu trong hình, rồi trả lời nhé.',
      guideMix: 'Mỗi món một dạng bài, làm chậm mà chắc nhé.',
      hint: 'Gợi ý',
      next: 'Món tiếp theo',
      nextLast: 'Hết phiên chợ',
      correct: 'Đúng rồi! Bạn mua được món này!',
      correctStep: 'Đúng rồi! Làm tiếp bước sau nhé.',
      wrong: 'Chưa đúng, mình thử lại nhé!',
      revealed: 'Mình cùng xem lời giải nhé. Cố lên, mình đi tiếp nào!',
      doneTitle: 'Bạn đã mua sắm hết phiên chợ!',
      doneLine: 'Giỏ hàng đầy rồi! Bạn đã đi hết chặng đầu chương 3, giỏi quá!',
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
      title: 'Tiny Market Fair',
      intro:
        'The fair is open! Every right answer buys one thing; six things and the fair is done.',
      round: 'Item {n}/{total}',
      stageClock: 'Clock',
      stageCalendar: 'Calendar',
      stageMoney: 'Money',
      stageData: 'Data',
      stageMix: 'Mixed',
      guideClock: 'Look at the clock in the picture, then answer.',
      guideCalendar: 'Look at the calendar in the picture, then work it out.',
      guideMoney: 'Count the money in the picture, then answer.',
      guideData: 'Look at the data table in the picture, then answer.',
      guideMix: 'A different kind each time — slow and steady.',
      hint: 'Hint',
      next: 'Next item',
      nextLast: 'Finish the fair',
      correct: 'Right! You bought this one!',
      correctStep: 'Right! Now the next step.',
      wrong: 'Not yet, let us try again!',
      revealed: 'Let us look at the answer together. Keep going!',
      doneTitle: 'You bought everything at the fair!',
      doneLine: 'Your basket is full! You finished the first stage of chapter 3, well done!',
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

export type MarketStrings = ReturnType<typeof define>;
let cached: MarketStrings | undefined;

/** The market translator (namespace registered on first use, reused by later runs). */
export function marketStrings(defineFn: typeof defineStrings): MarketStrings {
  cached ??= define(defineFn);
  return cached;
}
