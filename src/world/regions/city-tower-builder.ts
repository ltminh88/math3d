// Number city (four towers with multiples-of-12 signs, fountain with floating gem, lamp ring)
// and the final math tower (stacked drum, floating crown gem, orbiting "2 × 5 = 10" gems).
import { Group, OctahedronGeometry } from 'three';
import type { WorldBuildContext } from '../world-build-context';
import {
  addBox,
  addCylinder,
  addMesh,
  addRegionGroup,
  addSphere,
  blockAt,
  colorAt,
} from '../world-primitives';
import { addSign } from '../world-text-sign';

const CITY_BUILDING_COLORS: readonly number[] = [0xe9c67e, 0x82b5b0, 0xe59b78, 0x9b9bd0];
const CITY_BUILDINGS: readonly (readonly [x: number, z: number, height: number])[] = [
  [-5, -5, 4],
  [5, -5, 6],
  [-5, 5, 5],
  [5, 5, 3.4],
];
const TOWER_GEM_COLORS: readonly number[] = [0x9ad9f0, 0xf6b3d0, 0xffd774];

function buildCityBuilding(ctx: WorldBuildContext, city: Group, index: number): void {
  const spec = CITY_BUILDINGS[index];
  if (!spec) return;
  const [x, z, height] = spec;
  const building = new Group();
  building.position.set(x, 0, z);
  city.add(building);
  addBox(ctx, building, 0, height / 2, 0, 4.2, height, 3.8, colorAt(CITY_BUILDING_COLORS, index));
  addBox(ctx, building, 0, height + 0.3, 0, 4.5, 0.6, 4.1, 0xf0e2c0);
  const faceZ = z < 0 ? 1.92 : -1.92;
  for (let y = 1; y < height - 0.6; y += 1.3) {
    for (const wx of [-1.2, 0, 1.2]) {
      addBox(ctx, building, wx, y + 0.3, faceZ, 0.6, 0.7, 0.06, 0xfdf6dc);
    }
  }
  addBox(ctx, building, 0, 0.7, z < 0 ? 1.93 : -1.93, 0.9, 1.4, 0.08, 0x634f59);
  const label = String((index + 2) * 12);
  addSign(building, label, 0, height + 1.4, 0, 2.2, '#fffbea', '#3c4f6b', z < 0 ? 0 : Math.PI);
  blockAt(ctx, city, x, z, 2.7);
}

export function buildCity(ctx: WorldBuildContext): void {
  const city = addRegionGroup(ctx, 'city');
  addBox(ctx, city, 0, 0.04, 0, 18, 0.08, 18, 0xbac8b6);
  addBox(ctx, city, 0, 0.07, 0, 18, 0.06, 2.6, 0x8d948f);
  addBox(ctx, city, 0, 0.071, 0, 2.6, 0.06, 18, 0x8d948f);
  for (let i = 0; i < CITY_BUILDINGS.length; i++) buildCityBuilding(ctx, city, i);
  const basin = addCylinder(ctx, city, 0, 0.12, 0, 2.4, 2.4, 0.18, 0xe7d09b, 20);
  basin.castShadow = false;
  addCylinder(ctx, city, 0, 0.6, 0, 0.5, 0.7, 0.9, 0xd8c7a0, 12);
  const gem = addSphere(ctx, city, 0, 1.3, 0, 0.35, 0x7fd0e0);
  ctx.floaters.push({ object: gem, baseY: 1.3, speed: 2, spin: 0 });
  blockAt(ctx, city, 0, 0, 1);
  for (let i = 0; i < 8; i++) {
    const angle = (i * Math.PI) / 4 + Math.PI / 8;
    addCylinder(
      ctx,
      city,
      Math.cos(angle) * 8,
      1.2,
      Math.sin(angle) * 8,
      0.07,
      0.09,
      2.4,
      0x4a5a5a,
    );
    addSphere(ctx, city, Math.cos(angle) * 8, 2.5, Math.sin(angle) * 8, 0.22, 0xffe7a0);
  }
}

export function buildTower(ctx: WorldBuildContext): void {
  const tower = addRegionGroup(ctx, 'tower');
  const plinth = addCylinder(ctx, tower, 0, 0.06, 0, 6.6, 7, 0.12, 0xa7c97a, 20);
  plinth.castShadow = false;
  addCylinder(ctx, tower, 0, 0.14, 0, 4.4, 4.6, 0.16, 0xd8c494, 14).castShadow = false;
  addCylinder(ctx, tower, 0, 4.9, 0, 2.3, 2.9, 8, 0x7773a8, 10);
  for (let i = 0; i < 3; i++) {
    const ringRadius = 2.95 - i * 0.2;
    addCylinder(ctx, tower, 0, 2.4 + i * 2.4, 0, ringRadius, ringRadius, 0.25, 0xf0e2c0, 10);
  }
  addCylinder(ctx, tower, 0, 9.6, 0, 3.4, 0, 2, 0xf0c45d, 10);
  const crown = addSphere(ctx, tower, 0, 11.6, 0, 0.6, 0xffdc73);
  ctx.floaters.push({ object: crown, baseY: 11.6, speed: 1.4, spin: 1 });
  addBox(ctx, tower, 0, 1.6, 2.72, 1.3, 2, 0.2, 0x4b3f6b);
  addSign(tower, '× ÷ + −', 0, 7.4, 2.62, 3.2, '#fffbea', '#4b3f6b');
  blockAt(ctx, tower, 0, 0, 3.4);
  ['2', '×', '5', '=', '10'].forEach((symbol, i) => {
    const angle = (i / 5) * Math.PI * 2;
    const orbit = new Group();
    orbit.position.set(Math.cos(angle) * 5.4, 2.2, Math.sin(angle) * 5.4);
    const gem = addMesh(
      ctx,
      orbit,
      new OctahedronGeometry(0.45),
      colorAt(TOWER_GEM_COLORS, i % 3),
      0,
      0,
      0,
    );
    gem.scale.y = 1.5;
    addSign(orbit, symbol, 0, 1.2, 0, 1.1, '#ffffffdd', '#4b3f6b');
    tower.add(orbit);
    ctx.floaters.push({ object: orbit, baseY: 2.2, speed: 1.2 + i * 0.15, spin: 0.6 });
  });
}
