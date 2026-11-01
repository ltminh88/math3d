import { describe, expect, it } from 'vitest';
import { BRIDGE_SEGMENTS } from '../config/world-constants';
import { mulberry32 } from '../learning/seeded-rng';
import { createQuizPlanner } from '../quiz/learning-quiz-adapter';
import type { QuizMode } from '../quiz/question-types';
import { buildWordProblemQuestion } from '../quiz/quiz-word-problem-question';
import { quizBodyHtml } from './quiz-dialog-templates';

// The multiplication quiz body is in DOM parity: its markup must stay byte-identical (snapshot
// taken from the recovered template before the word-problem split).
function bodies(mode: QuizMode, seed: number, table: number): string[] {
  const planner = createQuizPlanner(mulberry32(seed));
  const out: string[] = [];
  for (let i = 0; i < 6; i++) {
    const view = { bridgeMode: mode === 'bridge', bridge: i, segments: BRIDGE_SEGMENTS };
    const q = planner.next({ mode, table, stats: {}, sessionNo: 1 });
    out.push(quizBodyHtml(q, view));
    out.push(quizBodyHtml({ ...q, review: true }, view));
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

  it('renders a word problem as story + question with the 3 numeric answers', () => {
    const q = buildWordProblemQuestion('wp-times-then-add', 6, {}, mulberry32(4));
    const view = { bridgeMode: true, bridge: 2, segments: BRIDGE_SEGMENTS };
    const html = quizBodyHtml(q, view);
    expect(html).toContain('ĐOẠN CẦU 3 / 6');
    expect(html).toContain(`Đội Mai chở được 6 viên đá. Đội Nam chở được gấp ${q.b} lần đội Mai.`);
    expect(html).toContain('Cả hai đội chở được bao nhiêu viên đá?');
    expect(html.match(/class="answer"/g)).toHaveLength(3);
    for (const o of q.options) expect(html).toContain(`data-value="${o.value}"`);
    expect(html).not.toContain('class="equation"');
    const practice = quizBodyHtml(q, { ...view, bridgeMode: false });
    expect(practice).toContain('BÀI TOÁN CÓ LỜI VĂN');
  });
});
