// The store boot window (<html data-boot="store">) and a store that fails to open: clicks made
// before the store is connected must not be lost, and a dead store must say so.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const NOT_PERSISTENT = 'Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.';

/**
 * With `?hold-idb`, the IndexedDB open "success" event is held back until
 * `window.__releaseIdb()`: the page stays in its boot window as long as the test needs.
 */
async function holdIndexedDbOpen(page: Page): Promise<void> {
  await page.addInitScript(() => {
    if (!location.search.includes('hold-idb')) return;
    const held: Array<() => void> = [];
    let holding = true;
    const add = EventTarget.prototype.addEventListener;
    IDBOpenDBRequest.prototype.addEventListener = function (
      this: IDBOpenDBRequest,
      type: string,
      listener: EventListenerOrEventListenerObject | null,
      options?: boolean | AddEventListenerOptions,
    ) {
      if (type !== 'success' || typeof listener !== 'function') {
        return add.call(this, type, listener, options);
      }
      return add.call(
        this,
        type,
        (event: Event) => {
          if (holding) held.push(() => listener.call(this, event));
          else listener.call(this, event);
        },
        options,
      );
    };
    (window as unknown as { __releaseIdb: () => void }).__releaseIdb = () => {
      holding = false;
      for (const run of held.splice(0)) run();
    };
  });
}

test('avatar and Play clicked while the store boots are kept', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await holdIndexedDbOpen(page);
  await page.goto('/?hold-idb');
  await expect(page.locator('#play')).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'store');

  await page.locator('#girl').click();
  await page.locator('#play').click();
  await page.evaluate(() => (window as unknown as { __releaseIdb: () => void }).__releaseIdb());
  await waitForStoreBoot(page);
  await expect(page.locator('body')).toHaveClass(/playing/);
  await expect(page.locator('#avatar-face')).toHaveText('👧');

  await page.goto('/');
  await waitForStoreBoot(page);
  await expect(page.locator('#avatar-face')).toHaveText('👧');
  await expect(page.locator('#play')).toHaveText(/Tiếp tục phiêu lưu/);
  expect(errors).toEqual([]);
});

test('a store that cannot load still plays in memory and says progress is not saved', async ({
  page,
}) => {
  await page.addInitScript(() => {
    IDBDatabase.prototype.transaction = () => {
      throw new DOMException('test: store unreadable', 'UnknownError');
    };
  });
  await page.goto('/');
  await waitForStoreBoot(page);
  await expect(page.locator('#toast')).toHaveText(NOT_PERSISTENT);
  await page.locator('#girl').click();
  await page.locator('#play').click();
  await expect(page.locator('#avatar-face')).toHaveText('👧');
});
