// Clock setter (TASK R37): the new set-clock step for B66 — the child drags the
// minute and hour hands to the given time and presses "Xong". Runs on
// desktop-chromium + tablet-portrait + mobile-pixel (R37); tablet-landscape is
// skipped (same touch path as tablet-portrait, no separate layout).
// Seeding: the other nine B66 skills sit at box 4 and time-set-clock at box 1, so
// the planner puts the set-clock item first; B66 is opened from its picker row,
// not "Học tiếp" (nine skills at box 4 would already be 3 stars).
import { type Locator, type Page, test } from '@playwright/test';
import { skillsOfLesson } from '../../src/learning/kntt-lesson-index';
import { expect, SLOW_TEST_MS } from './legacy-live-save-fixtures';
import {
  boot,
  isTouch,
  openPicker,
  playLessonRun,
  setClockViaButtons,
} from './lesson-walkthrough-helpers';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS * 3 });

const onlyClockProjects = (projectName: string) =>
  test.skip(
    projectName !== 'desktop-chromium' &&
      projectName !== 'tablet-portrait' &&
      projectName !== 'mobile-pixel',
    'R37 clock setter runs on desktop + tablet-portrait + mobile-pixel only',
  );

/** The other nine B66 skills at box 4; time-set-clock stays unseeded (box 1). */
async function seedB66(page: Page): Promise<void> {
  const others = skillsOfLesson(66).filter((k) => k !== 'sk:time-set-clock');
  const stats = Object.fromEntries(others.map((k) => [k, { box: 4, attempts: 3, correct: 3 }]));
  await page.evaluate((s) => window.__game?.seedFactStats(s), stats);
}

async function openTopic(page: Page, topic: number, touch: boolean): Promise<void> {
  const summary = page.locator(`details.lesson-topic[data-topic="${topic}"] summary`);
  const details = page.locator(`details.lesson-topic[data-topic="${topic}"]`);
  if (!(await details.evaluate((el) => (el as HTMLDetailsElement).open))) {
    if (touch) await summary.tap();
    else await summary.click();
    await expect(details).toHaveAttribute('open', '');
  }
}

/** Open B66 from its picker row and return the set-clock target of its first item. */
async function openB66(page: Page, touch: boolean): Promise<{ h: number; m: number }> {
  await seedB66(page);
  await openPicker(page, touch);
  await openTopic(page, 13, touch);
  const row = page.locator('button.lesson-row[data-lesson="66"]');
  if (touch) await row.tap();
  else await row.click();
  await expect(page.locator('#dialog-content')).toContainText('Bài 66 ·');
  const state = await page.evaluate(() => window.__lesson?.state() ?? null);
  expect(state?.skillId, 'first B66 item is the new set-clock skill').toBe('time-set-clock');
  const steps = await page.evaluate(() => window.__lesson?.steps() ?? null);
  expect(steps).toHaveLength(1);
  const step = steps?.[0];
  if (step?.kind !== 'set-clock') throw new Error('first B66 step is not set-clock');
  return { h: step.h, m: step.m };
}

const digital = (h: number, m: number) => `${h}:${String(m).padStart(2, '0')}`;

/** Drag one hand from `fromAngle` to `toAngle` (0 = 12 o'clock, clockwise) at radius r. */
async function dragHand(
  page: Page,
  face: Locator,
  fromAngle: number,
  toAngle: number,
  radius: number,
): Promise<void> {
  const box = await face.boundingBox();
  if (!box) throw new Error('clock face has no box');
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const point = (angleDeg: number) => {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.sin(a), y: cy - radius * Math.cos(a) };
  };
  const from = point(fromAngle);
  const to = point(toAngle);
  await page.mouse.move(from.x, from.y);
  await page.mouse.down();
  await page.mouse.move(to.x, to.y, { steps: 12 });
  await page.mouse.up();
}

