// Daily-practice copy guard (phase 11): no text anywhere in the daily feature ever says the
// child lost a streak, counts down, or shows a sad state. A missed day restarts the count
// silently — the streak line only ever celebrates the current count.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { td } from './daily-practice-strings';

const dir = dirname(fileURLToPath(import.meta.url));
const dailySources = [
  'daily-practice-strings.ts',
  'daily-practice.ts',
  'daily-practice-guide-section.ts',
  'daily-practice.css',
  '../learning/daily-planner.ts',
  '../learning/daily-streak.ts',
  '../quiz/daily-question.ts',
].map((f) => readFileSync(join(dir, f), 'utf8'));

const FORBIDDEN = [
  'mất chuỗi',
  'đứt chuỗi',
  'mất streak',
  'chuỗi đã mất',
  'chuỗi bị mất',
  'hết chuỗi',
  'lost your streak',
  'streak lost',
  'broken streak',
  'streak is gone',
  'buồn',
];

describe('daily copy', () => {
  it('never mentions losing a streak, in any daily source file', () => {
    for (const [i, src] of dailySources.entries()) {
      for (const phrase of FORBIDDEN) {
        expect(src.toLowerCase(), `file ${i} contains "${phrase}"`).not.toContain(phrase);
      }
    }
  });

  it('the streak line only celebrates the current count', () => {
    expect(td('streak', { n: 1 })).toBe('Con đã luyện 1 ngày liên tiếp!');
    expect(td('streak', { n: 7 })).toBe('Con đã luyện 7 ngày liên tiếp!');
  });
});
