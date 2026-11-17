// Daily practice (phase 11): a seeded date proves the across-days behaviour — day 1 completes
// (streak 1), a same-day replay pays no second finish reward, day 2 offers a new set
// (streak 2), a skipped day restarts at 1 with no sad copy. Entry is the HUD button by tap.
// The VLM entry is not covered here: guide-dialog.ts is shared with the sticker-book thread
// and locked until the coordinator confirms (see the PR body).
//
// The date is seeded by overriding Date.now only (addInitScript + __advanceDays): the app
// reads "today" exclusively through Date.now() (5 uses; no bare `new Date()` anywhere), while
// timers, rAF and IndexedDB keep running on real time. Playwright's own clock was tried
// first and does NOT work here: its paused virtual time stalls IndexedDB writes (a seed
// evaluate hung 4 minutes until a fastForward unblocked it) and freezes rAF, so clicks on
// the dialog close button never become actionable.
import { type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { expect, SLOW_TEST_MS } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 3 });

const DAY1_MS = new Date(2026, 10, 20, 8, 0, 0).getTime();

declare global {
  interface Window {
    __advanceDays?: (days: number) => void;
  }
}

async function seedDate(page: Page): Promise<void> {
  await page.addInitScript((startMs) => {
    let shiftMs = 0;
    Date.now = () => startMs + shiftMs;
    (window as unknown as { __advanceDays: (days: number) => void }).__advanceDays = (
      days: number,
    ) => {
      shiftMs += days * 24 * 60 * 60 * 1000;
    };
  }, DAY1_MS);
}

type PlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean };

const isTouch = (info: TestInfo) => info.project.use.hasTouch === true;

async function boot(page: Page, seedFacts: boolean): Promise<void> {
  await seedDate(page);
  await page.goto('/');
  // The world build + store open can take over 30 s under parallel load on this VM; the
  // shared waitForStoreBoot helper only allows 30 s, so this spec waits longer here.
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'ready', { timeout: 120_000 });
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  if (!seedFacts) return;
  await page.evaluate(() => window.__game?.seedStageProgress('field', [1]));
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'mul:3x4': { box: 1 },
      'mul:3x5': { box: 1 },
      'mul:3x6': { box: 1 },
      'mul:3x7': { box: 2 },
      'mul:4x4': { box: 1 },
      'mul:4x5': { box: 2 },
      'mul:4x6': { box: 1 },
      'mul:4x7': { box: 3 },
      'div:12/3': { box: 1 },
      'div:20/4': { box: 2 },
      'sk:wp-times-then-add': { box: 2 },
      'sk:pattern-skip-count': { box: 1 },
    }),
  );
}

async function openDaily(page: Page, touch: boolean): Promise<void> {
  const button = page.locator('#open-daily');
  await expect(button).toBeVisible();
  if (touch) await button.tap();
  else await button.click();
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await expect(page.locator('#dialog-content')).toContainText('Luyện tập hôm nay');
}

const blur = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function press(page: Page, target: Locator, touch: boolean): Promise<void> {
  if (touch) await target.tap();
  else {
    await target.focus();
    await page.keyboard.press('Enter');
  }
}

async function typeNumber(page: Page, pad: Locator, value: number, touch: boolean) {
  if (touch) {
    for (const digit of String(value))
      await pad.getByRole('button', { name: digit, exact: true }).tap();
    await pad.getByRole('button', { name: 'Xong' }).tap();
  } else {
    await blur(page);
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
  }
}

async function solveQuizItem(page: Page, touch: boolean): Promise<void> {
  const content = page.locator('#dialog-content');
  const equation = await content.locator('.equation').textContent();
  const m = equation?.match(/(\d+)\s*([×:])\s*(\d+)/);
  if (!m) throw new Error(`cannot parse equation: ${equation}`);
  const [a, b] = [Number(m[1]), Number(m[3])];
  const answer = m[2] === '×' ? a * b : a / b;
  const answers = content.locator('.answers .answer');
  const values = await answers.evaluateAll((els) =>
    els.map((el) => Number((el as HTMLElement).dataset.value)),
  );
  const index = values.indexOf(answer);
  if (index === -1) throw new Error(`answer ${answer} not among ${values}`);
  if (touch) await answers.nth(index).tap();
  else await answers.nth(index).click();
  await expect(content.locator('#feedback')).toHaveClass(/success/);
}

