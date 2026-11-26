// Phase 12: the sticker book is derived from Leitner boxes — seed stats, play one clean
// quiz answer, and the book shows the earned sticker; a table at 70% earns its sticker.
import { type Page, test } from '@playwright/test';
import {
  expect,
  SLOW_TEST_MS,
  waitDialogSettled,
  waitForStoreBoot,
} from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

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

/** 12 of table 3's facts at box 4, leaving mul:3x7 at box 3 for the play test. */
const TABLE3_BOX4 = [
  'mul:2x3',
  'mul:3x3',
  'mul:3x4',
  'mul:3x5',
  'mul:3x6',
  'div:6/3',
  'div:9/3',
  'div:12/3',
  'div:15/3',
  'div:18/3',
  'div:21/3',
  'div:24/3',
];

const seedTable = (n: number): Record<string, { box: number }> =>
  Object.fromEntries(TABLE3_FACTS.slice(0, n).map((k) => [k, { box: 4 }]));

async function play(page: Page): Promise<void> {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

const openBook = (page: Page) => page.evaluate(() => window.__game?.openStickerBook());

const tapOrClick = async (page: Page, selector: string, touch: boolean): Promise<void> => {
  const locator = page.locator(selector);
  if (touch) await locator.tap();
  else await locator.click();
};

/** The open dialog must not spill past the viewport edge (mobile/tablet check). */
async function expectDialogFits(page: Page): Promise<void> {
  const viewport = page.viewportSize() ?? { width: 1280, height: 720 };
  const box = await page.locator('#dialog').boundingBox();
  expect(box?.width).toBeLessThanOrEqual(viewport.width);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  );
}

test('fresh profile: the book opens on 0 earned, pages flip, targets are 44 px', async ({
  page,
}, testInfo) => {
  const touch = testInfo.project.name !== 'desktop-chromium';
  await play(page);
  // The book opens from the quest card's button (the real entry, not the test hook).
  const questButton = page.locator('#sticker-book-button');
  await expect(questButton).toHaveText('📖 Sổ dán hình');
  const questBox = await questButton.boundingBox();
  expect(questBox?.height).toBeGreaterThanOrEqual(44);
  await tapOrClick(page, '#sticker-book-button', touch);
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await expectDialogFits(page);
  await expect(page.locator('#dialog-title')).toHaveText('Sổ dán hình');
  await expect(page.locator('.sticker-count')).toHaveText('0/8');
  const emojis = await page
    .locator('.sticker-emoji')
    .evaluateAll((els) => els.map((el) => el.textContent?.trim() ?? ''));
  expect(emojis).toHaveLength(8);
  expect(emojis.every((e) => e.length > 0)).toBe(true);
  for (const box of await page
    .locator('.sticker')
    .evaluateAll((els) => els.map((el) => el.getBoundingClientRect()))) {
    expect(box.width).toBeGreaterThanOrEqual(44);
    expect(box.height).toBeGreaterThanOrEqual(44);
  }
  await tapOrClick(page, '.sticker >> nth=0', touch);
  await expect(page.locator('.sticker-detail')).toContainText('Bảng nhân 2');
  await expect(page.locator('.sticker-detail')).toContainText('luyện thêm');
  const topics = [
    'Bảng nhân',
    'Chia và số dư',
    'Tìm số chưa biết và quy luật',
    'Biểu thức và đúng/sai',
    'Hình học',
    'Đo lường',
  ];
  const counts = ['0/8', '0/2', '0/7', '0/13', '0/10', '0/24'];
  for (let i = 1; i < 6; i++) {
    // dispatchEvent: no actionability wait — plain clicks on the flip button have hung on
    // the stability check on this VM (SwiftShader ~1 fps); see the #learn note below.
    await page.locator('#sticker-next').dispatchEvent('click');
    await expect(page.locator('.sticker-tabs [aria-pressed="true"]')).toHaveText(
      topics[i] as string,
    );
    await expect(page.locator('.sticker-count')).toHaveText(counts[i] as string);
  }
  await expect(page.locator('#dialog kbd')).toHaveCount(0);
  // dispatchEvent for dialog closes too: a plain #close-dialog click has hung on the
  // stability check on this VM (same slow-frame cause as #learn / #sticker-next).
  await waitDialogSettled(page);
  await page.locator('#close-dialog').dispatchEvent('click');
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});

