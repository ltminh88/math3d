// Seed unit 1 (Phase 0): sample stage-1 content, written from scratch —
// seven A–D words with Vietnamese glosses and emoji pictures, and one item
// of each kind. 2A owns the full word bank; this unit only shows the shape
// the engine (1B) reads, and proves it passes `isEnglishPack`.
import type { EnglishUnit } from '../english-types';

export const SEED_UNIT_1: EnglishUnit = {
  id: 'seed-unit-1',
  stage: 1,
  title: 'A–D',
  skillIds: [
    'en-letters-a-d',
    'en-sounds-a-d',
    'en-words-a-d',
    'en-pattern-i-like',
    'en-pattern-this-is',
  ],
  words: [
    { word: 'apple', gloss: 'quả táo', picture: '🍎' },
    { word: 'ant', gloss: 'con kiến', picture: '🐜' },
    { word: 'ball', gloss: 'quả bóng', picture: '⚽' },
    { word: 'bird', gloss: 'con chim', picture: '🐦' },
    { word: 'cat', gloss: 'con mèo', picture: '🐱' },
    { word: 'dog', gloss: 'con chó', picture: '🐶' },
    { word: 'duck', gloss: 'con vịt', picture: '🦆' },
  ],
  items: [
    {
      kind: 'letter-pick',
      skillId: 'en-letters-a-d',
      source: 'own',
      prompt: 'apple',
      choices: ['a', 'b', 'c'],
      answer: 'a',
    },
    {
      kind: 'listen-pick-picture',
      skillId: 'en-words-a-d',
      source: 'own',
      word: 'cat',
      choices: [
        { word: 'cat', picture: '🐱' },
        { word: 'dog', picture: '🐶' },
        { word: 'bird', picture: '🐦' },
      ],
    },
    {
      kind: 'match-pairs',
      skillId: 'en-words-a-d',
      source: 'own',
      pairs: [
        { word: 'apple', picture: '🍎' },
        { word: 'ball', picture: '⚽' },
        { word: 'cat', picture: '🐱' },
      ],
    },
    {
      kind: 'order-words',
      skillId: 'en-pattern-i-like',
      source: 'own',
      words: ['I', 'like', 'cats'],
    },
    {
      kind: 'fill-pattern',
      skillId: 'en-pattern-this-is',
      source: 'own',
      sentence: ['This', 'is', 'a', 'cat'],
      blankIndex: 3,
      options: ['cat', 'dog'],
    },
  ],
};
