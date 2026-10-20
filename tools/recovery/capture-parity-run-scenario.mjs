// Runs one parity scenario in a fresh browser context and writes its artifacts to outDir.
// Shared by the capture CLI (capture-live-baselines.mjs) and the local parity spec.
// `files` (optional): Playwright-routed file map served under the live origin (oracle / local).
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  PARITY_CLOCK_START,
  PARITY_LIVE_ORIGIN,
  PARITY_SEED,
} from '../../tests/parity/scenarios/parity-projects.ts';
import { routeFontSnapshot, waitForUsedFontFaces } from './capture-fonts-snapshot.mjs';
import { routeOracle } from './capture-oracle-routes.mjs';
import { createParityDriver } from './capture-parity-driver.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const hooksPath = join(here, 'capture-parity-hooks.js');
const clockPath = join(here, 'capture-parity-virtual-clock.js');

/**
 * Since phase 12 the game hides its loading card only after the store (IndexedDB) has opened and
 * the progress is hydrated; the live/oracle builds hide it synchronously at load. Polled from Node:
 * page timers and rAF are virtual and never advance on their own.
 */
async function waitForGameReady(page, label) {
  const ready = () => document.getElementById('loading')?.hidden === true;
  for (let i = 0; i < 500; i++) {
    if (await page.evaluate(ready)) return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error(`${label}: the game did not finish booting (loading card still shown)`);
}

export async function runScenario(browser, project, scenario, outDir, written, files) {
  const context = await browser.newContext({
    viewport: project.viewport,
    deviceScaleFactor: project.deviceScaleFactor,
    isMobile: project.isMobile,
    hasTouch: project.hasTouch,
    locale: 'vi-VN',
    timezoneId: 'Asia/Ho_Chi_Minh',
    colorScheme: 'light',
    reducedMotion: 'no-preference',
  });
  try {
    const pageErrors = [];
    // Fonts come from tools/recovery/fonts-snapshot/ for every origin (live included).
    await routeFontSnapshot(context, pageErrors);
    if (files) await routeOracle(context, PARITY_LIVE_ORIGIN, files);
    const page = await context.newPage();
    page.on('crash', () => console.error(`${project.name} ${scenario.id}: renderer crashed`));
    page.on('pageerror', (e) => pageErrors.push(String(e.message)));
    page.on('console', (m) => m.type() === 'error' && pageErrors.push(`console: ${m.text()}`));
    await page.addInitScript(
      ({ seed, clockStart, storage }) => {
        window.__PARITY_SEED__ = seed;
        window.__PARITY_CLOCK_START__ = clockStart;
        for (const [k, v] of Object.entries(storage)) localStorage.setItem(k, v);
      },
      { seed: PARITY_SEED, clockStart: PARITY_CLOCK_START, storage: scenario.storage ?? {} },
    );
    await page.addInitScript({ path: clockPath });
    await page.addInitScript({ path: hooksPath });
    await page.goto(`${PARITY_LIVE_ORIGIN}/`, { waitUntil: 'load' });
    await waitForGameReady(page, `${project.name} ${scenario.id}`);
    await page.evaluate(waitForUsedFontFaces);
    const lowPower = await page.evaluate(
      () => matchMedia('(max-width: 900px), (pointer: coarse)').matches,
    );
    if (lowPower !== project.lowPower) throw new Error(`${project.name}: lowPower=${lowPower}`);
    const driver = createParityDriver({ page, scenarioId: scenario.id, outDir, written });
    await scenario.run(driver);
    const trace = await page.evaluate(() => ({
      storageWrites: window.__parityStorage,
      audio: window.__parityAudio,
    }));
    const name = `${scenario.id}.trace.json`;
    writeFileSync(join(outDir, name), `${JSON.stringify({ ...trace, pageErrors }, null, 1)}\n`);
    written.push(name);
  } finally {
    await context.close();
  }
}
