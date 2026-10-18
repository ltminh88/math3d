#!/usr/bin/env node
// Runs the ORIGINAL pure functions (via original-pure-harness.cjs) and writes golden JSON traces
// to tests/parity/golden/. Output is byte-identical across reruns (fixed seeds, fixed clock).
// Usage: node tools/recovery/golden/generate-golden-traces.mjs [--check]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { buildI18nCorpus, ORIGINAL_SOURCE } from './golden-i18n-corpus.mjs';
import { buildMapHitTest } from './golden-map-hit-test.mjs';
import { buildSaveFixtures } from './golden-save-fixtures.mjs';
import { mulberry32 } from './seeded-random.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '../../..');
const outDir = join(root, 'tests/parity/golden');
const check = process.argv.includes('--check');

// Fixed wall clock for `new Date().toISOString()` inside eg(); advances 1 s per construction.
const EPOCH = Date.UTC(2026, 9, 18, 12, 0, 0);
let ticks = 0;
class FixedDate extends Date {
  constructor(...args) {
    if (args.length) super(...args);
    else super(EPOCH + 1000 * ticks++);
  }
}

function loadHarness() {
  const sandbox = { module: { exports: {} }, Date: FixedDate };
  const code = readFileSync(join(here, 'original-pure-harness.cjs'), 'utf8');
  vm.runInNewContext(code, sandbox, { filename: 'original-pure-harness.cjs' });
  const m = sandbox.module.exports;
  const arity = { kr: 1, Xm: 2, Di: 2, Ps: 1, Ga: 0, Gn: 1, Ym: 1, jm: 1, ll: 3, Jm: 2, Qm: 2 };
  Object.assign(arity, { eg: 4, tg: 2, ag: 0, og: 0, originalLcg: 1 });
  for (const [name, n] of Object.entries(arity)) {
    if (typeof m[name] !== 'function' || m[name].length !== n) {
      throw new Error(`harness export ${name} missing or arity != ${n}`);
    }
  }
  if (m.Kl !== 'aigame3d_multiplication_save' || m.yt !== 6 || m.Dt.length !== 6) {
    throw new Error('harness constants drifted');
  }
  return m;
}

const plain = (v) => JSON.parse(JSON.stringify(v)); // strip vm-context prototypes

function constants(m) {
  const { Ha, Kl, yt, Sa, Qe, fe, Dt, Wr } = m;
  return plain({ Ha, Kl, yt, Sa, Qe, fe, Dt, Wr, defaultSave: m.Ga() });
}

function saveParse(m) {
  return buildSaveFixtures().map(({ name, input }) => ({
    name,
    input,
    output: plain(m.Ym(input)),
  }));
}

// Mirrors the answer flow of fg() (line 2206): eg() records, correct w/o hint clears review.
function pickerRun(m, seed, table) {
  const rng = mulberry32(seed);
  const state = m.Ga();
  state.table = table;
  let last = '';
  const steps = [];
  for (let i = 0; i < 500; i++) {
    const mode = i % 2 ? 'practice' : 'bridge';
    const q = m.Jm(state, mode, last, rng);
    const wantCorrect = rng() < 0.7;
    const hinted = rng() < 0.3;
    const chosen = wantCorrect ? q.answer : q.options.find((o) => o.value !== q.answer).value;
    const ok = m.Qm(q, chosen);
    m.eg(state, q, ok, 900 + i);
    if (ok && !hinted) state.review = state.review.filter((id) => id !== q.id);
    const opts = q.options.map((o) => `${o.value}:${o.label}`).join(',');
    steps.push(`${q.id} ${q.review ? 'R' : '-'} ${opts} ${ok ? 1 : 0}${hinted ? 'h' : ''}`);
    last = q.id;
  }
  const final = plain({ review: state.review, combo: state.combo });
  return { seed, table, steps, final, statsKeys: Object.keys(state.questionStats).length };
}

