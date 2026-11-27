// Workshop level "Xưởng Đo Đạc" (chapter 2 phase 07): seed the chain up to the valley, enter
// through the workshop gate, fill six orders (keys on desktop; taps only on the phone and both
// tablets) including the fence and the tiles of the same rectangle, a wrong answer with the hint
// ladder and a reveal after three misses, then come back with the level completed, `sk:meas-*`
// skills stored and the cave gate no longer locked. Uses `window.__workshop` / `__game`.
import { type Locator, type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const DRAW_CALL_BUDGET = 60;
const ROUNDS = 6;
const DONE = ['field', 'forest', 'city', 'tower', 'garden', 'valley'];
const SCREENS = process.env.WORKSHOP_SCREENS;

type State = NonNullable<ReturnType<NonNullable<Window['__workshop']>['state']>>;
type Planned = State['steps'][number];

const state = (page: Page) => page.evaluate(() => window.__workshop?.state()) as Promise<State>;

async function shot(page: Page, name: string, project: string): Promise<void> {
  if (!SCREENS) return;
  await page.screenshot({ path: `${SCREENS}/${name}-${project}.png` });
}

async function enterWorkshop(page: Page, touch: boolean): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(
    (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
    DONE,
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('workshop'))).toBe('open');
  expect(await page.evaluate(() => window.__game?.gateStatus('cave'))).toBe('locked');
  await page.evaluate(() => window.__game?.teleportToGate('workshop'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Xưởng Đo Đạc');
  if (touch) await interact.tap();
  else await page.keyboard.press('e');
  await expect(page.locator('.workshop-panel')).toBeVisible();
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

/** Visible enabled buttons in the panel smaller than 44 x 44 px. */
const smallTargets = (panel: Locator) =>
  panel.evaluate((root) =>
    [...root.querySelectorAll('button')]
      .filter((b) => !b.disabled && b.offsetParent !== null)
      .map((b) => ({ r: b.getBoundingClientRect(), t: b.textContent ?? '' }))
      .filter(({ r }) => r.width < 44 || r.height < 44)
      .map(({ r, t }) => `${t} ${Math.round(r.width)}x${Math.round(r.height)}`),
  );

const blur = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function press(target: Locator, touch: boolean): Promise<void> {
  await target.scrollIntoViewIfNeeded();
  if (touch) await target.tap();
  else await target.click();
}

/** Gives `value` for the live step (keys on desktop, taps on touch). */
async function give(page: Page, step: Planned, touch: boolean, wrong = false): Promise<void> {
  const row = page.locator('.workshop-panel .kit-step').last();
  if (step.kind === 'number') {
    const value = String(wrong ? step.answer + 1 : step.answer);
    if (touch) {
      for (const d of value)
        await press(row.locator('.kit-pad__key', { hasText: new RegExp(`^${d}$`) }), true);
      await press(row.locator('.kit-pad__key--ok'), true);
    } else {
      await blur(page);
      await page.keyboard.type(value);
      await page.keyboard.press('Enter');
    }
  } else if (step.kind === 'choice') {
    const index = wrong ? step.wrongIndex : step.index;
    if (touch) await press(row.locator('.kit-choices button').nth(index), true);
    else {
      await blur(page);
      await page.keyboard.press(String(index + 1));
    }
  } else if (step.kind === 'verdict') {
    const answer = wrong ? !step.answer : step.answer;
    await press(row.locator(`[data-verdict="${answer}"]`), touch);
  } else if (step.kind === 'multi') {
    for (const i of step.indexes) await press(row.locator('.kit-multi__option').nth(i), touch);
    await press(row.locator('.kit-multi__done'), touch);
  } else if (step.kind === 'order') {
    // Tap the bank tiles in the answer's order (reversed when wrong), then Xong.
    const order = wrong ? [...step.answer].reverse() : step.answer;
    for (const tileIndex of order) {
      const label = step.tiles[tileIndex];
      if (label === undefined) throw new Error('order answer index out of range');
      await press(
        row.locator('.kit-order__bank').getByRole('button', { name: label, exact: true }),
        touch,
      );
    }
    await press(row.locator('.kit-order__done'), touch);
  } else if (step.kind === 'match') {
    // Pair every left with its right (shifted by one when wrong), then Xong.
    const n = step.left.length;
    for (let i = 0; i < n; i++) {
      const rightIndex = wrong ? ((step.pairs[i] ?? 0) + 1) % n : (step.pairs[i] ?? 0);
      const leftLabel = step.left[i];
      const rightLabel = step.right[rightIndex];
      if (leftLabel === undefined || rightLabel === undefined)
        throw new Error('match pair index out of range');
      await press(
        row
          .locator('.kit-match__column')
          .first()
          .getByRole('button', { name: leftLabel, exact: true }),
        touch,
      );
      await press(
        row
          .locator('.kit-match__column')
          .nth(1)
          .getByRole('button', { name: rightLabel, exact: true }),
        touch,
      );
    }
    await press(row.locator('.kit-match__done'), touch);
  } else {
    throw new Error('workshop spec: set-clock steps are not played (workshop skills only)');
  }
}

async function useBoard(page: Page, s: State, touch: boolean): Promise<void> {
  if (s.station === 'fence') {
    // Tap one side, then walk on round the fence with the button (or →).
    await press(page.locator('.ws-side[role="button"]').first(), touch);
    for (let i = 0; i < 4 && !(await page.locator('.workshop-walk-next').isDisabled()); i++) {
      if (touch) await press(page.locator('.workshop-walk-next'), true);
      else {
        await blur(page);
        await page.keyboard.press('ArrowRight');
      }
    }
    await expect(page.locator('.workshop-walk')).toContainText('Đã đi hết một vòng!');
  }
  if (s.tiling) {
    // Every cell sits fully inside the panel (none clipped at the sides) and is a 44 px target.
    const outside = await page.locator('.workshop-panel').evaluate((panel) => {
      const box = panel.getBoundingClientRect();
      return [...panel.querySelectorAll<HTMLElement>('.ws-cell')]
        .map((c) => c.getBoundingClientRect())
        .filter((r) => r.left < box.left || r.right > box.right || r.width < 44 || r.height < 44)
        .map((r) => `${Math.round(r.left)}..${Math.round(r.right)} in ${box.left}..${box.right}`);
    });
    expect(outside).toEqual([]);
    await press(page.locator('.ws-cell').last(), touch);
    await press(page.locator('.ws-cell').first(), touch);
    if (touch) await press(page.locator('.workshop-place-row'), true);
    else {
      await blur(page);
      await page.keyboard.press(' ');
    }
    expect((await state(page)).tilesPlaced).toBeGreaterThan(1);
  }
}

async function playRound(page: Page, index: number, touch: boolean, project: string) {
  await expect(page.locator(`.workshop-panel[data-round="${index}"]`)).toBeVisible();
  let s = await state(page);
  expect(s.round).toBe(index);
  expect(await smallTargets(page.locator('.workshop-panel'))).toEqual([]);
  await useBoard(page, s, touch);
  await shot(page, `round-${index + 1}-${s.station}`, project);
  if (index === 0) {
    await give(page, s.steps[0] as Planned, touch, true);
    await expect(page.locator('.workshop-panel .feedback')).toHaveClass(/gentle/);
    const hint = page.locator('.workshop-hint-button');
    await expect(hint).toHaveClass(/offer/);
    for (const rung of ['1', '2', '3']) {
      if (touch) await press(hint, true);
      else {
        await blur(page);
        await page.keyboard.press('h');
      }
      await expect(page.locator('.workshop-hint')).toHaveAttribute('data-rung', rung);
    }
    await expect(hint).toBeDisabled();
  }
  if (index === 2) {
    // R42: a wrong first step on a tiles round shows a counting explanation for
    // the area skills. The other tiles skills keep the generic sentence — except
    // a meas-area-rect trap option, which shows its own misconception note, so
    // the negative branch only rules out an area sentence.
    await give(page, s.steps[0] as Planned, touch, true);
    const feedback = page.locator('.workshop-panel .feedback');
    await expect(feedback).toHaveClass(/gentle/);
    if (s.skillId === 'meas-area-count' || s.skillId === 'meas-area-equal') {
      await expect(feedback).toContainText(/Bạn đếm|Hai hình/);
    } else {
      await expect(feedback).not.toContainText(/Bạn đếm|Hai hình/);
    }
  }
  if (index === ROUNDS - 1) {
    // Three misses show the answer and move on (the order is recorded as not correct).
    for (let i = 0; i < 3; i++) await give(page, s.steps[s.stepIndex] as Planned, touch, true);
    await expect.poll(async () => (await state(page)).stepIndex).toBe(1);
  }
  s = await state(page);
  while (!s.roundComplete) {
    await give(page, s.steps[s.stepIndex] as Planned, touch);
    s = await state(page);
  }
  await expect(page.locator('.workshop-next')).toBeVisible();
  if (touch) await press(page.locator('.workshop-next'), true);
  else {
    await expect(page.locator('.workshop-next')).toBeFocused();
    await page.keyboard.press('Enter');
  }
}

test('the workshop fills six orders and records the measurement skills', async ({ page }, info) => {
  const touch = info.project.use.hasTouch === true;
  const project = info.project.name;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await enterWorkshop(page, touch);
  await shot(page, 'start', project);

  const plan = (await page.evaluate(() => window.__workshop?.plan())) ?? [];
  expect(plan).toHaveLength(ROUNDS);
  expect(plan.map((r) => r.station).slice(0, 3)).toEqual(['ruler', 'fence', 'tiles']);
  expect(plan[1]?.rect).not.toBeNull();
  expect(plan[1]?.rect).toEqual(plan[2]?.rect);
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  await expect(page.locator('.workshop-keys')).toBeVisible({ visible: !coarse && !touch });

  for (let i = 0; i < ROUNDS; i++) await playRound(page, i, touch, project);

  const done = page.locator('.workshop-done');
  await expect(done).toBeVisible();
  await expect(done).toContainText('Giao xong hết đơn hàng!');
  await expect(done).toContainText('Chặng 1/5');
  await expect(done.locator('.workshop-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  await shot(page, 'done', project);
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  info.annotations.push({ type: 'max-draw-calls', description: String(maxCalls) });
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);

  const back = page.locator('.workshop-back');
  if (touch) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('workshop')))
    .toBe('completed');
  // The commit runs in the background after the level closes: poll the store until it lands.
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.workshop?.stageStars))
    .toEqual([expect.any(Number)]);
  const workshop = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.workshop);
  expect(workshop?.stageStars?.[0]).toBeGreaterThanOrEqual(1);
  await expect(page.locator('#gate-workshop-label small')).toHaveText(/Chặng 2\/5/);
  // The cave opens next (it says "Sắp ra mắt" until its own level ships).
  expect(['open', 'coming-soon']).toContain(
    await page.evaluate(() => window.__game?.gateStatus('cave')),
  );
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return {
      completedAt: snap?.levelProgress.workshop?.completedAt ?? 0,
      keys: Object.keys(snap?.factStats ?? {}),
    };
  });
  expect(store.completedAt).toBeGreaterThan(0);
  for (const r of plan) expect(store.keys).toContain(`sk:${r.skillId}`);
  expect(await page.evaluate(() => window.__workshop)).toBeUndefined();
  expect(errors).toEqual([]);
});

