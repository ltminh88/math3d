// Reasoning rounds (phase 04): once the child knows the tables (seeded box 3 stats), the bridge
// quiz asks a word problem every 5th question and field, forest, city and tower end their run with
// one reasoning round on the step kit. Solved by keyboard on desktop, by taps only on the phone and
// both tablets; the round is recorded under its `sk:` key. Uses `window.__game`, the level hooks
// and `window.__reasoningRound` (test builds only).
import { type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

type PlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean };

const isTouch = (info: TestInfo) => info.project.use.hasTouch === true;

function mulKeys(tables: readonly number[]): string[] {
  const keys = new Set<string>();
  for (const t of tables)
    for (let m = 1; m <= 10; m++) keys.add(`mul:${Math.min(t, m)}x${Math.max(t, m)}`);
  return [...keys];
}

const divKeys = (tables: readonly number[]) =>
  tables.flatMap((t) => Array.from({ length: 10 }, (_, i) => `div:${t * (i + 1)}/${t}`));

async function boot(page: Page, completedLevels: string[], mastered: string[]): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  const stats = Object.fromEntries(mastered.map((k) => [k, { box: 3, attempts: 3 }]));
  await page.evaluate((s) => window.__game?.seedFactStats(s), stats);
  if (completedLevels.length || mastered.length)
    await page.evaluate(
      (levels) => window.__game?.seedProgress({ bridgeComplete: true, completedLevels: levels }),
      completedLevels,
    );
}

const blur = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

/** Tap on touch projects; keyboard (focus + Enter) on desktop. */
async function press(page: Page, target: Locator, touch: boolean): Promise<void> {
  if (touch) await target.tap();
  else {
    await target.focus();
    await page.keyboard.press('Enter');
  }
}

async function typeNumber(page: Page, pad: Locator, value: number, touch: boolean) {
  if (touch) {
    for (const digit of String(value))
      await pad.getByRole('button', { name: digit, exact: true }).tap();
    await pad.getByRole('button', { name: 'Xong' }).tap();
  } else {
    await blur(page);
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
  }
}

