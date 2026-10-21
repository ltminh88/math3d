// A few DOM labels pinned to 3D points (the plot's equation, skip-count numbers per row).
// Positions are recomputed when the layout or the canvas size changes, never every frame.
import type { Camera, Vector3 } from 'three';

export interface PinnedLabel {
  readonly text: string;
  readonly at: Vector3;
  readonly className?: string;
}

export interface ProjectedLabels {
  set(labels: readonly PinnedLabel[]): void;
  /** Re-projects every label (call after resize, layout or camera changes). */
  place(camera: Camera, width: number, height: number): void;
  hide(hidden: boolean): void;
}

export function createProjectedLabels(parent: HTMLElement): ProjectedLabels {
  const layer = document.createElement('div');
  layer.className = 'field-labels';
  layer.setAttribute('aria-hidden', 'true');
  parent.prepend(layer);
  let current: { label: PinnedLabel; node: HTMLElement }[] = [];
  let last: { camera: Camera; width: number; height: number } | null = null;

  const place = (camera: Camera, width: number, height: number): void => {
    last = { camera, width, height };
    camera.updateMatrixWorld();
    for (const { label, node } of current) {
      const p = label.at.clone().project(camera);
      node.style.transform = `translate(${((p.x + 1) / 2) * width}px, ${((1 - p.y) / 2) * height}px) translate(-50%, -50%)`;
      node.hidden = p.z > 1;
    }
  };

  return {
    set(labels) {
      layer.replaceChildren();
      current = labels.map((label) => {
        const node = document.createElement('span');
        node.className = `field-label ${label.className ?? ''}`.trim();
        node.textContent = label.text;
        layer.append(node);
        return { label, node };
      });
      if (last) place(last.camera, last.width, last.height);
    },
    place,
    hide(hidden) {
      layer.hidden = hidden;
    },
  };
}
