// Shared solver + seeding for the lesson-walkthrough e2e spec and the manual
// 81-lesson script (TASK R18). Not a spec itself (no *.spec.ts suffix), so the
// test runner never picks it up. Solves through the UI exactly like a child:
// number pad / choices / verdict / multi via `window.__lesson`, quiz items by
// parsing the shown equation. The solver takes NO hints: a perfect player
// answers first-try without hints, so clean attempts promote the Leitner box.
import type { Locator, Page, TestInfo } from '@playwright/test';
import { skillsOfLesson } from '../../src/learning/kntt-lesson-index';
import { expect, waitDialogSettled } from './legacy-live-save-fixtures';

export type PlannedStep =
  | { kind: 'number'; answer: number }
  | { kind: 'choice'; label: string }
  | { kind: 'multi'; ids: string[] }
  | { kind: 'verdict'; answer: boolean }
  | { kind: 'set-clock'; h: number; m: number }
  | { kind: 'order'; tiles: string[]; answer: number[] }
  | { kind: 'match'; left: string[]; right: string[]; pairs: number[] };

export const isTouch = (info: TestInfo) => info.project.use.hasTouch === true;

export async function boot(page: Page): Promise<void> {
  await page.goto('/');
  await expect(page.locator('html')).toHaveAttribute('data-boot', 'ready', { timeout: 120_000 });
  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
}

export async function openPicker(page: Page, touch: boolean): Promise<void> {
  const button = page.locator('#open-lesson');
  await expect(button).toBeVisible();
  if (touch) await button.tap();
  else await button.click();
  await expect(page.locator('#dialog')).toHaveAttribute('open', '');
  await expect(page.locator('#dialog-content')).toContainText('Chọn bài để luyện');
}

