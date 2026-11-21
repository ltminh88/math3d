// Calendar generators: exact answers from the story params and the scene's raw data,
// unique options, numbers <= 100, deterministic.
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { daysInMonth, firstWeekday, weekdayOf } from './calendar-math';
import { TIME_SKILLS, timeItemForSkill } from './time-item-for-skill';
import type { TimeItem } from './time-scene-types';
import { calendarOf, lastValue, stepValue } from './time-test-oracles';
import { sweepItem } from './time-test-sweep';

const p = (i: TimeItem, k: string) => Number(i.story.params?.[k]);

/** Independent answers per skill, from the story params and the scene's raw data. */
const ORACLE: Record<string, (i: TimeItem, tier: SkillTier) => void> = {
  'months-days-count': (i) => {
    expect(i.scene).toBeUndefined();
    expect(lastValue(i)).toBe(daysInMonth(p(i, 'y'), p(i, 'm')));
  },
  'calendar-weekday': (i, tier) => {
    const s = calendarOf(i);
    const y = p(i, 'y');
    const m = p(i, 'm');
    const d = Number(i.steps[0]?.prompt.params?.d);
    expect(s.year).toBe(y);
    expect(s.month).toBe(m);
    expect(s.firstWeekday).toBe(firstWeekday(y, m));
    expect(d).toBeLessThanOrEqual(daysInMonth(y, m));
    if (tier === 1) expect(d).toBeLessThanOrEqual(7);
    if (tier === 3) expect(d).toBeGreaterThanOrEqual(21);
    expect(stepValue(i.steps[0])).toBe(weekdayOf(y, m, d));
  },
  'calendar-days-between': (i) => {
    const s = calendarOf(i);
    const y = p(i, 'y');
    const m = p(i, 'm');
    const d1 = Number(i.steps[0]?.prompt.params?.d1);
    const d2 = Number(i.steps[0]?.prompt.params?.d2);
    expect(s.year).toBe(y);
    expect(s.month).toBe(m);
    expect(d1).toBeGreaterThanOrEqual(1);
    expect(d2).toBeLessThanOrEqual(daysInMonth(y, m));
    expect(d2).toBeGreaterThan(d1);
    expect(lastValue(i)).toBe(d2 - d1);
  },
};

const CALENDAR_SKILLS = ['months-days-count', 'calendar-weekday', 'calendar-days-between'] as const;

describe('time generators (calendar skills)', () => {
  it('all calendar skills are wired', () => {
    for (const id of CALENDAR_SKILLS) expect(TIME_SKILLS).toContain(id);
  });

  for (const skillId of CALENDAR_SKILLS)
    it(`${skillId}: exact answers, unique options, numbers <= 100, deterministic`, () => {
      for (const tier of [1, 2, 3] as SkillTier[])
        for (let seed = 0; seed < 1000; seed++) {
          const item = timeItemForSkill(skillId, mulberry32(seed), tier);
          sweepItem(item, skillId, tier, seed);
          const oracle = ORACLE[skillId];
          expect(oracle, `oracle for ${skillId}`).toBeDefined();
          oracle?.(item, tier);
          if (seed < 20) expect(timeItemForSkill(skillId, mulberry32(seed), tier)).toEqual(item);
        }
    });
});
