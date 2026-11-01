import { describe, expect, it } from 'vitest';
import { mulKey, skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import {
  chooseReasoningSkill,
  planReasoningRound,
  reasoningSlot,
  standardFacts,
} from './reasoning-round-slot';

const stat = (box: number, attempts = 2): FactStat => ({ ...newFactStat(), box, attempts });
const FACTS = [mulKey(3, 4), mulKey(3, 5), mulKey(4, 6), mulKey(3, 7), mulKey(4, 8)];
const SKILLS = ['wp-times-then-add', 'pattern-skip-count'];
const mastered = (n: number, box = 3) =>
  Object.fromEntries(FACTS.slice(0, n).map((k) => [k, stat(box)]));

describe('reasoningSlot', () => {
  it('fresh profile: never', () => {
    expect(reasoningSlot({}, FACTS, SKILLS)).toBe(false);
  });

  it('at least 3 of the run facts in box 3+, or a skill of the level seen before', () => {
    expect(reasoningSlot(mastered(2), FACTS, SKILLS)).toBe(false);
    expect(reasoningSlot(mastered(3), FACTS, SKILLS)).toBe(true);
    expect(reasoningSlot(mastered(5, 2), FACTS, SKILLS)).toBe(false);
    expect(reasoningSlot({ [skillKey('pattern-skip-count')]: stat(1) }, FACTS, SKILLS)).toBe(true);
    expect(reasoningSlot({ [skillKey('expr-order')]: stat(4) }, FACTS, SKILLS)).toBe(false);
  });

  it('needs a standard round to replace', () => {
    expect(reasoningSlot(mastered(3), FACTS.slice(0, 1), SKILLS)).toBe(false);
  });
});

describe('chooseReasoningSkill', () => {
  it('the skill seen least, list order on ties', () => {
    expect(chooseReasoningSkill({}, SKILLS)).toBe('wp-times-then-add');
    const seen = { [skillKey('wp-times-then-add')]: stat(2, 1) };
    expect(chooseReasoningSkill(seen, SKILLS)).toBe('pattern-skip-count');
  });
});

describe('planReasoningRound', () => {
  it('fresh: none, and the rng is not touched (parity)', () => {
    let calls = 0;
    const rng = () => {
      calls += 1;
      return 0.5;
    };
    expect(planReasoningRound({ stats: {}, facts: FACTS, skills: SKILLS, rng })).toBeNull();
    expect(calls).toBe(0);
    expect(standardFacts(FACTS, null)).toEqual(FACTS);
  });

  it('mastered: one round on the last slot, tier from the skill box, sk: key', () => {
    const stats = { ...mastered(3), [skillKey('wp-times-then-add')]: stat(5, 1) };
    const plan = planReasoningRound({ stats, facts: FACTS, skills: SKILLS, rng: mulberry32(2) });
    expect(plan?.skillId).toBe('pattern-skip-count');
    expect(plan?.tier).toBe(1);
    expect(plan?.factKey).toBe('sk:pattern-skip-count');
    expect(plan?.item.skillId).toBe('pattern-skip-count');
    expect(standardFacts(FACTS, plan ?? null)).toEqual(FACTS.slice(0, 4));
    const boxed = { ...mastered(3), [skillKey('wp-times-then-add')]: stat(5, 3) };
    const both = { ...boxed, [skillKey('pattern-skip-count')]: stat(3, 3) };
    expect(
      planReasoningRound({ stats: both, facts: FACTS, skills: SKILLS, rng: mulberry32(1) })?.tier,
    ).toBe(3);
  });
});
