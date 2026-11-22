// Shop new items (phase 24): the 7 new outfits buy, wear and show in the scene
// (VLM's wizard hat swaps to round glasses — one head spot); the 3 new decor items
// place on their own spots, and all 7 decor items together cost at most 14 extra
// draw calls (2 per merged mesh, as the shop HUD test budgets). Coins are seeded
// through a legacy v1 save, like the shop-purchase spec.
import { type Page, test } from '@playwright/test';
import {
  expect,
  SLOW_TEST_MS,
  waitDialogSettled,
  waitForStoreBoot,
} from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const NEW_OUTFITS = [
  'vlm-wizard-hat',
  'vlm-round-glasses',
  'vlm-star-pendant',
  'vlm-book-bag',
  'avatar-straw-hat',
  'avatar-flower-lei',
  'avatar-raincoat',
];
const ALL_DECOR = [
  'decor-flower-pots',
  'decor-star-lantern',
  'decor-paper-lanterns',
  'decor-fountain',
  'decor-peach-tree',
  'decor-chicken-coop',
  'decor-rainbow-arch',
];

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

/** World positions of the placed decor meshes. */
const decorPositions = () =>
  (window.__parity as unknown as { scene: import('three').Scene }).scene.children
    .filter((c) => c.name.startsWith('cosmetic:decor-'))
    .map((c) => [c.name, c.position.x, c.position.z]);

const card = (page: Page, id: string) => page.locator(`[data-card="${id}"]`);

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
  await page.evaluate(() => {
    window.__game?.teleport(-6, 0.5);
    const world = window.__parity as unknown as {
      target: { set(x: number, y: number, z: number): void };
    };
    world.target.set(-6, 0, 0.5);
  });
  await page.waitForTimeout(2500);
  const samples: number[] = [];
  for (let i = 0; i < 5; i++) {
    samples.push(await page.evaluate(() => window.__parity?.renderer.info.render.calls ?? 0));
    await page.waitForTimeout(200);
  }
  return samples.sort((a, b) => a - b)[2] as number;
}

/** Frame VLM and the player for a screenshot (camera-rig recipe: set view fields directly). */
async function frameCharacters(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__game?.teleport(-1.3, 1.5);
    const world = window.__parity as unknown as {
      distance: number;
      viewDistance: number;
      pitch: number;
      viewPitch: number;
      yaw: number;
      target: { set(x: number, y: number, z: number): void };
    };
    world.distance = 16;
    world.viewDistance = 16;
    world.pitch = 0.6;
    world.viewPitch = 0.6;
    world.yaw = Math.PI + 0.57;
    world.target.set(-1.3, 0, 1.5);
  });
  await page.waitForTimeout(1500);
}

/** Frame the decor pocket (x -9..-1, z -9..-1) for a screenshot. */
async function frameDecor(page: Page): Promise<void> {
  await page.evaluate(() => {
    window.__game?.teleport(-4.9, -5.1);
    const world = window.__parity as unknown as {
      distance: number;
      viewDistance: number;
      pitch: number;
      viewPitch: number;
      yaw: number;
      target: { set(x: number, y: number, z: number): void };
    };
    world.distance = 20;
    world.viewDistance = 20;
    world.pitch = 0.7;
    world.viewPitch = 0.7;
    world.yaw = Math.PI + 0.57;
    world.target.set(-4.9, 0, -5.1);
  });
  await page.waitForTimeout(1500);
}

