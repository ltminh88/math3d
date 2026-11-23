// The numberfort diorama: a stone floor, two castle towers with blue cone roofs joined by a
// wall at the back, three coloured number blocks in front, a flag on each tower. Towers and
// blocks are baked into one lit mesh; flag tips glow into one unlit mesh (emissive look, no
// extra lights or shadow maps). Two draw calls.
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
import { NUMBERFORT_COLORS as C, TOWER_COUNT, towerCenter } from './numberfort-layout';

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

/** [x, colour, z] of the three number blocks in front of the wall. */
const BLOCKS: readonly (readonly [x: number, color: number, z: number])[] = [
  [-2.4, C.blockYellow, 2.6],
  [0, C.blockTeal, 2.9],
  [2.4, C.blockRed, 2.6],
] as const;

function buildCastle(ctx: WorldBuildContext, root: Object3D): void {
  // Stone floor the castle stands on.
  addBox(ctx, root, 0, -0.1, 0, 16, 0.2, 10, C.floor);
  for (let i = 0; i < TOWER_COUNT; i++) {
    const { x, z } = towerCenter(i);
    // Tower body and cone roof.
    addCylinder(ctx, root, x, 1.6, z, 1.1, 1.1, 3.2, C.stone, 10);
    addCylinder(ctx, root, x, 3.95, z, 0, 1.35, 1.5, C.roof, 10);
    // A darker stone band where the roof meets the tower.
    addCylinder(ctx, root, x, 3.25, z, 1.15, 1.15, 0.2, C.stoneDark, 10);
    // Flag pole on the roof peak and a small pennant.
    addCylinder(ctx, root, x, 5.1, z, 0.05, 0.05, 1.2, C.pole, 6);
    addBox(ctx, root, x + 0.35, 5.5, z, 0.7, 0.35, 0.04, i === 0 ? C.flagYellow : C.flagRed);
  }
  // Wall joining the towers along the back.
  addBox(ctx, root, 0, 0.6, -2.8, 6, 1.2, 0.8, C.stone);
  addBox(ctx, root, 0, 1.35, -2.8, 6, 0.3, 0.9, C.stoneDark);
  // Three number blocks in front of the wall.
  for (const [x, color, z] of BLOCKS) {
    addBox(ctx, root, x, 0.5, z, 1, 1, 1, color);
    addBox(ctx, root, x, 1.15, z, 1, 0.3, 1, C.stoneDark);
  }
}

function buildGlow(ctx: WorldBuildContext, root: Object3D): void {
  for (let i = 0; i < TOWER_COUNT; i++) {
    const { x, z } = towerCenter(i);
    // A warm glow at each flag tip, like a lantern on the tower.
    addSphere(ctx, root, x, 5.75, z, 0.22, i === 0 ? C.flagYellow : C.flagRed).scale.y = 1.2;
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

/** Builds the castle, its background colour, fog and the soft daylight into `scene`. */
export function buildNumberfortDiorama(scene: Scene): void {
  scene.background = new Color(C.background);
  scene.fog = new Fog(C.background, 18, 60);
  scene.add(bakedMesh(buildCastle, true), bakedMesh(buildGlow, false));
  scene.add(new HemisphereLight(0xf2f6ff, 0x8a7a5a, 1.1));
  const key = new DirectionalLight(0xfff2d8, 1.2);
  key.position.set(-6, 12, 10);
  scene.add(key, key.target);
}
