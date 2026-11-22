// Level zoom for the other seven levels (phase 25b, issue #46): on tablet, a
// two-finger pinch changes each level's camera distance, the +/− buttons step it,
// and one-finger play is untouched. One test per level (field, city, tower, garden,
// valley, workshop, cave); the forest already has its own spec (forest-zoom).
//
// The pinch is two synthetic pointer events on the canvas, at the top strip (sky,
// no pickables): Playwright has no multi-touch API, and the forest spec already
// proves the same shared helper through real CDP touch events.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const skipNonTablet = (name: string): void => {
  test.skip(name !== 'tablet-portrait' && name !== 'tablet-landscape', 'pinch is a tablet gesture');
};

interface LevelCase {
  id: string;
  gate: string;
  panel: string;
  /** Levels that must be complete before this gate opens (chain order). */
  done: string[];
}

const LEVELS: LevelCase[] = [
  { id: 'field', gate: 'Vào Cổng Cánh Đồng Phép Tính', panel: '.field-panel', done: [] },
  {
    id: 'city',
    gate: 'Vào Cổng Thành Phố Con Số',
    panel: '.city-panel',
    done: ['field', 'forest'],
  },
  {
    id: 'tower',
    gate: 'Vào Cổng Tháp Toán Học',
    panel: '.tower-panel',
    done: ['field', 'forest', 'city'],
  },
  {
    id: 'garden',
    gate: 'Vào Cổng Khu Vườn Quy Luật',
    panel: '.garden-panel',
    done: ['field', 'forest', 'city', 'tower'],
  },
  {
    id: 'valley',
    gate: 'Vào Cổng Thung Lũng Hình Học',
    panel: '.valley-panel',
    done: ['field', 'forest', 'city', 'tower', 'garden'],
  },
  {
    id: 'workshop',
    gate: 'Vào Cổng Xưởng Đo Đạc',
    panel: '.workshop-panel',
    done: ['field', 'forest', 'city', 'tower', 'garden', 'valley'],
  },
  {
    id: 'cave',
    gate: 'Vào Cổng Hang Đố Vui',
    panel: '.cave-panel',
    done: ['field', 'forest', 'city', 'tower', 'garden', 'valley', 'workshop'],
  },
];

async function enterLevel(page: Page, level: LevelCase): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(
    (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
    level.done,
  );
  expect(await page.evaluate((id) => window.__game?.gateStatus(id), level.id)).toBe('open');
  await page.evaluate((id) => window.__game?.teleportToGate(id), level.id);
  const interact = page.locator('#interact');
  await expect(interact).toContainText(level.gate);
  await interact.tap();
  await expect(page.locator(level.panel)).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

const zoomFactor = (page: Page): Promise<number> =>
  page
    .locator('.level-layer')
    .evaluate((el) => Number.parseFloat((el as HTMLElement).dataset.zoomFactor ?? '1'));

/** Two-pointer pinch on the canvas: points are fractions of the canvas box. */
async function pinch(page: Page, from: [number, number][], to: [number, number][]): Promise<void> {
  await page.evaluate(
    ({ from, to }) => {
      const canvas =
        document.querySelector('.level-layer canvas') ?? document.querySelector('canvas');
      if (!canvas) throw new Error('no canvas for the pinch');
      const [fromA, fromB] = from;
      const [toA, toB] = to;
      if (!fromA || !fromB || !toA || !toB) throw new Error('a pinch needs two points');
      const box = canvas.getBoundingClientRect();
      const at = ([fx, fy]: [number, number]): { clientX: number; clientY: number } => ({
        clientX: box.left + fx * box.width,
        clientY: box.top + fy * box.height,
      });
      const down = (id: number, p: { clientX: number; clientY: number }, primary: boolean) =>
        canvas.dispatchEvent(
          new PointerEvent('pointerdown', {
            pointerId: id,
            pointerType: 'touch',
            isPrimary: primary,
            bubbles: true,
            cancelable: true,
            ...p,
          }),
        );
      const move = (id: number, p: { clientX: number; clientY: number }) =>
        canvas.dispatchEvent(
          new PointerEvent('pointermove', {
            pointerId: id,
            pointerType: 'touch',
            isPrimary: id === 1,
            bubbles: true,
            cancelable: true,
            ...p,
          }),
        );
      const up = (id: number, p: { clientX: number; clientY: number }) =>
        canvas.dispatchEvent(
          new PointerEvent('pointerup', {
            pointerId: id,
            pointerType: 'touch',
            isPrimary: id === 1,
            bubbles: true,
            cancelable: true,
            ...p,
          }),
        );
      down(1, at(fromA), true);
      down(2, at(fromB), false);
      move(1, at(toA));
      move(2, at(toB));
      up(1, at(toA));
      up(2, at(toB));
    },
    { from, to },
  );
}

// Top strip of the canvas (sky, no pickables): fingers apart zooms in (factor down).
const PINCH_FROM: [number, number][] = [
  [0.22, 0.15],
  [0.42, 0.15],
];
const PINCH_SPREAD: [number, number][] = [
  [0.12, 0.15],
  [0.55, 0.15],
];

for (const level of LEVELS) {
  test(`pinch and buttons zoom the ${level.id} camera`, async ({ page }, info) => {
    skipNonTablet(info.project.name);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await enterLevel(page, level);
    expect(await zoomFactor(page)).toBe(1);

    await pinch(page, PINCH_FROM, PINCH_SPREAD);
    const zoomed = await zoomFactor(page);
    expect(zoomed).toBeGreaterThanOrEqual(0.6);
    expect(zoomed).toBeLessThan(1);

    // Squeeze back out past the pinch.
    await pinch(page, PINCH_SPREAD, PINCH_FROM);
    expect(await zoomFactor(page)).toBeGreaterThan(zoomed);

    // The +/− buttons step the same factor and are big enough to tap.
    const zoomIn = page.locator('.level-zoom__in');
    const zoomOut = page.locator('.level-zoom__out');
    const box = await zoomIn.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.width).toBeGreaterThanOrEqual(44);
    await expect(zoomIn).toHaveAttribute('aria-label', 'Phóng to');
    await expect(zoomOut).toHaveAttribute('aria-label', 'Thu nhỏ');
    const beforeButtons = await zoomFactor(page);
    await zoomIn.tap();
    expect(await zoomFactor(page)).toBeLessThan(beforeButtons);
    await zoomOut.tap();
    expect(await zoomFactor(page)).toBeCloseTo(beforeButtons, 6);
    expect(errors).toEqual([]);
  });
}
