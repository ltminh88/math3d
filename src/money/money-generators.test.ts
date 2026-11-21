// Money generators (note skills): exact answers from the scene's raw data, unique options,
// numbers <= 500 000, deterministic. Oracles are keyed by skill.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { MONEY_SKILLS, moneyItemForSkill } from './money-item-for-skill';
import { DENOMINATIONS, TOTAL_MAX } from './money-ranges';
import type { MoneyItem } from './money-scene-types';
import { notesOf, parseMoney, stepValue, targetOfPick } from './money-test-oracles';
import { sweepItem } from './money-test-sweep';

const sum = (ns: readonly number[]): number => ns.reduce((a, b) => a + b, 0);

/** Independent answers per skill, from the story params and the scene's raw data. */
const ORACLE: Record<string, (i: MoneyItem, tier: SkillTier) => void> = {
  'money-recognize': (i, tier) => {
    const notes = notesOf(i);
    expect(notes).toHaveLength(1);
    const v = notes[0] as number;
    if (tier === 1) expect([1000, 2000, 5000, 10000]).toContain(v);
    if (tier === 2) expect([10000, 20000, 50000]).toContain(v);
    if (tier === 3) expect([100000, 200000, 500000]).toContain(v);
    expect(stepValue(i.steps[0])).toBe(v);
    expect(i.work).toEqual([v]);
  },
  'money-total-notes': (i, tier) => {
    const notes = notesOf(i);
    if (tier === 1) expect(notes).toHaveLength(2);
    if (tier === 2) expect(notes).toHaveLength(3);
    if (tier === 3) expect(notes.length).toBeGreaterThanOrEqual(3);
    expect(notes.length).toBeLessThanOrEqual(4);
    const total = sum(notes);
    expect(total).toBeLessThanOrEqual(TOTAL_MAX);
    expect(stepValue(i.steps[0])).toBe(total);
    expect(i.work).toEqual([total]);
  },
  'money-exchange': (i, tier) => {
    const big = parseMoney(String(i.story.params?.big));
    const small = parseMoney(String(i.story.params?.small));
    expect(notesOf(i)).toEqual([big]);
    expect(DENOMINATIONS).toContain(big);
    expect(DENOMINATIONS).toContain(small);
    expect(big % small).toBe(0);
    const count = big / small;
    expect([2, 5, 10]).toContain(count);
    if (tier === 1) expect([5000, 10000]).toContain(big);
    if (tier === 2) expect([20000, 50000]).toContain(big);
    if (tier === 3) expect([100000, 200000, 500000]).toContain(big);
    expect(stepValue(i.steps[0])).toBe(count);
    expect(i.work).toEqual([count]);
  },
  'money-pick-notes': (i, tier) => {
    const notes = notesOf(i);
    if (tier === 1) expect(notes).toHaveLength(3);
    if (tier === 2) expect(notes).toHaveLength(4);
    if (tier === 3) expect(notes).toHaveLength(5);
    expect(targetOfPick(i)).toBeLessThanOrEqual(TOTAL_MAX);
    expect(i.story.key).toBe('pickStory');
    const prompt = i.steps[0]?.prompt.key;
    if (tier === 3) expect(prompt).toBe('askPickFewest');
    else expect(prompt).toBe('askPick');
  },
};

const NOTE_SKILLS = [
  'money-recognize',
  'money-total-notes',
  'money-exchange',
  'money-pick-notes',
] as const;

describe('money generators (note skills)', () => {
  it('all note skills are wired', () => {
    for (const id of NOTE_SKILLS) expect(MONEY_SKILLS).toContain(id);
  });

  for (const skillId of NOTE_SKILLS)
    it(`${skillId}: exact answers, unique options, numbers <= 500 000, deterministic`, () => {
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
