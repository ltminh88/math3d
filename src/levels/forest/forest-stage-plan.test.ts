// Forest stage plan (phase 04): stage 1 is today's run (parity, not an assumption); later
// stages reuse the same formats with a different mix. Stage 2 promotes remainders to a regular
// round, stage 3 leans on fact families, stage 4 forces the word-problem round, stage 5 is
// symbolic only, stage 6 is mastery (the same plan as stage 1 — mastery is the child's state).
import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import { varyForestFacts } from './forest-fact-variety';
import { forestFactPool, planForestRounds } from './forest-round-flow';
import {
  FOREST_REASONING_SKILLS,
  FOREST_REASONING_SKILLS_S4,
  planForestRun,
  stageAnimalOrder,
  stageReasoningMode,
  stageReasoningSkills,
  stageRoundKind,
} from './forest-stage-plan';
import forest from './index';

const FACTS = ['div:12/3', 'div:20/4', 'div:15/5', 'div:8/2', 'div:18/3'];
const definition = { rounds: 5 } as unknown as LevelDefinition;
const boxed = (box: number): FactStat => ({ ...newFactStat(), box, attempts: 3 });

function learning(stats: Record<string, FactStat>, seed = 11): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 2,
    planSession: () => [...FACTS],
    record: () => {},
    rng: mulberry32(seed),
  } as unknown as LevelLearning;
}

const kinds = (stage: number) =>
  planForestRun(learning({}), definition, stage).rounds.map((r) => r.kind);

describe('planForestRun stage 1 (parity with today)', () => {
  it('fresh profile: the original five rounds, no reasoning round', () => {
    const run = planForestRun(learning({}), definition, 1);
    const facts = varyForestFacts(FACTS, forestFactPool({}), mulberry32(11));
    expect(run.reasoning).toBeNull();
    expect(run.total).toBe(5);
    expect(run.rounds).toEqual(planForestRounds(facts, {}));
  });

  it('known divisions: four rounds plus a remainder round (sk: key, tier from its box)', () => {
    const stats = {
      ...Object.fromEntries(FACTS.map((k) => [k, boxed(4)])),
      'sk:div-rem-floor': boxed(5),
    };
    const run = planForestRun(learning(stats), definition, 1);
    expect(run.total).toBe(5);
    expect(run.rounds).toHaveLength(4);
    expect(run.reasoning?.skillId).toBe('div-rem-ceil');
    expect(FOREST_REASONING_SKILLS).toContain(run.reasoning?.skillId);
    expect(run.reasoning?.factKey).toBe('sk:div-rem-ceil');
    expect(run.reasoning?.item.steps.length).toBeGreaterThanOrEqual(1);
  });
});

describe('stageRoundKind', () => {
  it('stage 2 keeps today’s mix (the remainder round is the new regular round)', () => {
    expect(kinds(2)).toEqual(['share', 'pack', 'family', 'share']);
  });

  it('stage 3 leans on fact families (×/÷ inverse)', () => {
    expect(kinds(3)).toEqual(['family', 'family', 'family', 'family', 'family']);
  });

  it('stage 4 mixes share, pack and family around the forced word-problem round', () => {
    // The forced reasoning round takes the last slot, so four standard rounds remain.
    expect(kinds(4)).toEqual(['share', 'pack', 'family', 'share']);
  });

  it('stage 5 is symbolic (fact families only, no fruit dealing)', () => {
    expect(kinds(5)).toEqual(['family', 'family', 'family', 'family', 'family']);
  });

  it('stage 6 is mastery: the same plan as stage 1 (mastery is the child’s state)', () => {
    expect(kinds(6)).toEqual(kinds(1));
    expect(kinds(6)).toEqual(['share', 'pack', 'family', 'share', 'pack']);
  });

  it('box 3+ facts are symbolic (fact family) in every stage (tiers come from the box)', () => {
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      const run = planForestRun(
        learning(Object.fromEntries(FACTS.map((k) => [k, boxed(3)]))),
        definition,
        stage,
      );
      expect(run.rounds.every((r) => r.kind === 'family')).toBe(true);
    }
  });

  it('piles over 20 fruit are symbolic too (no dealing a pile that big)', () => {
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      expect(stageRoundKind(stage, 'div:24/4', 0, 1)).toBe('family');
    }
  });

  it('stageRoundKind is pure on (stage, fact, index, box)', () => {
    expect(stageRoundKind(1, 'div:12/3', 0, 1)).toBe('share');
    expect(stageRoundKind(1, 'div:12/3', 1, 1)).toBe('pack');
    expect(stageRoundKind(1, 'div:12/3', 2, 1)).toBe('family');
    expect(stageRoundKind(3, 'div:12/3', 0, 1)).toBe('family');
    expect(stageRoundKind(5, 'div:12/3', 1, 1)).toBe('family');
    expect(stageRoundKind(1, 'div:12/3', 0, 3)).toBe('family');
  });
});

