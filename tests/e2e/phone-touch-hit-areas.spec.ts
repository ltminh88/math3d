// QA p-6: on touch screens the top-bar buttons (38 px) and the quest toggle (26 px tall) take
// taps over at least 44 x 44 px, without changing how they look.
import { type Page, test } from '@playwright/test';
import { expect, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });

/** The element a tap at (dx, dy) px outside the edge midpoints of `selector` reaches. */
const hitsAround = (page: Page, selector: string, reach: number) =>
  page.evaluate(
    ({ selector, reach }) => {
      const el = document.querySelector(selector) as HTMLElement;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const padX = Math.max(0, (44 - r.width) / 2) - reach;
      const padY = Math.max(0, (44 - r.height) / 2) - reach;
      const points = [
        [cx, r.top - padY],
        [cx, r.bottom + padY - 1],
        [r.left - padX, cy],
        [r.right + padX - 1, cy],
      ];
      return points.map(
        ([x, y]) => document.elementFromPoint(x as number, y as number)?.closest(selector) === el,
      );
    },
    { selector, reach },
  );

test('top-bar buttons and the quest toggle have 44 px touch targets', async ({ page }) => {
  await page.goto('/');
  await waitForStoreBoot(page);
  test.skip(!(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)), 'touch only');
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  for (const selector of ['#language', '#sound', '#settings', '#quest-toggle']) {
    expect(await hitsAround(page, selector, 0.5), selector).toEqual([true, true, true, true]);
  }
});

// Chapter-2 playthrough: the title screen's "Khám phá bảng cửu chương" / "Nhập mã lưu" text
// buttons are 30 px tall on phones, and every dialog's round close button is 34 px.
test('title text buttons and the dialog close button have 44 px touch targets', async ({
  page,
}) => {
  await page.goto('/');
  await waitForStoreBoot(page);
  test.skip(!(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)), 'touch only');
  // Stacked 10 px apart: their hit areas meet in the gap, so count the rows each one takes.
  for (const selector of ['#learn-welcome', '#import-save-code']) {
    const rows = await page.evaluate((s) => {
      const el = document.querySelector(s) as HTMLElement;
      const r = el.getBoundingClientRect();
      let n = 0;
      for (let y = Math.floor(r.top) - 30; y <= r.bottom + 30; y++) {
        if (document.elementFromPoint(r.left + r.width / 2, y)?.closest(s) === el) n++;
      }
      return n;
    }, selector);
    expect(rows, selector).toBeGreaterThanOrEqual(44);
  }
  await page.locator('#learn-welcome').tap();
  await expect(page.locator('#close-dialog')).toBeVisible();
  expect(await hitsAround(page, '#close-dialog', 0.5)).toEqual([true, true, true, true]);
});
