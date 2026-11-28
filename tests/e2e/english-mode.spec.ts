// English two-modes Phase 2: mode select on the welcome + the English home (CEC stage
// cards with stars). Tap only; the run itself is the island shell (Phase 1A/1B). The
// host's start-failure paths (start throws, openRun throws) are covered at unit level
// (level-host.test.ts, exit target set); here the forced failure is a chunk load failure,
// which the app treats as a stale build and recovers from with a reload.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

type IslandState = NonNullable<ReturnType<NonNullable<Window['__game']>['island']['state']>>;
type Expected = NonNullable<ReturnType<NonNullable<Window['__game']>['island']['currentAnswer']>>;

const islandState = (page: Page) =>
  page.evaluate(() => window.__game?.island.state()) as Promise<IslandState | null>;
const islandAnswer = (page: Page) =>
  page.evaluate(() => window.__game?.island.currentAnswer()) as Promise<Expected | null>;

async function openWelcome(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await expect(page.locator('#welcome')).toBeVisible();
}

async function tapOrClick(locator: ReturnType<Page['locator']>, tap: boolean): Promise<void> {
  if (tap) await locator.tap();
  else await locator.click();
}

/** Chooses English on the welcome and waits for the home. */
async function chooseEnglish(page: Page, tap: boolean): Promise<void> {
  await tapOrClick(page.locator('#play-english'), tap);
  await expect(page.locator('#english-home')).toBeVisible();
  await expect(page.locator('#welcome')).toBeHidden();
}

/** Enters an island stage from the home and waits for the run. */
async function enterStage(page: Page, tap: boolean, stage: number): Promise<void> {
  await tapOrClick(page.locator(`.english-home-card[data-stage="${stage}"]`), tap);
  await expect(page.locator('.island-panel')).toBeVisible();
  await expect(page.locator('.english-run')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
}

// Answer helpers, same shapes as tests/e2e/island-level.spec.ts (Phase 1B): the current
// item's answer comes from `window.__game.island.currentAnswer()`.
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
}

async function nextRound(page: Page, tap: boolean): Promise<void> {
  await tapOrClick(page.locator('.english-next'), tap);
  await expect(page.locator('.english-next')).toBeHidden();
}

test('welcome offers two modes; English opens the home with 8 cards', async ({
  page,
}, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await openWelcome(page);

  await expect(page.locator('#play')).toHaveText(/Bắt đầu phiêu lưu/);
  await expect(page.locator('#play-english')).toHaveText(/Tiếng Anh lớp 1/);
  // Nothing picked yet: the game button is the remembered default.
  await expect(page.locator('#play')).toHaveClass(/selected/);
  await expect(page.locator('#play-english')).not.toHaveClass(/selected/);

  await chooseEnglish(page, tap);
  await expect(page.locator('.english-home-title')).toHaveText('Tiếng Anh lớp 1');
  await expect(page.locator('.english-home-card')).toHaveCount(8);
  const first = page.locator('.english-home-card[data-stage="1"]');
  await expect(first).toBeEnabled();
  await expect(first).toHaveClass(/next/);
  await expect(first).toContainText('Chữ A–D');
  await expect(first.locator('.english-home-card-stars')).toHaveText('☆☆☆');
  for (let stage = 2; stage <= 8; stage++) {
    await expect(page.locator(`.english-home-card[data-stage="${stage}"]`)).toBeDisabled();
  }
  // English mode never activates the world: no HUD, no quest card, no playing class.
  await expect(page.locator('body')).not.toHaveClass(/playing/);
  await expect(page.locator('#hud')).toBeHidden();
  expect(errors).toEqual([]);
});

test('the remembered mode is pre-selected after reload; switching back starts the world', async ({
  page,
}, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await openWelcome(page);
  await chooseEnglish(page, tap);
  await page.reload();
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);

  await expect(page.locator('#play-english')).toHaveClass(/selected/);
  await expect(page.locator('#play')).not.toHaveClass(/selected/);

  await chooseEnglish(page, tap);
  const menu = page.locator('#english-home-menu');
  await expect(menu).toHaveText('Về menu');
  await tapOrClick(menu, tap);
  await expect(page.locator('#english-home')).toBeHidden();
  await expect(page.locator('#welcome')).toBeVisible();
  await expect(page.locator('#play-english')).toHaveClass(/selected/);

  await tapOrClick(page.locator('#play'), tap);
  await expect(page.locator('body')).toHaveClass(/playing/);
  await expect(page.locator('#welcome')).toBeHidden();
  await expect(page.locator('#hud')).toBeVisible();
  expect(errors).toEqual([]);
});

