import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../learning/seeded-rng';
import { createQuizPlanner } from '../quiz/learning-quiz-adapter';
import type { QuizMode } from '../quiz/question-types';
import { gameState } from './game-state';
import { quizBodyHtml } from './quiz-dialog';

// The multiplication quiz body is in DOM parity: its markup must stay byte-identical (snapshot
// taken from the recovered template before the word-problem split).
function bodies(mode: QuizMode, seed: number, table: number): string[] {
  const planner = createQuizPlanner(mulberry32(seed));
  gameState.quizMode = mode;
  const out: string[] = [];
  for (let i = 0; i < 6; i++) {
    gameState.progress.bridge = i;
    const q = planner.next({ mode, table, stats: {}, sessionNo: 1 });
    out.push(quizBodyHtml(q));
    out.push(quizBodyHtml({ ...q, review: true }));
  }
  return out;
}

describe('quiz dialog templates', () => {
  it('keeps the multiplication body byte-identical (bridge and practice, several seeds)', () => {
    const all = [1, 7, 42].flatMap((seed) => [
      ...bodies('bridge', seed, 0),
      ...bodies('practice', seed, 0),
      ...bodies('practice', seed, 7),
    ]);
    expect(all).toMatchSnapshot();
  });
});
