// Chance generators: oracles are hand-derived from the scene (bag counts, dice faces),
// with the verdict re-enumerated by the oracle, never copied from the item.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { dataItemForSkill } from './data-item-for-skill';
import type { DataItem } from './data-scene-types';
import {
  type BagEvent,
  bagOf,
  type DiceEvent,
  diceOf,
  diceSatisfying,
  stepLabel,
  verdictOfBag,
  verdictOfDice,
} from './data-test-oracles';
import { sweepItem } from './data-test-sweep';

const CHANCE_SKILLS = ['chance-bag', 'chance-dice'] as const;

const ORACLE: Record<(typeof CHANCE_SKILLS)[number], (item: DataItem, tier: SkillTier) => void> = {
  'chance-bag': (i, tier) => {
    const bag = bagOf(i);
    const step = i.steps[0];
    const prompt = step?.prompt;
    expect(i.steps.length).toBe(1);
    // Exactly the three fixed chance answers, each once.
    expect(step?.kind).toBe('choice');
    if (step?.kind === 'choice')
      expect(step.options.map((o) => o.label.key).sort()).toEqual([
        'chance_certain',
        'chance_impossible',
        'chance_possible',
      ]);
    const event: BagEvent =
      prompt?.key === 'bagEventOne'
        ? { kind: 'one', colour: String(prompt.params?.colour).slice(2) }
        : prompt?.key === 'bagEventTwo'
          ? { kind: 'two', colour: String(prompt.params?.colour).slice(2) }
          : {
              kind: 'mixed',
              colour1: String(prompt?.params?.colour1).slice(2),
              colour2: String(prompt?.params?.colour2).slice(2),
            };
    expect(stepLabel(step)).toBe(`chance_${verdictOfBag(bag.items, bag.pick, event)}`);
    if (tier === 1) {
      expect(bag.pick).toBe(1);
      expect(prompt?.key).toBe('bagEventOne');
      const colour = (event as { colour: string }).colour;
      expect(i.work).toEqual([bag.items.find((b) => b.colour === colour)?.count ?? 0]);
    }
    if (tier === 2) {
      expect(bag.pick).toBe(2);
      expect(prompt?.key).toBe('bagEventTwo');
      const colour = (event as { colour: string }).colour;
      expect(i.work).toEqual([bag.items.find((b) => b.colour === colour)?.count ?? 0]);
    }
    if (tier === 3) {
      expect(bag.pick).toBe(2);
      expect(prompt?.key).toBe('bagEventMixed');
      const { colour1, colour2 } = event as { colour1: string; colour2: string };
      expect(i.work).toEqual([
        bag.items.find((b) => b.colour === colour1)?.count ?? 0,
        bag.items.find((b) => b.colour === colour2)?.count ?? 0,
      ]);
    }
  },
  'chance-dice': (i, tier) => {
    const dice = diceOf(i);
    const step = i.steps[0];
    const prompt = step?.prompt;
    expect(i.steps.length).toBe(1);
    expect(step?.kind).toBe('choice');
    if (step?.kind === 'choice')
      expect(step.options.map((o) => o.label.key).sort()).toEqual([
        'chance_certain',
        'chance_impossible',
        'chance_possible',
      ]);
    const event: DiceEvent =
      prompt?.key === 'diceEventAll'
        ? { kind: 'all' }
        : { kind: 'face', face: Number(prompt?.params?.face) };
    expect(stepLabel(step)).toBe(`chance_${verdictOfDice(event)}`);
    expect(i.work).toEqual([diceSatisfying(event)]);
    if (tier === 1) {
      expect(dice.other).toBeUndefined();
      expect(dice.hidden).toBeUndefined();
      expect(prompt?.key).toBe('diceEventFace');
    }
    if (tier === 2) expect(dice.other).toBeDefined();
    if (tier === 3) expect((dice.hidden ?? []).length).toBeGreaterThan(0);
  },
};

describe('chance generators', () => {
  for (const skillId of CHANCE_SKILLS)
    it(`${skillId}: exact answers, unique options, numbers <= 999, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = dataItemForSkill(skillId, mulberry32(seed), tier);
          sweepItem(skillId, tier, item);
          ORACLE[skillId]?.(item, tier);
        }
      for (let seed = 0; seed < 20; seed++) {
        const a = dataItemForSkill(skillId, mulberry32(seed), 2);
        const b = dataItemForSkill(skillId, mulberry32(seed), 2);
        expect(a).toEqual(b);
      }
    });
});
