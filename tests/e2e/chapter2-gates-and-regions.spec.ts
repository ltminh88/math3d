// Chapter 2 (phase 03): the garden, valley, workshop and cave gates open one after another once
// the tower is done and say "Sắp ra mắt" while their level is not shipped; the gates are used with
// a tap on the Enter button on touch screens and the E key on desktop; the new regions show on the
// HUD area badge and the world map. Uses the test-build hook `window.__game`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const CHAPTER1 = ['field', 'forest', 'city', 'tower'];
const CHAPTER2 = ['garden', 'valley', 'workshop', 'cave'] as const;
/** Chapter 2 levels whose folder has shipped: their gate opens instead of "Sắp ra mắt". */
const SHIPPED: readonly string[] = ['cave'];
const NAMES = {
  garden: 'Cổng Khu Vườn Quy Luật',
  valley: 'Cổng Thung Lũng Hình Học',
  workshop: 'Cổng Xưởng Đo Đạc',
  cave: 'Cổng Hang Đố Vui',
} as const;
const AREAS = {
  garden: 'Khu Vườn Bên Sông',
  valley: 'Thung Lũng Hình Học',
  workshop: 'Xưởng Đo Đạc',
  cave: 'Hang Đố Vui',
} as const;

async function startPlaying(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

const statuses = (page: Page) =>
  page.evaluate((ids) => ids.map((id) => window.__game?.gateStatus(id)), [...CHAPTER2]);

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

test('chapter 2 gates open one by one after the tower; "Sắp ra mắt" until a level ships', async ({
  page,
}, testInfo) => {
  const touch = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  await page.evaluate(
    (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
    CHAPTER1.slice(0, 3),
  );
  expect(await statuses(page)).toEqual(['locked', 'locked', 'locked', 'locked']);
  await expect(page.locator('#gate-garden-label small')).toHaveText(
    'Hoàn thành Tháp Toán Học để mở',
  );
  await useGate(page, 'garden', touch);
  await expect(page.locator('#interact')).toContainText(
    `${NAMES.garden} 🔒 · Hoàn thành Tháp Toán Học để mở`,
  );
  await expect(page.locator('#toast')).toHaveText('Hoàn thành Tháp Toán Học để mở cổng này nhé!');

  await page.evaluate(() => window.__game?.seedProgress({ completedLevels: ['tower'] }));
  // The garden level has shipped (phase 05): its gate opens and enters the level.
  expect(await statuses(page)).toEqual(['open', 'locked', 'locked', 'locked']);
  await useGate(page, 'garden', touch);
  await expect(page.locator('.garden-panel')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  if (touch) await page.locator('.level-leave').tap();
  else await page.locator('.level-leave').click();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);

  const previous = { valley: 'garden', workshop: 'valley', cave: 'workshop' } as const;
  const reason = {
    valley: 'Hoàn thành Khu Vườn Quy Luật để mở',
    workshop: 'Hoàn thành Thung Lũng Hình Học để mở',
    cave: 'Hoàn thành Xưởng Đo Đạc để mở',
  } as const;
  for (const id of ['valley', 'workshop', 'cave'] as const) {
    await useGate(page, id, touch);
    await expect(page.locator('#interact')).toContainText(`${NAMES[id]} 🔒 · ${reason[id]}`);
    await expect(page.locator('#toast')).toHaveText(`${reason[id]} cổng này nhé!`);
    await page.evaluate(
      (done) => window.__game?.seedProgress({ completedLevels: [done] }),
      previous[id],
    );
    const shipped = SHIPPED.includes(id);
    expect(await page.evaluate((gate) => window.__game?.gateStatus(gate), id)).toBe(
      shipped ? 'open' : 'coming-soon',
    );
    if (!shipped) await expect(page.locator(`#gate-${id}-label small`)).toHaveText('Sắp ra mắt');
  }
  expect(errors).toEqual([]);
});

test('the area badge and the world map know the new regions', async ({ page }) => {
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  for (const [x, z, name] of [
    [40, -37, 'Thung Lũng Hình Học'],
    [45, 38, 'Xưởng Đo Đạc'],
    [-32, 32, 'Hang Đố Vui'],
  ] as const) {
    await page.evaluate((p) => window.__game?.teleport(p.x, p.z), { x, z });
    await expect(page.locator('#area-name')).toHaveText(name);
  }

  await page.locator('#open-map').click();
  await expect(page.locator('#world-map')).toBeVisible();
  await expect(page.locator('[data-region]')).toHaveCount(9);
  await page.locator('[data-region="valley"]').click();
  await expect(page.locator('#map-detail strong')).toHaveText('📐 Thung Lũng Hình Học');
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Hoàn thành Khu Vườn Quy Luật để mở',
  );
  await page.locator('[data-region="garden"]').click();
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Hoàn thành Tháp Toán Học để mở',
  );
});

test('touch screens show no key hints: Enter button, minimap and help name the taps', async ({
  page,
}) => {
  await startPlaying(page);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  await page.evaluate(() => window.__game?.teleport(-3, 3.6));
  await expect(page.locator('#interact')).toBeVisible();
  await expect(page.locator('#interact kbd')).toBeVisible({ visible: !coarse });
  await expect(page.locator('.minimap-key')).toBeVisible({ visible: !coarse });
  await page.locator('#help').click();
  const help = page.locator('#dialog-content');
  if (coarse) {
    await expect(help).not.toContainText(/WASD|Nhấn|Space|Lăn chuột|Esc/);
    await expect(help).toContainText('Chạm vào bản đồ nhỏ ở góc màn hình');
  } else {
    await expect(help).toContainText('Nhấn WASD / phím mũi tên');
  }
  await page.locator('#understood').click();
  test.skip(!coarse, 'touch targets: coarse pointers only');
  await expect(page.locator('#interact')).toBeVisible();
  // A tap 21.5 px from the centre in each direction still lands on the control (44 px target,
  // counting an invisible hit-area extension).
  const selectors = [
    '#interact',
    '#open-map',
    '#open-shop',
    '#learn',
    '#minimap',
    '#help',
    '#jump',
  ];
  const hits = await page.evaluate((list) => {
    return Object.fromEntries(
      list.map((selector) => {
        const el = document.querySelector(selector) as HTMLElement;
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const points = [
          [cx, cy - 21.5],
          [cx, cy + 21.5],
          [cx - 21.5, cy],
          [cx + 21.5, cy],
        ] as const;
        return [selector, points.every(([x, y]) => el.contains(document.elementFromPoint(x, y)))];
      }),
    );
  }, selectors);
  expect(hits).toEqual(Object.fromEntries(selectors.map((s) => [s, true])));
});
