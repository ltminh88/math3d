// Chips projected from 3D points into the level overlay: house numbers, parcel expressions,
// floor totals (hint 3) and the 5 + rest bands (hint 2). DOM text stays crisp and costs no draw
// calls; screen readers get the same text through the panel, so the chips are aria-hidden.
import { type Camera, Vector3 } from 'three';

export interface CityLabel {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly text: string;
  /** Extra class (`city-chip--house`, `--parcel`, `--floor`, `--band-a`, `--band-b`). */
  readonly kind: string;
  /** Data attribute for the e2e specs (house index, parcel index, floor). */
  readonly id?: string;
}

const projected = new Vector3();

export class CityLabels {
  readonly root = document.createElement('div');
  private labels: readonly CityLabel[] = [];
  private width = 1;
  private height = 1;
  private camera: Camera | undefined;

  constructor(parent: HTMLElement) {
    this.root.className = 'city-labels';
    this.root.setAttribute('aria-hidden', 'true');
    parent.append(this.root);
  }

  setSize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
  }

  set(labels: readonly CityLabel[]): void {
    this.labels = labels;
    this.root.replaceChildren(
      ...labels.map((label) => {
        const chip = document.createElement('span');
        chip.className = `city-chip city-chip--${label.kind}`;
        chip.textContent = label.text;
        if (label.id) chip.dataset.id = label.id;
        return chip;
      }),
    );
    if (this.camera) this.place(this.camera);
  }

  /** Positions the chips for `camera` (call after the camera, the canvas or a 3D point moved). */
  place(camera: Camera): void {
    this.camera = camera;
    camera.updateMatrixWorld();
    this.labels.forEach((label, i) => {
      const chip = this.root.children[i] as HTMLElement | undefined;
      if (!chip) return;
      projected.set(label.x, label.y, label.z).project(camera);
      const x = ((projected.x + 1) / 2) * this.width;
      const y = ((1 - projected.y) / 2) * this.height;
      chip.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
  }

  destroy(): void {
    this.root.remove();
  }
}
