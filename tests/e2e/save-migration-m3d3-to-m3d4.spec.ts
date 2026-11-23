// Phase 13: importing a shipped M3D3 code into M3D4 keeps every level's stage 1 complete
// with its old stars, opens stages 2+ at 0, points the quest card at the market (chapter 3
// opens after the cave), offers the next stage at the gate, and unlocks daily practice with a
// pool drawn from the imported stats.
// A fresh profile still sees field stage 1 open and daily locked.
// Uses the shipped all-done M3D3 code from stage-migration.spec.ts.
import { type Page, test } from '@playwright/test';
import {
  expect,
  SLOW_TEST_MS,
  waitDialogSettled,
  waitForStoreBoot,
} from './legacy-live-save-fixtures';

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
  // The quest card points at the market (chapter 3), with the market's fresh stage line
  // (an old all-done save never played the market) and the daily line (unlocked, not done).
  await expect(page.locator('#quest-title')).toHaveText('Chợ Phiên Tí Hon');
  await expect(page.locator('#quest-stage')).toHaveText('Chặng 1/5 · 0/15 sao');
  await expect(page.locator('#quest-daily')).toHaveText('Hôm nay: chưa luyện');
  // The field gate offers stage 2 (its stage 1 is done, stages 2+ open at 0).
  await page.locator('#open-map').click();
  await page.locator('[data-region="meadow"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Đã hoàn thành ★★☆ · Chặng 2/6',
  );
  await expect(page.locator('#map-detail .map-enter')).toHaveText('Vào chơi');
  // So does the cave gate (5 stages since PR #20).
  await page.locator('[data-region="cave"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Đã hoàn thành ★★☆ · Chặng 2/5',
  );
  await expect(page.locator('#map-detail .map-enter')).toHaveText('Vào chơi');
  await page.locator('#close-map').click();
  // Daily practice is unlocked, with a pool drawn from the imported stats: the code carries
  // only the learned fact 3×7, so the set has that one question (no top-up under 10).
  await page.locator('#open-daily').click();
  await expect(page.locator('#dialog-content')).toContainText('Luyện tập hôm nay · Câu 1/1');
  // The fact renders as 3 × 7 or 7 × 3 (multiplication commutes; the set shuffles it).
  await expect(page.locator('#dialog-content')).toContainText(/[37] × [37] = \?/);
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
});

test('a fresh profile sees field stage 1 open and daily locked', async ({ page }) => {
  await page.goto('/');
  await play(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  expect(await page.evaluate(() => window.__game?.gateStatus('field'))).toBe('open');
  await expect(page.locator('#quest-stage')).toHaveText('Chặng 1/6 · 0/18 sao');
  await expect(page.locator('#quest-daily')).toHaveCount(0);
  await page.locator('#open-daily').click();
  await expect(page.locator('#dialog-content')).toContainText(
    'Luyện tập hôm nay sẽ mở sau khi con xong chặng 1 ở Cánh Đồng Phép Tính.',
  );
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
});
