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
      // English skills follow no SGK lesson (lessons: []) — they live on the island.
      if (s.family !== 'english') expect(s.lessons.length, s.id).toBeGreaterThan(0);
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
    expect(skillsOfFamily('geometry')).toHaveLength(10);
    expect(skillsOfFamily('measurement')).toHaveLength(24);
  });

  it('every new family has skills now (arithmetic landed in phase 09)', () => {
    // Arithmetic landed in phase 09 (B2, B54-55, B63-64), grew in phase 10
    // (B23, B26, B36, B37) and in phase 11 (B56, B57, B70, B71): its
    // thirty-seven skills are in the catalog, in entries order.
    expect(skillsOfFamily('arithmetic')).toEqual([
      'add-sub-mental-round',
      'add-sub-1000',
      'add-sub-1000-wp',
      'add-sub-1000-chain',
      'add-4digit',
      'sub-4digit',
      'add-sub-10000-wp',
      'add-5digit',
      'sub-5digit',
      'add-sub-100000-wp',
      'add-sub-find-error',
      'add-missing-digit',
      'mul-2d-1d',
      'mul-tens-mental',
      'mul-2d-1d-wp',
      'div-2d-1d',
      'div-2d-1d-remainder',
      'div-tens-mental',
      'div-2d-1d-wp',
      'mul-3d-1d',
      'mul-hundreds-mental',
      'mul-3d-1d-wp',
      'div-3d-1d',
      'div-3d-1d-remainder',
      'div-hundreds-mental',
      'div-reduce-times',
      'mul-div-find-error',
      'mul-4d-1d',
      'mul-thousands-mental',
      'div-4d-1d',
      'div-4d-1d-remainder',
      'div-thousands-mental',
      'mul-5d-1d',
      'div-5d-1d',
      'div-5d-1d-remainder',
      'mul-div-large-wp',
      'mul-chain-operators',
    ]);
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
      'time-set-clock',
    ]);
    // Money landed in phase 14 (B68): its six skills are in the catalog.
    expect(skillsOfFamily('money')).toEqual([
      'money-recognize',
      'money-total-notes',
      'money-exchange',
      'money-change-back',
      'money-pick-notes',
      'money-wp',
    ]);
    // Data landed in phase 15 (B73, B74): its seven skills are in the catalog.
    expect(skillsOfFamily('data')).toEqual([
      'tally-count',
      'table-read',
      'table-max-min',
      'table-sums',
      'table-fill-missing',
      'chance-bag',
      'chance-dice',
    ]);
  });
});
