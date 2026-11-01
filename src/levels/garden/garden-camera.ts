// Camera over the garden's work spot. VLM's line covers the top and the answer panel part of the
// canvas (right side when wide, bottom when narrow), so the view is shifted into the free area
// and pulled back until the pots, the balance or the bags (with VLM beside them) fit there.
import { PerspectiveCamera, Vector3 } from 'three';

const FOV = 40;
const DIRECTION = new Vector3(0, 0.45, 1).normalize();
const MIN_DISTANCE = 9;
const TARGET = new Vector3(-1.2, 1.5, 1);
const HALF_WIDTH = 6.8;
const HALF_HEIGHT = 2.4;

export interface FreeArea {
  width: number;
  height: number;
  coverTop: number;
  coverRight: number;
  coverBottom: number;
}

export class GardenCamera {
  readonly camera = new PerspectiveCamera(FOV, 1, 0.5, 150);

  constructor() {
    this.setArea({ width: 1, height: 1, coverTop: 0, coverRight: 0, coverBottom: 0 });
  }

  setArea(area: FreeArea): void {
    const { coverTop, coverRight, coverBottom } = area;
    const w = Math.max(1, area.width);
    const h = Math.max(1, area.height);
    const freeW = Math.max(w * 0.35, w - coverRight);
    const freeH = Math.max(h * 0.2, h - coverBottom - coverTop);
    const camera = this.camera;
    camera.aspect = w / h;
    const tanHalf = Math.tan((FOV * Math.PI) / 360);
    const fitWidth = HALF_WIDTH / (tanHalf * camera.aspect * (freeW / w));
    const fitHeight = HALF_HEIGHT / (tanHalf * (freeH / h));
    const distance = Math.max(MIN_DISTANCE, fitWidth, fitHeight);
    camera.position.copy(TARGET).addScaledVector(DIRECTION, distance);
    camera.lookAt(TARGET);
    // Centre of the view = centre of the uncovered part of the canvas (below VLM's line).
    const top = Math.min(coverTop, h - freeH);
    camera.setViewOffset(w, h, (w - freeW) / 2, h / 2 - (top + freeH / 2), w, h);
    camera.updateProjectionMatrix();
    camera.updateMatrixWorld();
  }
}
