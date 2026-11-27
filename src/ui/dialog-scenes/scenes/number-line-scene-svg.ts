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
  // Jump arcs (Phase 1A): each jump arcs above the line from its start mark to
  // its landing mark, labelled with the signed jump. Marks 100 apart, so the
  // arc midpoint sits 50 from either mark's letter (y=34) — no collision.
  const xOf = (value: number): number | undefined => {
    const i = scene.marks.indexOf(value);
    return i === -1 ? undefined : X0 + i * STEP_X;
  };
  for (const jump of scene.jumps ?? []) {
    const x1 = xOf(jump.from);
    const x2 = xOf(jump.from + jump.by);
    if (x1 === undefined || x2 === undefined) continue;
    const midX = (x1 + x2) / 2;
    svg.append(
      svgEl('path', {
        d: `M ${x1},${LINE_Y} Q ${midX},${LINE_Y - 34} ${x2},${LINE_Y}`,
        class: 'ds-line',
        fill: 'none',
      }),
    );
    svg.append(dsLabel(midX, LINE_Y - 30, jump.by >= 0 ? `+${jump.by}` : `${jump.by}`));
  }
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
