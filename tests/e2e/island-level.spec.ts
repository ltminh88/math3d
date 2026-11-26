// English Island (Phase 1A + 1B): the island region, its gate after the bridge, the map
// entry, and the level shell driving the real engine (8 rounds per run). The run's
// widgets mount inside the shell panel; when the run resolves, the shell shows its
// own done card. Uses the test-build hooks `window.__game` and `window.__island`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

const LOCKED_BRIDGE = 'Hãy giúp VLM xây xong cây cầu, rồi đi qua cầu để mở cổng này nhé!';

type IslandState = NonNullable<ReturnType<NonNullable<Window['__game']>['island']['state']>>;
type Expected = NonNullable<ReturnType<NonNullable<Window['__game']>['island']['currentAnswer']>>;

const islandState = (page: Page) =>
  page.evaluate(() => window.__game?.island.state()) as Promise<IslandState | null>;
const islandAnswer = (page: Page) =>
  page.evaluate(() => window.__game?.island.currentAnswer()) as Promise<Expected | null>;

async function startPlaying(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

/** Walks up to the gate and uses it: tap on touch screens, the E key with a keyboard. */
async function useGate(page: Page, touch: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('island'));
  const button = page.locator('#interact');
  await expect(button).toContainText('Cổng Đảo Tiếng Anh');
  // Arriving in a region shows its welcome toast; let it land before the gate's toast.
  await expect(page.locator('#area-name')).toHaveText('Đảo Tiếng Anh');
  if (touch) await button.tap();
  else await page.keyboard.press('e');
}

/** Enters the island through its gate (bridge already built) and waits for the run. */
async function enterIsland(page: Page, touch: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.teleportToGate('island'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Đảo Tiếng Anh');
  const interact = page.locator('#interact');
  if (touch) await interact.tap();
  else await interact.click();
  await expect(page.locator('.island-panel')).toBeVisible();
  await expect(page.locator('.island-panel')).toContainText('Chặng 1/8 · Chữ A–D');
  await expect(page.locator('.english-run')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
}

async function tapOrClick(locator: ReturnType<Page['locator']>, tap: boolean): Promise<void> {
  if (tap) await locator.tap();
  else await locator.click();
}

// Answer helpers, same shapes as tests/e2e/english-exercises.spec.ts (Phase 1B):
// the current item's answer comes from `window.__game.island.currentAnswer()`.
async function answerRight(page: Page, tap: boolean): Promise<void> {
  const expected = await islandAnswer(page);
  if (!expected) throw new Error('no current answer');
  if (
    expected.kind === 'listen-pick-picture' ||
    expected.kind === 'letter-pick' ||
    expected.kind === 'fill-pattern'
  ) {
    await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(expected.index), tap);
  } else if (expected.kind === 'match-pairs') {
    for (const pair of expected.pairs) {
      await tapOrClick(page.getByRole('button', { name: pair.word, exact: true }), tap);
      await tapOrClick(page.getByRole('button', { name: pair.picture, exact: true }), tap);
    }
  } else {
    for (const word of expected.words) {
      await tapOrClick(page.getByRole('button', { name: word, exact: true }), tap);
    }
    await tapOrClick(page.locator('.english-check'), tap);
  }
  await expect(page.locator('.english-next')).toBeVisible();
}

async function nextRound(page: Page, tap: boolean): Promise<void> {
  await tapOrClick(page.locator('.english-next'), tap);
  await expect(page.locator('.english-next')).toBeHidden();
}

test('island gate stays locked until the bridge, then opens (8 stages)', async ({
  page,
}, testInfo) => {
  const touch = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  expect(await page.evaluate(() => window.__game?.gateStatus('island'))).toBe('locked');
  await useGate(page, touch);
  await expect(page.locator('#interact')).toContainText('Cổng Đảo Tiếng Anh 🔒 · Đi qua cầu để mở');
  await expect(page.locator('#toast')).toHaveText(LOCKED_BRIDGE);

  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  expect(await page.evaluate(() => window.__game?.gateStatus('island'))).toBe('open');
  await expect(page.locator('#gate-island-label small')).toHaveText('Cổng đã mở · Chặng 1/8');
  await expect(page.locator('#gate-island-label small')).not.toHaveText('Sắp ra mắt');
  await page.evaluate(() => window.__game?.teleportToGate('island'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Đảo Tiếng Anh');
  expect(errors).toEqual([]);
});

test('playing all 8 questions shows the done card; "Về cổng" completes the gate', async ({
  page,
}, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  await enterIsland(page, tap);
  // Play the whole run correctly. After #83 (engine without its own finish
  // screen) the run resolves right after question 8, so the shell's done card
  // replaces the run inside the panel at once — no `.english-finish` step.
  for (;;) {
    const state = await islandState(page);
    if (!state || state.done) break;
    await answerRight(page, tap);
    await nextRound(page, tap);
  }
  await expect(page.locator('.island-done')).toBeVisible();
  await expect(page.locator('.island-done')).toContainText('Đúng 8/8 câu');
  await expect
    .poll(() => page.evaluate(() => window.__island?.state()))
    .toMatchObject({ stage: 1, total: 8, done: true, roundsPlayed: 8, correctCount: 8 });
  const back = page.locator('.island-back');
  if (tap) await back.tap();
  else await back.click();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  // The host commits the run in the background after exit: poll, like the
  // market/numberfort specs, until the commit lands.
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('island')))
    .toBe('completed');
  expect(errors).toEqual([]);
});

test('leaving mid-run through "Về thế giới" keeps the gate open', async ({ page }, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  await enterIsland(page, tap);
  // One right answer, then leave before the run ends: a partial run must not
  // complete the gate.
  await answerRight(page, tap);
  await nextRound(page, tap);
  const leave = page.locator('.level-leave');
  if (tap) await leave.tap();
  else await leave.click();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  // R73: leaving aborts the run, so no run widget may stay in the DOM.
  await expect(page.locator('.english-run')).toHaveCount(0);
  // The DOM assert above is green either way — the host disposes the session
  // (and its panel) on exit — so prove the run itself resolved: pre-fix the
  // engine's promise dangles and its live state stays mid-run (round 2, not
  // done); after abort it resolves with the 1 completed round, done.
  await expect.poll(() => islandState(page)).toMatchObject({ done: true, round: 1 });
  expect(await page.evaluate(() => window.__game?.gateStatus('island'))).toBe('open');
  expect(errors).toEqual([]);
});

test('the area badge and the world map know the island', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startPlaying(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.teleport(-6, 13));
  await expect(page.locator('#area-name')).toHaveText('Đảo Tiếng Anh');

  await page.locator('#open-map').click();
  await expect(page.locator('#world-map')).toBeVisible();
  await expect(page.locator('[data-region]')).toHaveCount(12);
  await page.locator('[data-region="island"]').click();
  await expect(page.locator('#map-detail strong')).toHaveText('🏝️ Đảo Tiếng Anh');
  await expect(page.locator('#map-detail .map-gate')).toHaveText(
    'Cổng màn chơi: Cổng đã mở · Chặng 1/8',
  );
  expect(errors).toEqual([]);
});
