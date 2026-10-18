import { expect, test } from '@playwright/test';

test.use({ locale: 'vi-VN' });

test('boots with the Vietnamese title, html lang and a manifest', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle('Hành Trình Đá Số');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('link[rel="manifest"]')).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Hành Trình Đá Số' })).toBeVisible();
});

test('serves the manifest with the game name', async ({ request }) => {
  const res = await request.get('/manifest.webmanifest');
  expect(res.ok()).toBe(true);
  const manifest = await res.json();
  expect(manifest.name).toBe('Hành Trình Đá Số');
  expect(manifest.lang).toBe('vi');
});
