// City level "Thành Phố Con Số" (phase 02 of the city/tower plan): seed field + forest, enter
// through the city gate, play the five rounds (keyboard on desktop, taps on the phone: parcel to
// a house in 3D, house cards, floors of the building, the number pad), come back to the gate with
// the level completed and facts of tables 6-9 in the store; draw calls are read through the
// test build (`window.__game`, `window.__city`, `.level-layer` data). Leaks: city-level-leak.
import { type Locator, type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const DRAW_CALL_BUDGET = 60;
const cityState = (page: Page) => page.evaluate(() => window.__city?.state());

async function startAtCityGate(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field', 'forest'] }),
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('city'))).toBe('open');
}

async function enterCity(page: Page, tap: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('city'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Thành Phố Con Số');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.city-panel')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

async function press(page: Page, button: Locator, tap: boolean): Promise<void> {
  if (tap) await button.tap();
  else {
    await button.focus();
    await page.keyboard.press('Enter');
  }
}

/** Focus back on the page (the pad and the 3D keyboard layer ignore keys aimed at controls). */
const blurControls = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function tapAt(page: Page, id: string): Promise<void> {
  const point = await page.evaluate((target) => window.__city?.point(target), id);
  if (!point) throw new Error(`no screen point for ${id}`);
  await page.touchscreen.tap(point.x, point.y);
}

async function pickCard(page: Page, value: number, tap: boolean): Promise<void> {
  const card = page.locator(`.city-choices [data-value="${value}"]`);
  if (tap) await card.tap();
  else await page.keyboard.press(String(await card.locator('kbd').textContent()));
}

async function typeAnswer(page: Page, value: number, tap: boolean): Promise<void> {
  if (tap) {
    const pad = page.locator('.city-panel .kit-pad');
    for (const digit of String(value)) {
      await pad.getByRole('button', { name: digit, exact: true }).tap();
    }
    await pad.getByRole('button', { name: 'Xong' }).tap();
  } else {
    await blurControls(page);
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
  }
}

/**
 * Delivers the parcel in 3D: tap parcel then house, or arrows + Enter (WCAG 2.5.7). `zoneIndex`
 * is the house's place among the houses still open (one answered wrong is out of play).
 */
async function deliverIn3d(page: Page, house: number, tap: boolean, zoneIndex = house) {
  if (tap) {
    await tapAt(page, 'parcel:0');
    await tapAt(page, `house:${house}`);
    return;
  }
  await blurControls(page);
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
  for (let i = 0; i < zoneIndex; i++) await page.keyboard.press('ArrowRight');
  await page.keyboard.press('Enter');
}

async function playRound(page: Page, index: number, tap: boolean, firstWindows: boolean) {
  await page.waitForFunction((i) => window.__city?.state().index === i, index);
  const panel = page.locator(`.city-panel[data-round="${index}"]`);
  await expect(panel).toBeVisible();
  const state = await cityState(page);
  if (!state) throw new Error('city state missing');
  const { kind, product, houses } = state;
  if (kind === 'deliver' && index === 0) {
    // One wrong house first: gentle feedback, the hint is offered and taken (rung 1).
    const wrong = houses.find((n) => n !== product) as number;
    await pickCard(page, wrong, tap);
    await expect(page.locator('.city-panel .feedback')).toHaveClass(/gentle/);
    await expect(page.locator('.city-choices .answer.incorrect')).toHaveCount(1);
    await expect(page.locator('.city-hint-button')).toHaveClass(/offer/);
    await press(page, page.locator('.city-hint-button'), tap);
    await expect(page.locator('.city-hint')).toHaveAttribute('data-rung', '1');
    const right = houses.indexOf(product);
    const open = houses.map((_, i) => i).filter((i) => houses[i] !== wrong);
    await deliverIn3d(page, right, tap, open.indexOf(right));
  } else if (kind === 'windows') {
    if (firstWindows) {
      // Light the bottom floor in 3D (tap, or arrows + Enter), then one more with the button.
      if (tap) await tapAt(page, 'floor:0');
      else {
        await blurControls(page);
        await page.keyboard.press('ArrowRight');
        await page.keyboard.press('Enter');
      }
      await expect(panel).toHaveAttribute('data-lit', '1');
      await press(page, page.locator('.city-light'), tap);
      await expect(panel).toHaveAttribute('data-lit', '2');
      // Lit floors only: never a window total, which would give the answer away.
      await expect(page.locator('.city-count')).toHaveText(`2/${state.other} tầng sáng`);
      // Two hints: the 5 + rest split shows colour bands on the building.
      for (let i = 0; i < 2; i++) await press(page, page.locator('.city-hint-button'), tap);
      await expect(page.locator('.city-hint')).toHaveAttribute('data-rung', '2');
      await expect(page.locator('.city-chip--band-a')).toHaveCount(1);
    }
    await typeAnswer(page, product, tap);
  } else {
    await pickCard(page, product, tap);
  }
  await expect(page.locator('.city-panel .feedback')).toContainText('Đúng rồi!');
  // Keyboard users land on "Tiếp tục" (a tap on the canvas leaves focus on the page).
  if (!tap) await expect(page.locator('.city-next')).toBeFocused();
  return { kind, factKey: state.factKey };
}

async function typePadNumber(page: Page, pad: Locator, value: number, tap: boolean) {
  if (tap) {
    for (const digit of String(value)) {
      await pad.getByRole('button', { name: digit, exact: true }).tap();
    }
    await pad.getByRole('button', { name: 'Xong' }).tap();
  } else {
    await blurControls(page);
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
  }
}

type PlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean };

