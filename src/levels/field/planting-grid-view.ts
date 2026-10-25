// 3D view of the planting grid: soil mounds, flowering plants (meadow flower look) and row stakes
// as instanced meshes, invisible finger-sized hit proxies per cell/stake for picking, and the
// quarter-turn animation of the plot. The model (planting-grid.ts) stays the source of truth.
import { BoxGeometry, type Group, Mesh, type Object3D, Vector3 } from 'three';
import type { DropZone } from '../../core/input/drop-zone';
import type { Pickable } from '../../core/input/raycast-picker';
import { EASE } from '../../core/tween-manager';
import {
  FIELD_COLORS as C,
  commitInstances,
  type MaterialCache,
  setInstance,
} from './field-materials';
import { type GridCell, isPlanted, type PlantingGrid } from './planting-grid';
import {
  CELL,
  createPlotGroups,
  createPlotMeshes,
  MAX_CELLS,
  MAX_ROWS,
} from './planting-grid-meshes';

export { CELL, MAX_ROWS };

const ROTATE_SECONDS = 0.7;

export const cellId = (row: number, col: number): string => `cell:${row}:${col}`;
export const rowId = (row: number): string => `row:${row}`;

export interface GridView {
  readonly group: Group;
  /** Seedling basket at the plot's front-left corner (drag source). */
  readonly basket: Group;
  show(grid: PlantingGrid): void;
  setFocus(cell: GridCell | null): void;
  setRowHighlight(on: boolean): void;
  /** Quarter turn of the plot; resolves when done (the caller then shows the rotated model). */
  rotate(): Promise<void>;
  /** Ends a running turn at once (plot back to rest) and resolves its promise. */
  stopTurn(): void;
  readonly animating: boolean;
  /** Unplanted cells + rows that still have room (pointer targets). */
  targets(): { pickables: Pickable[]; zones: DropZone[] };
  /** World position of a cell, a row stake, or the plot's front edge (`front`). */
  worldOf(id: string): Vector3 | null;
  update(dt: number): void;
}

