// Money generators (word skills): exact answers from the story params, keypad steps,
// numbers <= 100 000, deterministic.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { MONEY_SKILLS, moneyItemForSkill } from './money-item-for-skill';
import { DENOMINATIONS } from './money-ranges';
import type { MoneyItem } from './money-scene-types';
import { lastValue, parseMoney, smallestAbove, stepValue } from './money-test-oracles';
import { sweepItem } from './money-test-sweep';

const priceOf = (i: MoneyItem, key = 'price'): number => parseMoney(String(i.story.params?.[key]));
const countOf = (i: MoneyItem, key = 'count'): number => Number(i.story.params?.[key]);

/** Independent answers per skill, from the story params. */
const ORACLE: Record<string, (i: MoneyItem, tier: SkillTier) => void> = {
  'money-change-back': (i, tier) => {
    expect(i.scene).toBeUndefined();
    const count = countOf(i);
    const price = priceOf(i);
    const paid = parseMoney(String(i.story.params?.paid));
    expect(DENOMINATIONS).toContain(price);
    expect(DENOMINATIONS).toContain(paid);
    const total = count * price;
    expect(paid).toBe(smallestAbove(total));
    if (tier === 1) {
      expect(count).toBe(1);
      expect(i.steps).toHaveLength(1);
      expect(lastValue(i)).toBe(paid - total);
      expect(i.work).toEqual([paid - total]);
    } else {
      expect(i.steps).toHaveLength(2);
      expect(stepValue(i.steps[0])).toBe(total);
      expect(lastValue(i)).toBe(paid - total);
      expect(i.work).toEqual([total, paid - total]);
    }
  },
  'money-wp': (i, tier) => {
    expect(i.scene).toBeUndefined();
    if (tier === 1) {
      expect(i.story.key).toBe('wpBuyStory');
      expect(i.steps).toHaveLength(1);
      expect(lastValue(i)).toBe(countOf(i) * priceOf(i));
    } else if (tier === 2) {
      expect(i.story.key).toBe('wpTwoStory');
      expect(i.steps).toHaveLength(1);
      const total =
        countOf(i, 'count1') * priceOf(i, 'price1') + countOf(i, 'count2') * priceOf(i, 'price2');
      expect(lastValue(i)).toBe(total);
    } else {
      expect(i.story.key).toBe('wpLeftStory');
      expect(i.steps).toHaveLength(2);
      const have = parseMoney(String(i.story.params?.have));
      const total = countOf(i) * priceOf(i);
      expect(DENOMINATIONS).toContain(have);
      expect(have).toBeGreaterThan(total);
      expect(stepValue(i.steps[0])).toBe(total);
      expect(lastValue(i)).toBe(have - total);
      expect(i.work).toEqual([total, have - total]);
    }
  },
};

const WORD_SKILLS = ['money-change-back', 'money-wp'] as const;

describe('money generators (word skills)', () => {
  it('all word skills are wired', () => {
    for (const id of WORD_SKILLS) expect(MONEY_SKILLS).toContain(id);
  });

  for (const skillId of WORD_SKILLS)
    it(`${skillId}: exact answers, keypad steps, numbers <= 100 000, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = moneyItemForSkill(skillId, mulberry32(seed), tier);
          sweepItem(skillId, tier, item);
          const oracle = ORACLE[skillId];
          expect(oracle, `oracle for ${skillId}`).toBeDefined();
          oracle?.(item, tier);
          if (seed < 20) expect(moneyItemForSkill(skillId, mulberry32(seed), tier)).toEqual(item);
        }
    });
});