// Stage 4 (phase 09, boost 3B): seed stages 1-3 done, enter stage 4 with the ruler
// forced to meas-len-mixed (box 1; the other stage-4 ruler candidates sit at box 5),
// so the stage plan decides the rounds. The ruler slot drills length (mixed joins
// cm↔mm), the fence and tiles keep the shared rectangle, the last two rounds are
// instruments, and only stage 4's stars are added.
test('stage 4 drills length (mixed) and the instruments and records only its own stage stars', async ({
  page,
}, info) => {
  const touch = info.project.use.hasTouch === true;
  const project = info.project.name;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(
    (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
    DONE,
  );
  await page.evaluate(() => window.__game?.seedStageProgress('workshop', [3, 3, 3]));
  // Stage 4's ruler drills length (3B): force meas-len-mixed (box 1) over the
  // other ruler candidates (box 5).
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'sk:meas-len-mixed': { box: 1, attempts: 1, correct: 0 },
      'sk:meas-len-choose-unit': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-len-ladder': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-len-convert': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-len-convert-far': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-len-compare': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-len-order': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-ruler-read': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-mm-convert': { box: 5, attempts: 5, correct: 5 },
    }),
  );
  await expect(page.locator('#gate-workshop-label small')).toHaveText(
    'Đã hoàn thành ★★★ · Chặng 4/5',
  );
  await page.evaluate(() => window.__game?.teleportToGate('workshop'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Xưởng Đo Đạc');
  if (touch) await interact.tap();
  else await page.keyboard.press('e');
  await expect(page.locator('.workshop-panel')).toBeVisible();
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);

  const plan = (await page.evaluate(() => window.__workshop?.plan())) ?? [];
  expect(plan).toHaveLength(ROUNDS);
  expect(plan[0]?.skillId).toBe('meas-len-mixed');
  expect(plan[1]?.skillId).toBe('meas-perimeter-rect');
  expect(plan[2]?.skillId).toBe('meas-area-rect');
  expect([
    'meas-perimeter-polygon',
    'meas-perimeter-square',
    'meas-wp-fence',
    'meas-area-count',
    'meas-area-square',
    'meas-area-equal',
  ]).toContain(plan[3]?.skillId);
  expect(new Set([plan[4]?.skillId, plan[5]?.skillId]).size).toBe(2);
  for (const r of plan.slice(4))
    expect([
      'meas-gram',
      'meas-ml',
      'meas-temperature',
      'meas-gram-calc',
      'meas-ml-calc',
      'meas-temperature-compare',
    ]).toContain(r.skillId);
  expect(plan[1]?.rect).not.toBeNull();
  expect(plan[1]?.rect).toEqual(plan[2]?.rect);

  for (let i = 0; i < ROUNDS; i++) await playRound(page, i, touch, project);

  const done = page.locator('.workshop-done');
  await expect(done).toBeVisible();
  await expect(done).toContainText('Giao xong hết đơn hàng!');
  await expect(done).toContainText('Chặng 4/5');
  // Later stages pay no first-clear bonus.
  await expect(done.locator('.workshop-bonus')).toHaveCount(0);
  await shot(page, 'done-stage-4', project);
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  info.annotations.push({ type: 'max-draw-calls', description: String(maxCalls) });
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
  console.log(`workshop stage 4 max draw calls (${project}): ${maxCalls}`);

  const back = page.locator('.workshop-back');
  if (touch) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('workshop')))
    .toBe('completed');
  // The commit runs in the background after the level closes: poll the store until it lands.
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.workshop?.stageStars))
    .toEqual([3, 3, 3, expect.any(Number)]);
  const workshop = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.workshop);
  expect(workshop?.stageStars?.[3]).toBeGreaterThanOrEqual(1);
  // A stage-4 run never overwrites the earlier stages' stars (the level's `stars` stay 3).
  expect(workshop?.stars).toBe(3);
  await expect(page.locator('#gate-workshop-label small')).toHaveText(/Chặng 5\/5/);
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return {
      completedAt: snap?.levelProgress.workshop?.completedAt ?? 0,
      keys: Object.keys(snap?.factStats ?? {}),
    };
  });
  expect(store.completedAt).toBeGreaterThan(0);
  for (const r of plan) expect(store.keys).toContain(`sk:${r.skillId}`);
  expect(await page.evaluate(() => window.__workshop)).toBeUndefined();
  expect(errors).toEqual([]);
});

