import { type Page, test } from '@playwright/test';
import { decodeSaveV1 } from '../../src/save/save-storage';
import type { SaveV1 } from '../../src/save/save-types';
import { encodeSaveCode } from '../../src/store/save-code-codec';
import {
  expect,
  expectHud,
  LIVE_SAVE_MID_QUEST,
  LIVE_SAVE_QUEST_COMPLETE,
  QUEST_COMPLETE_HUD,
  SLOW_TEST_MS,
  waitForStoreBoot,
} from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const liveCode = encodeSaveCode(
  decodeSaveV1(LIVE_SAVE_QUEST_COMPLETE, { cap: false }) as SaveV1,
  {},
);

async function importCode(page: Page, code: string): Promise<void> {
  await waitForStoreBoot(page);
  await page.locator('#import-save-code').click();
  await page.locator('#save-code-input').fill(code);
  await page.locator('#save-code-confirm').click();
}

test('a live save as a code imports on a fresh profile with identical progress', async ({
  page,
}) => {
  await page.goto('/');
  await waitForStoreBoot(page);
  await importCode(page, liveCode);
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  await expectHud(page, QUEST_COMPLETE_HUD);
  await page.reload();
  await expectHud(page, QUEST_COMPLETE_HUD);
});

test('export -> fresh site data -> import round-trips', async ({ browser }) => {
  const first = await browser.newContext({ locale: 'vi-VN' });
  const page = await first.newPage();
  await page.goto('/');
  await importCode(page, liveCode);
  await expectHud(page, QUEST_COMPLETE_HUD);
  await page.locator('#play').click();
  await page.locator('#settings').click();
  await page.locator('#export-save-code').click();
  const exported = await page.locator('#save-code-output').inputValue();
  expect(exported).toMatch(/^M3D2-[A-Za-z0-9_-]+-[0-9a-f]{8}$/);
  await first.close();

  const fresh = await browser.newContext({ locale: 'vi-VN' });
  const again = await fresh.newPage();
  await again.goto('/');
  await importCode(again, exported);
  await expectHud(again, QUEST_COMPLETE_HUD);
  await fresh.close();
});

test('a damaged code shows a friendly error and leaves progress untouched', async ({ page }) => {
  await page.goto('/');
  await waitForStoreBoot(page);
  const damaged = `${liveCode.slice(0, 12)}${liveCode[12] === 'A' ? 'B' : 'A'}${liveCode.slice(13)}`;
  await importCode(page, damaged);
  await expect(page.locator('#save-code-error')).toBeVisible();
  await expect(page.locator('#save-code-error')).toContainText('sai vài ký tự');
  // The dialog stays open with the error: paste again.
  await page.locator('#save-code-input').fill('X3D1-abc-00000000');
  await page.locator('#save-code-confirm').click();
  await expect(page.locator('#save-code-error')).toContainText('không phải mã lưu');
  await page.reload();
  await expect(page.locator('#coins')).toHaveText('0');
  await expect(page.locator('#play')).toHaveText(/Bắt đầu phiêu lưu/);
});

test('importing over existing progress asks before overwriting', async ({ page }) => {
  await page.goto('/');
  const midCode = encodeSaveCode(decodeSaveV1(LIVE_SAVE_MID_QUEST, { cap: false }) as SaveV1, {});
  await importCode(page, midCode);
  await expect(page.locator('#coins')).toHaveText('15');

  await importCode(page, liveCode);
  await expect(page.locator('#dialog-title')).toHaveText('Ghi đè tiến độ hiện tại?');
  await page.locator('#overwrite-no').click();
  await page.locator('#close-dialog').click();
  await expect(page.locator('#coins')).toHaveText('15');

  await importCode(page, liveCode);
  await page.locator('#overwrite-yes').click();
  await expectHud(page, QUEST_COMPLETE_HUD);
});
