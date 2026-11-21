// Texts of money items for 7-9 year olds (vi source, KNTT terms; en mirror). Generators
// only name keys. Amounts reach the table already grouped — see formatMoney below.
import { defineStrings } from '../i18n/i18n';
import type { PromptRef } from '../reasoning/reasoning-types';

/**
 * SGK thousands grouping: "10 000", "200 000". TEMPORARY single place for money text
 * (Brian, 2026-11-21): muse-88 is adding the shared formatter in src/numbers (PR #39).
 * TODO: chuyển sang src/numbers formatter khi #39 gộp — then delete this function and
 * call the shared one. No other money file formats an amount.
 */
export function formatMoney(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

const vi = {
  vnd: '{s} đồng',
  num: '{n}',
  letter: '{l}',
  item_notebook: 'quyển vở',
  item_pen: 'cái bút',
  item_cake: 'cái bánh',
  item_book: 'quyển sách',
  // Generic nouns (same wording as reasoning-strings): money-change-back reuses
  // pickNoun, so every generic noun must translate here — a missing one renders as
  // the raw key ("money.item_marble", review #40).
  item_marble: 'viên bi',
  item_candy: 'cái kẹo',
  item_flower: 'bông hoa',
  item_apple: 'quả táo',
  item_fish: 'con cá',
  recognizeStory: 'Nhìn tờ tiền.',
  askRecognize: 'Tờ tiền này là bao nhiêu đồng?',
  totalStory: 'Có các tờ tiền sau đây.',
  askTotal: 'Tổng cộng có bao nhiêu đồng?',
  exchangeStory: 'Muốn đổi 1 tờ {big} đồng thành các tờ {small} đồng.',
  askExchange: 'Đổi được mấy tờ {small} đồng?',
  changeStory:
    '{name} mua {count} {item}. Mỗi {item} giá {price} đồng. {name} trả 1 tờ {paid} đồng.',
  askChangeTotal: 'Tất cả hết bao nhiêu đồng?',
  askChange: 'Được trả lại bao nhiêu đồng?',
  pickStory: 'Có các tờ tiền sau đây.',
  askPick: 'Chọn các tờ tiền để đủ {target} đồng.',
  askPickFewest: 'Chọn các tờ tiền để đủ {target} đồng, dùng ít tờ nhất.',
  wpBuyStory: '{name} mua {count} {item}. Mỗi {item} giá {price} đồng.',
  askWpTotal: 'Hỏi {name} phải trả bao nhiêu đồng?',
  wpTwoStory:
    '{name} mua {count1} {item1} giá {price1} đồng và {count2} {item2} giá {price2} đồng.',
  wpLeftStory: '{name} có {have} đồng. {name} mua {count} {item}. Mỗi {item} giá {price} đồng.',
  askWpLeft: '{name} còn lại bao nhiêu đồng?',
};

const en = {
  vnd: '{s} dong',
  num: '{n}',
  letter: '{l}',
  item_notebook: 'notebooks',
  item_pen: 'pens',
  item_cake: 'cakes',
  item_book: 'books',
  item_marble: 'marbles',
  item_candy: 'sweets',
  item_flower: 'flowers',
  item_apple: 'apples',
  item_fish: 'fish',
  recognizeStory: 'Look at the banknote.',
  askRecognize: 'How many dong is this banknote?',
  totalStory: 'Here are some banknotes.',
  askTotal: 'How many dong is that altogether?',
  exchangeStory: 'Exchange 1 {big} dong note for {small} dong notes.',
  askExchange: 'How many {small} dong notes is that?',
  changeStory:
    '{name} buys {count} {item}. Each {item} costs {price} dong. {name} pays with a {paid} dong note.',
  askChangeTotal: 'How much is that altogether?',
  askChange: 'How much change is given back?',
  pickStory: 'Here are some banknotes.',
  askPick: 'Choose banknotes that add up to {target} dong.',
  askPickFewest: 'Choose banknotes that add up to {target} dong, using as few notes as possible.',
  wpBuyStory: '{name} buys {count} {item}. Each {item} costs {price} dong.',
  askWpTotal: 'How much does {name} have to pay?',
  wpTwoStory:
    '{name} buys {count1} {item1} at {price1} dong each and {count2} {item2} at {price2} dong each.',
  wpLeftStory:
    '{name} has {have} dong. {name} buys {count} {item}. Each {item} costs {price} dong.',
  askWpLeft: 'How much does {name} have left?',
};

const ms = defineStrings('money', { vi, en });

export type Translator = (key: string, params?: Record<string, string | number>) => string;

/** Renders with `tr`; `i:<noun>` params become the translated `item_<noun>` of the same table. */
export function renderPromptWith(tr: Translator, prompt: PromptRef): string {
  const params: Record<string, string | number> = {};
  for (const [name, value] of Object.entries(prompt.params ?? {}))
    params[name] =
      typeof value === 'string' && value.startsWith('i:') ? tr(`item_${value.slice(2)}`) : value;
  return tr(prompt.key, params);
}

export const renderMoneyPrompt = (prompt: PromptRef): string =>
  renderPromptWith(ms as Translator, prompt);
