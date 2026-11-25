// Lesson walkthrough e2e (phase 21 staging, TASK R18): a sample of "Học tiếp"
// B1→B81 through the real UI — the first and last lesson of each of the 16 topics
// plus the 9 R8-thickened lessons (B3, B13, B16, B24, B27, B31, B32, B33, B51).
// Each sampled lesson: seed every earlier lesson to 3 stars, check "Học tiếp"
// points at it (or past it when it is already done), play one run through the UI
// (tap/click, no hooks to answer), check it advances — or stays, when one run
// cannot finish it. Desktop-chromium + tablet-portrait only (R18); the full
// 81-lesson walk lives in the vitest layer (src/learning/lesson-walkthrough.test.ts).
// B8 used to be the known exception (it could not reach 3 stars even with
// perfect play: its mix spread starved B6's leftover table-4 facts), fixed in
// R25 direction 1 — so it gets its own test that plays up to 3 runs and
// asserts it reaches 3 stars on desktop (tablet: runs play, "Học tiếp" stays).
// Solver + seeding live in ./lesson-walkthrough-helpers (shared with the manual script).
import { type Page, test } from '@playwright/test';
import { lessonByNumber } from '../../src/learning/kntt-lesson-index';
import { expect, SLOW_TEST_MS } from './legacy-live-save-fixtures';
import {
  backToPicker,
  boot,
  closePicker,
  continueLesson,
  isTouch,
  openPicker,
  playViaContinue,
  rowStars,
  seedBefore,
} from './lesson-walkthrough-helpers';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 3 });

const onlySampleProjects = (projectName: string) =>
  test.skip(
    projectName !== 'desktop-chromium' && projectName !== 'tablet-portrait',
    'R18 walkthrough sample runs on desktop + tablet-portrait only',
  );

// After one perfect run, what the picker must show for lesson n.
type Expectation = 'finish' | 'progress' | 'stays0' | 'mix';

/** One sampled lesson: seed, check "Học tiếp", play one run, check the outcome. */
async function checkLesson(
  page: Page,
  touch: boolean,
  n: number,
  expectation: Expectation,
): Promise<void> {
  await seedBefore(page, n);
  await openPicker(page, touch);
  const before = await rowStars(page, n);
  if (expectation === 'mix' && before === 3) {
    // A mix lesson whose sources are all mastered is already done: "Học tiếp"
    // skips it — past it to the next unfinished lesson, or nowhere at all when
    // every lesson after it is done too (late mixes: B75, B76, B81 seed the
    // whole tail to 3 stars, so the picker shows "all done" and has no button).
    const target = await continueLesson(page);
    if (target === undefined) {
      await expect(page.locator('.lesson-all-done')).toBeVisible();
    } else {
      expect(target, `Học tiếp must skip done B${n}`).toBeGreaterThan(n);
    }
    await closePicker(page);
    return;
  }
  expect(await continueLesson(page), `Học tiếp must point at B${n}`).toBe(n);
  await playViaContinue(page, touch, n);
  await backToPicker(page, touch);
  let after = await rowStars(page, n);
  let runs = 1;
  // 'finish' lessons earn 3 stars in one perfect run in the pure layer, but a
  // Leitner box only promotes when the item is answered in under 8 s — and on
  // tablet the wall time per item is 9–24 s (measured from the trace: slow
  // SwiftShader rendering + touch actionability waits on this VM), so promotion
  // almost never happens there. Desktop gets the strict check (3 stars, move
  // on) with up to 3 runs of timing slack; tablet only checks that the run
  // played and the stars moved — the 3-star logic is proven by the vitest
  // layer and by desktop. (A real child on a real iPad answers in seconds.)
  while (expectation === 'finish' && !touch && after < 3 && runs < 3) {
    await playViaContinue(page, touch, n);
    await backToPicker(page, touch);
    after = await rowStars(page, n);
    runs += 1;
  }
  if (expectation === 'finish') {
    if (touch) {
      // Tablet: some lessons' items are fast enough to reach 3 stars in one
      // run (B33, B51 did), others are not — either way "Học tiếp" must not
      // point backwards.
      expect(
        after,
        `B${n} stars after ${runs} run(s) (tablet: progress only)`,
      ).toBeGreaterThanOrEqual(1);
      expect(
        await continueLesson(page),
        `Học tiếp must not go back from B${n} (tablet)`,
      ).toBeGreaterThanOrEqual(n);
    } else {
      expect(after, `B${n} stars after ${runs} run(s)`).toBe(3);
      expect(await continueLesson(page), `Học tiếp must move on from B${n}`).toBeGreaterThan(n);
    }
  } else if (expectation === 'progress') {
    expect(after, `B${n} stars after one run`).toBeGreaterThanOrEqual(1);
    expect(after, `B${n} is not finished after one run`).toBeLessThan(3);
    expect(await continueLesson(page), `Học tiếp must stay on B${n}`).toBe(n);
  } else if (expectation === 'stays0') {
    expect(after, `B${n} stars after one run`).toBe(0);
    expect(await continueLesson(page), `Học tiếp must stay on B${n}`).toBe(n);
  } else {
    // mix with something still to learn: one run cannot finish it.
    expect(after, `B${n} is not finished after one run`).toBeLessThan(3);
    expect(await continueLesson(page), `Học tiếp must stay on B${n}`).toBe(n);
  }
  await closePicker(page);
}

