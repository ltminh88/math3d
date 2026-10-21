import { test } from '@playwright/test';
import {
  expect,
  expectHud,
  LIVE_SAVE_MID_QUEST,
  LIVE_SAVE_QUEST_COMPLETE,
  QUEST_COMPLETE_HUD,
  SAVE_KEY,
  SLOW_TEST_MS,
  waitForStoreBoot,
} from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

/** Seeds the legacy keys before any page script runs (every navigation, like a returning player). */
async function seedLegacyKeys(page: import('@playwright/test').Page, keys: Record<string, string>) {
  await page.addInitScript((entries) => {
    for (const [k, v] of Object.entries(entries)) {
      if (localStorage.getItem(k) === null) localStorage.setItem(k, v);
    }
  }, keys);
}

test('a live-site save migrates once into IndexedDB; the old key is never touched', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await seedLegacyKeys(page, { [SAVE_KEY]: LIVE_SAVE_QUEST_COMPLETE });
  await page.goto('/');
  await expectHud(page, QUEST_COMPLETE_HUD);

  await page.reload();
  await expectHud(page, QUEST_COMPLETE_HUD);
  const marker = await page.evaluate(
    () =>
      new Promise<unknown>((resolve, reject) => {
        const req = indexedDB.open('math3d');
        req.onerror = () => reject(req.error);
        req.onsuccess = () => {
          const get = req.result.transaction('meta').objectStore('meta').get('legacyImport');
          get.onsuccess = () => resolve(get.result?.value?.v);
        };
      }),
  );
  expect(marker).toBe(1);
  expect(await page.evaluate((k) => localStorage.getItem(k), SAVE_KEY)).toBe(
    LIVE_SAVE_QUEST_COMPLETE,
  );
  expect(errors).toEqual([]);
});

test('language, quest card and mid-quest bridge carry over; progress made later persists', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await seedLegacyKeys(page, {
    [SAVE_KEY]: LIVE_SAVE_MID_QUEST,
    aigame3d_language: 'en',
    aigame3d_quest_collapsed: '1',
  });
  await page.goto('/');
  await expectHud(page, {
    level: '1',
    coins: '15',
    xpText: '30 / 100 XP',
    bridgeBuilt: 3,
    questStepsDone: 3,
    // Original quirk: the translator matches whole text nodes, so this one stays Vietnamese.
    questProgress: '3 / 6 đoạn cầu',
    play: /Continue adventure/,
  });
  await expect(page.locator('#language')).toHaveText('VI');
  await expect(page.locator('#quest-card')).toHaveClass(/collapsed/);

  // Play on: pick the girl avatar, switch back to Vietnamese (reload), the new choices stick.
  await page.locator('#girl').click();
  await page.locator('#language').click();
  await page.waitForLoadState('load');
  await waitForStoreBoot(page);
  await expect(page.locator('#language')).toHaveText('EN');
  await expect(page.locator('#avatar-face')).toHaveText('👧');
  await expect(page.locator('#coins')).toHaveText('15');
  expect(await page.evaluate(() => localStorage.getItem('aigame3d_language'))).toBe('en');
  expect(await page.evaluate((k) => localStorage.getItem(k), SAVE_KEY)).toBe(LIVE_SAVE_MID_QUEST);
});

test('a corrupt or unknown-version legacy save boots with defaults and no error', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await seedLegacyKeys(page, { [SAVE_KEY]: '{"version":2,"xp":999,"coins":999}' });
  await page.goto('/');
  await waitForStoreBoot(page);
  await expect(page.locator('#play')).toHaveText(/Bắt đầu phiêu lưu/);
  await expect(page.locator('#coins')).toHaveText('0');
  expect(errors).toEqual([]);
});
