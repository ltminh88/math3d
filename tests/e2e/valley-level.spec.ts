// Valley level "Thung Lũng Hình Học" (chapter 2 phase 06): seed chapter 1 + the garden, enter
// through the valley gate, play six rounds (midpoint stone, ê-ke on turned corners, choose-all by
// tapping shapes, circle parts, lifting a block, a revealed round) by taps only on phones and
// tablets and by keys on desktop, come back with the level completed, `sk:geo-*` stats stored and
// the workshop next on the quest card. Uses `window.__valley` / `__valleyPlan` / `__game`.
import { type Locator, type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 3 });

const DRAW_CALL_BUDGET = 60;
const PLAN = [
  { skillId: 'geo-midpoint', tier: 1 },
  { skillId: 'geo-right-angle', tier: 2 },
  { skillId: 'geo-shape-classify', tier: 2 },
  { skillId: 'geo-circle-parts', tier: 3 },
  { skillId: 'geo-solid-parts', tier: 3 },
  { skillId: 'geo-count-right-angles', tier: 1 },
] as const;
const SHOTS = process.env.VALLEY_SHOTS;

type ValleyState = NonNullable<ReturnType<NonNullable<Window['__valley']>['state']>>;
const state = (page: Page) => page.evaluate(() => window.__valley?.state()) as Promise<ValleyState>;
const blur = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function press(target: Locator, touch: boolean): Promise<void> {
  if (touch) await target.tap();
  else await target.click();
}

/** Keyboard path to a board target: arrows walk the targets, Enter taps the focused one. */
async function keyToTarget(page: Page, id: string): Promise<void> {
  await blur(page);
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('ArrowRight');
    const focused = await page.evaluate(
      () => (document.activeElement as HTMLElement | null)?.dataset.target,
    );
    if (focused === id) break;
  }
  await page.keyboard.press('Enter');
}

async function tapTarget(page: Page, id: string, touch: boolean): Promise<void> {
  if (touch) await page.locator(`[data-target="${id}"]`).tap();
  else await keyToTarget(page, id);
}

/** Index of the card button for `label` in the current step (keys 1-4 follow this order). */
const choiceIndex = (page: Page, label: string) =>
  page
    .locator('.valley-card .kit-step:last-child .kit-choices button')
    .evaluateAll((all, l) => all.findIndex((b) => b.textContent === l), label);

async function answerStep(page: Page, s: ValleyState, touch: boolean): Promise<void> {
  const step = s.step;
  const row = page.locator('.valley-card .kit-step:last-child');
  if (!step) throw new Error('no step');
  if (step.kind === 'number') {
    if (touch) {
      for (const d of String(step.answer))
        await row.locator('.kit-pad__key', { hasText: new RegExp(`^${d}$`) }).tap();
      await row.locator('.kit-pad__key--ok').tap();
    } else {
      await blur(page);
      await page.keyboard.type(String(step.answer));
      await page.keyboard.press('Enter');
    }
  } else if (step.kind === 'verdict') {
    if (touch) await row.locator(`[data-verdict="${step.answer}"]`).tap();
    else {
      await blur(page);
      await page.keyboard.press(step.answer ? '1' : '2');
    }
  } else if (step.kind === 'choice') {
    if (touch) await row.getByRole('button', { name: step.label, exact: true }).tap();
    else {
      await blur(page);
      await page.keyboard.press(String((await choiceIndex(page, step.label)) + 1));
    }
  } else {
    // Choose-all: shapes/blocks on the board stand for the options (touch), keys 1-4 on desktop.
    const boardOptions = s.targets.some((t) => t.startsWith('shape:') || t.startsWith('block:'));
    for (const option of step.options) {
      const i = Number(option.slice(1));
      if (touch && boardOptions) await page.locator(`[data-target$=":${i}"]`).tap();
      else if (touch) await row.locator(`[data-choice="${option}"]`).tap();
      else {
        await blur(page);
        await page.keyboard.press(String(i + 1));
      }
    }
    await expect
      .poll(async () => (await state(page)).selected.sort())
      .toEqual([...step.options].sort());
    if (touch) await row.locator('.kit-multi__done').tap();
    else await page.keyboard.press('Enter');
  }
}

async function wrongNumber(page: Page, value: number, touch: boolean): Promise<void> {
  await answerStep(page, { step: { kind: 'number', answer: value } } as ValleyState, touch);
}

