// Cave stage plan (phase 10): stage 1 is today's run (parity, not an assumption); later stages
// are emphases over the skills the child has already attempted — the cave never introduces a
// skill the child has not met in its home level or a reasoning round. Tiers always come from
// the Leitner box, never from the stage number. The logic emphasis of stage 3 is bounded by
// the pool: choose-all and tf-explain have one skill each, so both logic skills are present
// (as in every run) with word problems as the second reasoning format.
import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  buildCaveChambers,
  CAVE_SKILLS,
  type CaveFormat,
  caveFormatOf,
  planCaveSkills,
  REQUIRED_FORMATS,
} from './cave-chamber-formats';
import cave from './index';
import { CAVE_STAGE_TARGETS, planCaveRun, planCaveStageSkills, stagePool } from './cave-stage-plan';

const PLANNED = [
  'sk:wp-times-then-add',
  'sk:div-rem-floor',
  'sk:choose-all-correct',
  'sk:tf-explain',
  'sk:expr-order',
  'sk:meas-wp-fence',
  'sk:geo-radius-diameter',
];
const definition = {
  tables: [2, 3, 4, 5, 6, 7, 8, 9],
  rounds: 7,
} as unknown as LevelDefinition;
const stat = (box: number, attempts = 3): FactStat =>
  ({ box, attempts, correct: 2, lastSeenSession: 1 }) as unknown as FactStat;

function learning(
  stats: Record<string, FactStat>,
  planned: readonly string[] = PLANNED,
  seed = 33,
): LevelLearning {
  return {
    stats: () => stats,
    sessionNo: 5,
    planSession: () => [...planned],
    record: () => {},
    rng: mulberry32(seed),
  } as unknown as LevelLearning;
}

const formatsOf = (ids: readonly string[]): CaveFormat[] => ids.map(caveFormatOf);
const countFormat = (ids: readonly string[], format: CaveFormat): number =>
  formatsOf(ids).filter((f) => f === format).length;
const skillIds = (run: { chambers: readonly { skillId: string }[] }): string[] =>
  run.chambers.map((c) => c.skillId);

/** Every cave skill attempted, weakest word problems first (deterministic order). */
const richStats = (): Record<string, FactStat> => {
  const stats: Record<string, FactStat> = {};
  for (const id of CAVE_SKILLS) {
    const format = caveFormatOf(id);
    stats[`sk:${id}`] = stat(format === 'word' ? 1 : format === 'expression' ? 4 : format === 'choose-all' || format === 'tf-explain' ? 3 : 2);
  }
  return stats;
};

describe('planCaveRun stage 1 (parity with today)', () => {
  it('fresh profile: the original seven chambers, same order and items', () => {
    const run = planCaveRun(learning({}), definition, 1);
    const rng = mulberry32(33);
    const ids = planCaveSkills(PLANNED, {}, rng, 7);
    expect(run.chambers).toEqual(buildCaveChambers(ids, {}, rng));
    expect(run.total).toBe(7);
  });

  it('known profile: the same chambers as the direct planner call', () => {
    const stats = Object.fromEntries(PLANNED.map((k) => [k, stat(3, 2)]));
    const run = planCaveRun(learning(stats), definition, 1);
    const rng = mulberry32(33);
    const ids = planCaveSkills(PLANNED, stats, rng, 7);
    expect(run.chambers).toEqual(buildCaveChambers(ids, stats, rng));
    expect(run.total).toBe(7);
  });

  it('a short planner pool still plans 7 distinct chambers (the garden spill)', () => {
    const spilled = Array<string>(7).fill('sk:wp-times-then-add');
    const run = planCaveRun(learning({}, spilled), definition, 1);
    const ids = skillIds(run);
    expect(ids).toHaveLength(7);
    expect(new Set(ids).size).toBe(7);
    const formats = formatsOf(ids);
    for (const required of REQUIRED_FORMATS) expect(formats).toContain(required);
    for (let i = 1; i < formats.length; i++) expect(formats[i]).not.toBe(formats[i - 1]);
  });
});

describe('stage pool (never introduce an unseen skill)', () => {
  it('a fresh profile has an empty stage pool for stage 2', () => {
    expect(stagePool({}, 2)).toEqual([]);
    expect(stagePool({}, 5)).toEqual([]);
  });

  it('stage 1 keeps today’s pool: all 17 cave skills', () => {
    expect(stagePool({}, 1)).toEqual(CAVE_SKILLS);
    expect(stagePool({}, 1)).toHaveLength(17);
  });

  it('a stage-1 graduate’s stage 2 uses only the 7 skills stage 1 attempted', () => {
    const attempted = [
      'wp-times-then-add',
      'wp-divide-then-add',
      'div-rem-floor',
      'choose-all-correct',
      'tf-explain',
      'expr-order',
      'meas-wp-fence',
    ];
    const stats = Object.fromEntries(attempted.map((id) => [`sk:${id}`, stat(2)]));
    expect([...stagePool(stats, 2)].sort()).toEqual([...attempted].sort());
    const ids = planCaveStageSkills(stats, 7, 2);
    expect([...ids].sort()).toEqual([...attempted].sort());
    expect(countFormat(ids, 'word')).toBe(2);
  });

  it('a later stage forced on a fresh profile falls back to today’s plan', () => {
    const run = planCaveRun(learning({}), definition, 2);
    const ids = skillIds(run);
    expect(ids).toHaveLength(7);
    expect(new Set(ids).size).toBe(7);
    const formats = formatsOf(ids);
    for (const required of REQUIRED_FORMATS) expect(formats).toContain(required);
    for (let i = 1; i < formats.length; i++) expect(formats[i]).not.toBe(formats[i - 1]);
  });
});

