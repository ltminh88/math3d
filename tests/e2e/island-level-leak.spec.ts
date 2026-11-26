// Island level leak check (Phase 1A): entering and leaving "Đảo Tiếng Anh" gives every
// geometry and texture back, once and after 10 visits, and leaving early commits
// nothing. The baseline is the settled world before the first visit (as in
// city-level-leak), so a leak of the very first entry is not hidden by a warm-up visit.
// Read through `window.__game.memory()`.
import { test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';
import { rendererMemory, settledMemory } from './settled-renderer-memory';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

test('leaving the island frees its geometries and textures (once and after 10 visits)', async ({
  page,
}, info) => {
  const tap = !!info.project.use.hasTouch;
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.teleportToGate('island'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Đảo Tiếng Anh');
  const baseline = await settledMemory(page);
  expect(baseline.geometries).toBeGreaterThan(0);
  for (let cycle = 0; cycle < 10; cycle++) {
    if (tap) await interact.tap();
    else await interact.click();
    await expect(page.locator('.island-panel')).toBeVisible();
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
  expect(await page.evaluate(() => window.__game?.gateStatus('island'))).toBe('open');
});

test('leaving a later stage frees its geometries too', async ({ page }, info) => {
  const tap = !!info.project.use.hasTouch;
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.seedStageProgress('island', [2, 2]));
  await page.evaluate(() => window.__game?.teleportToGate('island'));
  await expect(page.locator('#interact')).toBeVisible();
  // Settled baseline (as in the tower later-stage test): on a slow machine the follow
  // camera keeps uploading world geometries for many frames after a teleport, which is
  // not a level leak — a raw single read can sit below the settled count, and the test
  // would then wait forever for geometries that were never the level's.
  const baseline = await settledMemory(page);
  expect(baseline.geometries).toBeGreaterThan(0);
  const geometries = () => rendererMemory(page).then((m) => m.geometries);
  const interact = page.locator('#interact');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.island-panel')).toBeVisible();
  // The level's meshes are built synchronously in start(), but three.js uploads their
  // geometries to the GPU only when a frame draws them; poll until the upload lands.
  await expect.poll(geometries, { timeout: 30_000 }).toBeGreaterThan(baseline.geometries);
  const leave = page.locator('.level-leave');
  if (tap) await leave.tap();
  else await leave.click();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect.poll(geometries).toBe(baseline.geometries);
  // Stage 1 was already completed (seeded), so the gate stays completed.
  expect(await page.evaluate(() => window.__game?.gateStatus('island'))).toBe('completed');
});
