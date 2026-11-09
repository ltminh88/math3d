// A tab left open across a deploy runs the old build: its level chunk is gone from the server
// (404). Entering the gate must reload the page onto the new build instead of the dead-end toast
// "Chưa mở được màn chơi" (author report 2026-11-09, iPad, garden gate). After the reload the same
// gate opens the level.
import { test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

async function enterGardenGate(page: import('@playwright/test').Page, touch: boolean) {
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({
      bridgeComplete: true,
      completedLevels: ['field', 'forest', 'city', 'tower'],
    }),
  );
  await page.evaluate(() => window.__game?.teleportToGate('garden'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Khu Vườn Quy Luật');
  if (touch) await interact.tap();
  else await interact.click();
}

test('a level chunk missing after a deploy reloads the page, then the level opens', async ({
  page,
}, info) => {
  const touch = !!info.project.use.hasTouch;
  // Like a deploy: every request for the chunk (Vite's modulepreload and the import itself) is a
  // 404 until the page reloads onto the "new build".
  let stale = true;
  let blocked = 0;
  await page.route(/garden-scene-[^/]*\.js$/, (route) => {
    if (!stale) return route.continue();
    blocked++;
    return route.fulfill({ status: 404, body: 'Not Found' });
  });
  await page.goto('/');
  const reloaded = page.waitForEvent('framenavigated', (frame) => frame === page.mainFrame());
  await enterGardenGate(page, touch);
  await reloaded;
  stale = false;
  expect(blocked).toBeGreaterThan(0);
  await enterGardenGate(page, touch);
  await expect(page.locator('.garden-panel')).toBeVisible();
});