test('a table seeded at 13 of 18 facts at box 4 earns its sticker; 12 does not', async ({
  page,
}) => {
  await play(page);
  await page.evaluate((seed) => window.__game?.seedFactStats(seed), seedTable(13));
  await page.evaluate(() => window.__game?.seedFactStats({ 'sk:geo-midpoint': { box: 4 } }));
  await openBook(page);
  await expect(page.locator('.sticker-count')).toHaveText('1/8');
  await expect(page.locator('[data-sticker="table:3"]')).toHaveClass(/earned/);
  await page.locator('[data-sticker="table:3"]').dispatchEvent('click');
  await expect(page.locator('.sticker-detail')).toContainText('Bảng nhân 3 — bạn đã thuộc!');
  for (let i = 0; i < 4; i++) await page.locator('#sticker-next').dispatchEvent('click');
  await expect(page.locator('.sticker-count')).toHaveText('1/10');
  await expect(page.locator('[data-sticker="sk:geo-midpoint"]')).toHaveClass(/earned/);
  await page.locator('[data-sticker="sk:geo-midpoint"]').dispatchEvent('click');
  await expect(page.locator('.sticker-detail')).toContainText('Điểm ở giữa — bạn đã thuộc!');
  await expect(page.locator('.sticker-detail')).toContainText('SGK Toán 3');
  await waitDialogSettled(page);
  await page.locator('#close-dialog').dispatchEvent('click');
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  // No sticker field anywhere in the store: the book is derived, not stored. (A reload
  // check was dropped: `page.reload()` hung three runs in a row on this 1.5-CPU VM —
  // once on the `load` event, once on `domcontentloaded`, once on the #play stability
  // check — while the store's own reload specs pass. Reload persistence of the
  // underlying stats is covered by stage-migration.spec.ts; the derivation from an
  // old save's boxes is covered by the unit test.)
  const snap = await page.evaluate(() => window.__game?.snapshot());
  expect(snap).not.toHaveProperty('sticker');
  await openBook(page);
  await expect(page.locator('.sticker-count')).toHaveText('1/8');
});

test('a table at 12 of 18 facts at box 4 does not earn its sticker', async ({ page }) => {
  await play(page);
  await page.evaluate((seed) => window.__game?.seedFactStats(seed), seedTable(12));
  await openBook(page);
  await expect(page.locator('.sticker-count')).toHaveText('0/8');
  await expect(page.locator('[data-sticker="table:3"]')).not.toHaveClass(/earned/);
});

/** Seeds table 3 at 12/18 box 4 + mul:3x7 at box 3, answers 3x7 cleanly in the practice quiz. */
async function earnTable3Sticker(page: Page): Promise<void> {
  const seed: Record<string, { box: number }> = {};
  for (const key of TABLE3_BOX4) seed[key] = { box: 4 };
  seed['mul:3x7'] = { box: 3 };
  await page.evaluate((s) => window.__game?.seedFactStats(s), seed);
  // Practice quiz over all tables: the average box stays below 3, so no word problem appears.
  // dispatchEvent: no actionability wait — plain clicks on these toolbar buttons have hung
  // on "scrolling into view" on this VM while SwiftShader frames render at ~1 fps.
  await page.locator('#learn').dispatchEvent('click');
  await page.locator('#practice-all').dispatchEvent('click');
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  let answeredTarget = false;
  for (let q = 0; q < 15 && !answeredTarget; q++) {
    const equation = (await page.locator('.equation').textContent()) ?? '';
    const [a, b] = (equation.match(/\d+/g) ?? []).map(Number) as [number, number];
    if ((a === 3 && b === 7) || (a === 7 && b === 3)) answeredTarget = true;
    await page.locator(`.answer[data-value="${a * b}"]`).dispatchEvent('click');
    await expect(page.locator('#feedback')).toHaveClass(/success/);
    if (answeredTarget) break;
    await page.locator('#next-question').dispatchEvent('click');
  }
  expect(answeredTarget).toBe(true);
  await waitDialogSettled(page);
  await page.locator('#close-dialog').dispatchEvent('click');
  // The batch commits on close: the fact reaches box 4 and the sticker is earned.
  await expect
    .poll(() => page.evaluate(() => window.__game?.snapshot()?.factStats['mul:3x7']?.box))
    .toBe(4);
}