function pickerSequences(m, seed) {
  return {
    seed,
    legend: 'id review? value:label,... correct(1/0)[h=hinted]',
    runs: [0, ...m.Ha].map((t) => pickerRun(m, seed, t)),
  };
}

function statsUpdate(m) {
  ticks = 0;
  const rng = mulberry32(7);
  const state = m.Ga();
  const trace = [];
  for (let i = 0; i < 60; i++) {
    const a = m.Ha[i % 9];
    const b = 1 + ((i * 7) % 10);
    const q = m.ll(a, b, 'practice', rng);
    const ok = i % 3 !== 1;
    m.eg(state, q, ok, 1234.5 + i * 10.25);
    trace.push({
      id: q.id,
      ok,
      stat: plain(state.questionStats[q.id]),
      combo: state.combo,
      review: [...state.review],
    });
  }
  const reparsed = plain(m.Ym(JSON.stringify(state)));
  return { trace, finalStatsCount: Object.keys(state.questionStats).length, reparsed };
}

function hintLadder(m) {
  const rng = mulberry32(3);
  const rows = [];
  for (const a of m.Ha)
    for (let b = 1; b <= 10; b++) {
      const q = m.ll(a, b, 'practice', rng);
      rows.push({ id: q.id, hints: [1, 2, 3].map((lvl) => m.tg(q, lvl)) });
    }
  return rows;
}

function levelThresholds(m) {
  return { thresholds: [...m.Sa], levelByXp: Array.from({ length: 801 }, (_, xp) => m.kr(xp)) };
}

function regionAtPoint(m) {
  const codes = Object.fromEntries(m.Dt.map((r, i) => [r.id, String(i)]));
  const rows = [];
  for (let z = -50; z <= 50; z++) {
    let row = '';
    for (let x = -60; x <= 80; x++) row += codes[m.Xm(x, z).id];
    rows.push(row);
  }
  const unlocked = m.Dt.map((r) => ({ id: r.id, before: m.Di(r, false), after: m.Di(r, true) }));
  return { legend: codes, x: [-60, 80, 1], z: [-50, 50, 1], rows, unlocked };
}

function lcg(m) {
  return Object.fromEntries(
    [1337, 91, 23, 7].map((s) => {
      const next = m.originalLcg(s);
      return [s, Array.from({ length: 1000 }, () => next())];
    }),
  );
}

const m = loadHarness();
const files = {
  'constants.json': constants(m),
  'save-parse.json': saveParse(m),
  'picker-seed-1.json': pickerSequences(m, 1),
  'picker-seed-42.json': pickerSequences(m, 42),
  'picker-seed-20261018.json': pickerSequences(m, 20261018),
  'stats-update.json': statsUpdate(m),
  'hint-ladder.json': hintLadder(m),
  'level-thresholds.json': levelThresholds(m),
  'region-at-point.json': regionAtPoint(m),
  'lcg-first-1000.json': lcg(m),
  'map-decor.json': plain({ minimapDecor23: m.ag(), worldMapDecor7: m.og() }),
  'i18n-corpus.json': buildI18nCorpus(m, join(root, ORIGINAL_SOURCE)),
  'map-hit-test.json': buildMapHitTest(m, join(root, ORIGINAL_SOURCE)),
};

mkdirSync(outDir, { recursive: true });
let drift = 0;
for (const [name, data] of Object.entries(files)) {
  const path = join(outDir, name);
  const text = `${JSON.stringify(data, null, 1)}\n`;
  if (check) {
    let old = '';
    try {
      old = readFileSync(path, 'utf8');
    } catch {}
    if (old !== text) {
      drift++;
      console.error(`DRIFT ${relative(root, path)}`);
    }
  } else {
    writeFileSync(path, text);
    console.log(`wrote ${relative(root, path)} (${text.length} bytes)`);
  }
}
if (check) {
  console.log(drift ? `${drift} golden file(s) drifted` : 'golden traces byte-identical');
  process.exit(drift ? 1 : 0);
}
