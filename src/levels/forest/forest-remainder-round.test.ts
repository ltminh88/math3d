import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import { varyForestFacts } from './forest-fact-variety';
import { FOREST_REASONING_SKILLS, planForestRun } from './forest-remainder-round';
import { forestFactPool, planForestRounds } from './forest-round-flow';

const FACTS = ['div:12/3', 'div:20/4', 'div:15/5', 'div:8/2', 'div:18/3'];
const definition = { rounds: 5 } as unknown as LevelDefinition;
const boxed = (box: number): FactStat => ({ ...newFactStat(), box, attempts: 3 });

function learning(stats: Record<string, FactStat>): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 2,
    planSession: () => [...FACTS],
    record: () => {},
    rng: mulberry32(11),
  };
}

describe('planForestRun', () => {
  it('fresh profile: the original five rounds, no reasoning round (parity)', () => {
    const run = planForestRun(learning({}), definition);
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
    const run = planForestRun(learning(stats), definition);
    expect(run.total).toBe(5);
    expect(run.rounds).toHaveLength(4);
    expect(run.reasoning?.skillId).toBe('div-rem-ceil');
    expect(FOREST_REASONING_SKILLS).toContain(run.reasoning?.skillId);
    expect(run.reasoning?.factKey).toBe('sk:div-rem-ceil');
    expect(run.reasoning?.item.steps.length).toBeGreaterThanOrEqual(1);
  });
});
