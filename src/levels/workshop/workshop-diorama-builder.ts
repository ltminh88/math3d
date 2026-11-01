// The workshop room: the region's palette from the world (warm shed walls, rust roof beams, oak
// workbench, ink ticks, gold balance pans) as an open-front shed with a window, shelves, the
// workbench and the static parts of its tools (balance, ruler body, tile board, thermometer
// plate). Built from the recovered primitives into a scratch scene, then baked to one mesh.
import {
  Color,
  DirectionalLight,
  Group,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  type Object3D,
  Scene,
} from 'three';
import { SKY_HORIZON_COLOR } from '../../config/world-constants';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';
import { BENCH_TOP, WORKSHOP_COLORS as C, STATION_SPOTS } from './workshop-layout';

function scratchContext(scene: Scene): WorldBuildContext {
  return {
    scene,
    materials: new Map(),
    obstacles: [],
    floaters: [],
    ripples: [],
    windmill: new Group(),
  };
}

function buildRoom(ctx: WorldBuildContext, root: Object3D): void {
  addBox(ctx, root, 0, -0.1, 0, 30, 0.2, 22, C.grass);
  addBox(ctx, root, 0, 0.02, -0.5, 13, 0.1, 7, C.floor);
  addBox(ctx, root, 0, 2.6, -4, 13, 5.2, 0.3, C.wall);
  for (const x of [-6.4, 6.4]) addBox(ctx, root, x, 2.6, -0.5, 0.3, 5.2, 7, C.wall);
  for (const x of [-4, 0, 4]) addBox(ctx, root, x, 5.25, -0.5, 0.25, 0.25, 7.2, C.beam);
  addBox(ctx, root, 0, 5.4, -0.5, 13.4, 0.2, 7.4, C.roof);
  // Window with a sky pane, and two shelves of boxes and tins.
  addBox(ctx, root, -3.4, 3.2, -3.82, 2.4, 1.6, 0.06, C.window);
  addBox(ctx, root, -3.4, 3.2, -3.8, 2.6, 0.12, 0.1, C.oak);
  for (const y of [2.6, 3.6]) {
    addBox(ctx, root, 3.4, y, -3.6, 3, 0.1, 0.6, C.oak);
    for (const [dx, h, color] of [
      [-1, 0.5, C.box],
      [-0.3, 0.35, C.tin],
      [0.6, 0.6, C.box],
    ] as const) {
      addBox(ctx, root, 3.4 + dx, y + h / 2 + 0.05, -3.6, 0.5, h, 0.4, color);
    }
  }
}

function buildBench(ctx: WorldBuildContext, root: Object3D): void {
  addBox(ctx, root, 0, BENCH_TOP - 0.12, 0, 9, 0.24, 3.2, C.oak);
  for (const x of [-4.1, 4.1])
    for (const z of [-1.3, 1.3])
      addBox(ctx, root, x, (BENCH_TOP - 0.24) / 2, z, 0.3, BENCH_TOP - 0.24, 0.3, C.oakDark);
  // Ruler body at the front edge and the tile board in the middle.
  const r = STATION_SPOTS.ruler;
  addBox(ctx, root, r[0], BENCH_TOP + 0.03, r[1], 5.4, 0.06, 0.5, C.ruler);
  const t = STATION_SPOTS.tiles;
  addBox(ctx, root, t[0], BENCH_TOP + 0.04, t[1], 2.7, 0.08, 2.2, C.board);
  // Balance (as on the world's workshop lawn): base, post, beam, two gold pans.
  const [bx, bz] = STATION_SPOTS.balance;
  addCylinder(ctx, root, bx, BENCH_TOP + 0.1, bz, 0.4, 0.45, 0.2, C.oakDark, 10);
  addCylinder(ctx, root, bx, BENCH_TOP + 0.9, bz, 0.06, 0.06, 1.6, C.metal, 8);
  addBox(ctx, root, bx, BENCH_TOP + 1.7, bz, 1.9, 0.08, 0.08, C.metal);
  for (const side of [-0.85, 0.85]) {
    addBox(ctx, root, bx + side, BENCH_TOP + 1.4, bz, 0.02, 0.6, 0.02, C.ink);
    addCylinder(ctx, root, bx + side, BENCH_TOP + 1.08, bz, 0.4, 0.32, 0.06, C.gold, 12);
  }
  // Thermometer plate on the back wall.
  const [hx] = STATION_SPOTS.thermometer;
  addBox(ctx, root, hx, 3, -3.82, 0.7, 2.6, 0.08, C.plate);
  addCylinder(ctx, root, hx, 1.85, -3.72, 0.16, 0.16, 0.12, C.mercury, 10).rotation.x = Math.PI / 2;
}

export interface WorkshopDiorama {
  readonly sun: DirectionalLight;
}

export function buildWorkshopDiorama(scene: Scene): WorkshopDiorama {
  scene.background = new Color(SKY_HORIZON_COLOR);
  const scratch = new Scene();
  const ctx = scratchContext(scratch);
  buildRoom(ctx, scratch);
  buildBench(ctx, scratch);
  const material = new MeshStandardMaterial({
    vertexColors: true,
    roughness: WORLD_LIGHTING.roughness.primitive,
    metalness: 0,
    flatShading: true,
  });
  const mesh = new Mesh(bakeVertexColoredGeometry(scratch), material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);

  const { hemisphereSky, hemisphereGround, hemisphereIntensity } = WORLD_LIGHTING;
  scene.add(new HemisphereLight(hemisphereSky, hemisphereGround, hemisphereIntensity));
  const sun = new DirectionalLight(WORLD_LIGHTING.sunColor, WORLD_LIGHTING.sunIntensity);
  sun.position.set(-6, 14, 10);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  sun.shadow.normalBias = 0.045;
  sun.shadow.bias = -0.0003;
  sun.shadow.radius = WORLD_LIGHTING.shadowRadius;
  Object.assign(sun.shadow.camera, { left: -9, right: 9, top: 8, bottom: -6, near: 1, far: 40 });
  sun.shadow.camera.updateProjectionMatrix();
  scene.add(sun, sun.target);
  return { sun };
}
