// Synthetic fixture pack (Phase 0): made-up words with SVG data-URI pictures,
// for validator and engine tests only. These are NOT real English words —
// the fixture only proves shape, never content.
import type { EnglishPack } from '../english-types';

const svgCircle = (fill: string): string =>
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64'%3E%3Ccircle cx='32' cy='32' r='28' fill='${fill}'/%3E%3C/svg%3E`;

export const SYNTHETIC_IMAGES = Object.freeze({
  zib: svgCircle('%23f59e0b'),
  wug: svgCircle('%233b82f6'),
  tib: svgCircle('%2322c55e'),
});

export const SYNTHETIC_PACK: EnglishPack = {
  version: 1,
  stage: 1,
  items: [
    {
      kind: 'listen-pick-picture',
      skillId: 'en-words-a-d',
      source: 'pack',
      word: 'zib',
      choices: [
        { word: 'zib', picture: SYNTHETIC_IMAGES.zib },
        { word: 'wug', picture: SYNTHETIC_IMAGES.wug },
        { word: 'tib', picture: SYNTHETIC_IMAGES.tib },
      ],
    },
    {
      kind: 'letter-pick',
      skillId: 'en-letters-a-d',
      source: 'pack',
      prompt: 'zib',
      choices: ['z', 'w', 't'],
      answer: 'z',
      // R146: the widget shows this picture instead of the word.
      picture: SYNTHETIC_IMAGES.zib,
    },
    {
      kind: 'match-pairs',
      skillId: 'en-words-a-d',
      source: 'pack',
      pairs: [
        { word: 'zib', picture: SYNTHETIC_IMAGES.zib },
        { word: 'wug', picture: SYNTHETIC_IMAGES.wug },
      ],
    },
  ],
  images: SYNTHETIC_IMAGES,
};
