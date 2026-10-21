import { describe, expect, it } from 'vitest';
import {
  createGrid,
  isFull,
  isPlanted,
  moveFocus,
  plantCell,
  plantedCount,
  plantRow,
  rotateGrid,
} from './planting-grid';

describe('planting grid', () => {
  it('starts empty (or full) with rows x cols cells', () => {
    const grid = createGrid(3, 4);
    expect(grid.rows).toBe(3);
    expect(grid.cols).toBe(4);
    expect(plantedCount(grid)).toBe(0);
    expect(plantedCount(createGrid(3, 4, true))).toBe(12);
    expect(isFull(createGrid(3, 4, true))).toBe(true);
  });

  it('plants single cells once and ignores cells outside the plot', () => {
    let grid = plantCell(createGrid(3, 4), 1, 2);
    grid = plantCell(grid, 1, 2);
    grid = plantCell(grid, 3, 0);
    grid = plantCell(grid, 0, -1);
    expect(plantedCount(grid)).toBe(1);
    expect(isPlanted(grid, 1, 2)).toBe(true);
    expect(isPlanted(grid, 2, 1)).toBe(false);
  });

  it('fills a whole row and becomes full when every row is planted', () => {
    let grid = plantRow(createGrid(3, 4), 0);
    expect(plantedCount(grid)).toBe(4);
    grid = plantRow(plantRow(grid, 1), 2);
    expect(isFull(grid)).toBe(true);
    expect(plantedCount(plantRow(grid, 7))).toBe(12);
  });

  it('rotating swaps rows and cols, keeps the count and turns cells clockwise', () => {
    const grid = plantCell(plantCell(createGrid(3, 4), 0, 0), 2, 3);
    const turned = rotateGrid(grid);
    expect([turned.rows, turned.cols]).toEqual([4, 3]);
    expect(plantedCount(turned)).toBe(plantedCount(grid));
    // (r, c) -> (c, rows - 1 - r)
    expect(isPlanted(turned, 0, 2)).toBe(true);
    expect(isPlanted(turned, 3, 0)).toBe(true);
    expect(turned.rows * turned.cols).toBe(grid.rows * grid.cols);
  });

  it('four rotations give the original plot back', () => {
    const grid = plantRow(plantCell(createGrid(4, 7), 3, 6), 1);
    expect(rotateGrid(rotateGrid(rotateGrid(rotateGrid(grid))))).toEqual(grid);
  });

  it('moves keyboard focus with arrows and keeps it inside the plot', () => {
    const grid = createGrid(3, 4);
    expect(moveFocus(grid, null, 'ArrowRight')).toEqual({ row: 0, col: 0 });
    expect(moveFocus(grid, { row: 0, col: 0 }, 'ArrowRight')).toEqual({ row: 0, col: 1 });
    expect(moveFocus(grid, { row: 0, col: 3 }, 'ArrowRight')).toEqual({ row: 0, col: 3 });
    expect(moveFocus(grid, { row: 0, col: 1 }, 'ArrowUp')).toEqual({ row: 0, col: 1 });
    expect(moveFocus(grid, { row: 2, col: 1 }, 'ArrowDown')).toEqual({ row: 2, col: 1 });
    expect(moveFocus(grid, { row: 1, col: 1 }, 'ArrowLeft')).toEqual({ row: 1, col: 0 });
    expect(moveFocus(grid, { row: 5, col: 9 }, 'ArrowLeft')).toEqual({ row: 2, col: 2 });
  });
});
