import { describe, expect, it } from 'vitest';
import { TABLES } from '../config/world-constants';
import { mulKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { newFactStat } from '../learning/leitner-box';
import { mulberry32 } from '../learning/seeded-rng';
import {
  buildQuizQuestion,
  createQuizPlanner,
  pickThreeChoiceDistractors,
  quizFactPool,
} from './learning-quiz-adapter';

const answerOf = (key: string): number => {
  const [x, y] = key.slice(4).split('x').map(Number) as [number, number];
  return x * y;
};

describe('quizFactPool', () => {
  it('all tables: every original fact once, commutative pairs pooled', () => {
    const { pool } = quizFactPool(0);
    expect(pool).toHaveLength(54);
    expect(new Set(pool).size).toBe(54);
    for (const a of TABLES) for (let b = 1; b <= 10; b++) expect(pool).toContain(mulKey(a, b));
  });

  it('one table: its ten facts', () => {
    expect(quizFactPool(7).pool).toEqual(Array.from({ length: 10 }, (_, i) => mulKey(7, i + 1)));
    expect(quizFactPool(7).tables).toEqual([7]);
  });
});

describe('buildQuizQuestion', () => {
  it('practice: 3 unique in-range numbers including the answer, a x b matches the table', () => {
    for (const table of [0, ...TABLES]) {
      for (const key of quizFactPool(table).pool) {
        for (let seed = 1; seed <= 6; seed++) {
          const q = buildQuizQuestion(key, { mode: 'practice', table }, mulberry32(seed));
          const values = q.options.map((o) => o.value);
          expect(values, key).toHaveLength(3);
          expect(new Set(values).size, key).toBe(3);
          expect(values, key).toContain(q.answer);
          expect(q.a * q.b).toBe(q.answer);
          expect(q.answer).toBe(answerOf(key));
          expect(TABLES).toContain(q.a);
          if (table) expect(q.a).toBe(table);
          for (const o of q.options) {
            expect(o.label).toBe(String(o.value));
            expect(o.value >= 1 && o.value <= 100).toBe(true);
          }
          expect(q.id).toBe(`m${q.a}_${q.b}`);
          expect(q.factKey).toBe(key);
        }
      }
    }
  });

  it('bridge: 3 expressions with unique values, exactly one equals the stone count', () => {
    for (const key of quizFactPool(0).pool) {
      const q = buildQuizQuestion(key, { mode: 'bridge', table: 0 }, mulberry32(answerOf(key)));
      const values = q.options.map((o) => o.value);
      expect(new Set(values).size, key).toBe(3);
      expect(
        values.filter((v) => v === q.answer),
        key,
      ).toHaveLength(1);
      const right = q.options.find((o) => o.value === q.answer);
      expect(right?.label).toBe(`${q.a} × ${q.b}`);
      for (const o of q.options) expect(o.label).toMatch(/^\d+ [×+] \d+$/);
    }
  });

  it('marks weak, already-seen facts (box 1) as review and passes the error bank', () => {
    const weak: FactStat = { ...newFactStat(), attempts: 2, box: 1, errs: [45] };
    const q = buildQuizQuestion(
      'mul:6x7',
      { mode: 'practice', table: 0, stat: weak },
      mulberry32(3),
    );
    expect(q.review).toBe(true);
    expect(q.options.map((o) => o.value)).toContain(45);
    expect(buildQuizQuestion('mul:6x7', { mode: 'practice', table: 0 }, mulberry32(3)).review).toBe(
      false,
    );
  });
});

describe('pickThreeChoiceDistractors', () => {
  it('the answer is not systematically the smallest, middle or largest option', () => {
    const ranks = [0, 0, 0];
    let n = 0;
    for (const key of quizFactPool(0).pool) {
      const [a, b] = key.slice(4).split('x').map(Number) as [number, number];
      for (let seed = 1; seed <= 30; seed++) {
        const answer = a * b;
        const d = pickThreeChoiceDistractors(
          { factKey: key, a, b, answer, errorBank: [] },
          mulberry32(seed * 7919 + answer),
        );
        expect(d).toHaveLength(2);
        const rank = d.filter((x) => x < answer).length;
        ranks[rank] = (ranks[rank] ?? 0) + 1;
        n++;
      }
    }
    for (const r of ranks) {
      expect(r / n).toBeLessThan(0.5);
      expect(r / n).toBeGreaterThan(0.15);
    }
  });
});

describe('createQuizPlanner', () => {
  const stats = {};
  it('never asks the same fact twice in a row and replans when the table changes', () => {
    const planner = createQuizPlanner(mulberry32(11));
    let last = '';
    for (let i = 0; i < 60; i++) {
      const q = planner.next(
        { mode: 'practice', table: i < 30 ? 0 : 4, stats, sessionNo: 1 },
        last,
      );
      expect(q.factKey).not.toBe(last);
      if (i >= 30) expect(q.a).toBe(4);
      last = q.factKey;
    }
  });

  it('draws from the Leitner plan: due weak facts come back', () => {
    const due: FactStat = { ...newFactStat(), attempts: 3, correct: 1, box: 1, lastSeenSession: 1 };
    const planner = createQuizPlanner(mulberry32(5));
    const asked = new Set<string>();
    for (let i = 0; i < 10; i++)
      asked.add(
        planner.next({ mode: 'practice', table: 6, stats: { 'mul:6x7': due }, sessionNo: 3 })
          .factKey,
      );
    expect(asked).toContain('mul:6x7');
  });
});
