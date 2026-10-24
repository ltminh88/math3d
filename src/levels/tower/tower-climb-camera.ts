// Camera that climbs the tower: it looks at the current floor and rises one floor per finished
// floor (eased; instant with reduced motion), then shows the roof and beacon for the
// celebration. The answer panel covers the right side (wide) or the bottom (narrow), so the view
// is shifted into the free area and pulled back until the tower fits there.
import { PerspectiveCamera, Vector3 } from 'three';
import { BEACON_Y, FLOOR_COUNT, floorMid } from './tower-layout';

const FOV = 45;
const DIRECTION = new Vector3(0, 0.22, 1).normalize();
const MIN_DISTANCE = 11;
/** World half-extents to keep on screen: tower and stones across, about two floors up and down. */
const HALF_WIDTH = 4.6;
const HALF_HEIGHT = 3.4;
const TOP_HALF_HEIGHT = 4.2;
/** Per-second approach rate of the eased climb. */
const CLIMB_RATE = 2.4;

export interface FreeArea {
  width: number;
  height: number;
  coverRight: number;
  coverBottom: number;
}

export class TowerClimbCamera {
  readonly camera = new PerspectiveCamera(FOV, 1, 0.5, 150);
  private area: FreeArea = { width: 1, height: 1, coverRight: 0, coverBottom: 0 };
  private y = floorMid(0);
  private targetY = floorMid(0);
  private halfHeight = HALF_HEIGHT;
  private readonly target = new Vector3();
  /** Floor the camera is at (or climbing to); FLOOR_COUNT = the top. */
  floor = 0;

  constructor(private readonly reducedMotion: boolean) {}

  /** Climbs to `floor` (0-6), or to the roof and beacon for `FLOOR_COUNT`. */
  climbTo(floor: number): void {
    this.floor = Math.min(floor, FLOOR_COUNT);
    const top = this.floor >= FLOOR_COUNT;
    this.targetY = top ? BEACON_Y - 1.4 : floorMid(this.floor);
    this.halfHeight = top ? TOP_HALF_HEIGHT : HALF_HEIGHT;
    if (this.reducedMotion) this.y = this.targetY;
    this.apply();
  }

  setArea(area: FreeArea): void {
    this.area = area;
    this.apply();
  }

  update(dt: number): void {
    if (this.y === this.targetY) return;
    const step = (this.targetY - this.y) * Math.min(1, dt * CLIMB_RATE);
    this.y = Math.abs(this.targetY - this.y) < 0.01 ? this.targetY : this.y + step;
    this.apply();
  }

  private apply(): void {
    const { width, height, coverRight, coverBottom } = this.area;
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    const freeW = Math.max(w * 0.35, w - coverRight);
    const freeH = Math.max(h * 0.35, h - coverBottom);
    const camera = this.camera;
    camera.aspect = w / h;
    const tanHalf = Math.tan((FOV * Math.PI) / 360);
    const fitWidth = HALF_WIDTH / (tanHalf * camera.aspect * (freeW / w));
    const fitHeight = this.halfHeight / (tanHalf * (freeH / h));
    const distance = Math.max(MIN_DISTANCE, fitWidth, fitHeight);
    const target = this.target.set(0, this.y, 0);
    camera.position.copy(target).addScaledVector(DIRECTION, distance);
    camera.lookAt(target);
    camera.setViewOffset(w, h, (w - freeW) / 2, (h - freeH) / 2, w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
}
