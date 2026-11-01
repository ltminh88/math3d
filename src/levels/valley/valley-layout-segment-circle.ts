// Board layouts of the midpoint log (B16) and the ponds (B17), pure. The log is drawn at a fixed
// length with one tick per centimetre; five marked stones on it are the tap targets for "find the
// midpoint", spaced so each stays >= 44 px on a phone. Ponds keep a fixed drawn radius.
import type { GeoScene } from '../../geometry/geo-scene-types';
import {
  type FigureLayout,
  nameRef,
  toBoard,
  type ValleyChip,
  type ValleyDraw,
} from './valley-layout-types';

type SegmentScene = Extract<GeoScene, { kind: 'segment' }>;
type CircleScene = Extract<GeoScene, { kind: 'circle' }>;
type RowScene = Extract<GeoScene, { kind: 'circle-row' }>;

const LOG_HALF = 4;
/** Marked stones at k/6 of the log (k = 1..5); the middle one (k = 3) is the midpoint. */
export const MIDPOINT_STONES = [1, 2, 3, 4, 5] as const;
const POND_RADIUS = 2.6;

const logX = (at: number, length: number) => -LOG_HALF + (2 * LOG_HALF * at) / length;

/** `find`: tiers 1-2 ask for the midpoint, so M stays hidden until the child finds it. */
export function layoutSegment(scene: SegmentScene, find: boolean): FigureLayout {
  const { length } = scene;
  const ticks = Array.from({ length: length + 1 }, (_, i) => i / length);
  const chips: ValleyChip[] = scene.points.map((p) => ({
    at: [logX(p.at, length), -0.75],
    text: p.label,
    kind: 'point',
    afterAction: p.label === 'M' && find,
  }));
  return {
    action: 'midpoint',
    draws: [{ kind: 'log', a: [-LOG_HALF, 0], b: [LOG_HALF, 0], ticks }],
    targets: MIDPOINT_STONES.map((k) => ({
      id: `stone:${k}`,
      kind: 'stone',
      at: [-LOG_HALF + (2 * LOG_HALF * k) / 6, 0],
      name: nameRef('tStone', { n: k }),
      right: k === 3,
    })),
    chips,
    halfWidth: LOG_HALF + 0.8,
    halfDepth: 1.6,
  };
}

const onRing = (deg: number, r: number) => {
  const a = (deg * Math.PI) / 180;
  return toBoard(r * Math.cos(a), r * Math.sin(a));
};

export function layoutCircle(scene: CircleScene): FigureLayout {
  const at = new Map(
    scene.points.map((p) => [
      p.label,
      p.angleDeg === null ? toBoard(0, 0) : onRing(p.angleDeg, POND_RADIUS),
    ]),
  );
  const draws: ValleyDraw[] = [
    { kind: 'ring', c: [0, 0], r: POND_RADIUS, group: 'pond' },
    ...scene.segments.map(
      ([a, b]): ValleyDraw => ({
        kind: 'line',
        a: at.get(a) ?? [0, 0],
        b: at.get(b) ?? [0, 0],
        group: `seg:${a}${b}`,
      }),
    ),
  ];
  const chips: ValleyChip[] = scene.points.map((p) => ({
    at: p.angleDeg === null ? [0.45, 0.45] : onRing(p.angleDeg, POND_RADIUS + 0.55),
    text: p.label,
    kind: 'point',
  }));
  return {
    action: 'centre',
    draws,
    targets: scene.points.map((p) =>
      p.angleDeg === null
        ? {
            id: 'centre',
            kind: 'centre',
            at: [0, 0],
            name: nameRef('tPoint', { l: p.label }),
            right: true,
          }
        : {
            id: `pt:${p.label}`,
            kind: 'ring',
            at: at.get(p.label) ?? [0, 0],
            name: nameRef('tPoint', { l: p.label }),
            right: false,
          },
    ),
    chips,
    halfWidth: POND_RADIUS + 0.9,
    halfDepth: POND_RADIUS + 0.9,
  };
}

export function layoutCircleRow(scene: RowScene): FigureLayout {
  const r = Math.min(POND_RADIUS, 4.4 / scene.count);
  const centres = Array.from({ length: scene.count }, (_, i): readonly [number, number] => [
    (i - (scene.count - 1) / 2) * 2 * r,
    0,
  ]);
  const first = centres[0] ?? [0, 0];
  return {
    action: 'centre',
    draws: [
      ...centres.map((c, i): ValleyDraw => ({ kind: 'ring', c, r, group: `pond:${i}` })),
      { kind: 'line', a: first, b: [first[0], -r], group: 'radius' },
    ],
    targets: centres.map((c, i) => ({
      id: `centre:${i}`,
      kind: 'centre',
      at: c,
      name: nameRef('tCentre', { n: i + 1 }),
      right: true,
    })),
    chips: [{ at: [first[0] + 0.25, -r / 2], text: `${scene.radius} cm`, kind: 'size' }],
    halfWidth: scene.count * r + 0.5,
    halfDepth: r + 0.6,
  };
}