async function solveSkillItem(page: Page, touch: boolean): Promise<void> {
  const hook = await page.evaluate(() => {
    const h = window.__daily;
    return h ? { steps: h.steps() as PlannedStep[] | null } : null;
  });
  if (!hook?.steps) throw new Error('daily skill hook missing');
  const panel = page.locator('#dialog-content');
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  if (coarse) await expect(panel).not.toContainText(/phím|Enter|nhấn [A-Z]\b/);
  const hint = panel.locator('.daily-hint');
  if (touch) await hint.tap();
  else await hint.click();
  await expect(panel.locator('.daily-hint-area')).toBeVisible();
  for (const [i, step] of hook.steps.entries()) {
    const row = panel.locator('.daily-steps .kit-step').nth(i);
    if (step.kind === 'number') await typeNumber(page, row.locator('.kit-pad'), step.answer, touch);
    else if (step.kind === 'choice')
      await press(
        page,
        row.locator('.kit-choices').getByRole('button', { name: step.label, exact: true }),
        touch,
      );
    else if (step.kind === 'verdict')
      await press(page, row.locator(`[data-verdict="${step.answer}"]`), touch);
    else {
      for (const id of step.ids) await press(page, row.locator(`[data-choice="${id}"]`), touch);
      await press(page, row.locator('.kit-multi__done'), touch);
    }
    await expect(row).toHaveClass(/kit-step--done/);
  }
  await expect(panel.locator('.feedback')).toHaveClass(/success/);
}

/** Plays one whole daily run (10 items) and leaves the finish screen showing. */
async function playDailyRun(page: Page, touch: boolean): Promise<number> {
  let items = 0;
  for (;;) {
    const state = await page.evaluate(() => window.__daily?.state() ?? null);
    if (!state) throw new Error('daily hook missing');
    if (state.index >= state.total) break;
    items += 1;
    if (state.kind === 'quiz') await solveQuizItem(page, touch);
    else await solveSkillItem(page, touch);
    const nextQuiz = page.locator('#dialog-content #next-question');
    const nextSkill = page.locator('#dialog-content .daily-next');
    if (await nextQuiz.isVisible()) {
      if (touch) await nextQuiz.tap();
      else await nextQuiz.click();
    } else if (await nextSkill.isVisible()) {
      if (touch) await nextSkill.tap();
      else await nextSkill.click();
    } else throw new Error('no next button after solving an item');
  }
  await expect(page.locator('#dialog-content')).toContainText('Xong rồi!');
  return items;
}

async function closeDaily(page: Page, touch: boolean): Promise<void> {
  const back = page.locator('#daily-back');
  if (touch) await back.tap();
  else await back.click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
}

async function openMilo(page: Page, touch: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.teleport(-3, 3.6));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Nói chuyện với VLM');
  if (touch) await interact.tap();
  else await interact.click();
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await expect(page.locator('#dialog-content')).toContainText('Chào bạn, mình là VLM!');
}

const dailyOf = (page: Page) => page.evaluate(() => window.__game?.snapshot()?.daily);
const coins = (page: Page) => page.locator('#coins');

test('locked: the daily button shows the locked line before field stage 1', async ({
  page,
}, info) => {
  const touch = isTouch(info);
  await boot(page, false);
  await openDaily(page, touch);
  await expect(page.locator('#dialog-content')).toContainText(
    'Luyện tập hôm nay sẽ mở sau khi con qua Cánh Đồng Phép Tính.',
  );
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  // VLM shows the locked line too (no entry button), and the quest card stays silent.
  await openMilo(page, touch);
  await expect(page.locator('#dialog-content')).toContainText(
    'Luyện tập hôm nay sẽ mở sau khi con qua Cánh Đồng Phép Tính.',
  );
  await expect(page.locator('#dialog-content #daily-guide-button')).toHaveCount(0);
  await expect(page.locator('#quest-daily')).toHaveCount(0);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});

