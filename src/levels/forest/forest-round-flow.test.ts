import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import {
  type ForestRound,
  ForestRoundFlow,
  familyEquations,
  forestFactPool,
  planForestRounds,
} from './forest-round-flow';

const stat = (box: number): FactStat => ({
  attempts: 3,
  correct: 3,
  totalMs: 9000,
  box,
  lastSeenSession: 1,
  lastSeenAt: 1,
  streak: 0,
  fluent: false,
  errs: [],
});

const round = (kind: ForestRound['kind'], dividend: number, divisor: number): ForestRound => ({
  kind,
  factKey: `div:${dividend}/${divisor}`,
  dividend,
  divisor,
  quotient: dividend / divisor,
});

describe('forest fact pool', () => {
  it('starts concrete: tables 2-5, at most 20 fruit, division keys only', () => {
    const pool = forestFactPool({});
    expect(pool.length).toBeGreaterThan(5);
    expect(pool).toEqual(expect.arrayContaining(['div:12/4', 'div:15/5']));
    for (const key of pool) {
      const m = /^div:(\d+)\/(\d+)$/.exec(key);
      expect(m).not.toBeNull();
      expect([2, 3, 4, 5]).toContain(Number(m?.[2]));
      expect(Number(m?.[1])).toBeLessThanOrEqual(20);
    }
  });

  it('builds on known multiplication: inverse divisions of box 3+ facts (tables 2-5)', () => {
    const pool = forestFactPool({ 'mul:4x5': stat(3), 'mul:3x7': stat(4), 'mul:2x9': stat(3) });
    expect(pool).toEqual(expect.arrayContaining(['div:20/4', 'div:20/5', 'div:21/3', 'div:18/2']));
    expect(pool.every((k) => k.startsWith('div:'))).toBe(true);
    expect(pool).not.toContain('div:4/2');
  });
});

describe('forest round plan', () => {
  it('alternates share, pack and fact family; exact dividends only', () => {
    const rounds = planForestRounds(['div:12/3', 'div:8/2', 'div:6/3', 'div:10/2', 'div:4/2'], {});
    expect(rounds.map((r) => r.kind)).toEqual(['share', 'pack', 'family', 'share', 'pack']);
    expect(rounds[0]).toEqual(round('share', 12, 3));
    for (const r of rounds) expect(r.dividend % r.divisor).toBe(0);
  });

  it('goes symbolic (fact family) for box 3+ facts and for piles over 20 fruit', () => {
    const rounds = planForestRounds(['div:12/3', 'div:45/5'], { 'div:12/3': stat(3) });
    expect(rounds.map((r) => r.kind)).toEqual(['family', 'family']);
  });
});

describe('fact family equations', () => {
  it('lists the four equations with the `:` division sign handled by the view', () => {
    expect(familyEquations(round('family', 12, 3))).toEqual([
      { a: 3, op: 'mul', b: 4, answer: 12 },
      { a: 4, op: 'mul', b: 3, answer: 12 },
      { a: 12, op: 'div', b: 3, answer: 4 },
      { a: 12, op: 'div', b: 4, answer: 3 },
    ]);
  });

  it('drops duplicate equations for squares', () => {
    expect(familyEquations(round('family', 16, 4))).toEqual([
      { a: 4, op: 'mul', b: 4, answer: 16 },
      { a: 16, op: 'div', b: 4, answer: 4 },
    ]);
  });
});

describe('forest round flow', () => {
  const clock = () => {
    let t = 0;
    return { now: () => t, advance: (ms: number) => (t += ms) };
  };

  it('a first-try answer completes the round with a clean outcome', () => {
    const c = clock();
    const flow = new ForestRoundFlow([round('share', 12, 3), round('pack', 8, 2)], c.now);
    expect(flow.expected()).toBe(4);
    c.advance(4000);
    const result = flow.submit(4);
    expect(result.verdict).toBe('correct');
    expect(result.outcome).toEqual({
      factKey: 'div:12/3',
      ms: 4000,
      correct: true,
      firstTry: true,
      usedHint: false,
      wrongAnswers: [],
    });
    flow.next();
    expect(flow.index).toBe(1);
    expect(flow.expected()).toBe(4);
  });

  it('a wrong answer offers a hint; hints climb to rung 4 and mark the outcome', () => {
    const flow = new ForestRoundFlow([round('share', 10, 2)], () => 0);
    expect(flow.submit(4).verdict).toBe('wrong');
    expect(flow.hintOffered(0)).toBe(true);
    expect(flow.takeHint()).toBe(1);
    expect(flow.takeHint()).toBe(2);
    expect(flow.takeHint()).toBe(3);
    expect(flow.takeHint()).toBe(4);
    expect(flow.takeHint()).toBe(4);
    const result = flow.submit(5);
    expect(result.outcome).toMatchObject({ correct: true, firstTry: false, usedHint: true });
    expect(result.outcome?.wrongAnswers).toEqual([4]);
  });

  it('reveals the answer after three wrong answers (counts as not correct)', () => {
    const flow = new ForestRoundFlow([round('pack', 6, 3)], () => 0);
    flow.submit(1);
    flow.submit(3);
    const result = flow.submit(4);
    expect(result.verdict).toBe('revealed');
    expect(result.outcome).toMatchObject({ correct: false, wrongAnswers: [1, 3, 4] });
    expect(flow.roundComplete).toBe(true);
  });

  it('a fact family needs every blank right; one outcome per round', () => {
    const flow = new ForestRoundFlow([round('family', 12, 3)], () => 0);
    const first = flow.submit(12);
    expect(first.verdict).toBe('correct');
    expect(first.outcome).toBeUndefined();
    expect(flow.blank).toBe(1);
    expect(flow.submit(11).verdict).toBe('wrong');
    expect(flow.submit(12).outcome).toBeUndefined();
    expect(flow.submit(4).outcome).toBeUndefined();
    const last = flow.submit(3);
    expect(last.outcome).toMatchObject({ factKey: 'div:12/3', correct: true, firstTry: false });
    expect(flow.roundComplete).toBe(true);
    flow.next();
    expect(flow.done).toBe(true);
  });

  it('every fact-family blank has its own three tries; a shown blank fails the round once', () => {
    const flow = new ForestRoundFlow([round('family', 12, 3)], () => 0);
    flow.submit(1);
    flow.submit(2);
    expect(flow.submit(12)).toEqual({ verdict: 'correct' });
    // Two misses on blank 1 do not count against blank 2.
    expect(flow.submit(5)).toEqual({ verdict: 'wrong' });
    flow.submit(6);
    expect(flow.submit(7)).toEqual({ verdict: 'revealed' });
    expect(flow.blank).toBe(2);
    expect(flow.roundComplete).toBe(false);
    flow.submit(4);
    const last = flow.submit(3);
    expect(last.verdict).toBe('correct');
    expect(last.outcome).toMatchObject({ correct: false, firstTry: false, usedHint: true });
    expect(last.outcome?.wrongAnswers).toEqual([1, 2, 5, 6, 7]);
  });

  it('ignores answers once the round is complete', () => {
    const flow = new ForestRoundFlow([round('share', 4, 2)], () => 0);
    flow.submit(2);
    expect(flow.submit(2).verdict).toBe('ignored');
  });
});
