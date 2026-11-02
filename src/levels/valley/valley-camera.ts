// Camera over the stone board. While a flat figure is judged (angles, ê-ke, midpoint, circle,
// shapes) it looks straight down, so the board plane is parallel to the screen and every angle and
// length ratio on it shows true (90° stays 90° at any aspect ratio); solids rounds tilt to a 3/4
// view so blocks read as 3D. VLM's line and the answer panel cover part of the canvas (right side
// when wide, bottom when narrow): the view is shifted into the free area (a view offset keeps the
// axis perpendicular) and pulled back until the figure fits. The ⟲/⟳ buttons (R key) turn the
// view in 45° steps: top-down that spins the board in its own plane, so angles stay true. Turns
// and tilts are eased (instant with reduced motion).
import { PerspectiveCamera, Vector3 } from 'three';

const FOV = 40;
/** Elevation of the 3/4 view (solids): steep, the blocks' tops and sides both show. */
const SOLID_PITCH = Math.atan2(2.4, 1);
const FLAT_PITCH = Math.PI / 2;
const MIN_DISTANCE = 9;
/** Reused by `apply` (it runs while turning and every few frames). */
const scratchDirection = new Vector3();
const TURN_STEP = Math.PI / 4;
const TURN_RATE = 6;

/** One eased step from `value` towards `goal` (snaps when close). */
function ease(value: number, goal: number, dt: number): number {
  if (Math.abs(goal - value) < 1e-3) return goal;
  return value + (goal - value) * Math.min(1, dt * TURN_RATE);
}

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
  /** 1 = straight down (flat figures), 0 = the 3/4 view (solids). */
  private flat = 1;
  private flatGoal = 1;
  private readonly target = new Vector3(0, 0.3, 0);

  constructor(private readonly reducedMotion: boolean) {}

  /** View turn in whole steps (test hook / announcements). */
  get steps(): number {
    return Math.round(this.turnGoal / TURN_STEP);
  }

  /** The view has reached its turn and tilt (no easing left). */
  get settled(): boolean {
    return this.turn === this.turnGoal && this.flat === this.flatGoal;
  }

  /** Straight down for flat figures (true) or the 3/4 view for solids (false). */
  setFlat(flat: boolean): void {
    this.flatGoal = flat ? 1 : 0;
    if (this.reducedMotion) this.flat = this.flatGoal;
    this.apply();
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
    if (this.settled) return;
    this.turn = ease(this.turn, this.turnGoal, dt);
    this.flat = ease(this.flat, this.flatGoal, dt);
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
    // Tilted, the board's depth is foreshortened a little; top-down it is not.
    const halfY = (s * this.half.w + c * this.half.d) * (0.95 + 0.05 * this.flat) + 0.5;
    const camera = this.camera;
    camera.aspect = w / h;
    const tanHalf = Math.tan((FOV * Math.PI) / 360);
    const fitWidth = halfX / (tanHalf * camera.aspect * (freeW / w));
    const fitHeight = halfY / (tanHalf * (freeH / h));
    const distance = Math.max(MIN_DISTANCE, fitWidth, fitHeight) + 1.5;
    const pitch = SOLID_PITCH + (FLAT_PITCH - SOLID_PITCH) * this.flat;
    const [sinT, cosT] = [Math.sin(this.turn), Math.cos(this.turn)];
    const direction = scratchDirection.set(
      sinT * Math.cos(pitch),
      Math.sin(pitch),
      cosT * Math.cos(pitch),
    );
    camera.position.copy(this.target).addScaledVector(direction, distance);
    // Screen up = the board's far side for this turn (well defined even looking straight down).
    camera.up.set(-sinT, 0, -cosT);
    camera.lookAt(this.target);
    const top = Math.min(coverTop, h - freeH);
    camera.setViewOffset(w, h, (w - freeW) / 2, h / 2 - (top + freeH / 2), w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
}
