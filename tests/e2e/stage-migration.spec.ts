// Phase 01: a save written before stages existed still keeps its progress. Importing a
// shipped M3D3 code (which carries no stage stars) shows the cave's stage 1 complete
// with its stars, and the store's stage seeder commits stage stars the same way.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

/** A shipped M3D3 code (written by the M3D3 exporter): every level finished with 2 stars. */
const SHIPPED_M3D3_ALL_DONE =
  'M3D3-eyJ4IjoxMCwiYyI6NSwiZyI6WzAsMCwxXSwicyI6WzEsMF0sIm4iOjMsImwiOnsiYnJpZGdlIjpbMSwwLDE3OTM0MzU0MTUsNiwxNzkzNDM1NDE1XSwiZmllbGQiOlsyLDIwMCwxNzkzNDM1NDE1LDAsMTc5MzQzNTQxNV0sImZvcmVzdCI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XSwiY2l0eSI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XSwidG93ZXIiOlsyLDIwMCwxNzkzNDM1NDE1LDAsMTc5MzQzNTQxNV0sImdhcmRlbiI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XSwidmFsbGV5IjpbMiwyMDAsMTc5MzQzNTQxNSwwLDE3OTM0MzU0MTVdLCJ3b3Jrc2hvcCI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XSwiY2F2ZSI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XX0sImYiOltbIjN4NyIsOSw3LDQxMDAwLDMsMCwxNzkzNDM1NDE1XV19-85fdd25a';

async function play(page: Page): Promise<void> {
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

test('importing a shipped M3D3 code keeps the cave complete on stage 1', async ({ page }) => {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.locator('#import-save-code').click();
  await page.locator('#save-code-input').fill(SHIPPED_M3D3_ALL_DONE);
  await page.locator('#save-code-confirm').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  await play(page);

  const snap = await page.evaluate(() => window.__game?.snapshot());
  const cave = snap?.levelProgress.cave;
  expect(cave?.stars, 'cave stars').toBe(2);
  expect(cave?.stageStars, 'cave stage 1 inherits its stars').toEqual([2]);
  expect(cave?.completedAt, 'cave completedAt').toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__game?.gateStatus('cave'))).toBe('completed');
  expect(snap?.levelProgress.field?.stageStars).toEqual([2]);

  await page.reload();
  await play(page);
  const again = await page.evaluate(() => window.__game?.snapshot());
  expect(again?.levelProgress.cave?.stageStars).toEqual([2]);
});

test('seedStageProgress commits stage stars through the store', async ({ page }) => {
  await page.goto('/');
  await play(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.seedStageProgress('field', [2]));
  const snap = await page.evaluate(() => window.__game?.snapshot());
  expect(snap?.levelProgress.field?.stageStars).toEqual([2]);
  expect(snap?.levelProgress.field?.stars).toBe(2);
  expect(snap?.levelProgress.field?.completedAt).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.__game?.gateStatus('field'))).toBe('completed');

  await page.reload();
  await play(page);
  const again = await page.evaluate(() => window.__game?.snapshot());
  expect(again?.levelProgress.field?.stageStars).toEqual([2]);
});
