// Word bank, block U–X (Phase 2A, self-written): simple Pre-A1 words with a
// short Vietnamese gloss and an emoji picture. Every word has a picture.
import type { EnglishWord } from '../english-types';
import { SVG_XYLOPHONE } from './svg-pictures';

export const WORD_BANK_U_X: readonly EnglishWord[] = [
  { word: 'umbrella', gloss: 'ô dù', picture: '☂️' },
  { word: 'uncle', gloss: 'chú', picture: '🧔' },
  { word: 'unicorn', gloss: 'kỳ lân', picture: '🦄' },
  { word: 'up', gloss: 'lên', picture: '⬆️' },
  { word: 'van', gloss: 'xe tải nhỏ', picture: '🚐' },
  { word: 'vase', gloss: 'lọ hoa', picture: '🏺' },
  { word: 'violin', gloss: 'đàn vi-ô-lông', picture: '🎻' },
  { word: 'volcano', gloss: 'núi lửa', picture: '🌋' },
  { word: 'water', gloss: 'nước', picture: '💧' },
  { word: 'whale', gloss: 'cá voi', picture: '🐋' },
  { word: 'white', gloss: 'màu trắng', picture: '⚪' },
  { word: 'wind', gloss: 'gió', picture: '🌬️' },
  { word: 'window', gloss: 'cửa sổ', picture: '🪟' },
  { word: 'wolf', gloss: 'chó sói', picture: '🐺' },
  { word: 'write', gloss: 'viết', picture: '✍️' },
  { word: 'six', gloss: 'số sáu', picture: '6️⃣' },
  { word: 'x-ray', gloss: 'phim X-quang', picture: '🩻' },
  { word: 'xylophone', gloss: 'đàn mộc cầm', picture: SVG_XYLOPHONE },
];
