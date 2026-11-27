import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import { LOOK_PATTERN_SENTENCES } from '../content/look/look-patterns';
import { LOOK_SKILL_WORDS, lookUnitForStage } from '../content/look/look-units';
import { ENGLISH_PATTERN_SENTENCES } from '../content/patterns';
import { SEED_UNIT_1 } from '../content/seed-unit-1';
import { ENGLISH_TOPIC_WORDS } from '../content/topics';
import { unitForStage } from '../content/units';
import type { EnglishItem, EnglishPattern, EnglishSkillId } from '../english-types';
import { SYNTHETIC_PACK } from '../fixtures/synthetic-pack';
import { CONFUSABLE_LETTER, generateItem, poolFor } from './item-generators';

const gen = (seed: number) => mulberry32(seed);

describe('generateItem', () => {
  it('letter-pick tier 1 has 3 choices with the answer, tier 2 has 4', () => {
    for (let seed = 0; seed < 20; seed++) {
      const t1 = generateItem('en-letters-a-d', 'letter-pick', 1, SEED_UNIT_1, gen(seed));
      expect(t1.kind).toBe('letter-pick');
      if (t1.kind !== 'letter-pick') continue;
      expect(t1.choices).toHaveLength(3);
      expect(t1.choices).toContain(t1.answer);
      expect(t1.answer).toBe(t1.prompt[0]);
      const t2 = generateItem('en-letters-a-d', 'letter-pick', 2, SEED_UNIT_1, gen(seed));
      if (t2.kind !== 'letter-pick') continue;
      expect(t2.choices).toHaveLength(4);
      expect(t2.choices).toContain(t2.answer);
    }
  });

  it('letter-pick tier 2 includes the confusable letter for b/d/p/q answers', () => {
    let checked = 0;
    for (let seed = 0; seed < 40; seed++) {
      const item = generateItem('en-letters-a-d', 'letter-pick', 2, SEED_UNIT_1, gen(seed));
      if (item.kind !== 'letter-pick') continue;
      const confusable = CONFUSABLE_LETTER[item.answer];
      if (!confusable) continue;
      expect(item.choices).toContain(confusable);
      checked += 1;
    }
    expect(checked).toBeGreaterThan(0);
  });

  it('alphabet-order picks the next letter as the answer', () => {
    for (let seed = 0; seed < 10; seed++) {
      const item = generateItem('en-alphabet-order', 'letter-pick', 1, SEED_UNIT_1, gen(seed));
      if (item.kind !== 'letter-pick') continue;
      expect(item.prompt).toMatch(/^[a-y]$/);
      expect(item.answer).toBe(String.fromCharCode(item.prompt.charCodeAt(0) + 1));
      expect(item.choices).toContain(item.answer);
    }
  });

  it('listen-pick-picture tier 1 has 3 choices, tier 3 has 4 and listenOnly', () => {
    const t1 = generateItem('en-words-a-d', 'listen-pick-picture', 1, SEED_UNIT_1, gen(3));
    expect(t1.kind).toBe('listen-pick-picture');
    if (t1.kind !== 'listen-pick-picture') return;
    expect(t1.choices).toHaveLength(3);
    expect(t1.choices.map((c) => c.word)).toContain(t1.word);
    expect(t1.listenOnly).toBeUndefined();
    const t3 = generateItem('en-words-a-d', 'listen-pick-picture', 3, SEED_UNIT_1, gen(3));
    if (t3.kind !== 'listen-pick-picture') return;
    expect(t3.choices).toHaveLength(4);
    expect(t3.listenOnly).toBe(true);
  });

  it('match-pairs has 3 unique pairs', () => {
    const item = generateItem('en-words-a-d', 'match-pairs', 1, SEED_UNIT_1, gen(5));
    expect(item.kind).toBe('match-pairs');
    if (item.kind !== 'match-pairs') return;
    expect(item.pairs).toHaveLength(3);
    expect(new Set(item.pairs.map((p) => p.word)).size).toBe(3);
  });

  it('order-words builds a bank sentence in order, for every pattern', () => {
    // 2A: all 7 patterns draw their sentences from the pattern bank.
    const banks = ENGLISH_PATTERN_SENTENCES;
    for (const pattern of Object.keys(banks) as EnglishPattern[]) {
      const skillId: EnglishSkillId = `en-pattern-${pattern}`;
      for (let seed = 0; seed < 10; seed++) {
        const item = generateItem(skillId, 'order-words', 1, SEED_UNIT_1, gen(seed));
        expect(item.kind).toBe('order-words');
        if (item.kind !== 'order-words') continue;
        expect(banks[pattern as keyof typeof banks]).toContainEqual(item.words);
      }
    }
  });

  it('fill-pattern blanks the last word with 2/3/4 options by tier, from sibling sentences', () => {
    const counts = { 1: 2, 2: 3, 3: 4 } as const;
    for (const tier of [1, 2, 3] as const) {
      const item = generateItem('en-pattern-this-is', 'fill-pattern', tier, SEED_UNIT_1, gen(4));
      expect(item.kind).toBe('fill-pattern');
      if (item.kind !== 'fill-pattern') continue;
      expect(item.blankIndex).toBe(item.sentence.length - 1);
      expect(item.options).toHaveLength(counts[tier]);
      expect(item.options).toContain(item.sentence[item.blankIndex]);
      const siblings = new Set(ENGLISH_PATTERN_SENTENCES['this-is'].map((s) => s[s.length - 1]));
      for (const option of item.options) expect(siblings.has(option)).toBe(true);
    }
  });

  it('what-is items ask What is this/that, and the answer is "It is …"', () => {
    const seen = new Set<string>();
    for (let seed = 0; seed < 20; seed++) {
      const ordered = generateItem('en-pattern-what-is', 'order-words', 1, SEED_UNIT_1, gen(seed));
      expect(ordered.kind).toBe('order-words');
      if (ordered.kind !== 'order-words') continue;
      expect(ordered.question).toMatch(/^What is (this|that)\?$/);
      expect(ordered.words.slice(0, 2)).toEqual(['It', 'is']);
      if (ordered.question) seen.add(ordered.question);
      const filled = generateItem('en-pattern-what-is', 'fill-pattern', 1, SEED_UNIT_1, gen(seed));
      expect(filled.kind).toBe('fill-pattern');
      if (filled.kind !== 'fill-pattern') continue;
      expect(filled.question).toMatch(/^What is (this|that)\?$/);
      expect(filled.sentence.slice(0, 2)).toEqual(['It', 'is']);
      if (filled.question) seen.add(filled.question);
    }
    expect(seen).toEqual(new Set(['What is this?', 'What is that?']));
  });

  it('is deterministic per seed', () => {
    const a = generateItem('en-words-a-d', 'listen-pick-picture', 1, SEED_UNIT_1, gen(11));
    const b = generateItem('en-words-a-d', 'listen-pick-picture', 1, SEED_UNIT_1, gen(11));
    expect(a).toEqual(b);
  });

  it('throws for a kind the skill cannot make', () => {
    expect(() => generateItem('en-letters-a-d', 'order-words', 1, SEED_UNIT_1, gen(1))).toThrow(
      'cannot make',
    );
  });

  it('topic skills only serve their own topic words', () => {
    for (let seed = 0; seed < 20; seed++) {
      const unit2 = unitForStage(2);
      const animal = generateItem('en-topic-animals', 'listen-pick-picture', 1, unit2, gen(seed));
      expect(animal.kind).toBe('listen-pick-picture');
      if (animal.kind !== 'listen-pick-picture') continue;
      for (const choice of animal.choices) {
        expect(ENGLISH_TOPIC_WORDS.animals).toContain(choice.word);
      }
      const food = generateItem('en-topic-food', 'match-pairs', 1, unit2, gen(seed));
      expect(food.kind).toBe('match-pairs');
      if (food.kind !== 'match-pairs') continue;
      for (const pair of food.pairs) {
        expect(ENGLISH_TOPIC_WORDS.food).toContain(pair.word);
      }
    }
  });

  it('block skills only serve words starting in their block', () => {
    for (let seed = 0; seed < 20; seed++) {
      const item = generateItem(
        'en-words-e-h',
        'listen-pick-picture',
        1,
        unitForStage(2),
        gen(seed),
      );
      if (item.kind !== 'listen-pick-picture') continue;
      expect(item.word[0]).toMatch(/[e-h]/);
    }
  });

  it('generates from the synthetic pack items shape too (validator guard)', () => {
    // The fixture proves the pack contract; the generator reads units, so this
    // just pins the fixture's items as valid EnglishItems.
    for (const item of SYNTHETIC_PACK.items as readonly EnglishItem[]) {
      expect(item.source).toBe('pack');
    }
  });

  it('Look word skills only serve their own unit words', () => {
    const unit2 = lookUnitForStage(2);
    const u1Names = new Set(LOOK_SKILL_WORDS['en-look-u1-words']?.map((w) => w.word));
    const u2Names = new Set(LOOK_SKILL_WORDS['en-look-u2-words']?.map((w) => w.word));
    for (let seed = 0; seed < 20; seed++) {
      const item = generateItem('en-look-u1-words', 'listen-pick-picture', 1, unit2, gen(seed));
      if (item.kind !== 'listen-pick-picture') continue;
      for (const choice of item.choices) expect(u1Names.has(choice.word)).toBe(true);
      const pairs = generateItem('en-look-u2-words', 'match-pairs', 1, unit2, gen(seed));
      if (pairs.kind !== 'match-pairs') continue;
      for (const pair of pairs.pairs) expect(u2Names.has(pair.word)).toBe(true);
    }
    expect(poolFor('en-look-u1-words', unit2).length).toBe(
      LOOK_SKILL_WORDS['en-look-u1-words']?.length,
    );
  });

  it('Look order-words builds a bank sentence of ≤ 4 tiles with its question', () => {
    for (let n = 1; n <= 12; n++) {
      const skillId = `en-look-u${n}-pattern` as EnglishSkillId;
      const bank = LOOK_PATTERN_SENTENCES[n] ?? [];
      for (let seed = 0; seed < 10; seed++) {
        const item = generateItem(skillId, 'order-words', 1, lookUnitForStage(8), gen(seed));
        expect(item.kind).toBe('order-words');
        if (item.kind !== 'order-words') continue;
        expect(item.words.length).toBeGreaterThanOrEqual(3);
        expect(item.words.length).toBeLessThanOrEqual(4);
        expect(bank.map((s) => s.words)).toContainEqual(item.words);
        const sentence = bank.find((s) => s.words.join(' ') === item.words.join(' '));
        expect(item.question).toBe(sentence?.question);
      }
    }
  });

  it('Look fill-pattern blanks the last word with 2 options at tier 1, 3 at tier 2–3', () => {
    for (const tier of [1, 2, 3] as const) {
      const item = generateItem(
        'en-look-u1-pattern',
        'fill-pattern',
        tier,
        lookUnitForStage(8),
        gen(4),
      );
      expect(item.kind).toBe('fill-pattern');
      if (item.kind !== 'fill-pattern') continue;
      expect(item.blankIndex).toBe(item.sentence.length - 1);
      expect(item.options).toHaveLength(tier === 1 ? 2 : 3);
      expect(item.options).toContain(item.sentence[item.blankIndex]);
      expect(item.question).toBe("What's this?");
    }
  });

  it('Look short-vowel letter-pick blanks the middle vowel (c_t) with vowel choices', () => {
    for (let seed = 0; seed < 20; seed++) {
      const item = generateItem(
        'en-look-phonics-short-vowels',
        'letter-pick',
        1,
        lookUnitForStage(5),
        gen(seed),
      );
      if (item.kind !== 'letter-pick') continue;
      expect(item.prompt).toMatch(/^[a-z]_[a-z]+$/);
      expect(['a', 'e', 'i', 'o', 'u']).toContain(item.answer);
      expect(item.choices).toHaveLength(3);
      for (const choice of item.choices) expect(['a', 'e', 'i', 'o', 'u']).toContain(choice);
      expect(item.choices).toContain(item.answer);
    }
  });

  it('Look phonics-initial letter-pick drills the stage letter range', () => {
    for (let seed = 0; seed < 20; seed++) {
      const item = generateItem(
        'en-look-phonics-initial',
        'letter-pick',
        1,
        lookUnitForStage(2),
        gen(seed),
      );
      if (item.kind !== 'letter-pick') continue;
      expect(item.prompt[0]).toMatch(/[a-h]/);
      expect(item.answer).toBe(item.prompt[0]);
    }
    expect(poolFor('en-look-phonics-initial', lookUnitForStage(3)).length).toBe(8);
    expect(poolFor('en-look-phonics-short-vowels', lookUnitForStage(6)).length).toBe(12);
  });
});
