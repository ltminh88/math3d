import {
  AmbientLight,
  BoxGeometry,
  CircleGeometry,
  ConeGeometry,
  CylinderGeometry,
  DirectionalLight,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  SphereGeometry,
} from 'three';
import { createBlobShadows } from '../core/blob-shadow';
import type { SceneContext } from '../core/game-scene-contract';
import type { DropZone } from '../core/input/drop-zone';
import { getGeometry, getMaterial } from '../core/shared-asset-cache';

export const FIELD = { width: 30, depth: 18, height: 3 } as const;
export const STONE_COUNT = 30;
export const ZONE_COUNT = 6;
export const STONE_RADIUS = 0.45;

export interface Stone {
  id: string;
  group: Group;
  mesh: Mesh;
  proxy: Mesh;
  home: { x: number; z: number };
}

export interface BenchWorld {
  stones: Stone[];
  zones: DropZone[];
  zoneMeshes: Map<string, Mesh>;
}

// Small deterministic generator so every run places the scenery identically.
function lcg(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

/** Low-poly meadow: ground, instanced trees, stones with fat hit proxies, drop zones, blob shadows. */
export function buildBenchWorld(ctx: SceneContext, proxyRadius: number): BenchWorld {
  const { scene, disposer } = ctx;
  scene.add(disposer.track(new AmbientLight(0xffffff, 1.2)));
  const sun = disposer.track(new DirectionalLight(0xffffff, 1.6));
  sun.position.set(6, 12, 8);
  scene.add(sun);

  const ground = new Mesh(
    getGeometry('bench-ground', () => new BoxGeometry(FIELD.width, 0.5, FIELD.depth)),
    getMaterial('grass'),
  );
  ground.position.y = -0.25;
  scene.add(disposer.track(ground));

  const random = lcg(7);
  const trees = Math.round(40 * ctx.getQuality().decorDensity);
  const shadows = createBlobShadows(trees + STONE_COUNT);
  const trunk = new InstancedMesh(
    getGeometry('bench-trunk', () => new CylinderGeometry(0.15, 0.2, 1, 6).translate(0, 0.5, 0)),
    getMaterial('wood'),
    Math.max(1, trees),
  );
  const crown = new InstancedMesh(
    getGeometry('bench-crown', () => new ConeGeometry(0.8, 1.8, 6).translate(0, 1.9, 0)),
    getMaterial('leaf'),
    Math.max(1, trees),
  );
  const matrix = new Matrix4();
  for (let i = 0; i < trees; i++) {
    const x = (random() < 0.5 ? -1 : 1) * (10 + random() * 4.5);
    const z = (random() - 0.5) * (FIELD.depth - 2);
    const scale = 0.8 + random() * 0.6;
    matrix.makeScale(scale, scale, scale).setPosition(x, 0, z);
    trunk.setMatrixAt(i, matrix);
    crown.setMatrixAt(i, matrix);
    shadows.set(i, x, z, 0.9 * scale);
  }
  trunk.count = trees;
  crown.count = trees;
  scene.add(disposer.track(trunk), disposer.track(crown));

  const zones: DropZone[] = [];
  const zoneMeshes = new Map<string, Mesh>();
  for (let i = 0; i < ZONE_COUNT; i++) {
    const id = `zone-${i}`;
    const x = -7.5 + i * 3;
    const mesh = new Mesh(
      getGeometry('bench-zone', () => new CircleGeometry(1.2, 20).rotateX(-Math.PI / 2)),
      getMaterial('zone'),
    );
    mesh.position.set(x, 0.03, -3.5);
    scene.add(disposer.track(mesh));
    zoneMeshes.set(id, mesh);
    zones.push({
      id,
      center: { x, z: -3.5 },
      shape: { kind: 'circle', radius: 1.2 },
      accepts: () => true,
    });
  }

  const stones: Stone[] = [];
  for (let i = 0; i < STONE_COUNT; i++) {
    const col = i % 15;
    const row = Math.floor(i / 15);
    const home = { x: -7 + col, z: 4 + row * 1.6 };
    const group = new Group();
    const mesh = new Mesh(
      getGeometry('bench-stone', () => new IcosahedronGeometry(STONE_RADIUS, 0)),
      getMaterial('stone'),
    );
    mesh.position.y = STONE_RADIUS;
    const proxy = new Mesh(new SphereGeometry(proxyRadius, 8, 6)); // per-stone, freed by the disposer
    proxy.position.y = STONE_RADIUS;
    proxy.visible = false;
    group.add(mesh, proxy);
    group.position.set(home.x, 0, home.z);
    scene.add(disposer.track(group));
    shadows.set(trees + i, home.x, home.z, 0.55);
    stones.push({ id: `stone-${i}`, group, mesh, proxy, home });
  }
  shadows.setCount(trees + STONE_COUNT);
  scene.add(disposer.track(shadows.mesh));
  return { stones, zones, zoneMeshes };
}
