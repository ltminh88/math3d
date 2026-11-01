// The live tools on the workbench: instanced ruler ticks (one draw call), instanced tiles on the
// tile board that follow the child's taps, the jug's water and the thermometer's red column at the
// round's values, and a glowing ring under the tool of the current order.
import {
  BoxGeometry,
  Color,
  CylinderGeometry,
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  RingGeometry,
  type Scene,
} from 'three';
import type { GeoScene, Point } from '../../geometry/geo-scene-types';
import { BENCH_TOP, WORKSHOP_COLORS as C, STATION_SPOTS, TILE_BOARD } from './workshop-layout';
import type { WorkshopStation } from './workshop-stations';

const TICKS = 101;
const TILES = TILE_BOARD.cols * TILE_BOARD.rows;
const RULER_LENGTH = 5;
const [JX, JZ] = STATION_SPOTS.jug;
const JUG_HEIGHT = 1.3;
const [HX] = STATION_SPOTS.thermometer;
const TUBE = { bottom: 2, height: 2 };

const lit = (color: number) =>
  new MeshStandardMaterial({ color, roughness: 0.7, flatShading: true });

export class WorkshopBenchProps {
  readonly tiles: InstancedMesh;
  private readonly marker: Mesh;
  private readonly water: Mesh;
  private readonly mercury: Mesh;
  private readonly m = new Matrix4();
  private target: readonly [number, number] = STATION_SPOTS.ruler;

  constructor(
    scene: Scene,
    private readonly reducedMotion: boolean,
  ) {
    const ticks = new InstancedMesh(new BoxGeometry(0.018, 0.02, 1), lit(C.ink), TICKS);
    const [rx, rz] = STATION_SPOTS.ruler;
    for (let i = 0; i < TICKS; i++) {
      const len = i % 10 === 0 ? 0.3 : i % 5 === 0 ? 0.2 : 0.12;
      this.m.makeScale(1, 1, len);
      this.m.setPosition(
        rx - RULER_LENGTH / 2 + (i * RULER_LENGTH) / (TICKS - 1),
        BENCH_TOP + 0.07,
        rz - 0.25 + len / 2,
      );
      ticks.setMatrixAt(i, this.m);
    }
    this.tiles = new InstancedMesh(new BoxGeometry(1, 0.06, 1), lit(C.tile), TILES);
    this.tiles.castShadow = true;
    this.setTiles([], { w: 1, h: 1 });
    const glass = new Mesh(
      new CylinderGeometry(0.5, 0.45, JUG_HEIGHT, 14, 1, true),
      new MeshStandardMaterial({
        color: C.glass,
        transparent: true,
        opacity: 0.35,
        depthWrite: false,
      }),
    );
    glass.position.set(JX, BENCH_TOP + JUG_HEIGHT / 2, JZ);
    glass.renderOrder = 2;
    this.water = new Mesh(new CylinderGeometry(0.44, 0.42, 1, 14), lit(C.water));
    this.mercury = new Mesh(
      new BoxGeometry(0.1, 1, 0.06),
      new MeshBasicMaterial({ color: C.mercury }),
    );
    this.marker = new Mesh(
      new RingGeometry(0.75, 0.95, 28),
      new MeshBasicMaterial({ color: new Color(C.gold), transparent: true, opacity: 0.8 }),
    );
    this.marker.rotation.x = -Math.PI / 2;
    this.setLevels(0.4, 0.5);
    scene.add(ticks, this.tiles, this.water, glass, this.mercury, this.marker);
    this.placeMarker(1);
  }

  /** Lights the tool of `station` and shows the round's jug / thermometer values. */
  setStation(station: WorkshopStation, scene: GeoScene): void {
    this.target = STATION_SPOTS[station];
    if (this.reducedMotion) this.placeMarker(1);
    if (scene.kind === 'jug') this.setLevels(scene.level / scene.marks, null);
    if (scene.kind === 'thermometers') this.setLevels(null, (scene.readings[0]?.value ?? 0) / 50);
    if (station !== 'tiles') this.setTiles([], { w: 1, h: 1 });
  }

  /** Tiles laid on the board, in a `frame.w` x `frame.h` grid scaled to fit the board. */
  setTiles(cells: readonly Point[], frame: { w: number; h: number }): void {
    const size = Math.min(TILE_BOARD.width / frame.w, TILE_BOARD.depth / frame.h);
    const [tx, tz] = STATION_SPOTS.tiles;
    for (let i = 0; i < TILES; i++) {
      const cell = cells[i];
      if (!cell) {
        this.m.makeScale(0, 0, 0);
      } else {
        this.m.makeScale(size * 0.92, 1, size * 0.92);
        this.m.setPosition(
          tx + (cell[0] - (frame.w - 1) / 2) * size,
          BENCH_TOP + 0.11,
          tz + (cell[1] - (frame.h - 1) / 2) * size,
        );
      }
      this.tiles.setMatrixAt(i, this.m);
    }
    this.tiles.instanceMatrix.needsUpdate = true;
  }

  update(dt: number, time: number): void {
    this.placeMarker(this.reducedMotion ? 1 : Math.min(1, dt * 5));
    if (!this.reducedMotion) this.marker.scale.setScalar(1 + Math.sin(time * 3) * 0.05);
  }

  private placeMarker(k: number): void {
    const [x, z] = this.target;
    const p = this.marker.position;
    const onWall = z < -3;
    p.set(p.x + (x - p.x) * k, BENCH_TOP + 0.02, p.z + ((onWall ? -1.2 : z) - p.z) * k);
  }

  private setLevels(water: number | null, heat: number | null): void {
    if (water !== null) {
      const h = Math.max(0.02, water * (JUG_HEIGHT - 0.1));
      this.water.scale.y = h;
      this.water.position.set(JX, BENCH_TOP + h / 2 + 0.02, JZ);
    }
    if (heat !== null) {
      const h = Math.max(0.05, Math.min(1, heat) * TUBE.height);
      this.mercury.scale.y = h;
      this.mercury.position.set(HX, TUBE.bottom + h / 2, -3.7);
    }
  }
}
