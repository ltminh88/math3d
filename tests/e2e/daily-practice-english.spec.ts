// Daily practice, English Island Phase 6: seeded English stats + the island
// unlocked mix at most 2 English items into "Luyện tập hôm nay", answerable
// by tap; a locked island mixes none. The sticker book shows the English page
// (0/41) from the stats alone.
import { type Page, type TestInfo, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitDialogSettled } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 3 });

type Expected = NonNullable<ReturnType<NonNullable<Window['__game']>['island']['currentAnswer']>>;
type DailyState = NonNullable<ReturnType<NonNullable<Window['__daily']>['state']>>;

const islandAnswer = (page: Page) =>
  page.evaluate(() => window.__game?.island.currentAnswer()) as Promise<Expected | null>;
const dailyState = (page: Page) =>
  page.evaluate(() => window.__daily?.state()) as Promise<DailyState | null>;

const isTouch = (info: TestInfo) => info.project.use.hasTouch === true;

async function tapOrClick(locator: ReturnType<Page['locator']>, tap: boolean): Promise<void> {
  if (tap) await locator.tap();
  else await locator.click();
}

async function boot(page: Page, islandUnlocked: boolean): Promise<void> {
  await page.goto('/');
  // The world build + store open can take over 30 s under parallel load on this VM.
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'ready', { timeout: 120_000 });
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await page.evaluate(() => window.__game?.seedStageProgress('field', [1]));
  if (islandUnlocked)
    await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() =>
    window.__game?.seedFactStats({
      'sk:en-letters-a-d': { box: 1 },
      'sk:en-words-a-d': { box: 1 },
      'sk:en-topic-animals': { box: 1 },
    }),
  );
}

async function openDaily(page: Page, touch: boolean): Promise<void> {
  const button = page.locator('#open-daily');
  await expect(button).toBeVisible();
  if (touch) await button.tap();
  else await button.click();
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await waitDialogSettled(page);
  await expect(page.locator('#dialog-content')).toContainText('Luyện tập hôm nay');
}

/** Tap the right answer for the current English item (one action per kind). */
async function answerEnglishRight(page: Page, tap: boolean): Promise<void> {
  const expected = await islandAnswer(page);
  if (!expected) throw new Error('no current English answer');
  if (
    expected.kind === 'listen-pick-picture' ||
    expected.kind === 'letter-pick' ||
    expected.kind === 'fill-pattern'
  ) {
    await tapOrClick(page.locator('.english-choice-grid .english-choice').nth(expected.index), tap);
  } else if (expected.kind === 'match-pairs') {
    for (const pair of expected.pairs) {
      await tapOrClick(
        page
          .locator('.english-pair-column')
          .nth(0)
          .getByRole('button', { name: pair.word, exact: true }),
        tap,
      );
      await tapOrClick(
        page
          .locator('.english-pair-column')
          .nth(1)
          .getByRole('button', { name: pair.word, exact: true }),
        tap,
      );
    }
  } else {
    for (const word of expected.words) {
      await tapOrClick(page.getByRole('button', { name: word, exact: true }), tap);
    }
    await tapOrClick(page.locator('.english-check'), tap);
  }
  // The Next button is the daily dialog's chrome, not the island run's.
  await expect(page.locator('.daily-next')).toBeVisible();
}

test('unlocked island: at most 2 English items, answerable by tap', async ({ page }, testInfo) => {
  const tap = isTouch(testInfo);
  await boot(page, true);
  await openDaily(page, tap);
  await page.waitForFunction(() => '__daily' in window);
  const state = await dailyState(page);
  // Three English skills are learned; the Phase 6 cap keeps two.
  expect(state?.total).toBe(2);
  for (let i = 0; i < 2; i++) {
    const at = await dailyState(page);
    expect(at?.skillId?.startsWith('en-')).toBe(true);
    await expect(page.locator('.daily-badge')).toContainText('Tiếng Anh');
    await expect(page.locator('.english-widget')).toBeVisible();
    await answerEnglishRight(page, tap);
    await expect(page.locator('.english-gloss')).toBeVisible();
    await tapOrClick(page.locator('.daily-next'), tap);
    await waitDialogSettled(page);
  }
  await expect(page.locator('#dialog-content')).toContainText('Xong rồi!');
  // Both played skills recorded one more attempt under sk:en-*.
  await expect
    .poll(
      async () =>
        await page.evaluate(() => {
          const stats = window.__game?.snapshot()?.factStats ?? {};
          return Object.entries(stats).filter(
            ([k, s]) => k.startsWith('sk:en-') && (s?.attempts ?? 0) >= 2,
          ).length;
        }),
    )
    .toBe(2);
});

test('locked island: no English items are planned', async ({ page }, testInfo) => {
  const tap = isTouch(testInfo);
  await boot(page, false);
  await openDaily(page, tap);
  // Only English skills are learned, so the day is empty and the dialog shows
  // the empty-set copy; no run starts and no English widget ever mounts.
  await expect(page.locator('#dialog-content')).toContainText('sẽ mở sau khi bạn xong chặng 1');
  await expect(page.locator('.english-widget')).toHaveCount(0);
  expect(await page.evaluate(() => '__daily' in window)).toBe(false);
});

test('sticker book shows the English page', async ({ page }, testInfo) => {
  const tap = isTouch(testInfo);
  await boot(page, false);
  await page.evaluate(() => window.__game?.openStickerBook());
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await waitDialogSettled(page);
  const tab = page.locator('[data-topic="english"]');
  await expect(tab).toBeVisible();
  if (tap) await tab.tap();
  else await tab.click();
  await expect(page.locator('.sticker-count')).toContainText('0/41');
});
