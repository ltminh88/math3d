// The round's flat figure on the stone board (log and stones, ponds and ropes, corners, shapes,
// split figures), rebuilt and baked into one mesh whenever the board state changes: the stone or
// centre found, shapes chosen on the card, the hint's visual aid. Blocks and the ê-ke are their
// own views (they move).
import { BufferGeometry, Mesh, MeshStandardMaterial, Scene } from 'three';
import type { WorldBuildContext } from '../../world/world-build-context';
import { WORLD_LIGHTING } from '../../world/world-lighting-tuning';
import { bakeVertexColoredGeometry } from '../shared/bake-vertex-colored-geometry';
import {
  addDashes,
  addDot,
  addFill,
  addRing,
  addStroke,
  scratchContext,
} from './valley-figure-meshes';
import { VALLEY_COLORS as C, SHAPE_FILLS } from './valley-layout-constants';
import type { FigureLayout, ValleyDraw, XZ } from './valley-layout-types';

/** What the board shows besides the figure itself. */
export interface BoardState {
  /** Target the child found (midpoint stone, centre). */
  readonly picked: string | null;
  /** Card options currently chosen (figures drawn gold). */
  readonly selected: ReadonlySet<string>;
  /** Hint rung 3: the visual aid. */
  readonly aid: boolean;
}

const indexOf = (group: string) => Number(group.split(':')[1] ?? 0);

/** The direction (degrees) farthest from every labelled point on the pond, for the guide line. */
function freeDirection(points: readonly XZ[]): number {
  let best = 0;
  let bestGap = -1;
  for (let deg = 0; deg < 180; deg += 5) {
    const gap = Math.min(
      ...points.flatMap(([x, z]) => {
        const a = (Math.atan2(-z, x) * 180) / Math.PI;
        return [0, 180].map((o) => Math.abs(((a - deg - o + 540) % 360) - 180));
      }),
    );
    if (gap > bestGap) [best, bestGap] = [deg, gap];
  }
  return best;
}

export class ValleyFigureView {
  private readonly mesh: Mesh;

  constructor(scene: Scene) {
    const material = new MeshStandardMaterial({
      vertexColors: true,
      roughness: WORLD_LIGHTING.roughness.primitive,
      metalness: 0,
      flatShading: true,
    });
    this.mesh = new Mesh(new BufferGeometry(), material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    this.mesh.name = 'valley-figure';
    scene.add(this.mesh);
  }

  show(layout: FigureLayout, state: BoardState): void {
    const root = new Scene();
    const ctx = scratchContext(root);
    for (const draw of layout.draws) this.draw(ctx, root, draw, layout, state);
    this.drawTargets(ctx, root, layout, state);
    this.mesh.geometry.dispose();
    const flat = root.children.length > 0;
    this.mesh.geometry = flat ? bakeVertexColoredGeometry(root) : new BufferGeometry();
    for (const m of ctx.materials.values()) m.dispose();
    this.mesh.visible = flat;
  }

  private draw(
    ctx: WorldBuildContext,
    root: Scene,
    d: ValleyDraw,
    layout: FigureLayout,
    state: BoardState,
  ): void {
    if (d.kind === 'log') {
      if (state.aid) {
        const mid: XZ = [(d.a[0] + d.b[0]) / 2, (d.a[1] + d.b[1]) / 2];
        addStroke(ctx, root, d.a, mid, C.halfA, 0.7, 0.04);
        addStroke(ctx, root, mid, d.b, C.halfB, 0.7, 0.04);
      }
      addStroke(ctx, root, d.a, d.b, C.log, 0.42, 0.22);
      for (const t of d.ticks) {
        const x = d.a[0] + (d.b[0] - d.a[0]) * t;
        addStroke(ctx, root, [x, d.a[1] - 0.24], [x, d.a[1] + 0.24], C.tick, 0.04, 0.26);
      }
    } else if (d.kind === 'line') {
      addStroke(ctx, root, d.a, d.b, C.ink);
      if (state.aid && layout.action === null)
        for (const p of [d.a, d.b]) addDot(ctx, root, p, C.aid, 0.13, 0.16);
    } else if (d.kind === 'ring') {
      addRing(ctx, root, d.c, d.r, C.ink, C.water);
      const i = indexOf(d.group);
      if (state.picked === `centre:${i}`) {
        addStroke(ctx, root, [d.c[0] - d.r, d.c[1]], d.c, C.gold, 0.16, 0.08);
        addStroke(ctx, root, d.c, [d.c[0] + d.r, d.c[1]], C.halfB, 0.16, 0.08);
      }
      if (state.aid && (d.group === 'pond' || d.group === 'pond:0')) {
        const ring = layout.targets.filter((t) => t.kind === 'ring').map((t) => t.at);
        const a = (freeDirection(ring) * Math.PI) / 180;
        const [dx, dz] = [d.r * Math.cos(a), -d.r * Math.sin(a)];
        addDashes(ctx, root, [d.c[0] - dx, d.c[1] - dz], [d.c[0] + dx, d.c[1] + dz], C.aid);
      }
    } else if (d.kind === 'poly') {
      const i = indexOf(d.group);
      const color = state.selected.has(`o${i}`)
        ? C.gold
        : (SHAPE_FILLS[i % SHAPE_FILLS.length] as number);
      addFill(ctx, root, d.points, color);
      if (state.aid) for (const p of d.points) addDot(ctx, root, p, C.aid, 0.13, 0.16);
    }
  }

  private drawTargets(
    ctx: WorldBuildContext,
    root: Scene,
    layout: FigureLayout,
    state: BoardState,
  ): void {
    for (const t of layout.targets) {
      const found = state.picked === t.id;
      if (t.kind === 'stone') addDot(ctx, root, t.at, found ? C.gold : C.stone, 0.26, 0.3);
      else if (t.kind === 'centre')
        addDot(ctx, root, t.at, found ? C.gold : C.ink, found ? 0.2 : 0.13);
      else if (t.kind === 'ring' || t.kind === 'corner') addDot(ctx, root, t.at, C.ink, 0.11);
    }
  }

  hide(): void {
    this.mesh.visible = false;
  }

  dispose(): void {
    this.mesh.geometry.dispose();
  }
}
