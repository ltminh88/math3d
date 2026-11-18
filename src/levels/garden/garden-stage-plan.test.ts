// Garden stage plan (phase 07): stage 1 is today's run (parity, not an assumption), later
// stages drill a skill subset with a tier floor; tiers always come from the Leitner box,
// never from the stage number. Stage 5 drills the weakest skills first. Every stage keeps
// ≥ 2 skills per kind, so a 6-round run never repeats a skill.
import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  GARDEN_SKILLS,
  GARDEN_STAGE_SKILLS,
  gardenKindOf,
  planGardenRounds,
  planGardenRun,
  stageTierFloor,
} from './garden-round-plan';
import garden from './index';

const PLANNED = [
  'sk:pattern-add',
  'sk:unknown-add-sub',
  'sk:expr-order',
  'sk:pattern-sub',
  'sk:unknown-mul-div',
  'sk:expr-brackets',
  'sk:pattern-skip-count',
  'sk:expr-from-story',
] as const;
const definition = {
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: 6,
} as unknown as LevelDefinition;
const boxed = (box: number): FactStat => ({
  attempts: 3,
  correct: 2,
  totalMs: 9000,
  box,
  lastSeenSession: 1,
  lastSeenAt: 1,
  streak: 0,
  fluent: false,
  errs: [],
});

function learning(
  stats: Record<string, FactStat>,
  seed = 33,
  planned: readonly string[] = [...PLANNED],
): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 5,
    planSession: () => [...planned],
    record: () => {},
    rng: mulberry32(seed),
  } as unknown as LevelLearning;
}

describe('planGardenRun stage 1 (parity with today)', () => {
  it('fresh profile: the same six rounds as the direct planner', () => {
    const run = planGardenRun(learning({}), definition, 1);
    expect(run).toEqual(planGardenRounds([...PLANNED], {}, mulberry32(33), 6));
    expect(run).toHaveLength(6);
    expect(run.map((r) => r.kind)).toEqual([
      'pattern',
      'balance',
      'bag',
      'pattern',
      'balance',
      'bag',
    ]);
  });
});

describe('tier floor is a preference, never a tier change', () => {
  it('stage 2 plays the tier-2 skills of each kind first', () => {
    // Box 3 is tier 2; box 1 is tier 1 (box 1-2 -> tier 1, box 3-4 -> tier 2).
    const stats: Record<string, FactStat> = {
      'sk:pattern-add': boxed(3),
      'sk:pattern-sub': boxed(1),
      'sk:pattern-skip-count': boxed(1),
      'sk:unknown-add-sub': boxed(3),
      'sk:unknown-mul-div': boxed(1),
      'sk:expr-order': boxed(3),
      'sk:expr-brackets': boxed(1),
      'sk:expr-from-story': boxed(1),
    };
    const run = planGardenRun(learning(stats), definition, 2);
    expect(run[0]?.skillId).toBe('pattern-add');
    expect(run[1]?.skillId).toBe('unknown-add-sub');
    expect(run[2]?.skillId).toBe('expr-order');
    expect(run[0]?.item.tier).toBe(2);
    expect(run[1]?.item.tier).toBe(2);
    expect(run[2]?.item.tier).toBe(2);
  });

  it('a box-1 skill stays tier 1 even in stage 4 (floor 3)', () => {
    const allBox1 = Object.fromEntries(GARDEN_SKILLS.map((s) => [`sk:${s}`, boxed(1)]));
    for (const stage of [1, 2, 3, 4, 5]) {
      const run = planGardenRun(learning(allBox1), definition, stage);
      for (const r of run) expect(r.item.tier).toBe(1);
    }
  });

  it('a box-5 skill stays tier 3 even in stage 2 (floor 2)', () => {
    const allBox5 = Object.fromEntries(GARDEN_SKILLS.map((s) => [`sk:${s}`, boxed(5)]));
    for (const stage of [1, 2, 3, 4, 5]) {
      const run = planGardenRun(learning(allBox5), definition, stage);
      for (const r of run) expect(r.item.tier).toBe(3);
    }
  });
});

describe('stage plan invariants', () => {
  it('never repeats a skill in a run, for any stage and seed', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      for (const seed of [11, 33, 77]) {
        // A different plan order per seed: shuffle the eight skills with the seed.
        const shuffle = mulberry32(seed);
        const planned = [...PLANNED].sort(() => shuffle() - 0.5);
        const skills = planGardenRun(learning({}, seed, planned), definition, stage).map(
          (r) => r.skillId,
        );
        expect(new Set(skills).size).toBe(6);
        for (let i = 1; i < skills.length; i++) {
          expect(gardenKindOf(skills[i] as string)).not.toBe(gardenKindOf(skills[i - 1] as string));
        }
      }
    }
  });

  it('never repeats a skill even when the planner repeats facts (fresh-profile spill)', () => {
    // planSession repeats the chosen facts when the pool is short (its documented spill
    // behaviour): a fresh profile plans 3 skills twice. The queues dedupe them, so every
    // stage still plays six distinct skills.
    const planned = [
      'sk:pattern-add',
      'sk:unknown-add-sub',
      'sk:expr-order',
      'sk:pattern-add',
      'sk:unknown-add-sub',
      'sk:expr-order',
    ];
    for (const stage of [1, 2, 3, 4, 5]) {
      const run = planGardenRun(learning({}, 33, planned), definition, stage);
      const skills = run.map((r) => r.skillId);
      expect(new Set(skills).size).toBe(6);
    }
  });

  it('is deterministic for a seed', () => {
    const a = planGardenRun(learning({}, 33), definition, 4);
    const b = planGardenRun(learning({}, 33), definition, 4);
    expect(a).toEqual(b);
  });

  it('every number a child sees is at most 100', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      const run = planGardenRun(learning({}), definition, stage);
      for (const r of run) {
        for (const n of r.item.work) expect(n).toBeLessThanOrEqual(100);
        for (const step of r.item.steps) {
          if (step.kind === 'number') expect(step.answer).toBeLessThanOrEqual(100);
        }
      }
    }
  });

  it('the level definition has 5 stages and the plan covers all of them', () => {
    expect(garden.stages).toBe(5);
    for (let stage = 1; stage <= garden.stages; stage++) {
      const subset = GARDEN_STAGE_SKILLS[stage] ?? [];
      expect(subset.length).toBeGreaterThanOrEqual(6);
      for (const kind of ['pattern', 'balance', 'bag'] as const) {
        expect(subset.filter((s) => gardenKindOf(s) === kind).length).toBeGreaterThanOrEqual(2);
      }
    }
    expect(stageTierFloor(1)).toBeUndefined();
    expect(stageTierFloor(3)).toBeUndefined();
    expect(stageTierFloor(5)).toBeUndefined();
  });
});
