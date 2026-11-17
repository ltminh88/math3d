// Field stage plan (phase 03): stage 1 is today's run (parity, not an assumption), later
// stages reuse the same formats with a different mix; tiers always come from the Leitner
// box, never from the stage number.
import { describe, expect, it } from 'vitest';
import { mulFactsForTables } from '../../learning/curriculum-tables';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import { planFieldRounds } from './field-round-flow';
import {
  FIELD_REASONING_SKILLS,
  planFieldRun,
  stageReasoningMode,
  stageReasoningSkills,
  stageRoundType,
} from './field-stage-plan';
import field from './index';

const FACTS = ['mul:3x4', 'mul:4x7', 'mul:3x9', 'mul:2x4', 'mul:3x5'];
const definition = { tables: [3, 4], rounds: 5 } as unknown as LevelDefinition;

function learning(stats: Record<string, FactStat>, seed = 5): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 3,
    planSession: () => [...FACTS],
    record: () => {},
    rng: mulberry32(seed),
  } as unknown as LevelLearning;
}

const boxed = (box: number) => ({ ...newFactStat(), box, attempts: 3 });
const types = (stage: number) =>
  planFieldRun(learning({}), definition, stage).rounds.map((r) => r.type);

describe('planFieldRun stage 1 (parity with today)', () => {
  it('fresh profile: the five original rounds, no reasoning round', () => {
    const run = planFieldRun(learning({}), definition, 1);
    expect(run.reasoning).toBeNull();
    expect(run.total).toBe(5);
    expect(run.rounds).toEqual(
      planFieldRounds({ facts: FACTS, boxOf: () => 1, rng: mulberry32(5) }),
    );
  });

  it('mastered tables: four rounds plus the reasoning round last, five in all', () => {
    const stats = Object.fromEntries(mulFactsForTables([3, 4]).map((k) => [k, boxed(3)]));
    const run = planFieldRun(learning(stats), definition, 1);
    expect(run.total).toBe(5);
    expect(run.rounds.map((r) => r.factKey)).toEqual(FACTS.slice(0, 4));
    expect(FIELD_REASONING_SKILLS).toContain(run.reasoning?.skillId);
    expect(run.reasoning?.factKey).toBe(`sk:${run.reasoning?.skillId}`);
    expect(run.reasoning?.tier).toBe(1);
  });
});

describe('stageRoundType', () => {
  it('stage 2 leans on equations (commutativity): both orders offered for every plot', () => {
    expect(types(2)).toEqual(['equations', 'equations', 'equations', 'equations', 'equations']);
  });

  it('stage 3 is the missing-factor stage', () => {
    expect(types(3)).toEqual(['missing', 'missing', 'missing', 'missing', 'missing']);
  });

  it('stage 4 mixes equations and missing factor around the forced reasoning round', () => {
    // The forced reasoning round takes the last slot, so four standard rounds remain.
    expect(types(4)).toEqual(['equations', 'missing', 'equations', 'missing']);
  });

  it('stage 5 is recall (no planting drag); unlearned facts fall back to missing factor', () => {
    expect(types(5)).toEqual(['missing', 'missing', 'missing', 'missing', 'missing']);
  });

  it('stage 6 rotates build / equations / missing factor', () => {
    expect(types(6)).toEqual(['build', 'equations', 'missing', 'build', 'equations']);
  });

  it('box 3+ facts are recalled in every stage (tiers come from the box, never the stage)', () => {
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      const run = planFieldRun(
        learning(Object.fromEntries(FACTS.map((k) => [k, boxed(3)]))),
        definition,
        stage,
      );
      expect(run.rounds.every((r) => r.type === 'recall')).toBe(true);
    }
  });

  it('stageRoundType is pure on (stage, fact, index, box)', () => {
    expect(stageRoundType(2, 'mul:3x4', 0, 1)).toBe('equations');
    expect(stageRoundType(3, 'mul:3x4', 0, 1)).toBe('missing');
    expect(stageRoundType(6, 'mul:3x4', 2, 1)).toBe('missing');
    expect(stageRoundType(6, 'mul:4x4', 2, 1)).toBe('build');
  });

  it('a square plot never asks for its missing factor (the shown factor would be the answer)', () => {
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      expect(stageRoundType(stage, 'mul:3x3', 0, 1)).toBe('build');
      expect(stageRoundType(stage, 'mul:4x4', 1, 1)).toBe('build');
    }
  });
});

describe('reasoning round per stage', () => {
  it('stage 4 forces the reasoning round even for a fresh profile', () => {
    const run = planFieldRun(learning({}), definition, 4);
    expect(run.reasoning).not.toBeNull();
    expect(run.total).toBe(5);
    expect(run.rounds).toHaveLength(4);
    expect(stageReasoningMode(4)).toBe('forced');
  });

  it('stage 4 grows the skill list with two more word-problem skills', () => {
    expect(stageReasoningSkills(4)).toEqual([
      ...FIELD_REASONING_SKILLS,
      'wp-more-less-then-total',
      'wp-unit-then-times',
    ]);
    expect(stageReasoningSkills(1)).toEqual(FIELD_REASONING_SKILLS);
  });

  it('stage 5 never has a reasoning round (recall only)', () => {
    const stats = Object.fromEntries(mulFactsForTables([3, 4]).map((k) => [k, boxed(3)]));
    const run = planFieldRun(learning(stats), definition, 5);
    expect(run.reasoning).toBeNull();
    expect(run.total).toBe(5);
    expect(stageReasoningMode(5)).toBe('none');
  });

  it('stage 6 keeps today’s slot gate (reasoning round only once tables are known)', () => {
    expect(planFieldRun(learning({}), definition, 6).reasoning).toBeNull();
    const stats = Object.fromEntries(mulFactsForTables([3, 4]).map((k) => [k, boxed(3)]));
    expect(planFieldRun(learning(stats), definition, 6).reasoning).not.toBeNull();
    expect(stageReasoningMode(6)).toBe('today');
  });
});

describe('stage plan invariants', () => {
  it('is deterministic for a seed', () => {
    const a = planFieldRun(learning({}, 5), definition, 3);
    const b = planFieldRun(learning({}, 5), definition, 3);
    expect(a).toEqual(b);
  });

  it('every number a child sees is at most 100', () => {
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      const run = planFieldRun(learning({}), definition, stage);
      for (const round of run.rounds) {
        expect(round.rows).toBeLessThanOrEqual(10);
        expect(round.cols).toBeLessThanOrEqual(10);
        expect(round.total).toBeLessThanOrEqual(100);
      }
    }
  });

  it('the level definition has 6 stages and the plan covers all of them', () => {
    expect(field.stages).toBe(6);
    for (let stage = 1; stage <= field.stages; stage++) {
      expect(['today', 'forced', 'none']).toContain(stageReasoningMode(stage));
      expect(['build', 'equations', 'recall', 'missing']).toContain(
        stageRoundType(stage, 'mul:3x4', 0, 1),
      );
    }
  });
});
