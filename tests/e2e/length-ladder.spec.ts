// Length ladder (boost, Phase 1B): B7 and B30 lesson runs, tap() only.
// Seeding: the lesson's other skills sit at box 5 and the eight meas-len-*
// skills stay unseeded (box 1), so the planner puts a length item first; two
// 6-item runs cover all eight ids (longest unseen first in the second run).
import { type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { skillsOfLesson } from '../../src/learning/kntt-lesson-index';
import type { LessonPlannedStep } from '../../src/ui/lesson-test-hook';
import { expect, SLOW_TEST_MS, waitDialogSettled } from './legacy-live-save-fixtures';
import { boot, isTouch, openPicker } from './lesson-walkthrough-helpers';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 3 });

const LEN_IDS = [
  'meas-len-ladder',
  'meas-len-convert',
  'meas-len-convert-far',
  'meas-len-compare',
  'meas-len-order',
  'meas-len-choose-unit',
  'meas-len-mixed',
  'meas-len-add-sub',
] as const;

async function seedOthersBox5(page: Page, lessonN: number): Promise<void> {
  const others = skillsOfLesson(lessonN).filter((k) => !k.startsWith('sk:meas-len-'));
  const stats = Object.fromEntries(others.map((k) => [k, { box: 5, attempts: 5, correct: 5 }]));
  await page.evaluate((s) => window.__game?.seedFactStats(s), stats);
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

async function solveSkillItem(page: Page, touch: boolean): Promise<void> {
  const steps: LessonPlannedStep[] | null = await page.evaluate(
    () => window.__lesson?.steps() ?? null,
  );
  if (!steps) throw new Error('lesson skill hook missing');
  const panel = page.locator('#dialog-content');
  for (const [i, step] of steps.entries()) {
    const row = panel.locator('.daily-steps .kit-step').nth(i);
    if (step.kind === 'number') await typeNumber(page, row.locator('.kit-pad'), step.answer, touch);
    else if (step.kind === 'choice')
      await press(
        page,
        row.locator('.kit-choices').getByRole('button', { name: step.label, exact: true }),
        touch,
      );
    else if (step.kind === 'order') {
      // Tap the bank tiles in the answer's order, then "Xong".
      for (const tileIndex of step.answer) {
        const label = step.tiles[tileIndex];
        if (label === undefined) throw new Error('order step answer index out of range');
        await press(
          page,
          row.locator('.kit-order__bank').getByRole('button', { name: label, exact: true }),
          touch,
        );
      }
      await press(page, row.locator('.kit-order__done'), touch);
    } else throw new Error(`unexpected step kind in a length item`);
    await expect(row).toHaveClass(/kit-step--done/);
  }
  await expect(panel.locator('.feedback')).toHaveClass(/success/);
}

/** Plays one whole lesson run, recording each item's skill id. */
async function playRun(
  page: Page,
  touch: boolean,
  onItem: (skillId: string | undefined) => void,
): Promise<number> {
  let items = 0;
  for (;;) {
    const state = await page.evaluate(() => window.__lesson?.state() ?? null);
    if (!state) throw new Error('lesson hook missing');
    if (state.index >= state.total) break;
    if (state.kind !== 'skill') throw new Error(`unexpected ${state.kind} item in a length run`);
    onItem(state.skillId);
    items += 1;
    await solveSkillItem(page, touch);
    const next = page.locator('#dialog-content .daily-next');
    if (await next.isVisible()) {
      if (touch) await next.tap();
      else await next.click();
    } else throw new Error('no next button after solving an item');
  }
  return items;
}

async function replay(page: Page, touch: boolean): Promise<void> {
  const button = page.locator('#lesson-replay');
  if (touch) await button.tap();
  else await button.click();
}

async function playTwoRuns(page: Page, touch: boolean, lessonN: number): Promise<string[]> {
  const played: string[] = [];
  const collect = (id: string | undefined) => {
    if (id) played.push(id);
  };
  expect(await playRun(page, touch, collect)).toBe(6);
  await replay(page, touch);
  await expect(page.locator('#dialog-content')).toContainText(`Bài ${lessonN} ·`);
  expect(await playRun(page, touch, collect)).toBe(6);
  return played;
}

test('B7: two runs cover all eight length-ladder skills, solved by tap', async ({
  page,
}, info: TestInfo) => {
  const touch = isTouch(info);
  await boot(page);
  await seedOthersBox5(page, 7);
  await openPicker(page, touch);
  await openTopic(page, 1, touch);
  await pickLesson(page, 7, touch);
  await expect(page.locator('#dialog-content')).toContainText('Bài 7 ·');
  const played = await playTwoRuns(page, touch, 7);
  for (const id of LEN_IDS) expect(played, id).toContain(id);
  await expect(page.locator('#dialog-content')).toContainText('Xong bài 7!');
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});

test('B30: two runs cover all eight length-ladder skills, solved by tap', async ({
  page,
}, info: TestInfo) => {
  const touch = isTouch(info);
  await boot(page);
  await seedOthersBox5(page, 30);
  await openPicker(page, touch);
  await openTopic(page, 5, touch);
  await pickLesson(page, 30, touch);
  await expect(page.locator('#dialog-content')).toContainText('Bài 30 ·');
  const played = await playTwoRuns(page, touch, 30);
  for (const id of LEN_IDS) expect(played, id).toContain(id);
  await expect(page.locator('#dialog-content')).toContainText('Xong bài 30!');
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});