describe('reasoning round per stage', () => {
  it('stage 2 forces the remainder round even for a fresh profile', () => {
    const run = planForestRun(learning({}), definition, 2);
    expect(run.reasoning).not.toBeNull();
    expect(run.reasoning?.skillId).toBe('div-rem-floor');
    expect(run.reasoning?.tier).toBe(1);
    expect(run.total).toBe(5);
    expect(run.rounds).toHaveLength(4);
    expect(stageReasoningMode(2)).toBe('forced');
  });

  it('stage 4 forces the word-problem round with the division-context skills', () => {
    const run = planForestRun(learning({}), definition, 4);
    expect(run.reasoning).not.toBeNull();
    expect(FOREST_REASONING_SKILLS_S4).toContain(run.reasoning?.skillId);
    expect(run.reasoning?.tier).toBe(1);
    expect(run.total).toBe(5);
    expect(run.rounds).toHaveLength(4);
    expect(stageReasoningMode(4)).toBe('forced');
    expect(stageReasoningSkills(4)).toEqual(FOREST_REASONING_SKILLS_S4);
    expect(stageReasoningSkills(1)).toEqual(FOREST_REASONING_SKILLS);
  });

  it('stage 5 never has a reasoning round (symbolic only)', () => {
    const stats = Object.fromEntries(FACTS.map((k) => [k, boxed(3)]));
    const run = planForestRun(learning(stats), definition, 5);
    expect(run.reasoning).toBeNull();
    expect(run.total).toBe(5);
    expect(stageReasoningMode(5)).toBe('none');
  });

  it('stage 6 keeps today’s slot gate (reasoning round only once divisions are known)', () => {
    expect(planForestRun(learning({}), definition, 6).reasoning).toBeNull();
    const stats = Object.fromEntries(FACTS.map((k) => [k, boxed(3)]));
    expect(planForestRun(learning(stats), definition, 6).reasoning).not.toBeNull();
    expect(stageReasoningMode(6)).toBe('today');
  });
});

describe('stage animal friends', () => {
  it('rotates the friends by stage (same five friends, a different one first)', () => {
    expect(stageAnimalOrder(1)).toEqual(['rabbit', 'squirrel', 'fox', 'hedgehog', 'bear']);
    expect(stageAnimalOrder(2)).toEqual(['squirrel', 'fox', 'hedgehog', 'bear', 'rabbit']);
    expect(stageAnimalOrder(5)).toEqual(['bear', 'rabbit', 'squirrel', 'fox', 'hedgehog']);
    // Five friends, six stages: stage 6 comes back to stage 1's order.
    expect(stageAnimalOrder(6)).toEqual(stageAnimalOrder(1));
  });

  it('every stage’s order is a permutation of the five friends', () => {
    const sorted = ['bear', 'fox', 'hedgehog', 'rabbit', 'squirrel'];
    for (let stage = 1; stage <= 6; stage++)
      expect([...stageAnimalOrder(stage)].sort()).toEqual(sorted);
  });
});

describe('stage plan invariants', () => {
  it('is deterministic for a seed', () => {
    const a = planForestRun(learning({}, 11), definition, 2);
    const b = planForestRun(learning({}, 11), definition, 2);
    expect(a).toEqual(b);
  });

  it('every number a child sees is at most 100', () => {
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      const run = planForestRun(learning({}), definition, stage);
      for (const round of run.rounds) {
        expect(round.dividend).toBeLessThanOrEqual(100);
        expect(round.divisor).toBeLessThanOrEqual(100);
        expect(round.quotient).toBeLessThanOrEqual(100);
      }
    }
  });

  it('the level definition has 6 stages and the plan covers all of them', () => {
    expect(forest.stages).toBe(6);
    for (let stage = 1; stage <= forest.stages; stage++) {
      expect(['today', 'forced', 'none']).toContain(stageReasoningMode(stage));
      expect(['share', 'pack', 'family']).toContain(stageRoundKind(stage, 'div:12/3', 0, 1));
    }
  });
});
