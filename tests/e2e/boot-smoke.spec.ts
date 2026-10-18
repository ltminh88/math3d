import { expect, test } from '@playwright/test';

test.use({ locale: 'vi-VN' });

const TITLE = 'Math AI Game 3D - Vương Quốc Cửu Chương';

test('boots the recovered game: title, html lang, manifest, welcome menu, 3D world', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await expect(page).toHaveTitle(TITLE);
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  await expect(page.locator('#welcome')).toBeVisible();
  await expect(page.locator('#play')).toBeVisible();
  await expect(page.locator('#world')).toBeAttached();
  // Bootstrap hides the loading card once the world is built (WebGL via SwiftShader).
  await expect(page.locator('#loading')).toBeHidden();
  expect(errors).toEqual([]);
});

test('starting the adventure shows the HUD', async ({ page }) => {
  await page.goto('/');
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await expect(page.locator('#hud')).toBeVisible();
});

test('serves the manifest with the game name', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest');
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest.name).toBe('Math AI Game 3D – Vương Quốc Cửu Chương');
  expect(manifest.short_name).toBe('Cửu Chương');
  expect(manifest.theme_color).toBe('#194f42');
  expect(manifest.lang).toBe('vi');
});
