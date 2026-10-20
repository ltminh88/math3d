import { test } from '@playwright/test';
import { expect, SLOW_TEST_MS, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'vi-VN' });
test.describe.configure({ timeout: SLOW_TEST_MS });

// Distractor invariants hold in the real UI: 30 practice questions over all tables, each with
// 3 unique options that include the answer; answering correctly pays the original +10 XP.
test('30 practice questions: 3 unique options including the answer', async ({ page }) => {
  await page.goto('/');
  await waitForStoreBoot(page);
  await page.locator('#play').click();
  await page.locator('#learn').click();
  await page.locator('#practice-all').click();
  const seen = new Set<string>();
  for (let i = 0; i < 30; i++) {
    const equation = (await page.locator('.equation').textContent()) ?? '';
    const [a, b] = (equation.match(/\d+/g) ?? []).map(Number) as [number, number];
    const answer = a * b;
    const values = await page
      .locator('.answer')
      .evaluateAll((buttons) => buttons.map((el) => Number((el as HTMLElement).dataset.value)));
    expect(values, equation).toHaveLength(3);
    expect(new Set(values).size, equation).toBe(3);
    expect(values, equation).toContain(answer);
    seen.add(`${a}x${b}`);
    // dispatchEvent: no actionability wait (frames are slow behind the blurred dialog).
    await page.locator(`.answer[data-value="${answer}"]`).dispatchEvent('click');
    await expect(page.locator('#feedback')).toHaveClass(/success/);
    await page.locator('#next-question').dispatchEvent('click');
  }
  expect(seen.size).toBeGreaterThan(3);
  await page.locator('#close-dialog').click();
  await expect(page.locator('#coins')).toHaveText('150');
});
