// Tower level "Tháp Toán Học" (city/tower phase 03): seed the first four stages, enter through
// the tower gate, climb seven floors (keys on desktop, taps on the phone), come back with the level
// completed, × and : facts stored and the closing quest card. Uses `window.__tower`/`__game`.
import { type Locator, type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const DRAW_CALL_BUDGET = 60;
const FLOORS = 7;

type TowerState = NonNullable<ReturnType<NonNullable<Window['__tower']>['state']>>;

async function startWithStages(page: Page, stageStars: number[]): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({
      bridgeComplete: true,
      completedLevels: ['field', 'forest', 'city'],
    }),
  );
  await page.evaluate((stars) => window.__game?.seedStageProgress('tower', stars), stageStars);
}

async function startAtTowerGate(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({
      bridgeComplete: true,
      completedLevels: ['field', 'forest', 'city'],
    }),
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('tower'))).toBe('open');
}

async function enterTower(page: Page, tap: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('tower'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Tháp Toán Học');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.tower-panel')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  // A few level frames have been rendered (SwiftShader is slow to draw the first ones).
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

const towerState = (page: Page) =>
  page.evaluate(() => window.__tower?.state()) as Promise<TowerState>;

/** Focus back on the page (the pad ignores keys aimed at other controls). */
const blurControls = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function give(page: Page, s: TowerState, value: number | boolean, tap: boolean) {
  if (s.step === 'number') {
    if (tap) {
      const pad = page.locator('.tower-panel .kit-pad');
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
  const index = s.step === 'choice' ? s.choices.indexOf(value as number) : value === true ? 0 : 1;
  if (tap) await page.locator(`.tower-answers .answer[data-index="${index}"]`).tap();
  else {
    await blurControls(page);
    await page.keyboard.press(String(index + 1));
  }
}

function wrongOf(s: TowerState): number | boolean {
  if (s.step === 'verdict') return !s.expected;
  if (s.step === 'choice') return s.choices.find((c) => c !== s.expected) as number;
  return (s.expected as number) + 1;
}

type PlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean };

async function typeNumber(page: Page, pad: Locator, value: number, tap: boolean): Promise<void> {
  if (tap) {
    for (const digit of String(value))
      await pad.getByRole('button', { name: digit, exact: true }).tap();
    await pad.getByRole('button', { name: 'Xong' }).tap();
  } else {
    await blurControls(page);
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
  }
}

async function press(page: Page, button: Locator, tap: boolean): Promise<void> {
  if (tap) await button.tap();
  else {
    await button.focus();
    await page.keyboard.press('Enter');
  }
}

/** Solves the shared step-kit reasoning round and returns its `sk:` fact key. */
async function solveReasoningRound(page: Page, tap: boolean): Promise<string> {
  const round = page.locator('.reasoning-round');
  await expect(round).toBeVisible();
  const hook = await page.evaluate(() => {
    const h = window.__reasoningRound;
    return h ? { factKey: h.factKey, steps: h.steps as PlannedStep[] } : null;
  });
  if (!hook) throw new Error('reasoning round hook missing');
  for (const [i, step] of hook.steps.entries()) {
    const row = round.locator('.kit-step').nth(i);
    if (step.kind === 'number') await typeNumber(page, row.locator('.kit-pad'), step.answer, tap);
    else if (step.kind === 'choice')
      await press(
        page,
        row.locator('.kit-choices').getByRole('button', { name: step.label, exact: true }),
        tap,
      );
    else if (step.kind === 'verdict')
      await press(page, row.locator(`[data-verdict="${step.answer}"]`), tap);
    else {
      for (const id of step.ids) await press(page, row.locator(`[data-choice="${id}"]`), tap);
      await press(page, row.locator('.kit-multi__done'), tap);
    }
    await expect(row).toHaveClass(/kit-step--done/);
  }
  await expect(round.locator('.feedback')).toHaveClass(/success/);
  const next = round.locator('.reasoning-round__next');
  if (tap) await next.tap();
  else {
    await expect(next).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect(round).toHaveCount(0);
  return hook.factKey;
}

async function playFloor(page: Page, index: number, tap: boolean): Promise<void> {
  await expect(page.locator(`.tower-panel[data-floor="${index}"]`)).toBeVisible();
  let s = await towerState(page);
  expect(s.floor).toBe(index);
  if (index === 0) {
    // One wrong answer: gentle feedback, a hint is offered and taken (rung 1).
    await give(page, s, wrongOf(s), tap);
    await expect(page.locator('.tower-panel .feedback')).toHaveClass(/gentle/);
    const hint = page.locator('.tower-hint-button');
    await expect(hint).toHaveClass(/offer/);
    if (tap) await hint.tap();
    else {
      // H asks for the hint, as in the city and the field.
      await blurControls(page);
      await page.keyboard.press('h');
    }
    await expect(page.locator('.tower-hint')).toHaveAttribute('data-rung', '1');
    // Rungs 2-4; after the last taught rung the button is spent, as in the field (QA m-4).
    for (const rung of ['2', '3', '4']) {
      await expect(hint).toBeEnabled();
      if (tap) await hint.tap();
      else await hint.click();
      await expect(page.locator('.tower-hint')).toHaveAttribute('data-rung', rung);
    }
    await expect(hint).toBeDisabled();
    s = await towerState(page);
  }
  if (s.step !== 'number') {
    // Answer cards are named by their value, plus their key hint where there is a keyboard
    // (touch screens get no "(phím 1)", phase 04).
    const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
    const name = await page.locator('.tower-answers .answer').first().getAttribute('aria-label');
    if (coarse) expect(name).not.toMatch(/phím/);
    else expect(name).toMatch(/\(phím 1\)$/);
  }
  while (s.step !== null) {
    await give(page, s, s.expected as number | boolean, tap);
    s = await towerState(page);
  }
  await expect(page.locator('.tower-panel .feedback')).toContainText('Đúng rồi!');
  await expect(page.locator('.tower-next')).toBeFocused();
  expect(s.litFloors).toBe(index + 1);
  expect(s.cameraFloor).toBe(index + 1);
}

test('the tower climbs seven floors and records × and : facts', async ({ page }, info) => {
  const tap = info.project.name === 'mobile-pixel';
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startAtTowerGate(page);
  await enterTower(page, tap);

  const formats = (await page.evaluate(() => window.__tower?.formats())) ?? [];
  const factKeys = (await page.evaluate(() => window.__tower?.factKeys())) ?? [];
  expect(formats).toHaveLength(FLOORS);
  for (let i = 1; i < formats.length; i++) expect(formats[i]).not.toBe(formats[i - 1]);
  expect(factKeys.some((k) => k.startsWith('mul:'))).toBe(true);
  expect(factKeys.some((k) => k.startsWith('div:'))).toBe(true);

  for (let i = 0; i < FLOORS; i++) {
    await playFloor(page, i, tap);
    if (tap) await page.locator('.tower-next').tap();
    else await page.keyboard.press('Enter');
  }
  const done = page.locator('.tower-done');
  await expect(done).toBeVisible();
  await expect(done).toContainText('Bạn đã lên tới đỉnh tháp!');
  await expect(done).toContainText('VLM');
  // First clear: the one-time bonus is shown with the floor rewards (QA m-12).
  await expect(done.locator('.tower-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  expect((await towerState(page)).cameraFloor).toBe(FLOORS);
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);

  const back = page.locator('.tower-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect(page.locator('#interact')).toContainText('Cổng Tháp Toán Học');
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('tower')))
    .toBe('completed');
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return {
      completedAt: snap?.levelProgress.tower?.completedAt ?? 0,
      keys: Object.keys(snap?.factStats ?? {}),
    };
  });
  expect(store.completedAt).toBeGreaterThan(0);
  expect(store.keys.some((k) => /^mul:\d+x\d+$/.test(k))).toBe(true);
  expect(store.keys.some((k) => /^div:\d+\/\d+$/.test(k))).toBe(true);
  for (const key of factKeys) expect(store.keys).toContain(key);
  // Chapter 1 done: the quest card opens chapter 2 at the garden.
  await expect(page.locator('#quest-title')).toHaveText('Khu Vườn Quy Luật');
  // The tower is the gate to chapter 2: the garden gate opens after stage 1, as today.
  expect(await page.evaluate(() => window.__game?.gateStatus('garden'))).toBe('open');
  expect(await page.evaluate(() => window.__tower)).toBeUndefined();
  expect(errors).toEqual([]);
});

test('stage 2 plays expression floors and records only its own stage stars', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tap = info.project.name === 'mobile-pixel';
  await startWithStages(page, [2]);
  await expect(page.locator('#gate-tower-label small')).toHaveText('Đã hoàn thành ★★☆ · Chặng 2/6');
  await enterTower(page, tap);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);

  // Six standard floors, then the expression floor (forced in stage 2, it takes the last slot).
  for (let i = 0; i < 6; i++) {
    await playFloor(page, i, tap);
    if (tap) await page.locator('.tower-next').tap();
    else await page.keyboard.press('Enter');
  }
  const key = await solveReasoningRound(page, tap);
  expect(['sk:expr-brackets', 'sk:expr-order', 'sk:tf-explain']).toContain(key);
  await expect(page.locator('.tower-done')).toContainText('Chặng 2/6');
  // Later stages pay no first-clear bonus.
  await expect(page.locator('.tower-done .tower-bonus')).toHaveCount(0);
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);

  const back = page.locator('.tower-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  // The commit runs in the background after the level closes: poll the store until it lands.
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.tower?.stageStars))
    .toEqual([2, expect.any(Number)]);
  const tower = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.tower);
  expect(tower?.stageStars?.[0]).toBe(2);
  expect(tower?.stageStars?.[1]).toBeGreaterThanOrEqual(1);
  // A stage-2 run never overwrites stage 1's stars (the level's `stars` stay 2).
  expect(tower?.stars).toBe(2);
  await expect(page.locator('#gate-tower-label small')).toHaveText(/Chặng 3\/6/);
  expect(errors).toEqual([]);
});

