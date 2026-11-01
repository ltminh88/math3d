// The seed bags of an expression round: one bag per step (instanced), each with a sprout
// (instanced) that pushes up when the child finishes that step of the calculation.
import {
  BoxGeometry,
  Color,
  ConeGeometry,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
} from 'three';

const MAX_BAGS = 4;
const BAG_GAP = 1.5;
const BAG_COLORS = [0xd9b57a, 0xc99b62, 0xe2c38c, 0xbf9a6a] as const;
const GROW_RATE = 2.2;

export class GardenSeedBagView {
  readonly group = new Group();
  private readonly bags: InstancedMesh;
  private readonly sprouts: InstancedMesh;
  private count = 0;
  private readonly size: number[] = Array(MAX_BAGS).fill(0);
  private readonly target: number[] = Array(MAX_BAGS).fill(0);
  private readonly m = new Matrix4();
  private readonly q = new Quaternion();
  private readonly p = new Vector3();
  private readonly s = new Vector3();

  constructor(private readonly reducedMotion: boolean) {
    this.bags = new InstancedMesh(
      new BoxGeometry(0.9, 1.1, 0.55),
      new MeshStandardMaterial({ roughness: 0.9, flatShading: true }),
      MAX_BAGS,
    );
    this.sprouts = new InstancedMesh(
      new ConeGeometry(0.3, 1, 6),
      new MeshStandardMaterial({ color: 0x5aab59, roughness: 0.7, flatShading: true }),
      MAX_BAGS,
    );
    this.sprouts.instanceMatrix.setUsage(DynamicDrawUsage);
    for (let i = 0; i < MAX_BAGS; i++) this.bags.setColorAt(i, new Color(BAG_COLORS[i]));
    for (const mesh of [this.bags, this.sprouts]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    this.group.add(this.bags, this.sprouts);
    this.show(3);
  }

  /** New bags, one per step of the round, all still closed. */
  show(steps: number): void {
    this.count = Math.max(1, Math.min(MAX_BAGS, steps));
    this.bags.count = this.count;
    this.sprouts.count = this.count;
    this.size.fill(0);
    this.target.fill(0);
    for (let i = 0; i < this.count; i++) {
      this.m.compose(this.p.set(this.x(i), 0.6, 1.2), this.q.identity(), this.s.set(1, 1, 1));
      this.bags.setMatrixAt(i, this.m);
    }
    this.bags.instanceMatrix.needsUpdate = true;
    this.writeSprouts();
  }

  /** Step `index` is done: its bag's sprout grows. */
  sprout(index: number): void {
    if (index < 0 || index >= this.count) return;
    this.target[index] = 1;
    if (this.reducedMotion) this.size[index] = 1;
    this.writeSprouts();
  }

  get sprouted(): number {
    return this.target.slice(0, this.count).filter((t) => t === 1).length;
  }

  update(dt: number): void {
    if (!this.group.visible) return;
    let changed = false;
    for (let i = 0; i < this.count; i++) {
      const goal = this.target[i] as number;
      const now = this.size[i] as number;
      if (now === goal) continue;
      this.size[i] = Math.min(goal, now + dt * GROW_RATE);
      changed = true;
    }
    if (changed) this.writeSprouts();
  }

  private x(i: number): number {
    return (i - (this.count - 1) / 2) * BAG_GAP;
  }

  private writeSprouts(): void {
    for (let i = 0; i < this.count; i++) {
      const k = Math.max(0.0001, this.size[i] as number);
      this.m.compose(
        this.p.set(this.x(i), 1.15 + 0.5 * k, 1.2),
        this.q.identity(),
        this.s.set(k, k, k),
      );
      this.sprouts.setMatrixAt(i, this.m);
    }
    this.sprouts.instanceMatrix.needsUpdate = true;
  }
}
