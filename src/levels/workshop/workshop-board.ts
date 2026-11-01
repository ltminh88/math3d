// The measuring board of a round: picks the view for the item's scene (ruler, fence, tiles or the
// formula floor, balance, jug, thermometers) and exposes the two board actions the keys and
// buttons share: walk the next fence side, lay the next row of tiles.
import type { GeoScene } from '../../geometry/geo-scene-types';
import { renderMeasurementPrompt } from '../../measurement/measurement-strings';
import { createAreaFormulaView } from './workshop-area-formula-view';
import { createFenceView, type FenceView } from './workshop-fence-view';
import {
  createBalanceView,
  createJugView,
  createThermometersView,
} from './workshop-instruments-view';
import type { WorkshopRound } from './workshop-round-plan';
import { createRulerView } from './workshop-ruler-view';
import type { WorkshopStrings } from './workshop-strings';
import type { WorkshopTileGrid } from './workshop-tile-grid';
import { tileTargets } from './workshop-tile-grid';
import { createTileGridView, type TileGridView } from './workshop-tile-grid-view';

export interface WorkshopBoard {
  readonly element: HTMLElement;
  readonly fence: FenceView | null;
  readonly tiles: TileGridView | null;
  walkNext(): void;
  placeRow(): void;
}

const noun = (item: string | number | undefined): string =>
  typeof item === 'string' ? renderMeasurementPrompt({ key: 'nounOpt', params: { item } }) : '';

function sceneView(
  round: WorkshopRound,
  ws: WorkshopStrings,
  onTiles: (grids: readonly WorkshopTileGrid[]) => void,
): { element: HTMLElement; fence: FenceView | null; tiles: TileGridView | null } {
  const scene: GeoScene = round.item.scene;
  const story = round.item.story.params ?? {};
  const none = { fence: null, tiles: null };
  switch (scene.kind) {
    case 'ruler':
      return {
        element: createRulerView(scene, round.tier, noun(story.item ?? story.y), ws),
        ...none,
      };
    case 'balance':
      return { element: createBalanceView(scene, noun(scene.item), ws), ...none };
    case 'jug':
      return { element: createJugView(scene, ws), ...none };
    case 'thermometers':
      return { element: createThermometersView(scene, ws), ...none };
    default:
      break;
  }
  if (round.station === 'fence') {
    const fence = createFenceView(scene, ws);
    return { element: fence.element, fence, tiles: null };
  }
  const targets = round.tiling ? tileTargets(scene, round.tier) : null;
  if (targets) {
    const tiles = createTileGridView(scene, targets, ws, onTiles);
    return { element: tiles.element, fence: null, tiles };
  }
  return { element: createAreaFormulaView(scene, ws), ...none };
}

export function createWorkshopBoard(
  round: WorkshopRound,
  ws: WorkshopStrings,
  onTiles: (grids: readonly WorkshopTileGrid[]) => void,
): WorkshopBoard {
  const view = sceneView(round, ws, onTiles);
  const element = document.createElement('div');
  element.className = `workshop-board workshop-board--${round.station}`;
  element.dataset.station = round.station;
  element.append(view.element);
  return {
    element,
    fence: view.fence,
    tiles: view.tiles,
    walkNext: () => view.fence?.walkNext(),
    placeRow: () => view.tiles?.placeRow(),
  };
}
