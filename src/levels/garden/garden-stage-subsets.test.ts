// Garden stage subsets (phase 07): stages 2-4 drill seven skills each (two rounds per kind,
// never a repeat); stage 5 drills all eight skills, weakest first.
import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import type { LevelDefinition, LevelLearning } from '../shared/level-types';
import {
  GARDEN_SKILLS,
  GARDEN_STAGE_SKILLS,
  gardenKindOf,
  planGardenRun,
  stageTierFloor,
} from './garden-round-plan';

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

const skillsOf = (stage: number, stats: Record<string, FactStat> = {}, seed = 33) =>
  planGardenRun(learning(stats, seed), definition, stage).map((r) => r.skillId);

/** Stage → its seven skills (stage 2: tier-2 floor; stage 3: brackets + stories, no floor). */
const SUBSETS: Readonly<Record<number, readonly string[]>> = {
  2: [
    'pattern-add',
    'pattern-sub',
    'pattern-skip-count',
    'unknown-add-sub',
    'unknown-mul-div',
    'expr-order',
    'expr-brackets',
  ],
  3: [
    'expr-order',
    'expr-brackets',
    'expr-from-story',
    'pattern-add',
    'pattern-sub',
    'unknown-add-sub',
    'unknown-mul-div',
  ],
  4: [
    'pattern-add',
    'pattern-sub',
    'pattern-skip-count',
    'unknown-add-sub',
    'unknown-mul-div',
    'expr-brackets',
    'expr-from-story',
  ],
};

describe('stage subsets', () => {
  it('stage 2 drills seven skills with a tier-2 floor, two rounds per kind', () => {
    expect(GARDEN_STAGE_SKILLS[2]).toEqual(SUBSETS[2]);
    expect(stageTierFloor(2)).toBe(2);
    const skills = skillsOf(2);
    expect(skills).toHaveLength(6);
    expect(new Set(skills).size).toBe(6);
    for (const s of skills) expect(SUBSETS[2]).toContain(s);
    for (const kind of ['pattern', 'balance', 'bag'] as const) {
      expect(skills.filter((s) => gardenKindOf(s) === kind)).toHaveLength(2);
    }
  });

  it('stage 3 drills brackets and stories (all three bag skills), no floor', () => {
    expect(GARDEN_STAGE_SKILLS[3]).toEqual(SUBSETS[3]);
    expect(stageTierFloor(3)).toBeUndefined();
    const skills = skillsOf(3);
    expect(skills).toHaveLength(6);
    expect(new Set(skills).size).toBe(6);
    for (const s of skills) expect(SUBSETS[3]).toContain(s);
    expect(skills).toContain('expr-brackets');
  });

  it('stage 4 drills seven skills with a tier-3 floor', () => {
    expect(GARDEN_STAGE_SKILLS[4]).toEqual(SUBSETS[4]);
    expect(stageTierFloor(4)).toBe(3);
    const skills = skillsOf(4);
    expect(skills).toHaveLength(6);
    expect(new Set(skills).size).toBe(6);
    for (const s of skills) expect(SUBSETS[4]).toContain(s);
  });

  it('stage 5 drills all eight skills, weakest first', () => {
    expect(stageTierFloor(5)).toBeUndefined();
    expect(GARDEN_STAGE_SKILLS[5]).toEqual(GARDEN_SKILLS);
    // Strongest first in the plan, weakest first out: box 4 skills never play.
    const stats: Record<string, FactStat> = {
      'sk:pattern-add': boxed(1),
      'sk:pattern-sub': boxed(4),
      'sk:pattern-skip-count': boxed(2),
      'sk:unknown-add-sub': boxed(1),
      'sk:unknown-mul-div': boxed(3),
      'sk:expr-order': boxed(4),
      'sk:expr-brackets': boxed(1),
      'sk:expr-from-story': boxed(2),
    };
    const planned = [
      'sk:expr-order',
      'sk:pattern-sub',
      'sk:unknown-mul-div',
      'sk:pattern-skip-count',
      'sk:expr-from-story',
      'sk:pattern-add',
      'sk:unknown-add-sub',
      'sk:expr-brackets',
    ];
    const skills = planGardenRun(learning(stats, 33, planned), definition, 5).map((r) => r.skillId);
    expect([...skills].sort()).toEqual(
      [
        'pattern-add',
        'pattern-skip-count',
        'unknown-add-sub',
        'unknown-mul-div',
        'expr-brackets',
        'expr-from-story',
      ].sort(),
    );
  });
});
