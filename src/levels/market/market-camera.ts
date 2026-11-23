// Camera that frames the market stalls: it looks at the middle stall and stays there (the
// market has no chambers to walk between). The answer panel covers the right side (wide) or
// the bottom (narrow), so the view is shifted into the free area and pulled back until the
// stalls fit. Phase 25b: the zoom factor scales that auto-fit distance (0.6×–1.6×); the
// free-area shift is untouched by zooming.
import { PerspectiveCamera, Vector3 } from 'three';
import { clampZoomFactor } from '../shared/level-zoom';

const FOV = 45;
const DIRECTION = new Vector3(0.12, 0.42, 1).normalize();
const MIN_DISTANCE = 7;
/** World half-extents to keep on screen: the three stalls and their lantern poles. */
const HALF_WIDTH = 6.4;
const HALF_HEIGHT = 2.6;
const LOOK_Y = 1.1;

export interface FreeArea {
  width: number;
  height: number;
  coverRight: number;
  coverBottom: number;
}

export class MarketCamera {
  readonly camera = new PerspectiveCamera(FOV, 1, 0.3, 80);
  private area: FreeArea = { width: 1, height: 1, coverRight: 0, coverBottom: 0 };
  private readonly at = new Vector3(0, LOOK_Y, 0);
  private zoomFactorValue = 1;

  /** Current zoom factor (1 = the auto-fit distance). */
  get zoomFactor(): number {
    return this.zoomFactorValue;
  }

  /** Scales the auto-fit distance, clamped to 0.6×–1.6×. */
  setZoomFactor(factor: number): void {
    this.zoomFactorValue = clampZoomFactor(factor);
    this.apply();
  }

  /** Back to the auto-fit distance (a new round starts unzoomed). */
  resetZoom(): void {
    this.setZoomFactor(1);
  }

  setArea(area: FreeArea): void {
    this.area = area;
    this.apply();
  }

  update(): void {
    // Fixed framing: nothing walks, but keep the hook so the scene loop stays uniform.
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
    const distance = Math.max(MIN_DISTANCE, fitWidth, fitHeight) * this.zoomFactorValue;
    camera.position.copy(this.at).addScaledVector(DIRECTION, distance);
    camera.lookAt(this.at);
    camera.setViewOffset(w, h, (w - freeW) / 2, (h - freeH) / 2, w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
}
