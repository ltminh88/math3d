import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import {
  arrangeNoRepeat,
  buildCaveChambers,
  CAVE_SKILLS,
  type CaveFormat,
  caveFormatOf,
  caveSkillPool,
  planCaveSkills,
  REQUIRED_FORMATS,
} from './cave-chamber-formats';

const stat = (box: number): FactStat =>
  ({ box, attempts: 3, correct: 2, lastSeenSession: 1 }) as unknown as FactStat;

const formatsOf = (ids: readonly string[]): CaveFormat[] => ids.map(caveFormatOf);

describe('cave chamber formats', () => {
  it('covers the reasoning pool plus the four geometry/measurement word problems', () => {
    expect(CAVE_SKILLS).toEqual(
      expect.arrayContaining([
        'wp-times-then-add',
        'div-rem-ceil',
        'choose-all-correct',
        'tf-explain',
        'expr-brackets',
        'meas-wp-fence',
        'meas-perimeter-rect',
        'meas-area-rect',
        'geo-radius-diameter',
      ]),
    );
    expect(caveSkillPool().every((k) => k.startsWith('sk:'))).toBe(true);
    expect(caveFormatOf('wp-difference-compare')).toBe('word');
    expect(caveFormatOf('div-rem-floor')).toBe('remainder');
    expect(caveFormatOf('expr-from-story')).toBe('expression');
    expect(caveFormatOf('geo-radius-diameter')).toBe('geo-meas');
  });

  it('plans 7 distinct chambers with the required mix and no format twice in a row', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const ids = planCaveSkills([], {}, mulberry32(seed), 7);
      expect(ids).toHaveLength(7);
      expect(new Set(ids).size).toBe(7);
      const formats = formatsOf(ids);
      for (const required of REQUIRED_FORMATS) expect(formats).toContain(required);
      for (let i = 1; i < formats.length; i++) expect(formats[i]).not.toBe(formats[i - 1]);
    }
  });

  it('puts the weakest skill first and keeps the planner’s weak picks', () => {
    const stats: Record<string, FactStat> = {};
    for (const id of CAVE_SKILLS) stats[`sk:${id}`] = stat(4);
    stats['sk:div-rem-ceil'] = stat(1);
    stats['sk:expr-order'] = stat(2);
    const ids = planCaveSkills(['sk:expr-order'], stats, mulberry32(3), 7);
    expect(ids[0]).toBe('div-rem-ceil');
    expect(ids).toContain('expr-order');
    expect(ids.indexOf('expr-order')).toBeLessThan(3);
  });

  it('rearranges a run of one format without losing anything', () => {
    const ids = ['wp-times-then-add', 'wp-unit-then-times', 'div-rem-floor'];
    expect(formatsOf(arrangeNoRepeat(ids))).toEqual(['word', 'remainder', 'word']);
    expect(arrangeNoRepeat(ids).sort()).toEqual([...ids].sort());
  });

  it('builds playable chambers at the tier of each skill’s box (numbers ≤ 100)', () => {
    const stats = { 'sk:tf-explain': stat(5) };
    const chambers = buildCaveChambers(CAVE_SKILLS, stats, mulberry32(9));
    for (const c of chambers) {
      expect(c.steps.length).toBeGreaterThan(0);
      for (const n of c.item.work) expect(n).toBeLessThanOrEqual(100);
    }
    const tf = chambers.find((c) => c.skillId === 'tf-explain');
    expect(tf?.item.tier).toBe(3);
    expect(chambers.find((c) => c.skillId === 'geo-radius-diameter')?.family).toBe('geometry');
    expect(chambers.find((c) => c.skillId === 'meas-area-rect')?.family).toBe('measurement');
  });
});
