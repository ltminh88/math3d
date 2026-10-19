// Google Fonts snapshot for parity runs: every origin (live, oracle, local) gets byte-identical
// font CSS + woff2 from tools/recovery/fonts-snapshot/ instead of the network, so DOM shots never
// depend on per-run font fetch timing or CDN responses.
//   node tools/recovery/capture-fonts-snapshot.mjs     (re)fetch the snapshot once (HeadlessChrome UA)
// routeFontSnapshot(context) is used by capture-parity-run-scenario.mjs; requests for anything
// not in the snapshot fail the run loudly (never silently fall back to the network).
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_DIR = join(here, 'fonts-snapshot');
const MANIFEST = join(SNAPSHOT_DIR, 'manifest.json');
// The exact stylesheet URL of index.html / recovered/original/index.html.
export const GOOGLE_FONTS_CSS_URL =
  'https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Nunito:wght@500;600;700;800;900&display=swap';

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
let cached = null;

/** url -> { type, body } for the CSS and every woff2 it references (hash-checked). */
export function loadFontSnapshot() {
  if (cached) return cached;
  const manifest = JSON.parse(readFileSync(MANIFEST, 'utf8'));
  const files = new Map();
  for (const entry of manifest.files) {
    const body = readFileSync(join(SNAPSHOT_DIR, entry.file));
    if (sha256(body) !== entry.sha256)
      throw new Error(`fonts-snapshot: ${entry.file} hash mismatch`);
    files.set(entry.url, { type: entry.type, body });
  }
  cached = files;
  return files;
}

/** Serve fonts.googleapis.com / fonts.gstatic.com from the snapshot for this browser context. */
export async function routeFontSnapshot(context, errors) {
  const files = loadFontSnapshot();
  const handler = (route) => {
    const url = route.request().url();
    const file = files.get(url);
    if (!file) {
      errors.push(`font request not in snapshot: ${url}`);
      return route.fulfill({ status: 404, body: 'not in fonts-snapshot' });
    }
    return route.fulfill({
      status: 200,
      contentType: file.type,
      body: file.body,
      // gstatic serves woff2 with CORS; the <link preconnect crossorigin> fetch requires it.
      headers: { 'access-control-allow-origin': '*', 'cache-control': 'no-store' },
    });
  };
  await context.route('https://fonts.googleapis.com/**', handler);
  await context.route('https://fonts.gstatic.com/**', handler);
}

/**
 * In-page (page.evaluate): wait until every font face the current layout uses is loaded.
 * Forcing a synchronous layout first makes Chrome request any unicode-range subset that newly
 * shown text needs, so document.fonts.ready cannot resolve before that load has even started.
 * Only used faces load (as on live): force-loading every subset changed DOM raster vs baselines.
 * Font fetches are browser network tasks (served from the snapshot), not JS timers, so this
 * resolves under the virtual clock.
 */
export async function waitForUsedFontFaces() {
  void document.body.offsetWidth;
  await document.fonts.ready;
  const bad = [...document.fonts].filter((f) => f.status === 'loading' || f.status === 'error');
  if (!document.fonts.size || bad.length) {
    const faces = bad.map((f) => `${f.family} ${f.weight} ${f.status} ${f.unicodeRange}`);
    throw new Error(`fonts not ready (${document.fonts.size} faces): ${faces.join('; ')}`);
  }
}

async function fetchSnapshot() {
  const { chromium } = await import('@playwright/test');
  const browser = await chromium.launch();
  try {
    // Google tailors the CSS to the User-Agent: use the parity Chromium's own UA.
    const page = await browser.newPage();
    const userAgent = await page.evaluate(() => navigator.userAgent);
    const get = async (url) => {
      const res = await page.request.get(url, { headers: { 'user-agent': userAgent } });
      if (!res.ok()) throw new Error(`${url}: HTTP ${res.status()}`);
      return { body: await res.body(), type: res.headers()['content-type'] };
    };
    const css = await get(GOOGLE_FONTS_CSS_URL);
    const fontUrls = [
      ...new Set(css.body.toString('utf8').match(/https:\/\/fonts\.gstatic\.com\/[^)]+/g)),
    ];
    const entries = [{ url: GOOGLE_FONTS_CSS_URL, file: 'google-fonts.css', ...css }];
    for (const url of fontUrls) {
      entries.push({ url, file: new URL(url).pathname.slice(1), ...(await get(url)) });
    }
    const files = entries.map(({ url, file, body, type }) => {
      mkdirSync(dirname(join(SNAPSHOT_DIR, file)), { recursive: true });
      writeFileSync(join(SNAPSHOT_DIR, file), body);
      return { url, file, type, bytes: body.length, sha256: sha256(body) };
    });
    const manifest = { fetchedAt: new Date().toISOString(), userAgent, files };
    writeFileSync(MANIFEST, `${JSON.stringify(manifest, null, 1)}\n`);
    console.log(`fonts-snapshot: ${files.length} files -> ${SNAPSHOT_DIR}`);
  } finally {
    await browser.close();
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await fetchSnapshot();
