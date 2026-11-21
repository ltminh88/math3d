import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import { skillsOfFamily } from '../learning/skill-catalog';
import type { SkillTier } from '../learning/skill-tiers';
import { FRACTION_SKILLS, fractionItemForSkill } from './fraction-item-for-skill';
import type { FractionItem } from './fraction-scene-types';
import { showsUnit, showsUnitBody } from './fraction-test-oracles';
import { sweepItem } from './fraction-test-sweep';

const scene = <K extends NonNullable<FractionItem['scene']>['kind']>(i: FractionItem, kind: K) => {
  expect(i.scene?.kind).toBe(kind);
  return i.scene as Extract<NonNullable<FractionItem['scene']>, { kind: K }>;
};
const wordDenom = (key: string): number => Number(key.split('_')[1]);
const choiceStep = (i: FractionItem, idx = 0) => {
  const step = i.steps[idx];
  if (step?.kind !== 'choice') throw new Error('needs a choice step');
  return step;
};
/** The denominator of the correct fraction option of a choice step. */
const correctDenom = (i: FractionItem, idx = 0): number => {
  const correct = choiceStep(i, idx).options.find((o) => o.correct);
  if (correct?.label.key !== 'frac') throw new Error('needs a frac option');
  return Number(correct.label.params?.d);
};

/** Independent answers per story key, from the story params and the scene's raw data. */
const ORACLE: Record<string, (i: FractionItem) => void> = {
  readWordStory: (i) => {
    const n = wordDenom(i.steps[0]?.prompt.key ?? '');
    const correct = choiceStep(i).options.find((o) => o.correct);
    expect(Number(correct?.label.params?.n)).toBe(1);
    expect(correctDenom(i)).toBe(n);
    // Options are fractions 1/2..9/1 (the swapped n/1 is a named trap, not a bug).
    for (const o of choiceStep(i).options) {
      expect(o.label.key).toBe('frac');
      expect(Number(o.label.params?.d)).toBeGreaterThanOrEqual(1);
      expect(Number(o.label.params?.d)).toBeLessThanOrEqual(9);
      expect(Number(o.label.params?.n)).toBeGreaterThanOrEqual(1);
      expect(Number(o.label.params?.n)).toBeLessThanOrEqual(9);
    }
  },
  readSymbolStory: (i) => {
    const n = Number(i.steps[0]?.prompt.params?.d);
    const correct = choiceStep(i).options.find((o) => o.correct);
    expect(correct?.label.key).toBe(`word_${n}`);
    for (const o of choiceStep(i).options) expect(o.label.key.startsWith('word_')).toBe(true);
  },
  readBothStory: (i) => {
    const n1 = wordDenom(i.steps[0]?.prompt.key ?? '');
    const n2 = Number(i.steps[1]?.prompt.params?.d);
    expect(n1).not.toBe(n2);
    expect(correctDenom(i, 0)).toBe(n1);
    const correct = choiceStep(i, 1).options.find((o) => o.correct);
    expect(correct?.label.key).toBe(`word_${n2}`);
  },
  shadedStory: (i) => {
    const s = scene(i, 'fraction-shape');
    expect(showsUnit(s, s.parts)).toBe(s.equal);
    if (s.equal) expect(correctDenom(i)).toBe(s.parts);
    else {
      const correct = choiceStep(i).options.find((o) => o.correct);
      expect(correct?.label.key).toBe('noEqualParts');
      const trap = choiceStep(i).options.find(
        (o) => o.label.key === 'frac' && Number(o.label.params?.d) === s.parts,
      );
      expect(trap?.misconception).toBe('unequal-parts');
    }
  },
  pickStory: (i) => {
    const n = wordDenom(i.steps[0]?.prompt.key ?? '');
    const s = scene(i, 'fraction-pick');
    const showing = s.figures.filter((f) => showsUnitBody(f, n));
    expect(showing).toHaveLength(1);
    const correct = choiceStep(i).options.find((o) => o.correct);
    expect(String(correct?.label.params?.l)).toBe(showing[0]?.label);
  },
};

const SHAPE_SKILLS = ['fraction-read', 'fraction-shaded', 'fraction-pick-picture'] as const;

describe('fraction generators (shape skills)', () => {
  it('cover every fraction-* skill of the catalog', () => {
    expect([...FRACTION_SKILLS].sort()).toEqual(skillsOfFamily('fraction').sort());
  });

  for (const skillId of SHAPE_SKILLS)
    it(`${skillId}: exact answers, unique options, numbers <= 100, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = fractionItemForSkill(skillId, mulberry32(seed), tier);
          sweepItem(item, skillId, tier, seed);
          const oracle = ORACLE[item.story.key];
          expect(oracle, `oracle for ${item.story.key}`).toBeDefined();
          oracle?.(item);
          if (seed < 20)
            expect(fractionItemForSkill(skillId, mulberry32(seed), tier)).toEqual(item);
        }
    });

  it('refuses skills it has no generator for', () => {
    expect(() => fractionItemForSkill('time-clock', mulberry32(1), 1)).toThrow();
  });
});
