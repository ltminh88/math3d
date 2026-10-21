// Real v1 saves captured from the live site (math.aigame3d.com) by phase 01 (baselines/live,
// desktop-chromium playthrough shots), plus HUD assertions shared by the migration specs.
import { expect as baseExpect, type Page } from '@playwright/test';

/**
 * SwiftShader renders ~1 frame/s while the modal dialog blurs the 3D world, so actionability
 * checks (which wait for animation frames) and parallel workers make UI steps slow: allow it.
 */
export const expect = baseExpect.configure({ timeout: 30_000 });
export const SLOW_TEST_MS = 240_000;

export const SAVE_KEY = 'aigame3d_multiplication_save';

/** playthrough--after-quest: bridge built and crossed (quest complete). */
export const LIVE_SAVE_QUEST_COMPLETE =
  '{"version":1,"xp":110,"coins":40,"bridge":6,"questAccepted":true,"questComplete":true,"avatar":"boy","table":0,"sound":true,"music":false,"combo":5,"questionStats":{"m2_8":{"attempts":3,"correct":2,"wrong":1,"lastAnsweredAt":"2026-10-18T12:00:01.744Z","responseTime":16},"m4_2":{"attempts":3,"correct":2,"wrong":1,"lastAnsweredAt":"2026-10-18T12:00:01.792Z","responseTime":16},"m6_10":{"attempts":1,"correct":1,"wrong":0,"lastAnsweredAt":"2026-10-18T12:00:01.824Z","responseTime":16},"m10_1":{"attempts":1,"correct":1,"wrong":0,"lastAnsweredAt":"2026-10-18T12:00:01.856Z","responseTime":16}},"review":[],"started":true}';

/** playthrough--quiz-correct-3: mid-quest, 3 of 6 segments, one fact queued for review. */
export const LIVE_SAVE_MID_QUEST =
  '{"version":1,"xp":30,"coins":15,"bridge":3,"questAccepted":true,"questComplete":false,"avatar":"boy","table":0,"sound":true,"music":false,"combo":2,"questionStats":{"m2_8":{"attempts":3,"correct":2,"wrong":1,"lastAnsweredAt":"2026-10-18T12:00:01.744Z","responseTime":16},"m4_2":{"attempts":2,"correct":1,"wrong":1,"lastAnsweredAt":"2026-10-18T12:00:01.712Z","responseTime":16}},"review":["m4_2"],"started":true}';

export interface HudExpectation {
  level: string;
  coins: string;
  xpText: string;
  bridgeBuilt: number;
  /** Done cells in the quest card's step row (bridge segments, or quests once past the bridge). */
  questStepsDone: number;
  questProgress: string;
  play: RegExp;
}

export const QUEST_COMPLETE_HUD: HudExpectation = {
  level: '2',
  coins: '40',
  xpText: '10 / 150 XP',
  bridgeBuilt: 6,
  // Past the bridge the card shows the next quest of the chain: the field gate.
  questStepsDone: 1,
  questProgress: 'Đến Cổng Cánh Đồng',
  play: /Tiếp tục phiêu lưu/,
};

/** The store has opened and the progress view is hydrated (src/ui/store-boot.ts). */
export async function waitForStoreBoot(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'ready');
}

/** Waits for the store to hydrate, then checks HUD + world bridge. */
export async function expectHud(page: Page, hud: HudExpectation): Promise<void> {
  await waitForStoreBoot(page);
  await expect(page.locator('#play')).toHaveText(hud.play);
  await expect(page.locator('#level')).toHaveText(hud.level);
  await expect(page.locator('#coins')).toHaveText(hud.coins);
  await expect(page.locator('#xp-text')).toHaveText(hud.xpText);
  await expect(page.locator('#quest-progress')).toHaveText(hud.questProgress);
  await expect(page.locator('#quest-steps .done')).toHaveCount(hud.questStepsDone);
  await expect(page.locator('#avatar-face')).toHaveText('👦');
  const bridge = await page.evaluate(
    () => (window as unknown as { __parity?: { bridgeCount: number } }).__parity?.bridgeCount,
  );
  expect(bridge).toBe(hud.bridgeBuilt);
}