describe('stage emphasis', () => {
  it('stage 2 drills two-step word problems: two word chambers', () => {
    const ids = planCaveStageSkills(richStats(), 7, 2);
    expect(ids).toHaveLength(7);
    expect(countFormat(ids, 'word')).toBe(2);
    expect(CAVE_STAGE_TARGETS[2]).toEqual({
      word: 2,
      remainder: 1,
      'choose-all': 1,
      'tf-explain': 1,
      'geo-meas': 1,
    });
  });

  it('stage 3 drills logic: both logic skills present, word second', () => {
    const ids = planCaveStageSkills(richStats(), 7, 3);
    expect(ids).toHaveLength(7);
    expect(ids).toContain('choose-all-correct');
    expect(ids).toContain('tf-explain');
    expect(countFormat(ids, 'word')).toBe(2);
    expect(CAVE_STAGE_TARGETS[3]).toEqual({
      'choose-all': 1,
      'tf-explain': 1,
      word: 2,
      remainder: 1,
      'geo-meas': 1,
    });
  });

  it('stage 4 drills geometry and measurement: two geo-meas chambers', () => {
    const ids = planCaveStageSkills(richStats(), 7, 4);
    expect(ids).toHaveLength(7);
    expect(countFormat(ids, 'geo-meas')).toBe(2);
    expect(CAVE_STAGE_TARGETS[4]).toEqual({
      'geo-meas': 2,
      word: 1,
      remainder: 1,
      'choose-all': 1,
      'tf-explain': 1,
    });
  });

  it('stage 5 is mastery over today’s mix: required formats, weakest skill first', () => {
    const stats = richStats();
    const ids = planCaveStageSkills(stats, 7, 5);
    expect(ids).toHaveLength(7);
    const formats = formatsOf(ids);
    for (const required of REQUIRED_FORMATS) expect(formats).toContain(required);
    // The weakest skill overall (a box-1 word problem) is in the run.
    expect(ids).toContain('wp-times-then-add');
    expect(CAVE_STAGE_TARGETS[5]).toEqual({
      word: 1,
      remainder: 1,
      'choose-all': 1,
      'tf-explain': 1,
      'geo-meas': 1,
    });
  });
});

describe('stage plan invariants', () => {
  it('no skill twice and no format twice in a row, every stage and seed', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      for (let seed = 1; seed <= 50; seed++) {
        const run = planCaveRun(learning(richStats(), PLANNED, seed), definition, stage);
        const ids = skillIds(run);
        expect(ids).toHaveLength(7);
        expect(new Set(ids).size).toBe(7);
        const formats = formatsOf(ids);
        for (let i = 1; i < formats.length; i++) expect(formats[i]).not.toBe(formats[i - 1]);
      }
    }
  });

  it('stages 2–5 never plan a skill the child has not attempted', () => {
    const attempted = [
      'wp-times-then-add',
      'wp-divide-then-add',
      'wp-more-less-then-total',
      'div-rem-floor',
      'div-rem-ceil',
      'choose-all-correct',
      'tf-explain',
      'expr-order',
      'meas-wp-fence',
      'geo-radius-diameter',
    ];
    const stats = Object.fromEntries(attempted.map((id) => [`sk:${id}`, stat(2)]));
    for (const stage of [2, 3, 4, 5]) {
      for (let seed = 1; seed <= 20; seed++) {
        const run = planCaveRun(learning(stats, PLANNED, seed), definition, stage);
        expect(skillIds(run)).toHaveLength(7);
        for (const id of skillIds(run)) expect(attempted).toContain(id);
      }
    }
  });

  it('is deterministic for a seed', () => {
    const a = planCaveRun(learning(richStats(), PLANNED, 33), definition, 4);
    const b = planCaveRun(learning(richStats(), PLANNED, 33), definition, 4);
    expect(a).toEqual(b);
  });

  it('tiers come from the Leitner box, never from the stage number', () => {
    const stats = {
      'sk:tf-explain': stat(5),
      'sk:wp-times-then-add': stat(1),
      'sk:div-rem-floor': stat(2),
      'sk:choose-all-correct': stat(2),
      'sk:meas-wp-fence': stat(2),
      'sk:expr-order': stat(2),
      'sk:geo-radius-diameter': stat(2),
    };
    const run = planCaveRun(learning(stats), definition, 4);
    const tf = run.chambers.find((c) => c.skillId === 'tf-explain');
    const word = run.chambers.find((c) => c.skillId === 'wp-times-then-add');
    expect(tf?.item.tier).toBe(3);
    expect(word?.item.tier).toBe(1);
  });

  it('every number a child sees is at most 100', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      const run = planCaveRun(learning(richStats(), PLANNED, 7), definition, stage);
      for (const c of run.chambers) {
        for (const n of c.item.work) expect(n).toBeLessThanOrEqual(100);
      }
    }
  });

  it('the level definition has 5 stages and the plan covers all of them', () => {
    expect(cave.stages).toBe(5);
    expect(Object.keys(CAVE_STAGE_TARGETS).map(Number).sort()).toEqual([2, 3, 4, 5]);
  });
});
