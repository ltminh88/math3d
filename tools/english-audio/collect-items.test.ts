// RED-first: the clip collector must enumerate every text the English run can
// speak (words, letter names, pattern sentences, what-is Q+A combos), in a
// deterministic order, with no duplicates. The seed list is the fixed step-1
// subset (R74 step 1): 12 words + 5 letters + 4 sentences.
import { describe, expect, it } from 'vitest';
import { ENGLISH_WORD_BANK } from '../../src/english/content/word-bank';
import { collectClipTexts, SEED_TEXTS } from './collect-items';
import { SEED_TEXTS as MJS_SEED_TEXTS } from './generate-clips.mjs';

describe('collectClipTexts', () => {
  it('covers every bank word once', () => {
    const texts = collectClipTexts();
    const words = texts.filter((t) => t.kind === 'word');
    expect(words).toHaveLength(ENGLISH_WORD_BANK.length);
    expect(words.map((w) => w.text)).toEqual(ENGLISH_WORD_BANK.map((w) => w.word));
  });

  it('covers all 26 letters once', () => {
    const texts = collectClipTexts();
    const letters = texts.filter((t) => t.kind === 'letter');
    expect(letters.map((l) => l.text)).toEqual('abcdefghijklmnopqrstuvwxyz'.split(''));
  });

  it('covers all 42 pattern sentences plus 6 what-is Q+A combos', () => {
    const texts = collectClipTexts();
    const sentences = texts.filter((t) => t.kind === 'sentence');
    expect(sentences).toHaveLength(42 + 6);
    expect(sentences.map((s) => s.text)).toContain('This is a cat');
    expect(sentences.map((s) => s.text)).toContain('What is this? It is a cat');
    expect(sentences.map((s) => s.text)).toContain('What is that? It is a dog');
    expect(sentences.map((s) => s.text)).toContain('My favourite colour is red');
  });

  it('has no duplicate texts', () => {
    const texts = collectClipTexts().map((t) => t.text);
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('is deterministic', () => {
    expect(collectClipTexts()).toEqual(collectClipTexts());
  });
});

describe('SEED_TEXTS', () => {
  it('is 12 words + 5 letters + 4 sentences, all present in the full list', () => {
    expect(SEED_TEXTS).toHaveLength(12 + 5 + 4);
    const all = new Set(collectClipTexts().map((t) => t.text));
    for (const seed of SEED_TEXTS) expect(all.has(seed)).toBe(true);
  });

  it('matches the generator script list (single source: seed.json)', () => {
    expect(SEED_TEXTS).toEqual(MJS_SEED_TEXTS);
  });
});
