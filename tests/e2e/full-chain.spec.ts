// The whole map chain bridge → field → forest → city → tower → done (city/tower phase 04): seed
// progression stage by stage and check the next gate's status, the quest card, VLM's pointer line
// and the map ("Sắp ra mắt" nowhere); enter each newly opened gate once and leave through the host's
// "Về thế giới" button. Desktop only (the per-level specs cover the phone). Uses `window.__game`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

type LevelId = 'field' | 'forest' | 'city' | 'tower';

interface Stage {
  readonly levelId: LevelId;
  readonly region: string;
  readonly gate: string;
  readonly title: string;
  readonly progress: string;
  /** Completed levels seeded before this stage (on top of the earlier stages). */
  readonly seed: readonly LevelId[];
}

const STAGES: readonly Stage[] = [
  {
    levelId: 'field',
    region: 'meadow',
    gate: 'Cổng Cánh Đồng Phép Tính',
    title: 'Cánh Đồng Phép Tính',
    progress: 'Đến Cổng Cánh Đồng',
    seed: [],
  },
  {
    levelId: 'forest',
    region: 'forest',
    gate: 'Cổng Rừng Nhân Chia',
    title: 'Rừng Nhân Chia',
    progress: 'Đến Cổng Rừng Nhân Chia',
    seed: ['field'],
  },
  {
    levelId: 'city',
    region: 'city',
    gate: 'Cổng Thành Phố Con Số',
    title: 'Thành Phố Con Số',
    progress: 'Đến Cổng Thành Phố Con Số',
    seed: ['forest'],
  },
  {
    levelId: 'tower',
    region: 'tower',
    gate: 'Cổng Tháp Toán Học',
    title: 'Tháp Toán Học',
    progress: 'Đến Cổng Tháp Toán Học',
    seed: ['city'],
  },
];

/** Every quest step cell shows its name on one line: not clipped, one line box. */
async function expectStepsOnOneLine(page: Page): Promise<void> {
  const cells = await page.locator('#quest-steps > span').evaluateAll((spans) =>
    spans.map((s) => {
      const range = document.createRange();
      range.selectNodeContents(s);
      const lineTops = new Set([...range.getClientRects()].map((r) => Math.round(r.top)));
      return {
        text: s.textContent ?? '',
        clipped: s.scrollWidth > s.clientWidth,
        lines: lineTops.size,
      };
    }),
  );
  expect(cells).toHaveLength(5);
  for (const cell of cells) {
    expect(cell.clipped, cell.text).toBe(false);
    expect(cell.lines, cell.text).toBeLessThanOrEqual(1);
  }
}

async function expectVlmPointsAt(page: Page, gate: string): Promise<void> {
  await page.evaluate(() => window.__game?.teleport(-3, 3.6));
  await expect(page.locator('#interact')).toContainText('Nói chuyện với VLM');
  await page.locator('#interact').click();
  await expect(page.locator('#dialog .dialog-copy')).toContainText(gate);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toBeVisible();
}

async function expectMapWithoutComingSoon(page: Page, stage: Stage): Promise<void> {
  await page.locator('#open-map').click();
  await expect(page.locator('#world-map')).toBeVisible();
  await expect(page.locator('#map-regions')).not.toContainText('Sắp ra mắt');
  await page.locator(`[data-region="${stage.region}"]`).click();
  await expect(page.locator('#map-detail .map-gate')).toHaveText('Cổng màn chơi: Cổng đã mở');
  await page.locator('#close-map').click();
  await expect(page.locator('#world-map')).toBeHidden();
}

async function enterAndLeave(page: Page, stage: Stage): Promise<void> {
  await page.evaluate((id) => window.__game?.teleportToGate(id), stage.levelId);
  await expect(page.locator('#interact')).toContainText(`Vào ${stage.gate}`);
  await page.locator('#interact').click();
  const layer = page.locator('.level-layer');
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute('aria-label', stage.gate);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  // The level has drawn its own UI into the layer, next to the host's leave button.
  await expect(layer.locator(':scope > :not(.level-leave)').first()).toBeVisible();
  await page.locator('.level-leave').click();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect(layer).toHaveCount(0);
  // Leaving before any answer commits nothing: the gate stays open.
  expect(await page.evaluate((id) => window.__game?.gateStatus(id), stage.levelId)).toBe('open');
}

test('the full chain: each stage opens the next gate, every level loads and exits', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'desktop-chromium', 'desktop walk-through of the whole chain');
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));

  for (const [i, stage] of STAGES.entries()) {
    await page.evaluate(
      (levels) => window.__game?.seedProgress({ completedLevels: [...levels] }),
      stage.seed,
    );
    expect(await page.evaluate((id) => window.__game?.gateStatus(id), stage.levelId)).toBe('open');
    const later = STAGES.slice(i + 1).map((s) => s.levelId);
    const laterStatuses = await page.evaluate(
      (ids) => ids.map((id) => window.__game?.gateStatus(id)),
      later,
    );
    expect(laterStatuses).toEqual(later.map(() => 'locked'));

    await expect(page.locator('#quest-title')).toHaveText(stage.title);
    await expect(page.locator('#quest-progress')).toHaveText(stage.progress);
    await expect(page.locator('#quest-steps .done')).toHaveCount(i + 1);
    await expectStepsOnOneLine(page);
    await expect(page.locator(`#gate-${stage.levelId}-label small`)).toHaveText('Cổng đã mở');
    await expect(page.locator('body')).not.toContainText('Sắp ra mắt');

    await expectVlmPointsAt(page, stage.gate);
    await expectMapWithoutComingSoon(page, stage);
    await enterAndLeave(page, stage);
  }

  await page.evaluate(() => window.__game?.seedProgress({ completedLevels: ['tower'] }));
  await expect(page.locator('#quest-title')).toHaveText('Bạn đã qua cả năm chặng!');
  await expect(page.locator('#quest-progress')).toHaveText('✓ Hoàn thành');
  await expect(page.locator('#quest-steps .done')).toHaveCount(5);
  expect(
    await page.evaluate(() =>
      (['field', 'forest', 'city', 'tower'] as const).map((id) => window.__game?.gateStatus(id)),
    ),
  ).toEqual(['completed', 'completed', 'completed', 'completed']);
  await expect(page.locator('body')).not.toContainText('Sắp ra mắt');
  expect(errors).toEqual([]);
});
