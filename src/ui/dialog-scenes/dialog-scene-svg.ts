// Shared drawing helpers for the dialog scene renderers (phase 04). Pure element
// factories: `document` is only touched inside the functions, never at import time,
// so the registry map stays testable in node. The workshop strings are instantiated
// once here (re-registering the namespace only warns in DEV).
import { defineStrings } from '../../i18n/i18n';
import { svgEl } from '../../levels/workshop/workshop-shape-svg';
import { workshopStrings } from '../../levels/workshop/workshop-strings';

export const ws = workshopStrings(defineStrings);

/** The svg root of a dialog picture: class `dialog-scene` is what the e2e spec asserts. */
export function sceneRoot(width: number, height: number, label: string): SVGSVGElement {
  return svgEl('svg', {
    viewBox: `0 0 ${width} ${height}`,
    class: 'dialog-scene',
    role: 'img',
    'aria-label': label,
  });
}

/** A text label; its font comes from `.ds-label` in dialog-scene.css (≥14 px). */
export function dsLabel(
  x: number,
  y: number,
  text: string,
  anchor: 'middle' | 'start' | 'end' = 'middle',
): SVGTextElement {
  return svgEl(
    'text',
    { x, y, class: 'ds-label', 'text-anchor': anchor, 'dominant-baseline': 'middle' },
    text,
  );
}

/**
 * Point on a circle: angleDeg 0 is east, degrees grow counter-clockwise (the scene
 * data is y-up, the screen is y-down).
 */
export function polar(
  cx: number,
  cy: number,
  r: number,
  angleDeg: number,
): readonly [number, number] {
  const a = (angleDeg * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)];
}

/** The svg a workshop view built, re-classed for the dialog (its wrapper div is dropped). */
export function workshopSvg(view: HTMLElement): SVGSVGElement | null {
  const svg = view.querySelector('svg');
  if (!svg) return null;
  svg.classList.add('dialog-scene');
  return svg;
}
