// Near top-down camera over the stone board, so corners and points read clearly on phones. VLM's
// line and the answer panel cover part of the canvas (right side when wide, bottom when narrow):
// the view is shifted into the free area and pulled back until the round's figure fits there.
// The ⟲/⟳ buttons (R key) turn the view around the board in 45° steps (eased; instant with
// reduced motion).
import { PerspectiveCamera, Vector3 } from 'three';

const FOV = 40;
/** Elevation of the view: steep, so angles keep their look. */
const UP = 2.4;
const MIN_DISTANCE = 9;
const TURN_STEP = Math.PI / 4;
const TURN_RATE = 6;

export interface FreeArea {
  width: number;
  height: number;
  coverTop: number;
  coverRight: number;
  coverBottom: number;
}

export class ValleyCamera {
  readonly camera = new PerspectiveCamera(FOV, 1, 0.5, 120);
  private area: FreeArea = { width: 1, height: 1, coverTop: 0, coverRight: 0, coverBottom: 0 };
  private half = { w: 5, d: 3.5 };
  private turn = 0;
  private turnGoal = 0;
  private readonly target = new Vector3(0, 0.3, 0);

  constructor(private readonly reducedMotion: boolean) {}

  /** View turn in whole steps (test hook / announcements). */
  get steps(): number {
    return Math.round(this.turnGoal / TURN_STEP);
  }

  frame(halfWidth: number, halfDepth: number): void {
    this.half = { w: halfWidth, d: halfDepth };
    this.apply();
  }

  setArea(area: FreeArea): void {
    this.area = area;
    this.apply();
  }

  /** Turns the view one step (+1 clockwise seen from above, -1 the other way). */
  rotate(direction: 1 | -1): void {
    this.turnGoal += direction * TURN_STEP;
    if (this.reducedMotion) this.turn = this.turnGoal;
    this.apply();
  }

  update(dt: number): void {
    if (this.turn === this.turnGoal) return;
    const step = (this.turnGoal - this.turn) * Math.min(1, dt * TURN_RATE);
    this.turn = Math.abs(this.turnGoal - this.turn) < 1e-3 ? this.turnGoal : this.turn + step;
    this.apply();
  }

  private apply(): void {
    const { width, height, coverTop, coverRight, coverBottom } = this.area;
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    const freeW = Math.max(w * 0.35, w - coverRight);
    const freeH = Math.max(h * 0.25, h - coverBottom - coverTop);
    // Extents of the board figure as turned on screen.
    const [c, s] = [Math.abs(Math.cos(this.turn)), Math.abs(Math.sin(this.turn))];
    const halfX = c * this.half.w + s * this.half.d;
    const halfY = (s * this.half.w + c * this.half.d) * 0.95 + 0.5;
    const camera = this.camera;
    camera.aspect = w / h;
    const tanHalf = Math.tan((FOV * Math.PI) / 360);
    const fitWidth = halfX / (tanHalf * camera.aspect * (freeW / w));
    const fitHeight = halfY / (tanHalf * (freeH / h));
    const distance = Math.max(MIN_DISTANCE, fitWidth, fitHeight) + 1.5;
    const direction = new Vector3(Math.sin(this.turn), UP, Math.cos(this.turn)).normalize();
    camera.position.copy(this.target).addScaledVector(direction, distance);
    camera.lookAt(this.target);
    const top = Math.min(coverTop, h - freeH);
    camera.setViewOffset(w, h, (w - freeW) / 2, h / 2 - (top + freeH / 2), w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
}
