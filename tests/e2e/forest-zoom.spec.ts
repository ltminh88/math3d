// Forest zoom (phase 25a, issue #46): on tablet, a two-finger pinch changes the camera
// distance, the +/− buttons step it, one-finger taps still answer, and the zoom resets
// on the next round. Stage 1 (eggs for the chickens) throughout.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const skipNonTablet = (name: string): void => {
  test.skip(name !== 'tablet-portrait' && name !== 'tablet-landscape', 'pinch is a tablet gesture');
};

async function startAtForestGate(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field'] }),
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('forest'))).toBe('open');
}

async function enterForest(page: Page): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('forest'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Rừng Nhân Chia');
  await interact.tap();
  await expect(page.locator('.forest-panel')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

const zoomFactor = (page: Page): Promise<number> =>
  page
    .locator('.level-layer')
    .evaluate((el) => Number.parseFloat((el as HTMLElement).dataset.zoomFactor ?? '1'));

const pile = (page: Page): Promise<string | null> =>
  page.locator('.forest-panel').evaluate((el) => (el as HTMLElement).dataset.pile ?? null);

/** Two-finger pinch through CDP touch events (Playwright has no multi-touch API). */
async function pinch(page: Page, from: [number, number][], to: [number, number][]): Promise<void> {
  const cdp = await page.context().newCDPSession(page);
  const points = (pts: [number, number][]) => pts.map(([x, y], i) => ({ x, y, id: i + 1 }));
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: points(from) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: points(to) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
}

/** Answers of the round's blanks, read from the panel's data attributes. */
function blanks(kind: string, p: number, a: number): number[] {
  const b = p / a;
  if (kind !== 'family') return [b];
  return a === b ? [p, b] : [p, p, b, a];
}

async function answerByTap(page: Page, value: number): Promise<void> {
  const pad = page.locator('.forest-panel .kit-pad');
  for (const digit of String(value)) {
    await pad.getByRole('button', { name: digit, exact: true }).tap();
  }
  await pad.getByRole('button', { name: 'Xong' }).tap();
}

test('pinch zooms the forest camera and one finger still answers round 1', async ({
  page,
}, info) => {
  skipNonTablet(info.project.name);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startAtForestGate(page);
  await enterForest(page);
  expect(await zoomFactor(page)).toBe(1);

  const portrait = info.project.name === 'tablet-portrait';
  // Points in the free canvas band: left of the right-side panel (its left edge is
  // x=478 on portrait, x=838 on landscape), clear of the guide above and the zoom
  // buttons at the left edge (y≈545–649 on portrait).
  const y = 400;
  const from: [number, number][] = portrait
    ? [
        [150, y],
        [400, y],
      ]
    : [
        [250, y],
        [450, y],
      ];
  const spread: [number, number][] = portrait
    ? [
        [100, y],
        [450, y],
      ]
    : [
        [200, y],
        [500, y],
      ];
  const pileBefore = await pile(page);
  await pinch(page, from, spread);
  const zoomed = await zoomFactor(page);
  expect(zoomed).toBeGreaterThan(0.6);
  expect(zoomed).toBeLessThan(1);
  // The pinch never answered or dropped anything.
  expect(await pile(page)).toBe(pileBefore);

  // Squeeze back out past 1×.
  await pinch(page, spread, from);
  expect(await zoomFactor(page)).toBeGreaterThan(zoomed);

  // The +/− buttons step the same factor and are big enough to tap.
  const zoomIn = page.locator('.level-zoom__in');
  const zoomOut = page.locator('.level-zoom__out');
  const box = await zoomIn.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(box?.width).toBeGreaterThanOrEqual(44);
  const beforeButtons = await zoomFactor(page);
  await zoomIn.tap();
  expect(await zoomFactor(page)).toBeLessThan(beforeButtons);
  await zoomOut.tap();
  expect(await zoomFactor(page)).toBeCloseTo(beforeButtons, 6);
  if (portrait) {
    await page.screenshot({ path: 'test-results/forest-zoom-tablet.png' });
  }

  // One finger still plays: deal everything, check, answer the blank by tap.
  const panel = page.locator('.forest-panel[data-round="0"]');
  await expect(panel).toBeVisible();
  const data = await panel.evaluate((el) => ({ ...(el as HTMLElement).dataset }));
  const deal = page.locator('.forest-deal');
  while (await deal.isEnabled()) await deal.tap();
  await expect(panel).toHaveAttribute('data-pile', '0');
  await page.locator('.forest-check').tap();
  await expect(page.locator('.forest-panel .feedback')).toHaveClass(/success/);
  for (const value of blanks(data.kind as string, Number(data.dividend), Number(data.divisor))) {
    await answerByTap(page, value);
  }
  await expect(page.locator('.forest-panel .feedback')).toContainText('Đúng rồi!');

  // Next round starts unzoomed.
  await page.locator('.forest-next').tap();
  await expect(page.locator('.forest-panel[data-round="1"]')).toBeVisible();
  await expect.poll(() => zoomFactor(page)).toBe(1);
  expect(errors).toEqual([]);
});
