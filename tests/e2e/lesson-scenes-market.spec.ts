// Market scenes in the dialog (phase 17): clock, calendar, money notes, data
// table/tally/bag/dice. Lesson mode (phase 06) is not merged yet, so these tests
// drive the same dialog host through daily practice: one seeded skill per test,
// the picture shows, no raw keys, and the item is answerable by tap.
import { type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { expect, SLOW_TEST_MS } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 3 });

const DAY1_MS = new Date(2026, 10, 20, 8, 0, 0).getTime();

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

async function boot(page: Page, skillId: string): Promise<void> {
  await seedDate(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'ready', { timeout: 120_000 });
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() => window.__game?.seedStageProgress('field', [1]));
  await page.evaluate((id) => window.__game?.seedFactStats({ [`sk:${id}`]: { box: 1 } }), skillId);
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

async function solveSkillItem(page: Page, touch: boolean): Promise<void> {
  const hook = await page.evaluate(() => {
    const h = window.__daily;
    return h ? { steps: h.steps() as PlannedStep[] | null } : null;
  });
  if (!hook?.steps) throw new Error('daily skill hook missing');
  const panel = page.locator('#dialog-content');
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

async function closeDaily(page: Page, touch: boolean): Promise<void> {
  const back = page.locator('#daily-back');
  if (touch) await back.tap();
  else await back.click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
}

/** One seeded skill in daily: its picture shows, no raw keys, solvable by tap. */
async function oneSkillRun(
  page: Page,
  info: TestInfo,
  skillId: string,
  shot: string,
  checkScene: (scene: Locator) => Promise<void>,
): Promise<void> {
  const touch = isTouch(info);
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  await boot(page, skillId);
  await openDaily(page, touch);
  await expect(page.locator('#dialog-content')).toContainText('Luyện tập hôm nay · Câu 1/1');
  const panel = page.locator('#dialog-content');
  const scene = panel.locator('svg.dialog-scene');
  await expect(scene).toBeVisible();
  await checkScene(scene);
  // The picture fits the dialog: the answer pad stays visible below it.
  await expect(panel.locator('.daily-steps .kit-pad, .daily-steps .kit-choices')).toBeVisible();
  // Story/steps render through the item family's prompt namespace, never as raw keys.
  await expect(panel).not.toContainText('time.');
  await expect(panel).not.toContainText('money.');
  await expect(panel).not.toContainText('data.');
  await expect(panel).not.toContainText('reasoning.');
  await page.screenshot({ path: info.outputPath(`${shot}-${info.project.name}.png`) });
  await solveSkillItem(page, touch);
  const next = panel.locator('.daily-next');
  if (touch) await next.tap();
  else await next.click();
  await expect(panel).toContainText('Xong rồi!');
  expect(errors).toEqual([]);
  // #daily-back closes the dialog (same as the phase-04 spec); #close-dialog
  // lives inside the closed dialog after that, so there is nothing more to tap.
  await closeDaily(page, touch);
}

test('B66 clock: face, ticks, numerals and hands show and the item solves', async ({
  page,
}, info) => {
  await oneSkillRun(page, info, 'clock-read-hour-half', 'clock', async (scene) => {
    // 60 minute ticks, 12 numerals, one hour hand + one minute hand.
    await expect(scene.locator('.ds-clock-tick, .ds-clock-tick-min')).toHaveCount(60);
    await expect(scene.locator('text.ds-label')).toHaveCount(12);
    await expect(scene.locator('.ds-clock-hour')).toHaveCount(1);
    await expect(scene.locator('.ds-clock-minute')).toHaveCount(1);
    // Risk countermove (phase 17): the clock face is at least 160 px across.
    const box = await scene.boundingBox();
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(160);
  });
});

test('B68 money: one note card with its grouped value shows and the item solves', async ({
  page,
}, info) => {
  await oneSkillRun(page, info, 'money-recognize', 'notes', async (scene) => {
    await expect(scene.locator('rect.ds-note')).toHaveCount(1);
    const value = await scene.locator('text.ds-note-value').textContent();
    expect(value).toMatch(/^\d{1,3}(\s\d{3})*$/);
  });
});

test('B73 tally: O/X marks show and the item solves', async ({ page }, info) => {
  await oneSkillRun(page, info, 'tally-count', 'tally', async (scene) => {
    const hits = await scene.locator('circle.ds-tally-o').count();
    const misses = (await scene.locator('line.ds-tally-x').count()) / 2;
    // T1: 6–10 marks, at least 2 hits and 1 miss.
    expect(hits + misses).toBeGreaterThanOrEqual(6);
    expect(hits + misses).toBeLessThanOrEqual(10);
    expect(hits).toBeGreaterThanOrEqual(2);
    expect(misses).toBeGreaterThanOrEqual(1);
  });
});
