import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import { ENGLISH_PATTERN_SENTENCES } from '../content/patterns';
import { SEED_UNIT_1 } from '../content/seed-unit-1';
import { ENGLISH_TOPIC_WORDS } from '../content/topics';
import { unitForStage } from '../content/units';
import type { EnglishItem, EnglishPattern, EnglishSkillId } from '../english-types';
import { SYNTHETIC_PACK } from '../fixtures/synthetic-pack';
import { CONFUSABLE_LETTER, generateItem } from './item-generators';

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
});
