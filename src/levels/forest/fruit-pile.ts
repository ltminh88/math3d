// The fruit (one instanced mesh, the orange fruit colour of the recovered trees), invisible
// finger-sized hit proxies for picking, the basket row and the gold focus ring.
import {
  Color,
  CylinderGeometry,
  type Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SphereGeometry,
  TorusGeometry,
} from 'three';
import type { GroundPoint } from '../../core/input/interaction-types';
import type { Pickable } from '../../core/input/raycast-picker';
import { groupCenter, type Point3 } from './forest-layout';
import { CONCRETE_MAX_FRUIT } from './forest-round-flow';

const FRUIT_COLOR = new Color(0xf3a444);
const SELECTED_COLOR = new Color(0xffe27a);
const MAX_BASKETS = 10;
const FOLLOW_RATE = 14;
const matrix = new Matrix4();

export const fruitId = (index: number): string => `fruit:${index}`;
export const fruitIndexOf = (id: string): number => Number(id.slice('fruit:'.length));

export class ForestProps {
  private readonly fruit: InstancedMesh;
  private readonly baskets: InstancedMesh;
  private readonly ring: Mesh;
  private readonly proxies: Mesh[] = [];
  private current: Point3[] = [];
  private targets: Point3[] = [];
  private selected: number | null = null;

  constructor(
    root: Group,
    private readonly reducedMotion: boolean,
  ) {
    this.fruit = new InstancedMesh(
      new IcosahedronGeometry(0.16, 1),
      new MeshStandardMaterial({ color: 0xffffff, roughness: 0.7, metalness: 0 }),
      CONCRETE_MAX_FRUIT,
    );
    this.fruit.castShadow = true;
    for (let i = 0; i < CONCRETE_MAX_FRUIT; i++) this.fruit.setColorAt(i, FRUIT_COLOR);
    this.fruit.count = 0;
    this.fruit.visible = false;
    this.fruit.frustumCulled = false;
    this.baskets = new InstancedMesh(
      new CylinderGeometry(0.46, 0.34, 0.34, 9),
      new MeshStandardMaterial({ color: 0xb07a45, roughness: 0.9, metalness: 0 }),
      MAX_BASKETS,
    );
    this.baskets.castShadow = true;
    this.baskets.receiveShadow = true;
    this.baskets.count = 0;
    this.baskets.visible = false;
    this.baskets.frustumCulled = false;
    this.ring = new Mesh(
      new TorusGeometry(0.42, 0.05, 6, 24),
      new MeshBasicMaterial({ color: 0xf1c35f }),
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.visible = false;
    const proxyGeometry = new SphereGeometry(0.3, 8, 6);
    const proxyMaterial = new MeshBasicMaterial();
    for (let i = 0; i < CONCRETE_MAX_FRUIT; i++) {
      const proxy = new Mesh(proxyGeometry, proxyMaterial);
      proxy.visible = false;
      this.proxies.push(proxy);
    }
    root.add(this.fruit, this.baskets, this.ring, ...this.proxies);
  }

  /** New rest positions; `snap` places the fruit there at once (new round). */
  setFruit(positions: readonly Point3[], snap: boolean): void {
    this.targets = positions.map((p) => ({ ...p }));
    if (snap || this.current.length !== positions.length || this.reducedMotion) {
      this.current = positions.map((p) => ({ ...p }));
    }
    this.fruit.count = positions.length;
    this.fruit.visible = positions.length > 0;
    this.writeFruit();
  }

  /** The dragged fruit follows the pointer, lifted above the table. */
  dragTo(index: number, point: GroundPoint): void {
    const target = this.targets[index];
    if (target) Object.assign(target, { x: point.x, y: 0.75, z: point.z });
  }

  setSelected(index: number | null): void {
    this.selected = index;
    this.writeFruit();
  }

  /** Gold ring under a focused fruit or zone (null hides it). */
  focus(point: GroundPoint | null, size = 1): void {
    this.ring.visible = point !== null;
    if (point) this.ring.position.set(point.x, 0.12, point.z);
    this.ring.scale.setScalar(size);
  }

  /** Visible baskets when packing (0 otherwise). */
  setBaskets(visible: number, groups: number): void {
    this.baskets.count = Math.min(visible, MAX_BASKETS);
    this.baskets.visible = this.baskets.count > 0;
    for (let i = 0; i < this.baskets.count; i++) {
      const c = groupCenter('pack', i, groups);
      matrix.makeTranslation(c.x, 0.17, c.z);
      this.baskets.setMatrixAt(i, matrix);
    }
    this.baskets.instanceMatrix.needsUpdate = true;
  }

  pickables(): Pickable[] {
    return this.proxies.slice(0, this.fruit.count).map((object, i) => ({ id: fruitId(i), object }));
  }

  position(index: number): Point3 | undefined {
    return this.current[index];
  }

  update(dt: number): void {
    const k = this.reducedMotion ? 1 : 1 - Math.exp(-FOLLOW_RATE * dt);
    let moved = false;
    this.current.forEach((p, i) => {
      const t = this.targets[i];
      if (!t) return;
      const d = Math.abs(t.x - p.x) + Math.abs(t.y - p.y) + Math.abs(t.z - p.z);
      if (d < 1e-4) return;
      p.x += (t.x - p.x) * k;
      p.y += (t.y - p.y) * k;
      p.z += (t.z - p.z) * k;
      moved = true;
    });
    if (moved) this.writeFruit();
  }

  private writeFruit(): void {
    this.current.forEach((p, i) => {
      matrix.makeTranslation(p.x, p.y, p.z);
      this.fruit.setMatrixAt(i, matrix);
      this.fruit.setColorAt(i, i === this.selected ? SELECTED_COLOR : FRUIT_COLOR);
      this.proxies[i]?.position.set(p.x, p.y, p.z);
    });
    this.fruit.instanceMatrix.needsUpdate = true;
    if (this.fruit.instanceColor) this.fruit.instanceColor.needsUpdate = true;
  }
}
