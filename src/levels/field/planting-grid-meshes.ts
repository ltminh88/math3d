// Meshes of the planting plot: soil base, instanced mounds / plant stems / flower heads (one draw
// call each for up to 40 cells), instanced row stakes with lantern tips, and the seedling basket.
import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Mesh,
} from 'three';
import { FIELD_COLORS as C, type MaterialCache, shade } from './field-materials';

/** Largest plot: tables 3 and 4 x up to 10. */
export const MAX_CELLS = 40;
export const MAX_ROWS = 10;
/** Cell pitch in world units. */
export const CELL = 0.95;

export function createPlotGroups(): { group: Group; plot: Group } {
  const group = new Group();
  group.name = 'planting-grid';
  const plot = new Group();
  group.add(plot);
  return { group, plot };
}

export function createPlotMeshes(mat: MaterialCache) {
  const base = shade(new Mesh(new BoxGeometry(1, 0.12, 1), mat(C.plotBase)));
  base.position.y = 0.1;
  const instanced = (geometry: CylinderGeometry | IcosahedronGeometry, color: number, n: number) =>
    shade(new InstancedMesh(geometry, mat(color), n));
  const basket = new Group();
  basket.name = 'seedling-basket';
  const tub = shade(new Mesh(new CylinderGeometry(0.5, 0.38, 0.42, 8), mat(C.soilLight)));
  tub.position.y = 0.21;
  const greens = shade(new Mesh(new IcosahedronGeometry(0.4, 1), mat(C.sprout)));
  greens.position.y = 0.5;
  greens.scale.y = 0.6;
  basket.add(tub, greens);
  return {
    base,
    mounds: instanced(new CylinderGeometry(0.36, 0.43, 0.16, 7), 0xffffff, MAX_CELLS),
    stems: instanced(new CylinderGeometry(0.06, 0.08, 0.42, 6), C.stem, MAX_CELLS),
    heads: instanced(new IcosahedronGeometry(0.24, 1), 0xffffff, MAX_CELLS),
    stakes: instanced(new CylinderGeometry(0.09, 0.12, 0.9, 6), C.wood, MAX_ROWS),
    tips: instanced(new IcosahedronGeometry(0.16, 1), C.lantern, MAX_ROWS),
    basket,
  };
}
