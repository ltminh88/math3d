// PWA offline (phase 18 / TASK R22): with the service worker registered (opted in
// with `?pwa=1` — test builds do not register a worker by default), the app loads
// from the precache with the network off, the world map opens, one lesson question
// plays, and a save code still imports while offline.
import { type Locator, type Page, type TestInfo, test } from '@playwright/test';
import { decodeSaveV1 } from '../../src/save/save-storage';
import type { SaveV1 } from '../../src/save/save-types';
import { encodeSaveCode } from '../../src/store/save-code-codec';
import {
  expect,
  expectHud,
  LIVE_SAVE_QUEST_COMPLETE,
  QUEST_COMPLETE_HUD,
  SLOW_TEST_MS,
  waitForStoreBoot,
} from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 2 });

type PlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean }
  | { kind: 'set-clock'; h: number; m: number }
  | { kind: 'order'; tiles: string[]; answer: number[] }
  | { kind: 'match'; left: string[]; right: string[]; pairs: number[] };

declare global {
  interface Window {
    __lesson?: {
      state(): {
        index: number;
        total: number;
        kind: 'quiz' | 'skill';
        factKey: string;
        skillId?: string;
      };
      steps(): PlannedStep[] | null;
    };
  }
}

const liveCode = encodeSaveCode(
  decodeSaveV1(LIVE_SAVE_QUEST_COMPLETE, { cap: false }) as SaveV1,
  {},
);

const isTouch = (info: TestInfo) => info.project.use.hasTouch === true;

/** Loads with `?pwa=1`, waits for the worker to activate, reloads under its control. */
async function gotoWithSw(page: Page): Promise<void> {
  await page.goto('/?pwa=1');
  await waitForStoreBoot(page);
  await page.waitForFunction(() => navigator.serviceWorker.ready, null, {
    timeout: 60_000,
  });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
    timeout: 30_000,
  });
  await waitForStoreBoot(page);
}

/** The store has booted from the precache (the 30 s helper is too short on slow CI). */
async function waitForOfflineBoot(page: Page): Promise<void> {
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'ready', {
    timeout: 120_000,
  });
}

async function press(page: Page, target: Locator, touch: boolean): Promise<void> {
  if (touch) await target.tap();
  else {
    await target.focus();
    await page.keyboard.press('Enter');
  }
}

async function typeNumber(page: Page, pad: Locator, value: number, touch: boolean) {
  if (touch) {
    for (const digit of String(value))
      await pad.getByRole('button', { name: digit, exact: true }).tap();
    await pad.getByRole('button', { name: 'Xong' }).tap();
  } else {
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
  }
}

/** Solves the first item of the open lesson run via the `__lesson` hook. */
async function solveFirstItem(page: Page, touch: boolean): Promise<void> {
  const state = await page.evaluate(() => window.__lesson?.state() ?? null);
  if (!state) throw new Error('lesson hook missing');
  const panel = page.locator('#dialog-content');
  if (state.kind === 'quiz') {
    const equation = await panel.locator('.equation').textContent();
    const m = equation?.match(/(\d+)\s*([×:])\s*(\d+)/);
    if (!m) throw new Error(`cannot parse equation: ${equation}`);
    const [a, b] = [Number(m[1]), Number(m[3])];
    const answer = m[2] === '×' ? a * b : a / b;
    const answers = panel.locator('.answers .answer');
    const values = await answers.evaluateAll((els) =>
      els.map((el) => Number((el as HTMLElement).dataset.value)),
    );
    const index = values.indexOf(answer);
    if (index === -1) throw new Error(`answer ${answer} not among ${values}`);
    if (touch) await answers.nth(index).tap();
    else await answers.nth(index).click();
    await expect(panel.locator('#feedback')).toHaveClass(/success/);
    return;
  }
  const hook = await page.evaluate(() => {
    const h = window.__lesson;
    return h ? { steps: h.steps() as PlannedStep[] | null } : null;
  });
  if (!hook?.steps) throw new Error('lesson skill hook missing');
  for (const [i, step] of hook.steps.entries()) {
    const row = panel.locator('.daily-steps .kit-step').nth(i);
    if (step.kind === 'number') await typeNumber(page, row.locator('.kit-pad'), step.answer, touch);
    else if (step.kind === 'choice')
      await press(
        page,
        row.locator('.kit-choices').getByRole('button', { name: step.label, exact: true }),
        touch,
      );
    else if (step.kind === 'verdict')
      await press(page, row.locator(`[data-verdict="${step.answer}"]`), touch);
    else if (step.kind === 'multi') {
      for (const id of step.ids) await press(page, row.locator(`[data-choice="${id}"]`), touch);
      await press(page, row.locator('.kit-multi__done'), touch);
    } else {
      throw new Error('pwa-offline spec: set-clock steps are not played (B1 only)');
    }
    await expect(row).toHaveClass(/kit-step--done/);
  }
  await expect(panel.locator('.feedback')).toHaveClass(/success/);
}

async function openLessonB1(page: Page, touch: boolean): Promise<void> {
  const button = page.locator('#open-lesson');
  await expect(button).toBeVisible();
  if (touch) await button.tap();
  else await button.click();
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await expect(page.locator('#dialog-content')).toContainText('Chọn bài để luyện');
  const row = page.locator('button.lesson-row[data-lesson="1"]');
  await expect(row).toBeVisible();
  if (touch) await row.tap();
  else await row.click();
  await expect(page.locator('#dialog-content')).toContainText('Bài 1 ·');
}

test('offline reload serves the app from the precache: map opens, one lesson question plays', async ({
  page,
  context,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  const touch = isTouch(info);
  await gotoWithSw(page);
  await context.setOffline(true);
  await page.reload();
  await waitForOfflineBoot(page);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  const mapButton = page.locator('#open-map');
  if (touch) await mapButton.tap();
  else await mapButton.click();
  await expect(page.locator('#world-map')).toBeVisible();
  const closeMap = page.locator('#close-map');
  if (touch) await closeMap.tap();
  else await closeMap.click();
  await expect(page.locator('#world-map')).toBeHidden();
  await openLessonB1(page, touch);
  await solveFirstItem(page, touch);
  expect(errors, 'no page errors while offline').toEqual([]);
});

test('a save code imports while offline and survives a reload', async ({ page, context }) => {
  await gotoWithSw(page);
  await context.setOffline(true);
  await page.reload();
  await waitForOfflineBoot(page);
  await page.locator('#import-save-code').click();
  await page.locator('#save-code-input').fill(liveCode);
  await page.locator('#save-code-confirm').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
  await expectHud(page, QUEST_COMPLETE_HUD);
  await page.reload();
  await waitForOfflineBoot(page);
  await expectHud(page, QUEST_COMPLETE_HUD);
});
