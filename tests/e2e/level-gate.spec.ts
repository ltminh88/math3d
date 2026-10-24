// Level gates in the meadow, forest, city and tower: locked until their requirement is met, open
// once it is (field and forest ship and are played in their own specs; a gate whose level folder
// is missing says "Sắp ra mắt"), VLM's interact prompt unchanged, no region badge on the labels or
// the map (the gate state says it). Uses the test-build hook `window.__game`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const LOCKED_BRIDGE = 'Hãy giúp VLM xây xong cây cầu, rồi đi qua cầu để mở cổng này nhé!';
const LOCKED_FIELD = 'Hoàn thành Cánh Đồng Phép Tính để mở cổng này nhé!';
const LOCKED_FOREST = 'Hoàn thành Rừng Nhân Chia để mở cổng này nhé!';
const LOCKED_CITY = 'Hoàn thành Thành Phố Con Số để mở cổng này nhé!';
const LEVEL_IDS = ['field', 'forest', 'city', 'tower'] as const;
/** Gate centres from LEVEL_GATES (src/config/level-gate-config.ts). */
const GATE_POSITIONS = [
  [29, -14.5],
  [37.2, 13.4],
  [58.5, 7.6],
  [60.6, -14.2],
] as const;

async function startPlaying(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

const gateStatuses = (page: Page) =>
  page.evaluate((ids) => ids.map((id) => window.__game?.gateStatus(id)), [...LEVEL_IDS]);

async function useGate(page: Page, levelId: string): Promise<void> {
  await page.evaluate((id) => window.__game?.teleportToGate(id), levelId);
  await expect(page.locator('#interact')).toBeVisible();
  await page.locator('#interact').click();
}

test('gates stay locked before the bridge quest; VLM keeps his prompt', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  await page.evaluate(() => window.__game?.teleport(-3, 3.6));
  await expect(page.locator('#interact')).toContainText('Nói chuyện với VLM');

  await useGate(page, 'field');
  await expect(page.locator('#interact')).toContainText(
    'Cổng Cánh Đồng Phép Tính 🔒 · Đi qua cầu để mở',
  );
  await expect(page.locator('#gate-field-label small')).toHaveText('Đi qua cầu để mở');
  await expect(page.locator('#gate-forest-label small')).toHaveText('Hoàn thành Cánh Đồng để mở');
  await expect(page.locator('#gate-city-label small')).toHaveText(
    'Hoàn thành Rừng Nhân Chia để mở',
  );
  await expect(page.locator('#gate-tower-label small')).toHaveText(
    'Hoàn thành Thành Phố Con Số để mở',
  );
  await expect(page.locator('#toast')).toHaveText(LOCKED_BRIDGE);

  await useGate(page, 'forest');
  await expect(page.locator('#toast')).toHaveText(LOCKED_FIELD);
  await useGate(page, 'city');
  await expect(page.locator('#interact')).toContainText(
    'Cổng Thành Phố Con Số 🔒 · Hoàn thành Rừng Nhân Chia để mở',
  );
  await expect(page.locator('#toast')).toHaveText(LOCKED_FOREST);
  await useGate(page, 'tower');
  await expect(page.locator('#interact')).toContainText(
    'Cổng Tháp Toán Học 🔒 · Hoàn thành Thành Phố Con Số để mở',
  );
  await expect(page.locator('#toast')).toHaveText(LOCKED_CITY);
  expect(await gateStatuses(page)).toEqual(['locked', 'locked', 'locked', 'locked']);
  expect(errors).toEqual([]);
});

test('the bridge opens the field gate; the field opens the forest gate', async ({ page }) => {
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await expect(page.locator('#gate-field-label small')).toHaveText('Cổng đã mở');
  await page.evaluate(() => window.__game?.teleportToGate('field'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Cánh Đồng Phép Tính');
  expect(await page.evaluate(() => window.__game?.gateStatus('field'))).toBe('open');

  await useGate(page, 'forest');
  await expect(page.locator('#toast')).toHaveText(LOCKED_FIELD);
  await page.evaluate(() => window.__game?.seedProgress({ completedLevels: ['field'] }));
  expect(await page.evaluate(() => window.__game?.gateStatus('forest'))).toBe('open');
  await page.evaluate(() => window.__game?.teleportToGate('forest'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Rừng Nhân Chia');
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(false);

  // Progress survives a reload: the gates read it back from the store.
  await page.reload();
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  expect(await gateStatuses(page)).toEqual(['completed', 'open', 'locked', 'locked']);
});

test('the forest opens the city gate, the city the tower gate (both Sắp ra mắt without a level)', async ({
  page,
}) => {
  await startPlaying(page);
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field', 'forest'] }),
  );
  expect(await gateStatuses(page)).toEqual(['completed', 'completed', 'coming-soon', 'locked']);
  await expect(page.locator('#gate-city-label small')).toHaveText('Sắp ra mắt');
  await useGate(page, 'city');
  await expect(page.locator('#interact')).toContainText('Cổng Thành Phố Con Số · Sắp ra mắt');
  await expect(page.locator('#toast')).toHaveText('Màn chơi này sắp ra mắt. Hẹn bạn quay lại nhé!');
  await useGate(page, 'tower');
  await expect(page.locator('#toast')).toHaveText(LOCKED_CITY);

  await page.evaluate(() => window.__game?.seedProgress({ completedLevels: ['city'] }));
  expect(await gateStatuses(page)).toEqual([
    'completed',
    'completed',
    'coming-soon',
    'coming-soon',
  ]);
  await expect(page.locator('#gate-tower-label small')).toHaveText('Sắp ra mắt');
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(false);
});

test('no region badges; the map shows each region’s gate state', async ({ page }) => {
  await startPlaying(page);
  await expect(page.locator('#city-label')).toBeAttached();
  await expect(page.locator('.coming-soon')).toHaveCount(0);
  await page.locator('#open-map').click();
  await expect(page.locator('#world-map')).toBeVisible();
  await expect(page.locator('#map-regions')).not.toContainText('Sắp ra mắt');
  await page.locator('[data-region="city"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Hoàn thành Rừng Nhân Chia để mở',
  );
  await page.locator('[data-region="tower"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Hoàn thành Thành Phố Con Số để mở',
  );
  await page.locator('[data-region="meadow"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveText('Cổng màn chơi: Đi qua cầu để mở');
  await page.locator('[data-region="village"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveCount(0);
});

test('gates stand on free ground: no tree, rock or prop overlaps a gate', async ({ page }) => {
  await startPlaying(page);
  const overlaps = await page.evaluate((positions) => {
    const obstacles = window.__parity?.obstacles ?? [];
    const gates = positions;
    const GATE_HALF_WIDTH = 1.6;
    return gates.flatMap(([gx, gz]) =>
      obstacles.filter((o) => {
        const d = Math.hypot(o.x - (gx as number), o.z - (gz as number));
        const ownCircle = Math.abs(o.z - (gz as number)) < 1e-6 && d <= 1.31;
        return !ownCircle && d < o.radius + GATE_HALF_WIDTH;
      }),
    );
  }, GATE_POSITIONS);
  expect(overlaps).toEqual([]);
});
