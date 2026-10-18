import { describe, expect, it } from 'vitest';
import { levelFactPool } from './curriculum-tables';
import { generateQuestion } from './question-generator';
import type { QuestionType } from './question-types';
import { mulberry32 } from './seeded-rng';

const mulPool = levelFactPool('forest').filter((k) => k.startsWith('mul:'));
const divPool = levelFactPool('forest').filter((k) => k.startsWith('div:'));

describe('generateQuestion', () => {
  it('switches representation by box (CRA)', () => {
    const rng = mulberry32(1);
    expect(generateQuestion('mul:3x4', rng, { box: 1 }).type).toBe('equal-groups');
    expect(generateQuestion('mul:3x4', rng, { box: 2 }).representation).toBe('concrete');
    expect(generateQuestion('mul:3x4', rng, { box: 3 }).type).toBe('numeric');
    expect(generateQuestion('div:12/3', rng, { box: 1 }).type).toBe('share');
    expect(generateQuestion('div:12/3', rng, { box: 4 }).type).toBe('numeric');
  });

  it('number-choice questions always contain the answer exactly once at answerIndex', () => {
    const types: QuestionType[] = ['equal-groups', 'array', 'numeric', 'share', 'fact-family'];
    for (const key of mulPool) {
      for (const type of types) {
        const q = generateQuestion(key, mulberry32(key.length * 17), { type });
        if (q.type === 'expression-choice') throw new Error('unexpected');
        expect(q.choices).toHaveLength(4);
        expect(q.choices[q.answerIndex]).toBe(q.answer);
        expect(q.choices.filter((c) => c === q.answer)).toHaveLength(1);
      }
    }
    for (const key of divPool) {
      for (const type of ['share', 'numeric', 'fact-family'] as const) {
        const q = generateQuestion(key, mulberry32(5), { type });
        if (q.type === 'expression-choice') throw new Error('unexpected');
        expect(q.choices[q.answerIndex]).toBe(q.answer);
        expect(new Set(q.choices).size).toBe(4);
      }
    }
  });

  it('equal-groups expression reads groupSize x groupCount and is a valid fact either order', () => {
    const orders = new Set<string>();
    for (let seed = 1; seed < 40; seed++) {
      const q = generateQuestion('mul:2x5', mulberry32(seed), { box: 1 });
      if (q.type !== 'equal-groups') throw new Error('type');
      expect(q.expression).toBe(`${q.groupSize} x ${q.groupCount}`);
      expect(q.groupSize * q.groupCount).toBe(10);
      orders.add(q.expression);
    }
    expect(orders).toEqual(new Set(['2 x 5', '5 x 2']));
  });

  it('expression-choice never offers the swapped order or an equal-valued expression', () => {
    for (const key of mulPool) {
      for (let seed = 1; seed <= 20; seed++) {
        const q = generateQuestion(key, mulberry32(seed), { type: 'expression-choice' });
        if (q.type !== 'expression-choice') throw new Error('type');
        const correct = `${q.groupSize} x ${q.groupCount}`;
        const swapped = `${q.groupCount} x ${q.groupSize}`;
        expect(q.expressions[q.answerIndex]).toBe(correct);
        expect(q.expressions.length).toBeGreaterThanOrEqual(2);
        if (swapped !== correct) expect(q.expressions).not.toContain(swapped);
        expect(new Set(q.expressions).size).toBe(q.expressions.length);
      }
    }
  });

  it('expression-choice wrong options never share a value (square facts: no "3 x 4" with "4 x 3")', () => {
    const value = (e: string) => {
      const [a, op, b] = e.split(' ');
      return op === '+' ? Number(a) + Number(b) : Number(a) * Number(b);
    };
    for (const key of ['mul:3x3', 'mul:4x4', 'mul:5x5', ...mulPool]) {
      for (let seed = 1; seed <= 40; seed++) {
        const q = generateQuestion(key, mulberry32(seed), { type: 'expression-choice' });
        if (q.type !== 'expression-choice') throw new Error('type');
        const values = q.expressions.map(value);
        expect(new Set(values).size).toBe(values.length);
      }
    }
  });

  it('rejects invalid keys and multiplication-only types on division facts', () => {
    expect(() => generateQuestion('mul:3x2', mulberry32(1))).toThrow();
    expect(() => generateQuestion('div:12/3', mulberry32(1), { type: 'array' })).toThrow();
  });

  it('feeds the personal error bank into the choices', () => {
    const q = generateQuestion('mul:6x7', mulberry32(2), { type: 'numeric', errorBank: [45] });
    if (q.type !== 'numeric') throw new Error('type');
    expect(q.choices).toContain(45);
  });
});
