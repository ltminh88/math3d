import { describe, expect, it } from 'vitest';
import { SEED_UNIT_1 } from './content/seed-unit-1';
import { isEnglishPack } from './english-pack-contract';
import { SYNTHETIC_PACK } from './fixtures/synthetic-pack';

describe('isEnglishPack', () => {
  it('accepts the synthetic fixture pack', () => {
    expect(isEnglishPack(SYNTHETIC_PACK)).toBe(true);
  });

  it('accepts the seed unit-1 items as a pack', () => {
    expect(isEnglishPack({ version: 1, stage: 1, items: SEED_UNIT_1.items })).toBe(true);
  });

  it('rejects non-objects, wrong versions and missing items', () => {
    expect(isEnglishPack(null)).toBe(false);
    expect(isEnglishPack('pack')).toBe(false);
    expect(isEnglishPack({})).toBe(false);
    expect(isEnglishPack({ version: 2, items: [] })).toBe(false);
    expect(isEnglishPack({ version: 1 })).toBe(false);
    expect(isEnglishPack({ version: 1, items: 'nope' })).toBe(false);
  });

  it('rejects an item with an unknown skill id, kind or source', () => {
    const base = {
      kind: 'letter-pick',
      skillId: 'en-letters-a-d',
      source: 'own',
      prompt: 'apple',
      choices: ['a', 'b'],
      answer: 'a',
    };
    expect(isEnglishPack({ version: 1, items: [{ ...base, skillId: 'en-nope' }] })).toBe(false);
    expect(isEnglishPack({ version: 1, items: [{ ...base, kind: 'sing' }] })).toBe(false);
    expect(isEnglishPack({ version: 1, items: [{ ...base, source: 'book' }] })).toBe(false);
    expect(isEnglishPack({ version: 1, items: [{ ...base, answer: 'x' }] })).toBe(false);
  });

  it('rejects listen items whose choices miss the word, and fill items with a bad blank', () => {
    const listen = {
      kind: 'listen-pick-picture',
      skillId: 'en-words-a-d',
      source: 'own',
      word: 'cat',
      choices: [
        { word: 'dog', picture: '🐶' },
        { word: 'bird', picture: '🐦' },
      ],
    };
    expect(isEnglishPack({ version: 1, items: [listen] })).toBe(false);
    const fill = {
      kind: 'fill-pattern',
      skillId: 'en-pattern-this-is',
      source: 'own',
      sentence: ['This', 'is', 'a', 'cat'],
      blankIndex: 3,
      options: ['dog', 'bird'],
    };
    expect(isEnglishPack({ version: 1, items: [fill] })).toBe(false);
    expect(isEnglishPack({ version: 1, items: [{ ...fill, options: ['cat'] }] })).toBe(false);
    expect(
      isEnglishPack({ version: 1, items: [{ ...fill, options: ['cat', 'dog'], blankIndex: 4 }] }),
    ).toBe(false);
  });

  it('rejects a bad stage and non-string images', () => {
    expect(isEnglishPack({ version: 1, stage: 9, items: [] })).toBe(false);
    expect(isEnglishPack({ version: 1, stage: 0, items: [] })).toBe(false);
    expect(isEnglishPack({ version: 1, items: [], images: { a: 1 } })).toBe(false);
  });
});