test('stage 4 plays word problems and records only its own stage stars', async ({ page }, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tap = info.project.name === 'mobile-pixel';
  await startWithStages(page, [2, 2, 2]);
  await expect(page.locator('#gate-tower-label small')).toHaveText('Đã hoàn thành ★★☆ · Chặng 4/6');
  await enterTower(page, tap);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);

  for (let i = 0; i < 6; i++) {
    await playFloor(page, i, tap);
    if (tap) await page.locator('.tower-next').tap();
    else await page.keyboard.press('Enter');
  }
  // Stage 4 swaps the expression line for the word-problem line.
  await expect(page.locator('.tower-guide')).toContainText('câu chuyện');
  const key = await solveReasoningRound(page, tap);
  expect(['sk:wp-times-then-add', 'sk:wp-divide-then-add', 'sk:wp-more-less-then-total']).toContain(
    key,
  );
  await expect(page.locator('.tower-done')).toContainText('Chặng 4/6');
  await expect(page.locator('.tower-done .tower-bonus')).toHaveCount(0);

  const back = page.locator('.tower-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.tower?.stageStars))
    .toEqual([2, 2, 2, expect.any(Number)]);
  const tower = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.tower);
  expect(tower?.stageStars?.[0]).toBe(2);
  expect(tower?.stageStars?.[1]).toBe(2);
  expect(tower?.stageStars?.[2]).toBe(2);
  expect(tower?.stageStars?.[3]).toBeGreaterThanOrEqual(1);
  expect(tower?.stars).toBe(2);
  await expect(page.locator('#gate-tower-label small')).toHaveText(/Chặng 5\/6/);
  expect(errors).toEqual([]);
});
