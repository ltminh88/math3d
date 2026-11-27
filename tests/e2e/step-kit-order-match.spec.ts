// Step kit order + match (boost, Phase 2B): both new kinds are solvable by
// taps alone on every project, every target is at least 44 x 44 px. The
// fixture item drives both kinds; meas-len-order drives the real skill.
import { type Locator, type Page, test } from '@playwright/test';
import { expect, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
// SwiftShader keeps rendering the world behind the card; on a busy machine rAF-based
// actionability checks starve, so presses are forced after an explicit hit test (below).
// The card is a fixed fullscreen overlay, so no scrolling is needed to reach a tile.
test.describe.configure({ timeout: 240_000 });

/** The element at the centre of `target` is `target` itself (nothing covers it). */
const isHittable = (target: Locator) =>
  target.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el;
  });

type PlannedStep =
  | { kind: 'order'; tiles: string[]; answer: number[] }
  | { kind: 'match'; left: string[]; right: string[]; pairs: number[] };

async function boot(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => window.__game !== undefined);
}

async function smallTargets(card: Locator): Promise<string[]> {
  return card.evaluate((root) =>
    [...root.querySelectorAll('button')]
      .filter((b) => !b.disabled || b.classList.contains('kit-order__done'))
      .map((b) => ({ r: b.getBoundingClientRect(), t: b.textContent ?? '' }))
      .filter(({ r }) => r.width < 44 || r.height < 44)
      .map(({ r, t }) => `${t} ${Math.round(r.width)}x${Math.round(r.height)}`),
  );
}

async function mount(
  page: Page,
  skill: string,
  seed: number,
  tier: number,
): Promise<PlannedStep[]> {
  return (await page.evaluate((a) => window.__game?.mountStepCard(a.skill, a.seed, a.tier), {
    skill,
    seed,
    tier,
  })) as PlannedStep[];
}

async function solveOrderRow(
  page: Page,
  row: Locator,
  order: { tiles: string[]; answer: number[] },
  press: (l: Locator) => Promise<void>,
): Promise<void> {
  for (const tileIndex of order.answer) {
    const label = order.tiles[tileIndex];
    if (label === undefined) throw new Error('order answer index out of range');
    await press(row.locator('.kit-order__bank').getByRole('button', { name: label, exact: true }));
  }
  await press(row.locator('.kit-order__done'));
  await expect(row).toHaveClass(/kit-step--done/);
}

test('fixture: order step places, undoes, then solves by taps', async ({ page }, testInfo) => {
  const touch = testInfo.project.use.hasTouch === true;
  const press = async (l: Locator) => {
    expect(await isHittable(l)).toBe(true);
    await (touch ? l.tap({ force: true }) : l.click({ force: true }));
  };
  await boot(page);
  const plan = await mount(page, 'test-step-kit-fixture', 1, 1);
  const card = page.locator('.kit-step-card');
  await expect(card).toBeVisible();
  const order = plan[0];
  if (order?.kind !== 'order') throw new Error('fixture first step is not order');
  const row = card.locator('.kit-step').nth(0);
  expect(await smallTargets(card), 'order step').toEqual([]);

  // "Xong" stays disabled until every slot is filled.
  await expect(row.locator('.kit-order__done')).toBeDisabled();
  // Undo: place a tile, tap its slot to send it back to the bank.
  await press(row.locator('.kit-order__bank').getByRole('button', { name: '3 cm', exact: true }));
  await expect(row.locator('.kit-order__slots').getByRole('button', { name: '3 cm' })).toHaveCount(
    1,
  );
  await press(row.locator('.kit-order__slots').getByRole('button', { name: '3 cm', exact: true }));
  await expect(row.locator('.kit-order__bank').getByRole('button', { name: '3 cm' })).toHaveCount(
    1,
  );
  // Solve in the answer's order, then "Xong".
  for (const tileIndex of order.answer) {
    const label = order.tiles[tileIndex];
    if (label === undefined) throw new Error('order answer index out of range');
    await press(row.locator('.kit-order__bank').getByRole('button', { name: label, exact: true }));
  }
  await expect(row.locator('.kit-order__done')).toBeEnabled();
  await press(row.locator('.kit-order__done'));
  await expect(row).toHaveClass(/kit-step--done/);
});

