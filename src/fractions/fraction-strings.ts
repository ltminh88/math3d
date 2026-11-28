// Texts of fraction items for 7-9 year olds (vi source, KNTT terms; en mirror). Generators
// only name keys. The word of 1/n is a key per denominator (`word_3` = "một phần ba"): a
// template cannot map a number to its Vietnamese word. The symbol form is one key, `frac`.
import { defineStrings } from '../i18n/i18n';
import type { PromptRef } from '../reasoning/reasoning-types';

const vi = {
  frac: '{n}/{d}',
  num: '{n}',
  word_2: 'một phần hai',
  word_3: 'một phần ba',
  word_4: 'một phần tư',
  word_5: 'một phần năm',
  word_6: 'một phần sáu',
  word_7: 'một phần bảy',
  word_8: 'một phần tám',
  word_9: 'một phần chín',
  letter: '{l}',
  noEqualParts: 'Không thể nói vì các phần không bằng nhau.',
  item_marble: 'viên bi',
  item_candy: 'cái kẹo',
  item_apple: 'quả táo',
  item_flower: 'bông hoa',
  item_orange: 'quả cam',
  item_banana: 'quả chuối',
  item_mango: 'quả xoài',
  item_cake: 'cái bánh',
  item_fish: 'con cá',
  item_chicken: 'con gà',
  readWordStory: 'Viết phân số sau đây.',
  readSymbolStory: 'Đọc phân số sau đây.',
  readBothStory: 'Viết phân số, rồi đọc phân số.',
  shadedStory: 'Quan sát hình. Một phần của hình đã được tô màu.',
  askShaded: 'Phần tô màu là mấy phần của hình?',
  pickStory: 'Chọn hình tô màu đúng phân số sau đây.',
  setCircleStory: 'Có {count} {item}. Đã khoanh 1/{n} số đó.',
  askMarked: 'Có mấy {item} được khoanh?',
  askLeft: 'Còn lại mấy {item} chưa khoanh?',
  setNumberStory: 'Chia {count} {item} thành {n} phần bằng nhau.',
  askOnePart: 'Mỗi phần có mấy {item}?',
  askKParts: '{k} phần có tất cả mấy {item}?',
  askRest: 'Còn lại bao nhiêu?',
  wpShare: 'Có {count} {item}. Hoa chia cho bạn 1/{n} số đó.',
  askWpGive: 'Bạn được mấy {item}?',
  wpEat: 'Mẹ mua {count} {item}. Lan ăn 1/{n} số đó.',
  askWpEat: 'Lan ăn mấy {item}?',
  wpGive: 'Bạn An có {count} {item}. An tặng bạn 1/{n} số đó.',
  wpPack: 'Có {count} {item}. Bạn xếp 1/{n} số đó vào hộp.',
  askWpPack: 'Bạn xếp mấy {item} vào hộp?',
  wpClass: 'Lớp có {count} bạn. 1/{n} số bạn đi đá bóng.',
  askWpClass: 'Có mấy bạn đi đá bóng?',
  wpRead: 'Quyển sách có {count} trang. Minh đã đọc 1/{n} số trang.',
  askWpRead: 'Minh đã đọc mấy trang?',
  askWpLeft: 'Còn lại mấy {item}?',
};

const en = {
  frac: '{n}/{d}',
  num: '{n}',
  word_2: 'one half',
  word_3: 'one third',
  word_4: 'one quarter',
  word_5: 'one fifth',
  word_6: 'one sixth',
  word_7: 'one seventh',
  word_8: 'one eighth',
  word_9: 'one ninth',
  letter: '{l}',
  noEqualParts: 'Cannot say — the parts are not equal.',
  item_marble: 'marbles',
  item_candy: 'sweets',
  item_apple: 'apples',
  item_flower: 'flowers',
  item_orange: 'oranges',
  item_banana: 'bananas',
  item_mango: 'mangoes',
  item_cake: 'cakes',
  item_fish: 'fish',
  item_chicken: 'chickens',
  readWordStory: 'Write this fraction.',
  readSymbolStory: 'Read this fraction.',
  readBothStory: 'Write the fraction, then read a fraction.',
  shadedStory: 'Look at the picture. One part of the shape is coloured.',
  askShaded: 'What fraction of the shape is coloured?',
  pickStory: 'Choose the picture coloured to show this fraction.',
  setCircleStory: 'There are {count} {item}. 1/{n} of them are circled.',
  askMarked: 'How many {item} are circled?',
  askLeft: 'How many {item} are not circled?',
  setNumberStory: 'Share {count} {item} into {n} equal parts.',
  askOnePart: 'How many {item} are in one part?',
  askKParts: 'How many {item} are in {k} parts altogether?',
  askRest: 'How many are left?',
  wpShare: 'There are {count} {item}. Hoa gives her little brother 1/{n} of them.',
  askWpGive: 'How many {item} does he get?',
  wpEat: 'Mum buys {count} {item}. Lan eats 1/{n} of them.',
  askWpEat: 'How many {item} does Lan eat?',
  wpGive: 'An has {count} {item}. An gives 1/{n} of them to a friend.',
  wpPack: 'There are {count} {item}. You pack 1/{n} of them into a box.',
  askWpPack: 'How many {item} do you pack into the box?',
  wpClass: 'There are {count} children in the class. 1/{n} of them play football.',
  askWpClass: 'How many children play football?',
  wpRead: 'The book has {count} pages. Minh has read 1/{n} of them.',
  askWpRead: 'How many pages has Minh read?',
  askWpLeft: 'How many {item} are left?',
};

const fs = defineStrings('fraction', { vi, en });

export type Translator = (key: string, params?: Record<string, string | number>) => string;

/** Renders with `tr`; `i:<noun>` params become the translated `item_<noun>` of the same table. */
export function renderPromptWith(tr: Translator, prompt: PromptRef): string {
  const params: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(prompt.params ?? {}))
    params[name] =
      typeof value === 'string' && value.startsWith('i:') ? tr(`item_${value.slice(2)}`) : value;
  return tr(prompt.key, params);
}

export const renderFractionPrompt = (prompt: PromptRef): string =>
  renderPromptWith(fs as Translator, prompt);