test('playing stage 1 to the end returns to the home with a star', async ({ page }, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await openWelcome(page);
  await chooseEnglish(page, tap);
  await enterStage(page, tap, 1);
  await expect(page.locator('.island-panel')).toContainText('Chặng 1/8 · Chữ A–D');

  for (;;) {
    const state = await islandState(page);
    if (!state || state.done) break;
    await answerRight(page, tap);
    await nextRound(page, tap);
  }
  await expect(page.locator('.island-done')).toBeVisible();
  await expect(page.locator('.island-done')).toContainText('Đúng 8/8 câu');
  const back = page.locator('.island-back');
  if (tap) await back.tap();
  else await back.click();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);

  // The host commits the run in the background after exit: the home re-renders when
  // the commit lands, so poll the card until the fresh star shows.
  await expect(page.locator('#english-home')).toBeVisible();
  await expect
    .poll(() =>
      page.locator('.english-home-card[data-stage="1"] .english-home-card-stars').textContent(),
    )
    .toBe('★★★');
  await expect(page.locator('.english-home-card[data-stage="2"]')).toBeEnabled();
  await expect(page.locator('.english-home-card[data-stage="2"]')).toHaveClass(/next/);
  await expect(page.locator('body')).not.toHaveClass(/playing/);
  expect(errors).toEqual([]);
});

test('leaving mid-run returns to the home; the world stays inactive', async ({
  page,
}, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await openWelcome(page);
  await chooseEnglish(page, tap);
  await enterStage(page, tap, 1);

  await answerRight(page, tap);
  await nextRound(page, tap);
  const leave = page.locator('.level-leave');
  if (tap) await leave.tap();
  else await leave.click();
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect(page.locator('.english-run')).toHaveCount(0);
  await expect(page.locator('#english-home')).toBeVisible();
  await expect(page.locator('body')).not.toHaveClass(/playing/);
  await expect(page.locator('#hud')).toBeHidden();
  // A partial run earns no star: stage 1 is still the next stage.
  await expect(page.locator('.english-home-card[data-stage="1"]')).toHaveClass(/next/);
  await expect(
    page.locator('.english-home-card[data-stage="1"] .english-home-card-stars'),
  ).toHaveText('☆☆☆');
  expect(errors).toEqual([]);
});

test('stars earned in English mode survive the switch to the world (gate still locked)', async ({
  page,
}, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await openWelcome(page);
  await page.evaluate(() => window.__game?.seedStageProgress('island', [2, 1]));
  await chooseEnglish(page, tap);
  await expect(
    page.locator('.english-home-card[data-stage="1"] .english-home-card-stars'),
  ).toHaveText('★★☆');
  await expect(
    page.locator('.english-home-card[data-stage="2"] .english-home-card-stars'),
  ).toHaveText('★☆☆');
  await expect(page.locator('.english-home-card[data-stage="3"]')).toBeEnabled();
  await expect(page.locator('.english-home-card[data-stage="3"]')).toHaveClass(/next/);

  const menu = page.locator('#english-home-menu');
  await tapOrClick(menu, tap);
  await tapOrClick(page.locator('#play'), tap);
  await expect(page.locator('body')).toHaveClass(/playing/);
  // No bridge built: the island gate is still locked in the world …
  expect(await page.evaluate(() => window.__game?.gateStatus('island'))).toBe('locked');
  await expect(page.locator('#gate-island-label small')).toHaveText('Đi qua cầu để mở');
  // … but the stars earned in English mode are the same progress the world reads.
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.island?.stageStars))
    .toEqual([2, 1]);
  expect(errors).toEqual([]);
});

test('a failed island chunk reloads the build; the English choice is remembered', async ({
  page,
}, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await openWelcome(page);
  await chooseEnglish(page, tap);

  // Fail the island scene chunk: Vite preloads the chunk (`__vitePreload`) before the
  // dynamic import fetches it, so one abort only kills the preload and the import then
  // loads fine. Abort the first two requests (preload + import) so the import itself
  // fails; the host reports a stale build and the app reloads. Later requests go
  // through, so the retry after the reload works.
  let aborted = 0;
  await page.route(
    (url) => url.pathname.includes('island') && url.pathname.endsWith('.js'),
    async (route) => {
      if (aborted < 2) {
        aborted += 1;
        await route.abort();
      } else {
        await route.continue();
      }
    },
  );
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'load' }),
    tapOrClick(page.locator('.english-home-card[data-stage="1"]'), tap),
  ]);
  expect(aborted).toBe(2);
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);

  // After the reload the welcome is back with the English choice pre-selected.
  await expect(page.locator('#welcome')).toBeVisible();
  await expect(page.locator('#play-english')).toHaveClass(/selected/);
  await chooseEnglish(page, tap);
  await enterStage(page, tap, 1);
  await expect(page.locator('.island-panel')).toContainText('Chặng 1/8 · Chữ A–D');
  expect(errors).toEqual([]);
});
