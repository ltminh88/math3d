// QA m-3: a forest run must not drill one table with the same numbers twice in a row, and a far-off
// answer is not "almost right".
import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../learning/seeded-rng';
import { planSession } from '../../learning/session-planner';
import { varyForestFacts } from './forest-fact-variety';
import { forestFactPool } from './forest-round-flow';
import { wrongFeedbackKey } from './forest-round-texts';

const divisorOf = (key: string) => Number(key.split('/')[1]);

describe('forest fact variety', () => {
  it('a first run (planner teaches ÷2 blocked) gets other tables instead of repeats', () => {
    for (let seed = 1; seed <= 30; seed++) {
      const pool = forestFactPool({});
      const planned = planSession({
        stats: {},
        pool,
        tables: [2, 3, 4, 5],
        sessionNo: 1,
        rng: mulberry32(seed),
        length: 5,
      });
      const facts = varyForestFacts(planned, pool, mulberry32(seed));
      expect(facts).toHaveLength(5);
      expect(new Set(facts).size).toBe(5);
      expect(new Set(facts.map(divisorOf)).size).toBeGreaterThanOrEqual(3);
      // The planner's own picks stay in the run.
      for (const key of new Set(planned)) expect(facts).toContain(key);
      for (let i = 1; i < facts.length; i++) expect(facts[i]).not.toBe(facts[i - 1]);
    }
  });

  it('when the pool cannot fill the run, repeats are never neighbours', () => {
    const facts = varyForestFacts(
      ['div:4/2', 'div:4/2', 'div:6/2', 'div:6/2', 'div:4/2'],
      ['div:4/2', 'div:6/2'],
      mulberry32(3),
    );
    for (let i = 1; i < facts.length; i++) expect(facts[i]).not.toBe(facts[i - 1]);
  });
});

describe('forest wrong-answer feedback', () => {
  it('"almost" only when the answer is one away', () => {
    expect(wrongFeedbackKey(8, 7)).toBe('wrongClose');
    expect(wrongFeedbackKey(6, 7)).toBe('wrongClose');
    expect(wrongFeedbackKey(99, 2)).toBe('wrong');
    expect(wrongFeedbackKey(4, 7)).toBe('wrong');
    expect(wrongFeedbackKey(4, undefined)).toBe('wrong');
  });
});