test('VLM entry: the Milo dialog opens the daily run by tap', async ({ page }, info) => {
  const touch = isTouch(info);
  await boot(page, true);
  await openMilo(page, touch);
  const content = page.locator('#dialog-content');
  const button = content.locator('#daily-guide-button');
  await expect(button).toBeVisible();
  await expect(content.locator('.daily-guide-streak')).toHaveCount(0);
  const box = await button.boundingBox();
  if (!box) throw new Error('daily guide button has no box');
  expect(box.height, 'guide button height').toBeGreaterThanOrEqual(44);
  // The dialog fits the viewport (no overflow on phone/tablet).
  const dialogBox = await page.locator('#dialog').boundingBox();
  const viewport = page.viewportSize();
  if (!dialogBox || !viewport) throw new Error('no dialog/viewport box');
  expect(dialogBox.x).toBeGreaterThanOrEqual(0);
  expect(dialogBox.y).toBeGreaterThanOrEqual(0);
  expect(dialogBox.x + dialogBox.width).toBeLessThanOrEqual(viewport.width);
  expect(dialogBox.y + dialogBox.height).toBeLessThanOrEqual(viewport.height);
  if (touch) await button.tap();
  else await button.click();
  await expect(page.locator('#dialog-content')).toContainText('Luyện tập hôm nay · Câu 1/10');
  await expect(page.locator('#dialog-content .equation, #dialog-content .daily-steps')).toHaveCount(
    1,
  );
  // Leave without playing: the run is not counted.
  const leave = page.locator('#dialog-content .daily-leave');
  if (touch) await leave.tap();
  else await leave.click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  expect(await dailyOf(page)).toBeUndefined();
});

test('HUD button: at least 44 px, inside the HUD, never over the movement controls', async ({
  page,
}, info) => {
  await boot(page, false);
  const button = page.locator('#hud #open-daily');
  await expect(button).toBeVisible();
  await expect(button).toContainText('Luyện tập hôm nay');
  const box = await button.boundingBox();
  if (!box) throw new Error('daily button has no box');
  expect(box.height, 'button height').toBeGreaterThanOrEqual(44);
  expect(box.width, 'button width').toBeGreaterThanOrEqual(44);
  for (const id of ['#joystick', '#interact', '#jump']) {
    const other = await page.locator(id).boundingBox();
    if (!other) continue;
    const overlap =
      box.x < other.x + other.width &&
      box.x + box.width > other.x &&
      box.y < other.y + other.height &&
      box.y + box.height > other.y;
    expect(overlap, `daily button overlaps ${id}`).toBe(false);
    expect(box.y + box.height, `daily button sits above ${id}`).toBeLessThanOrEqual(other.y);
  }
  await page.screenshot({ path: info.outputPath(`hud-${info.project.name}.png`) });
});

test('leaving mid-run keeps the answered items and does not count the run', async ({
  page,
}, info) => {
  const touch = isTouch(info);
  await boot(page, true);
  await openDaily(page, touch);
  const first = await page.evaluate(() => window.__daily?.state().factKey ?? '');
  if ((await page.evaluate(() => window.__daily?.state().kind)) === 'quiz')
    await solveQuizItem(page, touch);
  else await solveSkillItem(page, touch);
  const nextQuiz = page.locator('#dialog-content #next-question');
  const nextSkill = page.locator('#dialog-content .daily-next');
  if (await nextQuiz.isVisible()) {
    if (touch) await nextQuiz.tap();
    else await nextQuiz.click();
  } else {
    if (touch) await nextSkill.tap();
    else await nextSkill.click();
  }
  const second = await page.evaluate(() => window.__daily?.state().factKey ?? '');
  if ((await page.evaluate(() => window.__daily?.state().kind)) === 'quiz')
    await solveQuizItem(page, touch);
  else await solveSkillItem(page, touch);
  const leave = page.locator('#dialog-content .daily-leave');
  if (touch) await leave.tap();
  else await leave.click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  const snap = await page.evaluate(() => window.__game?.snapshot());
  expect(snap?.factStats[first]?.attempts ?? 0).toBeGreaterThanOrEqual(1);
  expect(snap?.factStats[second]?.attempts ?? 0).toBeGreaterThanOrEqual(1);
  expect(snap?.daily).toBeUndefined();
  expect(snap?.wallet.coins).toBe(10);
});

