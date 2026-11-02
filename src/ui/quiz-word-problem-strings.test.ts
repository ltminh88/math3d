import { describe, expect, it } from 'vitest';
import { TABLES } from '../config/world-constants';
import { mulberry32 } from '../learning/seeded-rng';
import { buildWordProblemQuestion, WORD_PROBLEM_SKILLS } from '../quiz/quiz-word-problem-question';
import { wordProblemHint } from './quiz-word-problem-strings';

const numbers = (text: string) => (text.match(/\d+/g) ?? []).map(Number);

describe('wordProblemHint', () => {
  it('no rung (2 and up, the reveal level 0 too) states the answer or the hidden product', () => {
    const leaks: string[] = [];
    for (const skill of WORD_PROBLEM_SKILLS)
      for (const table of TABLES)
        for (let seed = 0; seed < 40; seed++) {
          const q = buildWordProblemQuestion(skill, table, {}, mulberry32(seed));
          // The story's numbers, plus the "1" of "1 đoạn" in the bar model.
          const story = `1 ${q.a} ${q.b} ${JSON.stringify(q.word?.params ?? {})}`;
          const shown = new Set(numbers(story));
          for (const level of [0, 2, 3, 4, 5]) {
            const text = wordProblemHint(q, level);
            const hidden = numbers(text).filter((n) => !shown.has(n));
            if (hidden.length || (numbers(text).includes(q.answer) && !shown.has(q.answer)))
              leaks.push(`${skill} ${q.a}/${q.b} level ${level}: ${text}`);
          }
        }
    expect(leaks.slice(0, 5)).toEqual([]);
  });
});
