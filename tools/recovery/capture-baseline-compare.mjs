// Comparison of a capture directory against committed baselines.
// Canvas PNG + JSON: exact (byte-equal). DOM-overlay PNG: per-shot pixel tolerance from
// tests/parity/parity-shot-tolerances.json (unlisted shots: 0). Shots listed there as
// nonDeterministic (off-edge world labels, keyframe layers) are gated structurally instead:
// they pass up to the policy ceiling only when their shot JSON (html, cssHash, gl) is exact.
// DOM_PNG_TOLERANCE caps pixel-gated shots; a structural shot may carry its own measured ceiling.
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

/** Per-shot DOM-PNG policy for one project: name -> { tolerance, structuralCeiling|null }. */
export function loadDomPngPolicy(root, projectName) {
  const file = join(root, 'tests/parity/parity-shot-tolerances.json');
  const t = JSON.parse(readFileSync(file, 'utf8'));
  const shots = t.shots?.[projectName] ?? {};
  const prefix = `${projectName}/`;
  const noisy = new Set(
    Object.keys(t.nonDeterministic ?? {})
      .filter((k) => k.startsWith(prefix))
      .map((k) => k.slice(prefix.length)),
  );
  const ceiling = Math.min(t.policy.domPngCeiling, DOM_PNG_TOLERANCE);
  return (name) => ({
    tolerance: Math.min(shots[name]?.tolerance ?? t.policy.domPngDefault, ceiling),
    // A noisy shot may name its own structural ceiling (measured); its JSON must still be exact.
    structuralCeiling: noisy.has(name) ? (shots[name]?.structuralCeiling ?? ceiling) : null,
  });
}

function jsonDiffKeys(a, b) {
  const ja = JSON.parse(a);
  const jb = JSON.parse(b);
  const keys = new Set([...Object.keys(ja), ...Object.keys(jb)]);
  return [...keys].filter((k) => JSON.stringify(ja[k]) !== JSON.stringify(jb[k]));
}

const sameFile = (a, b) =>
  existsSync(a) && existsSync(b) && readFileSync(a).equals(readFileSync(b));

/**
 * @param {string} baselineDir committed baselines
 * @param {string} actualDir fresh capture
 * @param {(name: string) => boolean} include which baseline files take part
 * @param {(name: string) => {tolerance: number, structuralCeiling: number|null}} [domPolicy]
 */
export function compareCaptureDirs(
  baselineDir,
  actualDir,
  include,
  domPolicy = () => ({ tolerance: DOM_PNG_TOLERANCE, structuralCeiling: null }),
) {
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
      if (!name.endsWith('.dom.png') || diff.diffPixels < 0) {
        problems.push(diff);
        continue;
      }
      const { tolerance, structuralCeiling } = domPolicy(name);
      const shotJson = name.replace(/\.dom\.png$/, '.json');
      if (diff.ratio <= tolerance) tolerated.push({ ...diff, gate: 'pixel', tolerance });
      else if (
        structuralCeiling !== null &&
        diff.ratio <= structuralCeiling &&
        sameFile(join(baselineDir, shotJson), join(actualDir, shotJson))
      ) {
        tolerated.push({ ...diff, gate: 'structural', tolerance: structuralCeiling });
      } else problems.push({ ...diff, tolerance });
    } else if (name.endsWith('.json')) {
      problems.push({ name, issue: 'json', keys: jsonDiffKeys(a.toString(), b.toString()) });
    } else problems.push({ name, issue: 'bytes' });
  }
  for (const name of actual) problems.push({ name, issue: 'not in baseline' });
  return { compared, problems, tolerated };
}

/**
 * Compare a fresh capture of `ids` with the committed baselines of one project.
 * baselines 'local' (default gate since the math3d rename): tests/parity/baselines/local/<project>
 *   (or `baselineRoot`/<project>) holds every artifact incl. scene dumps, all compared.
 * baselines 'live' (archived oracle, valid at tag recovered-r180): every live artifact
 *   (PNG/JSON/trace) and, with `scenes`, the scene dumps vs the oracle-scene baselines.
 */
export function compareWithBaselines(
  root,
  projectName,
  ids,
  outDir,
  { scenes = false, baselines = 'live', baselineRoot } = {},
) {
  const ofScenario = (f) => ids.some((id) => f.startsWith(`${id}--`) || f === `${id}.trace.json`);
  const policy = loadDomPngPolicy(root, projectName);
  const base = join(root, 'tests/parity/baselines');
  if (baselines === 'local') {
    const dir = join(baselineRoot ?? join(base, 'local'), projectName);
    if (!existsSync(dir))
      throw new Error(`no local baselines at ${dir} (npm run parity:baselines)`);
    return compareCaptureDirs(dir, outDir, ofScenario, policy);
  }
  if (baselines !== 'live') throw new Error(`baselines must be live|local, got ${baselines}`);
  const live = compareCaptureDirs(
    join(base, 'live', projectName),
    outDir,
    (f) => ofScenario(f) && !f.endsWith('.scene.json'),
    policy,
  );
  if (!scenes) return live;
  const scene = compareCaptureDirs(
    join(base, 'oracle-scene', projectName),
    outDir,
    (f) => ofScenario(f) && f.endsWith('.scene.json'),
  );
  return {
    compared: live.compared + scene.compared,
    problems: [...live.problems, ...scene.problems],
    tolerated: live.tolerated,
  };
}
