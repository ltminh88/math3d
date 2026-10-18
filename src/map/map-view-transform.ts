// Map canvas sizing, view fitting and screen -> world hit-testing (original `Jl`, `lg`, `cg`,
// `hg`, bundle lines 1726-1755) plus the view presets the HUD/overlay use (`sc`, `oc`).
import { REGIONS, type Region } from '../config/regions';
import { WALKABLE_BOUNDS as BOUNDS } from '../config/world-constants';

/** World point at the canvas centre, world->px scale and rotation (radians). Mutable. */
export interface MapView {
  cx: number;
  cz: number;
  scale: number;
  rotation: number;
}

export interface PreparedMapCanvas {
  readonly ctx: CanvasRenderingContext2D;
  readonly w: number;
  readonly h: number;
}

/** Resizes the backing store to CSS size x DPR (max 2) and returns a CSS-pixel context. */
export function prepareMapCanvas(canvas: HTMLCanvasElement): PreparedMapCanvas {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = canvas.clientWidth;
  const h = canvas.clientHeight;
  if (canvas.width !== Math.round(w * dpr) || canvas.height !== Math.round(h * dpr)) {
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  }
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('2D canvas context unavailable');
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w, h };
}

/** Fits both banks (+6 units each side) into a w x h box with `padding` px margins. */
export function fitWorldMapView(width: number, height: number, padding = 40): MapView {
  const spanX = BOUNDS.east.maxX - BOUNDS.west.minX + 12;
  const spanZ = BOUNDS.maxZ - BOUNDS.minZ + 12;
  return {
    cx: (BOUNDS.west.minX + BOUNDS.east.maxX) / 2,
    cz: (BOUNDS.minZ + BOUNDS.maxZ) / 2,
    scale: Math.min((width - padding * 2) / spanX, (height - padding * 2) / spanZ),
    rotation: 0,
  };
}

/** Full-map overlay view: side panel on wide (> 820 px) canvases, bottom sheet otherwise. */
export function computeWorldMapView(width: number, height: number): MapView {
  const wide = width > 820;
  const view = fitWorldMapView(
    wide ? width - 360 : width,
    wide ? height : height * 0.62,
    wide ? 56 : 22,
  );
  if (wide) {
    view.cx += 180 / view.scale;
  } else {
    view.cz += (height * 0.19) / view.scale;
  }
  return view;
}

/** HUD minimap view: centred on the player, 70 world units across, rotated with the camera. */
export function computeMinimapView(width: number, x: number, z: number, heading: number): MapView {
  return { cx: x, cz: z, scale: width / 70, rotation: heading };
}

/** Canvas point (CSS px) -> ground point. Ignores rotation, like the original (map is unrotated). */
export function screenToWorld(
  view: MapView,
  width: number,
  height: number,
  sx: number,
  sy: number,
): { x: number; z: number } {
  return {
    x: view.cx + (sx - width / 2) / view.scale,
    z: view.cz + (sy - height / 2) / view.scale,
  };
}

/** Region under a ground point: exact non-village footprints first, then the west bank. */
export function regionAtMapPoint(x: number, z: number): Region | undefined {
  return (
    REGIONS.filter((region) => region.id !== 'village').find(
      (region) =>
        Math.abs(x - region.center[0]) <= region.size[0] / 2 &&
        Math.abs(z - region.center[1]) <= region.size[1] / 2,
    ) ??
    (x > BOUNDS.west.minX && x < BOUNDS.west.maxX && z > BOUNDS.minZ && z < BOUNDS.maxZ
      ? REGIONS[0]
      : undefined)
  );
}
