import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import { tei } from '../../ui/english/english-strings';
import { SEED_UNIT_1 } from '../content/seed-unit-1';
import type { EnglishItem } from '../english-types';
import { englishWrongFeedback } from './english-wrong-feedback';
import { generateItem } from './item-generators';

describe('englishWrongFeedback', () => {
  it('returns one key per kind', () => {
    const keys = SEED_UNIT_1.items.map((item) => englishWrongFeedback(item));
    expect(keys).toEqual(['wrongLetter', 'wrongListen', 'wrongPairs', 'wrongOrder', 'wrongFill']);
  });

  it('never contains the answer in either language', () => {
    for (let seed = 0; seed < 20; seed++) {
      for (const skillId of SEED_UNIT_1.skillIds) {
        for (const kind of [
          'letter-pick',
          'listen-pick-picture',
          'match-pairs',
          'order-words',
          'fill-pattern',
        ] as const) {
          let item: EnglishItem | undefined;
          try {
            item = generateItem(skillId, kind, 1, SEED_UNIT_1, mulberry32(seed));
          } catch {
            continue;
          }
          if (!item) continue;
          const text = tei(englishWrongFeedback(item));
          const answers =
            item.kind === 'letter-pick'
              ? [item.answer]
              : item.kind === 'listen-pick-picture'
                ? [item.word]
                : item.kind === 'fill-pattern'
                  ? [item.sentence[item.blankIndex] as string]
                  : item.kind === 'order-words'
                    ? [...item.words]
                    : item.pairs.map((p) => p.word);
          for (const answer of answers) {
            if (answer.length === 1) {
              // A single letter hides inside Vietnamese words ("khác" holds an
              // "a"), so check it never stands alone as a word instead.
              const stripped = text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
              expect(stripped).not.toMatch(new RegExp(`\\b${answer}\\b`));
            } else {
              expect(text).not.toContain(answer);
            }
          }
        }
      }
    }
  });
});
