// Local origin: serve the built game (dist/) under the live origin via Playwright routing, so
// localStorage origin, absolute asset paths and Google Fonts behave exactly as on live.
// The window.__parity hook (scene dumps) is injected into the served entry chunk at route time,
// like the oracle patch: dist/ on disk and src/ stay untouched, game behavior is unchanged.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative, sep } from 'node:path';

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};

// Minified world construction in the built bundle, e.g. try{$=new Kc(Z(`world`)),$.setBridge(...
// (legacy-ui.js: `_e = new $m(Y('world'));`). Group 1 = the variable holding the world instance.
const WORLD_CONSTRUCT = /([\w$]+)=new [\w$]+\([\w$]+\((["'`])world\2\)\)/g;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

/** Patch exactly one world construction in `js` to also expose it as window.__parity. */
export function exposeParityWorld(js) {
  const hits = [...js.matchAll(WORLD_CONSTRUCT)];
  if (hits.length !== 1) return null;
  const [hit] = hits;
  const end = hit.index + hit[0].length;
  return `${js.slice(0, end)},window.__parity=${hit[1]}${js.slice(end)}`;
}

export function loadLocalFiles(distDir) {
  const files = {};
  let patched = 0;
  for (const path of walk(distDir)) {
    const url = `/${relative(distDir, path).split(sep).join('/')}`;
    // No service worker: phase 02 ships without registration; never let a stray sw.js install.
    if (url === '/sw.js' || url.startsWith('/workbox-')) continue;
    let body = readFileSync(path);
    if (url.startsWith('/assets/') && url.endsWith('.js')) {
      const out = exposeParityWorld(body.toString('utf8'));
      if (out) {
        body = Buffer.from(out);
        patched++;
      }
    }
    files[url === '/index.html' ? '/' : url] = {
      type: TYPES[extname(path)] ?? 'application/octet-stream',
      body,
    };
  }
  if (!files['/']) throw new Error(`no index.html in ${distDir} (run npm run build:test first)`);
  if (patched !== 1) {
    throw new Error(`window.__parity anchor must match exactly once in dist JS, got ${patched}`);
  }
  return files;
}
