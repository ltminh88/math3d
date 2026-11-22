// Number-line picture (phase 16): the sequence's marks on a line, the missing
// ones as '?'. A missing mark carries its letter (A, then B) above the line —
// the step prompt asks for the number at that letter.
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { NumberScene } from '../../../numbers/numbers-scene-types';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

type NumberLineScene = Extract<NumberScene, { kind: 'number-line' }>;

const WIDTH = 420;
const HEIGHT = 130;
const LINE_Y = 70;
const X0 = 60;
const STEP_X = 100;
const LETTERS = ['A', 'B', 'C', 'D'];

function renderNumberLine(scene: NumberLineScene): SVGElement {
  const missingSet = new Set(scene.missing);
  const label = scene.marks.map((m, i) => (missingSet.has(i) ? '?' : String(m))).join(', ');
  const svg = sceneRoot(WIDTH, HEIGHT, `Tia số: ${label}`);
  const x1 = X0 - 30;
  const x2 = X0 + (scene.marks.length - 1) * STEP_X + 30;
  svg.append(svgEl('line', { x1, y1: LINE_Y, x2, y2: LINE_Y, class: 'ds-line' }));
  // Arrowheads at both ends of the line.
  svg.append(
    svgEl('polygon', {
      points: `${x1},${LINE_Y} ${x1 + 12},${LINE_Y - 6} ${x1 + 12},${LINE_Y + 6}`,
      class: 'ds-point',
    }),
    svgEl('polygon', {
      points: `${x2},${LINE_Y} ${x2 - 12},${LINE_Y - 6} ${x2 - 12},${LINE_Y + 6}`,
      class: 'ds-point',
    }),
  );
  let missingSeen = 0;
  scene.marks.forEach((mark, i) => {
    const x = X0 + i * STEP_X;
    svg.append(svgEl('line', { x1: x, y1: LINE_Y - 8, x2: x, y2: LINE_Y + 8, class: 'ds-line' }));
    if (missingSet.has(i)) {
      const letter = LETTERS[missingSeen] ?? '?';
      missingSeen++;
      svg.append(dsLabel(x, 34, letter));
      svg.append(dsLabel(x, 102, '?'));
    } else {
      svg.append(dsLabel(x, 102, String(mark)));
    }
  });
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['number-line'],
  render(scene) {
    return renderNumberLine(scene as NumberLineScene);
  },
};
