import { describe, expect, it } from 'vitest';
import { ALL_LESSONS, lessonByNumber, skillsOfLesson, topicsInOrder } from './kntt-lesson-index';
import { SKILL_CATALOG } from './skill-catalog';

describe('KNTT lesson table', () => {
  it('has 81 rows, n = 1..81 contiguous', () => {
    expect(ALL_LESSONS).toHaveLength(81);
    expect(ALL_LESSONS.map((l) => l.n)).toEqual(Array.from({ length: 81 }, (_, i) => i + 1));
  });

  it('splits 44 tap 1 / 37 tap 2', () => {
    expect(ALL_LESSONS.filter((l) => l.book === 1)).toHaveLength(44);
    expect(ALL_LESSONS.filter((l) => l.book === 2)).toHaveLength(37);
    expect(ALL_LESSONS.slice(0, 44).every((l) => l.book === 1)).toBe(true);
    expect(ALL_LESSONS.slice(44).every((l) => l.book === 2)).toBe(true);
  });

  it('topic ids are non-decreasing and cover 1..16', () => {
    const topics = ALL_LESSONS.map((l) => l.topic);
    topics.reduce((prev, t) => {
      expect(t).toBeGreaterThanOrEqual(prev);
      return t;
    });
    expect(new Set(topics).size).toBe(16);
  });

  it('titles are paraphrased short (vi <= 40 chars, en present)', () => {
    for (const l of ALL_LESSONS) {
      expect(l.titleVi.length, `B${l.n} titleVi`).toBeLessThanOrEqual(40);
      expect(l.titleVi.length, `B${l.n} titleVi`).toBeGreaterThan(0);
      expect(l.titleEn.length, `B${l.n} titleEn`).toBeGreaterThan(0);
    }
  });

  it('tables lessons carry tables, mix lessons carry mixOf, skills lessons carry neither', () => {
    for (const l of ALL_LESSONS) {
      if (l.kind === 'tables') {
        expect(l.tables?.length, `B${l.n}`).toBeGreaterThan(0);
        expect(l.mixOf, `B${l.n}`).toBeUndefined();
      } else if (l.kind === 'mix') {
        expect(l.mixOf, `B${l.n}`).toBeDefined();
        expect(l.tables, `B${l.n}`).toBeUndefined();
      } else {
        expect(l.tables, `B${l.n}`).toBeUndefined();
        expect(l.mixOf, `B${l.n}`).toBeUndefined();
      }
    }
  });

  it('every mixOf points to earlier lessons; only B7 mixes nothing', () => {
    for (const l of ALL_LESSONS) {
      for (const m of l.mixOf ?? []) expect(m, `B${l.n} mixOf ${m}`).toBeLessThan(l.n);
    }
    expect(
      ALL_LESSONS.filter((l) => l.kind === 'mix' && (l.mixOf?.length ?? 0) === 0).map((l) => l.n),
    ).toEqual([7]);
  });

  it('only B7 (grade-2 review) is not practicable', () => {
    expect(ALL_LESSONS.filter((l) => !l.practicable).map((l) => l.n)).toEqual([7]);
  });

  it('every legacy skill lesson exists in the table', () => {
    for (const s of SKILL_CATALOG) {
      for (const ref of s.lessons) {
        for (const n of ref.n) {
          const row = ALL_LESSONS.find((l) => l.n === n);
          expect(row, `${s.id} B${n}`).toBeDefined();
          expect(row?.book, `${s.id} B${n}`).toBe(ref.book);
        }
      }
    }
  });
});

describe('skillsOfLesson', () => {
  it('answers div-rem-floor for B25 (phase requirement)', () => {
    expect(skillsOfLesson(25)).toEqual([
      'sk:div-rem-floor',
      'sk:div-rem-ceil',
      'sk:choose-all-correct',
      'sk:tf-explain',
    ]);
  });

  it('returns table facts plus its own skills for B4', () => {
    const keys = skillsOfLesson(4);
    expect(keys).toHaveLength(36); // sk:pattern-skip-count + 35 facts (mul:2x5 deduped)
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('sk:pattern-skip-count');
    expect(keys).toContain('mul:2x5');
    expect(keys).toContain('div:10/2');
    expect(keys).toContain('div:50/5');
  });

  it('returns its own skills plus the union of mixOf for B8', () => {
    const keys = skillsOfLesson(8);
    expect(new Set(keys).size).toBe(keys.length);
    expect(keys).toContain('sk:pattern-add');
    expect(keys).toContain('sk:pattern-sub');
    expect(keys).toContain('sk:pattern-skip-count');
    expect(keys).toContain('sk:unknown-add-sub');
    expect(keys).toContain('mul:2x3');
  });

  it('B7 (not practicable) yields nothing: pattern-skip-count is tables-only now', () => {
    // Phase 12 legacy fix: pattern-skip-count is tagged only with the tables lessons
    // (B4, B5, B6, B9-B12), not B7 (geometry review) or B8 (mixed practice).
    expect(skillsOfLesson(7)).toEqual([]);
  });

  it('no catalog skill is orphaned: every skill appears in at least one practicable lesson', () => {
    for (const s of SKILL_CATALOG) {
      const found = ALL_LESSONS.some(
        (l) => l.practicable && skillsOfLesson(l.n).includes(`sk:${s.id}`),
      );
      expect(found, s.id).toBe(true);
    }
  });

  it('returns geometry skills for the B22 review', () => {
    expect(skillsOfLesson(22)).toContain('sk:geo-midpoint');
    expect(skillsOfLesson(43)).toContain('sk:geo-midpoint');
    expect(skillsOfLesson(43)).toContain('sk:meas-gram');
  });

  it('returns the six numbers-to-1000 skills for B1 (phase 07)', () => {
    expect(skillsOfLesson(1)).toEqual([
      'sk:num-read-write-1000',
      'sk:num-place-value-1000',
      'sk:num-neighbors-1000',
      'sk:num-compare-1000',
      'sk:num-order-1000',
      'sk:num-sequence-1000',
    ]);
  });

  it('throws for unknown lesson numbers', () => {
    expect(() => skillsOfLesson(0)).toThrow();
    expect(() => skillsOfLesson(82)).toThrow();
  });
});

describe('topicsInOrder', () => {
  it('returns the 16 topics in order with vi/en names', () => {
    const topics = topicsInOrder();
    expect(topics.map((t) => t.id)).toEqual(Array.from({ length: 16 }, (_, i) => i + 1));
    for (const t of topics) {
      expect(t.nameVi.length).toBeGreaterThan(0);
      expect(t.nameEn.length).toBeGreaterThan(0);
    }
  });
});

describe('lessonByNumber', () => {
  it('finds a row by number and returns undefined otherwise', () => {
    expect(lessonByNumber(25)?.book).toBe(1);
    expect(lessonByNumber(81)?.book).toBe(2);
    expect(lessonByNumber(0)).toBeUndefined();
    expect(lessonByNumber(82)).toBeUndefined();
  });
});
