// Static field diorama in the recovered low-poly look: meadow ground, fence, barn, scarecrow, hay
// and trees, plus five storm-flattened patches that stand up again one per finished round.
// Repeated props are instanced (one draw call each) to stay well inside the 60-call budget.
import {
  BoxGeometry,
  type BufferGeometry,
  ConeGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
} from 'three';
import {
  FIELD_COLORS as C,
  commitInstances,
  type MaterialCache,
  setInstance,
  shade,
} from './field-materials';

export const PATCH_COUNT = 5;
const TUFTS_PER_PATCH = 6;
const PATCHES: readonly (readonly [x: number, z: number])[] = [
  [-9, -3.5],
  [9, -3.5],
  [-9.5, 1.5],
  [9.5, 1.5],
  [0, -8.2],
];
const FENCE_X = 12;
const FENCE_Z = 10;

export interface FieldDiorama {
  readonly group: Group;
  /** Stands patch `index` up (instantly under reduced motion). */
  restorePatch(index: number, instant: boolean): void;
  update(dt: number): void;
}

function mesh(geometry: BufferGeometry, color: number, mat: MaterialCache, parent: Group) {
  const m = shade(new Mesh(geometry, mat(color)));
  parent.add(m);
  return m;
}

function buildFarmProps(group: Group, mat: MaterialCache): void {
  mesh(new BoxGeometry(34, 0.08, 28), C.grass, mat, group).position.set(0, 0.04, 0);
  const barn = new Group();
  barn.position.set(13.5, 0, -6.5);
  mesh(new BoxGeometry(3.6, 3, 4), C.barn, mat, barn).position.set(0, 1.5, 0);
  const roof = mesh(new CylinderGeometry(0, 2.9, 1.6, 4), C.barnRoof, mat, barn);
  roof.position.set(0, 3.8, 0);
  roof.rotation.y = Math.PI / 4;
  roof.scale.z = 1.3;
  mesh(new BoxGeometry(0.1, 1.9, 1.7), C.cream, mat, barn).position.set(-1.82, 1, 0);
  group.add(barn);
  const crow = new Group();
  crow.position.set(-13, 0, -6);
  mesh(new CylinderGeometry(0.1, 0.12, 3, 6), C.wood, mat, crow).position.set(0, 1.5, 0);
  mesh(new BoxGeometry(2.2, 0.16, 0.16), C.wood, mat, crow).position.set(0, 2.2, 0);
  mesh(new BoxGeometry(0.9, 1, 0.5), C.leaf, mat, crow).position.set(0, 2, 0);
  mesh(new IcosahedronGeometry(0.38, 1), C.hay, mat, crow).position.set(0, 2.85, 0);
  mesh(new ConeGeometry(0.55, 0.6, 8), C.soilDark, mat, crow).position.set(0, 3.35, 0);
  group.add(crow);
}

function buildInstancedProps(group: Group, mat: MaterialCache): void {
  const posts = new InstancedMesh(new CylinderGeometry(0.12, 0.15, 1.2, 6), mat(C.wood), 27);
  const rails = new InstancedMesh(new BoxGeometry(1, 0.12, 0.12), mat(C.wood), 6);
  let p = 0;
  for (let i = 0; i <= 12; i++)
    setInstance(posts, p++, { x: -FENCE_X + i * 2, y: 0.6, z: -FENCE_Z });
  for (let i = 0; i < 7; i++) {
    const z = -FENCE_Z + 2.5 * (i + 1);
    setInstance(posts, p++, { x: -FENCE_X, y: 0.6, z });
    setInstance(posts, p++, { x: FENCE_X, y: 0.6, z });
  }
  [0.45, 0.95].forEach((y, k) => {
    setInstance(rails, k * 3, { x: 0, y, z: -FENCE_Z, sx: FENCE_X * 2, sy: 1, sz: 1 });
    for (const [j, x] of [
      [1, -FENCE_X],
      [2, FENCE_X],
    ] as const) {
      const pose = { x, y, z: -1.25, sx: 17.5, sy: 1, sz: 1 };
      setInstance(rails, k * 3 + j, { ...pose, ry: Math.PI / 2 });
    }
  });
  const hay = new InstancedMesh(new IcosahedronGeometry(0.5, 1), mat(C.hay), 5);
  [-11, -10, 10.5, 11.5, 12.2].forEach((x, i) => {
    setInstance(hay, i, { x, y: 0.3, z: 6 + (i % 2) * 1.3, ry: i * 0.8, sy: 0.7, sx: 1, sz: 1 });
  });
  const trunks = new InstancedMesh(new CylinderGeometry(0.18, 0.25, 1.4, 6), mat(C.wood), 8);
  const crowns = new InstancedMesh(new IcosahedronGeometry(1.1, 1), mat(0x5cae5c), 8);
  for (let i = 0; i < 8; i++) {
    const x = -14 + i * 4;
    const z = -12.5 - (i % 2) * 1.2;
    setInstance(trunks, i, { x, y: 0.7, z });
    setInstance(crowns, i, { x, y: 2, z, sx: 1 + (i % 3) * 0.15 });
  }
  for (const m of [posts, rails, hay, trunks, crowns]) {
    commitInstances(m);
    group.add(shade(m));
  }
}

export function buildFieldDiorama(mat: MaterialCache): FieldDiorama {
  const group = new Group();
  group.name = 'field-diorama';
  buildFarmProps(group, mat);
  buildInstancedProps(group, mat);
  const beds = new InstancedMesh(new BoxGeometry(3.2, 0.16, 2.6), mat(0xffffff), PATCH_COUNT);
  const tufts = new InstancedMesh(
    new ConeGeometry(0.16, 0.9, 5),
    mat(0xffffff),
    PATCH_COUNT * TUFTS_PER_PATCH,
  );
  /** 0 = flattened, 1 = standing; animated towards `target`. */
  const rise = new Float32Array(PATCH_COUNT);
  const target = new Float32Array(PATCH_COUNT);
  const pose = (index: number): void => {
    const [px, pz] = PATCHES[index] ?? [0, 0];
    const t = rise[index] ?? 0;
    setInstance(beds, index, { x: px, y: 0.1, z: pz }, t > 0.5 ? C.soil : C.straw);
    for (let k = 0; k < TUFTS_PER_PATCH; k++) {
      const x = px - 1.1 + (k % 3) * 1.1;
      const z = pz - 0.55 + Math.floor(k / 3) * 1.1;
      const color = t > 0.5 ? C.sprout : C.straw;
      const lean = (1 - t) * 1.35;
      setInstance(tufts, index * TUFTS_PER_PATCH + k, { x, y: 0.2 + t * 0.3, z, rz: lean }, color);
    }
  };
  for (let i = 0; i < PATCH_COUNT; i++) pose(i);
  for (const m of [beds, tufts]) {
    commitInstances(m);
    group.add(shade(m));
  }
  return {
    group,
    restorePatch(index, instant) {
      if (index < 0 || index >= PATCH_COUNT) return;
      target[index] = 1;
      if (instant) {
        rise[index] = 1;
        pose(index);
        commitInstances(beds);
        commitInstances(tufts);
      }
    },
    update(dt) {
      let changed = false;
      for (let i = 0; i < PATCH_COUNT; i++) {
        const goal = target[i] ?? 0;
        const now = rise[i] ?? 0;
        if (now === goal) continue;
        rise[i] = Math.min(goal, now + dt * 1.6);
        pose(i);
        changed = true;
      }
      if (changed) {
        commitInstances(beds);
        commitInstances(tufts);
      }
    },
  };
}
