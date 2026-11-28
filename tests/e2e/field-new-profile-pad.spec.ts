// Field level, fresh profile (R149): after "Chơi lại từ đầu" the child replays the bridge,
// enters the field stage 1, plants the first plot by touch, and the number pad must appear
// and accept the answer — on both iPad orientations. The pad only mounts once the plot is
// full, so the spec plants first, then asserts the pad is visible, inside the viewport,
// and tappable.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const fieldState = (page: Page) => page.evaluate(() => window.__field?.state());

async function enterFieldFresh(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').tap();
  await expect(page.locator('body')).toHaveClass(/playing/);
  // A fresh profile that finished the bridge: no field facts seen, stage 1 next.
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await expect(page.locator('#gate-field-label small')).toHaveText('Cổng đã mở · Chặng 1/6');
  await page.evaluate(() => window.__game?.teleportToGate('field'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Cánh Đồng Phép Tính');
  await page.locator('#interact').tap();
  await page.waitForFunction(() => window.__field?.state().phase !== undefined);
  await expect(page.locator('.field-speech')).toContainText('VLM');
}

async function plantByTouch(page: Page): Promise<void> {
  const tapId = async (id: string) => {
    const point = await page.evaluate((target) => window.__field?.point(target), id);
    if (!point) throw new Error(`no screen point for ${id}`);
    await page.touchscreen.tap(point.x, point.y);
  };
  await tapId('cell:0:0');
  for (let guard = 0; guard < 12; guard++) {
    const rows = await page.evaluate(() => window.__field?.openRows() ?? []);
    if (rows.length === 0) return;
    await tapId(rows[0] as string);
  }
  throw new Error('plot never filled after 12 row taps');
}

test('reset through the real UI wipes field progress, and the field replays from stage 1', async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== 'tablet-portrait' && info.project.name !== 'tablet-landscape',
    'R149: iPad orientations only',
  );
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').tap();
  await expect(page.locator('body')).toHaveClass(/playing/);
  // An advanced profile: bridge done, field stage 1 done (2 stars), some field facts known.
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.seedStageProgress('field', [2]));
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'mul:2x3': { box: 3 },
      'mul:3x3': { box: 3 },
      'mul:2x4': { box: 2 },
    }),
  );
  await expect(page.locator('#gate-field-label small')).toHaveText('Đã hoàn thành ★★☆ · Chặng 2/6');

  // The real reset path: settings → "Chơi lại từ đầu" → confirm.
  await page.locator('#settings').tap();
  await page.locator('#reset-progress').tap();
  await page.locator('#confirm-reset').tap();
  // The store must land the wipe: the field entry must be gone, not just the menu view.
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.field), {
      timeout: 10_000,
    })
    .toBeUndefined();
  // The gate labels live in the world HUD and only refresh while the world is active
  // (onWorldFrame), so while the menu is showing they still carry the old text — that is
  // expected, not a bug. They must follow the wipe once the child re-enters the world.
  await page.locator('#play').tap();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await expect(page.locator('#gate-field-label small')).toHaveText(/Đi qua cầu để mở|Chặng 1\/6/);

  // Replay the bridge (seeded), then enter the field: stage 1 again, pad after planting.
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await expect(page.locator('#gate-field-label small')).toHaveText('Cổng đã mở · Chặng 1/6');
  await page.evaluate(() => window.__game?.teleportToGate('field'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Cánh Đồng Phép Tính');
  await page.locator('#interact').tap();
  await page.waitForFunction(() => window.__field?.state().phase !== undefined);
  const first = await fieldState(page);
  expect(first).toMatchObject({ index: 0, phase: 'planting', type: 'build' });
  await plantByTouch(page);
  await page.waitForFunction(() => window.__field?.state().phase === 'answer');
  const pad = page.locator('.field-pad');
  await expect(pad).toBeVisible();
  const state = await fieldState(page);
  if (!state) throw new Error('field state missing');
  for (const digit of String(state.answer)) {
    await pad.getByRole('button', { name: digit, exact: true }).tap();
  }
  await pad.getByRole('button', { name: 'Xong' }).tap();
  await page.waitForFunction(() => window.__field?.state().phase === 'solved');
  expect(errors).toEqual([]);
});

test('fresh profile: field stage 1 shows the number pad after planting, and it taps', async ({
  page,
}, info) => {
  test.skip(
    info.project.name !== 'tablet-portrait' && info.project.name !== 'tablet-landscape',
    'R149: iPad orientations only',
  );
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  await enterFieldFresh(page);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  const viewport = page.viewportSize() ?? { width: 0, height: 0 };

  const first = await fieldState(page);
  expect(first).toMatchObject({ index: 0, phase: 'planting', type: 'build' });
  // By design the pad mounts only once the plot is full.
  await expect(page.locator('.field-pad')).toHaveCount(0);
  // R149/R150: the child must be able to SEE the planting instruction at round start —
  // the speech bubble and the whole panel (prompt + tip) inside the viewport.
  await expect(page.locator('.field-speech')).toBeVisible();
  await expect(page.locator('.field-prompt')).toContainText('Trồng');
  await expect(page.locator('.field-tip')).toContainText('Chạm vào từng ô đất');
  // R149/R150 fix: round 0's speech must say the planting step comes first AND that
  // the number pad appears only after the plot is full — the story intro alone
  // left the child waiting for a pad that was never going to mount yet.
  await expect(page.locator('.field-speech')).toContainText('Chạm vào từng ô đất');
  await expect(page.locator('.field-speech')).toContainText('bảng số mới hiện ra');
  for (const selector of ['.field-speech', '.field-panel']) {
    const box = await page.locator(selector).boundingBox();
    expect(box).not.toBeNull();
    expect(box?.x).toBeGreaterThanOrEqual(0);
    expect(box?.y).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
    expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
  }

  await plantByTouch(page);
  await page.waitForFunction(() => window.__field?.state().phase === 'answer');

  const pad = page.locator('.field-pad');
  await expect(pad).toBeVisible();
  const box = await pad.boundingBox();
  expect(box).not.toBeNull();
  expect(box?.x).toBeGreaterThanOrEqual(0);
  expect(box?.y).toBeGreaterThanOrEqual(0);
  expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewport.width);
  expect((box?.y ?? 0) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height);

  const state = await fieldState(page);
  if (!state) throw new Error('field state missing');
  for (const digit of String(state.answer)) {
    const key = pad.getByRole('button', { name: digit, exact: true });
    await expect(key).toBeEnabled();
    await key.tap();
  }
  await pad.getByRole('button', { name: 'Xong' }).tap();
  await page.waitForFunction(() => window.__field?.state().phase === 'solved');
  await expect(page.locator('.field-panel .feedback.success')).toBeVisible();
  expect(errors).toEqual([]);
});
