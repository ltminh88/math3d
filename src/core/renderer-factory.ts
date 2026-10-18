import { WebGLRenderer } from 'three';
import type { QualityTier } from './quality/quality-tiers';

/** Create the renderer inside `host`. Antialias comes from the tier (fixed at creation). */
export function createRenderer(host: HTMLElement, tier: QualityTier): WebGLRenderer {
  const renderer = new WebGLRenderer({
    antialias: tier.antialias,
    powerPreference: 'high-performance',
  });
  host.appendChild(renderer.domElement);
  applyPixelRatio(renderer, tier);
  resizeRenderer(renderer, host);
  return renderer;
}

export function applyPixelRatio(renderer: WebGLRenderer, tier: QualityTier): void {
  const device =
    typeof devicePixelRatio === 'number' && devicePixelRatio > 0 ? devicePixelRatio : 1;
  renderer.setPixelRatio(Math.min(device, tier.pixelRatioCap));
}

/** Match the drawing buffer to the host element; CSS keeps the canvas at 100%. Returns the size. */
export function resizeRenderer(
  renderer: WebGLRenderer,
  host: HTMLElement,
): { width: number; height: number } {
  const width = Math.max(1, host.clientWidth);
  const height = Math.max(1, host.clientHeight);
  renderer.setSize(width, height, false);
  return { width, height };
}
