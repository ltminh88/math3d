import { describe, expect, it } from 'vitest';
import { mulFactsForTables } from '../../learning/curriculum-tables';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import { FIELD_REASONING_SKILLS, planFieldRun } from './field-reasoning-round';
import { planFieldRounds } from './field-round-flow';

const FACTS = ['mul:3x4', 'mul:3x6', 'mul:4x7', 'mul:3x8', 'mul:4x9'];
const definition = { tables: [3, 4], rounds: 5 } as unknown as LevelDefinition;

function learning(stats: Record<string, FactStat>, seed = 5): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 3,
    planSession: () => [...FACTS],
    record: () => {},
    rng: mulberry32(seed),
  };
}

const boxed = (box: number) => ({ ...newFactStat(), box, attempts: 3 });

describe('planFieldRun', () => {
  it('fresh profile: the five original rounds, no reasoning round (parity)', () => {
    const run = planFieldRun(learning({}), definition);
    expect(run.reasoning).toBeNull();
    expect(run.total).toBe(5);
    expect(run.rounds).toEqual(
      planFieldRounds({ facts: FACTS, boxOf: () => 1, rng: mulberry32(5) }),
    );
  });

  it('mastered tables: four rounds plus the reasoning round last, five in all', () => {
    const stats = Object.fromEntries(mulFactsForTables([3, 4]).map((k) => [k, boxed(3)]));
    const run = planFieldRun(learning(stats), definition);
    expect(run.total).toBe(5);
    expect(run.rounds.map((r) => r.factKey)).toEqual(FACTS.slice(0, 4));
    expect(FIELD_REASONING_SKILLS).toContain(run.reasoning?.skillId);
    expect(run.reasoning?.factKey).toBe(`sk:${run.reasoning?.skillId}`);
    expect(run.reasoning?.tier).toBe(1);
  });
});
