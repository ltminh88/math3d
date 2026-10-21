// Planting grid model (pure): a rows x cols plot of cells that are planted one by one or a row at
// a time, and turned a quarter clockwise to show rows x cols = cols x rows (the count never moves).

export interface PlantingGrid {
  readonly rows: number;
  readonly cols: number;
  /** Row-major: index = row * cols + col. */
  readonly planted: readonly boolean[];
}

export interface GridCell {
  readonly row: number;
  readonly col: number;
}

export function createGrid(rows: number, cols: number, filled = false): PlantingGrid {
  return { rows, cols, planted: Array.from({ length: rows * cols }, () => filled) };
}

const inside = (grid: PlantingGrid, row: number, col: number): boolean =>
  Number.isInteger(row) &&
  Number.isInteger(col) &&
  row >= 0 &&
  col >= 0 &&
  row < grid.rows &&
  col < grid.cols;

export const cellIndex = (grid: PlantingGrid, row: number, col: number): number =>
  row * grid.cols + col;

export function isPlanted(grid: PlantingGrid, row: number, col: number): boolean {
  return inside(grid, row, col) && grid.planted[cellIndex(grid, row, col)] === true;
}

export function plantCell(grid: PlantingGrid, row: number, col: number): PlantingGrid {
  if (!inside(grid, row, col) || isPlanted(grid, row, col)) return grid;
  const planted = grid.planted.slice();
  planted[cellIndex(grid, row, col)] = true;
  return { ...grid, planted };
}

export function plantRow(grid: PlantingGrid, row: number): PlantingGrid {
  let next = grid;
  for (let col = 0; col < grid.cols; col++) next = plantCell(next, row, col);
  return next;
}

export const plantedCount = (grid: PlantingGrid): number => grid.planted.filter(Boolean).length;

export const isFull = (grid: PlantingGrid): boolean => grid.planted.every(Boolean);

/** Quarter turn clockwise (seen from above): cell (r, c) moves to (c, rows - 1 - r). */
export function rotateGrid(grid: PlantingGrid): PlantingGrid {
  const turned = createGrid(grid.cols, grid.rows);
  const planted = turned.planted.slice();
  for (let row = 0; row < grid.rows; row++) {
    for (let col = 0; col < grid.cols; col++) {
      planted[cellIndex(turned, col, grid.rows - 1 - row)] = isPlanted(grid, row, col);
    }
  }
  return { ...turned, planted };
}

const STEPS: Readonly<Record<string, readonly [number, number]>> = {
  ArrowUp: [-1, 0],
  ArrowDown: [1, 0],
  ArrowLeft: [0, -1],
  ArrowRight: [0, 1],
};

/** Arrow-key focus: the first arrow lands on the top-left cell; edges hold the focus. */
export function moveFocus(grid: PlantingGrid, focus: GridCell | null, key: string): GridCell {
  const clamp = (value: number, max: number) => Math.min(Math.max(value, 0), max - 1);
  if (focus === null) return { row: 0, col: 0 };
  const [dRow, dCol] = STEPS[key] ?? [0, 0];
  return {
    row: clamp(clamp(focus.row, grid.rows) + dRow, grid.rows),
    col: clamp(clamp(focus.col, grid.cols) + dCol, grid.cols),
  };
}
