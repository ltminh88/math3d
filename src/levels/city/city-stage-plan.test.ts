// City stage plan (phase 05): stage 1 is today's run (parity, not an assumption), later
// stages reuse the same formats with a different mix; tiers always come from the Leitner
// box, never from the stage number. The compare round is a regular kind in stage 3 and
// the word problems of stages 4-5 ride the shared reasoning round.
import { describe, expect, it } from 'vitest';
import { mulFactsForTables } from '../../learning/curriculum-tables';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import { planCityRounds } from './city-round-flow';
import {
  CITY_REASONING_SKILLS,
  CITY_TWO_STEP_SKILLS_S5,
  CITY_WORD_SKILLS_S4,
  planCityRun,
  stageReasoningMode,
  stageReasoningSkills,
  stageRoundKind,
} from './city-stage-plan';
import city from './index';

const FACTS = ['mul:6x7', 'mul:7x8', 'mul:6x9', 'mul:8x9', 'mul:7x7'];
const definition = { tables: [6, 7, 8, 9], rounds: 5 } as unknown as LevelDefinition;

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
const kinds = (stage: number) =>
  planCityRun(learning({}), definition, stage).rounds.map((r) => r.kind);

describe('planCityRun stage 1 (parity with today)', () => {
  it('fresh profile: the five original rounds, no reasoning round', () => {
    const run = planCityRun(learning({}), definition, 1);
    expect(run.reasoning).toBeNull();
    expect(run.total).toBe(5);
    expect(run.rounds).toEqual(
      planCityRounds({
        facts: FACTS,
        boxOf: () => 1,
        errorsOf: () => [],
        rng: mulberry32(5),
      }),
    );
  });

  it('known tables: four rounds plus the parcel puzzle last, five in all', () => {
    const stats = Object.fromEntries(mulFactsForTables([6, 7, 8, 9]).map((k) => [k, boxed(3)]));
    const run = planCityRun(learning(stats), definition, 1);
    expect(run.total).toBe(5);
    expect(run.rounds.map((r) => r.factKey)).toEqual(FACTS.slice(0, 4));
    expect(CITY_REASONING_SKILLS).toContain(run.reasoning?.skillId);
    expect(run.reasoning?.factKey).toBe(`sk:${run.reasoning?.skillId}`);
    expect(run.reasoning?.tier).toBe(1);
  });
});

describe('stageRoundKind', () => {
  it('stage 2 leans on reverse delivery: every round asks for the right parcel', () => {
    expect(kinds(2)).toEqual(['reverse', 'reverse', 'reverse', 'reverse', 'reverse']);
  });

  it('stage 3 keeps today’s standard mix around the forced compare round', () => {
    // The forced reasoning round takes the last slot, so four standard rounds remain.
    expect(kinds(3)).toEqual(['deliver', 'windows', 'deliver', 'windows']);
  });

  it('stage 4 keeps today’s standard mix around the forced word-problem round', () => {
    expect(kinds(4)).toEqual(['deliver', 'windows', 'deliver', 'windows']);
  });

  it('stage 5 is delivery only; the two-step round is slot-gated, so a fresh run has none', () => {
    expect(kinds(5)).toEqual(['deliver', 'deliver', 'deliver', 'deliver', 'deliver']);
    expect(planCityRun(learning({}), definition, 5).reasoning).toBeNull();
  });

  it('stage 6 rotates deliver / windows / reverse', () => {
    expect(kinds(6)).toEqual(['deliver', 'windows', 'reverse', 'deliver', 'windows']);
  });

  it('box 3+ facts are reverse deliveries in every stage (tiers come from the box)', () => {
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      const run = planCityRun(
        learning(Object.fromEntries(FACTS.map((k) => [k, boxed(3)]))),
        definition,
        stage,
      );
      expect(run.rounds.every((r) => r.kind === 'reverse')).toBe(true);
    }
  });

  it('stageRoundKind is pure on (stage, fact, index, box)', () => {
    expect(stageRoundKind(2, 'mul:6x7', 0, 1)).toBe('reverse');
    expect(stageRoundKind(5, 'mul:6x7', 0, 1)).toBe('deliver');
    expect(stageRoundKind(6, 'mul:6x7', 2, 1)).toBe('reverse');
    expect(stageRoundKind(6, 'mul:6x7', 1, 1)).toBe('windows');
    expect(stageRoundKind(1, 'mul:6x7', 0, 3)).toBe('reverse');
  });
});

