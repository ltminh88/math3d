// The delivery props: up to three parcels on the road (one baked box with a ribbon, shared
// geometry), finger-sized hit proxies, the gold focus ring and the house drop zones. Parcels
// glide to where they are dragged or delivered (snap under reduced motion).
import {
  BoxGeometry,
  Group,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  TorusGeometry,
  Vector3,
} from 'three';
import type { DropZone } from '../../core/input/drop-zone';
import type { GroundPoint } from '../../core/input/interaction-types';
import type { Pickable } from '../../core/input/raycast-picker';
import type { CityLabel } from './city-labels';
import {
  HOUSE_X,
  HOUSE_ZONE_RADIUS,
  houseZoneCenter,
  PARCEL_Y,
  PARCEL_Z,
  parcelSlots,
  REVERSE_HOUSE,
} from './city-layout';
import { parcelGeometry } from './city-parcel-geometry';
import type { CityRound } from './city-round-flow';

const MAX_PARCELS = 3;
const GLIDE_RATE = 12;
const LIFT = 0.5;

export const parcelId = (index: number): string => `parcel:${index}`;
export const parcelIndexOf = (id: string): number => Number(id.slice('parcel:'.length));
export const houseZoneId = (index: number): string => `house:${index}`;
export const houseIndexOf = (id: string): number => Number(id.slice('house:'.length));

/** Houses that take a parcel in `round` (all four, or the one waiting in reverse delivery). */
export const roundHouses = (round: CityRound): number[] =>
  round.kind === 'reverse' ? [REVERSE_HOUSE] : HOUSE_X.map((_, i) => i);

export class CityStreetView {
  readonly group = new Group();
  private readonly parcels: Mesh[] = [];
  private readonly proxies: Mesh[] = [];
  private readonly ring: Mesh;
  private readonly targets: Vector3[] = [];
  private round: CityRound | undefined;
  private delivered = new Set<number>();
  /** Houses (delivery) or parcels (reverse) already answered wrong: out of play this round. */
  private rejected = new Set<string>();

  constructor(private readonly reducedMotion: boolean) {
    const geometry = parcelGeometry();
    const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.85 });
    const proxyGeometry = new BoxGeometry(1.4, 1.2, 1.4);
    const proxyMaterial = new MeshBasicMaterial();
    for (let i = 0; i < MAX_PARCELS; i++) {
      const parcel = new Mesh(geometry, material);
      parcel.castShadow = true;
      const proxy = new Mesh(proxyGeometry, proxyMaterial);
      proxy.visible = false;
      this.parcels.push(parcel);
      this.proxies.push(proxy);
      this.targets.push(new Vector3());
    }
    this.ring = new Mesh(
      new TorusGeometry(0.62, 0.06, 6, 28),
      new MeshBasicMaterial({ color: 0xf1c35f }),
    );
    this.ring.rotation.x = -Math.PI / 2;
    this.ring.visible = false;
    this.group.add(...this.parcels, ...this.proxies, this.ring);
  }

  /** Lays out the parcels of `round` on the road. */
  show(round: CityRound): void {
    this.round = round;
    this.delivered.clear();
    this.rejected.clear();
    const slots = parcelSlots(round.parcels.length);
    this.parcels.forEach((parcel, i) => {
      const x = slots[i];
      parcel.visible = x !== undefined;
      if (x === undefined) return;
      this.targets[i]?.set(x, PARCEL_Y, PARCEL_Z);
      parcel.position.set(x, PARCEL_Y, PARCEL_Z);
      parcel.rotation.set(0, 0, 0);
      this.proxies[i]?.position.copy(parcel.position);
    });
    this.ring.visible = false;
    this.group.visible = true;
  }

  hide(): void {
    this.group.visible = false;
  }

  pickables(): Pickable[] {
    const count = this.round?.parcels.length ?? 0;
    return this.proxies
      .slice(0, count)
      .map((object, i) => ({ id: parcelId(i), object }))
      .filter((_, i) => !this.delivered.has(i) && !this.rejected.has(parcelId(i)));
  }

  /** A wrong answer `value` takes its house (delivery) or its parcel (reverse) out of play. */
  reject(value: number): void {
    const round = this.round;
    if (!round) return;
    if (round.kind === 'reverse') {
      const parcel = round.parcels.findIndex((p) => p.value === value && !p.correct);
      if (parcel >= 0) this.rejected.add(parcelId(parcel));
    } else {
      const house = round.houses.indexOf(value);
      if (house >= 0 && value !== round.product) this.rejected.add(houseZoneId(house));
    }
  }

  zones(): DropZone[] {
    if (!this.round) return [];
    const open = roundHouses(this.round).filter((h) => !this.rejected.has(houseZoneId(h)));
    return open.map((house) => ({
      id: houseZoneId(house),
      center: houseZoneCenter(house),
      shape: { kind: 'circle', radius: HOUSE_ZONE_RADIUS },
      accepts: () => true,
    }));
  }

  /** House numbers over the doors and the parcels' expressions. */
  labels(): CityLabel[] {
    const round = this.round;
    if (!round) return [];
    const houses = roundHouses(round).map((house, i) => ({
      x: HOUSE_X[house] ?? 0,
      y: 3.9,
      z: -0.6,
      text: String(round.houses[i] ?? ''),
      kind: 'house',
      id: houseZoneId(house),
    }));
    const parcels = round.parcels.map((parcel, i) => {
      const { x, y, z } = this.targets[i] ?? new Vector3();
      return { x, y: y + 0.6, z, text: parcel.label, kind: 'parcel', id: parcelId(i) };
    });
    return [...houses, ...parcels.filter((_, i) => !this.delivered.has(i))];
  }

  focus(point: GroundPoint | null): void {
    this.ring.visible = point !== null;
    if (point) this.ring.position.set(point.x, 0.12, point.z);
  }

  setSelected(index: number | null): void {
    this.targets.forEach((target, i) => {
      if (!this.delivered.has(i)) target.y = PARCEL_Y + (i === index ? LIFT : 0);
    });
  }

  parcelAt(index: number): GroundPoint | null {
    const at = this.targets[index];
    return at ? { x: at.x, z: at.z } : null;
  }

  dragTo(index: number, point: GroundPoint): void {
    this.targets[index]?.set(point.x, PARCEL_Y + LIFT, point.z);
  }

  /** Back to its slot on the road (a miss or a wrong house). */
  returnHome(index: number): void {
    const x = parcelSlots(this.round?.parcels.length ?? 1)[index] ?? 0;
    this.targets[index]?.set(x, PARCEL_Y, PARCEL_Z);
  }

  /** The parcel goes to the door of `house` and stays there. */
  deliver(index: number, house: number): void {
    this.delivered.add(index);
    const door = houseZoneCenter(house);
    this.targets[index]?.set(door.x, PARCEL_Y, door.z - 0.4);
  }

  get animating(): boolean {
    return this.parcels.some(
      (p, i) => p.visible && p.position.distanceTo(this.targets[i] as Vector3) > 0.01,
    );
  }

  update(dt: number): void {
    const k = this.reducedMotion ? 1 : 1 - Math.exp(-GLIDE_RATE * dt);
    this.parcels.forEach((parcel, i) => {
      const target = this.targets[i];
      if (!target || !parcel.visible) return;
      parcel.position.lerp(target, k);
      this.proxies[i]?.position.copy(parcel.position);
    });
  }
}
