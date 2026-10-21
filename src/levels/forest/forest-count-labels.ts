// Small count chips floating over each friend or basket (projected from 3D). After "check" they
// carry a shape as well as a colour (▲ too many, ▼ too few, ✓ right), never colour alone.
import { type Camera, Vector3 } from 'three';
import type { GroundPoint } from '../../core/input/interaction-types';
import type { ShareMark } from './sharing-model';

export interface CountLabel {
  readonly anchor: GroundPoint;
  readonly height: number;
  readonly text: string;
  readonly ariaLabel: string;
}

const MARK_SYMBOL: Record<ShareMark, string> = { ok: '✓', tooMany: '▲', tooFew: '▼' };
const projected = new Vector3();

export class ForestCountLabels {
  readonly root = document.createElement('div');
  private labels: readonly CountLabel[] = [];
  private width = 1;
  private height = 1;

  constructor(parent: HTMLElement) {
    this.root.className = 'forest-labels';
    parent.append(this.root);
  }

  setSize(width: number, height: number): void {
    this.width = Math.max(1, width);
    this.height = Math.max(1, height);
  }

  /** Replaces the chips; `marks` (from a check) adds the shape markers. */
  set(labels: readonly CountLabel[], marks: readonly ShareMark[] = []): void {
    this.labels = labels;
    this.root.replaceChildren(
      ...labels.map((label, i) => {
        const chip = document.createElement('span');
        chip.className = 'forest-chip';
        const mark = marks[i];
        if (mark) {
          chip.classList.add(mark);
          chip.dataset.mark = mark;
        }
        chip.textContent = mark ? `${MARK_SYMBOL[mark]} ${label.text}` : label.text;
        chip.setAttribute('aria-label', label.ariaLabel);
        return chip;
      }),
    );
  }

  /** Positions the chips for `camera` (call after the camera or the canvas changed). */
  place(camera: Camera): void {
    camera.updateMatrixWorld();
    this.labels.forEach((label, i) => {
      const chip = this.root.children[i] as HTMLElement | undefined;
      if (!chip) return;
      projected.set(label.anchor.x, label.height, label.anchor.z).project(camera);
      const x = ((projected.x + 1) / 2) * this.width;
      const y = ((1 - projected.y) / 2) * this.height;
      chip.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    });
  }
}
