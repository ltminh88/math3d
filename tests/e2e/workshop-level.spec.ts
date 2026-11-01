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
  } else {
    for (const i of step.indexes) await press(row.locator('.kit-multi__option').nth(i), touch);
    await press(row.locator('.kit-multi__done'), touch);
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
  await expect(done.locator('.workshop-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  await shot(page, 'done', project);
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
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