test('B66 set-clock: drag minute then hour hands, Xong, run finishes', async ({ page }, info) => {
  onlyClockProjects(info.project.name);
  const touch = isTouch(info);
  await boot(page);
  const target = await openB66(page, touch);
  const panel = page.locator('#dialog-content');
  const row = panel.locator('.daily-steps .kit-step').nth(0);
  const face = row.locator('.kit-clock-setter__face');
  const readout = row.locator('.kit-clock-setter__readout');
  // Both hands are 44 px wide touch targets at 12:00 (before any rotation).
  for (const hand of ['hour', 'minute']) {
    const box = await row.locator(`.kit-clock-setter__hand--${hand}`).boundingBox();
    expect(box?.width, `${hand} hand is a 44px target`).toBe(44);
  }
  // Minute hand first (grab near its tip, radius 80), then the hour hand from
  // where the minutes left it (12 + m/60 hours, grab near its tip, radius 58).
  await dragHand(page, face, 0, target.m * 6, 80);
  await expect(readout).toContainText(`12:${String(target.m).padStart(2, '0')}`);
  await dragHand(page, face, target.m / 2, (target.h + target.m / 60) * 30, 58);
  await expect(readout).toContainText(digital(target.h, target.m));
  const done = row.locator('.kit-clock-setter__done');
  if (touch) await done.tap();
  else await done.click();
  await expect(row).toHaveClass(/kit-step--done/);
  // The run advances and finishes through the shared solver (5 items left).
  const next = panel.locator('.daily-next');
  if (touch) await next.tap();
  else await next.click();
  expect(await playLessonRun(page, touch)).toBe(5);
  await expect(panel).toContainText('Xong bài 66!');
});

test('B66 set-clock on mobile-pixel: tap the face for minutes, +/− for hours', async ({
  page,
}, info) => {
  test.skip(info.project.name !== 'mobile-pixel', 'touch-tap path runs on mobile-pixel only');
  await boot(page);
  const target = await openB66(page, true);
  const panel = page.locator('#dialog-content');
  const row = panel.locator('.daily-steps .kit-step').nth(0);
  const face = row.locator('.kit-clock-setter__face');
  const readout = row.locator('.kit-clock-setter__readout');
  // A real finger tap on the face moves the minute hand there (snap grid applies):
  // tap near the minute tip so the nearer-tip rule picks the minute hand.
  const box = await face.boundingBox();
  if (!box) throw new Error('clock face has no box');
  const a = (target.m * 6 * Math.PI) / 180;
  await page.touchscreen.tap(
    box.x + box.width / 2 + 80 * Math.sin(a),
    box.y + box.height / 2 - 80 * Math.cos(a),
  );
  await expect(readout).toContainText(`12:${String(target.m).padStart(2, '0')}`);
  // Hours by taps on "Giờ +": from 12, target.h % 12 presses reach the target hour.
  for (let i = 0; i < target.h % 12; i++) await row.locator('[data-clock="hour-plus"]').tap();
  await expect(readout).toContainText(digital(target.h, target.m));
  await row.locator('.kit-clock-setter__done').tap();
  await expect(row).toHaveClass(/kit-step--done/);
});

test('B66 set-clock on mobile-pixel: wrong setting, then fix it with −', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile-pixel', 'wrong-then-right runs on mobile-pixel only');
  await boot(page);
  const target = await openB66(page, true);
  const panel = page.locator('#dialog-content');
  const row = panel.locator('.daily-steps .kit-step').nth(0);
  const wrongHour = target.h === 12 ? 1 : target.h + 1;
  // Minutes right, hour one past the target: Xong must not finish the step.
  await setClockViaButtons(page, row, { h: wrongHour, m: target.m }, true);
  await row.locator('.kit-clock-setter__done').tap();
  await expect(row).not.toHaveClass(/kit-step--done/);
  // One tap on "Giờ −" brings the hour back; Xong now finishes the step.
  await row.locator('[data-clock="hour-minus"]').tap();
  await expect(row.locator('.kit-clock-setter__readout')).toContainText(
    digital(target.h, target.m),
  );
  await row.locator('.kit-clock-setter__done').tap();
  await expect(row).toHaveClass(/kit-step--done/);
});