test('one clean quiz answer moves a fact to box 4 and earns the table sticker', async ({
  page,
}) => {
  await play(page);
  await earnTable3Sticker(page);
  await expect
    .poll(() => page.evaluate(() => window.__game?.pendingEarningLines()))
    .toContain('Bạn vừa dán được hình Bảng nhân 3!');
  await openBook(page);
  await expect(page.locator('.sticker-count')).toHaveText('1/8');
  await expect(page.locator('[data-sticker="table:3"]')).toHaveClass(/earned/);
});

test('VLM says the earning line once, then offers the book from his dialog', async ({
  page,
}, testInfo) => {
  const touch = testInfo.project.name !== 'desktop-chromium';
  await play(page);
  await earnTable3Sticker(page);
  // Walk to VLM (he stands at -3, 1.5): stop 2 steps beside him, not on his tile, then wait
  // for the frame hook to confirm he is near — talkToGuide reads that same nearMilo flag,
  // and clicking before a post-teleport frame ran has silently shown the "come closer" toast.
  await page.evaluate(() => window.__game?.teleport(-1, 1.5));
  await expect(page.locator('#milo-label')).toHaveClass(/near/);
  await expect(page.locator('#interact')).toContainText('VLM');
  // dispatchEvent: no actionability wait — the stability check has hung on this VM while
  // the world's SwiftShader frames render at ~1 fps.
  await page.locator('#interact').dispatchEvent('click');
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await expectDialogFits(page);
  await expect(page.locator('#dialog')).toContainText('Bạn vừa dán được hình Bảng nhân 3!');
  const guideButton = page.locator('#open-sticker-book-guide');
  await expect(guideButton).toHaveText('📖 Sổ dán hình');
  const guideBox = await guideButton.boundingBox();
  expect(guideBox?.height).toBeGreaterThanOrEqual(44);
  await tapOrClick(page, '#open-sticker-book-guide', touch);
  await expect(page.locator('.sticker-count')).toHaveText('1/8');
  await waitDialogSettled(page);
  await page.locator('#close-dialog').dispatchEvent('click');
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  // The line is consumed on read: talking to VLM again does not repeat it.
  // The world unpauses on the dialog 'close' event — wait for it before talking again:
  // clicking #interact while still paused silently does nothing (interactWithNearest
  // returns early), and the unpause has been observed to lag the close by a few seconds.
  await expect
    .poll(() =>
      page.evaluate(
        () => (window as unknown as { __parity?: { paused?: boolean } }).__parity?.paused,
      ),
    )
    .toBe(false);
  await expect(page.locator('#milo-label')).toHaveClass(/near/);
  await page.locator('#interact').dispatchEvent('click');
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await expect(page.locator('#dialog')).not.toContainText('Bạn vừa dán được hình Bảng nhân 3!');
  await expect(page.locator('#open-sticker-book-guide')).toBeVisible();
  await waitDialogSettled(page);
  await page.locator('#close-dialog').dispatchEvent('click');
});

test('the book never opens while a level runs', async ({ page }) => {
  await play(page);
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  await page.evaluate(() => window.__game?.teleportToGate('field'));
  await expect(page.locator('#interact')).toContainText('Vào Cổng Cánh Đồng Phép Tính');
  await page.locator('#interact').click();
  await page.waitForFunction(() => window.__field?.state().phase !== undefined);
  await page.evaluate(() => window.__game?.openStickerBook());
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  // dispatchEvent: no actionability wait — the stability check has hung on this VM
  // while the level's SwiftShader frames render at ~1 fps.
  await page.locator('.level-leave').dispatchEvent('click');
  await page.waitForFunction(() => window.__game?.levelRunning() === false);
});
