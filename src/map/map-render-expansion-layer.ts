// Chapter 2 pass of the map draw: expansion roads and footprints (world space) and their icons /
// name pills (screen space), in the recovered style. Runs only when the draw state carries
// `expansion`, so the original draw (golden-compared in map-render.parity.test.ts) is untouched.
// Every style is set explicitly and restored: the original screen layer's first glyph inherits
// the previous fill style (preserved quirk), which this pass must never change.
import { isAreaUnlocked } from '../config/expansion-region-lookup';
import { EXPANSION_REGIONS } from '../config/expansion-regions';
import { EXPANSION_ROADS } from '../config/expansion-roads';
import type { MapDrawState } from './map-draw-state';
import { roundedRectPath } from './map-draw-state';

const SELECTED_STROKE = '#f3b53d';
const LABEL_TEXT_COLOR = '#194f42';

/** World-space pass, inside the world transform (after the original world layer). */
export function drawExpansionWorldLayer(ctx: CanvasRenderingContext2D, state: MapDrawState): void {
  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.strokeStyle = '#f1e2b8';
  ctx.lineWidth = 2.6;
  for (const road of EXPANSION_ROADS) {
    ctx.beginPath();
    for (const [x, z] of road) ctx.lineTo(x, z);
    ctx.stroke();
  }
  for (const region of EXPANSION_REGIONS) {
    const open = isAreaUnlocked(region, state.questComplete);
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
  ctx.restore();
}

/** Screen-space pass: icon (or lock) and, on the full map, the name pill of each region. */
export function drawExpansionLabels(
  ctx: CanvasRenderingContext2D,
  state: MapDrawState,
  scale: number,
  toScreen: (x: number, z: number) => { x: number; y: number },
): void {
  const expansion = state.expansion;
  if (!expansion) return;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const region of EXPANSION_REGIONS) {
    const open = isAreaUnlocked(region, state.questComplete);
    const at = toScreen(region.center[0], region.center[1]);
    const iconSize = state.labels ? 26 : scale > 2.2 ? 20 : 15;
    ctx.globalAlpha = open ? 1 : 0.7;
    ctx.fillStyle = LABEL_TEXT_COLOR;
    ctx.font = `${iconSize}px sans-serif`;
    ctx.fillText(open ? region.icon : '🔒', at.x, at.y - (state.labels ? 10 : 0));
    if (state.labels) {
      ctx.font = '800 14px Nunito, "Trebuchet MS", sans-serif';
      const name = expansion.name(region);
      const pillWidth = ctx.measureText(name).width + 18;
      ctx.fillStyle = '#fffbeaee';
      ctx.beginPath();
      ctx.roundRect(at.x - pillWidth / 2, at.y + 8, pillWidth, 24, 12);
      ctx.fill();
      ctx.fillStyle = LABEL_TEXT_COLOR;
      ctx.fillText(name, at.x, at.y + 20.5);
    }
  }
  ctx.restore();
}
