// Market level "Chợ Phiên Tí Hon" (chapter 3 phase 19): seed chapter 1 and 2, enter through
// the market gate, play six rounds of clock skills (stage 1), come back with the level
// completed, `sk:` skills stored and the stage-1 stars. Uses `window.__market`/`__game`.
// The chain stays at the cave in this PR — chapter 3 joins the quest chain in phase 21
// (reviewer-owned), so no quest-card assertion for market here.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const DRAW_CALL_BUDGET = 60;
const ROUNDS = 6;
const BEFORE_MARKET = ['field', 'forest', 'city', 'tower', 'garden', 'valley', 'workshop', 'cave'];
const CLOCK_SKILLS = [
  'clock-read-hour-half',
  'clock-read-5min',
  'clock-read-minute',
  'clock-sang-chieu-24h',
  'clock-elapsed-minutes',
  'roman-clock-hour',
  'times-order-digital',
];
const CALENDAR_SKILLS = ['months-days-count', 'calendar-weekday', 'calendar-days-between'];

type MarketState = NonNullable<ReturnType<NonNullable<Window['__market']>['state']>>;
type Expected = NonNullable<MarketState['expected']>;

const marketState = (page: Page) =>
  page.evaluate(() => window.__market?.state()) as Promise<MarketState>;
const blurControls = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function enterMarket(page: Page, tap: boolean): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(
    (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
    BEFORE_MARKET,
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('market'))).toBe('open');
  await page.evaluate(() => window.__game?.teleportToGate('market'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Chợ Phiên Tí Hon');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.market-panel')).toBeVisible();
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

/** A profile with stage 1 done (and attempts for the stage-2 pool), ready to play stage 2. */
async function startWithStages(page: Page, stageStars: number[]): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(
    (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
    BEFORE_MARKET,
  );
  // Attempts for the stage-2 pool: the calendar skills, so the stage-2 plan plays them.
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'sk:months-days-count': { attempts: 2, box: 2 },
      'sk:calendar-weekday': { attempts: 2, box: 1 },
      'sk:calendar-days-between': { attempts: 1, box: 1 },
      'sk:clock-read-5min': { attempts: 2, box: 2 },
    }),
  );
  await page.evaluate((stars) => window.__game?.seedStageProgress('market', stars), stageStars);
}

async function enterMarketStage(page: Page, tap: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('market'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Chợ Phiên Tí Hon');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.market-panel')).toBeVisible();
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

/** One answer to the current step, by taps or by keys. `right` false gives a wrong one. */
async function give(page: Page, e: Expected, right: boolean, tap: boolean): Promise<void> {
  const card = page.locator('.market-card');
  if (e.kind === 'number') {
    const value = right ? e.answer : e.answer + 1;
    if (tap) {
      const pad = card.locator('.kit-pad');
      for (const digit of String(value)) {
        await pad.getByRole('button', { name: digit, exact: true }).tap();
      }
      await pad.getByRole('button', { name: 'Xong' }).tap();
    } else {
      await blurControls(page);
      await page.keyboard.type(String(value));
      await page.keyboard.press('Enter');
    }
    return;
  }
  if (e.kind === 'verdict') {
    const value = right ? e.answer : !e.answer;
    if (tap) await card.locator(`[data-verdict="${value}"]`).tap();
    else {
      await blurControls(page);
      await page.keyboard.press(value ? '1' : '2');
    }
    return;
  }
  if (e.kind === 'choice') {
    const index = right ? e.index : e.index === 0 ? 1 : 0;
    if (tap) await card.locator('.kit-choices button').nth(index).tap();
    else {
      await blurControls(page);
      await page.keyboard.press(String(index + 1));
    }
    return;
  }
  // Choose-all: the right set, or a wrong one (everything, or one sentence when all are true).
  if (e.kind === 'set-clock')
    throw new Error('market spec: set-clock steps are not played (only stages 1–2 are)');
  const ids = right ? e.ids : e.ids.length < e.all.length ? e.all : e.all.slice(0, 1);
  if (tap) {
    for (const id of ids) await card.locator(`[data-choice="${id}"]`).tap();
    await card.locator('.kit-multi__done').tap();
  } else {
    await blurControls(page);
    for (const id of ids) await page.keyboard.press(String(e.all.indexOf(id) + 1));
    await page.keyboard.press('Enter');
  }
}

async function hintButton(page: Page, tap: boolean, key: boolean): Promise<void> {
  if (key) {
    await blurControls(page);
    await page.keyboard.press('h');
  } else if (tap) await page.locator('.market-hint-button').tap();
  else await page.locator('.market-hint-button').click();
}

