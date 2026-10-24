import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import {
  assignFormats,
  buildQuestion,
  factTriple,
  plausibleWrong,
  type TowerFormat,
} from './tower-question-formats';

const rng = () => mulberry32(7);

describe('tower fact triples', () => {
  it('reads a × b = p from multiplication and division keys', () => {
    expect(factTriple('mul:7x8')).toEqual({ op: 'mul', a: 7, b: 8, p: 56 });
    expect(factTriple('div:56/7')).toEqual({ op: 'div', a: 8, b: 7, p: 56 });
  });
});

describe('tower question formats', () => {
  it('choice: a × b = ? with the product among three different options', () => {
    const q = buildQuestion('mul:6x7', 'choice', rng(), []);
    const step = q.steps[0];
    expect(q.steps).toHaveLength(1);
    expect(step?.kind).toBe('choice');
    if (step?.kind !== 'choice') return;
    expect(step.eq.op).toBe('mul');
    expect(step.eq.x * step.eq.y).toBe(42);
    expect(step.answer).toBe(42);
    expect(step.choices).toHaveLength(3);
    expect(new Set(step.choices).size).toBe(3);
    expect(step.choices).toContain(42);
  });

  it('number pad: p : d = ? is an exact division', () => {
    for (const key of ['div:56/7', 'div:18/2', 'div:81/9']) {
      const step = buildQuestion(key, 'pad', rng(), []).steps[0];
      expect(step?.kind).toBe('number');
      if (step?.kind !== 'number') return;
      expect(step.eq).toMatchObject({ op: 'div', blank: 'z' });
      expect(step.eq.x % step.eq.y).toBe(0);
      expect(step.eq.x / step.eq.y).toBe(step.answer);
    }
  });

  it('missing factor: ? × 7 = 56 asks for the other factor', () => {
    const step = buildQuestion('div:56/7', 'missing', rng(), []).steps[0];
    expect(step).toMatchObject({ kind: 'number', answer: 8 });
    expect(step?.eq).toEqual({ x: 8, op: 'mul', y: 7, z: 56, blank: 'x' });
    const mul = buildQuestion('mul:4x9', 'missing', rng(), []).steps[0];
    expect(mul?.eq.blank).toBe('x');
    expect((mul?.eq.x ?? 0) * (mul?.eq.y ?? 0)).toBe(36);
  });

  it('fact family: two multiplications and two divisions (two for squares)', () => {
    const q = buildQuestion('mul:3x8', 'family', rng(), []);
    expect(
      q.steps.map((s) => [s.eq.x, s.eq.op, s.eq.y, s.kind === 'verdict' ? 0 : s.answer]),
    ).toEqual([
      [3, 'mul', 8, 24],
      [8, 'mul', 3, 24],
      [24, 'div', 3, 8],
      [24, 'div', 8, 3],
    ]);
    expect(buildQuestion('div:49/7', 'family', rng(), []).steps).toHaveLength(2);
  });

  it('true/false: a false claim is fixed, a true one confirmed, in the same question', () => {
    let sawFalse = false;
    let sawTrue = false;
    for (let seed = 1; seed < 40; seed++) {
      const q = buildQuestion('mul:6x7', 'truefalse', mulberry32(seed), []);
      const [verdict, fix] = q.steps;
      expect(verdict?.kind).toBe('verdict');
      if (verdict?.kind !== 'verdict') return;
      if (verdict.answer) {
        sawTrue = true;
        expect(verdict.eq.z).toBe(42);
        // "Đúng" alone is a judgment, not recall: the result is asked once more.
        expect(fix).toMatchObject({ kind: 'number', answer: 42, eq: { z: 42, blank: 'z' } });
      } else {
        sawFalse = true;
        expect(verdict.eq.z).not.toBe(42);
        expect(fix).toMatchObject({ kind: 'number', answer: 42 });
      }
    }
    expect(sawFalse && sawTrue).toBe(true);
  });

  it('a wrong product is plausible: one step off in either table', () => {
    for (let seed = 1; seed < 30; seed++) {
      const wrong = plausibleWrong({ op: 'mul', a: 6, b: 7, p: 42 }, mulberry32(seed));
      expect([36, 48, 35, 49]).toContain(wrong);
    }
    const quotient = plausibleWrong({ op: 'div', a: 8, b: 7, p: 56 }, rng());
    expect([7, 9]).toContain(quotient);
    expect(plausibleWrong({ op: 'mul', a: 2, b: 2, p: 4 }, rng())).toBeGreaterThan(0);
  });
});

describe('tower format rotation', () => {
  const keys = ['mul:6x7', 'div:56/7', 'mul:3x8', 'mul:4x9', 'div:18/2', 'div:81/9', 'mul:2x5'];

  it('never repeats a format on two floors in a row and fits each operation', () => {
    const formats = assignFormats(keys);
    expect(formats).toHaveLength(keys.length);
    formats.forEach((format, i) => {
      if (i > 0) expect(format).not.toBe(formats[i - 1]);
      const op = keys[i]?.slice(0, 3);
      if (format === 'choice') expect(op).toBe('mul');
      if (format === 'pad') expect(op).toBe('div');
    });
  });

  it('uses every format over a mixed seven-floor run', () => {
    const formats = new Set<TowerFormat>(assignFormats(keys));
    expect(formats.size).toBe(5);
  });

  it('keeps the rule for runs of one operation only', () => {
    const formats = assignFormats(['mul:2x3', 'mul:2x4', 'mul:2x5', 'mul:2x6', 'mul:2x7']);
    for (let i = 1; i < formats.length; i++) expect(formats[i]).not.toBe(formats[i - 1]);
    expect(formats).not.toContain('pad');
  });
});
