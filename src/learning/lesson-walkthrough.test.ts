// Walkthrough B1→B81 (phase 21 staging, TASK R18): a perfect player taps
// "Học tiếp" again and again. Every lesson must plan items, render them, accept
// its own correct answer, and reach 3 stars so the chain moves on.
import { describe, expect, it } from 'vitest';
import { walkLessonChain, walkLessonsInOrder } from './lesson-walkthrough';

const chain = walkLessonChain();
const inOrder = walkLessonsInOrder();

describe('lesson walkthrough B1→B81 (R18, perfect player)', () => {
  it('every item renders and its correct answer checks correct (no oracle failures)', () => {
    const bad = inOrder.flatMap((l) => l.failures.map((f) => `B${l.n}: ${f}`));
    expect(bad, 'render/oracle failures').toEqual([]);
  });

  it('every lesson that needs playing plans at least one item on its first run', () => {
    const empty = inOrder.filter((l) => l.runs > 0 && l.firstRunItems === 0).map((l) => `B${l.n}`);
    expect(empty, 'lessons with an empty first run').toEqual([]);
  });

  it('the whole chain fits in a reasonable number of runs', () => {
    const total = inOrder.reduce((s, l) => s + l.runs, 0);
    expect(total).toBeLessThanOrEqual(400);
  });

  // KNOWN BUG — B8 cannot reach 3 stars, even played directly (report
  // muse-88-261124-b1-b81-walkthrough.md). B8 is a mix of B1–B7, so
  // `planLessonRun` spreads each run over 8 source groups but a run has only
  // 6 items: the 7th/8th groups are never picked, and B6's leftover table-4
  // facts (mul:4x4, div:32/4, div:36/4 — each one correct answer short of
  // box 4) get 0 picks in 20 runs. "Học tiếp" then points at B8 forever and
  // the child never reaches B9–B81 through it. This test is marked `fails`
  // until the planner is fixed; when it starts passing, remove the `.fails`.
  it.fails('every lesson finishes — directly and via Học tiếp (B8 is stuck)', () => {
    const unfinished = inOrder
      .filter((l) => l.status !== 'done')
      .map((l) => `B${l.n} (${l.status}, ${l.stars}★, ${l.runs} runs)`);
    expect(unfinished, 'lessons not finishable on their own').toEqual([]);
    expect(chain.chainFailures, 'chain failures').toEqual([]);
    expect(chain.nextAfterChain, 'a lesson is still unfinished after the walk').toBeUndefined();
  });
});
