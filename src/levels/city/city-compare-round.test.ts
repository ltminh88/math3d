import { describe, expect, it } from 'vitest';
import { mulFactsForTables } from '../../learning/curriculum-tables';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import { CITY_REASONING_SKILLS, planCityRun } from './city-compare-round';
import { planCityRounds } from './city-round-flow';

const FACTS = ['mul:6x7', 'mul:7x8', 'mul:6x9', 'mul:8x9', 'mul:7x7', 'mul:6x8'];
const definition = { tables: [6, 7, 8, 9], rounds: 6 } as unknown as LevelDefinition;
const boxed = (box: number): FactStat => ({ ...newFactStat(), box, attempts: 2 });

function learning(stats: Record<string, FactStat>): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 4,
    planSession: () => [...FACTS],
    record: () => {},
    rng: mulberry32(21),
  };
}

describe('planCityRun', () => {
  it('fresh profile: the original six rounds, no reasoning round (parity)', () => {
    const run = planCityRun(learning({}), definition);
    expect(run.reasoning).toBeNull();
    expect(run.total).toBe(6);
    const same = planCityRounds({
      facts: FACTS,
      boxOf: () => 1,
      errorsOf: () => [],
      rng: mulberry32(21),
    });
    expect(run.rounds).toEqual(same);
  });

  it('known tables: five rounds plus the parcel puzzle (gấp mấy lần / ? × 7 = 56)', () => {
    const stats = Object.fromEntries(mulFactsForTables([6, 7, 8, 9]).map((k) => [k, boxed(3)]));
    const run = planCityRun(learning(stats), definition);
    expect(run.total).toBe(6);
    expect(run.rounds.map((r) => r.factKey)).toEqual(FACTS.slice(0, 5));
    expect(CITY_REASONING_SKILLS).toContain(run.reasoning?.skillId);
    expect(run.reasoning?.factKey).toMatch(/^sk:/);
  });
});
