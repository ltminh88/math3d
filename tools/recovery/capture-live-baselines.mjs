#!/usr/bin/env node
import { createHash } from 'node:crypto';
// Capture (or verify) seeded, clock-controlled parity baselines of the live game.
//   node tools/recovery/capture-live-baselines.mjs                 capture -> tests/parity/baselines/live/<project>/
//   node tools/recovery/capture-live-baselines.mjs --verify        recapture to a temp dir; canvas/json exact, DOM png <=0.2%
//   node tools/recovery/capture-live-baselines.mjs --origin oracle serve recovered/original locally (+window.__parity),
//        require 0 diff vs live baselines, write scene dumps -> tests/parity/baselines/oracle-scene/<project>/
// Options: --project desktop-chromium|mobile-pixel (default both)  --scenario id[,id]  --out <dir>
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
import { compareCaptureDirs, DOM_PNG_TOLERANCE } from './capture-baseline-compare.mjs';
import { loadOracleFiles, routeOracle } from './capture-oracle-routes.mjs';
import { createParityDriver } from './capture-parity-driver.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const hooksPath = join(root, 'tools/recovery/capture-parity-hooks.js');
const clockPath = join(root, 'tools/recovery/capture-parity-virtual-clock.js');
const { values: args } = parseArgs({
  options: {
    project: { type: 'string' },
    scenario: { type: 'string' },
    origin: { type: 'string', default: 'live' },
    verify: { type: 'boolean', default: false },
    out: { type: 'string' },
  },
});
if (!['live', 'oracle'].includes(args.origin)) throw new Error('--origin must be live|oracle');
const oracle = args.origin === 'oracle';
const comparing = args.verify || oracle;
const projects = PARITY_PROJECTS.filter((p) => !args.project || p.name === args.project);
const wanted = args.scenario?.split(',');
const scenarios = PARITY_SCENARIOS.filter((s) => !wanted || wanted.includes(s.id));
if (!projects.length || !scenarios.length) throw new Error('no matching project/scenario');

const liveDir = (p) => join(root, 'tests/parity/baselines/live', p.name);
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

async function runScenario(browser, project, scenario, outDir, written, oracleFiles) {
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
  if (oracleFiles) await routeOracle(context, PARITY_LIVE_ORIGIN, oracleFiles);
  const page = await context.newPage();
  const pageErrors = [];
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
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
  const lowPower = await page.evaluate(
    () => matchMedia('(max-width: 900px), (pointer: coarse)').matches,
  );
  if (lowPower !== project.lowPower) throw new Error(`${project.name}: lowPower=${lowPower}`);
  const driver = createParityDriver({
    page,
    scenarioId: scenario.id,
    outDir,
    written,
  });
  await scenario.run(driver);
  const trace = await page.evaluate(() => ({
    storageWrites: window.__parityStorage,
    audio: window.__parityAudio,
  }));
  const name = `${scenario.id}.trace.json`;
  writeFileSync(join(outDir, name), `${JSON.stringify({ ...trace, pageErrors }, null, 1)}\n`);
  written.push(name);
  await context.close();
}

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
const oracleFiles = oracle ? loadOracleFiles(root) : null;
let failed = false;
try {
  for (const project of projects) {
    const outDir = args.out
      ? join(args.out, project.name)
      : comparing
        ? mkdtempSync(join(os.tmpdir(), `parity-${project.name}-`))
        : liveDir(project);
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
      await runScenario(browser, project, scenario, outDir, written, oracleFiles);
      console.log(`${project.name} ${scenario.id} ok (${((Date.now() - t) / 1000).toFixed(1)}s)`);
    }
    if (!comparing) {
      const meta = {
        capturedAt: new Date().toISOString(),
        origin: PARITY_LIVE_ORIGIN,
        liveAssets: await liveAssetHashes(browser),
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
        verifyTolerance: { canvasPng: 0, json: 0, domPngPixelRatio: DOM_PNG_TOLERANCE },
        scenarios: scenarios.map((s) => s.id),
        files: written.length,
        durationSec: Math.round((Date.now() - started) / 1000),
      };
      writeFileSync(join(outDir, 'capture-meta.json'), `${JSON.stringify(meta, null, 1)}\n`);
      console.log(`${project.name}: ${written.length} files -> ${relative(root, outDir)}`);
      continue;
    }
    const ids = scenarios.map((s) => s.id);
    const inScope = (f) =>
      !f.endsWith('.scene.json') &&
      ids.some((id) => f.startsWith(`${id}--`) || f === `${id}.trace.json`);
    const { compared, problems, tolerated } = compareCaptureDirs(liveDir(project), outDir, inScope);
    console.log(
      `${project.name}: compared ${compared} files vs live baselines, ${problems.length} differ, ` +
        `${tolerated.length} DOM shots within ${DOM_PNG_TOLERANCE * 100}% tolerance`,
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
