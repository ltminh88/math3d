// QA m-9: in English the title screen, the top-bar sound button and the forest's name are
// English (the forest is the division level: "Sharing Forest" on gates, quest card and map).
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
  await page.evaluate(() =>
    window.__game?.seedProgress({ bridgeComplete: true, completedLevels: ['field'] }),
  );
  await expect(page.locator('#quest-title')).toHaveText('Sharing Forest');
  await expect(page.locator('#gate-forest-label strong')).toHaveText('Sharing Forest Gate');
  await expect(page.locator('body')).not.toContainText('Multiplication Forest');
});