async function enterLevel(page: Page, levelId: string, gate: string, touch: boolean) {
  await page.evaluate((id) => window.__game?.teleportToGate(id), levelId);
  const interact = page.locator('#interact');
  await expect(interact).toContainText(`Vào ${gate}`);
  if (touch) await interact.tap();
  else await interact.click();
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

/** Solves the reasoning round on screen: one hint (H / tap), then every step; returns its key. */
async function solveReasoningRound(page: Page, touch: boolean): Promise<string> {
  const round = page.locator('.reasoning-round');
  await expect(round).toBeVisible();
  const hook = await page.evaluate(() => {
    const h = window.__reasoningRound;
    return h ? { factKey: h.factKey, steps: h.steps as PlannedStep[] } : null;
  });
  if (!hook) throw new Error('reasoning round hook missing');
  const coarse = await page.evaluate(() => matchMedia('(pointer: coarse)').matches);
  if (coarse) await expect(round).not.toContainText(/phím|Enter|nhấn [A-Z]\b/);
  if (touch) await round.locator('.reasoning-round__hint').tap();
  else {
    await blur(page);
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
    if (step.kind === 'number') await typeNumber(page, row.locator('.kit-pad'), step.answer, touch);
    else if (step.kind === 'choice')
      await press(
        page,
        row.locator('.kit-choices').getByRole('button', { name: step.label, exact: true }),
        touch,
      );
    else if (step.kind === 'verdict')
      await press(page, row.locator(`[data-verdict="${step.answer}"]`), touch);
    else {
      for (const id of step.ids) await press(page, row.locator(`[data-choice="${id}"]`), touch);
      await press(page, row.locator('.kit-multi__done'), touch);
    }
    await expect(row).toHaveClass(/kit-step--done/);
  }
  await expect(round.locator('.feedback')).toHaveClass(/success/);
  const next = round.locator('.reasoning-round__next');
  if (touch) await next.tap();
  else {
    await expect(next).toBeFocused();
    await page.keyboard.press('Enter');
  }
  await expect(round).toHaveCount(0);
  return hook.factKey;
}

async function expectRecorded(page: Page, back: Locator, touch: boolean, key: string) {
  if (touch) await back.tap();
  else await back.click();
  await page.waitForFunction(() => window.__game?.levelRunning() === false);
  await expect
    .poll(() => page.evaluate((k) => window.__game?.snapshot()?.factStats[k]?.attempts ?? 0, key))
    .toBeGreaterThanOrEqual(1);
}

test('bridge quiz: a mastered table gets a word problem on the 5th question', async ({
  page,
}, info) => {
  const touch = isTouch(info);
  await boot(page, [], []);
  await page.evaluate(
    (keys) => window.__game?.seedFactStats(Object.fromEntries(keys.map((k) => [k, { box: 3 }]))),
    mulKeys([2, 3, 4, 5, 6, 7, 8, 9, 10]),
  );
  await page.evaluate(() => window.__game?.teleport(-3, 3.6));
  await expect(page.locator('#interact')).toContainText('Nói chuyện với VLM');
  await page.locator('#interact').click();
  await press(page, page.locator('#accept-quest'), touch);
  const pick = async (value: number) => {
    const answers = page.locator('.answers .answer');
    const values = await answers.evaluateAll((b) =>
      b.map((el) => Number((el as HTMLElement).dataset.value)),
    );
    const index = values.indexOf(value);
    if (touch) await answers.nth(index).tap();
    else await page.keyboard.press(String(index + 1));
  };
  for (let q = 0; q < 4; q++) {
    const stones = Number(
      ((await page.locator('.equation').textContent()) ?? '').match(/\d+/)?.[0],
    );
    await pick(stones);
    await expect(page.locator('#feedback')).toHaveClass(/success/);
    await press(page, page.locator('#next-question'), touch);
  }
  const story = (await page.locator('.quiz-word-story').textContent()) ?? '';
  await expect(page.locator('.quiz-word-ask')).toBeVisible();
  const [x, y] = (story.match(/\d+/g) ?? []).map(Number) as [number, number];
  const answer = /gấp/.test(story) && /Đội/.test(story) ? x * y + x : x / y;
  const wrong = (
    await page
      .locator('.answers .answer')
      .evaluateAll((b) => b.map((el) => Number((el as HTMLElement).dataset.value)))
  ).find((v) => v !== answer) as number;
  await pick(wrong);
  await expect(page.locator('#feedback')).toHaveClass(/gentle/);
  await expect(page.locator('#hint-area')).toBeVisible();
  await expect(page.locator('#hint-area .stone-groups')).toHaveCount(0);
  await pick(answer);
  await expect(page.locator('#feedback')).toContainText('Chính xác!');
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.levelProgress.bridge?.progress))
    .toBe(5);
  await expect
    .poll(() =>
      page.evaluate(() => window.__game?.snapshot()?.factStats['sk:wp-times-then-add']?.attempts),
    )
    .toBe(1);
});

test('field: the last patch is a reasoning round once tables 3-4 are known', async ({
  page,
}, info) => {
  const touch = isTouch(info);
  await boot(page, [], mulKeys([3, 4]));
  await enterLevel(page, 'field', 'Cổng Cánh Đồng Phép Tính', touch);
  for (let i = 0; i < 5 && (await page.locator('.reasoning-round').count()) === 0; i++) {
    await page.waitForFunction(
      (n) => window.__field?.state().phase === 'answer' && window.__field?.state().index === n,
      i,
    );
    const total = (await page.evaluate(() => window.__field?.state().total)) as number;
    await typeNumber(page, page.locator('.field-pad'), total, touch);
    await page.waitForFunction(() => window.__field?.state().phase === 'solved');
    await press(page, page.locator('.field-next'), touch);
  }
  const key = await solveReasoningRound(page, touch);
  expect(['sk:wp-times-then-add', 'sk:pattern-skip-count']).toContain(key);
  await expect(page.locator('.field-panel--done .field-stars')).toBeVisible();
  await expectRecorded(page, page.getByRole('button', { name: 'Về cổng' }), touch, key);
});

