// Workshop level leak check (chapter 2 phase 07): entering and leaving "Xưởng Đo Đạc" gives every
// geometry and texture back, once and after 10 visits, and leaving early commits nothing. The
// baseline is the settled world before the first visit (as in the tower and city leak specs).
import { test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';
import { rendererMemory, settledMemory } from './settled-renderer-memory';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

test('leaving the workshop frees its geometries and textures (once and after 10 visits)', async ({
  page,
}, info) => {
  const touch = info.project.use.hasTouch === true;
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({
      bridgeComplete: true,
      completedLevels: ['field', 'forest', 'city', 'tower', 'garden', 'valley'],
    }),
  );
  await page.evaluate(() => window.__game?.teleportToGate('workshop'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Xưởng Đo Đạc');
  const baseline = await settledMemory(page);
  expect(baseline.geometries).toBeGreaterThan(0);
  for (let cycle = 0; cycle < 10; cycle++) {
    if (touch) await interact.tap();
    else await interact.click();
    await expect(page.locator('.workshop-panel')).toBeVisible();
    await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
    expect((await rendererMemory(page)).geometries).toBeGreaterThan(baseline.geometries);
    const leave = page.locator('.level-leave');
    if (touch) await leave.tap();
    else await leave.click();
    await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
    if (cycle === 0) await expect.poll(() => rendererMemory(page)).toEqual(baseline);
  }
  await expect.poll(() => rendererMemory(page)).toEqual(baseline);
  // Leaving before any answer commits nothing: the gate is still open, not completed.
  expect(await page.evaluate(() => window.__game?.gateStatus('workshop'))).toBe('open');
  expect(await page.evaluate(() => window.__workshop)).toBeUndefined();
});
