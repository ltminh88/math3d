// Test builds only (`vite build --mode test`): `window.__city` lets e2e specs read the running
// round and find on-screen points of parcels, house doors and floors for the touch path.
// Installed from the scene behind `import.meta.env.MODE === 'test'`, removed when the level exits.
import { type Camera, Vector3 } from 'three';
import type { CityBuildingView } from './city-building-view';
import { FACADE_Z, floorY, houseZoneCenter } from './city-layout';
import type { CityRoundController } from './city-round-controller';
import type { CityStreetView } from './city-street-view';

export interface CityTestHook {
  state(): {
    index: number;
    kind: string;
    factKey: string;
    table: number;
    other: number;
    product: number;
    houses: number[];
    litFloors: number;
    hintRung: number;
    roundComplete: boolean;
    done: boolean;
  };
  /** Client (CSS px) point of `parcel:i`, `house:i` (in front of the door) or `floor:f`. */
  point(id: string): { x: number; y: number } | null;
}

declare global {
  interface Window {
    __city?: CityTestHook;
  }
}

export function installCityTestHook(
  controller: CityRoundController,
  street: CityStreetView,
  building: CityBuildingView,
  camera: Camera,
  canvas: HTMLCanvasElement,
): () => void {
  const worldOf = (id: string): Vector3 | null => {
    const [kind, raw] = id.split(':');
    const n = Number(raw);
    if (kind === 'house') {
      const c = houseZoneCenter(n);
      return new Vector3(c.x, 0, c.z);
    }
    if (kind === 'floor') return new Vector3(0, floorY(n), FACADE_Z + 0.2);
    const at = kind === 'parcel' ? street.parcelAt(n) : null;
    return at ? new Vector3(at.x, 0.3, at.z) : null;
  };
  window.__city = {
    state: () => {
      const { flow } = controller;
      const round = flow.round;
      return {
        index: flow.index,
        kind: round?.kind ?? 'done',
        factKey: round?.factKey ?? '',
        table: round?.table ?? 0,
        other: round?.other ?? 0,
        product: round?.product ?? 0,
        houses: [...(round?.houses ?? [])],
        litFloors: building.litFloors,
        hintRung: flow.hint.rung,
        roundComplete: flow.roundComplete,
        done: flow.done,
      };
    },
    point(id) {
      const at = worldOf(id);
      if (!at) return null;
      camera.updateMatrixWorld();
      const p = at.project(camera);
      const rect = canvas.getBoundingClientRect();
      return {
        x: rect.left + ((p.x + 1) / 2) * rect.width,
        y: rect.top + ((1 - p.y) / 2) * rect.height,
      };
    },
  };
  return () => {
    delete window.__city;
  };
}