test('forest: the last round shares fruit with leftovers', async ({ page }, info) => {
  const touch = isTouch(info);
  await boot(page, ['field'], [...mulKeys([2, 3, 4, 5]), ...divKeys([2, 3, 4, 5])]);
  await enterLevel(page, 'forest', 'Cổng Rừng Nhân Chia', touch);
  for (let i = 0; i < 5 && (await page.locator('.reasoning-round').count()) === 0; i++) {
    const panel = page.locator(`.forest-panel[data-round="${i}"]`);
    await expect(panel).toBeVisible();
    const data = await panel.evaluate((el) => ({ ...(el as HTMLElement).dataset }));
    expect(data.kind).toBe('family');
    const p = Number(data.dividend);
    const a = Number(data.divisor);
    const b = p / a;
    for (const v of a === b ? [p, b] : [p, p, b, a])
      await typeNumber(page, page.locator('.forest-panel .kit-pad'), v, touch);
    await expect(page.locator('.forest-panel .feedback')).toContainText('Đúng rồi!');
    await press(page, page.locator('.forest-next'), touch);
  }
  const key = await solveReasoningRound(page, touch);
  expect(['sk:div-rem-floor', 'sk:div-rem-ceil']).toContain(key);
  await expect(page.locator('.forest-done')).toBeVisible();
  await expectRecorded(page, page.locator('.forest-back'), touch, key);
});

test('city: the last delivery is the postman’s puzzle', async ({ page }, info) => {
  const touch = isTouch(info);
  await boot(page, ['field', 'forest'], mulKeys([6, 7, 8, 9]));
  await enterLevel(page, 'city', 'Cổng Thành Phố Con Số', touch);
  for (let i = 0; i < 6 && (await page.locator('.reasoning-round').count()) === 0; i++) {
    await page.waitForFunction((n) => window.__city?.state().index === n, i);
    const state = await page.evaluate(() => window.__city?.state());
    if (!state) throw new Error('city state missing');
    expect(state.kind).toBe('reverse');
    const card = page.locator(`.city-choices [data-value="${state.product}"]`);
    if (touch) await card.tap();
    else await page.keyboard.press(String(await card.locator('kbd').textContent()));
    await expect(page.locator('.city-panel .feedback')).toContainText('Đúng rồi!');
    await press(page, page.locator('.city-next'), touch);
  }
  const key = await solveReasoningRound(page, touch);
  expect(['sk:wp-times-compare', 'sk:unknown-mul-div']).toContain(key);
  await expect(page.locator('.city-done')).toBeVisible();
  await expectRecorded(page, page.locator('.city-back'), touch, key);
});

test('tower: the top floor carries an expression stone', async ({ page }, info) => {
  const touch = isTouch(info);
  const tables = [2, 3, 4, 5, 6, 7, 8, 9];
  await boot(page, ['field', 'forest', 'city'], [...mulKeys(tables), ...divKeys(tables)]);
  await enterLevel(page, 'tower', 'Cổng Tháp Toán Học', touch);
  for (let i = 0; i < 7 && (await page.locator('.reasoning-round').count()) === 0; i++) {
    await expect(page.locator(`.tower-panel[data-floor="${i}"]`)).toBeVisible();
    let s = await page.evaluate(() => window.__tower?.state());
    while (s && s.step !== null) {
      if (s.step === 'number')
        await typeNumber(page, page.locator('.tower-panel .kit-pad'), s.expected as number, touch);
      else {
        const index =
          s.step === 'choice' ? s.choices.indexOf(s.expected as number) : s.expected ? 0 : 1;
        if (touch) await page.locator(`.tower-answers .answer[data-index="${index}"]`).tap();
        else {
          await blur(page);
          await page.keyboard.press(String(index + 1));
        }
      }
      s = await page.evaluate(() => window.__tower?.state());
    }
    await expect(page.locator('.tower-panel .feedback')).toContainText('Đúng rồi!');
    await press(page, page.locator('.tower-next'), touch);
  }
  const key = await solveReasoningRound(page, touch);
  expect(['sk:expr-brackets', 'sk:expr-order', 'sk:tf-explain']).toContain(key);
  await expect(page.locator('.tower-done')).toBeVisible();
  expect(await page.evaluate(() => window.__tower?.state().litFloors)).toBe(7);
  await expectRecorded(page, page.locator('.tower-back'), touch, key);
});
