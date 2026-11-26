// Chapter 3 (phase 18): the tiny market fair and the number castle show on the HUD area badge
// and the world map, and the baked regions add no new draw calls (they bake into the same
// expansion meshes as chapter 2). Their gates stay locked until the cave is done; then both
// gates are open (their levels shipped) and entering starts the level. Uses the test-build
// hooks `window.__game` and `window.__parity`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const CHAPTER3 = ['market', 'numberfort'] as const;
const NAMES = {
  market: 'Cổng Chợ Phiên Tí Hon',
  numberfort: 'Cổng Lâu Đài Số',
} as const;
const AREAS = {
  market: 'Chợ Phiên Tí Hon',
  numberfort: 'Lâu Đài Số',
} as const;

async function startPlaying(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

const statuses = (page: Page) =>
  page.evaluate((ids) => ids.map((id) => window.__game?.gateStatus(id)), [...CHAPTER3]);

/** Walks up to the gate and uses it: tap on touch screens, the E key with a keyboard. */
async function useGate(page: Page, levelId: keyof typeof AREAS, touch: boolean): Promise<void> {
  await page.evaluate((id) => window.__game?.teleportToGate(id), levelId);
  const button = page.locator('#interact');
  await expect(button).toContainText(NAMES[levelId]);
  // Arriving in a region shows its welcome toast; let it land before the gate's toast.
  await expect(page.locator('#area-name')).toHaveText(AREAS[levelId]);
  if (touch) await button.tap();
  else await page.keyboard.press('e');
}

test('chapter 3 gates stay locked until the cave is done, then both open', async ({
  page,
}, testInfo) => {
  const touch = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  await page.evaluate(() =>
    window.__game?.seedProgress({
      bridgeComplete: true,
      completedLevels: ['field', 'forest', 'city', 'tower', 'garden', 'valley', 'workshop'],
    }),
  );
  expect(await statuses(page)).toEqual(['locked', 'locked']);
  for (const id of CHAPTER3) {
    await useGate(page, id, touch);
    await expect(page.locator('#interact')).toContainText(
      `${NAMES[id]} 🔒 · Hoàn thành Hang Đố Vui để mở`,
    );
    await expect(page.locator('#toast')).toHaveText('Hoàn thành Hang Đố Vui để mở cổng này nhé!');
  }

  await page.evaluate(() => window.__game?.seedProgress({ completedLevels: ['cave'] }));
  expect(await statuses(page)).toEqual(['open', 'open']);
  // Both levels have shipped: each gate is open and using it starts the level.
  // (The gate text is checked before using it — once the level starts, #interact no longer
  // shows the gate text.)
  await expect(page.locator('#gate-numberfort-label small')).not.toHaveText('Sắp ra mắt');
  await page.evaluate(() => window.__game?.teleportToGate('numberfort'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Lâu Đài Số');
  await expect(page.locator('#area-name')).toHaveText(AREAS.numberfort);
  if (touch) await page.locator('#interact').tap();
  else await page.keyboard.press('e');
  await expect(page.locator('.numberfort-panel')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  if (touch) await page.locator('.level-leave').tap();
  else await page.locator('.level-leave').click();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect(page.locator('#gate-market-label small')).not.toHaveText('Sắp ra mắt');
  await page.evaluate(() => window.__game?.teleportToGate('market'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Chợ Phiên Tí Hon');
  await expect(page.locator('#area-name')).toHaveText(AREAS.market);
  if (touch) await page.locator('#interact').tap();
  else await page.keyboard.press('e');
  await expect(page.locator('.market-panel')).toBeVisible();
  expect(errors).toEqual([]);
});

/** Median of a few `renderer.info.render.calls` samples, camera settled on (x, z). */
async function drawCallsAt(
  page: Page,
  x: number,
  z: number,
): Promise<{ calls: number; geometries: number; textures: number }> {
  await page.evaluate(
    (p) => {
      window.__game?.teleport(p.x, p.z);
      // Camera-rig recipe: set the view fields directly (no easing drift between samples).
      const world = window.__parity as unknown as {
        distance: number;
        viewDistance: number;
        pitch: number;
        viewPitch: number;
        yaw: number;
        target: { set(x: number, y: number, z: number): void };
      };
      world.distance = 42;
      world.viewDistance = 42;
      // Near-top-down pitch: the ground fills the view, so the drifting clouds stay out of the
      // frustum — with the play pitch (0.72) the count swung ±14 run to run at the numberfort
      // spot. What is left moving is the windmill/beacon (±6 at the spawn spot).
      world.pitch = 1.35;
      world.viewPitch = 1.35;
      world.yaw = 0;
      world.target.set(p.x, 0, p.z);
    },
    { x, z },
  );
  await page.waitForTimeout(2500);
  const samples: number[] = [];
  for (let i = 0; i < 5; i++) {
    samples.push(await page.evaluate(() => window.__parity?.renderer.info.render.calls ?? 0));
    await page.waitForTimeout(200);
  }
  const memory = await page.evaluate(() => {
    const info = window.__parity?.renderer.info.memory;
    return { geometries: info?.geometries ?? 0, textures: info?.textures ?? 0 };
  });
  return { calls: samples.sort((a, b) => a - b)[2] as number, ...memory };
}

test('the area badge and the world map know the chapter 3 regions', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  for (const [x, z, name] of [
    [-32, -30, 'Chợ Phiên Tí Hon'],
    [61, -2, 'Lâu Đài Số'],
  ] as const) {
    await page.evaluate((p) => window.__game?.teleport(p.x, p.z), { x, z });
    await expect(page.locator('#area-name')).toHaveText(name);
  }

  await page.locator('#open-map').click();
  await expect(page.locator('#world-map')).toBeVisible();
  await expect(page.locator('[data-region]')).toHaveCount(12);
  await page.locator('[data-region="market"]').click();
  await expect(page.locator('#map-detail strong')).toHaveText('🏮 Chợ Phiên Tí Hon');
  await page.locator('[data-region="numberfort"]').click();
  await expect(page.locator('#map-detail strong')).toHaveText('🏰 Lâu Đài Số');
  expect(errors).toEqual([]);
});

test('the new regions add no draw calls', async ({ page }) => {
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  // Main baselines at these spots (desktop-chromium, top-down fixed camera, 2026-11-23):
  // calls 318 / 161 / 262, geometries 292, textures 25. The branch measured calls
  // 312–314 / 168–169 / 270, geometries 304, textures 27 — the same numbers on a repeat run.
  // Decomposition: the region scenery bakes into the existing expansion meshes (+0 draws);
  // each of the 2 new gates costs 6 draws when visible (the phase-03 gate design: frame,
  // sign, portal, padlock + their shadows), and the sign textures add 2 textures. The bounds
  // below are main + 16 (draws/geometries) and main + 2 (textures): tight enough to catch a
  // future gate-sized addition, loose enough for the windmill/beacon drift at the spawn spot.
  // Phase 1A adds the island gate the same way (+1 sign texture, so the texture bound is 28).
  const spawn = await drawCallsAt(page, -6, 0.5);
  expect(spawn.calls).toBeLessThanOrEqual(334);
  const market = await drawCallsAt(page, -32, -30);
  expect(market.calls).toBeLessThanOrEqual(177);
  const numberfort = await drawCallsAt(page, 61, -2);
  expect(numberfort.calls).toBeLessThanOrEqual(278);
  for (const spot of [spawn, market, numberfort]) {
    expect(spot.geometries).toBeLessThanOrEqual(308);
    expect(spot.textures).toBeLessThanOrEqual(28);
  }
});
