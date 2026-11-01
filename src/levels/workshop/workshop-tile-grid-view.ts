// Tiling board (diện tích): each shape is a grid of square buttons (>= 44 px) inside its frame;
// a tap lays or lifts a 1 cm² tile and "Đặt một hàng" fills the next row. The tiles placed are
// reported (for the 3D tile board), never counted for the child. Bigger floors use the formula
// view (workshop-area-formula-view.ts).
import type { GeoScene, Point } from '../../geometry/geo-scene-types';
import { CELL_GRID } from '../../measurement/measurement-ranges';
import type { WorkshopStrings } from './workshop-strings';
import { WorkshopTileGrid } from './workshop-tile-grid';

export interface TileGridView {
  readonly element: HTMLElement;
  readonly grids: readonly WorkshopTileGrid[];
  placeRow(): void;
  placed(): number;
}

function frameOf(scene: GeoScene, cells: readonly Point[]): { w: number; h: number } {
  if (scene.kind === 'cells') return { w: CELL_GRID.w, h: CELL_GRID.h };
  return {
    w: Math.max(...cells.map(([x]) => x)) + 1,
    h: Math.max(...cells.map(([, y]) => y)) + 1,
  };
}

export function createTileGridView(
  scene: GeoScene,
  targets: readonly Point[][],
  ws: WorkshopStrings,
  onChange: (grids: readonly WorkshopTileGrid[]) => void,
): TileGridView {
  const element = document.createElement('div');
  element.className = 'workshop-tiles';
  const grids = targets.map((cells) => new WorkshopTileGrid(cells));
  const buttons: HTMLButtonElement[][] = [];

  const render = (): void => {
    grids.forEach((grid, g) => {
      for (const b of buttons[g] ?? []) {
        const on = grid.has(Number(b.dataset.x), Number(b.dataset.y));
        b.classList.toggle('tiled', on);
        b.setAttribute('aria-pressed', String(on));
      }
    });
    rowButton.disabled = grids.every((g) => g.full);
    element.dataset.placed = String(grids.reduce((n, g) => n + g.placed, 0));
    onChange(grids);
  };

  grids.forEach((grid, g) => {
    const { w, h } = frameOf(scene, grid.cells);
    const box = document.createElement('div');
    box.className = 'workshop-grid';
    box.style.setProperty('--cols', String(w));
    box.setAttribute('role', 'group');
    const name =
      scene.kind === 'cells' && scene.groups.length > 1
        ? ws('shape', { l: scene.groups[g]?.label ?? '' })
        : ws('board');
    box.setAttribute('aria-label', name);
    const own: HTMLButtonElement[] = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (!grid.cells.some(([cx, cy]) => cx === x && cy === y)) {
          box.append(Object.assign(document.createElement('span'), { className: 'ws-empty' }));
          continue;
        }
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ws-cell';
        Object.assign(b.dataset, { x: String(x), y: String(y) });
        b.setAttribute('aria-label', ws('cell', { r: y + 1, c: x + 1 }));
        b.addEventListener('click', () => {
          grid.toggle(x, y);
          render();
        });
        own.push(b);
        box.append(b);
      }
    buttons.push(own);
    if (grids.length > 1) {
      const title = document.createElement('p');
      title.className = 'workshop-grid__title';
      title.textContent = name;
      element.append(title);
    }
    element.append(box);
  });

  const rowButton = document.createElement('button');
  rowButton.type = 'button';
  rowButton.className = 'secondary workshop-place-row';
  rowButton.textContent = ws('placeRow');
  const view: TileGridView = {
    element,
    grids,
    placeRow() {
      const grid = grids.find((g) => !g.full);
      if (grid && grid.placeRow().length > 0) render();
    },
    placed: () => grids.reduce((n, g) => n + g.placed, 0),
  };
  rowButton.addEventListener('click', () => view.placeRow());
  const unit = document.createElement('p');
  unit.className = 'workshop-unit';
  unit.textContent = ws('tileUnit');
  element.append(unit, rowButton);
  render();
  return view;
}
