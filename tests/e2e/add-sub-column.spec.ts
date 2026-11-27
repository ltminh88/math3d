// Column-calc scene (boost, Phase 2A): B2 replays reach the add-sub-column skill,
// its column picture draws (operands, rule, '?' result row, units focused), and
// the digit + verdict steps solve it. The pinned profile puts the column skill
// in run 1 (verified offline with lessonSeed + planLessonRun), but the spec
// replays up to 8 runs so it does not depend on that.
import { type Locator, type Page, test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitDialogSettled } from './legacy-live-save-fixtures';
import {
  boot,
  isTouch,
  openPicker,
  type PlannedStep,
  solveSetClock,
} from './lesson-walkthrough-helpers';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 3 });

// The pinned profile id (copied from lesson-practice.spec.ts, where it is local):
// the same deterministic B2 seed chain the coverage test relies on.
const PINNED_PROFILE_UUID = '00000000-0000-4000-8000-000000000005';

/** Crypto.prototype with the pinned-UUID override state (see pinProfileUuid). */
type PinnedCryptoPrototype = Crypto & {
  __pinnedUuid?: string;
};

async function pinProfileUuid(page: Page): Promise<void> {
  await page.addInitScript((uuid: string) => {
    const proto = Crypto.prototype as unknown as PinnedCryptoPrototype;
    // Keep the real generator: the pinned value is only for the profile id
    // created at boot. Session batches use newId() too, and the store dedupes
    // by batchId — a pinned generator would give every replay the same
    // batchId, so its attempts would be dropped as an "already committed"
    // retry and the run seed would never advance past the first replay.
    const orig = Crypto.prototype.randomUUID as (this: Crypto) => string;
    proto.__pinnedUuid = uuid;
    Object.defineProperty(Crypto.prototype, 'randomUUID', {
      value: function (this: Crypto) {
        const p = Crypto.prototype as unknown as PinnedCryptoPrototype;
        return p.__pinnedUuid ?? orig.call(this);
      },
      configurable: true,
    });
  }, PINNED_PROFILE_UUID);
}

/** Restores real randomUUIDs once boot has created the pinned profile. */
async function unpinProfileUuid(page: Page): Promise<void> {
  await page.evaluate(() => {
    const proto = Crypto.prototype as unknown as PinnedCryptoPrototype;
    delete proto.__pinnedUuid;
  });
}

async function pickLesson(page: Page, n: number, touch: boolean): Promise<void> {
  const row = page.locator(`button.lesson-row[data-lesson="${n}"]`);
  await expect(row).toBeVisible();
  if (touch) await row.tap();
  else await row.click();
}

const blur = (page: Page) =>
  page.evaluate(() => (document.activeElement as HTMLElement | null)?.blur());

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
    await blur(page);
    await page.keyboard.type(String(value));
    await page.keyboard.press('Enter');
  }
}

/** Solves the on-screen skill item from window.__lesson.steps() (no hint tap, so
 * the attempt stays clean — the same solver as lesson-walkthrough-helpers, whose
 * copy is local there). */
async function solveSkillItem(page: Page, touch: boolean): Promise<void> {
  const hook = await page.evaluate(() => {
    const h = window.__lesson;
    return h ? { steps: h.steps() as PlannedStep[] | null } : null;
  });
  if (!hook?.steps) throw new Error('lesson skill hook missing');
  const panel = page.locator('#dialog-content');
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
    else if (step.kind === 'set-clock') await solveSetClock(page, row, step, touch);
    else if (step.kind === 'order') {
      for (const ti of step.answer)
        await press(
          page,
          row
            .locator('.kit-order__bank')
            .getByRole('button', { name: step.tiles[ti], exact: true }),
          touch,
        );
      await press(page, row.locator('.kit-order__done'), touch);
    } else if (step.kind === 'match') {
      throw new Error('match steps are not played by this solver');
    } else {
      for (const id of step.ids) await press(page, row.locator(`[data-choice="${id}"]`), touch);
      await press(page, row.locator('.kit-multi__done'), touch);
    }
    await expect(row).toHaveClass(/kit-step--done/);
  }
  await expect(panel.locator('.feedback')).toHaveClass(/success/);
}

async function clickNext(page: Page, touch: boolean): Promise<void> {
  const next = page.locator('#dialog-content .daily-next');
  await expect(next).toBeVisible();
  if (touch) await next.tap();
  else await next.click();
}

test('column-calc: B2 reaches the column skill, its scene draws, digits + verdicts solve it', async ({
  page,
}, info) => {
  const touch = isTouch(info);
  // Replays are slow under SwiftShader (see the run-B2 coverage test), so the
  // budget is 20 minutes like that test.
  test.setTimeout(SLOW_TEST_MS * 5);
  await pinProfileUuid(page);
  await boot(page);
  await unpinProfileUuid(page);
  await openPicker(page, touch);
  await pickLesson(page, 2, touch);
  await expect(page.locator('#dialog-content')).toContainText(
    'Bài 2 · Cộng, trừ trong phạm vi 1 000 · Câu 1/6',
  );
  const panel = page.locator('#dialog-content');
  let runs = 0;
  let solvedColumn = false;
  for (;;) {
    const state = await page.evaluate(() => window.__lesson?.state() ?? null);
    if (!state) throw new Error('lesson hook missing');
    if (state.index >= state.total) {
      runs++;
      if (runs >= 8) throw new Error('add-sub-column not found in 8 B2 replays');
      const replay = page.locator('#lesson-replay');
      if (touch) await replay.tap();
      else await replay.click();
      await expect(panel).toContainText('Bài 2 · Cộng, trừ trong phạm vi 1 000 · Câu 1/6');
      continue;
    }
    if (state.kind !== 'skill') throw new Error('B2 has no quiz items');
    if (state.skillId !== 'add-sub-column') {
      await solveSkillItem(page, touch);
      await clickNext(page, touch);
      continue;
    }
    // The column item is on screen: the picture draws above the steps.
    const scene = panel.locator('.daily-scene svg.dialog-scene');
    await expect(scene).toBeVisible();
    await expect(scene).toHaveAttribute('aria-label', /^Đặt tính: \d+ [+\u2212] \d+$/);
    // The result row starts unfilled ('?'), the first step asks for the units digit.
    const sceneText = await scene.evaluate((el) => el.textContent ?? '');
    expect(sceneText).toContain('?');
    await expect(panel).toContainText('Hàng đơn vị');
    await solveSkillItem(page, touch);
    await clickNext(page, touch);
    solvedColumn = true;
    break;
  }
  expect(solvedColumn, 'a column item was played').toBe(true);
  // After the column item, the run continues (next item) or finishes.
  await expect(panel).toContainText(/Câu \d\/6|Xong bài 2!/);
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
});
