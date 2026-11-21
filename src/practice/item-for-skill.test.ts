// Dispatcher (phase 00): one skill id -> the item its family generates; only unknown
// ids throw. A geo/meas item carries a `scene` the dialog cannot draw yet (phase 04),
// so daily filters those skills out instead of crashing on them.
import { describe, expect, test } from 'vitest';
import { ARITHMETIC_SKILLS, isArithmeticSkill } from '../arithmetic/arithmetic-item-for-skill';
import { DATA_SKILLS, isDataSkill } from '../data/data-item-for-skill';
import { FRACTION_SKILLS, isFractionSkill } from '../fractions/fraction-item-for-skill';
import { mulberry32 } from '../learning/seeded-rng';
import { SKILL_CATALOG } from '../learning/skill-catalog';
import { isMoneySkill, MONEY_SKILLS } from '../money/money-item-for-skill';
import { isNumberSkill, NUMBER_SKILLS } from '../numbers/number-item-for-skill';
import { isTimeSkill, TIME_SKILLS } from '../time/time-item-for-skill';
import { dialogRenderable, familyOfSkill, itemForSkill } from './item-for-skill';

describe('itemForSkill', () => {
  test('one id per family returns that skill’s item', () => {
    expect(itemForSkill('wp-times-then-add', mulberry32(1), 1).skillId).toBe('wp-times-then-add');
    expect(itemForSkill('geo-midpoint', mulberry32(1), 1).skillId).toBe('geo-midpoint');
    expect(itemForSkill('meas-gram', mulberry32(1), 1).skillId).toBe('meas-gram');
  });

  test('unknown id throws', () => {
    expect(() => itemForSkill('not-a-skill', mulberry32(1), 1)).toThrow();
  });

  test('every catalog id dispatches', () => {
    for (const { id } of SKILL_CATALOG) expect(itemForSkill(id, mulberry32(7), 1).skillId).toBe(id);
  });
});

describe('familyOfSkill', () => {
  test('reads the family from the catalog, not the id prefix', () => {
    expect(familyOfSkill('wp-times-then-add')).toBe('word-problem');
    expect(familyOfSkill('geo-midpoint')).toBe('geometry');
    expect(familyOfSkill('meas-gram')).toBe('measurement');
    expect(familyOfSkill('not-a-skill')).toBeUndefined();
  });
});

describe('new families (phase 02 scaffolding)', () => {
  test('no generator yet: is<F>Skill is false for every catalog id, <f>ItemForSkill throws', () => {
    const checks = [
      [isNumberSkill, NUMBER_SKILLS],
      [isArithmeticSkill, ARITHMETIC_SKILLS],
      [isFractionSkill, FRACTION_SKILLS],
      [isTimeSkill, TIME_SKILLS],
      [isMoneySkill, MONEY_SKILLS],
      [isDataSkill, DATA_SKILLS],
    ] as const;
    for (const [isSkill, skills] of checks) {
      expect(skills).toEqual([]);
      for (const { id } of SKILL_CATALOG) expect(isSkill(id), id).toBe(false);
    }
  });
});

describe('dialogRenderable', () => {
  test('reasoning items render in the dialog; scene items do not', () => {
    const reasoning = itemForSkill('wp-times-then-add', mulberry32(1), 1);
    const geo = itemForSkill('geo-midpoint', mulberry32(1), 1);
    const meas = itemForSkill('meas-gram', mulberry32(1), 1);
    expect(dialogRenderable(reasoning)).toBe(true);
    expect(dialogRenderable(geo)).toBe(false);
    expect(dialogRenderable(meas)).toBe(false);
  });

  test('an id renders exactly when its family has no scene', () => {
    expect(dialogRenderable('wp-times-then-add')).toBe(true);
    expect(dialogRenderable('geo-midpoint')).toBe(false);
    expect(dialogRenderable('meas-gram')).toBe(false);
    expect(dialogRenderable('not-a-skill')).toBe(false);
  });
});
