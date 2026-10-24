// What changes on the tower while climbing: one light band per floor (instanced, dim until the
// floor is solved), the fallen number stones (instanced; each flies back up beside its floor)
// and the beacon on the roof, which lights up for the celebration.
import {
  Color,
  CylinderGeometry,
  DynamicDrawUsage,
  IcosahedronGeometry,
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
  BEACON_Y,
  FLOOR_COUNT,
  floorMid,
  floorRadius,
  STONE_COLORS,
  TOWER_COLORS,
} from './tower-layout';

/** Seconds a stone takes to fly from the ground back to its floor. */
const RISE_SECONDS = 0.9;
const UP = new Vector3(0, 1, 0);

const fallenSpot = (i: number) => new Vector3(-3.9 + i * 1.3, 0.32, 4.4 + (i % 2) * 0.7);
/** Placed stones float in front of their floor, alternating left and right of the door. */
function placedSpot(i: number): Vector3 {
  const angle = Math.PI / 2 + (i % 2 === 0 ? -1 : 1) * (0.95 + (i % 3) * 0.2);
  const r = floorRadius(i) + 1.35;
  return new Vector3(Math.cos(angle) * r, floorMid(i), Math.sin(angle) * r);
}

export class TowerFloorView {
  private readonly bands: InstancedMesh;
  private readonly stones: InstancedMesh;
  private readonly beacon: Mesh;
  private readonly beaconMaterial: MeshStandardMaterial;
  /** 0 = on the ground, 1 = back beside its floor. */
  private readonly rise: number[] = Array(FLOOR_COUNT).fill(0);
  private readonly target: number[] = Array(FLOOR_COUNT).fill(0);
  private celebrating = false;
  private readonly m = new Matrix4();
  private readonly q = new Quaternion();
  private readonly p = new Vector3();
  private readonly s = new Vector3();

  constructor(
    scene: Scene,
    private readonly reducedMotion: boolean,
  ) {
    this.bands = new InstancedMesh(
      new CylinderGeometry(1, 1, 0.46, 10, 1, true),
      new MeshBasicMaterial(),
      FLOOR_COUNT,
    );
    this.stones = new InstancedMesh(
      new OctahedronGeometry(0.42),
      new MeshStandardMaterial({ roughness: 0.4, flatShading: true }),
      FLOOR_COUNT,
    );
    this.stones.instanceMatrix.setUsage(DynamicDrawUsage);
    this.stones.castShadow = true;
    this.stones.frustumCulled = false;
    for (let i = 0; i < FLOOR_COUNT; i++) {
      const r = floorRadius(i) + 0.12;
      this.m.compose(this.p.set(0, floorMid(i), 0), this.q.identity(), this.s.set(r, 1, r));
      this.bands.setMatrixAt(i, this.m);
      this.bands.setColorAt(i, new Color(TOWER_COLORS.bandDim));
      this.stones.setColorAt(i, new Color(STONE_COLORS[i % STONE_COLORS.length]));
    }
    this.beaconMaterial = new MeshStandardMaterial({
      color: TOWER_COLORS.beacon,
      emissive: 0xffb400,
      emissiveIntensity: 0.15,
      flatShading: true,
    });
    this.beacon = new Mesh(new IcosahedronGeometry(0.6, 1), this.beaconMaterial);
    this.beacon.position.set(0, BEACON_Y, 0);
    scene.add(this.bands, this.stones, this.beacon);
    this.writeStones(0);
  }

  /** Floors already lit (the e2e hook reads it). */
  get litFloors(): number {
    return this.target.filter((t) => t === 1).length;
  }

  /** Floor `floor` is solved: its band lights and its stone flies back up. */
  light(floor: number): void {
    if (floor < 0 || floor >= FLOOR_COUNT) return;
    this.bands.setColorAt(floor, new Color(TOWER_COLORS.bandLit));
    if (this.bands.instanceColor) this.bands.instanceColor.needsUpdate = true;
    this.target[floor] = 1;
    if (this.reducedMotion) this.rise[floor] = 1;
  }

  celebrate(): void {
    this.celebrating = true;
    this.beaconMaterial.emissiveIntensity = 1.6;
  }

  update(dt: number, time: number): void {
    for (let i = 0; i < FLOOR_COUNT; i++) {
      const goal = this.target[i] as number;
      this.rise[i] = Math.min(goal, (this.rise[i] as number) + dt / RISE_SECONDS);
    }
    this.writeStones(this.reducedMotion ? 0 : time);
    if (this.celebrating && !this.reducedMotion) {
      this.beacon.scale.setScalar(1 + 0.12 * Math.sin(time * 4));
    }
  }

  private writeStones(time: number): void {
    for (let i = 0; i < FLOOR_COUNT; i++) {
      const t = this.rise[i] as number;
      const ease = t * t * (3 - 2 * t);
      this.p.lerpVectors(fallenSpot(i), placedSpot(i), ease);
      // An arc on the way up, a gentle bob once placed.
      this.p.y += Math.sin(Math.PI * ease) * 1.2 + (t === 1 ? 0.12 * Math.sin(time * 1.6 + i) : 0);
      this.q.setFromAxisAngle(UP, time * 0.8 + i);
      const lying = 1 - ease;
      this.s.set(1, 1.5 - 0.7 * lying, 1);
      this.m.compose(this.p, this.q, this.s);
      this.stones.setMatrixAt(i, this.m);
    }
    this.stones.instanceMatrix.needsUpdate = true;
  }
}
