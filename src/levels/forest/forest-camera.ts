// Camera over the clearing. The answer panel covers part of the canvas (right side on wide
// screens, bottom on narrow ones), so the view is shifted into the free area and pulled back
// until the round's friends/baskets fit there.
import { PerspectiveCamera, Vector3 } from 'three';

const FOV = 42;
const TARGET = new Vector3(0, 0, -0.5);
const DIRECTION = new Vector3(0, 0.74, 0.67).normalize();
const MIN_DISTANCE = 15;
/** Depth (half, world units) that must stay visible: from the trees behind to the pile in front. */
const HALF_DEPTH = 3.6;

export interface FreeArea {
  /** Canvas CSS size. */
  width: number;
  height: number;
  /** Panel size covering the right side (wide) or the bottom (narrow), CSS px. */
  coverRight: number;
  coverBottom: number;
}

export class ForestCamera {
  readonly camera = new PerspectiveCamera(FOV, 1, 0.5, 120);
  private halfWidth = 5;
  private area: FreeArea = { width: 1, height: 1, coverRight: 0, coverBottom: 0 };

  /** Half-width (world units) the current round needs on screen. */
  setExtent(halfWidth: number): void {
    this.halfWidth = halfWidth;
    this.apply();
  }

  setArea(area: FreeArea): void {
    this.area = area;
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
    const fitWidth = this.halfWidth / (tanHalf * camera.aspect * (freeW / w));
    const fitDepth = HALF_DEPTH / (tanHalf * (freeH / h));
    const distance = Math.max(MIN_DISTANCE, fitWidth, fitDepth);
    camera.position.copy(TARGET).addScaledVector(DIRECTION, distance);
    camera.lookAt(TARGET);
    // Shift the picture into the free area: centre of the view = centre of the uncovered part.
    camera.setViewOffset(w, h, (w - freeW) / 2, (h - freeH) / 2, w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
}
