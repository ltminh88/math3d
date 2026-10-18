// Draws the minimap or the full world map onto a prepared 2D context (original `Ql`).
import { isRegionUnlocked } from '../config/regions';
import type { MapDrawState } from './map-draw-state';
import { drawMapScreenLayer } from './map-render-screen-layer';
import { drawMapWorldLayer } from './map-render-world-layer';
import type { MapView } from './map-view-transform';

export type { MapDrawState, RegionUnlockPredicate } from './map-draw-state';

/** Paints the whole map for `view` into a `width` x `height` CSS-pixel canvas. */
export function drawMap(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  view: MapView,
  state: MapDrawState,
): void {
  const isUnlocked = state.isUnlocked ?? isRegionUnlocked;
  const scale = view.scale;
  const background = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.max(width, height) * 0.75,
  );
  background.addColorStop(0, '#86bf62');
  background.addColorStop(1, '#5f9a4e');
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);
  ctx.save();
  ctx.translate(width / 2, height / 2);
  ctx.rotate(view.rotation);
  ctx.scale(scale, scale);
  ctx.translate(-view.cx, -view.cz);
  drawMapWorldLayer(ctx, state, isUnlocked);
  ctx.restore();
  drawMapScreenLayer(ctx, width, height, view, state, isUnlocked);
}
