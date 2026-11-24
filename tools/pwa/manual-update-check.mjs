// Manual update-flow check (phase 18 / TASK R22) — NOT part of CI.
//
// Builds the app twice (v1, then v2 with only the <title> changed), serves each in
// turn from the same origin in one persistent browser profile, and checks the real
// update flow: v1 loads + registers its worker, v2's worker is detected, the
// "Có bản mới – tải lại?" toast appears, tapping Tải lại shows the new build with
// progress intact. Any content change alters the workbox precache revision, so the
// title edit is a clean, visible, revertible marker.
//
// Usage: node tools/pwa/manual-update-check.mjs
//   (run from the repo root; needs the Playwright Chromium build in ~/.cache)
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = join(fileURLToPath(import.meta.url), '..', '..', '..');
const indexHtml = join(root, 'index.html');
const PORT = 4199;
const V1_TITLE = 'math3d - Vương Quốc Cửu Chương';
const V2_TITLE = 'math3d v2-check - Vương Quốc Cửu Chương';
const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

function build(outDir) {
  execSync(`npx vite build --outDir ${outDir} --emptyOutDir`, { cwd: root, stdio: 'pipe' });
}

function serve(dir) {
  const server = createServer((req, res) => {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = join(dir, path === '/' ? 'index.html' : path);
    if (!existsSync(file) || statSync(file).isDirectory()) file = join(dir, 'index.html');
    const ext = file.slice(file.lastIndexOf('.'));
    res.writeHead(200, { 'content-type': MIME[ext] ?? 'application/octet-stream' });
    res.end(readFileSync(file));
  });
  return new Promise((resolve) => server.listen(PORT, () => resolve(server)));
}

function close(server) {
  return new Promise((resolve) => server.close(() => resolve()));
}

const originalHtml = readFileSync(indexHtml, 'utf8');
const v1Dir = join(root, 'tools', 'pwa', '.manual-v1');
const v2Dir = join(root, 'tools', 'pwa', '.manual-v2');
const profile = join(root, 'tools', 'pwa', '.manual-profile');
let server;
try {
  console.log('building v1…');
  build(v1Dir);
  server = await serve(v1Dir);
  const context = await chromium.launchPersistentContext(profile, { headless: true });
  const page = await context.newPage();
  page.on('pageerror', (e) => console.log('pageerror:', String(e)));
  await page.goto(`http://localhost:${PORT}/`);
  await page.locator('html').waitFor({ state: 'attached' });
  await expect(page).toHaveTitle(V1_TITLE);
  await page.waitForFunction(() => navigator.serviceWorker.ready, null, { timeout: 60_000 });
  await page.reload();
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null, null, {
    timeout: 30_000,
  });
  // Seed progress the way a child would: finish the bridge via the test hook.
  await page.locator('html').waitFor({ state: 'attached' });
  await page.evaluate(() => window.__game?.seedProgress({ bridgeComplete: true }));
  const coinsBefore = await page.locator('#coins').textContent();
  console.log('v1 loaded, worker controlling, coins:', coinsBefore);

  console.log('building v2 (title change only)…');
  // Replace the <title> tag itself: the bare title text also appears first in
  // the meta description, and String.replace only swaps the first occurrence.
  writeFileSync(
    indexHtml,
    originalHtml.replace(`<title>${V1_TITLE}</title>`, `<title>${V2_TITLE}</title>`),
  );
  build(v2Dir);
  await close(server);
  server = await serve(v2Dir);
  await page.reload();
  // The new worker installs in the background; the toast reports it.
  await page.locator('#sw-update-prompt').waitFor({ state: 'visible', timeout: 60_000 });
  const toast = await page.locator('#sw-update-prompt').textContent();
  console.log('toast shown:', JSON.stringify(toast?.trim()));
  if (!toast?.includes('Có bản mới')) throw new Error('toast text wrong');
  await page.locator('#sw-update-reload').click();
  await page.waitForFunction((title) => document.title === title, V2_TITLE, { timeout: 60_000 });
  const coinsAfter = await page.locator('#coins').textContent();
  console.log('after reload: title =', await page.title(), '| coins:', coinsAfter);
  if (coinsAfter !== coinsBefore) throw new Error('progress lost across the update');
  await context.close();
  console.log('PASS: toast appeared, reload showed the new build, progress intact.');
} finally {
  writeFileSync(indexHtml, originalHtml);
  if (server) await close(server).catch(() => {});
  rmSync(v1Dir, { recursive: true, force: true });
  rmSync(v2Dir, { recursive: true, force: true });
  rmSync(profile, { recursive: true, force: true });
}

// Minimal expect helper (no test runner in this script).
function expect(page) {
  return {
    async toHaveTitle(title) {
      const actual = await page.title();
      if (actual !== title) {
        throw new Error(`title ${JSON.stringify(actual)} != ${JSON.stringify(title)}`);
      }
    },
  };
}