/**
 * Solves the reasoning round on screen: one hint, then every step; returns its key.
 * (Same shape as reasoning-rounds.spec.ts: the round is the shared step-kit panel.)
 */
async function solveReasoningRound(page: Page, tap: boolean): Promise<string> {
  const round = page.locator('.reasoning-round');
  await expect(round).toBeVisible();
  const hook = await page.evaluate(() => {
    const h = window.__reasoningRound;
    return h ? { factKey: h.factKey, steps: h.steps as PlannedStep[] } : null;
  });
  if (!hook) throw new Error('reasoning round hook missing');
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  if (coarse) await expect(round).not.toContainText(/phím|Enter|nhấn [A-Z]\b/);
  if (tap) await round.locator('.reasoning-round__hint').tap();
  else {
    await blurControls(page);
    await page.keyboard.press('h');
  }
  await expect(round.locator('.reasoning-round__hint-area')).toBeVisible();
  for (const [i, step] of hook.steps.entries()) {
    const row = round.locator('.kit-step').nth(i);
    const small = await round.evaluate((root) =>
      [...root.querySelectorAll('button')]
        .filter((b) => !b.hidden && b.offsetParent !== null)
        .map((b) => ({ r: b.getBoundingClientRect(), t: b.textContent ?? '' }))
        .filter(({ r }) => r.width < 44 || r.height < 44)
        .map(({ t, r }) => `${t} ${Math.round(r.width)}x${Math.round(r.height)}`),
    );
    expect(small, `targets of step ${i}`).toEqual([]);
    if (step.kind === 'number')
      await typePadNumber(page, row.locator('.kit-pad'), step.answer, tap);
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

async function startWithStages(page: Page, stageStars: number[]): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field', 'forest'] }),
  );
  await page.evaluate((stars) => window.__game?.seedStageProgress('city', stars), stageStars);
}

async function playStandardRounds(page: Page, tap: boolean, count: number): Promise<void> {
  const played: { kind: string }[] = [];
  for (let i = 0; i < count; i++) {
    const firstWindows = !played.some((r) => r.kind === 'windows');
    played.push(await playRound(page, i, tap, firstWindows));
    const next = page.locator('.city-next');
    if (tap) await next.tap();
    else await page.keyboard.press('Enter');
  }
}

