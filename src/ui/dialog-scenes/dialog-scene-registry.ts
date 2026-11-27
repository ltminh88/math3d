// Dialog scene registry (phase 04): scene renderers self-register through
// `import.meta.glob`, so a later family adds one file and nothing else changes.
// The map is built once at import time; a duplicate kind fails fast. Scenes arrive
// as `PracticeScene` (phase 02): only `kind` is typed there — the runtime value is
// the family's full scene object, so a registered kind hands it to its renderer.
// Phase 17 widens the renderer contract from geometry-only `SceneBody` to the
// `DialogScene` union (geometry + time + money + data); phase 16 extends the union
// with the numbers/fraction scenes. A renderer's `render` narrows on `kind`, so no
// casts are needed inside the scene files.

import type { ColumnCalcScene } from '../../arithmetic/column-calc-scene-types';
import type { DataScene } from '../../data/data-scene-types';
import type { FractionScene } from '../../fractions/fraction-scene-types';
import type { SceneBody } from '../../geometry/geo-scene-types';
import type { LengthScene } from '../../measurement/length-scene-types';
import type { MoneyScene } from '../../money/money-scene-types';
import type { NumberScene } from '../../numbers/numbers-scene-types';
import type { PracticeScene } from '../../practice/practice-scene';
import type { TimeScene } from '../../time/time-scene-types';

/** Every scene the dialog can draw: geometry/measurement plus the market, numbers and fraction families. */
export type DialogScene =
  | SceneBody
  | TimeScene
  | MoneyScene
  | DataScene
  | NumberScene
  | FractionScene
  | LengthScene
  | ColumnCalcScene;

export type DialogSceneKind = DialogScene['kind'];

export interface DialogSceneRenderer {
  readonly kinds: readonly DialogSceneKind[];
  render(scene: DialogScene): SVGElement;
}

type SceneModule = { sceneRenderer: DialogSceneRenderer };

const modules = import.meta.glob('./scenes/*-scene-svg.ts', { eager: true }) as Record<
  string,
  SceneModule
>;

const renderers = new Map<DialogSceneKind, DialogSceneRenderer>();
for (const [path, mod] of Object.entries(modules)) {
  const renderer = mod.sceneRenderer;
  if (!renderer) throw new Error(`dialog scene: ${path} does not export sceneRenderer`);
  for (const kind of renderer.kinds) {
    if (renderers.has(kind))
      throw new Error(`dialog scene: duplicate renderer for "${kind}" in ${path}`);
    renderers.set(kind, renderer);
  }
}

export function hasSceneRenderer(kind: string): boolean {
  return renderers.has(kind as DialogSceneKind);
}

export function registeredSceneKinds(): readonly DialogSceneKind[] {
  return [...renderers.keys()];
}

/** The scene drawn as SVG, or null when no renderer covers its kind (never a blank picture). */
export function renderScene(scene: PracticeScene): SVGElement | null {
  const renderer = renderers.get(scene.kind as DialogSceneKind);
  // A registered kind means the runtime scene is that kind's full scene object.
  return renderer ? renderer.render(scene as DialogScene) : null;
}
