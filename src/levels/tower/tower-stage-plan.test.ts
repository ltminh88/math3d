// Tower stage plan (phase 06): stage 1 is today's run (parity, not an assumption), later
// stages reuse the same formats with a different mix; tiers always come from the Leitner
// box, never from the stage number. The expression floor is a regular kind in stage 2,
// stage 3 drills the true/false floors, and the word problems of stage 4 and the
// remainders of stage 5 ride the shared reasoning round.
import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import tower from './index';
import { planTowerFacts, planTowerQuestions } from './tower-round-flow';
import {
  planTowerRun,
  stageForcedFormat,
  stageReasoningMode,
  stageReasoningSkills,
  TOWER_REASONING_SKILLS,
  TOWER_REM_SKILLS_S5,
  TOWER_WORD_SKILLS_S4,
} from './tower-stage-plan';

const PLANNED = ['mul:6x7', 'div:56/8', 'mul:7x9', 'div:27/3', 'mul:4x8', 'div:45/5', 'mul:3x9'];
const definition = {
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: 7,
} as unknown as LevelDefinition;
const boxed = (box: number): FactStat => ({ ...newFactStat(), box, attempts: 2 });

function learning(stats: Record<string, FactStat>, seed = 33): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 5,
    planSession: () => [...PLANNED],
    record: () => {},
    rng: mulberry32(seed),
  } as unknown as LevelLearning;
}

const formats = (stage: number) =>
  planTowerRun(learning({}), definition, stage).questions.map((q) => q.format);
const knownStats = () => Object.fromEntries(PLANNED.map((k) => [k, boxed(3)]));

describe('planTowerRun stage 1 (parity with today)', () => {
  it('fresh profile: the original seven floors, no reasoning floor', () => {
    const run = planTowerRun(learning({}), definition, 1);
    const rng = mulberry32(33);
    const facts = planTowerFacts(PLANNED, {}, rng, 7);
    expect(run.reasoning).toBeNull();
    expect(run.total).toBe(7);
    expect(run.questions).toEqual(planTowerQuestions(facts, {}, rng));
  });

  it('known facts: six floors plus the expression floor on top', () => {
    const stats = {
      ...knownStats(),
      'sk:expr-brackets': boxed(2),
    };
    const run = planTowerRun(learning(stats), definition, 1);
    expect(run.total).toBe(7);
    expect(run.questions).toHaveLength(6);
    expect(run.reasoning?.skillId).toBe('expr-order');
    expect(TOWER_REASONING_SKILLS).toEqual(['expr-brackets', 'expr-order', 'tf-explain']);
  });
});

describe('stage formats', () => {
  it('stage 2 keeps today’s rotation around the forced expression floor', () => {
    expect(formats(2)).toEqual(formats(1).slice(0, 6));
    expect(planTowerRun(learning({}), definition, 2).reasoning).not.toBeNull();
  });

  it('stage 3 drills the true/false floors: every floor asks for a verdict first', () => {
    expect(formats(3)).toEqual([
      'truefalse',
      'truefalse',
      'truefalse',
      'truefalse',
      'truefalse',
      'truefalse',
      'truefalse',
    ]);
    expect(stageForcedFormat(3)).toBe('truefalse');
  });

  it('no floor repeats the previous format, except the stage-3 emphasis', () => {
    for (const stage of [1, 2, 4, 5, 6]) {
      const list = formats(stage);
      for (let i = 1; i < list.length; i++) expect(list[i]).not.toBe(list[i - 1]);
    }
  });
});

describe('reasoning round per stage', () => {
  it('stage 2 forces the expression floor even for a fresh profile', () => {
    const run = planTowerRun(learning({}), definition, 2);
    expect(run.reasoning).not.toBeNull();
    expect(run.total).toBe(7);
    expect(run.questions).toHaveLength(6);
    expect(TOWER_REASONING_SKILLS).toContain(run.reasoning?.skillId);
    expect(stageReasoningMode(2)).toBe('forced');
  });

  it('stage 4 forces the word-problem floor with its own skill list', () => {
    const run = planTowerRun(learning({}), definition, 4);
    expect(run.reasoning).not.toBeNull();
    expect(run.total).toBe(7);
    expect(run.questions).toHaveLength(6);
    expect(TOWER_WORD_SKILLS_S4).toContain(run.reasoning?.skillId);
    expect(stageReasoningMode(4)).toBe('forced');
    expect(stageReasoningSkills(4)).toEqual(TOWER_WORD_SKILLS_S4);
  });

  it('stage 5 forces the remainder floor with its own skill list', () => {
    const run = planTowerRun(learning({}), definition, 5);
    expect(run.reasoning).not.toBeNull();
    expect(run.total).toBe(7);
    expect(run.questions).toHaveLength(6);
    expect(TOWER_REM_SKILLS_S5).toContain(run.reasoning?.skillId);
    expect(stageReasoningMode(5)).toBe('forced');
    expect(stageReasoningSkills(5)).toEqual(TOWER_REM_SKILLS_S5);
  });

  it('stage 6 keeps today’s slot gate (reasoning floor only once tables are known)', () => {
    expect(planTowerRun(learning({}), definition, 6).reasoning).toBeNull();
    const run = planTowerRun(learning(knownStats()), definition, 6);
    expect(run.reasoning).not.toBeNull();
    expect(TOWER_REASONING_SKILLS).toContain(run.reasoning?.skillId);
    expect(stageReasoningMode(6)).toBe('today');
  });
});

describe('stage plan invariants', () => {
  it('is deterministic for a seed', () => {
    const a = planTowerRun(learning({}, 33), definition, 4);
    const b = planTowerRun(learning({}, 33), definition, 4);
    expect(a).toEqual(b);
  });

  it('every number a child sees is at most 100', () => {
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      const run = planTowerRun(learning({}), definition, stage);
      for (const q of run.questions) {
        expect(q.triple.p).toBeLessThanOrEqual(100);
        for (const step of q.steps) {
          if (typeof step.answer === 'number') expect(step.answer).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('the level definition has 6 stages and the plan covers all of them', () => {
    expect(tower.stages).toBe(6);
    for (let stage = 1; stage <= tower.stages; stage++) {
      expect(['today', 'forced']).toContain(stageReasoningMode(stage));
      expect(stageReasoningSkills(stage).length).toBeGreaterThan(0);
    }
  });

  it('a 7th stage is a data change: the plan maps stage to its config', () => {
    // Adding S7 means one more row in the stage table (mode, skills, forced format)
    // plus strings — no redesign of the planner. The table is total for stages 1-6.
    for (let stage = 1; stage <= 6; stage++) {
      expect(stageForcedFormat(stage)).toBe(stage === 3 ? 'truefalse' : undefined);
    }
  });
});