export async function closePicker(page: Page): Promise<void> {
  await waitDialogSettled(page);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#dialog')).not.toHaveAttribute('open', '');
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

/** Sets a clock-setter step to (h, m) with the +/− buttons, reading the live readout
 * after each press — snap-agnostic (the minute step is the widget's grid, 5 or 1).
 * The widget starts at 12:00, so hour+ cycles forward to the target hour and
 * minute+ to the target minute; a wrong target throws instead of looping forever. */
export async function setClockViaButtons(
  page: Page,
  row: Locator,
  target: { h: number; m: number },
  touch: boolean,
): Promise<void> {
  const readout = row.locator('.kit-clock-setter__readout');
  const read = async (): Promise<{ h: number; m: number }> => {
    const text = (await readout.textContent()) ?? '';
    const match = /(\d+):(\d{2})/.exec(text);
    if (!match) throw new Error(`clock readout not parsed: ${text}`);
    return { h: Number(match[1]), m: Number(match[2]) };
  };
  for (let i = 0; i < 12; i++) {
    if ((await read()).h === target.h) break;
    await press(page, row.locator('[data-clock="hour-plus"]'), touch);
  }
  for (let i = 0; i < 60; i++) {
    if ((await read()).m === target.m) break;
    await press(page, row.locator('[data-clock="minute-plus"]'), touch);
  }
  const current = await read();
  if (current.h !== target.h || current.m !== target.m)
    throw new Error(
      `clock setter did not reach ${target.h}:${target.m}, at ${current.h}:${current.m}`,
    );
}

/** Sets the clock with the +/− buttons, then presses "Xong". */
export async function solveSetClock(
  page: Page,
  row: Locator,
  target: { h: number; m: number },
  touch: boolean,
): Promise<void> {
  await setClockViaButtons(page, row, target, touch);
  await press(page, row.locator('.kit-clock-setter__done'), touch);
}

async function solveQuizItem(page: Page, touch: boolean): Promise<void> {
  const content = page.locator('#dialog-content');
  const equation = await content.locator('.equation').textContent();
  const m = equation?.match(/(\d+)\s*([×:])\s*(\d+)/);
  if (!m) throw new Error(`cannot parse equation: ${equation}`);
  const [a, b] = [Number(m[1]), Number(m[3])];
  const answer = m[2] === '×' ? a * b : a / b;
  const answers = content.locator('.answers .answer');
  const values = await answers.evaluateAll((els) =>
    els.map((el) => Number((el as HTMLElement).dataset.value)),
  );
  const index = values.indexOf(answer);
  if (index === -1) throw new Error(`answer ${answer} not among ${values}`);
  if (touch) await answers.nth(index).tap();
  else await answers.nth(index).click();
  await expect(content.locator('#feedback')).toHaveClass(/success/);
}

async function solveSkillItem(page: Page, touch: boolean): Promise<void> {
  const hook = await page.evaluate(() => {
    const h = window.__lesson;
    return h ? { steps: h.steps() as PlannedStep[] | null } : null;
  });
  if (!hook?.steps) throw new Error('lesson skill hook missing');
  const panel = page.locator('#dialog-content');
  // No hint tap: the walkthrough plays a perfect player (first-try correct, no
  // hints), so the attempt stays clean and the Leitner box promotes — that is
  // what "one perfect run earns 3 stars" means for 1–2-skill lessons. (The
  // shared solver in lesson-practice.spec.ts taps the hint to cover the hint
  // UI; a hint taken marks the attempt usedHint and blocks promotion.)
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

/** Plays one whole lesson run and leaves the finish screen showing. */
export async function playLessonRun(page: Page, touch: boolean): Promise<number> {
  let items = 0;
  for (;;) {
    const state = await page.evaluate(() => window.__lesson?.state() ?? null);
    if (!state) throw new Error('lesson hook missing');
    if (state.index >= state.total) break;
    items += 1;
    if (state.kind === 'quiz') await solveQuizItem(page, touch);
    else await solveSkillItem(page, touch);
    const nextQuiz = page.locator('#dialog-content #next-question');
    const nextSkill = page.locator('#dialog-content .daily-next');
    if (await nextQuiz.isVisible()) {
      if (touch) await nextQuiz.tap();
      else await nextQuiz.click();
    } else if (await nextSkill.isVisible()) {
      if (touch) await nextSkill.tap();
      else await nextSkill.click();
    } else throw new Error('no next button after solving an item');
  }
  return items;
}

export async function backToPicker(page: Page, touch: boolean): Promise<void> {
  const back = page.locator('#lesson-back');
  if (touch) await back.tap();
  else await back.click();
  await expect(page.locator('#dialog-content')).toContainText('Chọn bài để luyện');
}

/** Seed every key of lessons 1..n-1 to box 4 (3 stars), as if the child finished them. */
export async function seedBefore(
  page: Page,
  n: number,
  overrides: Record<string, { box: number; attempts: number; correct: number }> = {},
): Promise<void> {
  const stats: Record<string, { box: number; attempts: number; correct: number }> = {};
  for (let m = 1; m < n; m++)
    for (const k of skillsOfLesson(m)) stats[k] = { box: 4, attempts: 3, correct: 3 };
  Object.assign(stats, overrides);
  await page.evaluate((s) => window.__game?.seedFactStats(s), stats);
}

/** The lesson "Học tiếp" points at, or undefined when everything is done. */
export async function continueLesson(page: Page): Promise<number | undefined> {
  const el = page.locator('#lesson-continue');
  if ((await el.count()) === 0) return undefined;
  return Number(await el.getAttribute('data-lesson'));
}

export async function rowStars(page: Page, n: number): Promise<number> {
  return Number(
    await page
      .locator(`button.lesson-row[data-lesson="${n}"] .lesson-row__stars`)
      .getAttribute('data-stars'),
  );
}

/** Tap "Học tiếp", play one full run, land on the finish screen. */
export async function playViaContinue(page: Page, touch: boolean, n: number): Promise<void> {
  const cont = page.locator('#lesson-continue');
  await expect(cont).toHaveAttribute('data-lesson', String(n));
  if (touch) await cont.tap();
  else await cont.click();
  await expect(page.locator('#dialog-content')).toContainText(`Bài ${n} ·`);
  expect(await playLessonRun(page, touch)).toBe(6);
  await expect(page.locator('#dialog-content')).toContainText(`Xong bài ${n}!`);
}

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
