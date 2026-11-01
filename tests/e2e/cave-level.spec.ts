// Cave level "Hang Đố Vui" (chapter 2 phase 08): seed chapter 1 and the garden, valley and
// workshop, enter through the cave gate, solve seven chambers (keys on desktop, taps only on the
// phone and both tablets), come back with the level completed, `sk:` skills stored and the quest
// card's closing card. Uses `window.__cave`/`__game`. CAVE_SCREENS=<dir> saves screenshots.
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
    // Three misses reveal the worked answer; the crystal still lights.
    for (let miss = 0; miss < 3; miss++) {
      s = await caveState(page);
      await give(page, s.expected as Expected, false, tap);
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

test('the cave: seven chambers of mixed reasoning, then the closing quest card', async ({
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
  // Chapter 2 done: the quest card shows its closing card.
  await expect(page.locator('#quest-title')).toHaveText('Bạn đã qua cả chín chặng!');
  await shot(page, project, 'closing-card');
  expect(await page.evaluate(() => window.__cave)).toBeUndefined();
  expect(errors).toEqual([]);
});
