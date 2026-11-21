// Lesson coverage (phase 02): every practicable lesson passes while the family phases land
// one by one. A lesson passes when ≥1 of its skills already has a generator, or when all its
// skills belong to families whose GENERATORS record is still empty (the escape hatch —
// derived from code, not a list). Phase 21 removes the hatch: then every practicable lesson
// needs ≥1 generated skill.
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

/** True when the family has not generated any skill yet (the escape hatch). */
function familyHasNoGenerator(family: SkillFamily): boolean {
  return GENERATORS_BY_FAMILY[family].length === 0;
}

/**
 * A practicable lesson passes when ≥1 skill has a generator, or all its skills sit in
 * families with no generator yet. A lesson with no skills at all passes vacuously — its
 * family phase has not landed and there is nothing to check yet.
 */
function lessonPasses(keys: readonly FactKey[]): boolean {
  if (keys.some(hasGenerator)) return true;
  return keys.every((key) => {
    const family = key.startsWith('sk:') ? skillEntry(key.slice(3))?.family : undefined;
    return family !== undefined && familyHasNoGenerator(family);
  });
}

describe('lesson coverage (phase 02 escape hatch)', () => {
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

  it('the four remaining new families have no generator yet; fraction, time and the legacy families do', () => {
    for (const family of ['number', 'arithmetic', 'money', 'data'] as const)
      expect(familyHasNoGenerator(family)).toBe(true);
    for (const family of ['word-problem', 'geometry', 'measurement', 'fraction', 'time'] as const)
      expect(familyHasNoGenerator(family)).toBe(false);
  });

  it('a lesson with no skills passes vacuously (its family phase has not landed)', () => {
    expect(lessonPasses([])).toBe(true);
    expect(lessonPasses(skillsOfLesson(1))).toBe(true); // B1: no skills yet
  });
});
