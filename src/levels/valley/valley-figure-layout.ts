// A round's board layout from its geometry item (pure): dispatch on the scene, plus the stone
// blocks of B21 (one block to lift and turn, or up to four to choose from).
import type { GeoItem, GeoScene } from '../../geometry/geo-scene-types';
import { CELLS, layoutAngles, layoutFigure2d, layoutShapes } from './valley-layout-angles-shapes';
import { layoutCircle, layoutCircleRow, layoutSegment } from './valley-layout-segment-circle';
import { type FigureLayout, nameRef, toBoard, type ValleyChip } from './valley-layout-types';

type SolidsScene = Extract<GeoScene, { kind: 'solids' }>;

export function layoutSolids(scene: SolidsScene): FigureLayout {
  const single = scene.solids.length === 1;
  const largest = Math.max(...scene.solids.flatMap((s) => s.dims));
  const k = (single ? 2.6 : 1.55) / largest;
  const chips: ValleyChip[] = [];
  const draws: FigureLayout['draws'][number][] = [];
  const targets: FigureLayout['targets'][number][] = [];
  scene.solids.forEach((solid, i) => {
    const [a = 1, b = 1, c = 1] = solid.dims;
    const [w, h, d] = [a * k, b * k, c * k];
    const cell = single ? ([0, 0] as const) : (CELLS[i] ?? [0, 0]);
    const at = toBoard(cell[0], cell[1]);
    draws.push({ kind: 'block', c: at, size: [w, h, d], group: `block:${i}` });
    // Edge lengths on the front-bottom, left-upright and right-depth edges (as in the book).
    chips.push(
      { at: [at[0], at[1] + d / 2 + 0.3], text: `${a} cm`, kind: 'size' },
      { at: [at[0] - w / 2 - 0.15, at[1] + d / 2], y: h / 2, text: `${b} cm`, kind: 'size' },
      { at: [at[0] + w / 2 + 0.35, at[1]], text: `${c} cm`, kind: 'size' },
    );
    if (!single) chips.push({ at: [at[0] - 1.9, at[1] - 1.1], text: solid.label, kind: 'letter' });
    targets.push({
      id: single ? 'block' : `block:${i}`,
      kind: 'block',
      at,
      name: nameRef('tBlock', { l: solid.label }),
      right: true,
      ...(single ? {} : { option: `o${i}` }),
    });
  });
  return { action: single ? 'lift' : null, draws, targets, chips, halfWidth: 4.8, halfDepth: 3.6 };
}

export function layoutFigure(item: GeoItem): FigureLayout {
  const scene = item.scene;
  switch (scene.kind) {
    case 'segment':
      // Tiers 1-2 ask for M (it is the midpoint); tier 3 shows where M was put and asks if it is.
      return layoutSegment(scene, item.tier !== 3);
    case 'circle':
      return layoutCircle(scene);
    case 'circle-row':
      return layoutCircleRow(scene);
    case 'angles':
      return layoutAngles(scene);
    case 'shapes':
      return layoutShapes(scene);
    case 'figure':
      return layoutFigure2d(scene);
    case 'solids':
      return layoutSolids(scene);
    default:
      throw new Error(`valley: no layout for scene "${scene.kind}"`);
  }
}
