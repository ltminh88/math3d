// Cave level "Hang Đố Vui" (chapter 2 phase 08): seed chapter 1 and the garden, valley and
// workshop, enter through the cave gate, solve seven chambers (keys on desktop, taps only on the
// phone and both tablets), come back with the level completed, `sk:` skills stored and the quest
// card pointing at the market (chapter 3 opens after the cave). Uses `window.__cave`/`__game`.
// CAVE_SCREENS=<dir> saves screenshots.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const DRAW_CALL_BUDGET = 60;
const CHAMBERS = 7;
const BEFORE_CAVE = ['field', 'forest', 'city', 'tower', 'garden', 'valley', 'workshop'];

type CaveState = NonNullable<ReturnType<NonNullable<Window['__cave']>['state']>>;
type Expected = NonNullable<CaveState['expected']>;

const caveState = (page: Page) => page.evaluate(() => window.__cave?.state()) as Promise<CaveState>;
const blurControls = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function shot(page: Page, project: string, name: string): Promise<void> {
  const dir = process.env.CAVE_SCREENS;
  if (dir) await page.screenshot({ path: `${dir}/${project}-${name}.png` });
}

async function enterCave(page: Page, tap: boolean): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(
    (done) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: done }),
    BEFORE_CAVE,
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('cave'))).toBe('open');
  await page.evaluate(() => window.__game?.teleportToGate('cave'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Hang Đố Vui');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.cave-panel')).toBeVisible();
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
    BEFORE_CAVE,
  );
  // Attempts for the stage-2 pool: word problems attempted, plus one of each other kind, so
  // the emphasis plans from real attempts and never invents an unseen skill.
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'sk:wp-times-then-add': { attempts: 2, box: 2 },
      'sk:wp-divide-then-add': { attempts: 2, box: 1 },
      'sk:wp-more-less-then-total': { attempts: 1, box: 1 },
      'sk:div-rem-floor': { attempts: 2, box: 2 },
      'sk:choose-all-correct': { attempts: 1, box: 1 },
      'sk:tf-explain': { attempts: 2, box: 1 },
      'sk:expr-order': { attempts: 1, box: 1 },
      'sk:meas-wp-fence': { attempts: 1, box: 1 },
      'sk:geo-radius-diameter': { attempts: 1, box: 2 },
    }),
  );
  await page.evaluate((stars) => window.__game?.seedStageProgress('cave', stars), stageStars);
}

