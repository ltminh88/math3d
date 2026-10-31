// QA M-2: a save code carries the whole progress. Export after completing every level and buying
// and wearing an item -> import in a fresh browser context -> gates, quest card, levels, wallet
// and cosmetics are back (and survive a reload). Uses the test-build hook `window.__game`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const LEVELS = ['field', 'forest', 'city', 'tower'] as const;
const ITEM = 'vlm-red-scarf';

/** A returning player with coins (legacy v1 save, imported once at boot). */
const legacySave = JSON.stringify({
  version: 1,
  xp: 30,
  coins: 120,
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

async function play(page: Page): Promise<void> {
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

const gateStatuses = (page: Page) =>
  page.evaluate((ids) => ids.map((id) => window.__game?.gateStatus(id)), [...LEVELS]);

async function expectFullProgress(page: Page): Promise<void> {
  await expect.poll(() => gateStatuses(page)).toEqual(Array(4).fill('completed'));
  await expect(page.locator('#quest-title')).toHaveText('Khu Vườn Quy Luật');
  await expect(page.locator('#quest-progress')).toHaveText('Sắp ra mắt');
  const snap = await page.evaluate(() => window.__game?.snapshot());
  for (const id of LEVELS) expect(snap?.levelProgress[id]?.completedAt, id).toBeGreaterThan(0);
  expect(snap?.levelProgress.bridge?.progress).toBe(6);
  expect(snap?.ownedCosmetics).toEqual([ITEM]);
  expect(snap?.profile.settings.equipped['vlm-outfit']).toBe(ITEM);
  expect(snap?.wallet.coins).toBe(100);
  await expect(page.locator('#coins')).toHaveText('100');
}

test('export after all levels and a purchase -> fresh context import restores everything', async ({
  browser,
}) => {
  const first = await browser.newContext({ locale: 'vi-VN' });
  const page = await first.newPage();
  await page.addInitScript((save) => {
    const key = 'aigame3d_multiplication_save';
    if (localStorage.getItem(key) === null) localStorage.setItem(key, save);
  }, legacySave);
  await page.goto('/');
  await play(page);
  await page.evaluate(
    (levels) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: levels }),
    [...LEVELS],
  );
  await page.locator('#open-shop').click();
  const card = page.locator(`[data-card="${ITEM}"]`);
  await card.locator('[data-action="ask"]').click();
  await card.locator('[data-action="buy"]').click();
  await expect(card).toHaveAttribute('data-state', 'owned');
  await card.locator('[data-action="equip"]').click();
  await expect(card).toHaveAttribute('data-state', 'equipped');
  await page.locator('#close-dialog').click();
  await expectFullProgress(page);

  await page.locator('#settings').click();
  await page.locator('#export-save-code').click();
  const code = await page.locator('#save-code-output').inputValue();
  expect(code).toMatch(/^M3D3-[A-Za-z0-9_-]+-[0-9a-f]{8}$/);
  await first.close();

  const fresh = await browser.newContext({ locale: 'vi-VN' });
  const again = await fresh.newPage();
  await again.goto('/');
  await waitForStoreBoot(again);
  await again.locator('#import-save-code').click();
  await again.locator('#save-code-input').fill(code);
  await again.locator('#save-code-confirm').click();
  await expect(again.locator('#dialog')).not.toHaveAttribute('open', '');
  await play(again);
  await expectFullProgress(again);

  await again.reload();
  await play(again);
  await expectFullProgress(again);
  await fresh.close();
});

// Plain-http LAN pages have no `navigator.clipboard`; "Sao chép mã" falls back to copying the
// selected text and still confirms with a toast.
test('copy works without the clipboard API (plain-http LAN)', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, 'clipboard', { get: () => undefined });
  });
  await page.goto('/');
  await play(page);
  await page.locator('#settings').click();
  await page.locator('#export-save-code').click();
  await page.locator('#save-code-copy').click();
  await expect(page.locator('#toast')).toHaveText('Đã sao chép mã lưu.');
});
