import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { fractionItemForSkill } from './fraction-item-for-skill';
import type { FractionItem } from './fraction-scene-types';
import { lastValue, stepValue } from './fraction-test-oracles';
import { sweepItem } from './fraction-test-sweep';

const p = (i: FractionItem, k: string) => Number(i.story.params?.[k]);
const scene = <K extends NonNullable<FractionItem['scene']>['kind']>(i: FractionItem, kind: K) => {
  expect(i.scene?.kind).toBe(kind);
  return i.scene as Extract<NonNullable<FractionItem['scene']>, { kind: K }>;
};
/** N divisible by n, and the part 1/n of N. */
const partOf = (i: FractionItem): [number, number, number] => {
  const n = p(i, 'n');
  const total = p(i, 'count');
  expect(total % n).toBe(0);
  return [n, total, total / n];
};

/** Independent answers per story key, from the story params and the scene's raw data. */
const ORACLE: Record<string, (i: FractionItem, tier: SkillTier) => void> = {
  setCircleStory: (i, tier) => {
    const [n, total, part] = partOf(i);
    const s = scene(i, 'fraction-set');
    expect(s.count).toBe(total);
    expect(s.marked).toHaveLength(part);
    expect(s.marked.every((m, k) => m === k)).toBe(true);
    expect(lastValue(i)).toBe(tier === 3 ? total - part : part);
    if (tier === 3) expect(stepValue(i.steps[0])).toBe(part);
    void n;
  },
  setNumberStory: (i, tier) => {
    expect(i.scene).toBeUndefined();
    const [n, total, part] = partOf(i);
    expect(lastValue(i)).toBe(tier === 3 ? total - part : part);
    if (tier === 3) expect(stepValue(i.steps[0])).toBe(part);
    void n;
  },
  wpShare: (i, tier) => {
    expect(i.scene).toBeUndefined();
    const [, total, part] = partOf(i);
    expect(lastValue(i)).toBe(tier === 3 ? total - part : part);
    if (tier === 3) expect(stepValue(i.steps[0])).toBe(part);
  },
  wpEat: (i, tier) => {
    expect(i.scene).toBeUndefined();
    const [, total, part] = partOf(i);
    expect(lastValue(i)).toBe(tier === 3 ? total - part : part);
    if (tier === 3) expect(stepValue(i.steps[0])).toBe(part);
  },
  wpClass: (i) => {
    expect(i.scene).toBeUndefined();
    const [, , part] = partOf(i);
    expect(lastValue(i)).toBe(part);
  },
  wpRead: (i) => {
    expect(i.scene).toBeUndefined();
    const [, , part] = partOf(i);
    expect(lastValue(i)).toBe(part);
  },
};

const SET_SKILLS = ['fraction-of-set-circle', 'fraction-of-set-number', 'fraction-wp'] as const;

describe('fraction generators (set skills)', () => {
  for (const skillId of SET_SKILLS)
    it(`${skillId}: exact answers, unique options, numbers <= 100, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = fractionItemForSkill(skillId, mulberry32(seed), tier);
          sweepItem(item, skillId, tier, seed);
          const oracle = ORACLE[item.story.key];
          expect(oracle, `oracle for ${item.story.key}`).toBeDefined();
          oracle?.(item, tier);
          if (seed < 20)
            expect(fractionItemForSkill(skillId, mulberry32(seed), tier)).toEqual(item);
        }
    });
});
