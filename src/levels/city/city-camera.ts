// Camera over the street. VLM's line covers the top and the answer panel part of the canvas
// (right side on wide or short screens, bottom on narrow ones), so the view is shifted into the free area and pulled back
// until the round's subject (the street, or the building) fits there.
import { PerspectiveCamera, Vector3 } from 'three';

const FOV = 40;
const DIRECTION = new Vector3(0, 0.5, 1).normalize();
const MIN_DISTANCE = 12;

export interface CityFrame {
  /** Point looked at (centre of the subject). */
  target: Vector3;
  /** Half-width and half-height (world units) that must stay visible. */
  halfWidth: number;
  halfHeight: number;
}

export interface FreeArea {
  width: number;
  height: number;
  coverTop: number;
  coverRight: number;
  coverBottom: number;
}

/** The four houses with their numbers, the parcels and the road. */
export const STREET_FRAME: CityFrame = {
  target: new Vector3(0, 1.3, 1.6),
  halfWidth: 9.4,
  halfHeight: 3.4,
};

export function buildingFrame(width: number, height: number): CityFrame {
  return {
    target: new Vector3(0, height / 2 + 0.6, 0),
    halfWidth: Math.max(5.5, width / 2 + 2),
    halfHeight: height / 2 + 2.2,
  };
}

export class CityCamera {
  readonly camera = new PerspectiveCamera(FOV, 1, 0.5, 150);
  private frame: CityFrame = STREET_FRAME;
  private area: FreeArea = { width: 1, height: 1, coverTop: 0, coverRight: 0, coverBottom: 0 };

  setFrame(frame: CityFrame): void {
    this.frame = frame;
    this.apply();
  }

  setArea(area: FreeArea): void {
    this.area = area;
    this.apply();
  }

  private apply(): void {
    const { width, height, coverTop, coverRight, coverBottom } = this.area;
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    const freeW = Math.max(w * 0.35, w - coverRight);
    const freeH = Math.max(h * 0.2, h - coverBottom - coverTop);
    const camera = this.camera;
    camera.aspect = w / h;
    const tanHalf = Math.tan((FOV * Math.PI) / 360);
    const fitWidth = this.frame.halfWidth / (tanHalf * camera.aspect * (freeW / w));
    const fitHeight = this.frame.halfHeight / (tanHalf * (freeH / h));
    const distance = Math.max(MIN_DISTANCE, fitWidth, fitHeight);
    camera.position.copy(this.frame.target).addScaledVector(DIRECTION, distance);
    camera.lookAt(this.frame.target);
    // Centre of the view = centre of the uncovered part of the canvas (below VLM's line).
    const top = Math.min(coverTop, h - freeH);
    camera.setViewOffset(w, h, (w - freeW) / 2, h / 2 - (top + freeH / 2), w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
}
