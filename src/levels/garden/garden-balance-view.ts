// The watering-can balance of a find-the-unknown round, in three meshes: the stand, the beam
// (it tips while the hidden can is unknown) and the two pans with their cans (one instanced
// mesh, kept level under the beam ends). It levels out once the child finds the number.
import {
  BoxGeometry,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  Scene,
  Vector3,
} from 'three';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { addBox, addCylinder } from '../../world/world-primitives';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';

const PIVOT_Y = 2.6;
const ARM = 2.3;
const HANG = 1.2;
const TIPPED = 0.22;
/** Radians per second while the beam swings to its new angle. */
const SWING_RATE = 1.2;

/** Builds with the recovered primitives and bakes to one vertex-coloured geometry. */
function scratch(build: (ctx: WorldBuildContext, root: Group) => void) {
  const scene = new Scene();
  const root = new Group();
  scene.add(root);
  const ctx: WorldBuildContext = {
    scene,
    materials: new Map(),
    obstacles: [],
    floaters: [],
    ripples: [],
    windmill: new Group(),
  };
  build(ctx, root);
  return bakeVertexColoredGeometry(scene);
}

export class GardenBalanceView {
  readonly group = new Group();
  private readonly beam: Mesh;
  private readonly pans: InstancedMesh;
  private angle = TIPPED;
  private target = TIPPED;
  private readonly m = new Matrix4();
  private readonly q = new Quaternion();
  private readonly p = new Vector3();
  private readonly one = new Vector3(1, 1, 1);

  constructor(private readonly reducedMotion: boolean) {
    const material = new MeshStandardMaterial({
      vertexColors: true,
      roughness: WORLD_LIGHTING.roughness.primitive,
      flatShading: true,
    });
    const stand = new Mesh(
      scratch((ctx, root) => {
        addCylinder(ctx, root, 0, 0.12, 0, 0.9, 1, 0.24, 0x8b7049, 12);
        addCylinder(ctx, root, 0, PIVOT_Y / 2, 0, 0.12, 0.16, PIVOT_Y, 0x9f7248, 8);
        addCylinder(ctx, root, 0, PIVOT_Y, 0, 0.22, 0.22, 0.2, 0xffd26a, 10);
      }),
      material,
    );
    this.beam = new Mesh(
      new BoxGeometry(ARM * 2 + 0.3, 0.16, 0.22),
      new MeshStandardMaterial({ color: 0x8b7049, roughness: 0.8, flatShading: true }),
    );
    this.beam.position.y = PIVOT_Y;
    const pan = scratch((ctx, root) => {
      addCylinder(ctx, root, 0, 0, 0, 0.75, 0.6, 0.12, 0xe8c97b, 12);
      addBox(ctx, root, 0, HANG / 2, 0, 0.05, HANG, 0.05, 0x6f5a3c);
      addCylinder(ctx, root, 0, 0.38, 0, 0.3, 0.34, 0.6, 0x5a9ec9, 10);
      addCylinder(ctx, root, 0.42, 0.5, 0, 0.05, 0.08, 0.5, 0x5a9ec9, 6).rotation.z = -0.9;
    });
    this.pans = new InstancedMesh(pan, material, 2);
    this.pans.instanceMatrix.setUsage(DynamicDrawUsage);
    this.pans.frustumCulled = false;
    for (const mesh of [stand, this.beam, this.pans]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    this.group.add(stand, this.beam, this.pans);
    this.group.position.set(0, 0, 0.6);
    this.write();
  }

  /** A new equation: the hidden can is still unknown, so the beam tips. */
  tip(): void {
    this.target = TIPPED;
    this.angle = TIPPED;
    this.write();
  }

  /** The number is found: the beam swings level. */
  level(): void {
    this.target = 0;
    if (this.reducedMotion) this.angle = 0;
    this.write();
  }

  get isLevel(): boolean {
    return this.target === 0;
  }

  update(dt: number): void {
    if (!this.group.visible || this.angle === this.target) return;
    const step = dt * SWING_RATE;
    this.angle =
      this.angle > this.target
        ? Math.max(this.target, this.angle - step)
        : Math.min(this.target, this.angle + step);
    this.write();
  }

  private write(): void {
    this.beam.rotation.z = this.angle;
    for (const [i, side] of [-1, 1].entries()) {
      // Beam end, then the pan hangs straight down from it.
      const x = side * ARM * Math.cos(this.angle);
      const y = PIVOT_Y + side * ARM * Math.sin(this.angle) - HANG;
      this.m.compose(this.p.set(x, y, 0), this.q.identity(), this.one);
      this.pans.setMatrixAt(i, this.m);
    }
    this.pans.instanceMatrix.needsUpdate = true;
  }
}