test('fixture: match step flashes a wrong pair, then solves by taps', async ({
  page,
}, testInfo) => {
  const touch = testInfo.project.use.hasTouch === true;
  const press = async (l: Locator) => {
    expect(await isHittable(l)).toBe(true);
    await (touch ? l.tap({ force: true }) : l.click({ force: true }));
  };
  await boot(page);
  const plan = await mount(page, 'test-step-kit-fixture', 1, 1);
  const card = page.locator('.kit-step-card');
  await expect(card).toBeVisible();
  const match = plan[1];
  if (match?.kind !== 'match') throw new Error('fixture second step is not match');
  // The card reveals the match step only after the order step is solved.
  const order = plan[0];
  if (order?.kind !== 'order') throw new Error('fixture first step is not order');
  await solveOrderRow(page, card.locator('.kit-step').nth(0), order, press);
  const row = card.locator('.kit-step').nth(1);
  expect(await smallTargets(card), 'match step').toEqual([]);

  const left = (label: string) =>
    row.locator('.kit-match__column').first().getByRole('button', { name: label, exact: true });
  const right = (label: string) =>
    row.locator('.kit-match__column').nth(1).getByRole('button', { name: label, exact: true });
  // "Xong" stays disabled until every left is paired.
  await expect(row.locator('.kit-match__done')).toBeDisabled();
  // Pair both lefts wrong on purpose: the flash comes only after "Xong".
  await press(left('1 m'));
  await press(right('20 cm'));
  await expect(left('1 m')).toHaveClass(/paired/);
  await press(left('2 dm'));
  await press(right('100 cm'));
  await expect(row.locator('.kit-match__done')).toBeEnabled();
  await press(row.locator('.kit-match__done'));
  await expect(row).not.toHaveClass(/kit-step--done/);
  await expect(left('1 m')).toHaveClass(/wrong/);
  await expect(right('20 cm')).toHaveClass(/wrong/);
  // Tapping a paired tile unties its pair (and clears the flash): untie both
  // wrong pairs, then re-pair them right. A paired right tile unties its own
  // pair when tapped, even while another left is selected.
  await press(left('1 m'));
  await expect(left('1 m')).not.toHaveClass(/wrong/);
  await press(right('100 cm'));
  await press(left('1 m'));
  await press(right('100 cm'));
  await expect(left('1 m')).toHaveClass(/paired/);
  await press(left('2 dm'));
  await press(right('20 cm'));
  await expect(left('2 dm')).toHaveClass(/paired/);
  await expect(row.locator('.kit-match__done')).toBeEnabled();
  await press(row.locator('.kit-match__done'));
  await expect(row).toHaveClass(/kit-step--done/);
  await expect(card).toHaveAttribute('data-complete', 'true');
});

test('meas-len-order is solvable by taps only', async ({ page }, testInfo) => {
  const touch = testInfo.project.use.hasTouch === true;
  const press = async (l: Locator) => {
    expect(await isHittable(l)).toBe(true);
    await (touch ? l.tap({ force: true }) : l.click({ force: true }));
  };
  await boot(page);
  const plan = await mount(page, 'meas-len-order', 7, 1);
  const card = page.locator('.kit-step-card');
  await expect(card).toBeVisible();
  const order = plan[0];
  if (order?.kind !== 'order') throw new Error('meas-len-order first step is not order');
  const row = card.locator('.kit-step').nth(0);
  expect(await smallTargets(card), 'meas-len-order').toEqual([]);
  await solveOrderRow(page, row, order, press);
  await expect(card).toHaveAttribute('data-complete', 'true');
});
