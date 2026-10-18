// World-space pass of the map draw (bundle lines 1765-1855): decor, banks, river, roads,
// bridge, region footprints and village houses. Caller owns save/transform/restore.
import { REGIONS } from '../config/regions';
import { ROADS } from '../config/roads';
import { WALKABLE_BOUNDS as BOUNDS, BRIDGE_SEGMENTS, RIVER } from '../config/world-constants';
import { getGroundTuftDecor, getOuterBushDecor, type MapDecorBlob } from './map-decor';
import { type MapDrawState, type RegionUnlockPredicate, roundedRectPath } from './map-draw-state';

const SELECTED_STROKE = '#f3b53d';
const VILLAGE_HOUSES: readonly MapDecorBlob[] = [
  [-12, -6, 2.4],
  [-17, 6, 1.8],
  [-4, -11, 2],
  [-15, -14, 1.6],
];

function drawBlobs(
  ctx: CanvasRenderingContext2D,
  blobs: readonly MapDecorBlob[],
  shade: string,
  fill: string,
  offset: readonly [number, number],
): void {
  for (const [x, z, r] of blobs) {
    ctx.fillStyle = shade;
    ctx.beginPath();
    ctx.arc(x + offset[0], z + offset[1], r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = fill;
    ctx.beginPath();
    ctx.arc(x, z, r, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawTerrain(ctx: CanvasRenderingContext2D): void {
  drawBlobs(ctx, getOuterBushDecor(), '#4f8a45', '#65a353', [0.3, 0.4]);
  ctx.fillStyle = '#9ed072';
  roundedRectPath(ctx, BOUNDS.west.minX, BOUNDS.minZ, BOUNDS.west.maxX, BOUNDS.maxZ, 10);
  ctx.fill();
  roundedRectPath(ctx, BOUNDS.east.minX, BOUNDS.minZ, BOUNDS.east.maxX, BOUNDS.maxZ, 10);
  ctx.fill();
  const riverWidth = RIVER.riverMax - RIVER.riverMin;
  ctx.fillStyle = '#e3d3a4';
  ctx.fillRect(
    RIVER.riverMin - 0.9,
    BOUNDS.minZ - 400,
    riverWidth + 1.8,
    BOUNDS.maxZ - BOUNDS.minZ + 800,
  );
  ctx.fillStyle = '#5cc0d3';
  ctx.fillRect(RIVER.riverMin, BOUNDS.minZ - 400, riverWidth, BOUNDS.maxZ - BOUNDS.minZ + 800);
  ctx.fillStyle = '#6fcbe0';
  ctx.beginPath();
  ctx.arc(-38, -11, 4.6, 0, Math.PI * 2);
  ctx.fill();
  drawBlobs(ctx, getGroundTuftDecor(), '#6fae5a', '#86c46a', [0.25, 0.35]);
}

function drawRoadsAndBridge(ctx: CanvasRenderingContext2D, bridge: number): void {
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#f1e2b8';
  ctx.lineWidth = 2.6;
  for (const road of ROADS) {
    ctx.beginPath();
    for (const [x, z] of road) {
      ctx.lineTo(x, z);
    }
    ctx.stroke();
  }
  const built = bridge / BRIDGE_SEGMENTS;
  ctx.fillStyle = '#d9c9a0';
  ctx.fillRect(RIVER.riverMin, -1.7, (RIVER.riverMax - RIVER.riverMin) * built, 3.4);
  if (built < 1) {
    ctx.setLineDash([0.8, 0.8]);
    ctx.strokeStyle = '#fffbea';
    ctx.lineWidth = 0.35;
    ctx.strokeRect(RIVER.riverMin, -1.7, RIVER.riverMax - RIVER.riverMin, 3.4);
    ctx.setLineDash([]);
  }
}

function drawRegionFootprints(
  ctx: CanvasRenderingContext2D,
  state: MapDrawState,
  isUnlocked: RegionUnlockPredicate,
): void {
  for (const region of REGIONS) {
    if (region.id === 'village') {
      continue;
    }
    const open = isUnlocked(region, state.questComplete);
    const [x, z] = region.center;
    const [w, d] = region.size;
    ctx.globalAlpha = open ? 0.85 : 0.45;
    ctx.fillStyle = open ? region.color : '#c9cfbf';
    roundedRectPath(ctx, x - w / 2, z - d / 2, x + w / 2, z + d / 2, 2.5);
    ctx.fill();
    ctx.globalAlpha = 1;
    if (!open) {
      ctx.setLineDash([1, 1]);
      ctx.strokeStyle = '#7d8a74';
      ctx.lineWidth = 0.3;
      ctx.stroke();
      ctx.setLineDash([]);
    }
    if (state.selected === region.id) {
      ctx.strokeStyle = SELECTED_STROKE;
      ctx.lineWidth = 0.9;
      roundedRectPath(ctx, x - w / 2 - 0.8, z - d / 2 - 0.8, x + w / 2 + 0.8, z + d / 2 + 0.8, 3);
      ctx.stroke();
    }
  }
}

function drawVillage(ctx: CanvasRenderingContext2D, selected: string | undefined): void {
  ctx.fillStyle = '#e39a67';
  for (const [x, z, r] of VILLAGE_HOUSES) {
    roundedRectPath(ctx, x - r, z - r, x + r, z + r, 0.6);
    ctx.fill();
  }
  if (selected === 'village') {
    ctx.strokeStyle = SELECTED_STROKE;
    ctx.lineWidth = 0.9;
    roundedRectPath(ctx, -30, -20, 4, 20, 3);
    ctx.stroke();
  }
}

/** Draws everything that lives in world units, in the original paint order. */
export function drawMapWorldLayer(
  ctx: CanvasRenderingContext2D,
  state: MapDrawState,
  isUnlocked: RegionUnlockPredicate,
): void {
  drawTerrain(ctx);
  drawRoadsAndBridge(ctx, state.bridge);
  drawRegionFootprints(ctx, state, isUnlocked);
  drawVillage(ctx, state.selected);
}
