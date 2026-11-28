// Daily focus mix (boost, Phase 4A): a seeded weak add/sub + length profile plans
// a daily set of 10 with exactly 6 focus items. The keys are collected by walking
// the run with the daily test hook; each item is solved through the same step UI
// as daily-practice.spec.ts (plus the order step, which the length skills use).
import { type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitDialogSettled } from './legacy-live-save-fixtures';
import { solveSetClock } from './lesson-walkthrough-helpers';

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
  | { kind: 'verdict'; answer: boolean }
  | { kind: 'set-clock'; h: number; m: number }
  | { kind: 'order'; tiles: string[]; answer: number[] }
  | { kind: 'match'; left: string[]; right: string[]; pairs: number[] };

const isTouch = (info: TestInfo) => info.project.use.hasTouch === true;

async function boot(page: Page): Promise<void> {
  await seedDate(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'ready', { timeout: 120_000 });
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() => window.__game?.seedStageProgress('field', [1]));
  // Weak focus profile: accuracy 0.2 / 0.5 / 0.8 / 0.9 (seeded stats have no
  // `recent`, so the weak score reads correct/attempts). No labelled bugs are
  // seeded, so no focus slot substitutes a format key.
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'sk:add-sub-1000': { box: 1, attempts: 10, correct: 2 },
      'sk:meas-len-convert': { box: 2, attempts: 10, correct: 5 },
      'sk:add-sub-column': { box: 1, attempts: 10, correct: 8 },
      'sk:meas-ruler-read': { box: 3, attempts: 10, correct: 9 },
      'mul:3x4': { box: 1 },
      'mul:3x5': { box: 1 },
      'mul:3x6': { box: 1 },
      'mul:3x7': { box: 2 },
      'mul:4x4': { box: 5 },
      'mul:4x5': { box: 2 },
      'mul:4x6': { box: 1 },
      'mul:4x7': { box: 3 },
      'div:12/3': { box: 1 },
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
    else if (step.kind === 'set-clock') await solveSetClock(page, row, step, touch);
    else if (step.kind === 'order') {
      for (const ti of step.answer)
        await press(
          page,
          row
            .locator('.kit-order__bank')
            .getByRole('button', { name: step.tiles[ti], exact: true }),
          touch,
        );
      await press(page, row.locator('.kit-order__done'), touch);
    } else if (step.kind === 'match') throw new Error('match steps are not played by this solver');
    else {
      for (const id of step.ids) await press(page, row.locator(`[data-choice="${id}"]`), touch);
      await press(page, row.locator('.kit-multi__done'), touch);
    }
    await expect(row).toHaveClass(/kit-step--done/);
  }
  await expect(panel.locator('.feedback')).toHaveClass(/success/);
}

/** Walks the whole daily run, collecting each item's fact key. */
async function collectDailyKeys(page: Page, touch: boolean): Promise<string[]> {
  const keys: string[] = [];
  for (;;) {
    const state = await page.evaluate(() => window.__daily?.state() ?? null);
    if (!state) throw new Error('daily hook missing');
    if (state.index >= state.total) break;
    keys.push(state.factKey);
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
  return keys;
}

test('a seeded weak profile gets 6 focus items out of 10', async ({ page }, info) => {
  const touch = isTouch(info);
  await boot(page);
  await openDaily(page, touch);
  const keys = await collectDailyKeys(page, touch);
  expect(keys).toHaveLength(10);
  const focus = keys.filter((k) => k.startsWith('sk:'));
  expect(focus).toHaveLength(6);
  // The weakest skill (add-sub-1000, accuracy 0.2) is practised twice.
  expect(focus.filter((k) => k === 'sk:add-sub-1000')).toHaveLength(2);
  expect(new Set(focus).size).toBe(4);
  await waitDialogSettled(page);
});
