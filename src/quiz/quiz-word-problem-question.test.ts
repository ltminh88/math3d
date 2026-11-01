import { describe, expect, it } from 'vitest';
import { TABLES } from '../config/world-constants';
import { mulKey, skillKey } from '../learning/fact-key';
import type { FactStat } from '../learning/learning-types';
import { newFactStat } from '../learning/leitner-box';
import { mulberry32 } from '../learning/seeded-rng';
import { createQuizPlanner, quizFactPool } from './learning-quiz-adapter';
import { averageBox, chooseWordProblemSkill, wordProblemDue } from './quiz-reasoning-slot';
import { buildWordProblemQuestion, WORD_PROBLEM_SKILLS } from './quiz-word-problem-question';

const boxed = (box: number, attempts = 3): FactStat => ({ ...newFactStat(), box, attempts });

function statsFor(table: number, box: number): Record<string, FactStat> {
  return Object.fromEntries(quizFactPool(table).pool.map((k) => [k, boxed(box)]));
}

describe('wordProblemDue (the bridge reasoning slot)', () => {
  it('never for a fresh profile', () => {
    for (let n = 1; n <= 30; n++) expect(wordProblemDue(n, {}, quizFactPool(0).pool)).toBe(false);
  });

  it('every 5th question once the chosen table averages box 3', () => {
    const pool = quizFactPool(6).pool;
    const due = Array.from({ length: 15 }, (_, i) => wordProblemDue(i + 1, statsFor(6, 3), pool));
    expect(due.map((d, i) => (d ? i + 1 : 0)).filter(Boolean)).toEqual([5, 10, 15]);
    expect(wordProblemDue(5, statsFor(6, 2), pool)).toBe(false);
  });

  it('averages unseen facts as box 1', () => {
    const pool = quizFactPool(6).pool;
    const half = Object.fromEntries(pool.slice(0, 5).map((k) => [k, boxed(5)]));
    expect(averageBox(half, pool)).toBe(3);
    expect(averageBox({}, pool)).toBe(1);
  });
});

describe('chooseWordProblemSkill', () => {
  it('takes the skill seen least, catalog order on ties', () => {
    expect(chooseWordProblemSkill({}, WORD_PROBLEM_SKILLS)).toBe('wp-times-then-add');
    const seen = { [skillKey('wp-times-then-add')]: boxed(1, 2) };
    expect(chooseWordProblemSkill(seen, WORD_PROBLEM_SKILLS)).toBe('wp-times-compare');
  });
});

describe('buildWordProblemQuestion', () => {
  it('3 unique numeric options with the answer once, every number <= 100, on the table', () => {
    for (const skill of WORD_PROBLEM_SKILLS) {
      for (const table of [0, ...TABLES]) {
        for (let seed = 1; seed <= 120; seed++) {
          const q = buildWordProblemQuestion(skill, table, {}, mulberry32(seed));
          const values = q.options.map((o) => o.value);
          expect(values).toHaveLength(3);
          expect(new Set(values).size).toBe(3);
          expect(values.filter((v) => v === q.answer)).toHaveLength(1);
          expect(q.factKey).toBe(skillKey(skill));
          const word = q.word;
          if (!word) throw new Error('word problem missing');
          const numbers = [...values, ...Object.values(word.params), ...word.work, q.answer];
          for (const n of numbers) expect(n >= 0 && n <= 100, `${skill} ${n}`).toBe(true);
          if (table) expect(q.a).toBe(table);
          if (skill === 'wp-times-then-add') expect(q.answer).toBe(q.a * q.b + q.a);
          else expect(q.answer).toBe(q.b);
        }
      }
    }
  });

  it('higher tiers put two misconception distractors next to the answer', () => {
    const stats = { [skillKey('wp-times-compare')]: boxed(3) };
    for (let seed = 1; seed <= 50; seed++) {
      const q = buildWordProblemQuestion('wp-times-compare', 7, stats, mulberry32(seed));
      const big = (q.word?.params.big ?? 0) as number;
      const values = q.options.map((o) => o.value);
      expect(values).toContain(big - 7);
    }
  });
});

describe('quiz planner with word problems', () => {
  it('a fresh profile never gets one (parity keeps the multiplication template)', () => {
    const planner = createQuizPlanner(mulberry32(3));
    for (let i = 0; i < 25; i++) {
      const q = planner.next({ mode: 'bridge', table: 0, stats: {}, sessionNo: 1 });
      expect(q.word).toBeUndefined();
      expect(q.factKey.startsWith('mul:')).toBe(true);
    }
  });

  it('a mastered table gets a word problem on every 5th question', () => {
    const planner = createQuizPlanner(mulberry32(3));
    const stats = { ...statsFor(4, 3), [mulKey(4, 4)]: boxed(3) };
    const keys = Array.from(
      { length: 10 },
      () => planner.next({ mode: 'bridge', table: 4, stats, sessionNo: 2 }).factKey,
    );
    expect(keys[4]).toMatch(/^sk:wp-/);
    expect(keys[9]).toMatch(/^sk:wp-/);
    expect(keys.filter((k) => k.startsWith('sk:'))).toHaveLength(2);
  });
});
