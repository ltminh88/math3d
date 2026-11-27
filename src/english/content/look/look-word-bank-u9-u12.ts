// Look word banks, units 9–12 (two-modes Phase 4, self-written): core words +
// reading-extra words per unit, with Vietnamese glosses and pictures.
// American spelling (pants, candy, soccer). Unit 12 vocab is verb phrases.
import type { EnglishWord } from '../../english-types';

/** Unit 9 — clothes (8 core + 4 reading). */
export const LOOK_U9_WORDS: readonly EnglishWord[] = [
  { word: 'shirt', gloss: 'áo sơ mi', picture: '👕' },
  { word: 'dress', gloss: 'váy', picture: '👗' },
  { word: 'pants', gloss: 'quần', picture: '👖' },
  { word: 'shoes', gloss: 'giày', picture: '👟' },
  { word: 'hat', gloss: 'mũ', picture: '🎩' },
  { word: 'coat', gloss: 'áo khoác', picture: '🧥' },
  { word: 'socks', gloss: 'tất', picture: '🧦' },
  { word: 'cap', gloss: 'mũ lưỡi trai', picture: '🧢' },
  { word: 'scarf', gloss: 'khăn quàng', picture: '🧣' },
  { word: 'gloves', gloss: 'găng tay', picture: '🧤' },
  { word: 'boots', gloss: 'ủng', picture: '👢' },
  { word: 'sunglasses', gloss: 'kính râm', picture: '😎' },
];

/** Unit 10 — food and drink (9 core + 4 reading). */
export const LOOK_U10_WORDS: readonly EnglishWord[] = [
  { word: 'apple', gloss: 'quả táo', picture: '🍎' },
  { word: 'banana', gloss: 'quả chuối', picture: '🍌' },
  { word: 'bread', gloss: 'bánh mì', picture: '🍞' },
  { word: 'milk', gloss: 'sữa', picture: '🥛' },
  { word: 'juice', gloss: 'nước trái cây', picture: '🧃' },
  { word: 'egg', gloss: 'trứng', picture: '🍳' },
  { word: 'fish', gloss: 'cá', picture: '🐟' },
  { word: 'rice', gloss: 'cơm', picture: '🍚' },
  { word: 'candy', gloss: 'kẹo', picture: '🍬' },
  { word: 'cake', gloss: 'bánh ngọt', picture: '🍰' },
  { word: 'cheese', gloss: 'phô mai', picture: '🧀' },
  { word: 'pizza', gloss: 'bánh pizza', picture: '🍕' },
  { word: 'water', gloss: 'nước', picture: '💧' },
];

/** Unit 11 — beach (9 core + 4 reading). */
export const LOOK_U11_WORDS: readonly EnglishWord[] = [
  { word: 'beach', gloss: 'bãi biển', picture: '🏖️' },
  { word: 'sea', gloss: 'biển', picture: '🌊' },
  { word: 'sun', gloss: 'mặt trời', picture: '☀️' },
  { word: 'crab', gloss: 'con cua', picture: '🦀' },
  { word: 'shell', gloss: 'vỏ sò', picture: '🐚' },
  { word: 'boat', gloss: 'thuyền', picture: '⛵' },
  { word: 'starfish', gloss: 'sao biển', picture: '⭐' },
  { word: 'shark', gloss: 'cá mập', picture: '🦈' },
  { word: 'sand', gloss: 'cát', picture: '⏳' },
  { word: 'whale', gloss: 'cá voi', picture: '🐳' },
  { word: 'turtle', gloss: 'rùa biển', picture: '🐢' },
  { word: 'octopus', gloss: 'bạch tuộc', picture: '🐙' },
  { word: 'ice cream', gloss: 'kem', picture: '🍦' },
];

/** Unit 12 — free-time verb phrases (8 core + 3 reading). */
export const LOOK_U12_WORDS: readonly EnglishWord[] = [
  { word: 'play soccer', gloss: 'chơi bóng đá', picture: '⚽' },
  { word: 'ride a bike', gloss: 'đạp xe', picture: '🚲' },
  { word: 'fly a kite', gloss: 'thả diều', picture: '🪁' },
  { word: 'read a book', gloss: 'đọc sách', picture: '📖' },
  { word: 'go fishing', gloss: 'câu cá', picture: '🎣' },
  { word: 'play basketball', gloss: 'chơi bóng rổ', picture: '🏀' },
  { word: 'sing a song', gloss: 'hát', picture: '🎤' },
  { word: 'watch TV', gloss: 'xem ti-vi', picture: '📺' },
  { word: 'dance', gloss: 'nhảy múa', picture: '💃' },
  { word: 'draw a picture', gloss: 'vẽ tranh', picture: '🎨' },
  { word: 'play games', gloss: 'chơi trò chơi', picture: '🎮' },
];
