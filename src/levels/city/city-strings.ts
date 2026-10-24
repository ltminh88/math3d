import type { defineStrings } from '../../i18n/i18n';

/**
 * City strings (vi source, short sentences for 7-9 year olds). Registered through
 * `LevelContext.defineStrings` once and reused by later runs.
 */
const define = (defineFn: typeof defineStrings) =>
  defineFn('city', {
    vi: {
      title: 'Thành Phố Con Số',
      intro: 'Bác đưa thư làm lẫn hết gói hàng rồi! Mình cùng giúp bác giao đúng nhà nhé.',
      round: 'Lượt {n}/{total}',
      deliverPrompt: 'Gói hàng {t} × {m} giao đến nhà số mấy?',
      windowsPrompt: 'Tòa nhà có {m} tầng, mỗi tầng {t} cửa sổ. Có tất cả bao nhiêu cửa sổ?',
      reversePrompt: 'Nhà số {p} đang chờ gói hàng. Gói nào là của nhà này?',
      deliverGuide:
        'Bấm gói hàng rồi bấm vào nhà, hoặc kéo gói sang. Chọn số nhà ở bảng cũng được.',
      windowsGuide: 'Mất điện rồi! Bấm vào từng tầng để bật đèn, rồi đếm cửa sổ nhé.',
      reverseGuide: 'Tìm phép nhân có kết quả bằng số nhà nhé.',
      lightFloor: 'Bật đèn một tầng',
      litCount: '{floors} tầng sáng · {windows} cửa sổ',
      house: 'Nhà số {n}',
      houseChip: 'Nhà {n}',
      parcel: 'Gói hàng {label}',
      floor: 'Tầng {n}',
      floorLit: 'Tầng {n} sáng đèn. Đã có {windows} cửa sổ sáng.',
      bandRest: '{n} cửa sổ',
      bandFirst: '5 cửa sổ',
      hint: 'Gợi ý',
      next: 'Tiếp tục',
      correct: 'Đúng rồi! {equation}',
      wrong: 'Chưa đúng, mình thử lại nhé!',
      revealed: 'Mình cùng xem nhé: {equation}',
      hint1: 'Đọc lại phép nhân nhé. Bạn làm được mà!',
      hintSplit:
        'Tách {t} thành 5 và {rest}: 5 × {m} = {five}, {rest} × {m} = {part}. Cộng lại nhé!',
      hintSkip: 'Mỗi tầng thêm {t} cửa sổ: {steps}',
      hintCommute: '{t} × {m} = {m} × {t}. Bảng {m} bạn thuộc rồi!',
      hintNearSquare: '{t} × {m} = {s} × {s} + {s}. Mà {s} × {s} = {square} đó.',
      hintTen: '{t} × 10 = {ten}. Bớt đi {back} lần {t} là {minus} nhé.',
      doneTitle: 'Thành phố sáng đèn rồi!',
      doneLine: 'Gói hàng nào cũng đến đúng nhà. Cảm ơn bạn đã giúp bác đưa thư!',
      doneScore: '+{xp} XP · +{coins} xu',
      backToGate: 'Về cổng',
      keysHelp: 'Mũi tên chọn gói hàng hoặc tầng, Enter để đặt. Phím 1–4 chọn nhà, H xem gợi ý.',
      reward: '+{xp} XP',
    },
    en: {
      title: 'Number City',
      intro:
        'The postman mixed up all the parcels! Let’s help him deliver each one to the right house.',
      round: 'Round {n}/{total}',
      deliverPrompt: 'Which house number gets the parcel {t} × {m}?',
      windowsPrompt: 'The building has {m} floors with {t} windows each. How many windows in all?',
      reversePrompt: 'House {p} is waiting for a parcel. Which parcel is it?',
      deliverGuide:
        'Tap the parcel, then a house, or drag it over. You can also pick a house number.',
      windowsGuide: 'The power is out! Tap each floor to light it, then count the windows.',
      reverseGuide: 'Find the multiplication that equals the house number.',
      lightFloor: 'Light one floor',
      litCount: '{floors} floors lit · {windows} windows',
      house: 'House {n}',
      houseChip: 'No. {n}',
      parcel: 'Parcel {label}',
      floor: 'Floor {n}',
      floorLit: 'Floor {n} is lit. {windows} windows are lit now.',
      bandRest: '{n} windows',
      bandFirst: '5 windows',
      hint: 'Hint',
      next: 'Next',
      correct: 'Right! {equation}',
      wrong: 'Not yet, let’s try again!',
      revealed: 'Let’s look together: {equation}',
      hint1: 'Read the multiplication again. You can do it!',
      hintSplit:
        'Split {t} into 5 and {rest}: 5 × {m} = {five}, {rest} × {m} = {part}. Add them up!',
      hintSkip: 'Each floor adds {t} windows: {steps}',
      hintCommute: '{t} × {m} = {m} × {t}. You know the {m} table!',
      hintNearSquare: '{t} × {m} = {s} × {s} + {s}. And {s} × {s} = {square}.',
      hintTen: '{t} × 10 = {ten}. Take away {back} times {t}, that is {minus}.',
      doneTitle: 'The city lights are on!',
      doneLine: 'Every parcel reached the right house. Thank you for helping the postman!',
      doneScore: '+{xp} XP · +{coins} coins',
      backToGate: 'Back to the gate',
      keysHelp:
        'Arrow keys pick the parcel or a floor, Enter places it. Keys 1–4 pick a house, H for a hint.',
      reward: '+{xp} XP',
    },
  });

export type CityStrings = ReturnType<typeof define>;
let cached: CityStrings | undefined;

/** The city translator (namespace registered on first use, reused by later runs). */
export function cityStrings(defineFn: typeof defineStrings): CityStrings {
  cached ??= define(defineFn);
  return cached;
}
