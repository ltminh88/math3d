// Forest level "Rừng Nhân Chia" (phase 15): seed bridge + field, enter through the forest gate,
// play the five rounds (keyboard on desktop, taps on the phone), come back to the gate with the
// level completed and division facts (`div:12/3`) in the store; draw calls and geometry leaks
// are read through the test build (`window.__game`, `.level-layer[data-max-draw-calls]`).
import { type Locator, type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const DRAW_CALL_BUDGET = 60;

async function startAtForestGate(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field'] }),
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('forest'))).toBe('open');
}

async function enterForest(page: Page, tap: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('forest'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Rừng Nhân Chia');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.forest-panel')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  // A few level frames have been rendered (SwiftShader is slow to draw the first ones).
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

async function press(page: Page, button: Locator, tap: boolean): Promise<void> {
  if (tap) {
    await button.tap();
  } else {
    await button.focus();
    await page.keyboard.press('Enter');
  }
}

/** Focus back on the page (the pad and the 3D keyboard layer ignore keys aimed at controls). */
const blurControls = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function answer(page: Page, value: number, tap: boolean): Promise<void> {
  if (tap) {
    const pad = page.locator('.forest-panel .kit-pad');
    for (const digit of String(value)) {
      await pad.getByRole('button', { name: digit, exact: true }).tap();
    }
    await pad.getByRole('button', { name: 'Xong' }).tap();
  } else {
    await blurControls(page);
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
  }
}

/** Answers of the round's blanks, read from the panel's data attributes. */
function blanks(kind: string, p: number, a: number): number[] {
  const b = p / a;
  if (kind !== 'family') return [b];
  return a === b ? [p, b] : [p, p, b, a];
}

async function playRound(page: Page, index: number, tap: boolean): Promise<string> {
  const panel = page.locator(`.forest-panel[data-round="${index}"]`);
  await expect(panel).toBeVisible();
  const data = await panel.evaluate((el) => ({ ...(el as HTMLElement).dataset }));
  const kind = data.kind as string;
  const dividend = Number(data.dividend);
  const divisor = Number(data.divisor);
  if (kind !== 'family') {
    if (index === 0 && !tap) {
      // 3D keyboard path: arrow to a fruit, Enter picks it, Enter drops it on the first friend.
      await blurControls(page);
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      await page.keyboard.press('Enter');
      await expect(panel).toHaveAttribute('data-pile', String(dividend - 1));
    }
    const deal = page.locator('.forest-deal');
    while (await deal.isEnabled()) await press(page, deal, tap);
    await expect(panel).toHaveAttribute('data-pile', '0');
    if (index === 0 && !tap && kind === 'share') {
      // The extra fruit makes it uneven: check marks it with shapes, then move fruit 0 over.
      await press(page, page.locator('.forest-check'), tap);
      await expect(page.locator('.forest-panel .feedback')).toHaveClass(/gentle/);
      await expect(page.locator('.forest-chip[data-mark="tooMany"]')).toHaveCount(1);
      await expect(page.locator('.forest-chip[data-mark="tooFew"]')).toHaveCount(1);
      // Dealing gave the last friend one less: Enter picks fruit 0, arrows walk the friends
      // that accept it (friend 0 excluded) to the last one, Enter drops it there.
      await blurControls(page);
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      for (let i = 0; i < divisor - 2; i++) await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
    }
    await press(page, page.locator('.forest-check'), tap);
    await expect(page.locator('.forest-panel .feedback')).toHaveClass(/success/);
    await expect(page.locator('.forest-chip.ok')).toHaveCount(
      kind === 'pack' ? dividend / divisor : divisor,
    );
  }
  const answers = blanks(kind, dividend, divisor);
  if (index === 0) {
    // One wrong answer: gentle feedback, a hint is offered and taken (rung 1).
    await answer(page, (answers[0] as number) + 1, tap);
    await expect(page.locator('.forest-panel .feedback')).toHaveClass(/gentle/);
    await expect(page.locator('.forest-hint-button')).toHaveClass(/offer/);
    await press(page, page.locator('.forest-hint-button'), tap);
    await expect(page.locator('.forest-hint')).toHaveAttribute('data-rung', '1');
  }
  for (const value of answers) await answer(page, value, tap);
  await expect(page.locator('.forest-panel .feedback')).toContainText('Đúng rồi!');
  await expect(page.locator('.forest-next')).toBeFocused();
  return kind;
}

test('the forest level plays five rounds and records division facts', async ({ page }, info) => {
  const tap = info.project.name === 'mobile-pixel';
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startAtForestGate(page);
  await enterForest(page, tap);

  const kinds: string[] = [];
  for (let i = 0; i < 5; i++) {
    kinds.push(await playRound(page, i, tap));
    const next = page.locator('.forest-next');
    if (tap) await next.tap();
    else await page.keyboard.press('Enter');
  }
  expect(kinds).toContain('family');
  await expect(page.locator('.forest-done')).toBeVisible();
  await expect(page.locator('.forest-done')).toContainText('VLM');
  const layerData = await page
    .locator('.level-layer')
    .evaluate((el) => ({ ...(el as HTMLElement).dataset }));
  const maxCalls = Number(layerData.maxDrawCalls);
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);

  const back = page.locator('.forest-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect(page.locator('#interact')).toContainText('Cổng Rừng Nhân Chia');
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('forest')))
    .toBe('completed');
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return {
      completedAt: snap?.levelProgress.forest?.completedAt ?? 0,
      divKeys: Object.keys(snap?.factStats ?? {}).filter((k) => /^div:\d+\/\d+$/.test(k)),
    };
  });
  expect(store.completedAt).toBeGreaterThan(0);
  expect(store.divKeys.length).toBeGreaterThan(0);

  // City and Tower are still "coming soon" on the map.
  await page.locator('#open-map').click();
  await expect(page.locator('#world-map')).toBeVisible();
  for (const region of ['city', 'tower']) {
    await page.locator(`[data-region="${region}"]`).click();
    await expect(page.locator('#map-detail .coming-soon')).toHaveText('Sắp ra mắt');
  }
  expect(errors).toEqual([]);
});

test('leaving the forest frees its geometries (once and after 10 visits)', async ({
  page,
}, info) => {
  const tap = info.project.name === 'mobile-pixel';
  await startAtForestGate(page);
  await page.evaluate(() => window.__game?.teleportToGate('forest'));
  await expect(page.locator('#interact')).toBeVisible();
  const baseline = await page.evaluate(() => window.__game?.memory().geometries ?? -1);
  expect(baseline).toBeGreaterThan(0);
  const geometries = () => page.evaluate(() => window.__game?.memory().geometries);
  for (let cycle = 0; cycle < 10; cycle++) {
    await enterForest(page, tap);
    expect(await geometries()).toBeGreaterThan(baseline);
    const leave = page.locator('.level-leave');
    if (tap) await leave.tap();
    else await leave.click();
    await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
    if (cycle === 0) await expect.poll(geometries).toBe(baseline);
  }
  await expect.poll(geometries).toBe(baseline);
  // Leaving before any answer commits nothing: the gate is still open, not completed.
  expect(await page.evaluate(() => window.__game?.gateStatus('forest'))).toBe('open');
});
