// Builds the map hit-test golden (tests/parity/golden/map-hit-test.json) by running the ORIGINAL
// view/hit-test functions (lg, cg, hg at lines 1735-1755 and oc at 2344-2348 of the formatted
// bundle) in a vm against the harness constants. Per map mode: the fitted view plus a 40x40 grid
// of canvas points (cell centres) mapped through cg -> hg to a region code ('.' = no region).
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const BLOCKS = [
  [1735, 1755, 'function lg(i, e, t = 40) {'],
  [2344, 2348, 'function oc(i, e) {'],
];
const GRID = 40;
const MODES = [
  { name: 'desktop-chromium', width: 1280, height: 720 },
  { name: 'mobile-pixel', width: 412, height: 839 },
  { name: 'tablet-wide', width: 1024, height: 768 },
];

function loadOriginalMapFunctions(sourcePath, m) {
  const lines = readFileSync(sourcePath, 'utf8').split('\n');
  const code = BLOCKS.map(([first, last, head]) => {
    if (lines[first - 1] !== head || lines[last - 1] !== '}') {
      throw new Error(`map block ${first}-${last} drifted`);
    }
    return lines.slice(first - 1, last).join('\n');
  }).join('\n');
  const sandbox = { module: { exports: {} }, fe: m.fe, Dt: m.Dt };
  vm.runInNewContext(`${code}\nmodule.exports = { lg, cg, hg, oc };`, sandbox, {
    filename: 'original-map-block.js',
  });
  return sandbox.module.exports;
}

export function buildMapHitTest(m, sourcePath) {
  const { lg, cg, hg, oc } = loadOriginalMapFunctions(sourcePath, m);
  const legend = Object.fromEntries(m.Dt.map((r, i) => [r.id, String(i)]));
  const modes = MODES.map(({ name, width, height }) => {
    const view = oc(width, height);
    const rows = [];
    for (let row = 0; row < GRID; row++) {
      let line = '';
      for (let col = 0; col < GRID; col++) {
        const sx = ((col + 0.5) * width) / GRID;
        const sy = ((row + 0.5) * height) / GRID;
        const point = cg(view, width, height, sx, sy);
        line += legend[hg(point.x, point.z)?.id] ?? '.';
      }
      rows.push(line);
    }
    return { name, width, height, fitDefault: { ...lg(width, height) }, view: { ...view }, rows };
  });
  return { legend, grid: GRID, sample: 'cell centres ((i + 0.5) * size / grid)', modes };
}
