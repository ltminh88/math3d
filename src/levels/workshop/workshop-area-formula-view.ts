// Formula board (diện tích, tier 2+ or a big floor): the rectangle with its labelled sides, a faint
// 1 cm² grid when it is in cm, the cut-off corner square (tấm bìa) and a sample tile. No tapping:
// the child multiplies. Also used to show the rectangle of the fence round at the same scale.
import type { GeoScene } from '../../geometry/geo-scene-types';
import { sideText } from './workshop-fence-view';
import {
  label,
  outlinePolygon,
  type Pt,
  shapeOutline,
  sideLabelPoint,
  svgEl,
  svgRoot,
} from './workshop-shape-svg';
import type { WorkshopStrings } from './workshop-strings';

export function createAreaFormulaView(scene: GeoScene, ws: WorkshopStrings): HTMLElement {
  const element = document.createElement('div');
  element.className = 'workshop-area';
  const outline = shapeOutline(scene);
  const svg = svgRoot(outline.width, outline.height, ws('board'));
  svg.append(outlinePolygon(outline, 'ws-floor'));
  if (scene.kind === 'rect') {
    const [tl, tr, , bl] = outline.corners as Pt[];
    const [x0, y0] = tl as Pt;
    const cw = ((tr as Pt)[0] - x0) / scene.width;
    const ch = ((bl as Pt)[1] - y0) / scene.height;
    // A faint grid of 1 cm² squares (rows and columns), drawn as one path.
    let d = '';
    for (let i = 1; i < scene.width; i++) d += `M${x0 + i * cw},${y0}v${ch * scene.height}`;
    for (let j = 1; j < scene.height; j++) d += `M${x0},${y0 + j * ch}h${cw * scene.width}`;
    if (d) svg.append(svgEl('path', { d, class: 'ws-floor-grid' }));
    if (scene.cut) {
      const s = scene.cut;
      svg.append(
        svgEl('rect', {
          x: x0 + (scene.width - s) * cw,
          y: y0,
          width: s * cw,
          height: s * ch,
          class: 'ws-cut',
        }),
        label(
          [x0 + (scene.width - s / 2) * cw, y0 + (s * ch) / 2],
          `${s} cm`,
          'ws-label ws-label--small',
        ),
      );
    }
    svg.append(svgEl('rect', { x: x0, y: y0, width: cw, height: ch, class: 'ws-sample' }));
    const shown = [scene.showWidth, scene.showHeight];
    for (const i of [0, 3]) {
      const known = shown[i === 0 ? 0 : 1] as boolean;
      const length = i === 0 ? scene.width : scene.height;
      svg.append(label(sideLabelPoint(outline, i), sideText(scene, length, known)));
    }
  }
  const unit = document.createElement('p');
  unit.className = 'workshop-unit';
  unit.textContent = ws('tileUnit');
  element.append(svg, unit);
  return element;
}
