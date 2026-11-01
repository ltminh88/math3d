// Instrument boards: the level balance (items left, gram weights right), the jug with equal marks
// and its water, and thermometers (zoomed to 0-50 °C, the book's air temperatures) with a red
// column, a tick every `minorStep` degrees and a number every 10.
import type { GeoScene } from '../../geometry/geo-scene-types';
import { label, svgEl, svgRoot } from './workshop-shape-svg';
import type { WorkshopStrings } from './workshop-strings';

type Of<K extends GeoScene['kind']> = Extract<GeoScene, { kind: K }>;

const wrap = (className: string, svg: SVGSVGElement): HTMLElement => {
  const element = document.createElement('div');
  element.className = className;
  element.append(svg);
  return element;
};

export function createBalanceView(
  scene: Of<'balance'>,
  itemName: string,
  ws: WorkshopStrings,
): HTMLElement {
  const svg = svgRoot(320, 190, ws('board'));
  svg.append(
    svgEl('path', { d: 'M150,180h20l-6,-120h-8z', class: 'ws-metal' }),
    svgEl('rect', { x: 30, y: 52, width: 260, height: 8, rx: 4, class: 'ws-metal' }),
    svgEl('path', { d: 'M20,128h100l-12,20h-76z', class: 'ws-pan' }),
    svgEl('path', { d: 'M200,128h100l-12,20h-76z', class: 'ws-pan' }),
    svgEl('path', { d: 'M70,60v68M250,60v68', class: 'ws-string' }),
  );
  const n = scene.count;
  for (let i = 0; i < n; i++) {
    const cx = 70 + (i - (n - 1) / 2) * Math.min(22, 80 / n);
    svg.append(svgEl('circle', { cx, cy: 114, r: 12, class: 'ws-goods' }));
  }
  svg.append(label([70, 168], n > 1 ? `${n} × ${itemName}` : itemName, 'ws-label ws-label--small'));
  const weights = scene.weights;
  weights.forEach((g, i) => {
    const w = 18 + Math.min(g, 50) * 0.32;
    const cx = 250 + (i - (weights.length - 1) / 2) * Math.min(34, 92 / weights.length);
    svg.append(
      svgEl('path', {
        d: `M${cx - w / 2},127h${w}l-4,-${w}h-${w - 8}z`,
        class: 'ws-weight',
      }),
      label([cx, 127 - w / 2], `${g}g`, 'ws-label ws-label--weight'),
    );
  });
  svg.append(label([250, 168], ws('weights'), 'ws-label ws-label--small'));
  return wrap('workshop-balance', svg);
}

export function createJugView(scene: Of<'jug'>, ws: WorkshopStrings): HTMLElement {
  const svg = svgRoot(220, 230, ws('board'));
  const [top, bottom, left, right] = [30, 210, 60, 160];
  const step = (bottom - top) / scene.marks;
  const water = bottom - scene.level * step;
  svg.append(
    svgEl('rect', {
      x: left,
      y: water,
      width: right - left,
      height: bottom - water,
      class: 'ws-water',
    }),
    svgEl('path', {
      d: `M${left},${top - 12}v${bottom - top + 12}h${right - left}v-${bottom - top + 12}`,
      class: 'ws-glass',
    }),
    svgEl('path', { d: `M${right},${top + 10}q34,10 0,60`, class: 'ws-glass' }),
  );
  let d = '';
  for (let m = 1; m <= scene.marks; m++) d += `M${left},${bottom - m * step}h22`;
  svg.append(svgEl('path', { d, class: 'ws-marks' }));
  svg.append(
    label([left - 26, top], `${scene.capacity} ml`, 'ws-label ws-label--small'),
    label([left - 14, bottom], '0', 'ws-label ws-label--small'),
  );
  return wrap('workshop-jug', svg);
}

const T_MAX = 50;

export function createThermometersView(
  scene: Of<'thermometers'>,
  ws: WorkshopStrings,
): HTMLElement {
  const n = scene.readings.length;
  const width = Math.max(150, n * 100);
  const svg = svgRoot(width, 260, ws('board'));
  const [top, bottom] = [20, 214];
  const y = (t: number) => bottom - (t / T_MAX) * (bottom - top);
  scene.readings.forEach((r, i) => {
    const cx = width / (2 * n) + (i * width) / n;
    svg.append(
      svgEl('rect', {
        x: cx - 9,
        y: top - 6,
        width: 18,
        height: bottom - top + 12,
        rx: 9,
        class: 'ws-tube',
      }),
      svgEl('circle', { cx, cy: bottom + 14, r: 13, class: 'ws-bulb' }),
      svgEl('rect', {
        x: cx - 4,
        y: y(r.value),
        width: 8,
        height: bottom - y(r.value) + 8,
        class: 'ws-mercury',
      }),
    );
    let d = '';
    for (let t = 0; t <= T_MAX; t += scene.minorStep)
      d += `M${cx + 10},${y(t)}h${t % 10 === 0 ? 12 : 6}`;
    svg.append(svgEl('path', { d, class: 'ws-ticks ws-ticks--thin' }));
    for (let t = 0; t <= T_MAX; t += 10)
      svg.append(label([cx - 22, y(t)], String(t), 'ws-label ws-label--small'));
    svg.append(label([cx, 252], r.label, 'ws-label'));
  });
  svg.append(label([width - 16, top], '°C', 'ws-label ws-label--small'));
  return wrap('workshop-thermometers', svg);
}
