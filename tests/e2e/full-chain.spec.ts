// The whole 9-stage chain bridge → field → forest → city → tower → garden → valley → workshop →
// cave → done, on desktop, phone and both tablet orientations: seed progression stage by stage and
// check every gate's status, the quest card (title, progress, "Chương n · k/m" label and cells),
// VLM's pointer line and the map ("Sắp ra mắt" nowhere); enter each newly opened gate once and
// leave through the host's "Về thế giới" button (≥44 px tall on touch screens). Touch projects
// use tap() only. Uses the test-build hook `window.__game`.
import { type Locator, type Page, test } from '@playwright/test';
import { CHAIN, chapterRow, STAGES, type Stage } from './full-chain-stages';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 4 });

/** Tap on touch projects, click with a mouse. */
type Press = (target: Locator) => Promise<void>;

const statuses = (page: Page) =>
  page.evaluate((ids) => ids.map((id) => window.__game?.gateStatus(id)), [...CHAIN]);

/** Every quest step cell shows its name on one line: not clipped, one line box. */
async function expectStepsOnOneLine(page: Page): Promise<void> {
  const cells = await page.locator('#quest-steps > span').evaluateAll((spans) =>
    spans.map((s) => {
      const range = document.createRange();
      range.selectNodeContents(s);
      const lineTops = new Set([...range.getClientRects()].map((r) => Math.round(r.top)));
      return {
        text: s.textContent ?? '',
        clipped: s.scrollWidth > s.clientWidth,
        lines: lineTops.size,
      };
    }),
  );
  for (const cell of cells) {
    expect(cell.clipped, cell.text).toBe(false);
    expect(cell.lines, cell.text).toBeLessThanOrEqual(1);
  }
}

async function expectCard(page: Page, index: number, stage: Stage): Promise<void> {
  const row = chapterRow(index);
  await expect(page.locator('#quest-toggle .eyebrow')).toHaveText('NHIỆM VỤ TIẾP THEO');
  await expect(page.locator('#quest-title')).toHaveText(stage.title);
  await expect(page.locator('#quest-progress')).toHaveText(stage.progress);
  await expect(page.locator('#quest-copy')).toContainText(`✨ ${stage.gate}`);
  await expect(page.locator('#quest-chapter')).toHaveText(row.label);
  const cells = page.locator('#quest-steps > span');
  await expect(cells).toHaveCount(row.cells.length);
  for (const [i, label] of row.cells.entries()) {
    await expect(cells.nth(i)).toHaveAttribute('aria-label', label);
  }
  await expect(page.locator('#quest-steps .done')).toHaveCount(row.done);
  await expectStepsOnOneLine(page);
}

async function expectVlmPointsAt(page: Page, press: Press, gate: string): Promise<void> {
  await page.evaluate(() => window.__game?.teleport(-3, 3.6));
  await expect(page.locator('#interact')).toContainText('Nói chuyện với VLM');
  await press(page.locator('#interact'));
  await expect(page.locator('#dialog .dialog-copy')).toContainText(gate);
  await press(page.locator('#close-dialog'));
  await expect(page.locator('#dialog')).not.toBeVisible();
}

async function expectMapWithoutComingSoon(page: Page, press: Press, stage: Stage): Promise<void> {
  // Phones hide the toolbar's map button: the minimap in the corner opens the map there.
  const button = page.locator('#open-map');
  await press((await button.isVisible()) ? button : page.locator('#minimap'));
  await expect(page.locator('#world-map')).toBeVisible();
  await expect(page.locator('#map-regions')).not.toContainText('Sắp ra mắt');
  await press(page.locator(`[data-region="${stage.region}"]`));
  await expect(page.locator('#map-detail .map-gate')).toHaveText('Cổng màn chơi: Cổng đã mở');
  await press(page.locator('#close-map'));
  await expect(page.locator('#world-map')).toBeHidden();
}

