// Numberfort level "Lâu Đài Số" (chapter 3 phase 20): seed chapter 1 and 2, enter through
// the numberfort gate, play six rounds of numbers-to-10000 skills (stage 1), come back with
// the level completed, `sk:` skills stored and the stage-1 stars. Long numbers render
// SGK-grouped, so the board never scrolls sideways on a phone. Uses `window.__numberfort` /
// `window.__game`. The chain stays at the cave in this PR — chapter 3 joins the quest chain
// in phase 21 (reviewer-owned), so no quest-card assertion for numberfort here.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const DRAW_CALL_BUDGET = 60;
const ROUNDS = 6;
const BEFORE_NUMBERFORT = [
  'field',
  'forest',
  'city',
  'tower',
  'garden',
  'valley',
  'workshop',
  'cave',
];
const STAGE1_SKILLS = [
  'num-read-write-1000',
  'num-place-value-1000',
  'num-neighbors-1000',
  'num-compare-1000',
  'num-order-1000',
  'num-sequence-1000',
  'num-read-write-10000',
  'num-place-value-10000',
  'num-compare-10000',
  'num-order-10000',
];
const STAGE2_SKILLS = [
  'round-tens',
  'round-hundreds',
  'round-thousands',
  'round-ten-thousands',
  'round-which-place',
  'roman-to-number',
  'number-to-roman',
  'roman-sequence',
];

type NumberfortState = NonNullable<ReturnType<NonNullable<Window['__numberfort']>['state']>>;
type Expected = NonNullable<NumberfortState['expected']>;

const numberfortState = (page: Page) =>
  page.evaluate(() => window.__numberfort?.state()) as Promise<NumberfortState>;
const blurControls = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function enterNumberfort(page: Page, tap: boolean): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(
    (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
    BEFORE_NUMBERFORT,
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('numberfort'))).toBe('open');
  await page.evaluate(() => window.__game?.teleportToGate('numberfort'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Lâu Đài Số');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.numberfort-panel')).toBeVisible();
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
    BEFORE_NUMBERFORT,
  );
  // Attempts for the stage-2 pool: the rounding and Roman skills, so the stage-2 plan
  // plays them.
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'sk:round-tens': { attempts: 2, box: 2 },
      'sk:round-hundreds': { attempts: 2, box: 1 },
      'sk:round-thousands': { attempts: 1, box: 1 },
      'sk:round-ten-thousands': { attempts: 2, box: 2 },
      'sk:round-which-place': { attempts: 1, box: 1 },
      'sk:roman-to-number': { attempts: 2, box: 1 },
      'sk:number-to-roman': { attempts: 1, box: 1 },
      'sk:roman-sequence': { attempts: 2, box: 2 },
    }),
  );
  await page.evaluate((stars) => window.__game?.seedStageProgress('numberfort', stars), stageStars);
}

async function enterNumberfortStage(page: Page, tap: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('numberfort'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Lâu Đài Số');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.numberfort-panel')).toBeVisible();
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

/** One answer to the current step, by taps or by keys. `right` false gives a wrong one. */
async function give(page: Page, e: Expected, right: boolean, tap: boolean): Promise<void> {
  const card = page.locator('.numberfort-card');
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
    throw new Error('numberfort spec: set-clock steps are not played (numberfort skills only)');
  if (e.kind !== 'multi')
    throw new Error(`numberfort spec: ${e.kind} steps are not played (numberfort skills only)`);
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
  } else if (tap) await page.locator('.numberfort-hint-button').tap();
  else await page.locator('.numberfort-hint-button').click();
}

async function playRound(page: Page, index: number, tap: boolean): Promise<void> {
  await expect(page.locator(`.numberfort-panel[data-round="${index}"]`)).toBeVisible();
  let s = await numberfortState(page);
  expect(s.round).toBe(index);
  if (index === 0) {
    // One miss: gentle feedback, a hint is offered; rungs 1-3, then the button is spent.
    await give(page, s.expected as Expected, false, tap);
    await expect(page.locator('.numberfort-panel .feedback')).toHaveClass(/gentle/);
    await expect(page.locator('.numberfort-hint-button')).toHaveClass(/offer/);
    for (const rung of ['1', '2', '3']) {
      await hintButton(page, tap, !tap && rung === '1');
      await expect(page.locator('.numberfort-hint')).toHaveAttribute('data-rung', rung);
    }
    await expect(page.locator('.numberfort-hint-button')).toBeDisabled();
  }
  if (index === 1) {
    // Three misses on one step show its answer; any later step is played, the round is
    // recorded as not correct.
    const step = (await numberfortState(page)).stepIndex;
    for (let miss = 0; miss < 3; miss++) {
      s = await numberfortState(page);
      expect(s.stepIndex).toBe(step);
      await give(page, s.expected as Expected, false, tap);
    }
    await expect.poll(async () => (await numberfortState(page)).stepIndex).not.toBe(step);
    s = await numberfortState(page);
    while (s.expected !== null) {
      await give(page, s.expected, true, tap);
      s = await numberfortState(page);
    }
    await expect(page.locator('.numberfort-panel .feedback')).toContainText(
      'Mình cùng xem lời giải',
    );
    return;
  }
  s = await numberfortState(page);
  while (s.expected !== null) {
    await give(page, s.expected, true, tap);
    s = await numberfortState(page);
  }
  await expect(page.locator('.numberfort-panel .feedback')).toContainText('Đúng rồi!');
}

