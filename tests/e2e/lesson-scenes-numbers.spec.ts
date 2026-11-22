// Numbers/fraction scenes in the dialog (phase 16): place-value blocks, number
// line, fraction shapes, object sets, pick-a-figure. Lesson mode (phase 06) is
// merged now, but these tests still drive the same dialog host through daily
// practice like the market spec: one seeded skill per test, the picture shows,
// no raw keys, and the item is answerable by tap. Numbers scene skills need
// tier 2 (box 3): tier 1 place-value / sequence items carry no picture.
import { type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitDialogSettled } from './legacy-live-save-fixtures';

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

async function boot(page: Page, skillId: string, box = 1): Promise<void> {
  await seedDate(page);
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'ready', { timeout: 120_000 });
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() => window.__game?.seedStageProgress('field', [1]));
  await page.evaluate(([id, b]) => window.__game?.seedFactStats({ [`sk:${id}`]: { box: b } }), [
    skillId,
    box,
  ] as const);
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
  box: number,
  shot: string,
  checkScene: (scene: Locator) => Promise<void>,
): Promise<void> {
  const touch = isTouch(info);
  const errors: string[] = [];
  page.on('pageerror', (err) => errors.push(String(err)));
  await boot(page, skillId, box);
  await openDaily(page, touch);
  await expect(page.locator('#dialog-content')).toContainText('Luyện tập hôm nay · Câu 1/1');
  const panel = page.locator('#dialog-content');
  const scene = panel.locator('svg.dialog-scene');
  await expect(scene).toBeVisible();
  await checkScene(scene);
  // The picture fits the dialog: the answer pad stays visible below it.
  await expect(panel.locator('.daily-steps .kit-pad, .daily-steps .kit-choices')).toBeVisible();
  // Story/steps render through the item family's prompt namespace, never as raw keys.
  await expect(panel).not.toContainText('numbers.');
  await expect(panel).not.toContainText('fraction.');
  await expect(panel).not.toContainText('time.');
  await expect(panel).not.toContainText('money.');
  await expect(panel).not.toContainText('data.');
  await expect(panel).not.toContainText('reasoning.');
  // The dialog pops in over 0.3 s (C2): wait for its animations to finish, or
  // the screenshot catches it mid-pop, small and blurred.
  await waitDialogSettled(page);
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

test('B1 place-value: 3 columns with blocks and digits show and the item solves', async ({
  page,
}, info) => {
  await oneSkillRun(page, info, 'num-place-value-1000', 3, 'place-value', async (scene) => {
    // 3 columns (trăm/chục/đơn vị): one frame, one header and one digit each.
    await expect(scene.locator('rect.ds-block-frame')).toHaveCount(3);
    await expect(scene.locator('text.ds-label')).toHaveCount(6);
    // Blocks are the digits: 0–9 per column, so 0–27 in total.
    const blocks = await scene.locator('rect.ds-block').count();
    expect(blocks).toBeGreaterThanOrEqual(0);
    expect(blocks).toBeLessThanOrEqual(27);
  });
});

test('B1 number-line: 4 marks with one ? and its letter show and the item solves', async ({
  page,
}, info) => {
  await oneSkillRun(page, info, 'num-sequence-1000', 3, 'number-line', async (scene) => {
    // The line itself + 4 ticks; tier 2 has exactly one gap.
    await expect(scene.locator('line.ds-line')).toHaveCount(5);
    await expect(scene.locator('text.ds-label', { hasText: '?' })).toHaveCount(1);
    await expect(scene.locator('text.ds-label', { hasText: 'A' })).toHaveCount(1);
  });
});

test('B14 fraction-shape: one shaded part among 2–9 parts shows and the item solves', async ({
  page,
}, info) => {
  await oneSkillRun(page, info, 'fraction-shaded', 1, 'fraction-shape', async (scene) => {
    // Unit fractions shade exactly one part; the shape has 2–9 parts.
    await expect(scene.locator('.ds-frac-shaded')).toHaveCount(1);
    const parts = await scene.locator('.ds-frac-shaded, .ds-frac-part').count();
    expect(parts).toBeGreaterThanOrEqual(2);
    expect(parts).toBeLessThanOrEqual(9);
  });
});

test('B14 fraction-set: objects show with the marked ones filled and the item solves', async ({
  page,
}, info) => {
  await oneSkillRun(page, info, 'fraction-of-set-circle', 1, 'fraction-set', async (scene) => {
    const marked = await scene.locator('circle.ds-set-marked').count();
    const total = marked + (await scene.locator('circle.ds-set-item').count());
    // A set has 2–45 objects, at least 2 marked (one part has ≥ 2).
    expect(total).toBeGreaterThanOrEqual(2);
    expect(total).toBeLessThanOrEqual(45);
    expect(marked).toBeGreaterThanOrEqual(2);
  });
});

test('B14 fraction-pick: 3–4 lettered figures show and the item solves', async ({ page }, info) => {
  await oneSkillRun(page, info, 'fraction-pick-picture', 1, 'fraction-pick', async (scene) => {
    // One letter label per figure (A–D); every figure shades at least one part.
    const labels = await scene.locator('text.ds-label').count();
    expect(labels).toBeGreaterThanOrEqual(3);
    expect(labels).toBeLessThanOrEqual(4);
    expect(await scene.locator('.ds-frac-shaded').count()).toBeGreaterThanOrEqual(3);
  });
});
