// Phase 13: importing a shipped M3D3 code into M3D4 keeps every level's stage 1 complete
// with its old stars, opens stages 2+ at 0, shows the closing quest card, offers the next
// stage at the gate, and unlocks daily practice with a pool drawn from the imported stats.
// A fresh profile still sees field stage 1 open and daily locked.
// The cave gate's own "offers stage 2" case waits for PR #20 (cave 5 stages): on current
// main the cave still has 1 stage, so the field gate (6 stages) witnesses the same path
// here, and the cave assertion lands when main is merged after #20.
// Uses the shipped all-done M3D3 code from stage-migration.spec.ts.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

/** A shipped M3D3 code (written by the M3D3 exporter): every level finished with 2 stars. */
const SHIPPED_M3D3_ALL_DONE =
  'M3D3-eyJ4IjoxMCwiYyI6NSwiZyI6WzAsMCwxXSwicyI6WzEsMF0sIm4iOjMsImwiOnsiYnJpZGdlIjpbMSwwLDE3OTM0MzU0MTUsNiwxNzkzNDM1NDE1XSwiZmllbGQiOlsyLDIwMCwxNzkzNDM1NDE1LDAsMTc5MzQzNTQxNV0sImZvcmVzdCI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XSwiY2l0eSI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XSwidG93ZXIiOlsyLDIwMCwxNzkzNDM1NDE1LDAsMTc5MzQzNTQxNV0sImdhcmRlbiI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XSwidmFsbGV5IjpbMiwyMDAsMTc5MzQzNTQxNSwwLDE3OTM0MzU0MTVdLCJ3b3Jrc2hvcCI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XSwiY2F2ZSI6WzIsMjAwLDE3OTM0MzU0MTUsMCwxNzkzNDM1NDE1XX0sImYiOltbIjN4NyIsOSw3LDQxMDAwLDMsMCwxNzkzNDM1NDE1XV19-85fdd25a';

const LEVEL_IDS = ['field', 'forest', 'city', 'tower', 'garden', 'valley', 'workshop', 'cave'];

async function play(page: Page): Promise<void> {
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

async function importCode(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.locator('#import-save-code').click();
  await page.locator('#save-code-input').fill(SHIPPED_M3D3_ALL_DONE);
  await page.locator('#save-code-confirm').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
}

test('importing a shipped M3D3 code migrates every level to stage 1 done', async ({ page }) => {
  await importCode(page);
  await play(page);

  const snap = await page.evaluate(() => window.__game?.snapshot());
  for (const levelId of LEVEL_IDS) {
    const level = snap?.levelProgress[levelId];
    expect(level?.stars, `${levelId} stars`).toBe(2);
    expect(level?.stageStars, `${levelId} stage 1 inherits its stars`).toEqual([2]);
    expect(level?.completedAt, `${levelId} completedAt`).toBeGreaterThan(0);
  }
  // The quest card shows the closing card, with the daily line (unlocked, not done today).
  await expect(page.locator('#quest-title')).toHaveText('Bạn đã qua cả chín thử thách!');
  await expect(page.locator('#quest-daily')).toHaveText('Hôm nay: chưa luyện');
  // The field gate offers stage 2 (its stage 1 is done, stages 2+ open at 0).
  await page.locator('#open-map').click();
  await page.locator('[data-region="meadow"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Đã hoàn thành ★★☆ · Chặng 2/6',
  );
  await expect(page.locator('#map-detail .map-enter')).toHaveText('Vào chơi');
  await page.locator('#close-map').click();
  // Daily practice is unlocked, with a pool drawn from the imported stats (the code carries
  // the learned fact 3×7, so the set is planned from it).
  await page.locator('#open-daily').click();
  await expect(page.locator('#dialog-content')).toContainText('Luyện tập hôm nay · Câu 1/10');
  await page.locator('#close-dialog').click();
});

test('a fresh profile sees field stage 1 open and daily locked', async ({ page }) => {
  await page.goto('/');
  await play(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  expect(await page.evaluate(() => window.__game?.gateStatus('field'))).toBe('open');
  await expect(page.locator('#quest-stage')).toHaveText('Chặng 1/6 · 0 sao');
  await expect(page.locator('#quest-daily')).toHaveCount(0);
  await page.locator('#open-daily').click();
  await expect(page.locator('#dialog-content')).toContainText(
    'Luyện tập hôm nay sẽ mở sau khi con xong chặng 1 ở Cánh Đồng Phép Tính.',
  );
  await page.locator('#close-dialog').click();
});
