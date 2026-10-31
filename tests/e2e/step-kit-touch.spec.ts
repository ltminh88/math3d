// Step kit (phase 01): a reasoning item is solvable by taps alone on every project (phone and
// tablet use tap(), desktop click()), every target is at least 44 x 44 px, and seeded skill stats
// reach the store so specs can play higher tiers.
import { type Locator, type Page, test } from '@playwright/test';
import { expect, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
// SwiftShader keeps rendering the world behind the card; on a busy machine rAF-based
// actionability checks starve, so presses are forced after an explicit hit test (below).
test.describe.configure({ timeout: 120_000 });

/** The element at the centre of `target` is `target` itself (nothing covers it). */
const isHittable = (target: Locator) =>
  target.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2) === el;
  });

type PlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean };

async function boot(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => window.__game !== undefined);
}

async function smallTargets(card: Locator): Promise<string[]> {
  return card.evaluate((root) =>
    [...root.querySelectorAll('button')]
      .filter((b) => !b.disabled || b.classList.contains('kit-multi__done'))
      .map((b) => ({ r: b.getBoundingClientRect(), t: b.textContent ?? '' }))
      .filter(({ r }) => r.width < 44 || r.height < 44)
      .map(({ r, t }) => `${t} ${Math.round(r.width)}x${Math.round(r.height)}`),
  );
}

const CASES = [
  { skill: 'tf-explain', tier: 2, seed: 3 },
  { skill: 'choose-all-correct', tier: 3, seed: 5 },
  { skill: 'wp-times-then-add', tier: 3, seed: 7 },
  { skill: 'div-rem-floor', tier: 2, seed: 11 },
  { skill: 'pattern-add', tier: 3, seed: 2 },
] as const;

for (const { skill, tier, seed } of CASES) {
  test(`${skill} tier ${tier} is solvable by taps only`, async ({ page }, testInfo) => {
    const touch = testInfo.project.use.hasTouch === true;
    const press = async (l: Locator) => {
      await l.scrollIntoViewIfNeeded();
      expect(await isHittable(l)).toBe(true);
      await (touch ? l.tap({ force: true }) : l.click({ force: true }));
    };
    await boot(page);
    const plan = (await page.evaluate(
      (a) => window.__game?.mountStepCard(a.skill, a.seed, a.tier),
      { skill, seed, tier },
    )) as PlannedStep[];
    const card = page.locator('.kit-step-card');
    await expect(card).toBeVisible();
    for (const [i, step] of plan.entries()) {
      const row = card.locator('.kit-step').nth(i);
      expect(await smallTargets(card), `step ${i}`).toEqual([]);
      if (step.kind === 'number') {
        for (const digit of String(step.answer))
          await press(row.locator('.kit-pad__key', { hasText: new RegExp(`^${digit}$`) }));
        await press(row.locator('.kit-pad__key--ok'));
      } else if (step.kind === 'choice') {
        await press(
          row.locator('.kit-choices').getByRole('button', { name: step.label, exact: true }),
        );
      } else if (step.kind === 'verdict') {
        await press(row.locator(`[data-verdict="${step.answer}"]`));
      } else {
        for (const id of step.ids) await press(row.locator(`[data-choice="${id}"]`));
        await press(row.locator('.kit-multi__done'));
      }
      await expect(row).toHaveClass(/kit-step--done/);
    }
    await expect(card).toHaveAttribute('data-complete', 'true');
  });
}

test('seedFactStats puts skill stats in the store', async ({ page }) => {
  await boot(page);
  await page.evaluate(() =>
    window.__game?.seedFactStats({ 'sk:div-rem-ceil': { box: 5 }, 'mul:2x3': { box: 3 } }),
  );
  const stats = await page.evaluate(() => window.__game?.snapshot()?.factStats);
  expect(stats?.['sk:div-rem-ceil']?.box).toBe(5);
  expect(stats?.['mul:2x3']?.box).toBe(3);
});