async function playRound(page: Page, index: number, touch: boolean, project: string) {
  await expect(page.locator(`.valley-panel[data-round="${index}"]`)).toBeVisible();
  let s = await state(page);
  expect(s.skillId).toBe(PLAN[index]?.skillId);
  if (s.phase === 'action') {
    if (index === 0) {
      // A wrong stone: gentle words, a hint offered and taken (rung 1).
      await tapTarget(page, 'stone:1', touch);
      await expect(page.locator('.valley-panel .feedback')).toHaveClass(/gentle/);
      await expect(page.locator('.valley-hint-button')).toHaveClass(/offer/);
      if (touch) await page.locator('.valley-hint-button').tap();
      else {
        await blur(page);
        await page.keyboard.press('h');
      }
      await expect(page.locator('.valley-hint')).toHaveAttribute('data-rung', '1');
    }
    const corner = s.corners.find((c) => !c.fits) ?? s.corners[0];
    const target = s.action === 'set-square' && corner ? corner.id : (s.rightTargets[0] as string);
    await tapTarget(page, target, touch);
    s = await state(page);
    if (s.action === 'set-square') {
      expect(s.eke).toBe(target);
      await expect(page.locator(`[data-target="${target}"]`)).toHaveClass(
        corner?.fits ? /is-fit/ : /is-miss/,
      );
      if (index === 1) {
        // Turn the view: tap ⟳ (R on desktop).
        if (touch) await page.locator('.valley-turn').nth(1).tap();
        else await page.keyboard.press('r');
        await expect.poll(async () => (await state(page)).turnSteps).toBe(1);
        if (SHOTS) {
          // Let the eased turn settle so the canvas and the DOM targets show the same frame.
          await page.waitForTimeout(2500);
          await page.screenshot({ path: `${SHOTS}/valley-eke-${project}.png` });
        }
      }
    }
    expect(s.phase).toBe('steps');
  }
  if (index === 2 && SHOTS)
    await page.screenshot({ path: `${SHOTS}/valley-shapes-${project}.png` });
  if (index === PLAN.length - 1) {
    // Three misses reveal the round: the stone still comes back, not counted as correct.
    const answer = (s.step as { answer: number }).answer;
    await wrongNumber(page, answer + 1, touch);
    await wrongNumber(page, answer + 2, touch);
    await wrongNumber(page, answer + 3, touch);
    await expect(page.locator('.valley-panel .feedback')).toContainText('Mình cùng xem');
  } else {
    while (s.phase === 'steps') {
      await answerStep(page, s, touch);
      await expect
        .poll(async () => JSON.stringify((await state(page)).step))
        .not.toBe(JSON.stringify(s.step));
      s = await state(page);
    }
    await expect(page.locator('.valley-panel .feedback')).toContainText('Đúng rồi!');
  }
  await expect(page.locator('.valley-next')).toBeFocused();
  expect((await state(page)).gardenStones).toBe(index + 1);
}

test('the valley plays six geometry rounds by taps or keys and records sk:geo-* skills', async ({
  page,
}, info) => {
  const touch = info.project.use.hasTouch === true;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({
      bridgeComplete: true,
      completedLevels: ['field', 'forest', 'city', 'tower', 'garden'],
    }),
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('valley'))).toBe('open');
  await page.evaluate(
    (plan) => {
      window.__valleyPlan = plan.map((r) => ({ ...r }));
    },
    PLAN as unknown as { skillId: string; tier: 1 | 2 | 3 }[],
  );
  await page.evaluate(() => window.__game?.teleportToGate('valley'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Thung Lũng Hình Học');
  await press(interact, touch);
  await expect(page.locator('.valley-panel')).toBeVisible();
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);

  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  await expect(page.locator('.valley-keys')).toBeVisible({ visible: !coarse });
  if (coarse) {
    // Every control a child taps is at least 44 × 44 px.
    const small = await page.evaluate(() =>
      [...document.querySelectorAll('.level-layer button')]
        .filter((b) => (b as HTMLElement).offsetParent !== null)
        .map((b) => ({ r: b.getBoundingClientRect(), t: b.className }))
        .filter(({ r }) => r.width < 44 || r.height < 44)
        .map(({ t, r }) => `${t} ${Math.round(r.width)}x${Math.round(r.height)}`),
    );
    expect(small).toEqual([]);
  }
  const plan = (await page.evaluate(() => window.__valley?.plan())) ?? [];
  expect(plan.map((r) => r.skillId)).toEqual(PLAN.map((r) => r.skillId));

  for (let i = 0; i < PLAN.length; i++) {
    await playRound(page, i, touch, info.project.name);
    await press(page.locator('.valley-next'), touch);
  }
  const done = page.locator('.valley-done');
  await expect(done).toBeVisible();
  await expect(done).toContainText('Vườn đá dựng xong rồi!');
  await expect(done.locator('.valley-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  if (SHOTS) await page.screenshot({ path: `${SHOTS}/valley-done-${info.project.name}.png` });
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
  console.log(`valley max draw calls (${info.project.name}): ${maxCalls}`);

  const back = page.locator('.valley-back');
  if (touch) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('valley')))
    .toBe('completed');
  // The workshop gate is no longer locked (its level ships in phase 07).
  expect(await page.evaluate(() => window.__game?.gateStatus('workshop'))).not.toBe('locked');
  const keys = await page.evaluate(() => Object.keys(window.__game?.snapshot()?.factStats ?? {}));
  for (const { skillId } of PLAN) expect(keys).toContain(`sk:${skillId}`);
  await expect(page.locator('#quest-title')).toHaveText('Xưởng Đo Đạc');
  expect(await page.evaluate(() => window.__valley)).toBeUndefined();
  expect(errors).toEqual([]);
});
