// Texts of data items for 7-9 year olds (vi source, KNTT terms; en mirror). Generators
// only name keys. Table headers and row labels reach the table as refs ('i:' nouns,
// 'l:' label keys, 'c:' colours) so both languages render from the same scene.
import { defineStrings } from '../i18n/i18n';
import type { PromptRef } from '../reasoning/reasoning-types';

const vi = {
  num: '{n}',
  letter: '{l}',
  chance_certain: 'Chắc chắn',
  chance_possible: 'Có thể',
  chance_impossible: 'Không thể',
  colour_red: 'đỏ',
  colour_blue: 'xanh dương',
  colour_yellow: 'vàng',
  colour_green: 'xanh lá',
  item_dog: 'con chó',
  item_cat: 'con mèo',
  item_chicken: 'con gà',
  item_duck: 'con vịt',
  item_pig: 'con lợn',
  item_cow: 'con bò',
  item_apple: 'quả táo',
  item_banana: 'quả chuối',
  item_orange: 'quả cam',
  item_mango: 'quả xoài',
  item_ball: 'quả bóng',
  item_doll: 'con búp bê',
  item_car: 'ô tô đồ chơi',
  item_swim: 'bơi',
  item_chess: 'cờ vua',
  item_draw: 'vẽ',
  group_1: 'Tổ 1',
  group_2: 'Tổ 2',
  group_3: 'Tổ 3',
  week_last: 'Tuần trước',
  week_this: 'Tuần này',
  row_boys: 'Nam',
  row_girls: 'Nữ',
  row_all: 'Cả lớp',
  tallyStory: 'Ghi lại mỗi lần ném bóng: O là trúng, X là trượt.',
  askTally: 'Có bao nhiêu dấu O?',
  tableStoryFruits: 'Bảng ghi số quả hái được.',
  tableStoryFarm: 'Bảng ghi số con vật ở trang trại.',
  tableStoryBooks: 'Bảng ghi số sách mỗi tổ đã đọc.',
  tableStoryToys: 'Bảng ghi số đồ chơi.',
  tableStoryLikes: 'Bảng ghi số bạn thích mỗi môn.',
  askTableCell: 'Cột {header} có số nào?',
  askTableCellRow: '{row}, cột {header} có số nào?',
  askMost: 'Loại nào nhiều nhất?',
  askLeast: 'Loại nào ít nhất?',
  askRowSum: 'Cộng các số ở hàng "{row}" được bao nhiêu?',
  askColSum: 'Cộng cả cột {header} được bao nhiêu?',
  askTableSum: 'Cộng cả bảng được bao nhiêu?',
  askFill: 'Ô trống là số nào?',
  bagStory:
    'Trong túi có các viên bi. Chọn xem điều dưới đây chắc chắn, có thể hay không thể xảy ra.',
  bagEventOne: 'Lấy ra 1 viên bi {colour}.',
  bagEventTwo: 'Lấy ra 2 viên bi {colour}.',
  bagEventMixed: 'Lấy ra 1 viên bi {colour1} và 1 viên bi {colour2}.',
  diceStory: 'Xem con xúc xắc. Chọn xem điều dưới đây chắc chắn, có thể hay không thể xảy ra.',
  diceEventFace: 'Gieo xúc xắc một lần, ra mặt {face} chấm.',
  diceEventAll: 'Gieo xúc xắc một lần, ra một mặt có từ 1 đến 6 chấm.',
};

const en: Record<keyof typeof vi, string> = {
  num: '{n}',
  letter: '{l}',
  chance_certain: 'Certain',
  chance_possible: 'Possible',
  chance_impossible: 'Impossible',
  colour_red: 'red',
  colour_blue: 'blue',
  colour_yellow: 'yellow',
  colour_green: 'green',
  item_dog: 'dogs',
  item_cat: 'cats',
  item_chicken: 'chickens',
  item_duck: 'ducks',
  item_pig: 'pigs',
  item_cow: 'cows',
  item_apple: 'apples',
  item_banana: 'bananas',
  item_orange: 'oranges',
  item_mango: 'mangoes',
  item_ball: 'balls',
  item_doll: 'dolls',
  item_car: 'toy cars',
  item_swim: 'swimming',
  item_chess: 'chess',
  item_draw: 'drawing',
  group_1: 'Group 1',
  group_2: 'Group 2',
  group_3: 'Group 3',
  week_last: 'Last week',
  week_this: 'This week',
  row_boys: 'Boys',
  row_girls: 'Girls',
  row_all: 'Whole class',
  tallyStory: 'Each throw is marked: O is a hit, X is a miss.',
  askTally: 'How many O marks are there?',
  tableStoryFruits: 'The table shows how many fruits were picked.',
  tableStoryFarm: 'The table shows the animals on the farm.',
  tableStoryBooks: 'The table shows how many books each group read.',
  tableStoryToys: 'The table shows the toys.',
  tableStoryLikes: 'The table shows how many children like each activity.',
  askTableCell: 'What number is in the {header} column?',
  askTableCellRow: 'In {row}, what number is in the {header} column?',
  askMost: 'Which kind has the most?',
  askLeast: 'Which kind has the fewest?',
  askRowSum: 'Add up the numbers in the "{row}" row.',
  askColSum: 'How much is the whole {header} column?',
  askTableSum: 'How much is the whole table?',
  askFill: 'What number goes in the empty cell?',
  bagStory:
    'There are some marbles in the bag. Say whether the sentence below is certain, possible or impossible.',
  bagEventOne: 'Draw 1 {colour} marble.',
  bagEventTwo: 'Draw 2 {colour} marbles.',
  bagEventMixed: 'Draw 1 {colour1} marble and 1 {colour2} marble.',
  diceStory: 'Look at the die. Say whether the sentence below is certain, possible or impossible.',
  diceEventFace: 'Roll the die once and get {face} dots.',
  diceEventAll: 'Roll the die once and get a face with 1 to 6 dots.',
};

const ds = defineStrings('data', { vi, en });

export type Translator = (key: string, params?: Record<string, string | number>) => string;

/**
 * Renders with `tr`; ref params translate in place: 'i:<noun>' -> the translated
 * `item_<noun>`, 'c:<colour>' -> the translated `colour_<colour>`, 'l:<key>' -> the
 * translated label key itself. Every table header, row label and bag colour in a data
 * item is one of these refs — a missing table entry renders as the raw key, which the
 * render sweep (UNRENDERED) catches.
 */
export function renderPromptWith(tr: Translator, prompt: PromptRef): string {
  const params: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(prompt.params ?? {}))
    params[name] =
      typeof value === 'string' && value.startsWith('i:')
        ? tr(`item_${value.slice(2)}`)
        : typeof value === 'string' && value.startsWith('c:')
          ? tr(`colour_${value.slice(2)}`)
          : typeof value === 'string' && value.startsWith('l:')
            ? tr(value.slice(2))
            : value;
  return tr(prompt.key, params);
}

export const renderDataPrompt = (prompt: PromptRef): string =>
  renderPromptWith(ds as Translator, prompt);
