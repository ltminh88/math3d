// Low-poly level gate in the recovered style: two wooden posts with lantern caps, a lintel with
// the level's sign, a portal panel that glows once the gate is open, and a padlock while locked.
// Built after the world's scatter pass and outside the static merge; its collision circles are
// appended to the obstacle list, so no RNG draw shifts. Frame and padlock are baked (phase 03:
// 8 gates at 6 draw calls each instead of 16).
import { DoubleSide, Group, Mesh, MeshStandardMaterial, PlaneGeometry, TorusGeometry } from 'three';
import type { LevelGate } from '../../config/level-gate-config';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder, addMesh, addSphere } from '../../world/world-primitives';
import { addSign } from '../../world/world-text-sign';
import { bakeVertexColoredGeometry } from './bake-vertex-colored-geometry';
import type { GateStatus } from './level-progression';

const WOOD = 0x8c6947;
const LANTERN = 0xffd064;
const POST_X = 1.3;

export interface LevelGateView {
  readonly group: Group;
  setStatus(status: GateStatus): void;
}

const portalMaterial = (color: number, emissive: number, opacity: number) =>
  new MeshStandardMaterial({
    color,
    emissive,
    emissiveIntensity: 0.55,
    roughness: 0.6,
    transparent: true,
    opacity,
    side: DoubleSide,
  });

/** Gate-local offset (dx, dz) -> world ground point, honouring the gate's facing. */
function toWorld(gate: LevelGate, dx: number, dz: number): { x: number; z: number } {
  const cos = Math.cos(gate.facing);
  const sin = Math.sin(gate.facing);
  return { x: gate.position[0] + dx * cos + dz * sin, z: gate.position[1] - dx * sin + dz * cos };
}

/** Bakes the single-colour parts built into `root` into one vertex-coloured, shadowed mesh. */
function bakedPart(root: Group, name: string): Mesh {
  const mesh = new Mesh(
    bakeVertexColoredGeometry(root),
    new MeshStandardMaterial({
      vertexColors: true,
      roughness: WORLD_LIGHTING.roughness.primitive,
      metalness: 0,
    }),
  );
  mesh.name = name;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function buildLevelGate(ctx: WorldBuildContext, gate: LevelGate): LevelGateView {
  const group = new Group();
  group.name = `level-gate-${gate.levelId}`;
  group.position.set(gate.position[0], 0, gate.position[1]);
  group.rotation.y = gate.facing;
  // Posts, lanterns and lintel bake into one mesh (2 draw calls with its shadow instead of 10);
  // the scratch material cache keeps the world's cached materials out of the bake's dispose.
  const { scene, obstacles, floaters, ripples, windmill } = ctx;
  const scratch: WorldBuildContext = {
    scene,
    obstacles,
    floaters,
    ripples,
    windmill,
    materials: new Map(),
  };
  const frame = new Group();
  for (const x of [-POST_X, POST_X]) {
    addCylinder(scratch, frame, x, 1.5, 0, 0.17, 0.21, 3, WOOD);
    addSphere(scratch, frame, x, 3.2, 0, 0.3, LANTERN);
  }
  addBox(scratch, frame, 0, 3, 0, 3.1, 0.24, 0.24, WOOD);
  group.add(bakedPart(frame, 'frame'));
  addSign(group, gate.sign, 0, 3.75, 0.05, 1.9, '#ffd064', '#6b4a1c');
  const locked = portalMaterial(0x9fb0bf, 0x1d2a33, 0.78);
  const open = portalMaterial(0xffe9a3, 0xffc24a, 0.86);
  const portal = new Mesh(new PlaneGeometry(2.3, 2.75), locked);
  portal.position.set(0, 1.45, 0);
  portal.receiveShadow = true;
  group.add(portal);
  const lockParts = new Group();
  addBox(scratch, lockParts, 0, 0, 0, 0.5, 0.42, 0.14, LANTERN);
  addMesh(scratch, lockParts, new TorusGeometry(0.15, 0.05, 6, 10, Math.PI), LANTERN, 0, 0.21, 0);
  const padlock = bakedPart(lockParts, 'padlock');
  padlock.position.set(0, 1.55, 0.06);
  group.add(padlock);
  ctx.scene.add(group);
  for (const [dx, radius] of [
    [-POST_X, 0.3],
    [0, 0.95],
    [POST_X, 0.3],
  ] as const) {
    ctx.obstacles.push({ ...toWorld(gate, dx, 0), radius });
  }
  return {
    group,
    setStatus(status) {
      portal.material = status === 'locked' ? locked : open;
      padlock.visible = status === 'locked';
    },
  };
}

/** Where the player stands to use the gate: in front of the portal (facing side). */
export function gateFrontPoint(gate: LevelGate, distance = 1.9): { x: number; z: number } {
  return toWorld(gate, 0, distance);
}
