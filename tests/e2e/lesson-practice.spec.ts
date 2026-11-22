// Lesson mode (phase 06): the "Ôn theo bài" picker — 81 lessons in 16 topics, stars 1-3,
// "Học tiếp" points at the first unfinished lesson, a 6-item run through the extracted
// daily run loop, coins +5 per correct answer, no streak/daily-finish reward. Entry is the
// HUD button by tap, plus the VLM dialog entry. Lessons with no content yet show "Sắp có".
// Lesson mode is open from day one (no field stage 1 needed) and introduces untaught
// skills (unlike daily), so the spec seeds no facts.
import { type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitDialogSettled } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 3 });

type PlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean };

const isTouch = (info: TestInfo) => info.project.use.hasTouch === true;

async function boot(page: Page): Promise<void> {
  await page.goto('/');
  // The world build + store open can take over 30 s under parallel load on this VM; the
  // shared waitForStoreBoot helper only allows 30 s, so this spec waits longer here.
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'ready', { timeout: 120_000 });
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

async function openPicker(page: Page, touch: boolean): Promise<void> {
  const button = page.locator('#open-lesson');
  await expect(button).toBeVisible();
  if (touch) await button.tap();
  else await button.click();
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await expect(page.locator('#dialog-content')).toContainText('Chọn bài để luyện');
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
    const h = window.__lesson;
    return h ? { steps: h.steps() as PlannedStep[] | null } : null;
  });
  if (!hook?.steps) throw new Error('lesson skill hook missing');
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

