#!/usr/bin/env node
import { createHash } from 'node:crypto';
// Capture (or verify) seeded, clock-controlled parity baselines of the live game.
//   node tools/recovery/capture-live-baselines.mjs                 capture -> tests/parity/baselines/live/<project>/
//   node tools/recovery/capture-live-baselines.mjs --verify        recapture to a temp dir; canvas/json exact,
//        DOM png per-shot tolerance (tests/parity/parity-shot-tolerances.json)
//   node tools/recovery/capture-live-baselines.mjs --origin oracle serve recovered/original locally (+window.__parity),
//        require 0 diff vs live baselines, write scene dumps -> tests/parity/baselines/oracle-scene/<project>/
//   node tools/recovery/capture-live-baselines.mjs --origin local  serve dist/ (npm run build:test first) under the
//        live origin (+window.__parity), compare vs LOCAL baselines (tests/parity/baselines/local/<project>)
//   ... --origin local --update      (re)generate the local baselines from dist/ (npm run parity:baselines)
//   ... --origin local --baselines live   compare vs the archived live baselines + oracle scene dumps
//        (meaningful only at tag recovered-r180, before the math3d rename)
// Options: --project desktop-chromium|mobile-pixel (default both)  --scenario id[,id]  --out <dir>
//   --dist <dir> (default dist/)  --baselines-dir <dir> (local baselines root, e.g. a CI temp dir)
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { chromium } from '@playwright/test';
import {
  PARITY_CLOCK_START,
  PARITY_FRAME_MS,
  PARITY_LAUNCH_ARGS,
  PARITY_LIVE_ORIGIN,
  PARITY_PROJECTS,
  PARITY_SEED,
} from '../../tests/parity/scenarios/parity-projects.ts';
import { PARITY_SCENARIOS } from '../../tests/parity/scenarios/parity-scenarios.ts';
import { compareWithBaselines, DOM_PNG_TOLERANCE } from './capture-baseline-compare.mjs';
import { loadLocalFiles } from './capture-local-routes.mjs';
import { loadOracleFiles } from './capture-oracle-routes.mjs';
import { runScenario } from './capture-parity-run-scenario.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const { values: args } = parseArgs({
  options: {
    project: { type: 'string' },
    scenario: { type: 'string' },
    origin: { type: 'string', default: 'live' },
    verify: { type: 'boolean', default: false },
    out: { type: 'string' },
    update: { type: 'boolean', default: false },
    baselines: { type: 'string', default: 'local' },
    'baselines-dir': { type: 'string' },
    dist: { type: 'string' },
  },
});
if (!['live', 'oracle', 'local'].includes(args.origin)) {
  throw new Error('--origin must be live|oracle|local');
}
const oracle = args.origin === 'oracle';
const local = args.origin === 'local';
if (args.update && !local) throw new Error('--update only applies to --origin local');
if (!['live', 'local'].includes(args.baselines)) throw new Error('--baselines must be live|local');
const comparing = args.verify || oracle || (local && !args.update);
// Which committed set a comparison uses: live for --verify/oracle, --baselines for local.
const baselineSet = local ? args.baselines : 'live';
const localRoot = args['baselines-dir'] ?? join(root, 'tests/parity/baselines/local');
const projects = PARITY_PROJECTS.filter((p) => !args.project || p.name === args.project);
const wanted = args.scenario?.split(',');
const scenarios = PARITY_SCENARIOS.filter((s) => !wanted || wanted.includes(s.id));
if (!projects.length || !scenarios.length) throw new Error('no matching project/scenario');

const captureDir = (p) =>
  local ? join(localRoot, p.name) : join(root, 'tests/parity/baselines/live', p.name);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

async function liveAssetHashes(browser) {
  const ctx = await browser.newContext();
  const out = {};
  for (const path of ['/', '/assets/index-CO4MPNqj.js', '/assets/index-D1ngBGok.css']) {
    const res = await ctx.request.get(`${PARITY_LIVE_ORIGIN}${path}`);
    out[path] = { status: res.status(), sha256: sha256(await res.body()) };
  }
  await ctx.close();
  return out;
}

