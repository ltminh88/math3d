// Board layouts of the corners (B18) and the flat shapes (B19), pure. Several figures share a
// 2 × 2 grid of cells; one shape alone fills the board so each corner can carry its own ê-ke
// target. Every corner knows whether the ê-ke fits (vector check, whatever the turn).
import type { GeoScene, Point } from '../../geometry/geo-scene-types';
import {
  type FigureLayout,
  nameRef,
  toBoard,
  type ValleyDraw,
  type ValleyTarget,
  type XZ,
} from './valley-layout-types';
import {
  cornerAngleDeg,
  fitsSetSquare,
  setSquarePose,
  turnPoint,
  type Vec2,
} from './valley-set-square-fit';

type AnglesScene = Extract<GeoScene, { kind: 'angles' }>;
type ShapesScene = Extract<GeoScene, { kind: 'shapes' }>;
type FigureScene = Extract<GeoScene, { kind: 'figure' }>;

/** Cell centres (math coordinates, y up) for 2-4 figures. */
export const CELLS: readonly Vec2[] = [
  [-2.5, 1.7],
  [2.5, 1.7],
  [-2.5, -1.7],
  [2.5, -1.7],
];
const ARM = 1.35;
/** Where the right-angle hint lays its spare ê-ke: between the corners, or a board corner. */
export const SPARE_AT = { angles: [-0.55, 0.4], board: [-5.4, 4.0] } as const;

function cornerTarget(
  id: string,
  a: Vec2,
  at: Vec2,
  b: Vec2,
  name: ValleyTarget['name'],
  option?: string,
): ValleyTarget {
  const pose = setSquarePose(a, at, b);
  return {
    id,
    kind: 'corner',
    at: toBoard(at[0], at[1]),
    name,
    right: true,
    fits: fitsSetSquare(cornerAngleDeg(a, at, b)),
    armAngle: pose.armAngle,
    turn: pose.turn,
    ...(option ? { option } : {}),
  };
}

export function layoutAngles(scene: AnglesScene): FigureLayout {
  const draws: ValleyDraw[] = [];
  const targets: ValleyTarget[] = [];
  const chips = scene.angles.map((angle, i) => {
    const at = CELLS[i] ?? [0, 0];
    const arm = (deg: number): Vec2 => turnPoint([at[0] + ARM, at[1]], at, deg);
    const a = arm(angle.rotationDeg);
    const b = arm(angle.rotationDeg + angle.degrees);
    for (const end of [a, b])
      draws.push({
        kind: 'line',
        a: toBoard(at[0], at[1]),
        b: toBoard(end[0], end[1]),
        group: `fig:${i}`,
      });
    targets.push(
      cornerTarget(`corner:${i}`, a, at, b, nameRef('tAngle', { l: angle.label }), `o${i}`),
    );
    // The letter sits opposite the opening of the angle.
    const mid = (angle.rotationDeg + angle.degrees / 2 + 180) * (Math.PI / 180);
    return {
      at: toBoard(at[0] + 0.6 * Math.cos(mid), at[1] + 0.6 * Math.sin(mid)),
      text: angle.label,
      kind: 'letter' as const,
    };
  });
  return { action: 'set-square', draws, targets, chips, halfWidth: 4.3, halfDepth: 3.4 };
}

/** Vertices turned around their box centre, and the box of the turned shape. */
function turned(vertices: readonly Point[], degrees: number) {
  const xs = vertices.map((v) => v[0]);
  const ys = vertices.map((v) => v[1]);
  const centre: Vec2 = [
    (Math.min(...xs) + Math.max(...xs)) / 2,
    (Math.min(...ys) + Math.max(...ys)) / 2,
  ];
  const pts = vertices.map((v) => turnPoint(v, centre, degrees));
  const tx = pts.map((p) => p[0]);
  const ty = pts.map((p) => p[1]);
  const box = {
    x: Math.min(...tx),
    y: Math.min(...ty),
    w: Math.max(...tx) - Math.min(...tx),
    h: Math.max(...ty) - Math.min(...ty),
  };
  return { pts, box };
}

export function layoutShapes(scene: ShapesScene): FigureLayout {
  const single = scene.shapes.length === 1;
  const shapes = scene.shapes.map((s) => turned(s.vertices, s.rotationDeg));
  const scale = Math.min(
    single ? 1.25 : 0.7,
    ...shapes.map(({ box }) =>
      Math.min((single ? 8.4 : 4.1) / box.w, (single ? 5.6 : 2.7) / box.h),
    ),
  );
  const draws: ValleyDraw[] = [];
  const targets: ValleyTarget[] = [];
  const chips: FigureLayout['chips'][number][] = [];
  shapes.forEach(({ pts, box }, i) => {
    const cell = single ? ([0, 0] as const) : (CELLS[i] ?? [0, 0]);
    const place = (p: Vec2): Vec2 => [
      cell[0] + (p[0] - box.x - box.w / 2) * scale,
      cell[1] + (p[1] - box.y - box.h / 2) * scale,
    ];
    const placed = pts.map(place);
    const board = placed.map((p) => toBoard(p[0], p[1]));
    const group = `fig:${i}`;
    draws.push({ kind: 'poly', points: board, group });
    for (const [k, p] of board.entries()) {
      draws.push({ kind: 'line', a: p, b: board[(k + 1) % board.length] as XZ, group });
    }
    const label = scene.shapes[i]?.label ?? '';
    if (single) {
      placed.forEach((at, k) => {
        const prev = placed[(k + placed.length - 1) % placed.length] as Vec2;
        const next = placed[(k + 1) % placed.length] as Vec2;
        targets.push(cornerTarget(`corner:${k}`, prev, at, next, nameRef('tCorner', { n: k + 1 })));
      });
    } else {
      targets.push({
        id: `shape:${i}`,
        kind: 'shape',
        at: toBoard(cell[0], cell[1]),
        name: nameRef('tShape', { l: label }),
        right: true,
        option: `o${i}`,
      });
      chips.push({ at: toBoard(cell[0] - 2.2, cell[1] + 1.3), text: label, kind: 'letter' });
    }
  });
  return {
    action: single ? 'set-square' : null,
    draws,
    targets,
    chips,
    // The whole board shows: the hint's spare ê-ke lies in its corner (SPARE_AT).
    halfWidth: 5.6,
    halfDepth: 4.2,
  };
}

export function layoutFigure2d(scene: FigureScene): FigureLayout {
  const xs = scene.segments.flatMap((s) => [s[0], s[2]]);
  const ys = scene.segments.flatMap((s) => [s[1], s[3]]);
  const [x0, y0] = [Math.min(...xs), Math.min(...ys)];
  const [w, h] = [Math.max(...xs) - x0, Math.max(...ys) - y0];
  const scale = Math.min(8.4 / w, 5.6 / h);
  const at = (x: number, y: number) => toBoard((x - x0 - w / 2) * scale, (y - y0 - h / 2) * scale);
  return {
    action: null,
    draws: scene.segments.map(([ax, ay, bx, by], i) => ({
      kind: 'line',
      a: at(ax, ay),
      b: at(bx, by),
      group: `cut:${i}`,
    })),
    targets: [],
    chips: [],
    halfWidth: 4.8,
    halfDepth: 3.4,
  };
}
