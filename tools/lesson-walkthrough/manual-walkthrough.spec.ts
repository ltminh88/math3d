// Manual 81-lesson walkthrough (phase 21 staging, TASK R18) — NOT part of CI.
// The reviewer runs it by hand when they want to watch "Học tiếp" walk B1→B81
// through the real UI and see the results table:
//
//   E2E_PORT=4181 npx playwright test --config playwright.manual.config.ts \
//     --project=desktop-chromium --workers=1
// (The manual config at the repo root points testDir at tools/lesson-walkthrough/;
// the CI config never picks this file up.)
//
// One boot, then for each lesson 1..81: seed every earlier lesson to 3 stars,
// open the picker, play ONE run via "Học tiếp" (or via the lesson's own row
// when "Học tiếp" does not point at it), and record the stars before/after.
// Prints a markdown table to stdout — redirect it to a file to keep it.
// Takes roughly an hour (81 runs). No test timeout on purpose: it is a manual
// tool, and stopping it halfway still prints the rows done so far on failure.
// Solver + seeding live in ../../tests/e2e/lesson-walkthrough-helpers.
import { expect, type Page, test } from '@playwright/test';
import { lessonByNumber, skillsOfLesson } from '../../src/learning/kntt-lesson-index';
import {
  backToPicker,
  boot,
  closePicker,
  continueLesson,
  isTouch,
  openPicker,
  playLessonRun,
  playViaContinue,
  rowStars,
  seedBefore,
} from '../../tests/e2e/lesson-walkthrough-helpers';

test.use({ locale: 'vi-VN' });
// Manual tool: no timeout — 81 runs take about an hour.
test.describe.configure({ timeout: 0 });

interface Row {
  n: number;
  title: string;
  kind: string;
  keys: number;
  starsBefore: number;
  starsAfter: number;
  continueBefore: number | undefined;
  continueAfter: number | undefined;
  note: string;
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

test('manual walkthrough: play B1→B81 through the UI, print the results table', async ({
  page,
}, info) => {
  const touch = isTouch(info);
  const rows: Row[] = [];
  await boot(page);
  for (let n = 1; n <= 81; n++) {
    const lesson = lessonByNumber(n);
    if (!lesson) throw new Error(`unknown lesson ${n}`);
    const row: Row = {
      n,
      title: lesson.titleVi,
      kind: lesson.kind,
      keys: skillsOfLesson(n).length,
      starsBefore: 0,
      starsAfter: 0,
      continueBefore: undefined,
      continueAfter: undefined,
      note: '',
    };
    try {
      await seedBefore(page, n);
      await openPicker(page, touch);
      row.continueBefore = await continueLesson(page);
      row.starsBefore = await rowStars(page, n);
      if (row.continueBefore === n) {
        await playViaContinue(page, touch, n);
        await backToPicker(page, touch);
        row.note = 'played via Học tiếp';
      } else if (row.starsBefore === 3) {
        row.note = 'already 3 stars — Học tiếp skips it';
      } else {
        // "Học tiếp" points elsewhere (e.g. blocked at an earlier lesson):
        // play this lesson directly from its own row.
        await openTopic(page, lesson.topic, touch);
        const lessonRow = page.locator(`button.lesson-row[data-lesson="${n}"]`);
        await expect(lessonRow).toBeEnabled();
        if (touch) await lessonRow.tap();
        else await lessonRow.click();
        await expect(page.locator('#dialog-content')).toContainText(`Bài ${n} ·`);
        expect(await playLessonRun(page, touch)).toBe(6);
        await expect(page.locator('#dialog-content')).toContainText(`Xong bài ${n}!`);
        await backToPicker(page, touch);
        row.note = `Học tiếp pointed at B${row.continueBefore} — played from its row`;
      }
      row.starsAfter = await rowStars(page, n);
      row.continueAfter = await continueLesson(page);
      await closePicker(page);
    } catch (e) {
      row.note = `ERROR: ${(e as Error).message.split('\n')[0]}`;
      rows.push(row);
      console.log(`B${n}: ${row.note}`);
      // Keep going with the next lesson: close whatever dialog is open.
      await page
        .locator('#close-dialog')
        .click({ timeout: 5_000 })
        .catch(() => {});
      continue;
    }
    rows.push(row);
    console.log(`B${n} ${row.starsBefore}★→${row.starsAfter}★ (${row.note})`);
  }
  console.log('');
  console.log(
    '| Bài | Chủ đề | Dạng | Khóa | Sao trước | Sao sau | Học tiếp trước | Học tiếp sau | Ghi chú |',
  );
  console.log('| --- | --- | --- | --- | --- | --- | --- | --- | --- |');
  for (const r of rows) {
    const lesson = lessonByNumber(r.n);
    console.log(
      `| B${r.n} ${r.title} | ${lesson?.topic} | ${r.kind} | ${r.keys} | ${r.starsBefore}★ | ${r.starsAfter}★ | ${r.continueBefore === undefined ? '—' : `B${r.continueBefore}`} | ${r.continueAfter === undefined ? '—' : `B${r.continueAfter}`} | ${r.note} |`,
    );
  }
  const stuck = rows.filter((r) => r.note.startsWith('ERROR'));
  console.log('');
  console.log(
    `Done: ${rows.length} lessons, ${rows.filter((r) => r.starsAfter === 3).length} at 3 stars, ${stuck.length} errors.`,
  );
});
