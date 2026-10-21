// Cosmetics shop (phase 19): buy at the village stall, equip, see the item on VLM in the scene,
// keep it after a reload; the friendly "not enough coins" message; the HUD button path; draw
// calls with everything equipped and no geometry leak over 10 equip/unequip cycles. Coins are
// seeded through a legacy v1 save (imported once into the store at boot, like a returning player).
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const STALL_FRONT = { x: -7, z: -1.9 };

const legacySave = (coins: number) =>
  JSON.stringify({
    version: 1,
    xp: 30,
    coins,
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

async function startWithCoins(page: Page, coins: number): Promise<void> {
  await page.addInitScript((save) => {
    const key = 'aigame3d_multiplication_save';
    if (localStorage.getItem(key) === null) localStorage.setItem(key, save);
  }, legacySave(coins));
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await expect(page.locator('#coins')).toHaveText(String(coins));
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

/** Names of the cosmetic meshes in the scene, by the object they hang from. */
const wornInScene = () => {
  const world = window.__parity as unknown as {
    scene: import('three').Scene;
    milo: import('three').Object3D;
    player: import('three').Object3D;
  };
  const names = (o: import('three').Object3D) =>
    o.children.filter((c) => c.name.startsWith('cosmetic:')).map((c) => c.name);
  return { milo: names(world.milo), player: names(world.player), scene: names(world.scene) };
};

const card = (page: Page, id: string) => page.locator(`[data-card="${id}"]`);
const status = (page: Page) => page.locator('#shop-status');

async function buy(page: Page, id: string): Promise<void> {
  await card(page, id).locator('[data-action="ask"]').click();
  await card(page, id).locator('[data-action="buy"]').click();
  await expect(card(page, id)).toHaveAttribute('data-state', 'owned');
}

async function setWorn(page: Page, id: string, worn: boolean): Promise<void> {
  await card(page, id)
    .locator(`[data-action="${worn ? 'equip' : 'unequip'}"]`)
    .click();
  await expect(card(page, id)).toHaveAttribute('data-state', worn ? 'equipped' : 'owned');
}

/** Median of a few `renderer.info.render.calls` samples (dialog closed, camera settled). */
async function drawCalls(page: Page): Promise<number> {
  await page.evaluate(() => window.__game?.teleport(-6, 0.5));
  await page.waitForTimeout(2500);
  const samples: number[] = [];
  for (let i = 0; i < 5; i++) {
    samples.push(await page.evaluate(() => window.__parity?.renderer.info.render.calls ?? 0));
    await page.waitForTimeout(200);
  }
  return samples.sort((a, b) => a - b)[2] as number;
}

test('buy at the stall, wear it on VLM, still worn after a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startWithCoins(page, 120);
  await page.evaluate(({ x, z }) => window.__game?.teleport(x, z), STALL_FRONT);
  await expect(page.locator('#interact')).toContainText('Ghé cửa hàng');
  await page.locator('#interact').click();
  await expect(page.locator('#dialog-title')).toHaveText('Cửa hàng của làng');
  await expect(page.locator('#shop-wallet')).toContainText('Bạn đang có 120 xu');
  await expect(page.locator('#shop-tab-vlm-outfit')).toHaveAttribute('aria-selected', 'true');

  await card(page, 'vlm-red-scarf').locator('[data-action="ask"]').click();
  await expect(card(page, 'vlm-red-scarf')).toContainText('Mua Khăn quàng đỏ với 20 xu nhé?');
  await card(page, 'vlm-red-scarf').locator('[data-action="buy"]').click();
  await expect(status(page)).toContainText('Đã mua Khăn quàng đỏ!');
  await expect(page.locator('#shop-wallet')).toContainText('Bạn đang có 100 xu');
  await expect(page.locator('#coins')).toHaveText('100');
  await setWorn(page, 'vlm-red-scarf', true);
  await expect(status(page)).toContainText('Tuyệt! Khăn quàng đỏ đã được dùng.');
  expect((await page.evaluate(wornInScene)).milo).toEqual(['cosmetic:vlm-red-scarf']);
  const snap = await page.evaluate(() => window.__game?.snapshot());
  expect(snap?.ownedCosmetics).toEqual(['vlm-red-scarf']);
  expect(snap?.wallet.coins).toBe(100);

  await page.reload();
  await waitForStoreBoot(page);
  await expect
    .poll(() => page.evaluate(wornInScene))
    .toEqual({ milo: ['cosmetic:vlm-red-scarf'], player: [], scene: [] });
  await expect(page.locator('#coins')).toHaveText('100');
  expect(errors).toEqual([]);
});

test('not enough coins: a friendly message and nothing spent', async ({ page }) => {
  await startWithCoins(page, 10);
  await page.locator('#open-shop').click();
  await page.locator('#shop-tab-village-decor').click();
  await card(page, 'decor-fountain').locator('[data-action="ask"]').click();
  await expect(status(page)).toHaveText(
    'Chưa đủ xu rồi! Bạn cần thêm 50 xu. Cùng VLM giải thêm phép nhân nhé!',
  );
  await expect(card(page, 'decor-fountain').locator('[data-action="buy"]')).toHaveCount(0);
  const snap = await page.evaluate(() => window.__game?.snapshot());
  expect(snap?.wallet.coins).toBe(10);
  expect(snap?.ownedCosmetics).toEqual([]);
  // Keyboard: arrows move between tabs.
  await page.locator('#shop-tab-village-decor').press('ArrowLeft');
  await expect(page.locator('#shop-tab-avatar-outfit')).toBeFocused();
  await expect(page.locator('#shop-tab-avatar-outfit')).toHaveAttribute('aria-selected', 'true');
});

test('HUD button: everything worn costs <= 6 draw calls; 10 swaps leak no geometry', async ({
  page,
}) => {
  const items = ['vlm-star-band', 'avatar-blue-cap', 'decor-flower-pots'];
  const tabs = ['vlm-outfit', 'avatar-outfit', 'village-decor'];
  await startWithCoins(page, 300);
  await page.locator('#open-shop').click();
  for (const [i, id] of items.entries()) {
    await page.locator(`#shop-tab-${tabs[i]}`).click();
    await buy(page, id);
  }
  await page.locator('#close-dialog').click();
  const baseline = await drawCalls(page);
  const geometries = (await page.evaluate(() => window.__game?.memory()))?.geometries;

  await page.locator('#open-shop').click();
  for (const [i, id] of items.entries()) {
    await page.locator(`#shop-tab-${tabs[i]}`).click();
    await setWorn(page, id, true);
  }
  await page.locator('#close-dialog').click();
  expect(await page.evaluate(wornInScene)).toEqual({
    milo: ['cosmetic:vlm-star-band'],
    player: ['cosmetic:avatar-blue-cap'],
    scene: ['cosmetic:decor-flower-pots'],
  });
  expect(await drawCalls(page)).toBeLessThanOrEqual(baseline + 6);

  await page.locator('#open-shop').click();
  await page.locator('#shop-tab-village-decor').click();
  await setWorn(page, 'decor-flower-pots', false);
  for (let i = 0; i < 10; i++) {
    await setWorn(page, 'decor-flower-pots', true);
    await setWorn(page, 'decor-flower-pots', false);
  }
  for (const [i, id] of items.slice(0, 2).entries()) {
    await page.locator(`#shop-tab-${tabs[i]}`).click();
    await setWorn(page, id, false);
  }
  await page.locator('#close-dialog').click();
  await page.waitForTimeout(500);
  expect((await page.evaluate(() => window.__game?.memory()))?.geometries).toBe(geometries);
  expect(await page.evaluate(wornInScene)).toEqual({ milo: [], player: [], scene: [] });
});
