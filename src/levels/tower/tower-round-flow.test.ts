import { describe, expect, it } from 'vitest';
import type { FactStat } from '../../learning/learning-types';
import { mulberry32 } from '../../learning/seeded-rng';
import { buildQuestion, type TowerQuestion } from './tower-question-formats';
import { planTowerFacts, TowerRoundFlow, towerFactPool } from './tower-round-flow';

const stat = (box: number): FactStat => ({
  attempts: 3,
  correct: 2,
  totalMs: 9000,
  box,
  lastSeenSession: 1,
  lastSeenAt: 1,
  streak: 0,
  fluent: false,
  errs: [],
});

describe('tower fact pool and plan', () => {
  it('mixes multiplication and division over tables 2-9', () => {
    const pool = towerFactPool();
    expect(pool).toContain('mul:7x8');
    expect(pool).toContain('div:56/7');
    expect(pool).toContain('div:18/2');
    expect(pool.some((k) => k.includes('x1') && k.startsWith('mul:1'))).toBe(false);
  });

  it('puts weak facts first (lowest Leitner box)', () => {
    const stats = {
      'mul:7x8': stat(4),
      'div:56/7': stat(1),
      'mul:6x9': stat(2),
      'div:24/3': stat(5),
    };
    const planned = ['mul:7x8', 'div:24/3', 'mul:6x9', 'div:56/7'];
    const facts = planTowerFacts(planned, stats, mulberry32(3), 4);
    expect(facts).toEqual(['div:56/7', 'mul:6x9', 'mul:7x8', 'div:24/3']);
  });

  it('tops a short plan up to seven different facts with both operations', () => {
    const facts = planTowerFacts(['mul:2x3', 'mul:2x3', 'mul:2x4'], {}, mulberry32(5), 7);
    expect(facts).toHaveLength(7);
    expect(new Set(facts).size).toBe(7);
    expect(facts.some((k) => k.startsWith('mul:'))).toBe(true);
    expect(facts.some((k) => k.startsWith('div:'))).toBe(true);
  });

  it('an inverse stays in the pool: 8 × 10 becomes 80 : 8, never 80 : 10', () => {
    const planned = ['mul:2x3', 'mul:3x4', 'mul:4x5', 'mul:5x6', 'mul:6x7', 'mul:7x9', 'mul:8x10'];
    const facts = planTowerFacts(planned, {}, mulberry32(1), 7);
    const pool = towerFactPool();
    expect(facts).toContain('div:80/8');
    for (const key of facts) expect(pool).toContain(key);
  });

  it('turns one fact into its inverse when the plan has only one operation', () => {
    const planned = ['mul:2x3', 'mul:3x4', 'mul:4x5', 'mul:5x6', 'mul:6x7', 'mul:7x8', 'mul:8x9'];
    const facts = planTowerFacts(planned, {}, mulberry32(1), 7);
    expect(facts.filter((k) => k.startsWith('div:'))).toHaveLength(1);
  });
});

describe('tower round flow', () => {
  const choice = buildQuestion('mul:6x7', 'choice', mulberry32(2), []);
  const family = buildQuestion('mul:3x8', 'family', mulberry32(2), []);

  it('climbs seven floors and records one outcome per floor', () => {
    const questions = Array.from({ length: 7 }, (_, i) => (i % 2 ? family : choice));
    const flow = new TowerRoundFlow(questions, () => 0);
    const outcomes = [];
    while (!flow.done) {
      let result = flow.submit(flow.expected() as number);
      while (!result.outcome) result = flow.submit(flow.expected() as number);
      outcomes.push(result.outcome);
      flow.next();
    }
    expect(outcomes).toHaveLength(7);
    expect(outcomes.every((o) => o.correct && o.firstTry)).toBe(true);
    expect(outcomes[1]?.factKey).toBe('mul:3x8');
  });

  const claim = (isTrue: boolean): TowerQuestion => {
    for (let seed = 1; ; seed++) {
      const q = buildQuestion('mul:6x7', 'truefalse', mulberry32(seed), []);
      if (q.steps[0]?.answer === isTrue) return q;
    }
  };

  it('a true claim judged "Đúng" is not recorded until the result is confirmed', () => {
    const flow = new TowerRoundFlow([claim(true)], () => 0);
    expect(flow.submit(true)).toEqual({ verdict: 'correct' });
    expect(flow.roundComplete).toBe(false);
    expect(flow.step).toMatchObject({ kind: 'number', answer: 42 });
    const done = flow.submit(42);
    expect(done.outcome).toMatchObject({ correct: true, firstTry: true, usedHint: false });
  });

  it('a hint on one step does not carry its rung to the next step', () => {
    const flow = new TowerRoundFlow([family], () => 0);
    expect(flow.takeHint()).toBe(1);
    expect(flow.takeHint()).toBe(2);
    flow.submit(flow.expected() as number);
    expect(flow.hint.rung).toBe(0);
    expect(flow.takeHint()).toBe(1);
    let result = flow.submit(flow.expected() as number);
    while (!result.outcome) result = flow.submit(flow.expected() as number);
    // Still one question that used hints.
    expect(result.outcome).toMatchObject({ correct: true, usedHint: true });
  });

  it('a false claim then its fix is one question; the claimed product is the wrong answer', () => {
    const q = claim(false);
    const claimed = q.steps[0]?.eq.z;
    const flow = new TowerRoundFlow([q], () => 0);
    expect(flow.submit(true).verdict).toBe('wrong');
    expect(flow.submit(false)).toEqual({ verdict: 'correct' });
    const done = flow.submit(42);
    expect(done.verdict).toBe('correct');
    expect(done.outcome).toMatchObject({
      factKey: 'mul:6x7',
      correct: true,
      firstTry: false,
      wrongAnswers: [claimed],
    });
  });

  it('three misses reveal the answer and never fail the run', () => {
    const flow = new TowerRoundFlow([choice, choice], () => 0);
    expect(flow.submit(1).verdict).toBe('wrong');
    expect(flow.hintOffered(0)).toBe(true);
    flow.submit(2);
    const revealed = flow.submit(3);
    expect(revealed.verdict).toBe('revealed');
    expect(revealed.outcome).toMatchObject({ correct: false, wrongAnswers: [1, 2, 3] });
    flow.next();
    expect(flow.done).toBe(false);
    expect(flow.index).toBe(1);
  });
});
