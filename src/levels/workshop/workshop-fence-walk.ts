// Fence walk for chu vi rounds (pure): tap each side (or "Đi tiếp") to walk the fence once round;
// the walked sides are written as a sum ("5 + 3 + 5") that the child finishes. A wall side has no
// fence; a side without a label shows "?".
import type { GeoScene } from '../../geometry/geo-scene-types';

export interface FenceSide {
  readonly length: number;
  readonly known: boolean;
  readonly wall: boolean;
}

/** Sides in drawing order: rectangles top, right, bottom, left (the wall is the top side). */
export function fenceSides(scene: GeoScene): FenceSide[] {
  if (scene.kind === 'side-polygon') {
    return scene.sides.map((length, i) => ({
      length,
      known: !scene.hidden.includes(i),
      wall: false,
    }));
  }
  if (scene.kind !== 'rect') return [];
  const { width, height, showWidth, showHeight } = scene;
  return [width, height, width, height].map((length, i) => ({
    length,
    known: i % 2 === 0 ? showWidth : showHeight,
    wall: i === 0 && scene.wall === true,
  }));
}

export class WorkshopFenceWalk {
  readonly walked: number[] = [];

  constructor(readonly sides: readonly FenceSide[]) {}

  get complete(): boolean {
    return this.sides.every((s, i) => s.wall || this.walked.includes(i));
  }

  /** Walks side `i`; false for a wall or a side already walked. */
  walk(i: number): boolean {
    const side = this.sides[i];
    if (!side || side.wall || this.walked.includes(i)) return false;
    this.walked.push(i);
    return true;
  }

  /** Walks the next side round the fence (after the last walked one); -1 when done. */
  walkNext(): number {
    const n = this.sides.length;
    const from = this.walked.length > 0 ? (this.walked[this.walked.length - 1] as number) + 1 : 0;
    for (let k = 0; k < n; k++) {
      const i = (from + k) % n;
      if (this.walk(i)) return i;
    }
    return -1;
  }

  /** The walked sides as a sum, without the total. */
  expression(): string {
    return this.walked
      .map((i) => {
        const side = this.sides[i] as FenceSide;
        return side.known ? String(side.length) : '?';
      })
      .join(' + ');
  }
}