async function leaveCity(page: Page, tap: boolean): Promise<void> {
  const back = page.locator('.city-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect(page.locator('#interact')).toContainText('Cổng Thành Phố Con Số');
}

test('the city level plays five rounds and records facts of tables 6-9', async ({ page }, info) => {
  const tap = info.project.name === 'mobile-pixel';
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startAtCityGate(page);
  await enterCity(page, tap);

  const played: { kind: string; factKey: string }[] = [];
  for (let i = 0; i < 5; i++) {
    const firstWindows = !played.some((r) => r.kind === 'windows');
    played.push(await playRound(page, i, tap, firstWindows));
    const next = page.locator('.city-next');
    if (tap) await next.tap();
    else await page.keyboard.press('Enter');
  }
  expect(played.map((r) => r.kind)).toContain('windows');
  expect(played.map((r) => r.kind)).toContain('deliver');
  await expect(page.locator('.city-done')).toContainText('VLM');
  // QA m-12: the first clear shows the one-time bonus.
  await expect(page.locator('.city-done .city-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  const shownStars = Number(await page.locator('.city-stars').getAttribute('data-stars'));
  const layer = await page
    .locator('.level-layer')
    .evaluate((el) => ({ ...(el as HTMLElement).dataset }));
  const maxCalls = Number(layer.maxDrawCalls);
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
  info.annotations.push({ type: 'max-draw-calls', description: String(maxCalls) });

  const back = page.locator('.city-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect(page.locator('#interact')).toContainText('Cổng Thành Phố Con Số');
  await expect.poll(() => page.evaluate(() => window.__game?.gateStatus('city'))).toBe('completed');
  // The city opens the tower gate.
  expect(await page.evaluate(() => window.__game?.gateStatus('tower'))).toBe('open');
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return {
      city: snap?.levelProgress.city,
      factKeys: Object.keys(snap?.factStats ?? {}),
    };
  });
  expect(store.city?.completedAt ?? 0).toBeGreaterThan(0);
  expect(store.city?.stars ?? 0).toBeGreaterThan(0);
  expect(shownStars).toBe(store.city?.stars);
  for (const { factKey } of played) {
    expect(factKey).toMatch(/^mul:\d+x\d+$/);
    const factors = factKey.slice(4).split('x').map(Number);
    expect(factors.some((f) => f >= 6 && f <= 9)).toBe(true);
    expect(store.factKeys).toContain(factKey);
  }
  expect(errors).toEqual([]);
});

test('stage 2 plays reverse rounds and records only its own stage stars', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tap = info.project.name === 'mobile-pixel';
  await startWithStages(page, [2]);
  await expect(page.locator('#gate-city-label small')).toHaveText('Đã hoàn thành ★★☆ · Chặng 2/6');
  await enterCity(page, tap);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);

  await playStandardRounds(page, tap, 5);
  await expect(page.locator('.city-done')).toContainText('Chặng 2/6');
  // Later stages pay no first-clear bonus.
  await expect(page.locator('.city-done .city-bonus')).toHaveCount(0);
  const layer = await page
    .locator('.level-layer')
    .evaluate((el) => ({ ...(el as HTMLElement).dataset }));
  const maxCalls = Number(layer.maxDrawCalls);
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
  info.annotations.push({ type: 'max-draw-calls', description: String(maxCalls) });
  await leaveCity(page, tap);

  // The commit runs in the background after the level closes: poll the store until it lands.
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.city?.stageStars))
    .toEqual([2, expect.any(Number)]);
  const city = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.city);
  expect(city?.stageStars?.[0]).toBe(2);
  expect(city?.stageStars?.[1]).toBeGreaterThanOrEqual(1);
  // A stage-2 run never overwrites stage 1's stars (the level's `stars` stay 2).
  expect(city?.stars).toBe(2);
  await expect(page.locator('#gate-city-label small')).toHaveText(/Chặng 3\/6/);
  expect(errors).toEqual([]);
});

test('stage 3 plays the forced compare round and records only its own stage stars', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const tap = info.project.name === 'mobile-pixel';
  await startWithStages(page, [2, 2]);
  await expect(page.locator('#gate-city-label small')).toHaveText('Đã hoàn thành ★★☆ · Chặng 3/6');
  await enterCity(page, tap);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);

  // Four standard rounds, then the forced compare round takes the last slot.
  await playStandardRounds(page, tap, 4);
  const key = await solveReasoningRound(page, tap);
  expect(['sk:wp-times-compare', 'sk:unknown-mul-div']).toContain(key);
  await expect(page.locator('.city-done')).toBeVisible();
  await expect(page.locator('.city-done')).toContainText('Chặng 3/6');
  await expect(page.locator('.city-done .city-bonus')).toHaveCount(0);
  const layer = await page
    .locator('.level-layer')
    .evaluate((el) => ({ ...(el as HTMLElement).dataset }));
  const maxCalls = Number(layer.maxDrawCalls);
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
  info.annotations.push({ type: 'max-draw-calls', description: String(maxCalls) });
  await leaveCity(page, tap);

  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.city?.stageStars))
    .toEqual([2, 2, expect.any(Number)]);
  const city = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.city);
  expect(city?.stageStars?.[0]).toBe(2);
  expect(city?.stageStars?.[1]).toBe(2);
  expect(city?.stageStars?.[2]).toBeGreaterThanOrEqual(1);
  expect(city?.stars).toBe(2);
  await expect(page.locator('#gate-city-label small')).toHaveText(/Chặng 4\/6/);
  // The compare round is recorded under its `sk:` key.
  await expect
    .poll(() => page.evaluate((k) => window.__game?.snapshot()?.factStats[k]?.attempts ?? 0, key))
    .toBeGreaterThanOrEqual(1);
  expect(errors).toEqual([]);
});