export function createGridView(mat: MaterialCache, reducedMotion: boolean): GridView {
  const { group, plot } = createPlotGroups();
  const { base, mounds, stems, heads, stakes, tips, basket } = createPlotMeshes(mat);
  plot.add(base, mounds, stems, heads, stakes, tips);
  group.add(basket);
  const proxyGeometry = new BoxGeometry(CELL, 0.5, CELL);
  const proxies = new Map<string, Mesh>();
  const proxy = (id: string): Mesh => {
    let m = proxies.get(id);
    if (!m) {
      m = new Mesh(proxyGeometry, base.material);
      m.visible = false;
      plot.add(m);
      proxies.set(id, m);
    }
    return m;
  };
  let grid: PlantingGrid = { rows: 1, cols: 1, planted: [false] };
  let focus: GridCell | null = null;
  let highlight = false;
  const growth = new Float32Array(MAX_CELLS);
  let turn: { t: number; resolve: () => void } | null = null;

  const x = (col: number) => (col - (grid.cols - 1) / 2) * CELL;
  const z = (row: number) => (row - (grid.rows - 1) / 2) * CELL;
  const stakeX = () => -(grid.cols / 2) * CELL - 0.55;

  const layout = (): void => {
    base.scale.set(grid.cols * CELL + 0.5, 1, grid.rows * CELL + 0.5);
    basket.position.set(stakeX() - 0.3, 0, (grid.rows / 2) * CELL + 0.9);
    for (const m of proxies.values()) m.position.set(0, -50, 0);
    for (let i = 0; i < MAX_CELLS; i++) {
      const row = Math.floor(i / grid.cols);
      const col = i % grid.cols;
      if (i >= grid.rows * grid.cols) {
        for (const m of [mounds, stems, heads]) setInstance(m, i, { x: 0, y: -5, z: 0, sx: 0 });
        continue;
      }
      const focused = focus?.row === row && focus.col === col;
      const planted = isPlanted(grid, row, col);
      const soil = highlight ? (row % 2 ? C.rowB : C.rowA) : planted ? C.soilDark : C.soil;
      const s = focused ? 1.2 : 1;
      setInstance(
        mounds,
        i,
        { x: x(col), y: 0.22, z: z(row), sx: s, sy: 1, sz: s },
        focused ? C.focus : soil,
      );
      const g = planted ? (growth[i] ?? 0) : 0;
      setInstance(stems, i, { x: x(col), y: 0.3 + 0.21 * g, z: z(row), sx: g || 0.0001 });
      const flower = C.flowers[(row + col) % 3] ?? C.lantern;
      setInstance(heads, i, { x: x(col), y: 0.3 + 0.5 * g, z: z(row), sx: g || 0.0001 }, flower);
      proxy(cellId(row, col)).position.set(x(col), 0.3, z(row));
    }
    for (let r = 0; r < MAX_ROWS; r++) {
      const shown = r < grid.rows;
      const pose = { x: stakeX(), y: shown ? 0.45 : -5, z: shown ? z(r) : 0, sx: shown ? 1 : 0 };
      setInstance(stakes, r, pose);
      setInstance(tips, r, { ...pose, y: shown ? 0.95 : -5 });
      if (shown) proxy(rowId(r)).position.set(stakeX(), 0.45, z(r));
    }
    for (const m of [mounds, stems, heads, stakes, tips]) commitInstances(m);
  };

  return {
    group,
    basket,
    show(next) {
      const fresh = next.rows !== grid.rows || next.cols !== grid.cols;
      for (let i = 0; i < next.planted.length; i++) {
        if (!next.planted[i]) growth[i] = 0;
        else if (fresh || reducedMotion) growth[i] = 1;
      }
      grid = next;
      layout();
    },
    setFocus(cell) {
      focus = cell;
      layout();
    },
    setRowHighlight(on) {
      highlight = on;
      layout();
    },
    rotate() {
      if (turn || reducedMotion) return Promise.resolve();
      return new Promise<void>((resolve) => {
        turn = { t: 0, resolve };
      });
    },
    stopTurn() {
      const done = turn?.resolve;
      turn = null;
      plot.rotation.y = 0;
      done?.();
    },
    get animating() {
      return turn !== null;
    },
    targets() {
      const pickables: Pickable[] = [];
      const zones: DropZone[] = [];
      const take = (id: string, object: Object3D) => pickables.push({ id, object });
      for (let row = 0; row < grid.rows; row++) {
        let room = false;
        for (let col = 0; col < grid.cols; col++) {
          if (isPlanted(grid, row, col)) continue;
          room = true;
          const id = cellId(row, col);
          take(id, proxy(id));
          const center = { x: x(col), z: z(row) };
          const shape = { kind: 'box', halfWidth: CELL / 2, halfDepth: CELL / 2 } as const;
          zones.push({ id, center, shape, accepts: () => true });
        }
        if (room) take(rowId(row), proxy(rowId(row)));
      }
      return { pickables, zones };
    },
    worldOf(id) {
      if (id === 'front')
        return plot.localToWorld(new Vector3(0, 0.2, (grid.rows / 2) * CELL + 0.9));
      const m = proxies.get(id);
      return m && m.position.y > -10 ? m.getWorldPosition(new Vector3()) : null;
    },
    update(dt) {
      let grew = false;
      for (let i = 0; i < grid.planted.length; i++) {
        const g = growth[i] ?? 0;
        if (!grid.planted[i] || g >= 1) continue;
        growth[i] = Math.min(1, g + dt * 4);
        grew = true;
      }
      if (grew) layout();
      if (!turn) return;
      turn.t = Math.min(1, turn.t + dt / ROTATE_SECONDS);
      plot.rotation.y = -(Math.PI / 2) * EASE.easeInOutQuad(turn.t);
      if (turn.t < 1) return;
      const done = turn.resolve;
      turn = null;
      plot.rotation.y = 0;
      done();
    },
  };
}
