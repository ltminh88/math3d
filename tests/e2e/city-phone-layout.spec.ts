// City level on a phone (QA M-6, M-7, p-2): VLM's line never covers the house numbers, and with
// the phone turned sideways the answer panel (every card and the hint) fits inside the screen
// while the street stays visible beside it. Asserts boxes in CSS px.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

type Box = { x: number; y: number; width: number; height: number };
const overlaps = (a: Box, b: Box) =>
  a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;

async function enterCity(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').tap();
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field', 'forest'] }),
  );
  await page.evaluate(() => window.__game?.teleportToGate('city'));
  await page.locator('#interact').tap();
  await expect(page.locator('.city-panel')).toBeVisible();
  await expect(page.locator('.city-chip--house').first()).toBeVisible();
  // Two frames for the camera to take the measured HUD.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 200))));
}

/** Every house number badge is on screen and clear of VLM's line and the panel. */
async function expectHouseBadgesClear(page: Page): Promise<void> {
  const viewport = page.viewportSize();
  const guide = await page.locator('.city-guide').boundingBox();
  const panel = await page.locator('.city-panel').boundingBox();
  if (!viewport || !guide || !panel) throw new Error('HUD boxes missing');
  const badges = await page.locator('.city-chip--house').all();
  expect(badges.length).toBeGreaterThan(0);
  for (const badge of badges) {
    const box = await badge.boundingBox();
    if (!box) throw new Error('house badge missing');
    expect(overlaps(box, guide)).toBe(false);
    expect(overlaps(box, panel)).toBe(false);
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
  }
}

test('portrait phone: VLM line leaves the house numbers visible', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile-pixel', 'phone layout');
  await enterCity(page);
  await expectHouseBadgesClear(page);
});

test.describe('phone turned sideways', () => {
  test.use({ viewport: { width: 839, height: 412 } });

  test('the answer panel fits the screen and the street stays in view', async ({ page }, info) => {
    test.skip(info.project.name !== 'mobile-pixel', 'phone layout');
    await enterCity(page);
    const panel = await page.locator('.city-panel').boundingBox();
    if (!panel) throw new Error('panel missing');
    expect(panel.y).toBeGreaterThanOrEqual(0);
    expect(panel.y + panel.height).toBeLessThanOrEqual(412);
    // Cards and the hint are inside the panel's visible box (nothing to scroll to find them).
    const controls = page.locator('.city-panel .answer:visible, .city-panel .city-hint-button');
    expect(await controls.count()).toBeGreaterThan(0);
    for (const control of await controls.all()) {
      const box = await control.boundingBox();
      if (!box) throw new Error('control missing');
      expect(box.y + box.height).toBeLessThanOrEqual(panel.y + panel.height);
      expect(box.height).toBeGreaterThanOrEqual(40);
    }
    await expectHouseBadgesClear(page);
  });
});
