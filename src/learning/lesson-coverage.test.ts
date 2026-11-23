// Lesson coverage (phase 21, strict): every practicable lesson passes — ≥1 of its
// skills already has a generator. The phase-02 escape hatch (a lesson passed when
// all its skills sat in families with no generator yet, or when it had no skills
// at all) is gone: all families generate now, and all 81 lessons are practicable.
import { describe, expect, it } from 'vitest';
import { ARITHMETIC_SKILLS } from '../arithmetic/arithmetic-item-for-skill';
import { DATA_SKILLS } from '../data/data-item-for-skill';
import { FRACTION_SKILLS } from '../fractions/fraction-item-for-skill';
import { GEOMETRY_SKILLS } from '../geometry/geometry-item-for-skill';
import { MEASUREMENT_SKILLS } from '../measurement/measurement-item-for-skill';
import { MONEY_SKILLS } from '../money/money-item-for-skill';
import { NUMBER_SKILLS } from '../numbers/number-item-for-skill';
import { REASONING_SKILLS } from '../reasoning/reasoning-item-for-skill';
import { TIME_SKILLS } from '../time/time-item-for-skill';
import type { FactKey } from './fact-key';
import { ALL_LESSONS, skillsOfLesson } from './kntt-lesson-index';
import { type SkillFamily, skillEntry } from './skill-catalog';

/** The reasoning module generates six legacy families; take the ids of one family. */
const byFamily = (family: SkillFamily, ids: readonly string[]): readonly string[] =>
  ids.filter((id) => skillEntry(id)?.family === family);

/** Skill ids with a generator, per family (empty = the family phase has not landed). */
const GENERATORS_BY_FAMILY: Readonly<Record<SkillFamily, readonly string[]>> = {
  'word-problem': byFamily('word-problem', REASONING_SKILLS),
  remainder: byFamily('remainder', REASONING_SKILLS),
  unknown: byFamily('unknown', REASONING_SKILLS),
  pattern: byFamily('pattern', REASONING_SKILLS),
  expression: byFamily('expression', REASONING_SKILLS),
  logic: byFamily('logic', REASONING_SKILLS),
  geometry: GEOMETRY_SKILLS,
  measurement: MEASUREMENT_SKILLS,
  number: NUMBER_SKILLS,
  arithmetic: ARITHMETIC_SKILLS,
  fraction: FRACTION_SKILLS,
  time: TIME_SKILLS,
  money: MONEY_SKILLS,
  data: DATA_SKILLS,
};

/**
 * True when the fact key already has a generator: table facts always do (the fact pools
 * exist); a skill does when its family generated it.
 */
function hasGenerator(key: FactKey): boolean {
  if (key.startsWith('mul:') || key.startsWith('div:')) return true;
  const family = skillEntry(key.slice(3))?.family;
  return family !== undefined && GENERATORS_BY_FAMILY[family].includes(key.slice(3));
}

/** True when the family has not generated any skill yet (kept for the test below). */
function familyHasNoGenerator(family: SkillFamily): boolean {
  return GENERATORS_BY_FAMILY[family].length === 0;
}

/**
 * A practicable lesson passes when ≥1 skill has a generator. No escape hatch: a
 * lesson with no skills at all does not pass.
 */
function lessonPasses(keys: readonly FactKey[]): boolean {
  return keys.some(hasGenerator);
}

describe('lesson coverage (phase 21 strict)', () => {
  it('every practicable lesson passes', () => {
    for (const lesson of ALL_LESSONS.filter((l) => l.practicable)) {
      expect(lessonPasses(skillsOfLesson(lesson.n)), `B${lesson.n}`).toBe(true);
    }
  });

  it('table facts and generated skills have a generator; unknown ids do not', () => {
    expect(hasGenerator('mul:2x3')).toBe(true);
    expect(hasGenerator('div:10/2')).toBe(true);
    expect(hasGenerator('sk:div-rem-floor')).toBe(true);
    expect(hasGenerator('sk:geo-midpoint')).toBe(true);
    expect(hasGenerator('sk:not-a-skill')).toBe(false);
  });

  it('no new family is left without a generator (arithmetic landed in phase 09)', () => {
    for (const family of [
      'word-problem',
      'geometry',
      'measurement',
      'number',
      'arithmetic',
      'fraction',
      'time',
      'money',
      'data',
    ] as const)
      expect(familyHasNoGenerator(family)).toBe(false);
  });

  it('a lesson with no skills does not pass (no escape hatch)', () => {
    expect(lessonPasses([])).toBe(false);
    expect(lessonPasses(skillsOfLesson(1))).toBe(true); // B1: six skills, all generated (phase 07)
    expect(lessonPasses(skillsOfLesson(7))).toBe(true); // B7: four review skills (phase 21)
  });
});