describe('reasoning round per stage', () => {
  it('stage 3 forces the compare round even for a fresh profile', () => {
    const run = planCityRun(learning({}), definition, 3);
    expect(run.reasoning).not.toBeNull();
    expect(run.total).toBe(5);
    expect(run.rounds).toHaveLength(4);
    expect(CITY_REASONING_SKILLS).toContain(run.reasoning?.skillId);
    expect(stageReasoningMode(3)).toBe('forced');
  });

  it('stage 4 forces the word-problem round with its own skill list', () => {
    const run = planCityRun(learning({}), definition, 4);
    expect(run.reasoning).not.toBeNull();
    expect(run.total).toBe(5);
    expect(run.rounds).toHaveLength(4);
    expect(CITY_WORD_SKILLS_S4).toContain(run.reasoning?.skillId);
    expect(stageReasoningMode(4)).toBe('forced');
    expect(stageReasoningSkills(4)).toEqual(CITY_WORD_SKILLS_S4);
  });

  it('stage 5 gates the two-step round on known tables (risk table: no forcing)', () => {
    expect(planCityRun(learning({}), definition, 5).reasoning).toBeNull();
    const stats = Object.fromEntries(mulFactsForTables([6, 7, 8, 9]).map((k) => [k, boxed(3)]));
    const run = planCityRun(learning(stats), definition, 5);
    expect(run.reasoning?.skillId).toBe('wp-times-then-add');
    expect(run.total).toBe(5);
    expect(run.rounds).toHaveLength(4);
    expect(stageReasoningMode(5)).toBe('today');
    expect(stageReasoningSkills(5)).toEqual(CITY_TWO_STEP_SKILLS_S5);
  });

  it('stage 6 keeps today’s slot gate (reasoning round only once tables are known)', () => {
    expect(planCityRun(learning({}), definition, 6).reasoning).toBeNull();
    const stats = Object.fromEntries(mulFactsForTables([6, 7, 8, 9]).map((k) => [k, boxed(3)]));
    expect(planCityRun(learning(stats), definition, 6).reasoning).not.toBeNull();
    expect(stageReasoningMode(6)).toBe('today');
  });
});

describe('stage plan invariants', () => {
  it('is deterministic for a seed', () => {
    const a = planCityRun(learning({}, 5), definition, 3);
    const b = planCityRun(learning({}, 5), definition, 3);
    expect(a).toEqual(b);
  });

  it('every number a child sees is at most 100', () => {
    for (const stage of [1, 2, 3, 4, 5, 6]) {
      const run = planCityRun(learning({}), definition, stage);
      for (const round of run.rounds) {
        expect(round.product).toBeLessThanOrEqual(100);
        for (const n of round.houses) expect(n).toBeLessThanOrEqual(100);
        for (const p of round.parcels) expect(p.value).toBeLessThanOrEqual(100);
      }
    }
  });

  it('the level definition has 6 stages and the plan covers all of them', () => {
    expect(city.stages).toBe(6);
    for (let stage = 1; stage <= city.stages; stage++) {
      expect(['today', 'forced', 'none']).toContain(stageReasoningMode(stage));
      expect(['deliver', 'windows', 'reverse']).toContain(stageRoundKind(stage, 'mul:6x7', 0, 1));
    }
  });

  it('a 7th stage is a data change: the plan maps stage to its config', () => {
    // Adding S7 means one more row in the stage table (mode, skills, kind mix) plus
    // strings — no redesign of the planner. The table is total for stages 1-6.
    for (let stage = 1; stage <= 6; stage++) {
      expect(stageReasoningSkills(stage).length).toBeGreaterThan(0);
    }
  });
});
