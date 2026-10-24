// The tall building of a windows round: a body and roof sized to floors x windows, every window
// one instance of a single InstancedMesh (dark, lit, or the two hint bands), and an invisible
// hit proxy per floor so a floor can be tapped or reached by keyboard (arrows + Enter).
import {
  BoxGeometry,
  Color,
  Group,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
} from 'three';
import type { Pickable } from '../../core/input/raycast-picker';
import type { CityLabel } from './city-labels';
import {
  BUILDING_DEPTH,
  BUILDING_Z,
  buildingHeight,
  buildingWidth,
  FACADE_Z,
  FLOOR_HEIGHT,
  floorY,
  MAX_FLOORS,
  MAX_WINDOWS_PER_FLOOR,
  windowX,
} from './city-layout';

const DARK = new Color(0x4f5d78);
const LIT = new Color(0xffe27a);
const BAND_A = new Color(0xf6b3d0);
const BAND_B = new Color(0x9ad9f0);
const FOCUS = new Color(0xdde6f5);
const matrix = new Matrix4();

export const floorId = (floor: number): string => `floor:${floor}`;
export const floorIndexOf = (id: string): number => Number(id.slice('floor:'.length));

export class CityBuildingView {
  readonly group = new Group();
  private readonly body: Mesh;
  private readonly roof: Mesh;
  private readonly windows: InstancedMesh;
  private readonly proxies: Mesh[] = [];
  private floors = 1;
  private perFloor = 1;
  private readonly lit = new Set<number>();
  private bands: { first: number; rest: number } | null = null;
  private focused: number | null = null;

  constructor() {
    this.body = new Mesh(
      new BoxGeometry(1, 1, BUILDING_DEPTH),
      new MeshStandardMaterial({ color: 0x8fb3c9, roughness: 0.9 }),
    );
    this.roof = new Mesh(
      new BoxGeometry(1, 0.5, BUILDING_DEPTH + 0.3),
      new MeshStandardMaterial({ color: 0xf0e2c0, roughness: 0.9 }),
    );
    for (const mesh of [this.body, this.roof]) {
      mesh.castShadow = true;
      mesh.receiveShadow = true;
    }
    this.windows = new InstancedMesh(
      new BoxGeometry(0.5, 0.6, 0.08),
      new MeshStandardMaterial({ color: 0xffffff, roughness: 0.6 }),
      MAX_FLOORS * MAX_WINDOWS_PER_FLOOR,
    );
    this.windows.frustumCulled = false;
    const proxyGeometry = new BoxGeometry(1, FLOOR_HEIGHT * 0.95, 0.8);
    const proxyMaterial = new MeshBasicMaterial();
    for (let i = 0; i < MAX_FLOORS; i++) {
      const proxy = new Mesh(proxyGeometry, proxyMaterial);
      proxy.visible = false;
      this.proxies.push(proxy);
    }
    this.group.add(this.body, this.roof, this.windows, ...this.proxies);
    this.group.visible = false;
  }

  /** A dark building of `floors` floors with `perFloor` windows each. */
  show(floors: number, perFloor: number): void {
    this.floors = floors;
    this.perFloor = perFloor;
    this.lit.clear();
    this.bands = null;
    this.focused = null;
    const width = buildingWidth(perFloor);
    const height = buildingHeight(floors);
    this.body.scale.set(width, height, 1);
    this.body.position.set(0, height / 2, BUILDING_Z);
    this.roof.scale.set(width + 0.3, 1, 1);
    this.roof.position.set(0, height + 0.25, BUILDING_Z);
    this.windows.count = floors * perFloor;
    for (let f = 0; f < floors; f++) {
      for (let c = 0; c < perFloor; c++) {
        matrix.makeTranslation(windowX(c, perFloor), floorY(f), FACADE_Z + 0.03);
        this.windows.setMatrixAt(f * perFloor + c, matrix);
      }
    }
    this.windows.instanceMatrix.needsUpdate = true;
    this.proxies.forEach((proxy, f) => {
      proxy.scale.x = width;
      proxy.position.set(0, floorY(f), FACADE_Z + 0.2);
    });
    this.paint();
    this.group.visible = true;
  }

  hide(): void {
    this.group.visible = false;
  }

  get height(): number {
    return buildingHeight(this.floors) + 0.5;
  }

  get width(): number {
    return buildingWidth(this.perFloor);
  }

  get litFloors(): number {
    return this.lit.size;
  }

  /** Floors still dark (pickable), bottom first. */
  darkFloors(): number[] {
    return Array.from({ length: this.floors }, (_, f) => f).filter((f) => !this.lit.has(f));
  }

  pickables(): Pickable[] {
    return this.darkFloors().map((f) => ({ id: floorId(f), object: this.proxies[f] as Mesh }));
  }

  /** Lights `floor`; false when it was already lit or does not exist. */
  light(floor: number): boolean {
    if (floor < 0 || floor >= this.floors || this.lit.has(floor)) return false;
    this.lit.add(floor);
    this.paint();
    return true;
  }

  lightAll(): void {
    for (let f = 0; f < this.floors; f++) this.lit.add(f);
    this.paint();
  }

  /** Keyboard focus on a floor: its dark windows turn pale (null clears it). */
  setFocus(floor: number | null): void {
    this.focused = floor;
    this.paint();
  }

  setBands(bands: { first: number; rest: number } | null): void {
    this.bands = bands;
    this.paint();
  }

  /** Band chips (hint 2) under the building, totals per floor (hint 3) on its right. */
  labels(steps: readonly string[], bandTexts: readonly [string, string] | null): CityLabel[] {
    const right = this.width / 2 + 0.7;
    const floors = steps.map((text, f) => ({
      x: right,
      y: floorY(f) + 0.3,
      z: FACADE_Z,
      text,
      kind: 'floor',
      id: floorId(f),
    }));
    if (!bandTexts || !this.bands) return floors;
    const edge = windowX(this.bands.first, this.perFloor) - 0.4;
    const half = this.width / 2;
    const band = (x: number, text: string, kind: string) => ({
      x,
      y: 0.15,
      z: FACADE_Z + 0.6,
      text,
      kind,
    });
    return [
      ...floors,
      band((edge - half) / 2, bandTexts[0], 'band-a'),
      band((edge + half) / 2, bandTexts[1], 'band-b'),
    ];
  }

  private paint(): void {
    for (let f = 0; f < this.floors; f++) {
      for (let c = 0; c < this.perFloor; c++) {
        const band = this.bands ? (c < this.bands.first ? BAND_A : BAND_B) : DARK;
        const dark = f === this.focused ? FOCUS : band;
        this.windows.setColorAt(f * this.perFloor + c, this.lit.has(f) ? LIT : dark);
      }
    }
    if (this.windows.instanceColor) this.windows.instanceColor.needsUpdate = true;
  }
}
