import { describe, expect, it } from 'vitest';
import { pickDistractors, placeAnswer } from './distractor-picker';
import { mulberry32 } from './seeded-rng';

const gcd = (x: number, y: number): number => (y === 0 ? x : gcd(y, x % y));
const allFacts: Array<[number, number]> = [];
for (let a = 2; a <= 10; a++) for (let b = a; b <= 10; b++) allFacts.push([a, b]);

describe('pickDistractors', () => {
  it('satisfies every invariant for every fact across many seeds', () => {
    for (const [a, b] of allFacts) {
      const answer = a * b;
      for (let seed = 1; seed <= 40; seed++) {
        const d = pickDistractors(
          { factKey: `mul:${a}x${b}`, a, b, answer, errorBank: [] },
          mulberry32(seed * 7919 + a * 31 + b),
        );
        const label = `${a}x${b} seed ${seed}`;
        expect(d, label).toHaveLength(3);
        expect(new Set(d).size, label).toBe(3);
        for (const n of d) {
          expect(n, label).not.toBe(answer);
          expect(Number.isInteger(n) && n >= 1 && n <= 100, label).toBe(true);
        }
        expect(
          d.some((n) => gcd(n, a) > 1 || gcd(n, b) > 1),
          label,
        ).toBe(true);
      }
    }
  });

  it('answer is not systematically the largest or smallest option', () => {
    let max = 0;
    let min = 0;
    let n = 0;
    for (const [a, b] of allFacts) {
      for (let seed = 1; seed <= 25; seed++) {
        const rng = mulberry32(seed * 104729 + a * 13 + b);
        const answer = a * b;
        const { choices } = placeAnswer(
          answer,
          pickDistractors({ factKey: `mul:${a}x${b}`, a, b, answer, errorBank: [] }, rng),
          rng,
        );
        n++;
        if (answer === Math.max(...choices)) max++;
        if (answer === Math.min(...choices)) min++;
      }
    }
    expect(max / n).toBeLessThan(0.4);
    expect(min / n).toBeLessThan(0.4);
  });

  it('uses the personal error bank first', () => {
    const d = pickDistractors(
      { factKey: 'mul:6x7', a: 6, b: 7, answer: 42, errorBank: [45] },
      mulberry32(3),
    );
    expect(d).toContain(45);
  });

  it('handles division facts (answer is the quotient)', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const d = pickDistractors(
        { factKey: 'div:12/3', a: 3, b: 4, answer: 4, dividend: 12, errorBank: [] },
        mulberry32(seed),
      );
      expect(new Set(d).size).toBe(3);
      expect(d).not.toContain(4);
      expect(d.every((n) => n >= 1 && n <= 100)).toBe(true);
    }
  });
});

describe('placeAnswer', () => {
  it('spreads the answer roughly uniformly over the 4 positions', () => {
    const rng = mulberry32(11);
    const hist = [0, 0, 0, 0];
    const trials = 4000;
    for (let i = 0; i < trials; i++) {
      const { choices, answerIndex } = placeAnswer(42, [13, 48, 24], rng);
      expect(choices[answerIndex]).toBe(42);
      hist[answerIndex] = (hist[answerIndex] ?? 0) + 1;
    }
    for (const h of hist) expect(Math.abs(h / trials - 0.25)).toBeLessThan(0.04);
  });
});
