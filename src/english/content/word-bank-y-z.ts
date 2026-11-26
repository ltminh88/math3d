// Word bank, block Y–Z (Phase 2A, self-written): simple Pre-A1 words with a
// short Vietnamese gloss and an emoji picture. Every word has a picture.
import type { EnglishWord } from '../english-types';
import { SVG_YOGURT, SVG_ZIGZAG } from './svg-pictures';

export const WORD_BANK_Y_Z: readonly EnglishWord[] = [
  { word: 'yellow', gloss: 'màu vàng', picture: '🟡' },
  { word: 'yo-yo', gloss: 'con yo-yo', picture: '🪀' },
  { word: 'yarn', gloss: 'cuộn len', picture: '🧶' },
  { word: 'yogurt', gloss: 'sữa chua', picture: SVG_YOGURT },
  { word: 'zebra', gloss: 'ngựa vằn', picture: '🦓' },
  { word: 'zero', gloss: 'số không', picture: '0️⃣' },
  { word: 'zigzag', gloss: 'đường zíc-zắc', picture: SVG_ZIGZAG },
  { word: 'zoom', gloss: 'phóng to', picture: '🔍' },
];