// Stage 1 (boost, Phase 3B): seed meas-len-ladder first at the ruler — the other
// stage-1 ruler candidates sit at box 5 — so round 0 is a length item, played by
// taps like every other round, and its skill is recorded like the rest.
test('stage 1 reaches a length item at the ruler', async ({ page }, info) => {
  const touch = info.project.use.hasTouch === true;
  const project = info.project.name;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(
    (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
    DONE,
  );
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'sk:meas-len-ladder': { box: 1, attempts: 1, correct: 0 },
      'sk:meas-len-choose-unit': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-len-convert': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-ruler-read': { box: 5, attempts: 5, correct: 5 },
      'sk:meas-mm-convert': { box: 5, attempts: 5, correct: 5 },
    }),
  );
  await page.evaluate(() => window.__game?.teleportToGate('workshop'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Xưởng Đo Đạc');
  if (touch) await interact.tap();
  else await page.keyboard.press('e');
  await expect(page.locator('.workshop-panel')).toBeVisible();
  await shot(page, 'start-stage-1-length', project);

  const plan = (await page.evaluate(() => window.__workshop?.plan())) ?? [];
  expect(plan).toHaveLength(ROUNDS);
  expect(plan[0]?.skillId).toBe('meas-len-ladder');

  for (let i = 0; i < ROUNDS; i++) await playRound(page, i, touch, project);

  const done = page.locator('.workshop-done');
  await expect(done).toBeVisible();
  await expect(done).toContainText('Giao xong hết đơn hàng!');
  await expect(done).toContainText('Chặng 1/5');
  await expect(done.locator('.workshop-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  await shot(page, 'done-stage-1-length', project);

  const back = page.locator('.workshop-back');
  if (touch) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('workshop')))
    .toBe('completed');
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.workshop?.stageStars))
    .toEqual([expect.any(Number)]);
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return { keys: Object.keys(snap?.factStats ?? {}) };
  });
  for (const r of plan) expect(store.keys).toContain(`sk:${r.skillId}`);
  expect(await page.evaluate(() => window.__workshop)).toBeUndefined();
  expect(errors).toEqual([]);
});
