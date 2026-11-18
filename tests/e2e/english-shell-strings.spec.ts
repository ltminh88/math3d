// QA m-9: in English the title screen, the top-bar sound button and the forest's name are
// English (the forest is the division level: "Sharing Forest" on gates, quest card and map).
// Issue #7: in English the bridge count reads "0 / 6 bridge segments" (not Vietnamese), and
// the garden gate label no longer sits on the garden region label at the opening view.
// Uses the test-build hook `window.__game`.
import { test } from '@playwright/test';
import { expect, waitForStoreBoot } from './legacy-live-save-fixtures';

test.use({ locale: 'en-US' });

test('title, sound button and the forest name read in English', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('math3d.settings'))
      localStorage.setItem('math3d.settings', JSON.stringify({ lang: 'en' }));
  });
  await page.goto('/');
  await waitForStoreBoot(page);
  await expect(page.locator('#welcome .chapter')).toHaveText('A SMALL ADVENTURE');
  await expect(page.locator('#learn-welcome')).toHaveText('Explore multiplication tables');
  await expect(page.locator('#sound')).toHaveAttribute('aria-label', /^(Mute sound|Enable sound)$/);

  await page.waitForFunction(() => '__game' in window);
  await page.locator('#play').click();
  await expect(page.locator('body')).toHaveClass(/playing/);
  await expect(page.locator('#sound')).toHaveAttribute('aria-label', /^(Mute sound|Enable sound)$/);
  await page.locator('#sound').click();
  await expect(page.locator('#sound')).toHaveAttribute('aria-label', /^(Mute sound|Enable sound)$/);

  await expect(page.locator('#forest-label strong')).toHaveText('Sharing Forest');
  await expect(page.locator('#gate-city-label small')).toHaveText(
    'Finish the Sharing Forest to open',
  );

  // Issue #7: the bridge count is translated, and the garden gate label stands clear of the
  // garden region label at the opening view (they overlapped before the fix).
  await expect(page.locator('#bridge-count')).toHaveText('0 / 6 bridge segments');
  await page.waitForFunction(
    () => (document.querySelector('#garden-label') as HTMLElement).style.transform !== '',
  );
  await page.waitForTimeout(1000);
  const boxes = await page.evaluate(() => {
    const box = (id: string) => {
      const el = document.querySelector(id);
      if (!el) throw new Error(`missing label ${id}`);
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, width: r.width, height: r.height };
    };
    return { garden: box('#garden-label'), gate: box('#gate-garden-label') };
  });
  const overlaps = (a: typeof boxes.garden, b: typeof boxes.garden) =>
    a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height;
  expect(overlaps(boxes.garden, boxes.gate)).toBe(false);
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field'] }),
  );
  await expect(page.locator('#quest-title')).toHaveText('Sharing Forest');
  await expect(page.locator('#gate-forest-label strong')).toHaveText('Sharing Forest Gate');
  await expect(page.locator('body')).not.toContainText('Multiplication Forest');
});