// 'finish': 1–2 skills — one perfect run (6 items) earns 3 stars in the pure
// layer. Desktop asserts exactly that (up to 3 runs of timing slack); tablet
// only asserts the stars moved, because a tablet item takes 9–24 s wall time
// and the Leitner box only promotes under 8 s (see checkLesson).
// 'progress': 3–6 skills — one run earns 1–2 stars, "Học tiếp" stays.
// 'stays0': one run cannot move the stars yet (tables B9: 6/19 keys attempted;
//   B66: 9 skills, 6 items cover only 6 of them).
const SAMPLE: readonly { n: number; kind: Expectation }[] = [
  { n: 1, kind: 'progress' },
  { n: 3, kind: 'finish' },
  { n: 9, kind: 'stays0' },
  { n: 13, kind: 'finish' },
  { n: 15, kind: 'mix' },
  { n: 16, kind: 'finish' },
  { n: 22, kind: 'mix' },
  { n: 23, kind: 'progress' },
  { n: 24, kind: 'finish' },
  { n: 27, kind: 'finish' },
  { n: 29, kind: 'mix' },
  { n: 30, kind: 'finish' },
  { n: 31, kind: 'finish' },
  { n: 32, kind: 'finish' },
  { n: 33, kind: 'finish' },
  { n: 35, kind: 'mix' },
  { n: 36, kind: 'progress' },
  { n: 40, kind: 'mix' },
  { n: 41, kind: 'mix' },
  { n: 44, kind: 'mix' },
  { n: 45, kind: 'finish' },
  { n: 49, kind: 'mix' },
  { n: 50, kind: 'progress' },
  { n: 51, kind: 'finish' },
  { n: 53, kind: 'mix' },
  { n: 54, kind: 'progress' },
  { n: 58, kind: 'mix' },
  { n: 59, kind: 'finish' },
  { n: 62, kind: 'mix' },
  { n: 63, kind: 'progress' },
  { n: 65, kind: 'mix' },
  { n: 66, kind: 'stays0' },
  { n: 69, kind: 'mix' },
  { n: 70, kind: 'progress' },
  { n: 72, kind: 'mix' },
  { n: 73, kind: 'progress' },
  { n: 75, kind: 'mix' },
  { n: 76, kind: 'mix' },
  { n: 81, kind: 'mix' },
];

