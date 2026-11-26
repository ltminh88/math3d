// English Island (Phase 1A): the island region, its gate after the bridge, the map
// entry, and the level shell. The run is still the Phase 0 stub (0 rounds) until
// Phase 1B lands the engine, so entering shows the panel and the done card at once.
// Uses the test-build hooks `window.__game` and `window.__island`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const LOCKED_BRIDGE = 'Hãy giúp VLM xây xong cây cầu, rồi đi qua cầu để mở cổng này nhé!';

async function startPlaying(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

/** Walks up to the gate and uses it: tap on touch screens, the E key with a keyboard. */
async function useGate(page: Page, touch: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('island'));
  const button = page.locator('#interact');
  await expect(button).toContainText('Cổng Đảo Tiếng Anh');
  // Arriving in a region shows its welcome toast; let it land before the gate's toast.
  await expect(page.locator('#area-name')).toHaveText('Đảo Tiếng Anh');
  if (touch) await button.tap();
  else await page.keyboard.press('e');
}

test('island gate stays locked until the bridge, then opens (8 stages)', async ({
  page,
}, testInfo) => {
  const touch = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  expect(await page.evaluate(() => window.__game?.gateStatus('island'))).toBe('locked');
  await useGate(page, touch);
  await expect(page.locator('#interact')).toContainText('Cổng Đảo Tiếng Anh 🔒 · Đi qua cầu để mở');
  await expect(page.locator('#toast')).toHaveText(LOCKED_BRIDGE);

  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  expect(await page.evaluate(() => window.__game?.gateStatus('island'))).toBe('open');
  await expect(page.locator('#gate-island-label small')).toHaveText('Cổng đã mở · Chặng 1/8');
  await expect(page.locator('#gate-island-label small')).not.toHaveText('Sắp ra mắt');
  await page.evaluate(() => window.__game?.teleportToGate('island'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Đảo Tiếng Anh');
  expect(errors).toEqual([]);
});

test('entering the island starts the shell; leaving through "Về cổng" ends it', async ({
  page,
}, testInfo) => {
  const touch = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.teleportToGate('island'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Đảo Tiếng Anh');
  const interact = page.locator('#interact');
  if (touch) await interact.tap();
  else await interact.click();
  await expect(page.locator('.island-panel')).toBeVisible();
  await expect(page.locator('.island-panel')).toContainText('Chặng 1/8 · Chữ A–D');
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  // The Phase 0 stub resolves at once with 0 rounds: the done card is already there.
  await expect(page.locator('.island-done')).toBeVisible();
  await expect(page.locator('.island-done')).toContainText('Bài tập tiếng Anh đang được chuẩn bị');
  await expect
    .poll(() => page.evaluate(() => window.__island?.state()))
    .toMatchObject({ stage: 1, total: 8, done: true, roundsPlayed: 0, correctCount: 0 });
  const back = page.locator('.island-back');
  if (touch) await back.tap();
  else await back.click();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  // The stub recorded nothing: the gate is still open, not completed.
  expect(await page.evaluate(() => window.__game?.gateStatus('island'))).toBe('open');
  expect(errors).toEqual([]);
});

test('the area badge and the world map know the island', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.teleport(-6, 13));
  await expect(page.locator('#area-name')).toHaveText('Đảo Tiếng Anh');

  await page.locator('#open-map').click();
  await expect(page.locator('#world-map')).toBeVisible();
  await expect(page.locator('[data-region]')).toHaveCount(12);
  await page.locator('[data-region="island"]').click();
  await expect(page.locator('#map-detail strong')).toHaveText('🏝️ Đảo Tiếng Anh');
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Cổng đã mở · Chặng 1/8',
  );
  expect(errors).toEqual([]);
});
