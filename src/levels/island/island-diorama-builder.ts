// The island diorama: a sand islet in a lagoon, three palms, a plank bridge from the
// front edge and a small flag. Built like the numberfort diorama (two baked meshes: one
// lit, one unlit glow) so the scene stays at 2 draw calls.
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
import { addIslandPalm } from '../../world/regions/island-region-builder';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder, addSphere } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';

const COLORS = {
  background: 0xdff3f0,
  sea: 0x5cc6d6,
  sand: 0xe8d29a,
  wood: 0xa47c52,
  trunk: 0x7a5232,
  flag: 0x2f8f7b,
  glint: 0xffd064,
} as const;

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

function buildIslet(ctx: WorldBuildContext, root: Object3D): void {
  // Lagoon, then the sand islet on top of it.
  addCylinder(ctx, root, 0, -0.05, 0, 9, 9, 0.1, COLORS.sea, 28);
  addCylinder(ctx, root, 0, 0.05, 0, 4.5, 4.5, 0.2, COLORS.sand, 28);
  // Plank bridge from the sand's front edge toward the viewer.
  for (let i = 0; i < 4; i++) {
    addBox(ctx, root, -2, 0.16, 4.6 + i * 0.5, 1.2, 0.08, 0.5, COLORS.wood);
  }
  addIslandPalm(ctx, root, -2.5, -1.5);
  addIslandPalm(ctx, root, 2.5, -2);
  addIslandPalm(ctx, root, 2.8, 1.5);
  // A small flag marks the islet.
  addCylinder(ctx, root, 0.5, 0.9, -0.5, 0.05, 0.05, 1.8, COLORS.trunk, 6);
  addBox(ctx, root, 0.9, 1.6, -0.5, 0.8, 0.4, 0.04, COLORS.flag);
}

function buildGlow(ctx: WorldBuildContext, root: Object3D): void {
  addSphere(ctx, root, 0.5, 1.85, -0.5, 0.2, COLORS.glint).scale.y = 1.2;
  addSphere(ctx, root, -5.5, 0.1, 3, 0.3, COLORS.glint);
  addSphere(ctx, root, 5.5, 0.1, -3, 0.3, COLORS.glint);
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

/** Builds the islet, its background colour, fog and the soft daylight into `scene`. */
export function buildIslandDiorama(scene: Scene): void {
  scene.background = new Color(COLORS.background);
  scene.fog = new Fog(COLORS.background, 18, 60);
  scene.add(bakedMesh(buildIslet, true), bakedMesh(buildGlow, false));
  scene.add(new HemisphereLight(0xf2f6ff, 0x8a7a5a, 1.1));
  const key = new DirectionalLight(0xfff2d8, 1.2);
  key.position.set(-6, 12, 10);
  scene.add(key, key.target);
}
