// Field level on a phone (QA M-5): while planting, the plot fills the canvas the HUD leaves free,
// so cells are finger-sized (>= 44 CSS px apart up to 6 per row), and the equation label hangs
// below the plot instead of covering its last row and the basket.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const point = async (page: Page, id: string) => {
  const p = await page.evaluate((target) => window.__field?.point(target), id);
  if (!p) throw new Error(`no screen point for ${id}`);
  return p;
};
const gap = (a: { x: number; y: number }, b: { x: number; y: number }) =>
  Math.hypot(a.x - b.x, a.y - b.y);

test('planting cells are finger-sized on a phone and the label stays off the plot', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'mobile-pixel', 'phone layout');
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').tap();
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.teleportToGate('field'));
  await page.locator('#interact').tap();
  await page.waitForFunction(() => window.__field?.state().phase === 'planting');
  const { rows, cols } = (await page.evaluate(() => window.__field?.state())) ?? {};
  if (!rows || !cols) throw new Error('field state missing');
  // Let the frame after the first layout settle (the HUD is measured by a ResizeObserver).
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 300))));
  const first = await point(page, 'cell:0:0');
  const across = gap(first, await point(page, `cell:0:${cols - 1}`)) / Math.max(1, cols - 1);
  const down = gap(first, await point(page, `cell:${rows - 1}:0`)) / Math.max(1, rows - 1);
  // Up to 6 cells per row fit at >= 44 px on a 412 px wide phone; wider rows use the full width.
  const target = cols <= 6 ? 44 : 28;
  expect(across).toBeGreaterThanOrEqual(target);
  if (rows > 1) expect(down).toBeGreaterThanOrEqual(Math.min(target, 40));

  const lastRow = await point(page, `cell:${rows - 1}:${cols - 1}`);
  const label = await page.locator('.field-labels .field-label').boundingBox();
  const panel = await page.locator('.field-panel').boundingBox();
  const speech = await page.locator('.field-speech').boundingBox();
  const basket = await point(page, 'basket');
  if (!label || !panel || !speech) throw new Error('HUD boxes missing');
  expect(label.y).toBeGreaterThan(lastRow.y + down / 2);
  expect(label.y + label.height).toBeLessThanOrEqual(panel.y);
  expect(first.y - down / 2).toBeGreaterThanOrEqual(speech.y + speech.height);
  expect(basket.y).toBeLessThan(panel.y);
  expect(basket.x).toBeGreaterThan(0);
  // Chapter-2 playthrough: the hint / turn buttons were 41 px tall on portrait touch screens.
  const tools = await page
    .locator('.field-tool')
    .evaluateAll((all) => all.map((b) => Math.round(b.getBoundingClientRect().height)));
  expect(tools.length).toBeGreaterThan(0);
  for (const h of tools) expect(h).toBeGreaterThanOrEqual(44);
});
