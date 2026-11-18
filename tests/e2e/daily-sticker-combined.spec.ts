// Phase 11 + 12 combined (condition 3 of the shared-file agreement): after merging
// main (daily practice) into the sticker-book branch, the Milo dialog and the quest
// card must show BOTH lanes' parts — daily on top, sticker below — on every project,
// with no horizontal overflow and every button at least 44 px tall.
import { type Page, test } from '@playwright/test';
import {
  expect,
  SLOW_TEST_MS,
  waitDialogSettled,
  waitForStoreBoot,
} from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

/** Table 3's 18 mul+div facts, mul first (the derivation counts them in this order). */
const TABLE3_FACTS = [
  'mul:2x3',
  'mul:3x3',
  'mul:3x4',
  'mul:3x5',
  'mul:3x6',
  'mul:3x7',
  'mul:3x8',
  'mul:3x9',
  'mul:3x10',
  'div:6/3',
  'div:9/3',
  'div:12/3',
  'div:15/3',
  'div:18/3',
  'div:21/3',
  'div:24/3',
  'div:27/3',
  'div:30/3',
];

/** 13 of table 3's facts at box 4: 13/18 ≥ 70%, so the Bảng nhân 3 sticker is earned. */
const seedTable13 = (): Record<string, { box: number }> =>
  Object.fromEntries(TABLE3_FACTS.slice(0, 13).map((k) => [k, { box: 4 }]));

const isTouch = (info: { project: { name: string } }) => info.project.name !== 'desktop-chromium';

async function play(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

/** Walk to VLM and open his dialog (wait for the near class: talkToGuide reads it). */
async function openMiloDialog(page: Page): Promise<void> {
  await page.evaluate(() => window.__game?.teleport(-1, 1.5));
  await expect(page.locator('#milo-label')).toHaveClass(/near/);
  await expect(page.locator('#interact')).toContainText('VLM');
  // dispatchEvent: no actionability wait — plain clicks have hung on the stability
  // check on this VM while SwiftShader frames render at ~1 fps.
  await page.locator('#interact').dispatchEvent('click');
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
}

/** The open dialog must not spill past the viewport edge (mobile/tablet check). */
async function expectDialogFits(page: Page): Promise<void> {
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  const box = await page.locator('#dialog').boundingBox();
  expect(box?.width).toBeLessThanOrEqual(viewport.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

async function expectButton44(page: Page, selector: string): Promise<void> {
  const box = await page.locator(selector).boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(box?.width).toBeGreaterThanOrEqual(44);
}

/** True when `first` comes before `second` in document order. */
async function expectOrder(page: Page, first: string, second: string): Promise<void> {
  const order = await page.evaluate(
    ([a, b]) => {
      const elA = document.querySelector(a);
      const elB = document.querySelector(b);
      if (!elA || !elB) return 'missing';
      return elA.compareDocumentPosition(elB) & Node.DOCUMENT_POSITION_FOLLOWING
        ? 'a-before-b'
        : 'b-before-a';
    },
    [first, second] as const,
  );
  expect(order).toBe('a-before-b');
}

test('unlocked: Milo dialog + quest card show daily (top) and sticker (below)', async ({
  page,
}, testInfo) => {
  const touch = isTouch(testInfo);
  await play(page);
  await page.evaluate(() => window.__game?.seedStageProgress('field', [1]));
  await page.evaluate((seed) => window.__game?.seedFactStats(seed), seedTable13());

  // Quest card: the daily line first, the sticker button below it.
  await expect(page.locator('#quest-daily')).toHaveText('Hôm nay: chưa luyện');
  const stickerButton = page.locator('#sticker-book-button');
  await expect(stickerButton).toHaveText('📖 Sổ dán hình');
  await expectOrder(page, '#quest-daily', '#sticker-book-button');
  await expectButton44(page, '#sticker-book-button');

  // Milo dialog: the daily entry first, the sticker entry below it.
  await openMiloDialog(page);
  await expectDialogFits(page);
  const dailyButton = page.locator('#daily-guide-button');
  await expect(dailyButton).toHaveText('📅 Luyện tập hôm nay');
  const guideButton = page.locator('#open-sticker-book-guide');
  await expect(guideButton).toHaveText('📖 Sổ dán hình');
  await expectOrder(page, '#daily-guide-button', '#open-sticker-book-guide');
  await expectButton44(page, '#daily-guide-button');
  await expectButton44(page, '#open-sticker-book-guide');

  // The sticker entry actually opens the book, showing the earned table sticker.
  if (touch) await guideButton.tap();
  else await guideButton.click();
  await expect(page.locator('.sticker-count')).toHaveText('1/8');
  await expect(page.locator('[data-sticker="table:3"]')).toHaveClass(/earned/);
  await waitDialogSettled(page);
  await page.locator('#close-dialog').dispatchEvent('click');
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});

test('locked: Milo dialog shows the daily locked line above the sticker entry', async ({
  page,
}) => {
  await play(page);
  // No seeds: daily is still locked (field stage 1 not done).
  await expect(page.locator('#quest-daily')).toHaveCount(0);
  await expect(page.locator('#sticker-book-button')).toHaveText('📖 Sổ dán hình');

  await openMiloDialog(page);
  await expectDialogFits(page);
  await expect(page.locator('.daily-guide-locked')).toHaveText(
    'Luyện tập hôm nay sẽ mở sau khi con xong chặng 1 ở Cánh Đồng Phép Tính.',
  );
  const guideButton = page.locator('#open-sticker-book-guide');
  await expect(guideButton).toHaveText('📖 Sổ dán hình');
  await expectOrder(page, '.daily-guide-locked', '#open-sticker-book-guide');
  await expectButton44(page, '#open-sticker-book-guide');
  await waitDialogSettled(page);
  await page.locator('#close-dialog').dispatchEvent('click');
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});