async function enterCaveStage(page: Page, tap: boolean): Promise<void> {
  await page.evaluate(() => window.__game?.teleportToGate('cave'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Hang Đố Vui');
  if (tap) await interact.tap();
  else await interact.click();
  await expect(page.locator('.cave-panel')).toBeVisible();
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

/** One answer to the current step, by taps or by keys. `right` false gives a wrong one. */
async function give(page: Page, e: Expected, right: boolean, tap: boolean): Promise<void> {
  const card = page.locator('.cave-card');
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
  } else if (tap) await page.locator('.cave-hint-button').tap();
  else await page.locator('.cave-hint-button').click();
}

async function playChamber(page: Page, index: number, tap: boolean, project: string) {
  await expect(page.locator(`.cave-panel[data-chamber="${index}"]`)).toBeVisible();
  let s = await caveState(page);
  expect(s.chamber).toBe(index);
  if (index === 0) {
    // One miss: gentle feedback, a hint is offered; rungs 1-3, then the button is spent.
    await give(page, s.expected as Expected, false, tap);
    await expect(page.locator('.cave-panel .feedback')).toHaveClass(/gentle/);
    await expect(page.locator('.cave-hint-button')).toHaveClass(/offer/);
    for (const rung of ['1', '2', '3']) {
      await hintButton(page, tap, !tap && rung === '1');
      await expect(page.locator('.cave-hint')).toHaveAttribute('data-rung', rung);
    }
    await expect(page.locator('.cave-hint-button')).toBeDisabled();
  }
  if (index === 1) {
    // Three misses on one step show its answer; any later step is played, the crystal still
    // lights and the chamber is recorded as not correct.
    const step = (await caveState(page)).stepIndex;
    for (let miss = 0; miss < 3; miss++) {
      s = await caveState(page);
      expect(s.stepIndex).toBe(step);
      await give(page, s.expected as Expected, false, tap);
    }
    await expect.poll(async () => (await caveState(page)).stepIndex).not.toBe(step);
    s = await caveState(page);
    while (s.expected !== null) {
      await give(page, s.expected, true, tap);
      s = await caveState(page);
    }
    await expect(page.locator('.cave-panel .feedback')).toContainText('Mình cùng xem lời giải');
    return;
  }
  s = await caveState(page);
  while (s.expected !== null) {
    if (s.format === 'choose-all' || (s.format === 'tf-explain' && s.stepIndex === 1)) {
      await shot(page, project, s.format === 'choose-all' ? 'multi-select' : 'explain-fix');
    }
    await give(page, s.expected, true, tap);
    s = await caveState(page);
  }
  await expect(page.locator('.cave-panel .feedback')).toContainText('Đúng rồi!');
}

/** Play one chamber answering every step correctly (no misses, no hints). */
async function playChamberCorrect(page: Page, tap: boolean): Promise<void> {
  let s = await caveState(page);
  let guard = 0;
  while (s.expected !== null && guard < 12) {
    await give(page, s.expected, true, tap);
    s = await caveState(page);
    guard += 1;
  }
  expect(s.expected).toBeNull();
  await expect(page.locator('.cave-panel .feedback')).toContainText('Đúng rồi!');
}

test('the cave: seven chambers of mixed reasoning, then the market quest card', async ({
  page,
}, info) => {
  const tap = !!info.project.use.hasTouch;
  const project = info.project.name;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await enterCave(page, tap);
  await shot(page, project, 'chamber-1');

  const formats = (await page.evaluate(() => window.__cave?.formats())) ?? [];
  const skills = (await page.evaluate(() => window.__cave?.skills())) ?? [];
  expect(formats).toHaveLength(CHAMBERS);
  for (let i = 1; i < formats.length; i++) expect(formats[i]).not.toBe(formats[i - 1]);
  for (const f of ['word', 'remainder', 'choose-all', 'tf-explain', 'geo-meas'] as const) {
    expect(formats).toContain(f);
  }
  // Touch screens: no key hints, every control in the panel is a ≥44 px target.
  await expect(page.locator('.cave-keys')).toBeVisible({ visible: !tap });
  if (tap) {
    for (const box of await page
      .locator('.cave-panel button:visible')
      .evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect()).map((r) => [r.width, r.height]),
      )) {
      expect(Math.min(...box)).toBeGreaterThanOrEqual(44);
    }
  }

  for (let i = 0; i < CHAMBERS; i++) {
    await playChamber(page, i, tap, project);
    await expect(page.locator('.cave-next')).toBeFocused();
    const s = await caveState(page);
    expect(s.litCrystals).toBe(i + 1);
    expect(s.cameraChamber).toBe(i + 1);
    if (tap) await page.locator('.cave-next').tap();
    else await page.keyboard.press('Enter');
  }
  const done = page.locator('.cave-done');
  await expect(done).toBeVisible();
  await expect(done).toContainText('Bạn đã giải hết câu đố trong hang!');
  await expect(done.locator('.cave-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  await shot(page, project, 'celebration');
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
  test.info().annotations.push({ type: 'max-draw-calls', description: String(maxCalls) });

  const back = page.locator('.cave-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect.poll(() => page.evaluate(() => window.__game?.gateStatus('cave'))).toBe('completed');
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return {
      completedAt: snap?.levelProgress.cave?.completedAt ?? 0,
      keys: Object.keys(snap?.factStats ?? {}),
    };
  });
  expect(store.completedAt).toBeGreaterThan(0);
  for (const id of skills) expect(store.keys).toContain(`sk:${id}`);
  // Chapter 2 done: the quest card points at the market (chapter 3 opens after the cave).
  await expect(page.locator('#quest-title')).toHaveText('Chợ Phiên Tí Hon');
  await shot(page, project, 'market-card');
  expect(await page.evaluate(() => window.__cave)).toBeUndefined();
  expect(errors).toEqual([]);
});

test('stage 2 plays word-problem chambers and ends with the stage celebration, not the closing card', async ({
  page,
}, info) => {
  const tap = !!info.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await startWithStages(page, [2]);
  await expect(page.locator('#gate-cave-label small')).toHaveText('Đã hoàn thành ★★☆ · Chặng 2/5');
  await enterCaveStage(page, tap);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);

  const formats = (await page.evaluate(() => window.__cave?.formats())) ?? [];
  const skills = (await page.evaluate(() => window.__cave?.skills())) ?? [];
  expect(formats).toHaveLength(CHAMBERS);
  // Stage 2 drills two-step word problems: two word chambers, from attempted skills only.
  expect(formats.filter((f) => f === 'word')).toHaveLength(2);
  for (let i = 1; i < formats.length; i++) expect(formats[i]).not.toBe(formats[i - 1]);
  const attempted = [
    'wp-times-then-add',
    'wp-divide-then-add',
    'wp-more-less-then-total',
    'div-rem-floor',
    'choose-all-correct',
    'tf-explain',
    'expr-order',
    'meas-wp-fence',
    'geo-radius-diameter',
  ];
  for (const id of skills) expect(attempted).toContain(id);

  for (let i = 0; i < CHAMBERS; i++) {
    await playChamberCorrect(page, tap);
    await expect(page.locator('.cave-next')).toBeFocused();
    const s = await caveState(page);
    expect(s.litCrystals).toBe(i + 1);
    if (tap) await page.locator('.cave-next').tap();
    else await page.keyboard.press('Enter');
  }
  const done = page.locator('.cave-done');
  await expect(done).toBeVisible();
  await expect(done.locator('.cave-stage-line')).toHaveText(/Chặng 2\/5 · \d sao/);
  // Later stages pay no first-clear bonus, and the chain-closing line is stage 1 only.
  await expect(done.locator('.cave-bonus')).toHaveCount(0);
  await expect(done).not.toContainText('Bạn đã đi hết chương 2, giỏi quá!');
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);

  const back = page.locator('.cave-back');
  if (tap) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  // The commit runs in the background after the level closes: poll the store until it lands.
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.cave?.stageStars))
    .toEqual([2, expect.any(Number)]);
  const cave = await page.evaluate(() => window.__game?.snapshot()?.levelProgress.cave);
  expect(cave?.stageStars?.[0]).toBe(2);
  expect(cave?.stageStars?.[1]).toBeGreaterThanOrEqual(1);
  // A stage-2 run never overwrites stage 1's stars (the level's `stars` stay 2).
  expect(cave?.stars).toBe(2);
  await expect(page.locator('#gate-cave-label small')).toHaveText(/Chặng 3\/5/);
  expect(errors).toEqual([]);
});