/** Play one round answering every step correctly (no misses, no hints). */
async function playRoundCorrect(page: Page, tap: boolean): Promise<void> {
  let s = await numberfortState(page);
  let guard = 0;
  while (s.expected !== null && guard < 12) {
    await give(page, s.expected, true, tap);
    s = await numberfortState(page);
    guard += 1;
  }
  expect(s.expected).toBeNull();
  await expect(page.locator('.numberfort-panel .feedback')).toContainText('Đúng rồi!');
}

test('the numberfort: six rounds of numbers-to-10000 skills, then the level is completed', async ({
  page,
}, info) => {
  const tap = !!info.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await enterNumberfort(page, tap);

  const skills = (await page.evaluate(() => window.__numberfort?.skills())) ?? [];
  expect(skills).toHaveLength(ROUNDS);
  for (const id of skills) expect(STAGE1_SKILLS).toContain(id);
  // Touch screens: no key hints, every control in the panel is a ≥44 px target.
  await expect(page.locator('.numberfort-keys')).toBeVisible({ visible: !tap });
  if (tap) {
    for (const box of await page
      .locator('.numberfort-panel button:visible')
      .evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect()).map((r) => [r.width, r.height]),
      )) {
      expect(Math.min(...box)).toBeGreaterThanOrEqual(44);
    }
    // Long numbers stay on the board: the page never scrolls sideways on a phone, and the
    // panel itself stays inside the viewport.
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true);
    const panel = await page.locator('.numberfort-panel').boundingBox();
    const viewport = page.viewportSize();
    expect(panel).not.toBeNull();
    expect(panel?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((panel?.x ?? 0) + (panel?.width ?? 0)).toBeLessThanOrEqual(viewport?.width ?? 0);
  }

  for (let i = 0; i < ROUNDS; i++) {
    await playRound(page, i, tap);
    await expect(page.locator('.numberfort-next')).toBeFocused();
    if (tap) await page.locator('.numberfort-next').tap();
    else await page.keyboard.press('Enter');
  }
  const done = page.locator('.numberfort-done');
  await expect(done).toBeVisible();
  await expect(done).toContainText('Bạn đã xây xong lâu đài số!');
  await expect(done.locator('.numberfort-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
  test.info().annotations.push({ type: 'max-draw-calls', description: String(maxCalls) });

  const back = page.locator('.numberfort-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('numberfort')))
    .toBe('completed');
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return {
      completedAt: snap?.levelProgress.numberfort?.completedAt ?? 0,
      keys: Object.keys(snap?.factStats ?? {}),
    };
  });
  expect(store.completedAt).toBeGreaterThan(0);
  for (const id of skills) expect(store.keys).toContain(`sk:${id}`);
  expect(await page.evaluate(() => window.__numberfort)).toBeUndefined();
  expect(errors).toEqual([]);
});

test('stage 2 plays rounding and Roman rounds and ends with the stage celebration, not the closing card', async ({
  page,
}, info) => {
  const tap = !!info.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startWithStages(page, [2]);
  await expect(page.locator('#gate-numberfort-label small')).toHaveText(
    'Đã hoàn thành ★★☆ · Chặng 2/5',
  );
  await enterNumberfortStage(page, tap);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);

  const skills = (await page.evaluate(() => window.__numberfort?.skills())) ?? [];
  expect(skills).toHaveLength(ROUNDS);
  // Stage 2 drills the rounding and Roman skills: every round from the attempted pool.
  for (const id of skills) expect(STAGE2_SKILLS).toContain(id);

  for (let i = 0; i < ROUNDS; i++) {
    await playRoundCorrect(page, tap);
    await expect(page.locator('.numberfort-next')).toBeFocused();
    if (tap) await page.locator('.numberfort-next').tap();
    else await page.keyboard.press('Enter');
  }
  const done = page.locator('.numberfort-done');
  await expect(done).toBeVisible();
  await expect(done.locator('.numberfort-stage-line')).toHaveText(/Chặng 2\/5 · \d sao/);
  // Later stages pay no first-clear bonus.
  await expect(done.locator('.numberfort-bonus')).toHaveCount(0);
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);

  const back = page.locator('.numberfort-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  // The commit runs in the background after the level closes: poll the store until it lands.
  await expect
    .poll(() =>
      page.evaluate(() => window.__game?.snapshot()?.levelProgress.numberfort?.stageStars),
    )
    .toEqual([2, expect.any(Number)]);
  const numberfort = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.numberfort);
  expect(numberfort?.stageStars?.[0]).toBe(2);
  expect(numberfort?.stageStars?.[1]).toBeGreaterThanOrEqual(1);
  // A stage-2 run never overwrites stage 1's stars (the level's `stars` stay 2).
  expect(numberfort?.stars).toBe(2);
  await expect(page.locator('#gate-numberfort-label small')).toHaveText(/Chặng 3\/5/);
  expect(errors).toEqual([]);
});
