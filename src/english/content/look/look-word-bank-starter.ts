// Starter word bank (two-modes Phase 4, self-written): numbers 1–10, colours
// (+ big/small, taught with the colours), greetings. American spelling.
// Every word has a picture, so no listen item falls back to the placeholder.
import type { EnglishWord } from '../../english-types';

/** Numbers 1–10, with digit pictures. */
export const LOOK_STARTER_NUMBERS: readonly EnglishWord[] = [
  { word: 'one', gloss: 'một', picture: '1️⃣' },
  { word: 'two', gloss: 'hai', picture: '2️⃣' },
  { word: 'three', gloss: 'ba', picture: '3️⃣' },
  { word: 'four', gloss: 'bốn', picture: '4️⃣' },
  { word: 'five', gloss: 'năm', picture: '5️⃣' },
  { word: 'six', gloss: 'sáu', picture: '6️⃣' },
  { word: 'seven', gloss: 'bảy', picture: '7️⃣' },
  { word: 'eight', gloss: 'tám', picture: '8️⃣' },
  { word: 'nine', gloss: 'chín', picture: '9️⃣' },
  { word: 'ten', gloss: 'mười', picture: '🔟' },
];

/**
 * The 9 colours, plus big/small — the book teaches size with the colours,
 * so the starter-colors skill serves all eleven.
 */
export const LOOK_STARTER_COLORS: readonly EnglishWord[] = [
  { word: 'red', gloss: 'màu đỏ', picture: '🔴' },
  { word: 'blue', gloss: 'màu xanh dương', picture: '🔵' },
  { word: 'green', gloss: 'màu xanh lá', picture: '🟢' },
  { word: 'yellow', gloss: 'màu vàng', picture: '🟡' },
  { word: 'orange', gloss: 'màu cam', picture: '🟠' },
  { word: 'purple', gloss: 'màu tím', picture: '🟣' },
  { word: 'pink', gloss: 'màu hồng', picture: '🩷' },
  { word: 'black', gloss: 'màu đen', picture: '⚫' },
  { word: 'white', gloss: 'màu trắng', picture: '⚪' },
  { word: 'big', gloss: 'to, lớn', picture: '🐘' },
  { word: 'small', gloss: 'nhỏ', picture: '🐜' },
];

/** Greetings, each with its own picture. */
export const LOOK_STARTER_GREETINGS: readonly EnglishWord[] = [
  { word: 'hello', gloss: 'xin chào', picture: '👋' },
  { word: 'hi', gloss: 'chào', picture: '🙋' },
  { word: 'good morning', gloss: 'chào buổi sáng', picture: '🌅' },
  { word: 'good night', gloss: 'chúc ngủ ngon', picture: '🌙' },
  { word: 'goodbye', gloss: 'tạm biệt', picture: '✋' },
  { word: 'thank you', gloss: 'cảm ơn', picture: '🙏' },
];

/** All Starter words, in skill order (numbers, colours, greetings). */
export const LOOK_STARTER_WORDS: readonly EnglishWord[] = [
  ...LOOK_STARTER_NUMBERS,
  ...LOOK_STARTER_COLORS,
  ...LOOK_STARTER_GREETINGS,
];
