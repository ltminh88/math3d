// Test builds only (`vite build --mode test`): `window.__field` lets e2e specs read the running
// round and find on-screen points of cells/row stakes for the touch path. Installed from the
// scene behind `import.meta.env.MODE === 'test'`, removed when the level exits.
import { type Camera, Vector3 } from 'three';
import type { FieldGame } from './field-game';
import { cellId, type GridView, rowId } from './planting-grid-view';

export interface FieldTestHook {
  state(): {
    phase: string;
    index: number;
    type: string;
    rows: number;
    cols: number;
    total: number;
    correctOptions: string[];
    hintRung: number;
  };
  /** Client (CSS px) point of `cell:r:c`, `row:r` or `basket`; null when not shown. */
  point(id: string): { x: number; y: number } | null;
  /** Ids of the rows that still have empty cells. */
  openRows(): string[];
  cellId(row: number, col: number): string;
}

declare global {
  interface Window {
    __field?: FieldTestHook;
  }
}

export function installFieldTestHook(
  game: FieldGame,
  view: GridView,
  camera: Camera,
  canvas: HTMLCanvasElement,
): () => void {
  window.__field = {
    state: () => ({
      phase: game.status().phase,
      index: game.status().index,
      type: game.status().round.type,
      rows: game.status().grid.rows,
      cols: game.status().grid.cols,
      total: game.status().round.total,
      correctOptions: game
        .status()
        .round.options.filter((o) => o.correct)
        .map((o) => o.id),
      hintRung: game.status().hintRung,
    }),
    point(id) {
      const at = id === 'basket' ? view.basket.getWorldPosition(new Vector3()) : view.worldOf(id);
      if (!at) return null;
      const p = at.project(camera);
      const rect = canvas.getBoundingClientRect();
      return {
        x: rect.left + ((p.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - p.y) / 2) * rect.height,
      };
    },
    openRows: () =>
      Array.from({ length: game.status().grid.rows }, (_, r) => r)
        .filter((r) =>
          game
            .status()
            .grid.planted.slice(r * game.status().grid.cols, (r + 1) * game.status().grid.cols)
            .includes(false),
        )
        .map(rowId),
    cellId,
  };
  return () => {
    delete window.__field;
  };
}
