// Typed access to the world (phase 05/06) and map renderer (phase 07) for the UI. Both are still
// reached through their legacy JS shims until phase 09 removes them; this file is the only place
// the UI touches the shims, so pointing at the typed modules later is a one-file change.
import type { Region } from '../config/regions';
// @ts-expect-error -- legacy JS shim has no type declarations (typed module lands in phase 07).
import * as mapShim from '../legacy/shims/map.js';
// @ts-expect-error -- legacy JS shim has no type declarations (typed module lands in phase 05/06).
import * as worldShim from '../legacy/shims/world.js';
import type { WorldPublicApi } from '../world/world-public-api';

/** Public surface of the 3D world that the UI reads and drives (owned by src/world). */
export type GameWorld = WorldPublicApi;

export type GameWorldConstructor = new (canvas: HTMLElement) => GameWorld;

/** Map camera: centre on the ground plane, pixels per world unit and rotation. */
export interface MapView {
  cx: number;
  cz: number;
  scale: number;
  rotation: number;
}

/** Per-frame data drawn on the minimap and the world map. */
export interface MapDrawState {
  player: { x: number; z: number; facing: number };
  milo: { x: number; z: number };
  bridge: number;
  questComplete: boolean;
  selected: string | undefined;
  labels: boolean;
  translate: (text: string) => string;
  time: number;
}

export interface PreparedCanvas {
  ctx: CanvasRenderingContext2D;
  w: number;
  h: number;
}

interface LegacyMapApi {
  Jl: (canvas: HTMLCanvasElement) => PreparedCanvas;
  Ql: (ctx: CanvasRenderingContext2D, w: number, h: number, view: MapView, s: MapDrawState) => void;
  cg: (view: MapView, w: number, h: number, x: number, y: number) => { x: number; z: number };
  hg: (x: number, z: number) => Region | undefined;
  lg: (w: number, h: number, padding?: number) => MapView;
}

const map = mapShim as LegacyMapApi;

export const GameWorldClass = (worldShim as { $m: GameWorldConstructor }).$m;

/** Sizes a canvas to its CSS box at devicePixelRatio (max 2) and returns its 2D context. */
export const prepareCanvas = map.Jl;
/** Draws the map (terrain, roads, regions, markers) for `view`. */
export const drawMap = map.Ql;
/** Converts a canvas point to world coordinates for `view`. */
export const screenToWorld = map.cg;
/** Region hit-test used by map clicks (village only inside the west-bank bounds). */
export const regionAtMapPoint = map.hg;
/** View that fits the whole kingdom into `w`×`h` with `padding`. */
export const fitWorldView = map.lg;
