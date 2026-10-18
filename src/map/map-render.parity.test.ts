import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { afterEach, describe, expect, it } from 'vitest';
import { isRegionUnlocked, REGIONS } from '../config/regions';
import { ROADS } from '../config/roads';
import { BRIDGE_SEGMENTS, RIVER, WALKABLE_BOUNDS } from '../config/world-constants';
import type { MapDrawState } from './map-draw-state';
import { drawMap } from './map-render';
import {
  computeMinimapView,
  computeWorldMapView,
  type MapView,
  prepareMapCanvas,
} from './map-view-transform';
import { type CanvasCall, createRecordingContext } from './record-canvas-calls-for-tests';

// ORIGINAL map block (const sg .. end of Ql), sliced from the formatted bundle and run in a vm
// against the recovered constants (themselves golden-checked against the original).
const FIRST = 1674;
const LAST = 1912;

type OriginalDraw = (ctx: unknown, w: number, h: number, view: MapView, state: unknown) => void;
type OriginalPrepare = (canvas: unknown) => { ctx: unknown; w: number; h: number };

function loadOriginal(unlock: (region: unknown, done: boolean) => boolean, dpr = 1) {
  const url = new URL('../../recovered/formatted/game-app-section.js', import.meta.url);
  const lines = readFileSync(url, 'utf8').split('\n');
  if (lines[FIRST - 1] !== "const sg = '#194f42';" || lines[LAST] !== 'const cl = {') {
    throw new Error(`original map block ${FIRST}-${LAST} drifted`);
  }
  const code = `${lines.slice(FIRST - 1, LAST).join('\n')}\nmodule.exports = { Ql, Jl };`;
  const sandbox = {
    module: { exports: {} as { Ql: OriginalDraw; Jl: OriginalPrepare } },
    fe: WALKABLE_BOUNDS,
    Dt: REGIONS,
    Qe: RIVER,
    Wr: ROADS,
    yt: BRIDGE_SEGMENTS,
    Di: unlock,
    devicePixelRatio: dpr,
  };
  vm.runInNewContext(code, sandbox, { filename: 'original-map-block.js' });
  return sandbox.module.exports;
}

const translate = (text: string) => `EN:${text}`;
const baseState = {
  player: { x: -8, z: 3, facing: 1.2 },
  milo: { x: -10, z: -2 },
  translate,
  time: 12.34,
};

const SCENARIOS: [string, number, number, MapView, Omit<MapDrawState, 'translate'>][] = [
  [
    'minimap rotated',
    140,
    140,
    computeMinimapView(140, -8, 3, 0.7),
    { ...baseState, bridge: 2, questComplete: false, labels: false },
  ],
  [
    'minimap zoomed',
    180,
    180,
    computeMinimapView(180, 30, 10, -2),
    { ...baseState, bridge: 6, questComplete: true, labels: false },
  ],
  [
    'map desktop, garden selected',
    1280,
    720,
    computeWorldMapView(1280, 720),
    { ...baseState, bridge: 0, questComplete: false, labels: true, selected: 'garden' },
  ],
  [
    'map desktop, locked tower selected',
    1280,
    720,
    computeWorldMapView(1280, 720),
    { ...baseState, bridge: 3, questComplete: false, labels: true, selected: 'tower' },
  ],
  [
    'map mobile, village selected',
    412,
    839,
    computeWorldMapView(412, 839),
    { ...baseState, bridge: 6, questComplete: true, labels: false, selected: 'village' },
  ],
];

function trace(draw: (ctx: CanvasRenderingContext2D) => void): CanvasCall[] {
  const calls: CanvasCall[] = [];
  draw(createRecordingContext(calls));
  return calls;
}

describe('drawMap call-for-call parity with the original Ql', () => {
  const original = loadOriginal(isRegionUnlocked as (region: unknown, done: boolean) => boolean);

  it.each(SCENARIOS)('%s', (_name, w, h, view, partial) => {
    const state: MapDrawState = { ...partial, translate };
    const expected = trace((ctx) => original.Ql(ctx, w, h, { ...view }, state));
    const actual = trace((ctx) => drawMap(ctx, w, h, { ...view }, state));
    expect(actual.length).toBeGreaterThan(5000);
    expect(actual).toEqual(expected);
  });

  it('honours an injected unlock predicate', () => {
    const lockAll = () => false;
    const lockedOriginal = loadOriginal(lockAll);
    const [, w, h, view, partial] = SCENARIOS[2] ?? [];
    if (!view || !partial || !w || !h) throw new Error('missing scenario');
    const state: MapDrawState = { ...partial, translate, questComplete: true, isUnlocked: lockAll };
    const expected = trace((ctx) => lockedOriginal.Ql(ctx, w, h, { ...view }, state));
    expect(trace((ctx) => drawMap(ctx, w, h, { ...view }, state))).toEqual(expected);
  });
});

describe('prepareMapCanvas parity with the original Jl', () => {
  afterEach(() => {
    Reflect.deleteProperty(globalThis, 'devicePixelRatio');
  });

  it.each([0, 1, 1.5, 3])('dpr %s', (dpr) => {
    const run = (prepare: (canvas: HTMLCanvasElement) => { w: number; h: number }) => {
      const calls: CanvasCall[] = [];
      const ctx = createRecordingContext(calls);
      const canvas = {
        clientWidth: 333,
        clientHeight: 201,
        width: 300,
        height: 150,
        getContext: () => ctx,
      };
      const { w, h } = prepare(canvas as unknown as HTMLCanvasElement);
      return { w, h, width: canvas.width, height: canvas.height, calls };
    };
    Object.defineProperty(globalThis, 'devicePixelRatio', { value: dpr, configurable: true });
    const original = loadOriginal(
      isRegionUnlocked as (region: unknown, done: boolean) => boolean,
      dpr,
    );
    expect(run(prepareMapCanvas)).toEqual(run((canvas) => original.Jl(canvas)));
  });
});
