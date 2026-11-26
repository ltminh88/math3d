// Length-ladder picture (boost, Phase 2B): the units m -> dm -> cm -> mm as
// four steps down a staircase, with x10 / :10 arrows between them. The
// highlighted pair (the conversion the item asks about) is filled gold.
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { LengthScene } from '../../../measurement/length-scene-types';
import type { LengthUnit } from '../../../measurement/length-units';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

const WIDTH = 420;
const HEIGHT = 168;
const STEP_W = 92;
const STEP_H = 34;
const X0 = 14;
const Y0 = 12;
const UNITS: readonly LengthUnit[] = ['m', 'dm', 'cm', 'mm'];

function renderLengthLadder(scene: LengthScene): SVGElement {
  const label = `Thang đo độ dài: ${UNITS.join(' → ')}`;
  const svg = sceneRoot(WIDTH, HEIGHT, label);
  const highlighted = new Set(scene.highlight ?? []);
  UNITS.forEach((unit, i) => {
    const x = X0 + i * STEP_W;
    const y = Y0 + i * STEP_H;
    const last = i === UNITS.length - 1;
    svg.append(
      svgEl('rect', {
        x,
        y,
        width: STEP_W,
        height: STEP_H,
        rx: 8,
        class: highlighted.has(unit) ? 'ds-shape ds-highlight' : 'ds-shape',
      }),
    );
    svg.append(dsLabel(x + STEP_W / 2, y + STEP_H / 2 + 1, unit));
    if (!last) {
      const ax = x + STEP_W - 8;
      const ay = y + STEP_H;
      // A short diagonal from this step's bottom edge into the next step's
      // top-left corner; the factor sits in the empty gap above the next step.
      svg.append(svgEl('line', { x1: ax, y1: ay, x2: ax + 16, y2: ay + 10, class: 'ds-line' }));
      svg.append(
        svgEl('polygon', {
          points: `${ax + 16},${ay + 10} ${ax + 8},${ay + 4} ${ax + 10},${ay + 16}`,
          class: 'ds-point',
        }),
      );
      svg.append(dsLabel(ax + 24, ay - 10, scene.arrows ?? '×10', 'start'));
    }
  });
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['length-ladder'],
  render(scene) {
    return renderLengthLadder(scene as LengthScene);
  },
};
