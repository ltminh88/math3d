// Ruler board (thước kẻ): a zoomed 0-10 cm ruler with a number at every centimetre, mm ticks from
// tier 2 (tier 1 reads whole centimetres) and the object lying on it from `fromMm` to `toMm`.
import type { GeoScene } from '../../geometry/geo-scene-types';
import type { SkillTier } from '../../learning/skill-tiers';
import { label, svgEl, svgRoot } from './workshop-shape-svg';
import type { WorkshopStrings } from './workshop-strings';

type Ruler = Extract<GeoScene, { kind: 'ruler' }>;

const MM = 3.2;
const LEFT = 18;
const TOP = 54;

export function createRulerView(
  scene: Ruler,
  tier: SkillTier,
  itemName: string,
  ws: WorkshopStrings,
): HTMLElement {
  const element = document.createElement('div');
  element.className = 'workshop-ruler';
  const total = scene.maxCm * 10;
  const width = LEFT * 2 + total * MM;
  const svg = svgRoot(width, 112, ws('board'));
  const x = (mm: number) => LEFT + mm * MM;
  svg.append(
    svgEl('rect', {
      x: x(scene.fromMm),
      y: 14,
      width: (scene.toMm - scene.fromMm) * MM,
      height: 30,
      rx: 8,
      class: 'ws-object',
    }),
  );
  if ((scene.toMm - scene.fromMm) * MM > itemName.length * 7)
    svg.append(label([x((scene.fromMm + scene.toMm) / 2), 30], itemName, 'ws-label ws-label--on'));
  svg.append(
    svgEl('rect', { x: 4, y: TOP, width: width - 8, height: 54, rx: 6, class: 'ws-ruler' }),
  );
  // All ticks in one path: cm long, 5 mm middle, mm short (tier 2+).
  let d = '';
  for (let mm = 0; mm <= total; mm++) {
    const cm = mm % 10 === 0;
    if (!cm && tier === 1) continue;
    const len = cm ? 20 : mm % 5 === 0 ? 14 : 9;
    d += `M${x(mm)},${TOP}v${len}`;
  }
  svg.append(svgEl('path', { d, class: 'ws-ticks' }));
  for (let cm = 0; cm <= scene.maxCm; cm++)
    svg.append(label([x(cm * 10), TOP + 34], String(cm), 'ws-label ws-label--ruler'));
  svg.append(label([width - 22, TOP + 46], 'cm', 'ws-label ws-label--small'));
  element.append(svg);
  return element;
}
