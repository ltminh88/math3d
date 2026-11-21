import { describe, expect, it } from 'vitest';
import {
  isSkillId,
  lessonLabel,
  SKILL_CATALOG,
  SKILL_ID_PATTERN_SOURCE,
  skillsOfFamily,
} from './skill-catalog';

// Frozen copy of the shipped ids, in order: the catalog is append-only (save codes, SQL check).
const SHIPPED_IDS = [
  'wp-times-then-add',
  'wp-divide-then-add',
  'wp-more-less-then-total',
  'wp-unit-then-times',
  'wp-times-compare',
  'div-rem-floor',
  'div-rem-ceil',
  'unknown-add-sub',
  'unknown-mul-div',
  'pattern-add',
  'pattern-sub',
  'pattern-skip-count',
  'expr-order',
  'expr-brackets',
  'expr-from-story',
  'choose-all-correct',
  'tf-explain',
  'wp-difference-compare',
  'geo-midpoint',
  'geo-circle-parts',
  'geo-radius-diameter',
  'geo-right-angle',
  'geo-count-right-angles',
  'geo-shape-classify',
  'geo-shape-count',
  'geo-solid-identify',
  'geo-solid-parts',
  'meas-ruler-read',
  'meas-mm-convert',
  'meas-gram',
  'meas-ml',
  'meas-temperature',
  'meas-perimeter-polygon',
  'meas-perimeter-rect',
  'meas-perimeter-square',
  'meas-area-count',
  'meas-area-rect',
  'meas-area-square',
  'meas-wp-fence',
];

describe('skill catalog', () => {
  it('only appends: the shipped ids keep their order and spelling', () => {
    expect(SKILL_CATALOG.slice(0, SHIPPED_IDS.length).map((s) => s.id)).toEqual(SHIPPED_IDS);
  });

  it('ids are unique, match the key grammar and carry a family and structured KNTT lessons', () => {
    const pattern = new RegExp(`^${SKILL_ID_PATTERN_SOURCE}$`);
    expect(new Set(SKILL_CATALOG.map((s) => s.id)).size).toBe(SKILL_CATALOG.length);
    for (const s of SKILL_CATALOG) {
      expect(pattern.test(s.id), s.id).toBe(true);
      expect(s.lessons.length, s.id).toBeGreaterThan(0);
      for (const ref of s.lessons) {
        expect([1, 2], s.id).toContain(ref.book);
        expect(ref.n.length, s.id).toBeGreaterThan(0);
        for (const n of ref.n) {
          expect(Number.isInteger(n), s.id).toBe(true);
          expect(n, s.id).toBeGreaterThanOrEqual(1);
          expect(n, s.id).toBeLessThanOrEqual(81);
          if (ref.book === 1) expect(n, s.id).toBeLessThanOrEqual(44);
          else expect(n, s.id).toBeGreaterThanOrEqual(45);
        }
      }
      // The display string is derived from the structured lessons, never stored twice.
      expect(s.lesson, s.id).toBe(lessonLabel(s.lessons));
    }
  });

  it('derives the lesson label from structured lessons (ranges compressed)', () => {
    expect(lessonLabel([{ book: 1, n: [24, 28] }])).toBe('T1 B24, B28');
    expect(lessonLabel([{ book: 1, n: [4, 5, 6, 7, 8, 9, 10, 11, 12] }])).toBe('T1 B4-B12');
    expect(lessonLabel([{ book: 1, n: [25, 38, 39] }])).toBe('T1 B25, B38, B39');
    expect(lessonLabel([{ book: 2, n: [50, 53] }])).toBe('T2 B50, B53');
    expect(lessonLabel([{ book: 1, n: [8] }])).toBe('T1 B8');
  });

  it('accepts only catalog ids', () => {
    expect(isSkillId('expr-brackets')).toBe(true);
    for (const bad of ['', 'expr-bracket', 'Expr-brackets', 'a', '1abc', `a${'b'.repeat(39)}`])
      expect(isSkillId(bad), bad).toBe(false);
  });

  it('groups skills by family', () => {
    expect(skillsOfFamily('remainder')).toEqual(['div-rem-floor', 'div-rem-ceil']);
    expect(skillsOfFamily('geometry')).toHaveLength(9);
    expect(skillsOfFamily('measurement')).toHaveLength(12);
  });

  it('the four remaining new families exist but have no skills yet (phase 02 scaffolding)', () => {
    for (const family of ['number', 'arithmetic', 'money', 'data'] as const)
      expect(skillsOfFamily(family)).toEqual([]);
    // Fraction landed in phase 12 (B14): its six skills are in the catalog.
    expect(skillsOfFamily('fraction')).toEqual([
      'fraction-read',
      'fraction-shaded',
      'fraction-pick-picture',
      'fraction-of-set-circle',
      'fraction-of-set-number',
      'fraction-wp',
    ]);
    // Time landed in phase 13 (B66, B47): its ten skills are in the catalog.
    expect(skillsOfFamily('time')).toEqual([
      'clock-read-hour-half',
      'clock-read-5min',
      'clock-read-minute',
      'clock-sang-chieu-24h',
      'clock-elapsed-minutes',
      'times-order-digital',
      'roman-clock-hour',
      'months-days-count',
      'calendar-weekday',
      'calendar-days-between',
    ]);
  });
});
