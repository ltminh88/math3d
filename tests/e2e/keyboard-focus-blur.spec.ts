// QA m-10: tabbing past the last HUD button moves focus to the browser chrome and blurs the
// window; that must not open Settings. A genuine window blur (switching apps) still does (kept
// quirk of the original game).
import { type Page, test } from '@playwright/test';
import { expect, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });

async function startPlaying(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

const dialogOpen = (page: Page) =>
  page.evaluate(() => (document.getElementById('dialog') as HTMLDialogElement).open);

test('Tab cycling through the HUD never opens Settings', async ({ page }) => {
  await startPlaying(page);
  for (let i = 0; i < 40; i++) {
    await page.keyboard.press('Tab');
    expect(await dialogOpen(page), `after Tab #${i + 1}`).toBe(false);
  }
  // A Tab out of the page that blurs the window, as the browser does at the end of the order.
  await page.keyboard.press('Tab');
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await page.waitForTimeout(300);
  expect(await dialogOpen(page)).toBe(false);
});

test('a genuine window blur (switching apps) still opens Settings', async ({ page }) => {
  await startPlaying(page);
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect(page.locator('#dialog-title')).toHaveText('Một chút cài đặt');
});