async function playRound(page: Page, index: number, tap: boolean): Promise<void> {
  await expect(page.locator(`.market-panel[data-round="${index}"]`)).toBeVisible();
  let s = await marketState(page);
  expect(s.round).toBe(index);
  if (index === 0) {
    // One miss: gentle feedback, a hint is offered; rungs 1-3, then the button is spent.
    await give(page, s.expected as Expected, false, tap);
    await expect(page.locator('.market-panel .feedback')).toHaveClass(/gentle/);
    await expect(page.locator('.market-hint-button')).toHaveClass(/offer/);
    for (const rung of ['1', '2', '3']) {
      await hintButton(page, tap, !tap && rung === '1');
      await expect(page.locator('.market-hint')).toHaveAttribute('data-rung', rung);
    }
    await expect(page.locator('.market-hint-button')).toBeDisabled();
  }
  if (index === 1) {
    // Three misses on one step show its answer; any later step is played, the round is
    // recorded as not correct.
    const step = (await marketState(page)).stepIndex;
    for (let miss = 0; miss < 3; miss++) {
      s = await marketState(page);
      expect(s.stepIndex).toBe(step);
      await give(page, s.expected as Expected, false, tap);
    }
    await expect.poll(async () => (await marketState(page)).stepIndex).not.toBe(step);
    s = await marketState(page);
    while (s.expected !== null) {
      await give(page, s.expected, true, tap);
      s = await marketState(page);
    }
    await expect(page.locator('.market-panel .feedback')).toContainText('Mình cùng xem lời giải');
    return;
  }
  s = await marketState(page);
  while (s.expected !== null) {
    await give(page, s.expected, true, tap);
    s = await marketState(page);
  }
  await expect(page.locator('.market-panel .feedback')).toContainText('Đúng rồi!');
}

/** Play one round answering every step correctly (no misses, no hints). */
async function playRoundCorrect(page: Page, tap: boolean): Promise<void> {
  let s = await marketState(page);
  let guard = 0;
  while (s.expected !== null && guard < 12) {
    await give(page, s.expected, true, tap);
    s = await marketState(page);
    guard += 1;
  }
  expect(s.expected).toBeNull();
  await expect(page.locator('.market-panel .feedback')).toContainText('Đúng rồi!');
}

test('the market: six rounds of clock skills, then the level is completed', async ({
  page,
}, info) => {
  const tap = !!info.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await enterMarket(page, tap);

  const skills = (await page.evaluate(() => window.__market?.skills())) ?? [];
  expect(skills).toHaveLength(ROUNDS);
  for (const id of skills) expect(CLOCK_SKILLS).toContain(id);
  // Touch screens: no key hints, every control in the panel is a ≥44 px target.
  await expect(page.locator('.market-keys')).toBeVisible({ visible: !tap });
  if (tap) {
    for (const box of await page
      .locator('.market-panel button:visible')
      .evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect()).map((r) => [r.width, r.height]),
      )) {
      expect(Math.min(...box)).toBeGreaterThanOrEqual(44);
    }
  }

  for (let i = 0; i < ROUNDS; i++) {
    await playRound(page, i, tap);
    await expect(page.locator('.market-next')).toBeFocused();
    if (tap) await page.locator('.market-next').tap();
    else await page.keyboard.press('Enter');
  }
  const done = page.locator('.market-done');
  await expect(done).toBeVisible();
  await expect(done).toContainText('Bạn đã mua sắm hết phiên chợ!');
  await expect(done.locator('.market-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
  test.info().annotations.push({ type: 'max-draw-calls', description: String(maxCalls) });

  const back = page.locator('.market-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('market')))
    .toBe('completed');
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return {
      completedAt: snap?.levelProgress.market?.completedAt ?? 0,
      keys: Object.keys(snap?.factStats ?? {}),
    };
  });
  expect(store.completedAt).toBeGreaterThan(0);
  for (const id of skills) expect(store.keys).toContain(`sk:${id}`);
  expect(await page.evaluate(() => window.__market)).toBeUndefined();
  expect(errors).toEqual([]);
});

test('stage 2 plays calendar rounds and ends with the stage celebration, not the closing card', async ({
  page,
}, info) => {
  const tap = !!info.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startWithStages(page, [2]);
  await expect(page.locator('#gate-market-label small')).toHaveText(
    'Đã hoàn thành ★★☆ · Chặng 2/5',
  );
  await enterMarketStage(page, tap);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);

  const skills = (await page.evaluate(() => window.__market?.skills())) ?? [];
  expect(skills).toHaveLength(ROUNDS);
  // Stage 2 drills the calendar skills: every round from the attempted calendar pool.
  for (const id of skills) expect(CALENDAR_SKILLS).toContain(id);

  for (let i = 0; i < ROUNDS; i++) {
    await playRoundCorrect(page, tap);
    await expect(page.locator('.market-next')).toBeFocused();
    if (tap) await page.locator('.market-next').tap();
    else await page.keyboard.press('Enter');
  }
  const done = page.locator('.market-done');
  await expect(done).toBeVisible();
  await expect(done.locator('.market-stage-line')).toHaveText(/Chặng 2\/5 · \d sao/);
  // Later stages pay no first-clear bonus.
  await expect(done.locator('.market-bonus')).toHaveCount(0);
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);

  const back = page.locator('.market-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  // The commit runs in the background after the level closes: poll the store until it lands.
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.market?.stageStars))
    .toEqual([2, expect.any(Number)]);
  const market = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.market);
  expect(market?.stageStars?.[0]).toBe(2);
  expect(market?.stageStars?.[1]).toBeGreaterThanOrEqual(1);
  // A stage-2 run never overwrites stage 1's stars (the level's `stars` stay 2).
  expect(market?.stars).toBe(2);
  await expect(page.locator('#gate-market-label small')).toHaveText(/Chặng 3\/5/);
  expect(errors).toEqual([]);
});