function clearScenarioFiles(dir, ids) {
  for (const f of readdirSync(dir)) {
    if (ids.some((id) => f.startsWith(`${id}--`) || f === `${id}.trace.json`)) rmSync(join(dir, f));
  }
}

const browser = await chromium.launch({ args: PARITY_LAUNCH_ARGS });
const routedFiles = oracle
  ? loadOracleFiles(root)
  : local
    ? loadLocalFiles(args.dist ?? join(root, 'dist'))
    : null;
let failed = false;
try {
  for (const project of projects) {
    const outDir = args.out
      ? join(args.out, project.name)
      : comparing
        ? mkdtempSync(join(os.tmpdir(), `parity-${project.name}-`))
        : captureDir(project);
    mkdirSync(outDir, { recursive: true });
    if (!comparing)
      clearScenarioFiles(
        outDir,
        scenarios.map((s) => s.id),
      );
    const written = [];
    const started = Date.now();
    for (const scenario of scenarios) {
      const t = Date.now();
      await runScenario(browser, project, scenario, outDir, written, routedFiles);
      console.log(`${project.name} ${scenario.id} ok (${((Date.now() - t) / 1000).toFixed(1)}s)`);
    }
    if (!comparing) {
      const meta = {
        capturedAt: new Date().toISOString(),
        origin: local ? `local dist/ served under ${PARITY_LIVE_ORIGIN}` : PARITY_LIVE_ORIGIN,
        ...(local ? {} : { liveAssets: await liveAssetHashes(browser) }),
        chromium: browser.version(),
        playwright: JSON.parse(
          readFileSync(join(root, 'node_modules/@playwright/test/package.json'), 'utf8'),
        ).version,
        node: process.version,
        os: `${os.platform()} ${os.release()} ${os.arch()}`,
        project,
        launchArgs: PARITY_LAUNCH_ARGS,
        seed: PARITY_SEED,
        clockStart: new Date(PARITY_CLOCK_START).toISOString(),
        frameMs: PARITY_FRAME_MS,
        verifyTolerance: {
          canvasPng: 0,
          json: 0,
          domPngPerShot: 'tests/parity/parity-shot-tolerances.json',
          domPngCeiling: DOM_PNG_TOLERANCE,
        },
        scenarios: scenarios.map((s) => s.id),
        files: written.length,
        durationSec: Math.round((Date.now() - started) / 1000),
      };
      writeFileSync(join(outDir, 'capture-meta.json'), `${JSON.stringify(meta, null, 1)}\n`);
      console.log(`${project.name}: ${written.length} files -> ${relative(root, outDir)}`);
      continue;
    }
    const ids = scenarios.map((s) => s.id);
    const { compared, problems, tolerated } = compareWithBaselines(
      root,
      project.name,
      ids,
      outDir,
      { scenes: local, baselines: baselineSet, baselineRoot: localRoot },
    );
    console.log(
      `${project.name} [${args.origin} vs ${baselineSet}]: compared ${compared} files vs baselines, ` +
        `${problems.length} differ, ${tolerated.length} DOM shots within per-shot tolerance`,
    );
    for (const p of tolerated) console.log('  TOLERATED', JSON.stringify(p));
    for (const p of problems) console.log('  DIFF', JSON.stringify(p));
    if (problems.length || !compared) failed = true;
    if (oracle) {
      const sceneDir = join(root, 'tests/parity/baselines/oracle-scene', project.name);
      mkdirSync(sceneDir, { recursive: true });
      for (const f of written.filter((n) => n.endsWith('.scene.json'))) {
        writeFileSync(join(sceneDir, f), readFileSync(join(outDir, f)));
      }
      console.log(`${project.name}: scene dumps -> ${relative(root, sceneDir)}`);
    }
    if (!args.out && !problems.length) rmSync(outDir, { recursive: true, force: true });
    else console.log(`  capture kept at ${outDir}`);
  }
} finally {
  await browser.close();
}
process.exit(failed ? 1 : 0);
