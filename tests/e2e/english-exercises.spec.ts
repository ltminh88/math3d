// English Island Phase 1B: the exercise engine + tap-only UI, driven through the
// test-build hook `window.__game.island` (the 1A shell is not on main yet, so the
// spec starts the run itself). Every item kind is played by tap on all 4 projects;
// `tap` is used on touch projects, `click` on desktop.
import { type Page, type TestInfo, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

type IslandState = NonNullable<ReturnType<NonNullable<Window['__game']>['island']['state']>>;
type Expected = NonNullable<ReturnType<NonNullable<Window['__game']>['island']['currentAnswer']>>;

const islandState = (page: Page) =>
  page.evaluate(() => window.__game?.island.state()) as Promise<IslandState | null>;
const islandAnswer = (page: Page) =>
  page.evaluate(() => window.__game?.island.currentAnswer()) as Promise<Expected | null>;

async function tapOrClick(locator: ReturnType<Page['locator']>, tap: boolean): Promise<void> {
  if (tap) await locator.tap();
  else await locator.click();
}

async function boot(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window && !!window.__game?.island);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

async function startIsland(page: Page): Promise<void> {
  await page.evaluate(() => window.__game?.island.start(1));
  await expect(page.locator('.english-run')).toBeVisible();
}

/** Tap the right answer for the current item (one action per kind). */
async function answerRight(page: Page, tap: boolean): Promise<void> {
  const expected = await islandAnswer(page);
  if (!expected) throw new Error('no current answer');
  if (expected.kind === 'listen-pick-picture' || expected.kind === 'letter-pick') {
    await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(expected.index), tap);
  } else if (expected.kind === 'fill-pattern') {
    await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(expected.index), tap);
  } else if (expected.kind === 'match-pairs') {
    for (const pair of expected.pairs) {
      await tapOrClick(page.getByRole('button', { name: pair.word, exact: true }), tap);
      await tapOrClick(page.getByRole('button', { name: pair.picture, exact: true }), tap);
    }
  } else {
    for (const word of expected.words) {
      await tapOrClick(page.getByRole('button', { name: word, exact: true }), tap);
    }
    await tapOrClick(page.locator('.english-check'), tap);
  }
  await expect(page.locator('.english-next')).toBeVisible();
}

/** Tap one wrong answer for the current item (one miss). */
async function answerWrongOnce(page: Page, tap: boolean): Promise<void> {
  const expected = await islandAnswer(page);
  if (!expected) throw new Error('no current answer');
  if (
    expected.kind === 'listen-pick-picture' ||
    expected.kind === 'letter-pick' ||
    expected.kind === 'fill-pattern'
  ) {
    const count = await page.locator('.english-choice-grid .english-choice').count();
    const wrong = (expected.index + 1) % count;
    await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(wrong), tap);
  } else if (expected.kind === 'match-pairs') {
    const [first, second] = expected.pairs;
    if (!first || !second) throw new Error('match-pairs needs 2 pairs');
    await tapOrClick(page.getByRole('button', { name: first.word, exact: true }), tap);
    await tapOrClick(page.getByRole('button', { name: second.picture, exact: true }), tap);
  } else {
    const reversed = [...expected.words].reverse();
    for (const word of reversed) {
      await tapOrClick(page.getByRole('button', { name: word, exact: true }), tap);
    }
    await tapOrClick(page.locator('.english-check'), tap);
  }
}

/** Tap any enabled wrong choice in the current choice-kind round (one miss). */
async function tapWrongChoice(page: Page, tap: boolean): Promise<void> {
  const expected = await islandAnswer(page);
  if (!expected || expected.kind === 'match-pairs' || expected.kind === 'order-words') {
    throw new Error('not a choice-kind round');
  }
  const buttons = page.locator('.english-choice-grid .english-choice');
  const count = await buttons.count();
  for (let i = 0; i < count; i++) {
    if (i === expected.index) continue;
    const button = buttons.nth(i);
    if (await button.isEnabled()) {
      await tapOrClick(button, tap);
      return;
    }
  }
  throw new Error('no enabled wrong choice');
}

async function nextRound(page: Page, tap: boolean): Promise<void> {
  await tapOrClick(page.locator('.english-next'), tap);
  await expect(page.locator('.english-next')).toBeHidden();
}

/** Play the rest of the run correctly (rounds are 1-based in the hook state). */
async function finishRun(page: Page, tap: boolean): Promise<void> {
  for (;;) {
    const state = await islandState(page);
    if (!state || state.done) break;
    await answerRight(page, tap);
    await nextRound(page, tap);
  }
  await expect(page.locator('.english-finish')).toBeVisible();
  await tapOrClick(page.locator('.english-finish .kit-button'), tap);
}

