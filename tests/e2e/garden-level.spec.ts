// Garden level "Khu Vườn Quy Luật" (chapter 2 phase 05): with chapter 1 done, enter the garden
// gate (E on desktop, a tap on the Enter button on touch), play six rounds whose kinds rotate
// (desktop by keys; phone and both tablet projects by taps only), come back with the level
// completed, the valley gate no longer locked and `sk:` skills stored. Uses `window.__garden`.
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const DRAW_CALL_BUDGET = 60;
const ROUNDS = 6;

type GardenState = NonNullable<ReturnType<NonNullable<Window['__garden']>['state']>>;

const gardenState = (page: Page) =>
  page.evaluate(() => window.__garden?.state()) as Promise<GardenState>;

/** Focus back on the page (the pad ignores keys aimed at other controls). */
const blurControls = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function enterGarden(page: Page, touch: boolean): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() =>
    window.__game?.seedProgress({
      bridgeComplete: true,
      completedLevels: ['field', 'forest', 'city', 'tower'],
    }),
  );
  expect(await page.evaluate(() => window.__game?.gateStatus('garden'))).toBe('open');
  expect(await page.evaluate(() => window.__game?.gateStatus('valley'))).toBe('locked');
  await page.evaluate(() => window.__game?.teleportToGate('garden'));
  const interact = page.locator('#interact');
  await expect(interact).toContainText('Vào Cổng Khu Vườn Quy Luật');
  if (touch) await interact.tap();
  else await page.keyboard.press('e');
  await expect(page.locator('.garden-panel')).toBeVisible();
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

