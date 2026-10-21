// The quest chain after the bridge: the quest card, VLM and the completion dialog point at the
// next open gate (field, then forest), locked gates say why, and a closing card ends the chain.
// Uses the test-build hook `window.__game`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

async function startPlaying(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

async function expectCard(page: Page, eyebrow: string, title: string, progress: string) {
  await expect(page.locator('#quest-toggle .eyebrow')).toHaveText(eyebrow);
  await expect(page.locator('#quest-title')).toHaveText(title);
  await expect(page.locator('#quest-progress')).toHaveText(progress);
}

async function talkToVlm(page: Page): Promise<void> {
  await page.evaluate(() => window.__game?.teleport(-3, 3.6));
  await expect(page.locator('#interact')).toContainText('Nói chuyện với VLM');
  await page.locator('#interact').click();
  await expect(page.locator('#accept-quest')).toContainText('Cùng luyện tập');
}

/** Answers the 6 bridge questions correctly (one segment each). */
async function buildBridge(page: Page): Promise<void> {
  await page.evaluate(() => window.__game?.teleport(-3, 3.6));
  await page.locator('#interact').click();
  await page.locator('#accept-quest').click();
  for (let i = 0; i < 6; i++) {
    // Bridge questions show the stone count ("◆ 12 viên đá"): that is the answer's value.
    const equation = (await page.locator('.equation').textContent()) ?? '';
    const stones = equation.match(/\d+/)?.[0];
    // dispatchEvent: no actionability wait (frames are slow behind the blurred dialog).
    await page.locator(`.answer[data-value="${stones}"]`).dispatchEvent('click');
    await expect(page.locator('#feedback')).toHaveClass(/success/);
    await page.locator('#next-question').dispatchEvent('click');
  }
  await expect(page.locator('#dialog')).not.toBeVisible();
}

test('crossing the bridge leads to the field gate', async ({ page }) => {
  await startPlaying(page);
  await expectCard(
    page,
    'CHUYẾN PHIÊU LƯU ĐẦU TIÊN',
    'Một cây cầu, ngàn niềm vui',
    'Gặp người dẫn đường',
  );
  await buildBridge(page);
  await expect(page.locator('#quest-progress')).toHaveText('Đi qua cầu để hoàn thành');

  // Built but not crossed: the field gate says to cross the bridge.
  await expect(page.locator('#gate-field-label small')).toHaveText('Đi qua cầu để mở');
  await page.evaluate(() => window.__game?.teleportToGate('field'));
  await expect(page.locator('#interact')).toContainText('🔒 · Đi qua cầu để mở');
  await page.locator('#interact').click();
  await expect(page.locator('#toast')).toHaveText(
    'Cầu đã xây xong! Bạn đi qua cầu là cổng này sẽ mở nhé!',
  );

  await page.evaluate(() => window.__game?.teleport(14, 0));
  await expect(page.locator('#dialog .book-note')).toHaveText(
    '✨ Cổng Cánh Đồng Phép Tính đã mở! Cổng ở cuối con đường bên kia cầu, phía cánh đồng lúa vàng. Nhấn M để xem bản đồ nhé!',
  );
  await page.locator('#keep-playing').click();
  await expectCard(page, 'NHIỆM VỤ TIẾP THEO', 'Cánh Đồng Phép Tính', 'Đến Cổng Cánh Đồng');
  await expect(page.locator('#quest-copy')).toContainText('✨ Cổng Cánh Đồng Phép Tính');
  await expect(page.locator('#quest-steps .done')).toHaveCount(1);
  await expect(page.locator('#gate-field-label small')).toHaveText('Cổng đã mở');

  await talkToVlm(page);
  await expect(page.locator('#dialog .dialog-copy')).toContainText(
    'Cổng Cánh Đồng Phép Tính đang chờ bạn ở cuối con đường bên kia cầu.',
  );
});

test('the field leads to the forest gate, the forest to the closing card', async ({ page }) => {
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await expectCard(page, 'NHIỆM VỤ TIẾP THEO', 'Cánh Đồng Phép Tính', 'Đến Cổng Cánh Đồng');
  await expect(page.locator('#gate-forest-label small')).toHaveText('Hoàn thành Cánh Đồng để mở');

  await page.evaluate(() => window.__game?.seedProgress({ completedLevels: ['field'] }));
  await expectCard(page, 'NHIỆM VỤ TIẾP THEO', 'Rừng Nhân Chia', 'Đến Cổng Rừng Nhân Chia');
  await expect(page.locator('#quest-copy')).toContainText('✨ Cổng Rừng Nhân Chia');
  await expect(page.locator('#quest-steps .done')).toHaveCount(2);
  await talkToVlm(page);
  await expect(page.locator('#dialog .dialog-copy')).toContainText(
    'Cổng Rừng Nhân Chia đã mở! Cổng đang chờ bạn ở cuối con đường bên kia cầu',
  );
  await page.locator('#close-dialog').click();

  await page.evaluate(() => window.__game?.seedProgress({ completedLevels: ['forest'] }));
  await expectCard(page, 'CHÚC MỪNG BẠN', 'Bạn đã qua cả ba chặng!', '✓ Hoàn thành');
  await expect(page.locator('#quest-copy')).toHaveText(
    'Bạn có thể luyện thêm cùng VLM, hoặc ghé Cửa hàng trong làng để tiêu xu. Thành Phố Con Số và Tháp Toán Học sắp ra mắt!',
  );
  await expect(page.locator('#quest-steps .done')).toHaveCount(3);

  // The stage is read back from the store after a reload.
  await page.reload();
  await waitForStoreBoot(page);
  await expectCard(page, 'CHÚC MỪNG BẠN', 'Bạn đã qua cả ba chặng!', '✓ Hoàn thành');
});