async function enterAndLeave(page: Page, press: Press, touch: boolean, stage: Stage) {
  await page.evaluate((id) => window.__game?.teleportToGate(id), stage.levelId);
  await expect(page.locator('#interact')).toContainText(`Vào ${stage.gate}`);
  await press(page.locator('#interact'));
  const layer = page.locator('.level-layer');
  await expect(layer).toBeVisible();
  await expect(layer).toHaveAttribute('aria-label', stage.gate);
  expect(await page.evaluate(() => window.__game?.levelRunning())).toBe(true);
  // The level has drawn its own UI into the layer, next to the host's leave button.
  await expect(layer.locator(':scope > :not(.level-leave)').first()).toBeVisible();
  const leave = page.locator('.level-leave');
  await expect(leave).toHaveText('Về thế giới');
  // Owner check for the host's leave button: a 44 px tap target on touch screens, every level.
  const box = await leave.boundingBox();
  if (touch) expect(box?.height ?? 0, `${stage.levelId} leave height`).toBeGreaterThanOrEqual(44);
  await press(leave);
  await expect.poll(() => page.evaluate(() => window.__game?.levelRunning())).toBe(false);
  await expect(layer).toHaveCount(0);
  // Leaving before any answer commits nothing: the gate stays open.
  expect(await page.evaluate((id) => window.__game?.gateStatus(id), stage.levelId)).toBe('open');
}

test('the 9-stage chain: each stage opens the next gate, every level loads and exits', async ({
  page,
}, info) => {
  const touch = !!info.project.use.hasTouch;
  const press: Press = (target) => (touch ? target.tap() : target.click());
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await press(page.locator('#play'));
  await expect(page.locator('body')).toHaveClass(/playing/);

  // Stage 1, the bridge: every gate locked, the legacy card without a chapter label.
  expect(await statuses(page)).toEqual(CHAIN.map(() => 'locked'));
  await expect(page.locator('#quest-title')).toHaveText('Một cây cầu, ngàn niềm vui');
  await expect(page.locator('#quest-progress')).toHaveText('Gặp người dẫn đường');
  await expect(page.locator('#quest-chapter')).toHaveCount(0);
  await expect(page.locator('#gate-field-label small')).toHaveText('Đi qua cầu để mở');
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));

  for (const [i, stage] of STAGES.entries()) {
    // Seed the levels before this stage as completed (the hook adds to what is already done).
    await page.evaluate(
      (done) => window.__game?.seedProgress({ completedLevels: done }),
      CHAIN.slice(0, i),
    );
    expect(await statuses(page)).toEqual(
      CHAIN.map((_, j) => (j < i ? 'completed' : j === i ? 'open' : 'locked')),
    );
    await expectCard(page, i, stage);
    await expect(page.locator(`#gate-${stage.levelId}-label small`)).toHaveText('Cổng đã mở');
    await expect(page.locator('body')).not.toContainText('Sắp ra mắt');

    await expectVlmPointsAt(page, press, stage.gate);
    await expectMapWithoutComingSoon(page, press, stage);
    await enterAndLeave(page, press, touch, stage);
  }

  // Done: the closing card shows chapter 2 complete; every gate is completed.
  await page.evaluate(() => window.__game?.seedProgress({ completedLevels: ['cave'] }));
  expect(await statuses(page)).toEqual(CHAIN.map(() => 'completed'));
  await expect(page.locator('#quest-toggle .eyebrow')).toHaveText('CHÚC MỪNG BẠN');
  await expect(page.locator('#quest-title')).toHaveText('Bạn đã qua cả chín chặng!');
  await expect(page.locator('#quest-progress')).toHaveText('✓ Hoàn thành');
  await expect(page.locator('#quest-chapter')).toHaveText('Chương 2 · 4/4');
  await expect(page.locator('#quest-steps .done')).toHaveCount(4);
  await expect(page.locator('body')).not.toContainText('Sắp ra mắt');
  expect(errors).toEqual([]);
});
