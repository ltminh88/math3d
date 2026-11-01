// The flower row of a pattern round: five pots (instanced) in front of VLM, each with a flower
// (instanced). A pot whose number is still missing stands empty; its flower grows when the child
// fills it. The numbers themselves are DOM labels in the panel (no 3D text, no textures).
import {
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three';

export const POT_COUNT = 5;
const POT_GAP = 1.6;
const POT_Z = 1.2;
const BLOOM_Y = 1.15;
const BLOOM_COLORS = [0xf08a8a, 0xffc956, 0xb59ae0, 0xf6a3c8, 0x8fc7e8] as const;
/** Bloom growth per second (0 → 1). */
const GROW_RATE = 2.5;

export const potX = (i: number): number => (i - (POT_COUNT - 1) / 2) * POT_GAP;

export class GardenPatternRowView {
  readonly group = new Group();
  private readonly blooms: InstancedMesh;
  private readonly size: number[] = Array(POT_COUNT).fill(1);
  private readonly target: number[] = Array(POT_COUNT).fill(1);
  private readonly m = new Matrix4();
  private readonly q = new Quaternion();
  private readonly p = new Vector3();
  private readonly s = new Vector3();

  constructor(private readonly reducedMotion: boolean) {
    const pots = new InstancedMesh(
      new CylinderGeometry(0.5, 0.36, 0.7, 10),
      new MeshStandardMaterial({ color: 0xc9784f, roughness: 0.8, flatShading: true }),
      POT_COUNT,
    );
    this.blooms = new InstancedMesh(
      new IcosahedronGeometry(0.42, 0),
      new MeshStandardMaterial({ roughness: 0.6, flatShading: true }),
      POT_COUNT,
    );
    this.blooms.instanceMatrix.setUsage(DynamicDrawUsage);
    for (let i = 0; i < POT_COUNT; i++) {
      this.m.compose(this.p.set(potX(i), 0.4, POT_Z), this.q.identity(), this.s.set(1, 1, 1));
      pots.setMatrixAt(i, this.m);
      this.blooms.setColorAt(i, new Color(BLOOM_COLORS[i % BLOOM_COLORS.length]));
    }
    for (const mesh of [pots, this.blooms]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    this.group.add(pots, this.blooms);
    this.writeBlooms();
  }

  /** A new row: pots at `hidden` (0-based) stand empty. */
  show(hidden: readonly number[]): void {
    for (let i = 0; i < POT_COUNT; i++) {
      const value = hidden.includes(i) ? 0 : 1;
      this.size[i] = value;
      this.target[i] = value;
    }
    this.writeBlooms();
  }

  /** The flower in pot `index` grows (the child found its number). */
  bloom(index: number): void {
    if (index < 0 || index >= POT_COUNT) return;
    this.target[index] = 1;
    if (this.reducedMotion) this.size[index] = 1;
    this.writeBlooms();
  }

  get bloomed(): number {
    return this.target.filter((t) => t === 1).length;
  }

  update(dt: number, time: number): void {
    if (!this.group.visible) return;
    for (let i = 0; i < POT_COUNT; i++) {
      const goal = this.target[i] as number;
      const now = this.size[i] as number;
      if (now !== goal) this.size[i] = Math.min(goal, now + dt * GROW_RATE);
    }
    this.writeBlooms(this.reducedMotion ? 0 : time);
  }

  private writeBlooms(time = 0): void {
    for (let i = 0; i < POT_COUNT; i++) {
      const k = Math.max(0.0001, this.size[i] as number);
      const sway = Math.sin(time * 1.6 + i) * 0.06;
      this.q.setFromAxisAngle(this.p.set(0, 0, 1), sway);
      this.m.compose(this.p.set(potX(i), BLOOM_Y * k, POT_Z), this.q, this.s.set(k, k, k));
      this.blooms.setMatrixAt(i, this.m);
    }
    this.blooms.instanceMatrix.needsUpdate = true;
  }
}
