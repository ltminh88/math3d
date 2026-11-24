// Valley stage plan (phase 08): stage 1 is today's run (parity, not an assumption), later
// stages drill a subset with a tier floor; tiers still come from the Leitner box for
// ordering. S2 and S4 drill two skills over six rounds, so a skill must recur across the
// run: the plan alternates them, never twice in a row, each round a fresh seeded item.
import { describe, expect, it } from 'vitest';
import { geometryItemForSkill } from '../../geometry/geometry-item-for-skill';
import { allNumbers } from '../../geometry/geometry-test-oracles';
import { skillKey } from '../../learning/fact-key';
import type { FactStat } from '../../learning/learning-types';
import { newFactStat } from '../../learning/leitner-box';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import { planValleyRounds, VALLEY_KIND, type ValleyRoundSpec } from './valley-round-plan';
import {
  planValleyRun,
  stageSkills,
  stageTierFloor,
  VALLEY_CHOOSE_ALL_SKILLS_S4,
  VALLEY_COUNT_SKILLS_S2,
  VALLEY_ROTATED_SKILLS_S3,
} from './valley-stage-plan';

const SKILLS = [
  'geo-midpoint',
  'geo-midpoint-length',
  'geo-circle-parts',
  'geo-radius-diameter',
  'geo-right-angle',
  'geo-count-right-angles',
  'geo-shape-classify',
  'geo-shape-count',
  'geo-solid-identify',
  'geo-solid-parts',
];
const FACTS = SKILLS.map(skillKey);
const definition = { tables: [2, 3, 4, 5, 6, 7, 8, 9], rounds: 6 } as unknown as LevelDefinition;

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
const seen = (box = 3) => Object.fromEntries(SKILLS.map((s) => [skillKey(s), boxed(box)]));

const kindsOf = (rounds: readonly ValleyRoundSpec[]) =>
  rounds.map((r) => VALLEY_KIND[r.skillId] as string);

describe('planValleyRun stage 1 (parity with today)', () => {
  it('fresh profile: first three kinds only, identical specs to today', () => {
    const stats = {};
    expect(planValleyRun(learning(stats), definition, 1).rounds).toEqual(
      planValleyRounds(FACTS, stats, 6),
    );
    expect(
      kindsOf(planValleyRun(learning(stats), definition, 1).rounds).every((k) =>
        ['midpoint', 'circle', 'right-angle'].includes(k),
      ),
    ).toBe(true);
    expect(planValleyRun(learning(stats), definition, 1).rounds).toHaveLength(6);
  });

  it('returning profile: all five kinds, identical specs to today', () => {
    const stats = seen();
    expect(planValleyRun(learning(stats), definition, 1).rounds).toEqual(
      planValleyRounds(FACTS, stats, 6),
    );
  });

  it('an unknown stage plays stage 1', () => {
    expect(planValleyRun(learning({}), definition, 99).rounds).toEqual(
      planValleyRun(learning({}), definition, 1).rounds,
    );
  });
});

describe('stage subsets', () => {
  it('stage 2 drills only the counting skills', () => {
    const rounds = planValleyRun(learning(seen()), definition, 2).rounds;
    expect(rounds).toHaveLength(6);
    expect(rounds.every((r) => VALLEY_COUNT_SKILLS_S2.includes(r.skillId))).toBe(true);
    expect(new Set(rounds.map((r) => r.skillId))).toEqual(new Set(VALLEY_COUNT_SKILLS_S2));
  });

  it('stage 3 drills only the rotated-figure and solid-part skills', () => {
    const rounds = planValleyRun(learning(seen()), definition, 3).rounds;
    expect(rounds).toHaveLength(6);
    expect(rounds.every((r) => VALLEY_ROTATED_SKILLS_S3.includes(r.skillId))).toBe(true);
  });

  it('stage 4 drills only the choose-all skills', () => {
    const rounds = planValleyRun(learning(seen()), definition, 4).rounds;
    expect(rounds).toHaveLength(6);
    expect(rounds.every((r) => VALLEY_CHOOSE_ALL_SKILLS_S4.includes(r.skillId))).toBe(true);
  });

  it('stage 5 drills the whole pool, weakest first', () => {
    const rounds = planValleyRun(learning(seen()), definition, 5).rounds;
    expect(rounds).toHaveLength(6);
    expect(rounds.every((r) => stageSkills(5).includes(r.skillId))).toBe(true);
  });
});

