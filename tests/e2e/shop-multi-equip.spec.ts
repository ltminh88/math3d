// Shop multi-equip (phase 23): VLM wears hat + scarf + cape at once, a second hat swaps
// the first, decor items each keep their own spot, and an M3D5 code imports with the same
// items worn (its old slot -> id map becomes the new model). Coins are seeded through a
// legacy v1 save, like the shop-purchase spec.
import { type Page, test } from '@playwright/test';
import { crc32Hex } from '../../src/store/save-code-codec';
import {
  expect,
  SLOW_TEST_MS,
  waitDialogSettled,
  waitForStoreBoot,
} from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

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

async function openTab(page: Page, tab: string): Promise<void> {
  await page.locator(`#shop-tab-${tab}`).click();
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

test('VLM wears hat + scarf + cape at once; still worn after a reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startWithCoins(page, 300);
  await page.locator('#open-shop').click();

  await buy(page, 'vlm-star-band');
  await buy(page, 'vlm-red-scarf');
  await buy(page, 'vlm-starry-cape');
  await setWorn(page, 'vlm-star-band', true);
  await setWorn(page, 'vlm-red-scarf', true);
  await setWorn(page, 'vlm-starry-cape', true);
  for (const id of ['vlm-star-band', 'vlm-red-scarf', 'vlm-starry-cape'])
    await expect(card(page, id)).toHaveAttribute('data-state', 'equipped');
  expect((await page.evaluate(wornInScene)).milo).toEqual([
    'cosmetic:vlm-star-band',
    'cosmetic:vlm-red-scarf',
    'cosmetic:vlm-starry-cape',
  ]);
  const snap = await page.evaluate(() => window.__game?.snapshot());
  expect(snap?.profile.settings.equipped.vlm).toEqual({
    head: 'vlm-star-band',
    neck: 'vlm-red-scarf',
    back: 'vlm-starry-cape',
  });

  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await frameCharacters(page);
  await page.screenshot({ path: 'test-results/shop-multi-equip.png' });

  await page.reload();
  await waitForStoreBoot(page);
  await expect
    .poll(() => page.evaluate(wornInScene))
    .toEqual({
      milo: ['cosmetic:vlm-star-band', 'cosmetic:vlm-red-scarf', 'cosmetic:vlm-starry-cape'],
      player: [],
      scene: [],
    });
  expect(errors).toEqual([]);
});

test('a second hat swaps the first; two decor items keep their own spots', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startWithCoins(page, 300);
  await page.locator('#open-shop').click();

  await buy(page, 'vlm-star-band');
  await buy(page, 'vlm-flower-garland');
  await setWorn(page, 'vlm-star-band', true);
  await setWorn(page, 'vlm-flower-garland', true);
  await expect(card(page, 'vlm-star-band')).toHaveAttribute('data-state', 'owned');
  await expect(card(page, 'vlm-flower-garland')).toHaveAttribute('data-state', 'equipped');
  expect((await page.evaluate(wornInScene)).milo).toEqual(['cosmetic:vlm-flower-garland']);

  await openTab(page, 'village-decor');
  await buy(page, 'decor-flower-pots');
  await buy(page, 'decor-fountain');
  await setWorn(page, 'decor-flower-pots', true);
  await setWorn(page, 'decor-fountain', true);
  const positions = await page.evaluate(decorPositions);
  expect(positions).toHaveLength(2);
  expect(positions[0]?.[1]).not.toBe(positions[1]?.[1]);
  expect(positions[0]?.[2]).not.toBe(positions[1]?.[2]);

  await page.reload();
  await waitForStoreBoot(page);
  await expect
    .poll(() => page.evaluate(wornInScene))
    .toEqual({
      milo: ['cosmetic:vlm-flower-garland'],
      player: [],
      scene: ['cosmetic:decor-flower-pots', 'cosmetic:decor-fountain'],
    });
  expect(errors).toEqual([]);
});

test('an M3D5 code imports with the same items worn', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  // A genuine M3D5 code, built at the payload level: its `e` is the old slot -> id map.
  const payload = {
    o: ['vlm-red-scarf', 'avatar-gold-crown', 'decor-fountain'],
    e: {
      'vlm-outfit': 'vlm-red-scarf',
      'avatar-outfit': 'avatar-gold-crown',
      'village-decor': 'decor-fountain',
    },
  };
  const framed = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const code = `M3D5-${framed}-${crc32Hex(framed)}`;

  await page.goto('/');
  await waitForStoreBoot(page);
  await page.locator('#import-save-code').click();
  await page.locator('#save-code-input').fill(code);
  await page.locator('#save-code-confirm').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);

  const snap = await page.evaluate(() => window.__game?.snapshot());
  expect([...(snap?.ownedCosmetics ?? [])].sort()).toEqual(
    ['vlm-red-scarf', 'avatar-gold-crown', 'decor-fountain'].sort(),
  );
  expect(snap?.profile.settings.equipped).toEqual({
    vlm: { neck: 'vlm-red-scarf' },
    avatar: { head: 'avatar-gold-crown' },
    decor: ['decor-fountain'],
  });
  await expect
    .poll(() => page.evaluate(wornInScene))
    .toEqual({
      milo: ['cosmetic:vlm-red-scarf'],
      player: ['cosmetic:avatar-gold-crown'],
      scene: ['cosmetic:decor-fountain'],
    });
  expect(errors).toEqual([]);
});
