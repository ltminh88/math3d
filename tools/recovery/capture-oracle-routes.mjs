// Structural oracle: serve the archived production files (recovered/original/) under the live
// origin via Playwright routing, with ONE injected statement exposing the world instance as
// window.__parity. Originals on disk stay untouched; fonts still load from Google as on live.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const ORIGINAL_JS = 'index-CO4MPNqj.js';
const ORIGINAL_CSS = 'index-D1ngBGok.css';
const WORLD_CONSTRUCT = '_e=new $m(Y("world")),';
const PATCHED_CONSTRUCT = '_e=new $m(Y("world")),window.__parity=_e,';

export function loadOracleFiles(root) {
  const dir = join(root, 'recovered/original');
  const js = readFileSync(join(dir, ORIGINAL_JS), 'utf8');
  if (js.split(WORLD_CONSTRUCT).length !== 2) {
    throw new Error(`oracle patch anchor not found exactly once in ${ORIGINAL_JS}`);
  }
  return {
    '/': { type: 'text/html', body: readFileSync(join(dir, 'index.html')) },
    '/favicon.svg': { type: 'image/svg+xml', body: readFileSync(join(dir, 'favicon.svg')) },
    [`/assets/${ORIGINAL_CSS}`]: { type: 'text/css', body: readFileSync(join(dir, ORIGINAL_CSS)) },
    [`/assets/${ORIGINAL_JS}`]: {
      type: 'text/javascript',
      body: Buffer.from(js.replace(WORLD_CONSTRUCT, PATCHED_CONSTRUCT)),
    },
  };
}

/** Route every request to `origin` from the archived files; unknown paths 404 (no live fallback). */
export async function routeOracle(context, origin, files) {
  await context.route(`${origin}/**`, (route) => {
    const path = new URL(route.request().url()).pathname;
    const file = files[path === '/index.html' ? '/' : path];
    if (!file) return route.fulfill({ status: 404, body: 'not in oracle archive' });
    return route.fulfill({ status: 200, contentType: file.type, body: file.body });
  });
}
