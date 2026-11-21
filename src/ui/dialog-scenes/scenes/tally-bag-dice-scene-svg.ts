// Tally strip, bag of marbles and dice pictures (phase 17). The tally shows O/X
// marks in order; the bag shows one marble per ball in the bag, grouped by colour;
// a die shows its pips, a second view beside it, and covered faces as '?'.
import type { BagScene, DiceScene, TallyScene } from '../../../data/data-scene-types';
import { svgEl } from '../../../levels/workshop/workshop-shape-svg';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { dsLabel, sceneRoot } from '../dialog-scene-svg';

const MARBLE_FILL: Record<string, string> = {
  red: '#e05d44',
  blue: '#2f7cf6',
  yellow: '#f7c948',
  green: '#7fb069',
};

// Pip centres on a 3x3 grid (die face 90x90, margin 14).
const PIPS: Record<number, readonly (readonly [number, number])[]> = {
  1: [[1, 1]],
  2: [
    [0, 0],
    [2, 2],
  ],
  3: [
    [0, 0],
    [1, 1],
    [2, 2],
  ],
  4: [
    [0, 0],
    [0, 2],
    [2, 0],
    [2, 2],
  ],
  5: [
    [0, 0],
    [0, 2],
    [1, 1],
    [2, 0],
    [2, 2],
  ],
  6: [
    [0, 0],
    [0, 1],
    [0, 2],
    [2, 0],
    [2, 1],
    [2, 2],
  ],
};

function renderTally(scene: TallyScene): SVGElement {
  const perRow = 10;
  const cell = 34;
  const cols = Math.min(perRow, scene.marks.length);
  const rows = Math.ceil(scene.marks.length / perRow);
  const svg = sceneRoot(cols * cell, rows * cell, 'Dấu kiểm');
  scene.marks.forEach((hit, i) => {
    const cx = (i % perRow) * cell + cell / 2;
    const cy = Math.floor(i / perRow) * cell + cell / 2;
    if (hit) {
      svg.append(svgEl('circle', { cx, cy, r: 11, class: 'ds-tally-o' }));
    } else {
      svg.append(
        svgEl('line', { x1: cx - 9, y1: cy - 9, x2: cx + 9, y2: cy + 9, class: 'ds-tally-x' }),
        svgEl('line', { x1: cx - 9, y1: cy + 9, x2: cx + 9, y2: cy - 9, class: 'ds-tally-x' }),
      );
    }
  });
  return svg;
}

function renderBag(scene: BagScene): SVGElement {
  const perRow = 10;
  const cell = 36;
  const total = scene.items.reduce((sum, item) => sum + item.count, 0);
  const cols = Math.min(perRow, total);
  const rows = Math.ceil(total / perRow);
  const svg = sceneRoot(cols * cell, rows * cell, 'Túi bi');
  let i = 0;
  for (const item of scene.items) {
    for (let k = 0; k < item.count; k++) {
      const cx = (i % perRow) * cell + cell / 2;
      const cy = Math.floor(i / perRow) * cell + cell / 2;
      svg.append(
        svgEl('circle', {
          cx,
          cy,
          r: 14,
          class: 'ds-marble',
          fill: MARBLE_FILL[item.colour] ?? '#b9b4aa',
        }),
      );
      i += 1;
    }
  }
  return svg;
}

function renderDie(x: number, face: number, hidden: boolean): SVGElement[] {
  const parts: SVGElement[] = [
    svgEl('rect', {
      x,
      y: 0,
      width: 90,
      height: 90,
      rx: 12,
      class: hidden ? 'ds-die-hidden' : 'ds-die',
    }),
  ];
  if (hidden) {
    parts.push(dsLabel(x + 45, 45, '?'));
    return parts;
  }
  for (const [gx, gy] of PIPS[face] ?? []) {
    parts.push(svgEl('circle', { cx: x + 16 + gx * 29, cy: 16 + gy * 29, r: 7, class: 'ds-pip' }));
  }
  return parts;
}

function renderDice(scene: DiceScene): SVGElement {
  const faces: { face: number; hidden: boolean }[] = [{ face: scene.up, hidden: false }];
  if (scene.other !== undefined) faces.push({ face: scene.other, hidden: false });
  for (const face of scene.hidden ?? []) faces.push({ face, hidden: true });
  const svg = sceneRoot(faces.length * 102 - 12, 90, 'Xúc xắc');
  faces.forEach((f, i) => {
    svg.append(...renderDie(i * 102, f.face, f.hidden));
  });
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['tally', 'bag', 'dice'],
  render(scene) {
    if (scene.kind === 'tally') return renderTally(scene as TallyScene);
    if (scene.kind === 'bag') return renderBag(scene as BagScene);
    return renderDice(scene as DiceScene);
  },
};
