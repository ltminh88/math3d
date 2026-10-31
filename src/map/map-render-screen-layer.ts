// Screen-space pass of the map draw (bundle lines 1857-1912): region icons/lock glyphs, name
// pills, VLM marker and the pulsing player arrow. Runs after the world transform is restored.
import { REGIONS } from '../config/regions';
import type { MapDrawState, RegionUnlockPredicate } from './map-draw-state';
import { drawExpansionLabels } from './map-render-expansion-layer';
import type { MapView } from './map-view-transform';

const LABEL_TEXT_COLOR = '#194f42';

type ToScreen = (x: number, z: number) => { x: number; y: number };

function createToScreen(width: number, height: number, view: MapView): ToScreen {
  return (x, z) => {
    const px = (x - view.cx) * view.scale;
    const pz = (z - view.cz) * view.scale;
    const cos = Math.cos(view.rotation);
    const sin = Math.sin(view.rotation);
    return { x: width / 2 + px * cos - pz * sin, y: height / 2 + px * sin + pz * cos };
  };
}

function drawRegionLabels(
  ctx: CanvasRenderingContext2D,
  state: MapDrawState,
  scale: number,
  toScreen: ToScreen,
  isUnlocked: RegionUnlockPredicate,
): void {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const region of REGIONS) {
    const open = isUnlocked(region, state.questComplete);
    const at = toScreen(region.center[0], region.center[1]);
    const iconSize = state.labels ? 26 : scale > 2.2 ? 20 : 15;
    ctx.globalAlpha = open ? 1 : 0.7;
    ctx.font = `${iconSize}px sans-serif`;
    // Fill style is inherited from the previous draw on purpose (original behaviour).
    ctx.fillText(open ? region.icon : '🔒', at.x, at.y - (state.labels ? 10 : 0));
    if (state.labels) {
      ctx.font = '800 14px Nunito, "Trebuchet MS", sans-serif';
      const name = state.translate(region.name);
      const pillWidth = ctx.measureText(name).width + 18;
      ctx.fillStyle = '#fffbeaee';
      ctx.beginPath();
      ctx.roundRect(at.x - pillWidth / 2, at.y + 8, pillWidth, 24, 12);
      ctx.fill();
      ctx.fillStyle = LABEL_TEXT_COLOR;
      ctx.fillText(name, at.x, at.y + 20.5);
    }
    ctx.globalAlpha = 1;
  }
}

function drawMiloMarker(
  ctx: CanvasRenderingContext2D,
  state: MapDrawState,
  toScreen: ToScreen,
): void {
  const at = toScreen(state.milo.x, state.milo.z);
  const radius = state.labels ? 9 : 6;
  ctx.fillStyle = '#f4c755';
  ctx.strokeStyle = '#fff9e6';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(at.x, at.y, radius, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = '#6e531a';
  ctx.font = `900 ${radius * 1.4}px Nunito, sans-serif`;
  ctx.fillText('!', at.x, at.y + 0.5);
}

function drawPlayerMarker(
  ctx: CanvasRenderingContext2D,
  state: MapDrawState,
  view: MapView,
  toScreen: ToScreen,
): void {
  const at = toScreen(state.player.x, state.player.z);
  const size = state.labels ? 13 : 10;
  const pulse = 1 + Math.sin(state.time * 3) * 0.15;
  ctx.fillStyle = '#ffffff55';
  ctx.beginPath();
  ctx.arc(at.x, at.y, size * 1.6 * pulse, 0, Math.PI * 2);
  ctx.fill();
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(view.rotation - state.player.facing + Math.PI);
  ctx.fillStyle = '#e8562f';
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, -size);
  ctx.lineTo(size * 0.72, size * 0.75);
  ctx.lineTo(0, size * 0.38);
  ctx.lineTo(-size * 0.72, size * 0.75);
  ctx.closePath();
  ctx.stroke();
  ctx.fill();
  ctx.restore();
}

/** Draws labels and markers in CSS pixels, in the original paint order. */
export function drawMapScreenLayer(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  view: MapView,
  state: MapDrawState,
  isUnlocked: RegionUnlockPredicate,
): void {
  const toScreen = createToScreen(width, height, view);
  drawRegionLabels(ctx, state, view.scale, toScreen, isUnlocked);
  drawExpansionLabels(ctx, state, view.scale, toScreen);
  drawMiloMarker(ctx, state, toScreen);
  drawPlayerMarker(ctx, state, view, toScreen);
}
