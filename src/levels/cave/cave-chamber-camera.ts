// Camera that walks the cave chamber by chamber: it looks at the current chamber's crystal and
// moves to the next one after each riddle (eased; instant with reduced motion), then to the
// treasure chest for the celebration. The answer panel covers the right side (wide) or the bottom
// (narrow), so the view is shifted into the free area and pulled back until the chamber fits.
import { PerspectiveCamera, Vector3 } from 'three';
import { chamberCenter, TREASURE_INDEX } from './cave-layout';

const FOV = 45;
const DIRECTION = new Vector3(0.12, 0.42, 1).normalize();
const MIN_DISTANCE = 7;
/** World half-extents to keep on screen: the chamber, its pedestal and the arch beside it. */
const HALF_WIDTH = 3.6;
const HALF_HEIGHT = 2.4;
const LOOK_Y = 1.1;
/** Per-second approach rate of the eased walk. */
const WALK_RATE = 2.2;

export interface FreeArea {
  width: number;
  height: number;
  coverRight: number;
  coverBottom: number;
}

export class CaveChamberCamera {
  readonly camera = new PerspectiveCamera(FOV, 1, 0.3, 80);
  private area: FreeArea = { width: 1, height: 1, coverRight: 0, coverBottom: 0 };
  private readonly at = new Vector3(0, LOOK_Y, 0);
  private readonly goal = new Vector3(0, LOOK_Y, 0);
  /** Chamber the camera is at (or walking to); TREASURE_INDEX = the chest. */
  chamber = 0;

  constructor(private readonly reducedMotion: boolean) {}

  /** Walks to chamber `i` (0-6), or to the treasure chest for `TREASURE_INDEX`. */
  goTo(i: number): void {
    this.chamber = Math.min(Math.max(0, i), TREASURE_INDEX);
    const { x, z } = chamberCenter(this.chamber);
    this.goal.set(x, LOOK_Y, z);
    if (this.reducedMotion) this.at.copy(this.goal);
    this.apply();
  }

  setArea(area: FreeArea): void {
    this.area = area;
    this.apply();
  }

  update(dt: number): void {
    if (this.at.equals(this.goal)) return;
    if (this.at.distanceTo(this.goal) < 0.01) this.at.copy(this.goal);
    else this.at.lerp(this.goal, Math.min(1, dt * WALK_RATE));
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
    const fitHeight = HALF_HEIGHT / (tanHalf * (freeH / h));
    const distance = Math.max(MIN_DISTANCE, fitWidth, fitHeight);
    camera.position.copy(this.at).addScaledVector(DIRECTION, distance);
    camera.lookAt(this.at);
    camera.setViewOffset(w, h, (w - freeW) / 2, (h - freeH) / 2, w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
}