describe('tier floors', () => {
  it('stages 3 and 4 lift a box-1 child to tier 2; stage 2 does not', () => {
    const fresh = {};
    expect(stageTierFloor(3)).toBe(2);
    expect(stageTierFloor(4)).toBe(2);
    expect(stageTierFloor(2)).toBe(1);
    for (const stage of [3, 4]) {
      expect(
        planValleyRun(learning(fresh), definition, stage).rounds.every((r) => r.tier >= 2),
      ).toBe(true);
    }
    expect(planValleyRun(learning(fresh), definition, 2).rounds.every((r) => r.tier === 1)).toBe(
      true,
    );
  });

  it('a box-5 skill stays tier 3 in every stage (the floor never lowers a tier)', () => {
    const stats = seen(5);
    for (const stage of [1, 2, 3, 4, 5]) {
      expect(
        planValleyRun(learning(stats), definition, stage).rounds.every((r) => r.tier === 3),
      ).toBe(true);
    }
  });
});

describe('no-repeat inside a run', () => {
  it('no skill twice in a row, in any stage, for several seeds', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      for (const seed of [1, 2, 3, 4, 5]) {
        const rounds = planValleyRun(learning(seen(), seed), definition, stage).rounds;
        for (let i = 1; i < rounds.length; i++) {
          expect(rounds[i]?.skillId).not.toBe(rounds[i - 1]?.skillId);
        }
      }
    }
  });

  it('no kind twice in a row where avoidable (stages 2, 3, 5)', () => {
    for (const stage of [2, 3, 5]) {
      for (const seed of [1, 2, 3, 4, 5]) {
        const kinds = kindsOf(planValleyRun(learning(seen(), seed), definition, stage).rounds);
        for (let i = 1; i < kinds.length; i++) {
          expect(kinds[i]).not.toBe(kinds[i - 1]);
        }
      }
    }
  });

  it('stage 4 is a single kind (classify), so kind rotation is not avoidable there', () => {
    for (const seed of [1, 2, 3]) {
      expect(kindsOf(planValleyRun(learning(seen(), seed), definition, 4).rounds)).toEqual([
        'classify',
        'classify',
        'classify',
        'classify',
        'classify',
        'classify',
      ]);
    }
  });
});

describe('stage 4 choose-all', () => {
  it('classify rounds are multi-select at the tier floor; count rounds are number answers', () => {
    const rounds = planValleyRun(learning({}), definition, 4).rounds;
    const rng = mulberry32(7);
    for (const spec of rounds) {
      const item = geometryItemForSkill(spec.skillId, rng, spec.tier);
      const step = item.steps[0];
      if (spec.skillId === 'geo-shape-classify') {
        expect(step?.kind).toBe('multi');
        if (step?.kind === 'multi') {
          expect(step.options.length).toBeGreaterThanOrEqual(2);
          expect(step.options.length).toBeLessThanOrEqual(6);
          expect(step.options.some((o) => o.correct)).toBe(true);
        }
      } else {
        expect(step?.kind).toBe('number');
      }
    }
  });
});

describe('every number a child sees is at most 100', () => {
  it('all stages, several seeds', () => {
    for (const stage of [1, 2, 3, 4, 5]) {
      for (const seed of [1, 2, 3]) {
        const rounds = planValleyRun(learning(seen(), seed), definition, stage).rounds;
        const rng = mulberry32(seed);
        for (const spec of rounds) {
          const item = geometryItemForSkill(spec.skillId, rng, spec.tier);
          for (const n of allNumbers(item)) {
            expect(n).toBeGreaterThanOrEqual(0);
            expect(n).toBeLessThanOrEqual(100);
          }
        }
      }
    }
  });
});
