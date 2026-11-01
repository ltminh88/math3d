// Leaving a level during its reasoning round (review H2): the round's number pad must go with the
// level. Seed tables 2-5 as known, play the field up to its reasoning round, leave while its number
// step is live, enter the forest and type digits: they reach the forest's pad, and the closed
// field round records nothing. Uses `window.__game`, `__field` and `__reasoningRound` (test builds).
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

const mulKeys = (tables: readonly number[]) =>
  tables.flatMap((t) =>
    Array.from({ length: 10 }, (_, i) => `mul:${Math.min(t, i + 1)}x${Math.max(t, i + 1)}`),
  );

const divKeys = (tables: readonly number[]) =>
  tables.flatMap((t) => Array.from({ length: 10 }, (_, i) => `div:${t * (i + 1)}/${t}`));

const blur = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

async function tapOrClick(page: Page, selector: string, touch: boolean) {
  const target = page.locator(selector);
  if (touch) await target.tap();
  else await target.click();
}

async function enterLevel(page: Page, levelId: string, gate: string, touch: boolean) {
  await page.evaluate((id) => window.__game?.teleportToGate(id), levelId);
  await expect(page.locator('#interact')).toContainText(`Vào ${gate}`);
  await tapOrClick(page, '#interact', touch);
  await expect(page.locator('.level-layer')).toHaveAttribute('data-draw-calls', /\d+/);
}

test('leaving mid reasoning round frees its pad for the next level', async ({ page }, info) => {
  const touch = info.project.use.hasTouch === true;
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  // Tables 2-5 known: the field gets its reasoning round and the forest opens on a family round
  // (number pad), as in reasoning-rounds.spec.
  const known = [...mulKeys([2, 3, 4, 5]), ...divKeys([2, 3, 4, 5])];
  const stats = Object.fromEntries(known.map((k) => [k, { box: 3, attempts: 3 }]));
  await page.evaluate((s) => window.__game?.seedFactStats(s), stats);
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field'] }),
  );

  await enterLevel(page, 'field', 'Cổng Cánh Đồng Phép Tính', touch);
  for (let i = 0; i < 5 && (await page.locator('.reasoning-round').count()) === 0; i++) {
    await page.waitForFunction(
      (n) => window.__field?.state().phase === 'answer' && window.__field?.state().index === n,
      i,
    );
    const total = (await page.evaluate(() => window.__field?.state().total)) as number;
    await blur(page);
    await page.keyboard.type(String(total));
    await page.keyboard.press('Enter');
    await page.waitForFunction(() => window.__field?.state().phase === 'solved');
    await tapOrClick(page, '.field-next', touch);
  }
  await expect(page.locator('.reasoning-round .kit-pad')).toBeVisible();
  const round = await page.evaluate(() => {
    const h = window.__reasoningRound;
    const first = h?.steps[0];
    return { factKey: h?.factKey ?? '', answer: first?.kind === 'number' ? first.answer : -1 };
  });
  expect(round.answer).toBeGreaterThanOrEqual(0);

  await tapOrClick(page, '.level-leave', touch);
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect(page.locator('.reasoning-round')).toHaveCount(0);

  await enterLevel(page, 'forest', 'Cổng Rừng Nhân Chia', touch);
  await expect(page.locator('.forest-panel[data-round="0"]')).toBeVisible();
  // The forest hides the pad's own display (it shows digits in the question) but keeps its text.
  const display = page.locator('.forest-panel .kit-pad__display');
  // Three wrong tries for the closed round: an orphaned pad would take them and reveal its answer.
  const wrong = String((round.answer % 9) + 1);
  for (let i = 0; i < 3; i++) {
    await blur(page);
    await page.keyboard.press(wrong);
    await expect(display).toHaveText(wrong);
    await page.keyboard.press('Enter');
    await expect(display).toHaveText('');
  }
  const attempts = await page.evaluate(
    (k) => window.__game?.snapshot()?.factStats[k]?.attempts ?? 0,
    round.factKey,
  );
  expect(attempts).toBe(0);
});
