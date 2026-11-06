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

/** Lines the text of `selector` (one text node) wraps onto. */
const textLines = (page: Page, selector: string) =>
  page.evaluate((s) => {
    const range = document.createRange();
    range.selectNodeContents(document.querySelector(s) as HTMLElement);
    return new Set([...range.getClientRects()].map((rect) => Math.round(rect.top))).size;
  }, selector);

// Chapter-2 playthrough on phones (m-5): the math3d logo button and the floating "Nói chuyện với
// VLM" label are 40 px tall, and the player card's "Nhà thám hiểm" wraps onto two lines (phones
// and tablet portrait) once the level badge sits beside it and the wallet holds 3-digit coins.
test('logo and VLM label have 44 px touch targets; the explorer name stays on one line', async ({
  page,
}) => {
  await page.goto('/');
  await waitForStoreBoot(page);
  test.skip(!(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)), 'touch only');
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  // The label follows the camera, which glides after Play and passes the label under the quest
  // card; until the first projected frame it sits at the top-left corner. Stand south of VLM
  // (label mid-screen) and wait for it to be placed below the top bar and stop moving.
  await page.waitForFunction(() => '__game' in window);
  await page.evaluate(() => window.__game?.teleport(-3, 6));
  await expect(page.locator('#milo-label')).toBeVisible();
  const labelBox = () =>
    page.evaluate(() => {
      const r = document.querySelector('#milo-label')?.getBoundingClientRect();
      return r && r.top > 100 ? `${r.left},${r.top}` : 'unplaced';
    });
  await expect
    .poll(async () => {
      const before = await labelBox();
      await page.waitForTimeout(500);
      return before !== 'unplaced' && before === (await labelBox());
    })
    .toBe(true);
  // The widest card the playthrough saw: level 5, 3-digit coins.
  await page.evaluate(() => {
    (document.querySelector('#level') as HTMLElement).textContent = '5';
    (document.querySelector('#coins') as HTMLElement).textContent = '999';
  });
  expect(await textLines(page, '#player-name'), 'player card name').toBe(1);
  // On one line without running into the wallet.
  const gap = await page.evaluate(
    () =>
      (document.querySelector('#wallet') as HTMLElement).getBoundingClientRect().left -
      (document.querySelector('.level-badge') as HTMLElement).getBoundingClientRect().right,
  );
  expect(gap, 'level badge clear of the wallet').toBeGreaterThanOrEqual(0);
  for (const selector of ['.brand', '#milo-label']) {
    expect(await hitsAround(page, selector, 0.5), selector).toEqual([true, true, true, true]);
  }
});