test('plays a full 8-round run by tap, stats land under sk:en-*', async ({ page }, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  await boot(page);
  await startIsland(page);
  // Round 1: the right tap shows the "word = nghĩa" line after the answer.
  await answerRight(page, tap);
  await expect(page.locator('.english-gloss')).toBeVisible();
  await expect(page.locator('.english-gloss')).toContainText('=');
  await nextRound(page, tap);
  await finishRun(page, tap);
  await expect(page.locator('.english-finish')).toContainText('Bạn đúng 8/8 câu.');
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const stats = window.__game?.snapshot()?.factStats ?? {};
          return Object.keys(stats).filter(
            (k) => k.startsWith('sk:en-') && (stats[k]?.attempts ?? 0) > 0,
          );
        }),
      { timeout: 30_000 },
    )
    .not.toHaveLength(0);
});

test('a wrong answer shows gentle feedback, then the right answer works', async ({
  page,
}, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  await boot(page);
  await startIsland(page);
  const first = await islandState(page);
  const firstSkill = first?.skillId;
  if (!firstSkill) throw new Error('no first round');
  await answerWrongOnce(page, tap);
  const feedback = await page.locator('.english-feedback').textContent();
  expect(feedback?.trim().length).toBeGreaterThan(0);
  await answerRight(page, tap);
  await nextRound(page, tap);
  await finishRun(page, tap);
  // The first skill was answered wrong once, then right: at least 2 attempts.
  await expect
    .poll(
      () =>
        page.evaluate(
          (skill) => window.__game?.snapshot()?.factStats[`sk:${skill}`]?.attempts ?? 0,
          firstSkill,
        ),
      { timeout: 30_000 },
    )
    .toBeGreaterThanOrEqual(2);
});

test('three misses reveal the answer, and a hint narrows the choices', async ({
  page,
}, testInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  await boot(page);
  await startIsland(page);
  // Find a listen/letter round (3 choices at tier 1). A fill-pattern round has
  // only 2 choices, so hint rung 2 would drop the only wrong one and there
  // would be nothing left to miss with — those rounds are answered correctly.
  for (let round = 1; round <= 8; round++) {
    const state = await islandState(page);
    const kind = state?.kind;
    if (kind === 'listen-pick-picture' || kind === 'letter-pick') {
      break;
    }
    await answerRight(page, tap);
    await nextRound(page, tap);
    if (round === 8) throw new Error('no listen/letter round in 8 rounds');
  }
  const expected = await islandAnswer(page);
  if (!expected || (expected.kind !== 'listen-pick-picture' && expected.kind !== 'letter-pick')) {
    throw new Error('expected a listen/letter round');
  }
  // Miss 1, then the hint rungs: encourage, then one wrong choice drops out.
  await tapWrongChoice(page, tap);
  await tapOrClick(page.locator('.english-hint'), tap);
  await expect(page.locator('.english-feedback')).toContainText('nhìn kĩ');
  await tapOrClick(page.locator('.english-hint'), tap);
  await expect(page.locator('.english-choice-grid .english-choice:disabled')).toHaveCount(1);
  // Misses 2 and 3 on any still-enabled wrong button (they stay enabled for retries).
  await tapWrongChoice(page, tap);
  await tapWrongChoice(page, tap);
  await expect(page.locator('.english-choice-grid .english-choice.correct')).toHaveCount(1);
  await expect(page.locator('.english-feedback')).toContainText('đáp án');
  await nextRound(page, tap);
  await finishRun(page, tap);
  await expect(page.locator('.english-finish')).toContainText('Bạn đúng 7/8 câu.');
});

test('tier 2 shows more choices when the skill is in box 3', async ({
  page,
}, testInfo: TestInfo) => {
  const tap = !!testInfo.project.use.hasTouch;
  await boot(page);
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'sk:en-letters-a-d': { box: 3 },
      'sk:en-sounds-a-d': { box: 3 },
      'sk:en-words-a-d': { box: 3 },
      'sk:en-pattern-i-like': { box: 3 },
      'sk:en-pattern-this-is': { box: 3 },
    }),
  );
  await startIsland(page);
  // Find a choice-kind round and assert its tier-2 choice count.
  for (let round = 1; round <= 8; round++) {
    const state = await islandState(page);
    const kind = state?.kind;
    if (kind === 'listen-pick-picture' || kind === 'letter-pick' || kind === 'fill-pattern') {
      const count = await page.locator('.english-choice-grid .english-choice').count();
      expect(count).toBe(kind === 'fill-pattern' ? 3 : 4);
      break;
    }
    await answerRight(page, tap);
    await nextRound(page, tap);
    if (round === 8) throw new Error('no choice-kind round in 8 rounds');
  }
  await finishRun(page, tap);
  await expect(page.locator('.english-finish')).toBeVisible();
});
