// Look phonics (two-modes Phase 4, self-written): initial-sound key words
// (one per letter, A–Z compressed into units 1–6) and short-vowel CVC words
// (units 7–12). The letter-pick generator drills the first letter for the
// initial skill and the missing middle vowel for the short-vowel skill.
import type { EnglishWord } from '../../english-types';

/** One initial-sound key word per letter (a–z). */
export const LOOK_PHONICS_INITIAL: readonly EnglishWord[] = [
  { word: 'apple', gloss: 'quả táo', picture: '🍎' },
  { word: 'ball', gloss: 'quả bóng', picture: '⚽' },
  { word: 'cat', gloss: 'con mèo', picture: '🐱' },
  { word: 'dog', gloss: 'con chó', picture: '🐶' },
  { word: 'egg', gloss: 'trứng', picture: '🥚' },
  { word: 'fish', gloss: 'con cá', picture: '🐟' },
  { word: 'goat', gloss: 'con dê', picture: '🐐' },
  { word: 'hat', gloss: 'mũ', picture: '🎩' },
  { word: 'ice', gloss: 'nước đá', picture: '🧊' },
  { word: 'juice', gloss: 'nước trái cây', picture: '🧃' },
  { word: 'kite', gloss: 'con diều', picture: '🪁' },
  { word: 'lion', gloss: 'con sư tử', picture: '🦁' },
  { word: 'monkey', gloss: 'con khỉ', picture: '🐒' },
  { word: 'nose', gloss: 'mũi', picture: '👃' },
  { word: 'octopus', gloss: 'bạch tuộc', picture: '🐙' },
  { word: 'pig', gloss: 'con lợn', picture: '🐷' },
  { word: 'queen', gloss: 'nữ hoàng', picture: '👑' },
  { word: 'rabbit', gloss: 'con thỏ', picture: '🐰' },
  { word: 'sun', gloss: 'mặt trời', picture: '☀️' },
  { word: 'tiger', gloss: 'con hổ', picture: '🐯' },
  { word: 'umbrella', gloss: 'cái ô', picture: '☂️' },
  { word: 'van', gloss: 'xe tải nhỏ', picture: '🚐' },
  { word: 'whale', gloss: 'cá voi', picture: '🐳' },
  { word: 'x-ray', gloss: 'phim X-quang', picture: '🩻' },
  { word: 'yo-yo', gloss: 'con quay yo-yo', picture: '🪀' },
  { word: 'zebra', gloss: 'ngựa vằn', picture: '🦓' },
];

/** Short-vowel CVC words, six per vowel; the vowel is always the 2nd letter. */
export const LOOK_PHONICS_SHORT_VOWELS: readonly EnglishWord[] = [
  { word: 'cat', gloss: 'con mèo', picture: '🐱' },
  { word: 'hat', gloss: 'mũ', picture: '🎩' },
  { word: 'bag', gloss: 'cái túi', picture: '🎒' },
  { word: 'map', gloss: 'bản đồ', picture: '🗺️' },
  { word: 'bat', gloss: 'con dơi', picture: '🦇' },
  { word: 'cap', gloss: 'mũ lưỡi trai', picture: '🧢' },
  { word: 'bed', gloss: 'cái giường', picture: '🛏️' },
  { word: 'pen', gloss: 'bút mực', picture: '🖊️' },
  { word: 'red', gloss: 'màu đỏ', picture: '🔴' },
  { word: 'hen', gloss: 'gà mái', picture: '🐔' },
  { word: 'web', gloss: 'mạng nhện', picture: '🕸️' },
  { word: 'leg', gloss: 'chân', picture: '🦵' },
  { word: 'pig', gloss: 'con lợn', picture: '🐷' },
  { word: 'fish', gloss: 'con cá', picture: '🐟' },
  { word: 'six', gloss: 'sáu', picture: '6️⃣' },
  { word: 'kid', gloss: 'đứa trẻ', picture: '🧒' },
  { word: 'pin', gloss: 'cái ghim', picture: '📌' },
  { word: 'lip', gloss: 'môi', picture: '👄' },
  { word: 'dog', gloss: 'con chó', picture: '🐶' },
  { word: 'box', gloss: 'cái hộp', picture: '📦' },
  { word: 'mop', gloss: 'cây lau nhà', picture: '🧹' },
  { word: 'fox', gloss: 'con cáo', picture: '🦊' },
  { word: 'log', gloss: 'khúc gỗ', picture: '🪵' },
  { word: 'pot', gloss: 'cái nồi', picture: '🍲' },
  { word: 'sun', gloss: 'mặt trời', picture: '☀️' },
  { word: 'bus', gloss: 'xe buýt', picture: '🚌' },
  { word: 'cup', gloss: 'cái cốc', picture: '🥤' },
  { word: 'nut', gloss: 'quả hạch', picture: '🥜' },
  { word: 'bug', gloss: 'con bọ', picture: '🐛' },
  { word: 'run', gloss: 'chạy', picture: '🏃' },
];

/**
 * Stage → first-letter range the phonics-initial skill drills: U1–2 a–h,
 * U3–4 i–p, U5–6 q–z, review a–z. Stages without the skill map to nothing.
 */
export const LOOK_INITIAL_LETTERS: Readonly<Record<number, readonly [string, string]>> = {
  2: ['a', 'h'],
  3: ['i', 'p'],
  4: ['q', 'z'],
  8: ['a', 'z'],
};

/**
 * Stage → short vowels the phonics-short-vowels skill drills: U7–8 a/e,
 * U9–10 i/o, U11–12 and review all five.
 */
export const LOOK_SHORT_VOWELS: Readonly<Record<number, readonly string[]>> = {
  5: ['a', 'e'],
  6: ['i', 'o'],
  7: ['a', 'e', 'i', 'o', 'u'],
  8: ['a', 'e', 'i', 'o', 'u'],
};

/** Initial key words for a stage (empty when the stage does not teach it). */
export function phonicsInitialPool(stage: number): EnglishWord[] {
  const range = LOOK_INITIAL_LETTERS[stage];
  if (!range) return [];
  const [start, end] = range;
  return LOOK_PHONICS_INITIAL.filter((w) => {
    const first = w.word[0] as string;
    return first >= start && first <= end;
  });
}

/** Short-vowel CVC words for a stage (empty when the stage does not teach it). */
export function phonicsShortVowelPool(stage: number): EnglishWord[] {
  const vowels = LOOK_SHORT_VOWELS[stage];
  if (!vowels) return [];
  const wanted = new Set(vowels);
  return LOOK_PHONICS_SHORT_VOWELS.filter((w) => wanted.has(w.word[1] as string));
}
