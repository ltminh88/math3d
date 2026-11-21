// Clock generators: exact answers from the scene's raw data, unique options, numbers
// <= 100, deterministic. Oracles are keyed by skill (the story key alone cannot tell
// clock-read-hour-half from clock-read-minute, or roman T1 from T3).
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import type { SkillTier } from '../learning/skill-tiers';
import { TIME_SKILLS, timeItemForSkill } from './time-item-for-skill';
import type { TimeItem } from './time-scene-types';
import { clockOf, correctSequence, faceMinutes, lastValue, stepValue } from './time-test-oracles';
import { sweepItem } from './time-test-sweep';

/** Independent answers per skill, from the story params and the scene's raw data. */
const ORACLE: Record<string, (i: TimeItem, tier: SkillTier) => void> = {
  'clock-read-hour-half': (i, tier) => {
    const s = clockOf(i);
    expect([0, 30]).toContain(s.m);
    expect(stepValue(i.steps[0])).toBe(faceMinutes(s.h, s.m));
    void tier;
  },
  'clock-read-5min': (i) => {
    const s = clockOf(i);
    expect(s.m % 5).toBe(0);
    expect(stepValue(i.steps[0])).toBe(faceMinutes(s.h, s.m));
  },
  'clock-read-minute': (i, tier) => {
    const s = clockOf(i);
    if (tier === 1) expect(s.m % 5).toBe(0);
    expect(stepValue(i.steps[0])).toBe(faceMinutes(s.h, s.m));
  },
  'clock-sang-chieu-24h': (i) => {
    const s = clockOf(i);
    const morning = i.story.key === 'sangChieuStoryMorning';
    const expected = (morning ? s.h : s.h + 12) * 60 + s.m;
    expect(stepValue(i.steps[0])).toBe(expected);
  },
  'clock-elapsed-minutes': (i) => {
    const s = clockOf(i);
    const start = faceMinutes(s.h, s.m);
    const endRaw = faceMinutes(s.endH ?? 1, s.endM ?? 0);
    const end = endRaw <= start ? endRaw + 720 : endRaw;
    expect((end - start) % 5).toBe(0);
    expect(lastValue(i)).toBe(end - start);
  },
  'times-order-digital': (i) => {
    expect(i.scene).toBeUndefined();
    const raw = (k: string) => String(i.story.params?.[k]);
    const storyMin = [raw('a'), raw('b'), raw('c')].map((t) => {
      const [h, m] = t.split(':');
      return Number(h) * 60 + Number(m);
    });
    const seq = correctSequence(i);
    expect([...seq].sort((x, y) => x - y)).toEqual(seq);
    expect([...storyMin].sort((x, y) => x - y)).toEqual(seq);
  },
  'roman-clock-hour': (i, tier) => {
    const s = clockOf(i);
    expect(s.roman).toBe(true);
    expect(s.m).toBe(0);
    if (tier === 3) {
      expect(i.story.key).toBe('roman24Story');
      expect(stepValue(i.steps[0])).toBe((s.h + 12) * 60);
      // Brian 2026-11-21: every option is an even hour — no 17:59/18:01 minute misses.
      const step = i.steps[0];
      if (step?.kind === 'choice')
        for (const o of step.options) expect(Number(o.label.params?.mm)).toBe(0);
    } else {
      expect(stepValue(i.steps[0])).toBe(s.h);
    }
  },
};

const CLOCK_SKILLS = [
  'clock-read-hour-half',
  'clock-read-5min',
  'clock-read-minute',
  'clock-sang-chieu-24h',
  'clock-elapsed-minutes',
  'times-order-digital',
  'roman-clock-hour',
] as const;

describe('time generators (clock skills)', () => {
  it('all clock skills are wired', () => {
    for (const id of CLOCK_SKILLS) expect(TIME_SKILLS).toContain(id);
  });

  for (const skillId of CLOCK_SKILLS)
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
