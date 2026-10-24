// City level leak check (phase 02 of the city/tower plan): entering and leaving "Thành Phố Con
// Số" gives every geometry back, once and after 10 visits, and leaving early commits nothing.
// Read through the test build (`window.__game.memory()` = `renderer.info.memory`).
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const geometries = (page: Page) => page.evaluate(() => window.__game?.memory().geometries ?? -1);

/**
 * The world's geometry count once its camera has settled: on the phone the follow camera keeps
 * bringing world objects into view (uploaded on first sight) for many frames after a teleport,
 * which is not a level leak. Counted in frames, since SwiftShader under load draws slowly.
 */
async function settledGeometries(page: Page): Promise<number> {
  const afterFrames = () =>
    page.evaluate(
      () =>
        new Promise<number>((resolve) => {
          let left = 40;
          const tick = () => {
            left -= 1;
            if (left > 0) requestAnimationFrame(tick);
            else resolve(window.__game?.memory().geometries ?? -1);
          };
          requestAnimationFrame(tick);
        }),
    );
  let last = await afterFrames();
  for (let stable = 0, i = 0; stable < 4 && i < 40; i++) {
    const now = await afterFrames();
    stable = now === last ? stable + 1 : 0;
    last = now;
  }
  return last;
}

test('leaving the city frees its geometries (once and after 10 visits)', async ({ page }, info) => {
  const tap = info.project.name === 'mobile-pixel';
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field', 'forest'] }),
  );
  await page.evaluate(() => window.__game?.teleportToGate('city'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Thành Phố Con Số');
  const baseline = await settledGeometries(page);
  expect(baseline).toBeGreaterThan(0);
  for (let cycle = 0; cycle < 10; cycle++) {
    if (tap) await interact.tap();
    else await interact.click();
    await expect(page.locator('.city-panel')).toBeVisible();
    await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
    expect(await geometries(page)).toBeGreaterThan(baseline);
    const leave = page.locator('.level-leave');
    if (tap) await leave.tap();
    else await leave.click();
    await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
    if (cycle === 0) await expect.poll(() => geometries(page)).toBe(baseline);
  }
  await expect.poll(() => geometries(page)).toBe(baseline);
  // Leaving before any answer commits nothing: the gate is still open, not completed.
  expect(await page.evaluate(() => window.__game?.gateStatus('city'))).toBe('open');
});
