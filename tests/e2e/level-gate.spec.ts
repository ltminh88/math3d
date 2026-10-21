// Level gates in the meadow and the forest (phase 13): locked until their requirement is met,
// open once it is (both levels ship: field in phase 14, forest in phase 15, played in their own
// specs), VLM's interact prompt unchanged, City/Tower marked coming soon on their labels and on
// the map. Uses the test-build hook `window.__game`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const LOCKED_BRIDGE = 'Hãy giúp VLM xây xong cây cầu, rồi đi qua cầu để mở cổng này nhé!';
const LOCKED_FIELD = 'Hoàn thành Cánh Đồng Phép Tính để mở cổng này nhé!';

async function startPlaying(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

const gateStatuses = () => [
  window.__game?.gateStatus('field'),
  window.__game?.gateStatus('forest'),
];

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
  await expect(page.locator('#toast')).toHaveText(LOCKED_BRIDGE);

  await useGate(page, 'forest');
  await expect(page.locator('#toast')).toHaveText(LOCKED_FIELD);
  expect(await page.evaluate(gateStatuses)).toEqual(['locked', 'locked']);
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
  expect(await page.evaluate(gateStatuses)).toEqual(['completed', 'open']);
});

test('City and Tower say Sắp ra mắt; the map shows each region’s level state', async ({ page }) => {
  await startPlaying(page);
  await expect(page.locator('#city-label .coming-soon')).toHaveText('Sắp ra mắt');
  await expect(page.locator('#tower-label .coming-soon')).toHaveText('Sắp ra mắt');
  await page.locator('#open-map').click();
  await expect(page.locator('#world-map')).toBeVisible();
  await page.locator('[data-region="city"]').click();
  await expect(page.locator('#map-detail .coming-soon')).toHaveText('Sắp ra mắt');
  await page.locator('[data-region="meadow"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveText('Cổng màn chơi: Đi qua cầu để mở');
  await page.locator('[data-region="village"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveCount(0);
});

test('gates stand on free ground: no tree, rock or prop overlaps a gate', async ({ page }) => {
  await startPlaying(page);
  const overlaps = await page.evaluate(() => {
    const obstacles = window.__parity?.obstacles ?? [];
    const gates = [
      [29, -14.5],
      [37.2, 13.4],
    ];
    const GATE_HALF_WIDTH = 1.6;
    return gates.flatMap(([gx, gz]) =>
      obstacles.filter((o) => {
        const d = Math.hypot(o.x - (gx as number), o.z - (gz as number));
        const ownCircle = Math.abs(o.z - (gz as number)) < 1e-6 && d <= 1.31;
        return !ownCircle && d < o.radius + GATE_HALF_WIDTH;
      }),
    );
  });
  expect(overlaps).toEqual([]);
});
