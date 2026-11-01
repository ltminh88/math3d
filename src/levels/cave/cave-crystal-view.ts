// What changes in the cave while playing: one crystal per chamber (instanced, dim until its riddle
// is solved, then bright and slowly turning) and the treasure chest, whose lid opens and glows for
// the celebration. Crystals are unlit (their colour is the light); three draw calls in all.
import {
  BoxGeometry,
  Color,
  DynamicDrawUsage,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  OctahedronGeometry,
  Quaternion,
  type Scene,
  Vector3,
} from 'three';
import {
  CAVE_COLORS,
  CHAMBER_COUNT,
  CRYSTAL_Y,
  chamberCenter,
  TREASURE_INDEX,
} from './cave-layout';

const UP = new Vector3(0, 1, 0);
/** Seconds the chest lid takes to open. */
const LID_SECONDS = 0.8;

export class CaveCrystalView {
  private readonly crystals: InstancedMesh;
  private readonly chest = new Group();
  private readonly lid: Mesh;
  private readonly lidMaterial: MeshStandardMaterial;
  private readonly lit: boolean[] = Array(CHAMBER_COUNT).fill(false);
  private open = 0;
  private opening = false;
  private readonly m = new Matrix4();
  private readonly q = new Quaternion();
  private readonly p = new Vector3();
  private readonly s = new Vector3();

  constructor(
    scene: Scene,
    private readonly reducedMotion: boolean,
  ) {
    this.crystals = new InstancedMesh(
      new OctahedronGeometry(0.5),
      new MeshBasicMaterial(),
      CHAMBER_COUNT,
    );
    this.crystals.instanceMatrix.setUsage(DynamicDrawUsage);
    this.crystals.frustumCulled = false;
    for (let i = 0; i < CHAMBER_COUNT; i++) {
      this.crystals.setColorAt(i, new Color(CAVE_COLORS.crystalDim));
    }
    const { x, z } = chamberCenter(TREASURE_INDEX);
    const body = new Mesh(
      new BoxGeometry(1.6, 0.9, 1),
      new MeshStandardMaterial({ color: CAVE_COLORS.chest, flatShading: true }),
    );
    body.position.y = 0.45;
    this.lidMaterial = new MeshStandardMaterial({
      color: CAVE_COLORS.chestBand,
      emissive: 0xffb400,
      emissiveIntensity: 0.1,
      flatShading: true,
    });
    this.lid = new Mesh(new BoxGeometry(1.7, 0.35, 1.05), this.lidMaterial);
    this.lid.geometry.translate(0, 0.17, 0.52);
    this.lid.position.set(0, 0.9, -0.52);
    this.chest.position.set(x, 0, z);
    this.chest.add(body, this.lid);
    scene.add(this.crystals, this.chest);
    this.write(0);
  }

  /** Crystals already lit (the e2e hook reads it). */
  get litCrystals(): number {
    return this.lit.filter(Boolean).length;
  }

  /** Chamber `i`'s riddle is solved: its crystal lights up. */
  light(i: number): void {
    if (i < 0 || i >= CHAMBER_COUNT || this.lit[i]) return;
    this.lit[i] = true;
    this.crystals.setColorAt(i, new Color(CAVE_COLORS.crystalLit));
    if (this.crystals.instanceColor) this.crystals.instanceColor.needsUpdate = true;
  }

  /** The chest opens and glows. */
  celebrate(): void {
    this.opening = true;
    this.lidMaterial.emissiveIntensity = 1.4;
    if (this.reducedMotion) this.open = 1;
    this.lid.rotation.x = -1.1 * this.open;
  }

  update(dt: number, time: number): void {
    if (this.opening && this.open < 1) {
      this.open = Math.min(1, this.open + dt / LID_SECONDS);
      this.lid.rotation.x = -1.1 * this.open;
    }
    if (!this.reducedMotion) this.write(time);
  }

  private write(time: number): void {
    for (let i = 0; i < CHAMBER_COUNT; i++) {
      const { x, z } = chamberCenter(i);
      const on = this.lit[i] === true;
      const bob = on ? 0.12 * Math.sin(time * 1.8 + i) : 0;
      this.p.set(x, CRYSTAL_Y + bob, z);
      this.q.setFromAxisAngle(UP, on ? time * 0.9 + i : i * 0.7);
      this.s.set(1, on ? 1.7 : 1.4, 1);
      this.m.compose(this.p, this.q, this.s);
      this.crystals.setMatrixAt(i, this.m);
    }
    this.crystals.instanceMatrix.needsUpdate = true;
  }
}