/** Plays one whole lesson run and leaves the finish screen showing. */
async function playLessonRun(page: Page, touch: boolean): Promise<number> {
  let items = 0;
  for (;;) {
    const state = await page.evaluate(() => window.__lesson?.state() ?? null);
    if (!state) throw new Error('lesson hook missing');
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
  return items;
}

async function openTopic(page: Page, topic: number, touch: boolean): Promise<void> {
  const summary = page.locator(`details.lesson-topic[data-topic="${topic}"] summary`);
  const details = page.locator(`details.lesson-topic[data-topic="${topic}"]`);
  if (!(await details.evaluate((el) => (el as HTMLDetailsElement).open))) {
    if (touch) await summary.tap();
    else await summary.click();
    await expect(details).toHaveAttribute('open', '');
  }
}

async function pickLesson(page: Page, n: number, touch: boolean): Promise<void> {
  const row = page.locator(`button.lesson-row[data-lesson="${n}"]`);
  await expect(row).toBeVisible();
  if (touch) await row.tap();
  else await row.click();
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

const coins = (page: Page) => page.locator('#coins');

test('HUD button: at least 44 px, inside the HUD, right after the daily button, never over the movement controls', async ({
  page,
}, info) => {
  await boot(page);
  const button = page.locator('#hud #open-lesson');
  await expect(button).toBeVisible();
  await expect(button).toContainText('Ôn theo bài');
  expect(
    await page.evaluate(() => document.getElementById('open-daily')?.nextElementSibling?.id ?? ''),
    'lesson button sits right after the daily button',
  ).toBe('open-lesson');
  const box = await button.boundingBox();
  if (!box) throw new Error('lesson button has no box');
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
    expect(overlap, `lesson button overlaps ${id}`).toBe(false);
    expect(box.y + box.height, `lesson button sits above ${id}`).toBeLessThanOrEqual(other.y);
  }
  await page.screenshot({ path: info.outputPath(`hud-${info.project.name}.png`) });
});

test('picker: 81 lessons in 16 topics, "Học tiếp" points at B1, no-content lessons show "Sắp có"', async ({
  page,
}, info) => {
  const touch = isTouch(info);
  await boot(page);
  await openPicker(page, touch);
  await expect(page.locator('#lesson-continue')).toContainText('Học tiếp: Bài 1');
  await expect(page.locator('details.lesson-topic')).toHaveCount(16);
  await expect(page.locator('button.lesson-row')).toHaveCount(81);
  // Topic 1 (B1's topic) is open; B1 and B2 are playable at 0 stars.
  await expect(page.locator('details.lesson-topic[data-topic="1"]')).toHaveAttribute('open', '');
  const b1 = page.locator('button.lesson-row[data-lesson="1"]');
  await expect(b1).toBeEnabled();
  await expect(b1.locator('.lesson-row__stars')).toHaveAttribute('data-stars', '0');
  const b2 = page.locator('button.lesson-row[data-lesson="2"]');
  await expect(b2).toBeEnabled();
  await expect(b2).toContainText('Cộng, trừ trong phạm vi 1 000');
  // B7 mixes nothing, so it is the no-content example now that B2 landed (phase 09).
  const b7 = page.locator('button.lesson-row[data-lesson="7"]');
  await expect(b7).toBeDisabled();
  await expect(b7).toContainText('Sắp có');
  // Topic 4 opens on tap; B25 is playable there.
  await openTopic(page, 4, touch);
  const b25 = page.locator('button.lesson-row[data-lesson="25"]');
  await expect(b25).toBeVisible();
  await expect(b25).toBeEnabled();
  await expect(b25).toContainText('Phép chia hết, phép chia có dư');
  await page.screenshot({ path: info.outputPath(`picker-${info.project.name}.png`) });
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});

test('VLM entry: the Milo dialog opens the picker by tap', async ({ page }, info) => {
  const touch = isTouch(info);
  await boot(page);
  await openMilo(page, touch);
  const button = page.locator('#dialog-content #lesson-guide-button');
  await expect(button).toBeVisible();
  const box = await button.boundingBox();
  if (!box) throw new Error('lesson guide button has no box');
  expect(box.height, 'guide button height').toBeGreaterThanOrEqual(44);
  if (touch) await button.tap();
  else await button.click();
  await expect(page.locator('#dialog-content')).toContainText('Chọn bài để luyện');
  await expect(page.locator('#lesson-continue')).toContainText('Học tiếp: Bài 1');
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});

test('run B2: answer all 6, stars before/after show, coins in store, picker stars update', async ({
  page,
}, info) => {
  const touch = isTouch(info);
  await boot(page);
  await openPicker(page, touch);
  await pickLesson(page, 2, touch);
  await expect(page.locator('#dialog-content')).toContainText(
    'Bài 2 · Cộng, trừ trong phạm vi 1 000 · Câu 1/6',
  );
  expect(await playLessonRun(page, touch)).toBe(6);
  const content = page.locator('#dialog-content');
  await expect(content).toContainText('Xong bài 2!');
  await expect(content).toContainText('☆☆☆ → ★☆☆');
  await expect(content).toContainText('+30 xu');
  await expect(coins(page)).toHaveText('30');
  const snap = await page.evaluate(() => window.__game?.snapshot());
  for (const id of [
    'add-sub-mental-round',
    'add-sub-1000',
    'add-sub-1000-wp',
    'add-sub-1000-chain',
    'add-sub-find-error',
    'add-missing-digit',
  ])
    expect(snap?.factStats[`sk:${id}`]?.attempts ?? 0).toBeGreaterThanOrEqual(1);
  // Back to the picker: B2 now shows 1 star.
  const back = page.locator('#lesson-back');
  if (touch) await back.tap();
  else await back.click();
  await expect(page.locator('#dialog-content')).toContainText('Chọn bài để luyện');
  await expect(
    page.locator('button.lesson-row[data-lesson="2"] .lesson-row__stars'),
  ).toHaveAttribute('data-stars', '1');
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});

test('run B25: answer all 6, stars before/after show, coins in store, picker stars update', async ({
  page,
}, info) => {
  const touch = isTouch(info);
  await boot(page);
  await openPicker(page, touch);
  await openTopic(page, 4, touch);
  await pickLesson(page, 25, touch);
  await expect(page.locator('#dialog-content')).toContainText(
    'Bài 25 · Phép chia hết, phép chia có dư · Câu 1/6',
  );
  expect(await playLessonRun(page, touch)).toBe(6);
  const content = page.locator('#dialog-content');
  await expect(content).toContainText('Xong bài 25!');
  await expect(content).toContainText('☆☆☆ → ★☆☆');
  await expect(content).toContainText('+30 xu');
  await expect(coins(page)).toHaveText('30');
  const snap = await page.evaluate(() => window.__game?.snapshot());
  for (const id of ['div-rem-floor', 'div-rem-ceil', 'choose-all-correct', 'tf-explain'])
    expect(snap?.factStats[`sk:${id}`]?.attempts ?? 0).toBeGreaterThanOrEqual(1);
  // Back to the picker: B25 now shows 1 star, and "Học tiếp" moved on from B1.
  const back = page.locator('#lesson-back');
  if (touch) await back.tap();
  else await back.click();
  await expect(page.locator('#dialog-content')).toContainText('Chọn bài để luyện');
  await openTopic(page, 4, touch);
  await expect(
    page.locator('button.lesson-row[data-lesson="25"] .lesson-row__stars'),
  ).toHaveAttribute('data-stars', '1');
  await page.screenshot({ path: info.outputPath(`finish-${info.project.name}.png`) });
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});

test('leaving mid-run keeps the answered items and pays their coins', async ({ page }, info) => {
  const touch = isTouch(info);
  await boot(page);
  await openPicker(page, touch);
  await openTopic(page, 4, touch);
  await pickLesson(page, 25, touch);
  const first = await page.evaluate(() => window.__lesson?.state().factKey ?? '');
  if ((await page.evaluate(() => window.__lesson?.state().kind)) === 'quiz')
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
  const leave = page.locator('#dialog-content .daily-leave');
  if (touch) await leave.tap();
  else await leave.click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  const snap = await page.evaluate(() => window.__game?.snapshot());
  expect(snap?.factStats[first]?.attempts ?? 0).toBeGreaterThanOrEqual(1);
  expect(snap?.wallet.coins).toBe(5);
});

test('tables lesson B5: quiz items play through the same run loop', async ({ page }, info) => {
  const touch = isTouch(info);
  await boot(page);
  await openPicker(page, touch);
  await pickLesson(page, 5, touch);
  await expect(page.locator('#dialog-content')).toContainText(
    'Bài 5 · Bảng nhân 3, bảng chia 3 · Câu 1/6',
  );
  expect(await playLessonRun(page, touch)).toBe(6);
  await expect(page.locator('#dialog-content')).toContainText('Xong bài 5!');
  await expect(coins(page)).toHaveText('30');
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});

declare global {
  interface Window {
    __lesson?: {
      state(): {
        index: number;
        total: number;
        kind: 'quiz' | 'skill';
        factKey: string;
        skillId?: string;
      };
      steps(): PlannedStep[] | null;
    };
  }
}
