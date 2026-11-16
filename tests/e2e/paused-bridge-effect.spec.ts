// Bridge reward effect while paused (PR #4 follow-up): answering a bridge question
// correctly drops a segment from y=3 with a spark burst behind the quiz dialog.
// The world loop keeps simulating while paused, but 00379fb rendered only one frame
// at setBridge, so the child saw the segment hang mid-air and the burst frozen —
// by the time the dialog closed the segment had already landed. The loop must keep
// rendering every frame while the effect plays, then stop when it ends (the shop
// never spawns these effects, so shop:143 keeps its one-frame-while-paused benefit).
import { type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

/** `renderer.info.render.frame`: incremented once per render() call. */
async function renderFrames(page: Page): Promise<number> {
  return page.evaluate(() => window.__parity?.renderer.info.render.frame ?? -1);
}

/**
 * True while a reward effect is still playing: sparks alive, or a bridge segment
 * still above y=0. `sparks`/`bridge` are World fields outside the public API
 * surface, so they are read through a structural cast (test-only observation).
 */
async function effectsActive(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const world = window.__parity as unknown as {
      sparks: readonly unknown[];
      bridge: { children: readonly { position: { y: number } }[] };
    } | null;
    if (!world) return false;
    if (world.sparks.length > 0) return true;
    return world.bridge.children.some((segment) => segment.position.y > 0);
  });
}

test('correct bridge answer: the falling segment and burst keep rendering behind the dialog, then stop', async ({
  page,
}) => {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  // Open the bridge quiz: talk to VLM, accept the quest.
  await page.evaluate(() => window.__game?.teleport(-3, 3.6));
  await page.locator('#interact').click();
  await page.locator('#accept-quest').click();
  // Answer the first question correctly (the stone count in the equation is the answer).
  const equation = (await page.locator('.equation').textContent()) ?? '';
  const stones = equation.match(/\d+/)?.[0];
  const before = await renderFrames(page);
  // dispatchEvent: no actionability wait (frames are slow behind the blurred dialog).
  await page.locator(`.answer[data-value="${stones}"]`).dispatchEvent('click');
  await expect(page.locator('#feedback')).toHaveClass(/success/);
  // While the segment falls the loop must keep drawing: frames grow well past the
  // single setBridge redraw (on 00379fb the count rises by exactly 1, then stops).
  await expect.poll(() => renderFrames(page), { timeout: 60_000 }).toBeGreaterThan(before + 2);
  // Once the segment has landed and the sparks are gone, the loop must stop drawing
  // again. The effect's wall time stretches on slow software rendering (the frame
  // delta is clamped to 0.05 s), so this poll is generous.
  await expect.poll(() => effectsActive(page), { timeout: 120_000 }).toBe(false);
  const settled = await renderFrames(page);
  await page.waitForTimeout(8000);
  expect(await renderFrames(page)).toBe(settled);
});
