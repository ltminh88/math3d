// Forest level leak check (R23 part A): entering and leaving "Rừng Nhân Chia" gives every
// geometry and texture back after 3 visits, and leaving early commits nothing.
// Read through the test build (`window.__game.memory()` = `renderer.info.memory`).
// Pattern copied from city-level-leak.spec.ts (3 cycles per the R23 guard criterion).
import { test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';
import { rendererMemory, settledMemory } from './settled-renderer-memory';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

test('leaving the forest frees its geometries and textures (once and after 3 visits)', async ({
  page,
}, info) => {
  const tap = !!info.project.use.hasTouch;
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field'] }),
  );
  await page.evaluate((id) => window.__game?.teleportToGate(id), 'forest');
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Rừng Nhân Chia');
  // Baseline before the first visit, so a leak of the very first entry shows too.
  const baseline = await settledMemory(page);
  expect(baseline.geometries).toBeGreaterThan(0);
  for (let cycle = 0; cycle < 3; cycle++) {
    if (tap) await interact.tap();
    else await interact.click();
    await expect(page.locator('.forest-panel')).toBeVisible();
    await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
    expect((await rendererMemory(page)).geometries).toBeGreaterThan(baseline.geometries);
    const leave = page.locator('.level-leave');
    if (tap) await leave.tap();
    else await leave.click();
    await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
    if (cycle === 0) await expect.poll(() => rendererMemory(page)).toEqual(baseline);
  }
  await expect.poll(() => rendererMemory(page)).toEqual(baseline);
  // Leaving before any answer commits nothing: the gate is still open, not completed.
  expect(await page.evaluate(() => window.__game?.gateStatus('forest'))).toBe('open');
});
