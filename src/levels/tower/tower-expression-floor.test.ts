import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelLearning } from '../shared/level-types';
import { planTowerRun, TOWER_REASONING_SKILLS } from './tower-expression-floor';
import { planTowerFacts, planTowerQuestions } from './tower-round-flow';

const PLANNED = ['mul:6x7', 'div:56/8', 'mul:7x9', 'div:27/3', 'mul:4x8', 'div:45/5', 'mul:3x9'];
const boxed = (box: number): FactStat => ({ ...newFactStat(), box, attempts: 2 });

function learning(stats: Record<string, FactStat>): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 5,
    planSession: () => [...PLANNED],
    record: () => {},
    rng: mulberry32(33),
  };
}

describe('planTowerRun', () => {
  it('fresh profile: the original seven floors, no reasoning floor (parity)', () => {
    const run = planTowerRun(learning({}), 7);
    const rng = mulberry32(33);
    const facts = planTowerFacts(PLANNED, {}, rng, 7);
    expect(run.reasoning).toBeNull();
    expect(run.total).toBe(7);
    expect(run.questions).toEqual(planTowerQuestions(facts, {}, rng));
  });

  it('known facts: six floors plus the expression floor on top', () => {
    const stats = {
      ...Object.fromEntries(PLANNED.map((k) => [k, boxed(3)])),
      'sk:expr-brackets': boxed(2),
    };
    const run = planTowerRun(learning(stats), 7);
    expect(run.total).toBe(7);
    expect(run.questions).toHaveLength(6);
    expect(run.reasoning?.skillId).toBe('expr-order');
    expect(TOWER_REASONING_SKILLS).toEqual(['expr-brackets', 'expr-order', 'tf-explain']);
  });
});