test('the 7 new outfits buy, wear and show in the scene; the hat swaps to glasses', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startWithCoins(page, 500);
  await page.locator('#open-shop').click();

  for (const id of NEW_OUTFITS.slice(0, 4)) await buy(page, id);
  await page.locator('#shop-tab-avatar-outfit').click();
  for (const id of NEW_OUTFITS.slice(4)) await buy(page, id);

  await page.locator('#shop-tab-vlm-outfit').click();
  await setWorn(page, 'vlm-wizard-hat', true);
  await setWorn(page, 'vlm-star-pendant', true);
  await setWorn(page, 'vlm-book-bag', true);
  await page.locator('#shop-tab-avatar-outfit').click();
  await setWorn(page, 'avatar-straw-hat', true);
  await setWorn(page, 'avatar-flower-lei', true);
  await setWorn(page, 'avatar-raincoat', true);
  expect((await page.evaluate(wornInScene)).milo).toEqual([
    'cosmetic:vlm-wizard-hat',
    'cosmetic:vlm-star-pendant',
    'cosmetic:vlm-book-bag',
  ]);
  expect((await page.evaluate(wornInScene)).player).toEqual([
    'cosmetic:avatar-straw-hat',
    'cosmetic:avatar-flower-lei',
    'cosmetic:avatar-raincoat',
  ]);
  const snap = await page.evaluate(() => window.__game?.snapshot());
  expect(snap?.profile.settings.equipped).toEqual({
    vlm: { head: 'vlm-wizard-hat', neck: 'vlm-star-pendant', back: 'vlm-book-bag' },
    avatar: { head: 'avatar-straw-hat', neck: 'avatar-flower-lei', back: 'avatar-raincoat' },
    decor: [],
  });

  // One head spot: the glasses replace the wizard hat.
  await page.locator('#shop-tab-vlm-outfit').click();
  await setWorn(page, 'vlm-round-glasses', true);
  await expect(card(page, 'vlm-wizard-hat')).toHaveAttribute('data-state', 'owned');
  // The applier detaches the old hat and appends the new glasses, so the glasses
  // come last in milo's children (the set of worn items is what matters here).
  expect((await page.evaluate(wornInScene)).milo).toEqual([
    'cosmetic:vlm-star-pendant',
    'cosmetic:vlm-book-bag',
    'cosmetic:vlm-round-glasses',
  ]);

  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await frameCharacters(page);
  await page.screenshot({ path: 'test-results/shop-new-items-outfits.png' });

  await page.reload();
  await waitForStoreBoot(page);
  await expect
    .poll(() => page.evaluate(wornInScene))
    .toEqual({
      milo: ['cosmetic:vlm-round-glasses', 'cosmetic:vlm-star-pendant', 'cosmetic:vlm-book-bag'],
      player: [
        'cosmetic:avatar-straw-hat',
        'cosmetic:avatar-flower-lei',
        'cosmetic:avatar-raincoat',
      ],
      scene: [],
    });
  expect(errors).toEqual([]);
});

test('the 3 new decor items place on their own spots; all 7 decor cost ≤ 14 draw calls', async ({
  page,
}) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startWithCoins(page, 600);
  await page.locator('#open-shop').click();
  await page.locator('#shop-tab-village-decor').click();
  for (const id of ALL_DECOR) await buy(page, id);
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  const baseline = await drawCalls(page);

  await page.locator('#open-shop').click();
  await page.locator('#shop-tab-village-decor').click();
  for (const id of ALL_DECOR) await setWorn(page, id, true);
  const positions = await page.evaluate(decorPositions);
  expect(positions).toHaveLength(7);
  expect(new Set(positions.map(([, x, z]) => `${x},${z}`)).size).toBe(7);
  expect((await page.evaluate(wornInScene)).scene).toEqual(ALL_DECOR.map((id) => `cosmetic:${id}`));

  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  expect(await drawCalls(page)).toBeLessThanOrEqual(baseline + 14);
  await frameDecor(page);
  await page.screenshot({ path: 'test-results/shop-new-items-decor.png' });

  await page.reload();
  await waitForStoreBoot(page);
  await expect
    .poll(() => page.evaluate(wornInScene))
    .toEqual({
      milo: [],
      player: [],
      scene: ALL_DECOR.map((id) => `cosmetic:${id}`),
    });
  expect(errors).toEqual([]);
});
