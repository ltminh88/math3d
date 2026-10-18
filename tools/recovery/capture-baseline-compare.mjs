// Comparison of a capture directory against committed baselines.
// Canvas PNG + JSON: exact (byte-equal). DOM-overlay PNG: may differ by at most
// DOM_PNG_TOLERANCE of its pixels — Chrome rasterizes world labels that hang partly off the
// viewport edge non-deterministically (observed max 0.16 %); html/css/canvas stay exact.
export const DOM_PNG_TOLERANCE = 0.002;

import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

// pngjs as bundled by the pinned @playwright/test (playwright-core) — no new dependency.
const { PNG } = createRequire(import.meta.url)('playwright-core/lib/utilsBundle');

export function pngPixelDiff(a, b) {
  const pa = PNG.sync.read(a);
  const pb = PNG.sync.read(b);
  if (pa.width !== pb.width || pa.height !== pb.height) {
    return { diffPixels: -1, note: `size ${pa.width}x${pa.height} vs ${pb.width}x${pb.height}` };
  }
  let diffPixels = 0;
  for (let i = 0; i < pa.data.length; i += 4) {
    if (
      pa.data[i] !== pb.data[i] ||
      pa.data[i + 1] !== pb.data[i + 1] ||
      pa.data[i + 2] !== pb.data[i + 2] ||
      pa.data[i + 3] !== pb.data[i + 3]
    ) {
      diffPixels++;
    }
  }
  return { diffPixels, ratio: diffPixels / (pa.width * pa.height) };
}

function jsonDiffKeys(a, b) {
  const ja = JSON.parse(a);
  const jb = JSON.parse(b);
  const keys = new Set([...Object.keys(ja), ...Object.keys(jb)]);
  return [...keys].filter((k) => JSON.stringify(ja[k]) !== JSON.stringify(jb[k]));
}

/**
 * @param {string} baselineDir committed baselines
 * @param {string} actualDir fresh capture
 * @param {(name: string) => boolean} include which baseline files take part
 */
export function compareCaptureDirs(baselineDir, actualDir, include) {
  const problems = [];
  const tolerated = [];
  let compared = 0;
  const baseline = readdirSync(baselineDir).filter(include);
  const actual = new Set(readdirSync(actualDir).filter(include));
  for (const name of baseline) {
    const actualPath = join(actualDir, name);
    if (!existsSync(actualPath)) {
      problems.push({ name, issue: 'missing in capture' });
      continue;
    }
    actual.delete(name);
    compared++;
    const a = readFileSync(join(baselineDir, name));
    const b = readFileSync(actualPath);
    if (a.equals(b)) continue;
    if (name.endsWith('.png')) {
      const diff = { name, issue: 'pixels', ...pngPixelDiff(a, b) };
      const ok =
        name.endsWith('.dom.png') && diff.diffPixels >= 0 && diff.ratio <= DOM_PNG_TOLERANCE;
      (ok ? tolerated : problems).push(diff);
    } else if (name.endsWith('.json')) {
      problems.push({ name, issue: 'json', keys: jsonDiffKeys(a.toString(), b.toString()) });
    } else problems.push({ name, issue: 'bytes' });
  }
  for (const name of actual) problems.push({ name, issue: 'not in baseline' });
  return { compared, problems, tolerated };
}
