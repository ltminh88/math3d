// Tiling model for diện tích rounds (pure): the child covers a shape with 1 cm² tiles by tapping
// cells or "Đặt một hàng" (the next row that is not full); counting the tiles stays their job.
// Only small shapes are tiled (<= TILE_LIMIT cells, <= TILE_MAX_COLS columns); bigger ones use
// the formula.
import type { GeoScene, Point } from '../../geometry/geo-scene-types';
import type { SkillTier } from '../../learning/skill-tiers';

export const TILE_LIMIT = 20;
/** Columns of 44 px cells (3 px gaps) that fit the panel on a phone (~340 px): 6 x 47 = 282 px. */
export const TILE_MAX_COLS = 6;

const key = (x: number, y: number) => `${x},${y}`;

export class WorkshopTileGrid {
  private readonly shape = new Set<string>();
  private readonly tiles = new Set<string>();

  constructor(readonly cells: readonly Point[]) {
    for (const [x, y] of cells) this.shape.add(key(x, y));
  }

  get placed(): number {
    return this.tiles.size;
  }

  get full(): boolean {
    return this.tiles.size === this.shape.size;
  }

  has(x: number, y: number): boolean {
    return this.tiles.has(key(x, y));
  }

  /** Puts a tile on (or takes it off) a cell of the shape; false outside the shape. */
  toggle(x: number, y: number): boolean {
    const k = key(x, y);
    if (!this.shape.has(k)) return false;
    if (this.tiles.has(k)) this.tiles.delete(k);
    else this.tiles.add(k);
    return true;
  }

  /** Fills the top-most row that still has empty cells; returns the cells placed (left to right). */
  placeRow(): Point[] {
    const empty = this.cells.filter(([x, y]) => !this.tiles.has(key(x, y)));
    if (empty.length === 0) return [];
    const row = Math.min(...empty.map(([, y]) => y));
    const placed = empty.filter(([, y]) => y === row).sort((a, b) => a[0] - b[0]);
    for (const [x, y] of placed) this.tiles.add(key(x, y));
    return placed;
  }
}

/** The shapes to tile for a scene, or null when the round is solved without tiling. */
export function tileTargets(scene: GeoScene, tier: SkillTier): Point[][] | null {
  if (scene.kind === 'cells') {
    const groups = scene.groups.map((g) => [...g.cells]);
    return groups.every((g) => g.length <= TILE_LIMIT) ? groups : null;
  }
  if (scene.kind !== 'rect' || tier !== 1 || scene.cut || scene.unit !== 'cm') return null;
  if (scene.width * scene.height > TILE_LIMIT || scene.width > TILE_MAX_COLS) return null;
  const cells: Point[] = [];
  for (let y = 0; y < scene.height; y++) for (let x = 0; x < scene.width; x++) cells.push([x, y]);
  return [cells];
}