test('sample covers first+last lesson of each topic and the 9 R8 lessons', () => {
  // Static check (no browser needed): the sample is exactly the first/last lesson
  // plus B3, B13, B16, B24, B27, B31, B32, B33, B51 (B16 is already a topic first).
  const topics = new Map<number, number[]>();
  for (const l of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16]) topics.set(l, []);
  for (let n = 1; n <= 81; n++) topics.get(lessonByNumber(n)?.topic ?? 0)?.push(n);
  const ends = [...topics.values()].flatMap((ns) => ns.slice(0, 1).concat(ns.slice(-1)));
  const r8 = [3, 13, 16, 24, 27, 31, 32, 33, 51];
  // B8 is a topic end too, but it has its own dedicated test (it needs up to
  // 3 runs: its own skills start at box 1), so it is not in SAMPLE: 40
  // lessons sampled in total (39 here + B8).
  const want = [...new Set([...ends, ...r8])].filter((n) => n !== 8).sort((a, b) => a - b);
  expect(
    SAMPLE.map((s) => s.n),
    'sample = topic ends + R8 lessons (except B8, tested separately)',
  ).toEqual(want);
  expect(SAMPLE.length, 'sample size (39 here + B8 = 40)').toBe(39);
});

for (const group of [
  [1, 3],
  [9, 13, 15, 16],
  [22, 23, 24, 27, 29],
  [30, 31, 32, 33, 35],
  [36, 40, 41, 44],
  [45, 49, 50, 51, 53],
  [54, 58, 59, 62],
  [63, 65, 66, 69],
  [70, 72, 73, 75],
  [76, 81],
]) {
  test(`walkthrough sample: B${group.join(', B')}`, async ({ page }, info) => {
    onlySampleProjects(info.project.name);
    const touch = isTouch(info);
    await boot(page);
    for (const n of group) {
      const kind = SAMPLE.find((s) => s.n === n)?.kind;
      if (!kind) throw new Error(`B${n} is not in the sample`);
      await checkLesson(page, touch, n, kind);
    }
  });
}

test('B8 (R25 fix): the weakest keys are picked and it reaches 3 stars', async ({ page }, info) => {
  onlySampleProjects(info.project.name);
  const touch = isTouch(info);
  await boot(page);
  // Seed B1–B7 the way perfect play leaves them: everything at box 4 except
  // B6's leftover table-4 facts (mul:4x4, div:32/4, div:36/4) at box 3 — the
  // three keys the old mix spread never picked (see the vitest walkthrough).
  // B8's own skills (sk:pattern-add, sk:pattern-sub) are not seeded: they
  // start at box 1, so B8 starts at 0 stars and needs up to 3 perfect runs
  // (run 1 lifts the table-4 facts to box 4, runs 1–3 lift the own skills
  // 1→4) — the same 3 runs the vitest layer measures.
  await seedBefore(page, 8, {
    'mul:4x4': { box: 3, attempts: 2, correct: 2 },
    'div:32/4': { box: 3, attempts: 2, correct: 2 },
    'div:36/4': { box: 3, attempts: 2, correct: 2 },
  });
  await openPicker(page, touch);
  expect(await continueLesson(page), 'Học tiếp must point at B8').toBe(8);
  expect(await rowStars(page, 8), 'B8 stars before playing').toBe(0);
  let after = 0;
  let runs = 0;
  while (after < 3 && runs < 3) {
    await playViaContinue(page, touch, 8);
    await backToPicker(page, touch);
    after = await rowStars(page, 8);
    runs += 1;
  }
  if (touch) {
    // Tablet: a Leitner box only promotes when the item is answered in under
    // 8 s, and a tablet item takes 9–24 s on this VM — so 3 stars is not
    // guaranteed here, the same split as the 'finish' lessons in checkLesson.
    // The runs must still play through touch and "Học tiếp" must not go back.
    // On a fast runner the items do beat 8 s, B8 reaches 3 stars and "Học tiếp"
    // moves on to B9 — so the pointer depends on the stars actually earned.
    const next = await continueLesson(page);
    if (after >= 3) expect(next, 'Học tiếp must move on from B8 (tablet)').toBeGreaterThan(8);
    else expect(next, 'Học tiếp must stay on B8 (tablet)').toBe(8);
  } else {
    expect(after, `B8 stars after ${runs} run(s)`).toBe(3);
    expect(await continueLesson(page), 'Học tiếp must move on from B8').toBeGreaterThan(8);
  }
  await closePicker(page);
});
