// Low-poly pieces the figure views draw with, in board coordinates: thick strokes (thin boxes),
// flat polygons, rings, dots and dashed lines. Single-colour meshes built into a scratch group,
// then baked by the caller (one draw call per figure).
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  type Object3D,
  type Scene,
  Shape,
  ShapeGeometry,
  TorusGeometry,
} from 'three';
import type { WorldBuildContext } from '../../world/world-build-context';
import { addMesh } from '../../world/world-primitives';
import { BOARD } from './valley-layout-constants';
import type { XZ } from './valley-layout-types';

/** A throw-away build context for the recovered primitives (baked right after). */
export function scratchContext(scene: Scene): WorldBuildContext {
  return {
    scene,
    materials: new Map(),
    obstacles: [],
    floaters: [],
    ripples: [],
    windmill: new Group(),
  };
}

/** Height of strokes above the board (fills sit just under them). */
export const STROKE_Y = BOARD.top + 0.05;

/** A stroke from `a` to `b` (`width` across, `height` tall), lying on the board. */
export function addStroke(
  ctx: WorldBuildContext,
  root: Object3D,
  a: XZ,
  b: XZ,
  color: number,
  width = 0.12,
  height = 0.06,
  y = STROKE_Y,
): void {
  const [dx, dz] = [b[0] - a[0], b[1] - a[1]];
  const length = Math.hypot(dx, dz);
  if (length < 1e-6) return;
  const geometry = new BoxGeometry(length + width, height, width);
  const mesh = addMesh(ctx, root, geometry, color, (a[0] + b[0]) / 2, y, (a[1] + b[1]) / 2);
  mesh.rotation.y = -Math.atan2(dz, dx);
}

/** A dashed stroke (the hint's guide lines). */
export function addDashes(
  ctx: WorldBuildContext,
  root: Object3D,
  a: XZ,
  b: XZ,
  color: number,
): void {
  const dashes = 9;
  for (let i = 0; i < dashes; i++) {
    const t0 = i / dashes;
    const t1 = (i + 0.55) / dashes;
    const at = (t: number): XZ => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
    addStroke(ctx, root, at(t0), at(t1), color, 0.1, 0.07, STROKE_Y + 0.02);
  }
}

/** A flat filled polygon (board points, any winding). */
export function addFill(
  ctx: WorldBuildContext,
  root: Object3D,
  points: readonly XZ[],
  color: number,
): void {
  const shape = new Shape();
  points.forEach(([x, z], i) => {
    if (i === 0) shape.moveTo(x, -z);
    else shape.lineTo(x, -z);
  });
  shape.closePath();
  // ShapeGeometry always faces +z (it fixes the winding); the turn lays it face up.
  const geometry = new ShapeGeometry(shape);
  geometry.rotateX(-Math.PI / 2);
  addMesh(ctx, root, geometry, color, 0, BOARD.top + 0.02, 0).castShadow = false;
}

/** A flat ring (circle outline) and, optionally, the water inside it. */
export function addRing(
  ctx: WorldBuildContext,
  root: Object3D,
  c: XZ,
  r: number,
  color: number,
  water?: number,
): void {
  if (water !== undefined) {
    addMesh(
      ctx,
      root,
      new CylinderGeometry(r, r, 0.04, 40),
      water,
      c[0],
      BOARD.top + 0.02,
      c[1],
    ).castShadow = false;
  }
  const ring = new TorusGeometry(r, 0.06, 6, 56);
  ring.rotateX(Math.PI / 2);
  addMesh(ctx, root, ring, color, c[0], STROKE_Y, c[1]);
}

/** A round stone / point marker. */
export function addDot(
  ctx: WorldBuildContext,
  root: Object3D,
  at: XZ,
  color: number,
  r = 0.14,
  h = 0.12,
): void {
  addMesh(
    ctx,
    root,
    new CylinderGeometry(r, r * 1.1, h, 12),
    color,
    at[0],
    STROKE_Y + h / 2,
    at[1],
  );
}
