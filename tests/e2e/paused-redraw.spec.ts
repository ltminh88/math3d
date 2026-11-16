// Paused redraw flag (issue #3, shop:143 follow-up): while a dialog is open the world loop
// skips its render, so a resize must still redraw once — otherwise the resized drawing
// buffer stays black behind the dialog. Rotating the viewport with the shop open is the
// regression case (the parity capture of dialog screens went black the same way).
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const legacySave = (coins: number) =>
  JSON.stringify({
    version: 1,
    xp: 30,
    coins,
    bridge: 0,
    questAccepted: false,
    questComplete: false,
    avatar: 'boy',
    table: 0,
    sound: false,
    music: false,
    combo: 0,
    questionStats: {},
    review: [],
    started: true,
  });

async function startWithCoins(page: Page, coins: number): Promise<void> {
  await page.addInitScript((save) => {
    const key = 'aigame3d_multiplication_save';
    if (localStorage.getItem(key) === null) localStorage.setItem(key, save);
  }, legacySave(coins));
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await expect(page.locator('#coins')).toHaveText(String(coins));
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

/**
 * Fraction of near-black pixels in a mid-height band of the page, excluding the open
 * dialog's x-range (the band sits inside the dialog's height, so masking by x is enough).
 * A black canvas reads ~1; the rendered village reads well under 0.5.
 */
async function blackFractionOutsideDialog(page: Page): Promise<number> {
  const { width, height, dpr, dialog } = await page.evaluate(() => {
    const rect = document.querySelector('dialog')?.getBoundingClientRect();
    return {
      width: innerWidth,
      height: innerHeight,
      dpr: devicePixelRatio,
      dialog: rect ? { left: rect.left, right: rect.right } : null,
    };
  });
  const clip = {
    x: 0,
    y: Math.round(height * 0.45),
    width,
    height: Math.max(1, Math.round(height * 0.1)),
  };
  const shot = await page.screenshot({ clip });
  return page.evaluate(
    async ({ b64, left, right }) => {
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('band screenshot did not load'));
        img.src = `data:image/png;base64,${b64}`;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return 1;
      ctx.drawImage(img, 0, 0);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let black = 0;
      let total = 0;
      for (let i = 0; i < data.length; i += 4) {
        const x = (i / 4) % canvas.width;
        if (left !== null && right !== null && x >= left && x <= right) continue;
        total++;
        const r = data[i] ?? 0;
        const g = data[i + 1] ?? 0;
        const b = data[i + 2] ?? 0;
        if (r < 16 && g < 16 && b < 16) black++;
      }
      return total === 0 ? 1 : black / total;
    },
    {
      b64: shot.toString('base64'),
      left: dialog ? dialog.left * dpr : null,
      right: dialog ? dialog.right * dpr : null,
    },
  );
}

test('dialog open + rotate: canvas behind the dialog is not black', async ({ page }) => {
  await startWithCoins(page, 300);
  await page.locator('#open-shop').click();
  await expect(page.locator('#dialog-title')).toHaveText('Cửa hàng của làng');
  // Control: the world behind the dialog renders before the rotate.
  expect(await blackFractionOutsideDialog(page)).toBeLessThan(0.5);
  // Rotate: swap the viewport's width and height.
  const viewport = page.viewportSize();
  if (!viewport) throw new Error('no viewport to rotate');
  await page.setViewportSize({ width: viewport.height, height: viewport.width });
  // The resize clears the drawing buffer; the redraw flag must draw one fresh frame
  // while paused (on this slow VM a frame can take seconds, so poll).
  await expect.poll(() => blackFractionOutsideDialog(page), { timeout: 30_000 }).toBeLessThan(0.5);
});
