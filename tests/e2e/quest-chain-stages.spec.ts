// Phase 13: the quest card's stage sub-line and the map panel's gate pop-panel. The card
// shows "Chặng 1/m · 0 sao" for its current level (a fresh level — the card moves on once
// stage 1 is done, so the mid-level lines live on the gate and map labels instead). A level
// with every stage done offers "Chơi lại chặng…" with one ≥44px row per stage in the map
// detail panel; an unfinished multi-stage level offers "Vào chơi" for its next stage.
// Replaying a stage opens that stage, never re-locks anything and never re-pays the
// first-completion bonus. Uses the test-build hook `window.__game`. Tap only on touch
// projects. (The cave shows no stage line until PR #20 ships its 5 stages.)
import { type Page, type TestInfo, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const isTouch = (info: TestInfo) => info.project.use.hasTouch === true;

async function startPlaying(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

async function tapOrClick(page: Page, locator: string, touch: boolean): Promise<void> {
  if (touch) await page.locator(locator).tap();
  else await page.locator(locator).click();
}

async function openMapRegion(page: Page, region: string, touch: boolean): Promise<void> {
  await tapOrClick(page, '#open-map', touch);
  await tapOrClick(page, `[data-region="${region}"]`, touch);
}

/** Field round state (from `window.__field`): enough to answer a round by tap or keyboard. */
const fieldState = (page: Page) => page.evaluate(() => window.__field?.state() ?? null);

async function waitPhase(page: Page, phase: string): Promise<void> {
  await page.waitForFunction((p) => window.__field?.state().phase === p, phase);
}

async function plantByKeyboard(page: Page, rows: number, cols: number): Promise<void> {
  await page.keyboard.press('ArrowRight');
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      await page.keyboard.press('Enter');
      if (k < cols - 1) await page.keyboard.press(r % 2 === 0 ? 'ArrowRight' : 'ArrowLeft');
    }
    if (r < rows - 1) await page.keyboard.press('ArrowDown');
  }
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
}

async function answerRound(page: Page, touch: boolean): Promise<void> {
  const state = await fieldState(page);
  if (!state) throw new Error('field state missing');
  if (state.type === 'equations') {
    for (const id of state.correctOptions) {
      const card = page.locator(`.field-answers [data-option="${id}"]`);
      if (touch) await card.tap();
      else await page.keyboard.press(String(Number(await card.locator('kbd').textContent())));
    }
    if (touch) await page.getByRole('button', { name: 'Kiểm tra' }).tap();
    else await page.keyboard.press('Enter');
    return;
  }
  // The pad answer is the total, or the hidden factor on a missing-factor round.
  if (touch) {
    const pad = page.locator('.field-pad');
    for (const digit of String(state.answer)) {
      await pad.getByRole('button', { name: digit, exact: true }).tap();
    }
    await pad.getByRole('button', { name: 'Xong' }).tap();
  } else {
    await page.keyboard.type(String(state.answer));
    await page.keyboard.press('Enter');
  }
}

/** Plays the field run to its done panel; asserts the panel's stage line when given. */
async function playFiveRounds(page: Page, touch: boolean, stageLine?: string): Promise<void> {
  for (let round = 0; round < 5; round++) {
    await page.waitForFunction((i) => window.__field?.state().index === i, round);
    const state = await fieldState(page);
    if (!state) throw new Error('field state missing');
    if (state.phase === 'planting') {
      if (touch) await plantByTouch(page);
      else await plantByKeyboard(page, state.rows, state.cols);
      await waitPhase(page, 'answer');
    }
    await answerRound(page, touch);
    await waitPhase(page, 'solved');
    await expect(page.locator('.field-panel .feedback.success')).toBeVisible();
    const next = page.locator('.field-next');
    if (touch) await next.tap();
    else {
      await expect(next).toBeFocused();
      await page.keyboard.press('Enter');
    }
  }
  await waitPhase(page, 'done');
  await expect(page.locator('.field-panel--done .field-stars')).toBeVisible();
  if (stageLine) await expect(page.locator('.field-panel--done')).toContainText(stageLine);
}

async function leaveField(page: Page, touch: boolean): Promise<void> {
  const back = page.getByRole('button', { name: 'Về cổng' });
  if (touch) await back.tap();
  else await page.keyboard.press('Enter');
  await page.waitForFunction(() => window.__game?.levelRunning() === false);
  await expect(page.locator('.field-hud')).toHaveCount(0);
}

test('the quest card shows the current level’s stage line', async ({ page }) => {
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await expect(page.locator('#quest-stage')).toHaveText('Chặng 1/6 · 0 sao');
  // A one-stage level's card shows no stage line (the cave still has 1 stage until PR #20).
  await page.evaluate(() =>
    window.__game?.seedProgress({
      completedLevels: ['field', 'forest', 'city', 'tower', 'garden', 'valley', 'workshop'],
    }),
  );
  await expect(page.locator('#quest-title')).toHaveText('Hang Đố Vui');
  await expect(page.locator('#quest-stage')).toHaveCount(0);
});

test('an unfinished level offers its next stage from the map panel', async ({ page }, info) => {
  const touch = isTouch(info);
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.seedStageProgress('field', [2]));
  await openMapRegion(page, 'meadow', touch);
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Đã hoàn thành ★★☆ · Chặng 2/6',
  );
  await expect(page.locator('#map-detail .map-enter')).toHaveText('Vào chơi');
  await tapOrClick(page, '#map-detail .map-enter', touch);
  await expect(page.locator('#world-map')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  await leaveField(page, touch);
});

test('a finished level offers every stage for replay in the map panel', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const touch = isTouch(info);
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.seedStageProgress('field', [2, 2, 2, 2, 2, 2]));
  const before = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.field);

  await openMapRegion(page, 'meadow', touch);
  await expect(page.locator('#map-detail .map-replay-title')).toHaveText('Chơi lại chặng…');
  const rows = page.locator('#map-detail .map-replay-stage');
  await expect(rows).toHaveCount(6);
  await expect(rows.nth(0)).toHaveText('Chặng 1 · 2 sao');
  await expect(rows.nth(5)).toHaveText('Chặng 6 · 2 sao');
  for (let i = 0; i < 6; i++) {
    const box = await rows.nth(i).boundingBox();
    expect(box?.height, `replay row ${i + 1} is tappable`).toBeGreaterThanOrEqual(44);
  }

  // Replaying stage 3 opens that stage (not stage 1): the done panel names it.
  await tapOrClick(page, '#map-detail .map-replay-stage[data-replay-stage="3"]', touch);
  await expect(page.locator('#world-map')).toBeHidden();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  await playFiveRounds(page, touch, 'Chặng 3/6');
  // No first-completion bonus on a replay: the done panel shows no bonus line.
  await expect(page.locator('.field-bonus')).toHaveCount(0);
  await leaveField(page, touch);

  // Nothing re-locked, nothing re-paid: the level's stars and completion are untouched.
  const after = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.field);
  expect(after?.stageStars).toEqual([2, 2, 2, 2, 2, 2]);
  expect(after?.stars).toBe(before?.stars);
  expect(after?.completedAt).toBe(before?.completedAt);
  expect(await page.evaluate(() => window.__game?.gateStatus('field'))).toBe('completed');
  expect(errors).toEqual([]);
});