/** Answers the current step: pad digits / a card by tap, or typed digits / keys 1-4. */
async function give(page: Page, s: GardenState, value: number | string, touch: boolean) {
  const row = page.locator('.garden-card .kit-step:not(.kit-step--done)');
  if (s.step === 'number') {
    if (touch) {
      const pad = row.locator('.kit-pad');
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
  const card = row
    .locator('.kit-choices')
    .getByRole('button', { name: String(value), exact: true });
  if (touch) await card.tap();
  else {
    await blurControls(page);
    await page.keyboard.press(String(s.choices.indexOf(String(value)) + 1));
  }
}

const wrongOf = (s: GardenState): number | string =>
  s.step === 'choice'
    ? (s.choices.find((c) => c !== s.expected) as string)
    : (s.expected as number) + 1;

async function takeHints(page: Page, touch: boolean): Promise<void> {
  const hint = page.locator('.garden-hint-button');
  await expect(hint).toHaveClass(/offer/);
  if (touch) await hint.tap();
  else {
    await blurControls(page);
    await page.keyboard.press('h');
  }
  await expect(page.locator('.garden-hint')).toHaveAttribute('data-rung', '1');
  for (const rung of ['2', '3', '4']) {
    await expect(hint).toBeEnabled();
    if (touch) await hint.tap();
    else await hint.click();
    await expect(page.locator('.garden-hint')).toHaveAttribute('data-rung', rung);
  }
  await expect(hint).toBeDisabled();
}

async function playRound(page: Page, index: number, touch: boolean): Promise<GardenState> {
  await expect(page.locator(`.garden-panel[data-round="${index}"]`)).toBeVisible();
  let s = await gardenState(page);
  expect(s.round).toBe(index);
  if (index === 0) {
    // One wrong answer: gentle feedback, then the whole hint ladder (no answer shown).
    await give(page, s, wrongOf(s), touch);
    await expect(page.locator('.garden-panel .feedback')).toHaveClass(/gentle/);
    await takeHints(page, touch);
    s = await gardenState(page);
  }
  while (s.step !== null) {
    await give(page, s, s.expected as number | string, touch);
    await expect.poll(async () => (await gardenState(page)).stepIndex).not.toBe(s.stepIndex);
    s = await gardenState(page);
  }
  await expect(page.locator('.garden-panel .feedback')).toContainText('Đúng rồi!');
  await expect(page.locator('.garden-next')).toBeFocused();
  return s;
}

/** Touch layouts: no key line, and every visible control in the panel is at least 44 px. */
async function expectTouchFriendly(page: Page): Promise<void> {
  await expect(page.locator('.garden-keys')).toBeHidden();
  const small = await page.evaluate(
    () =>
      [...document.querySelectorAll<HTMLElement>('.garden-panel button')]
        .filter((b) => b.offsetParent !== null)
        .map((b) => b.getBoundingClientRect())
        .filter((r) => r.width < 44 || r.height < 44).length,
  );
  expect(small).toBe(0);
}

test('the garden plays six rotating rounds and records sk: skills', async ({ page }, info) => {
  const touch = !!info.project.use.hasTouch;
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await enterGarden(page, touch);

  const kinds = (await page.evaluate(() => window.__garden?.kinds())) ?? [];
  const factKeys = (await page.evaluate(() => window.__garden?.factKeys())) ?? [];
  expect(kinds).toHaveLength(ROUNDS);
  for (let i = 1; i < kinds.length; i++) expect(kinds[i]).not.toBe(kinds[i - 1]);
  expect(new Set(kinds)).toEqual(new Set(['pattern', 'balance', 'bag']));
  for (const key of factKeys) expect(key).toMatch(/^sk:(pattern|unknown|expr)-/);
  expect((await gardenState(page)).tier).toBe(1);
  if (touch) await expectTouchFriendly(page);

  const shot = new Set<string>();
  for (let i = 0; i < ROUNDS; i++) {
    const s = await playRound(page, i, touch);
    if (s.kind === 'pattern') expect(s.bloomed).toBe(5);
    if (s.kind === 'balance') expect(s.balanceLevel).toBe(true);
    if (s.kind === 'bag') expect(s.sprouted).toBe(s.steps);
    if (s.kind && !shot.has(s.kind)) {
      shot.add(s.kind);
      await page.screenshot({ path: `${shotDir(info.project.name)}/${s.kind}.png` });
    }
    if (touch) await page.locator('.garden-next').tap();
    else await page.keyboard.press('Enter');
  }
  const done = page.locator('.garden-done');
  await expect(done).toBeVisible();
  await expect(done).toContainText('Khu vườn đã đúng quy luật!');
  await expect(done).toContainText('VLM');
  await expect(done.locator('.garden-bonus')).toHaveText(
    'Thưởng lần đầu hoàn thành: +50 XP · +10 xu',
  );
  await page.screenshot({ path: `${shotDir(info.project.name)}/done.png` });
  const maxCalls = Number(await page.locator('.level-layer').getAttribute('data-max-draw-calls'));
  expect(maxCalls).toBeGreaterThan(0);
  expect(maxCalls).toBeLessThanOrEqual(DRAW_CALL_BUDGET);
  info.annotations.push({ type: 'max-draw-calls', description: String(maxCalls) });

  const back = page.locator('.garden-back');
  if (touch) await back.tap();
  else {
    await expect(back).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect
    .poll(() => page.evaluate(() => window.__game?.gateStatus('garden')))
    .toBe('completed');
  expect(await page.evaluate(() => window.__game?.gateStatus('valley'))).not.toBe('locked');
  const store = await page.evaluate(() => {
    const snap = window.__game?.snapshot();
    return {
      completedAt: snap?.levelProgress.garden?.completedAt ?? 0,
      keys: Object.keys(snap?.factStats ?? {}),
    };
  });
  expect(store.completedAt).toBeGreaterThan(0);
  for (const key of factKeys) expect(store.keys).toContain(key);
  await expect(page.locator('#quest-title')).toHaveText('Thung Lũng Hình Học');
  expect(await page.evaluate(() => window.__garden)).toBeUndefined();
  expect(errors).toEqual([]);
});

const shotDir = (project: string) =>
  `plans/261031-1933-reasoning-geometry-and-map-expansion/reports/p05-screens/${project}`;
