// Pointer side of planting, on the shared interaction facade: tap a soil cell, tap a row stake to
// fill the row, or drag (from a cell or the seedling basket) across cells to plant each one passed.
import type { Object3D } from 'three';
import type { InteractionController } from '../../core/input/interaction-controller';
import type { InteractionEvent } from '../../core/input/interaction-types';
import type { GridView } from './planting-grid-view';

export interface PlantingInput {
  /** Planting is possible now: register the free cells, rows and the basket. */
  enable(): void;
  disable(): void;
  /** Re-register the targets after the grid changed. */
  refresh(): void;
}

export interface PlantingHandlers {
  plantCell(row: number, col: number): void;
  plantRow(row: number): void;
}

const BASKET = 'basket';

function parseTarget(id: string | null): { row: number; col?: number } | null {
  const cell = /^cell:(\d+):(\d+)$/.exec(id ?? '');
  if (cell) return { row: Number(cell[1]), col: Number(cell[2]) };
  const row = /^row:(\d+)$/.exec(id ?? '');
  return row ? { row: Number(row[1]) } : null;
}

export function createPlantingInput(
  interaction: InteractionController,
  view: GridView,
  basket: Object3D,
  handlers: PlantingHandlers,
): PlantingInput {
  let enabled = false;
  const plant = (id: string | null): void => {
    if (!enabled) return;
    const target = parseTarget(id);
    if (!target) return;
    if (target.col === undefined) handlers.plantRow(target.row);
    else handlers.plantCell(target.row, target.col);
  };
  const refresh = (): void => {
    if (!enabled) return;
    const { pickables, zones } = view.targets();
    interaction.setZones(zones);
    interaction.setPickables([...pickables, { id: BASKET, object: basket }]);
  };
  interaction.events.on((event: InteractionEvent) => {
    switch (event.type) {
      case 'tap-select':
        if (event.itemId !== BASKET) plant(event.itemId);
        break;
      case 'pick':
        if (event.itemId !== BASKET && !event.itemId.startsWith('row:')) plant(event.itemId);
        break;
      case 'drag-move':
        plant(event.zoneId);
        break;
      case 'drop':
        plant(event.zoneId);
        break;
      default:
        break;
    }
  });
  return {
    enable() {
      enabled = true;
      interaction.setPlaneY(0.3);
      refresh();
    },
    disable() {
      enabled = false;
      interaction.reset();
    },
    refresh,
  };
}
