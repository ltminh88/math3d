// Camera of the workshop: looks over the workbench from the open front and leans toward the tool
// of the current order. The panel covers part of the canvas (right side when wide, bottom when
// narrow), so the view is offset to keep the bench in the uncovered part.
import { PerspectiveCamera, Vector3 } from 'three';
import { BENCH_TOP, STATION_SPOTS } from './workshop-layout';
import type { WorkshopStation } from './workshop-stations';

export interface CameraArea {
  width: number;
  height: number;
  coverRight: number;
  coverBottom: number;
}

export class WorkshopCamera {
  readonly camera = new PerspectiveCamera(42, 1, 0.1, 80);
  private readonly look = new Vector3(0, BENCH_TOP + 0.6, -0.6);
  private readonly aim = new Vector3(0, BENCH_TOP + 0.6, -0.6);

  constructor(private readonly reducedMotion: boolean) {
    this.place(1);
  }

  focus(station: WorkshopStation): void {
    const [x, z] = STATION_SPOTS[station];
    this.aim.set(
      x * 0.45,
      BENCH_TOP + (station === 'thermometer' ? 1.4 : 0.6),
      Math.max(z, -2) * 0.4 - 0.6,
    );
    if (this.reducedMotion) this.place(1);
  }

  setArea(area: CameraArea): void {
    const { width, height, coverRight, coverBottom } = area;
    const w = Math.max(1, width);
    const h = Math.max(1, height);
    const narrow = w < h;
    this.camera.aspect = w / h;
    this.camera.fov = narrow ? 62 : 42;
    // Shift the picture by half the covered part so the bench sits in the free area.
    this.camera.setViewOffset(w, h, coverRight / 2, coverBottom / 2, w, h);
    this.camera.updateProjectionMatrix();
  }

  update(dt: number): void {
    this.place(this.reducedMotion ? 1 : Math.min(1, dt * 3));
  }

  private place(k: number): void {
    this.look.lerp(this.aim, k);
    this.camera.position.set(this.look.x * 0.6, BENCH_TOP + 4.6, 8.6);
    this.camera.lookAt(this.look);
  }
}
