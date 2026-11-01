// Valley level leak check (chapter 2 phase 06): entering and leaving "Thung Lũng Hình Học" gives
// every geometry and texture back, once and after 10 visits, and leaving early commits nothing.
// The baseline is the settled world before the first visit (as in the tower leak spec). The plan
// is the planner's own (first run), so each visit builds different figures.
import { test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';
import { rendererMemory, settledMemory } from './settled-renderer-memory';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

test('leaving the valley frees its geometries and textures (once and after 10 visits)', async ({
  page,
}, info) => {
  const tap = info.project.use.hasTouch === true;
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({
      bridgeComplete: true,
      completedLevels: ['field', 'forest', 'city', 'tower', 'garden'],
    }),
  );
  await page.evaluate(() => window.__game?.teleportToGate('valley'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Thung Lũng Hình Học');
  const baseline = await settledMemory(page);
  expect(baseline.geometries).toBeGreaterThan(0);
  for (let cycle = 0; cycle < 10; cycle++) {
    if (tap) await interact.tap();
    else await interact.click();
    await expect(page.locator('.valley-panel')).toBeVisible();
    await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
    expect((await rendererMemory(page)).geometries).toBeGreaterThan(baseline.geometries);
    // Do the round's action once so the rebuilt figure and the ê-ke/blocks are exercised too.
    const s = await page.evaluate(() => window.__valley?.state());
    if (s?.phase === 'action' && s.rightTargets[0]) {
      const target = page.locator(`[data-target="${s.rightTargets[0]}"]`);
      if (tap) await target.tap();
      else await target.click();
    }
    const leave = page.locator('.level-leave');
    if (tap) await leave.tap();
    else await leave.click();
    await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
    if (cycle === 0) await expect.poll(() => rendererMemory(page)).toEqual(baseline);
  }
  await expect.poll(() => rendererMemory(page)).toEqual(baseline);
  expect(await page.evaluate(() => window.__game?.gateStatus('valley'))).toBe('open');
});
