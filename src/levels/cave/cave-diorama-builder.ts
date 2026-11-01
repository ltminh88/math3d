// The cave diorama: a dark floor, low-poly rock walls and arches between the seven chambers, a rock
// pedestal per chamber and torches. Rock is baked into one lit mesh; torch flames and the inner
// glow into one unlit mesh (emissive look, no extra lights or shadow maps). Two draw calls.
import {
  Color,
  ConeGeometry,
  DirectionalLight,
  DodecahedronGeometry,
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
import { addBox, addCylinder, addMesh, addSphere } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';
import {
  CAVE_COLORS as C,
  CHAMBER_COUNT,
  CHAMBER_GAP,
  chamberCenter,
  PEDESTAL_HEIGHT,
  TREASURE_INDEX,
} from './cave-layout';

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

/** Deterministic jitter so the walls look hand-placed without touching Math.random. */
const jitter = (i: number, k: number) => Math.sin(i * 12.9898 + k * 78.233) * 0.5;

function buildRock(ctx: WorldBuildContext, root: Object3D): void {
  const length = (TREASURE_INDEX + 1) * CHAMBER_GAP;
  addBox(ctx, root, length / 2 - CHAMBER_GAP / 2, -0.1, -0.7, length + 8, 0.2, 14, C.floor);
  for (let i = 0; i <= TREASURE_INDEX; i++) {
    const { x, z } = chamberCenter(i);
    // Back wall boulders and side stones of the chamber.
    for (let k = 0; k < 3; k++) {
      const r = 1.6 + jitter(i, k) * 0.6;
      const geometry = new DodecahedronGeometry(r, 0);
      addMesh(ctx, root, geometry, k === 1 ? C.rockDark : C.rock, x - 2 + k * 2, r * 0.8, z - 4.2);
    }
    const stone = new DodecahedronGeometry(0.5 + jitter(i, 4) * 0.2, 0);
    addMesh(ctx, root, stone, C.boulder, x + 2.2, 0.3, z + 2.4);
    if (i < CHAMBER_COUNT) {
      addCylinder(ctx, root, x, PEDESTAL_HEIGHT / 2, z, 0.55, 0.75, PEDESTAL_HEIGHT, C.pedestal, 7);
    }
    // Stalactites hanging from the arch, and stalagmites by the wall.
    const spike = new ConeGeometry(0.28, 1.4, 5);
    addMesh(ctx, root, spike, C.rockDark, x - 1.2, 0.7, z - 2.8);
    if (i < TREASURE_INDEX) {
      // Arch between this chamber and the next: two pillars and a lintel of rock.
      const ax = x + CHAMBER_GAP / 2;
      for (const side of [-1, 1]) {
        addCylinder(ctx, root, ax, 1.5, z - 0.7 + side * 2.6, 0.45, 0.65, 3, C.rockDark, 6);
      }
      addBox(ctx, root, ax, 3.1, z - 0.7, 1.1, 0.6, 6.2, C.rock);
      addCylinder(ctx, root, ax - 1.6, 1.1, z - 3, 0.06, 0.08, 1.1, C.wood, 5);
    }
  }
}

function buildGlow(ctx: WorldBuildContext, root: Object3D): void {
  for (let i = 0; i < TREASURE_INDEX; i++) {
    const { x, z } = chamberCenter(i);
    addSphere(ctx, root, x + CHAMBER_GAP / 2 - 1.6, 1.78, z - 3, 0.2, C.torch);
    addSphere(ctx, root, x - 2, 0.12, z - 3.1, 0.35, C.glow).scale.y = 0.25;
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

/** Builds the cave, its background colour, fog and the soft cave lights into `scene`. */
export function buildCaveDiorama(scene: Scene): void {
  scene.background = new Color(C.background);
  scene.fog = new Fog(C.background, 18, 60);
  scene.add(bakedMesh(buildRock, true), bakedMesh(buildGlow, false));
  scene.add(new HemisphereLight(0x9fb4d8, 0x2a2420, 1.1));
  const key = new DirectionalLight(0xffe2b0, 1.2);
  key.position.set(-6, 12, 10);
  scene.add(key, key.target);
}
