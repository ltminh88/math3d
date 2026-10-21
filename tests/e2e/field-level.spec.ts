// Field level "Cánh Đồng Phép Tính" (phase 14): seed the bridge, walk to the meadow gate, play the
// five rounds (keyboard on desktop, touch on the phone), come back at the gate with the level
// completed; the scene stays within 60 draw calls and gives every geometry back on exit.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const fieldState = (page: Page) => page.evaluate(() => window.__field?.state());
const memory = (page: Page) => page.evaluate(() => window.__game?.memory().geometries ?? -1);

/** Draw calls of the last rendered frame (the level's while it runs). */
const drawCalls = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number>((resolve) => {
        requestAnimationFrame(() =>
          requestAnimationFrame(() => resolve(window.__parity?.renderer.info.render.calls ?? -1)),
        );
      }),
  );

async function startWithBridge(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await expect(page.locator('#gate-field-label small')).toHaveText('Cổng đã mở');
}

async function enterField(page: Page): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('field'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Cánh Đồng Phép Tính');
  await page.locator('#interact').click();
  await page.waitForFunction(() => window.__field?.state().phase !== undefined);
  await expect(page.locator('.field-speech')).toContainText('VLM');
}

async function waitPhase(page: Page, phase: string): Promise<void> {
  await page.waitForFunction((p) => window.__field?.state().phase === p, phase);
}

async function plantByKeyboard(page: Page, rows: number, cols: number): Promise<void> {
  await page.keyboard.press('ArrowRight');
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      await page.keyboard.press('Enter');
      if (k < cols - 1) await page.keyboard.press(r % 2 === 0 ? 'ArrowRight' : 'ArrowLeft');
    }
    if (r < rows - 1) await page.keyboard.press('ArrowDown');
  }
}

async function plantByTouch(page: Page): Promise<void> {
  const tapId = async (id: string) => {
    const point = await page.evaluate((target) => window.__field?.point(target), id);
    if (!point) throw new Error(`no screen point for ${id}`);
    await page.touchscreen.tap(point.x, point.y);
  };
  await tapId('cell:0:0');
  for (let guard = 0; guard < 12; guard++) {
    const rows = await page.evaluate(() => window.__field?.openRows() ?? []);
    if (rows.length === 0) return;
    await tapId(rows[0] as string);
  }
}

async function answer(page: Page, touch: boolean): Promise<void> {
  const state = await fieldState(page);
  if (!state) throw new Error('field state missing');
  if (state.type === 'equations') {
    for (const id of state.correctOptions) {
      const card = page.locator(`.field-answers [data-option="${id}"]`);
      if (touch) await card.tap();
      else await page.keyboard.press(String(Number(await card.locator('kbd').textContent())));
    }
    if (touch) await page.getByRole('button', { name: 'Kiểm tra' }).tap();
    else await page.keyboard.press('Enter');
    return;
  }
  if (touch) {
    const pad = page.locator('.field-pad');
    for (const digit of String(state.total)) {
      await pad.getByRole('button', { name: digit, exact: true }).tap();
    }
    await pad.getByRole('button', { name: 'Xong' }).tap();
  } else {
    await page.keyboard.type(String(state.total));
    await page.keyboard.press('Enter');
  }
}

async function playFiveRounds(page: Page, touch: boolean): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await page.waitForFunction((i) => window.__field?.state().index === i, round);
    const state = await fieldState(page);
    if (!state) throw new Error('field state missing');
    if (state.phase === 'planting') {
      if (touch) await plantByTouch(page);
      else await plantByKeyboard(page, state.rows, state.cols);
      await waitPhase(page, 'answer');
    }
    if (round === 1) {
      // One hint on the way: the hint area opens with the recovered styling.
      if (touch) await page.getByRole('button', { name: /Gợi ý/ }).tap();
      else await page.keyboard.press('h');
      await expect(page.locator('.field-panel .hint-area')).toBeVisible();
    }
    await answer(page, touch);
    await waitPhase(page, 'solved');
    await expect(page.locator('.field-panel .feedback.success')).toBeVisible();
    const next = page.locator('.field-next');
    if (touch) await next.tap();
    else {
      await expect(next).toBeFocused();
      await page.keyboard.press('Enter');
    }
  }
  await waitPhase(page, 'done');
  await expect(page.locator('.field-panel--done .field-stars')).toBeVisible();
}

test('the field level is played to the end and opens the way to the forest', async ({
  page,
}, testInfo) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const touch = testInfo.project.name === 'mobile-pixel';
  await startWithBridge(page);
  expect(await page.evaluate(() => window.__game?.gateStatus('forest'))).toBe('locked');
  await enterField(page);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  expect(await drawCalls(page)).toBeLessThanOrEqual(60);

  await playFiveRounds(page, touch);
  expect(await drawCalls(page)).toBeLessThanOrEqual(60);
  const back = page.getByRole('button', { name: 'Về cổng' });
  if (touch) await back.tap();
  else await page.keyboard.press('Enter');

  await page.waitForFunction(() => window.__game?.levelRunning() === false);
  await expect(page.locator('.field-hud')).toHaveCount(0);
  await expect(page.locator('#interact')).toContainText('Cổng Cánh Đồng Phép Tính');
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.field))
    .toMatchObject({ completedAt: expect.any(Number) });
  const field = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.field);
  expect(field?.stars ?? 0).toBeGreaterThanOrEqual(1);
  expect(await page.evaluate(() => window.__game?.gateStatus('field'))).toBe('completed');
  // Completing the field opens the forest gate (its level ships in phase 15).
  expect(await page.evaluate(() => window.__game?.gateStatus('forest'))).toBe('open');
  expect(errors).toEqual([]);
});

test('leaving the field gives every geometry back, also after 10 runs', async ({ page }) => {
  await startWithBridge(page);
  await page.evaluate(() => window.__game?.teleportToGate('field'));
  await drawCalls(page);
  const baseline = await memory(page);
  const leaveOnce = async () => {
    await enterField(page);
    expect(await memory(page)).toBeGreaterThan(baseline);
    await page.locator('.level-leave').click();
    await page.waitForFunction(() => window.__game?.levelRunning() === false);
    await drawCalls(page);
  };
  await leaveOnce();
  expect(await memory(page)).toBe(baseline);
  for (let i = 0; i < 10; i++) await leaveOnce();
  expect(await memory(page)).toBe(baseline);
  expect(await page.evaluate(() => window.__field)).toBeUndefined();
});
