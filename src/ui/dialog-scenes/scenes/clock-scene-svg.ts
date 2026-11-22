// Clock picture (phase 17): one SVG per clock, Arabic or Roman numerals from the
// same face; the minute ticks stay visible at phone size (the face is 160 px
// across in viewBox units — the phase-17 risk countermove). An elapsed item
// draws the end clock right of the start clock.
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import { romanFor } from '../../../time/time-ranges';
import type { ClockScene } from '../../../time/time-scene-types';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

const R = 80;
const CX = 100;
const CY = 100;

/** Clock hand from the centre: angle 0 is 12 o'clock, clockwise. */
function hand(cx: number, cy: number, angleDeg: number, length: number, cls: string): SVGElement {
  const a = (angleDeg * Math.PI) / 180;
  return svgEl('line', {
    x1: cx,
    y1: cy,
    x2: cx + length * Math.sin(a),
    y2: cy - length * Math.cos(a),
    class: cls,
  });
}

function renderFace(cx: number, cy: number, h: number, m: number, roman: boolean): SVGElement[] {
  const parts: SVGElement[] = [svgEl('circle', { cx, cy, r: R, class: 'ds-circle' })];
  for (let i = 0; i < 60; i++) {
    const a = (i * 6 * Math.PI) / 180;
    const outer = R - 2;
    const inner = i % 5 === 0 ? R - 14 : R - 7;
    parts.push(
      svgEl('line', {
        x1: cx + inner * Math.sin(a),
        y1: cy - inner * Math.cos(a),
        x2: cx + outer * Math.sin(a),
        y2: cy - outer * Math.cos(a),
        class: i % 5 === 0 ? 'ds-clock-tick' : 'ds-clock-tick-min',
      }),
    );
  }
  for (let hour = 1; hour <= 12; hour++) {
    // Clock positions: 12 o'clock is up, clockwise — not polar()'s y-up angles.
    const a = (hour * 30 * Math.PI) / 180;
    const x = cx + (R - 28) * Math.sin(a);
    const y = cy - (R - 28) * Math.cos(a);
    parts.push(dsLabel(x, y, roman ? romanFor(hour) : String(hour)));
  }
  const hourAngle = ((h % 12) + m / 60) * 30;
  parts.push(
    hand(cx, cy, hourAngle, 46, 'ds-clock-hour'),
    hand(cx, cy, m * 6, 66, 'ds-clock-minute'),
    svgEl('circle', { cx, cy, r: 5, class: 'ds-point' }),
  );
  return parts;
}

function renderClock(scene: ClockScene): SVGElement {
  const two = scene.endH !== undefined && scene.endM !== undefined;
  const width = two ? 420 : 200;
  const svg = sceneRoot(width, 200, two ? 'Hai đồng hồ' : 'Đồng hồ');
  svg.append(...renderFace(CX, CY, scene.h, scene.m, scene.roman === true));
  if (two) {
    const arrow = dsLabel(210, 100, '→');
    svg.append(arrow);
    svg.append(
      ...renderFace(320, CY, scene.endH as number, scene.endM as number, scene.roman === true),
    );
  }
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['clock'],
  render(scene) {
    return renderClock(scene as ClockScene);
  },
};
