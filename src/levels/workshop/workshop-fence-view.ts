// Fence board (chu vi): the garden outline with its side labels; each side is a button (a wide
// invisible hit stroke, so a finger finds it) and "Đi tiếp" walks the next side. Walked sides
// light up and the walk is written as a sum the child finishes. A wall side has no fence.
import type { GeoScene } from '../../geometry/geo-scene-types';
import { createUiButton } from '../../ui/kit/ui-button';
import { fenceSides, WorkshopFenceWalk } from './workshop-fence-walk';
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

export interface FenceView {
  readonly element: HTMLElement;
  readonly walk: WorkshopFenceWalk;
  walkNext(): void;
}

export function sideText(scene: GeoScene, length: number, known: boolean): string {
  const unit = scene.kind === 'rect' ? scene.unit : 'cm';
  return known ? `${length} ${unit}` : '?';
}

export function createFenceView(scene: GeoScene, ws: WorkshopStrings): FenceView {
  const element = document.createElement('div');
  element.className = 'workshop-fence';
  const outline = shapeOutline(scene);
  const svg = svgRoot(outline.width, outline.height, ws('board'));
  svg.append(outlinePolygon(outline, 'ws-garden'));
  const walk = new WorkshopFenceWalk(fenceSides(scene));
  const line = document.createElement('p');
  line.className = 'workshop-walk';
  line.setAttribute('aria-live', 'polite');
  const sides: SVGGElement[] = [];

  const render = (): void => {
    walk.sides.forEach((_, i) => {
      sides[i]?.classList.toggle('walked', walk.walked.includes(i));
    });
    line.textContent = walk.complete
      ? `${ws('walked', { expr: walk.expression() })} · ${ws('walkDone')}`
      : walk.walked.length > 0
        ? ws('walked', { expr: walk.expression() })
        : ws('walkedNone');
    nextButton.disabled = walk.complete;
    element.dataset.walked = walk.walked.join(',');
  };

  walk.sides.forEach((side, i) => {
    const c = outline.corners;
    const [a, b] = [c[i] as Pt, c[(i + 1) % c.length] as Pt];
    const seg = { x1: a[0], y1: a[1], x2: b[0], y2: b[1] };
    const g = svgEl('g', { class: side.wall ? 'ws-side ws-wall' : 'ws-side', 'data-side': i });
    g.append(svgEl('line', { ...seg, class: 'ws-side__line' }));
    const text = side.wall ? ws('wall') : sideText(scene, side.length, side.known);
    if (!side.wall) {
      g.prepend(svgEl('line', { ...seg, class: 'ws-side__hit' }));
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      g.setAttribute('aria-label', side.known ? ws('side', { len: text }) : ws('sideUnknown'));
      const go = () => {
        if (walk.walk(i)) render();
      };
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        e.preventDefault();
        go();
      });
    }
    g.append(label(sideLabelPoint(outline, i), text));
    sides.push(g);
    svg.append(g);
  });
  if (scene.kind === 'rect' && scene.gate) {
    const c = outline.corners;
    const [bl, br] = [c[3] as Pt, c[2] as Pt];
    const mid = (bl[0] + br[0]) / 2;
    svg.append(
      svgEl('rect', { x: mid - 14, y: bl[1] - 4, width: 28, height: 8, class: 'ws-gate' }),
      label([mid, bl[1] - 16], ws('gate', { g: scene.gate }), 'ws-label ws-label--small'),
    );
  }

  const nextButton = createUiButton({
    label: `${ws('walkNext')} →`,
    variant: 'secondary',
    onClick: () => view.walkNext(),
  });
  nextButton.classList.add('secondary', 'workshop-walk-next');
  element.append(svg, line, nextButton);
  const view: FenceView = {
    element,
    walk,
    walkNext() {
      if (walk.walkNext() >= 0) render();
    },
  };
  render();
  return view;
}