test('day 1 → replay → day 2 → skipped day: streak 1 → 1 → 2 → 1, coins, no sad copy', async ({
  page,
}, info) => {
  // 40 items × 2 clicks: under SwiftShader the dialog's backdrop blur holds the world near
  // 1 frame/s, so Playwright's stability check alone costs seconds per click (trace: 1–21 s).
  // The behaviour is correct; the test just needs a longer budget on this machine (tablets
  // run ~1.5× slower than desktop here, so the budget is 28 minutes).
  test.setTimeout(SLOW_TEST_MS * 7);
  const touch = isTouch(info);
  await boot(page, true);

  // Day 1: first run, 10 items, streak 1, +60 coins (10 × 5 + 10 finish).
  await expect(page.locator('#quest-daily')).toHaveText('Hôm nay: chưa luyện');
  await openDaily(page, touch);
  await expect(page.locator('#dialog-content .daily-note')).toHaveCount(0);
  expect(await playDailyRun(page, touch)).toBe(10);
  await expect(page.locator('#dialog-content')).toContainText('Bạn đã luyện 1 ngày liên tiếp!');
  await expect(coins(page)).toHaveText('60');
  const day1 = await dailyOf(page);
  expect(day1?.dailyStreak).toBe(1);
  await closeDaily(page, touch);
  // The quest card now says today is done, and VLM shows the streak.
  await expect(page.locator('#quest-daily')).toHaveText('Hôm nay: đã luyện ✓');
  await openMilo(page, touch);
  await expect(page.locator('#dialog-content .daily-guide-streak')).toContainText(
    'Bạn đã luyện 1 ngày liên tiếp!',
  );
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');

  // Same-day replay: the already-done note shows; no second finish reward, streak stays 1.
  await openDaily(page, touch);
  await expect(page.locator('#dialog-content .daily-note')).toContainText(
    'Hôm nay con đã luyện rồi.',
  );
  expect(await playDailyRun(page, touch)).toBe(10);
  await expect(page.locator('#dialog-content')).toContainText('Bạn đã luyện 1 ngày liên tiếp!');
  await expect(coins(page)).toHaveText('110');
  expect(await dailyOf(page)).toEqual(day1);
  await closeDaily(page, touch);

  // Day 2: a new set, streak 2.
  await page.evaluate(() => window.__advanceDays?.(1));
  await openDaily(page, touch);
  expect(await playDailyRun(page, touch)).toBe(10);
  await expect(page.locator('#dialog-content')).toContainText('Bạn đã luyện 2 ngày liên tiếp!');
  await expect(coins(page)).toHaveText('170');
  const day2 = await dailyOf(page);
  expect(day2?.dailyStreak).toBe(2);
  expect(day2?.lastDailyDay).toBe((day1?.lastDailyDay ?? 0) + 1);
  await closeDaily(page, touch);

  // Day 4 (day 3 skipped): the streak restarts at 1, with no sad copy anywhere.
  await page.evaluate(() => window.__advanceDays?.(2));
  await openDaily(page, touch);
  expect(await playDailyRun(page, touch)).toBe(10);
  const content = page.locator('#dialog-content');
  await expect(content).toContainText('Bạn đã luyện 1 ngày liên tiếp!');
  await expect(content).not.toContainText(/mất chuỗi|đứt chuỗi|buồn/i);
  await expect(coins(page)).toHaveText('230');
  const day4 = await dailyOf(page);
  expect(day4?.dailyStreak).toBe(1);
  expect(day4?.lastDailyDay).toBe((day1?.lastDailyDay ?? 0) + 3);
  await closeDaily(page, touch);
});
