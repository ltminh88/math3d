// R23 part A guard: every level scene stays within 60 draw calls (worst frame, from the
// `data-max-draw-calls` the scene tracks while it runs). One entry per level is enough:
// the scene renders its full diorama as soon as the panel shows.
import { test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

interface LevelDef {
  id: string;
  gate: string;
  panel: string;
  before: string[];
}

const LEVELS: LevelDef[] = [
  { id: 'field', gate: 'Vào Cổng Cánh Đồng Phép Tính', panel: '.field-panel', before: [] },
  { id: 'forest', gate: 'Vào Cổng Rừng Nhân Chia', panel: '.forest-panel', before: ['field'] },
  {
    id: 'city',
    gate: 'Vào Cổng Thành Phố Con Số',
    panel: '.city-panel',
    before: ['field', 'forest'],
  },
  {
    id: 'tower',
    gate: 'Vào Cổng Tháp Toán Học',
    panel: '.tower-panel',
    before: ['field', 'forest', 'city'],
  },
  {
    id: 'garden',
    gate: 'Vào Cổng Khu Vườn Quy Luật',
    panel: '.garden-panel',
    before: ['field', 'forest', 'city', 'tower'],
  },
  {
    id: 'valley',
    gate: 'Vào Cổng Thung Lũng Hình Học',
    panel: '.valley-panel',
    before: ['field', 'forest', 'city', 'tower', 'garden'],
  },
  {
    id: 'workshop',
    gate: 'Vào Cổng Xưởng Đo Đạc',
    panel: '.workshop-panel',
    before: ['field', 'forest', 'city', 'tower', 'garden', 'valley'],
  },
  {
    id: 'cave',
    gate: 'Vào Cổng Hang Đố Vui',
    panel: '.cave-panel',
    before: ['field', 'forest', 'city', 'tower', 'garden', 'valley', 'workshop'],
  },
  {
    id: 'market',
    gate: 'Vào Cổng Chợ Phiên Tí Hon',
    panel: '.market-panel',
    before: ['field', 'forest', 'city', 'tower', 'garden', 'valley', 'workshop', 'cave'],
  },
  {
    id: 'numberfort',
    gate: 'Vào Cổng Lâu Đài Số',
    panel: '.numberfort-panel',
    before: ['field', 'forest', 'city', 'tower', 'garden', 'valley', 'workshop', 'cave'],
  },
];

for (const level of LEVELS) {
  test(`${level.id} stays within 60 draw calls`, async ({ page }, info) => {
    const tap = !!info.project.use.hasTouch;
    await page.goto('/');
    await waitForStoreBoot(page);
    await page.waitForFunction(() => '__game' in window);
    await page.locator('#play').click();
    await expect(page.locator('body')).toHaveClass(/playing/);
    await page.evaluate(
      (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
      level.before,
    );
    await page.evaluate((id) => window.__game?.teleportToGate(id), level.id);
    await expect(page.locator('#interact')).toContainText(level.gate);
    if (tap) await page.locator('#interact').tap();
    else await page.locator('#interact').click();
    await expect(page.locator(level.panel)).toBeVisible();
    // The attribute appears only after the scene's 3rd frame, and the workshop's first
    // frames take ~12 s each on SwiftShader (shader compile + shadow pass), so allow
    // far more than the default 30 s. On a real device / CI it shows up in ~1 s.
    await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/, {
      timeout: 120_000,
    });
    await page.waitForTimeout(2000);
    const maxCalls = await page.evaluate(() =>
      Number(document.querySelector('.level-layer')?.getAttribute('data-max-draw-calls') ?? -1),
    );
    expect(maxCalls).toBeGreaterThan(0);
    expect(maxCalls).toBeLessThanOrEqual(60);
    const leave = page.locator('.level-leave');
    if (tap) await leave.tap();
    else await leave.click();
    await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  });
}
