// The market diorama: a warm floor, three stalls with striped awnings and cloth goods, crates
// between them, a lantern pole at each end. Stalls are baked into one lit mesh; lantern glows
// into one unlit mesh (emissive look, no extra lights or shadow maps). Two draw calls.
import {
  Color,
  DirectionalLight,
  Fog,
  Group,
  HemisphereLight,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  type Object3D,
  Scene,
} from 'three';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder, addSphere } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';
import { MARKET_COLORS as C, STALL_COUNT, stallCenter } from './market-layout';

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

/** Deterministic jitter so the stalls look hand-placed without touching Math.random. */
const jitter = (i: number, k: number) => Math.sin(i * 12.9898 + k * 78.233) * 0.5;

function buildStalls(ctx: WorldBuildContext, root: Object3D): void {
  // Warm floor the stalls stand on.
  addBox(ctx, root, 0, -0.1, 0, 16, 0.2, 9, C.floor);
  for (let i = 0; i < STALL_COUNT; i++) {
    const { x, z } = stallCenter(i);
    // Counter and back shelf.
    addBox(ctx, root, x, 0.5, z + 0.6, 3.2, 1, 1.2, C.stallWood);
    addBox(ctx, root, x, 1.35, z - 0.9, 3.2, 0.12, 0.5, C.stallWoodDark);
    // Two posts holding the awning.
    for (const side of [-1, 1]) {
      addCylinder(ctx, root, x + side * 1.5, 1.4, z + 0.6, 0.07, 0.09, 2.8, C.stallWoodDark, 6);
    }
    // Striped awning, slanted toward the front: alternating red and cream panels.
    const stripes = 6;
    for (let s = 0; s < stripes; s++) {
      const panel = addBox(
        ctx,
        root,
        x - 1.55 + (s + 0.5) * (3.1 / stripes),
        2.85,
        z + 0.1,
        3.1 / stripes + 0.02,
        0.08,
        2.4,
        s % 2 === 0 ? C.awningRed : C.awningCream,
      );
      panel.rotation.x = 0.35;
    }
    // Cloth goods on the counter: a green roll and a blue folded stack.
    addCylinder(ctx, root, x - 0.8, 1.15, z + 0.6, 0.18, 0.18, 0.9, C.cloth, 7).rotation.z =
      Math.PI / 2;
    addBox(ctx, root, x + 0.7, 1.15, z + 0.6, 0.7, 0.3, 0.8, C.clothBlue);
    // Crates between the stalls (and one beside the last).
    if (i < STALL_COUNT) {
      const cx = x + 2.1 + jitter(i, 1) * 0.2;
      addBox(ctx, root, cx, 0.35, z + 1.6, 0.7, 0.7, 0.7, C.crate);
      addBox(ctx, root, cx, 1.05, z + 1.6, 0.5, 0.5, 0.5, C.crateDark);
    }
  }
  // Lantern poles at both ends of the row.
  for (const side of [-1, 1]) {
    const px = side * (STALL_COUNT * 2.1 + 1.2);
    addCylinder(ctx, root, px, 1.5, 0, 0.06, 0.08, 3, C.lanternPole, 6);
    addSphere(ctx, root, px, 3.1, 0, 0.22, C.lantern);
  }
}

function buildGlow(ctx: WorldBuildContext, root: Object3D): void {
  for (const side of [-1, 1]) {
    const px = side * (STALL_COUNT * 2.1 + 1.2);
    addSphere(ctx, root, px, 3.1, 0, 0.3, C.lantern).scale.y = 1.2;
    addSphere(ctx, root, px, 0.12, 0.4, 0.35, C.lantern).scale.y = 0.25;
  }
}

function bakedMesh(build: (ctx: WorldBuildContext, root: Object3D) => void, lit: boolean): Mesh {
  const scratch = new Scene();
  build(scratchContext(scratch), scratch);
  const geometry = bakeVertexColoredGeometry(scratch);
  const material = lit
    ? new MeshStandardMaterial({
        vertexColors: true,
        roughness: WORLD_LIGHTING.roughness.primitive,
        metalness: 0,
        flatShading: true,
      })
    : new MeshBasicMaterial({ vertexColors: true });
  return new Mesh(geometry, material);
}

/** Builds the market, its background colour, fog and the soft fair lights into `scene`. */
export function buildMarketDiorama(scene: Scene): void {
  scene.background = new Color(C.background);
  scene.fog = new Fog(C.background, 18, 60);
  scene.add(bakedMesh(buildStalls, true), bakedMesh(buildGlow, false));
  scene.add(new HemisphereLight(0xfff2d8, 0x8a6a4a, 1.1));
  const key = new DirectionalLight(0xffe2b0, 1.2);
  key.position.set(-6, 12, 10);
  scene.add(key, key.target);
}
