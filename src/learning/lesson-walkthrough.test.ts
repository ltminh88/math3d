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

  // B8 used to be stuck at 2 stars (mix spread starved its B6 table-4
  // leftovers) — fixed in R25 direction 1: mix runs pick the weakest keys
  // first globally, so the three box-3 keys are picked in the next run.
  it('every lesson finishes — directly and via Học tiếp', () => {
    const unfinished = inOrder
      .filter((l) => l.status !== 'done')
      .map((l) => `B${l.n} (${l.status}, ${l.stars}★, ${l.runs} runs)`);
    expect(unfinished, 'lessons not finishable on their own').toEqual([]);
    expect(chain.chainFailures, 'chain failures').toEqual([]);
    expect(chain.nextAfterChain, 'a lesson is still unfinished after the walk').toBeUndefined();
  });
});
