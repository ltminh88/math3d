// Dialog scene registry (phase 04): scene renderers self-register through
// `import.meta.glob`, so a later family adds one file and nothing else changes.
// The map is built once at import time; a duplicate kind fails fast.
import type { SceneBody, SceneKind } from '../../geometry/geo-scene-types';

export interface DialogSceneRenderer {
  readonly kinds: readonly SceneKind[];
  render(scene: SceneBody): SVGElement;
}

type SceneModule = { sceneRenderer: DialogSceneRenderer };

const modules = import.meta.glob('./scenes/*-scene-svg.ts', { eager: true }) as Record<
  string,
  SceneModule
>;

const renderers = new Map<SceneKind, DialogSceneRenderer>();
for (const [path, mod] of Object.entries(modules)) {
  const renderer = mod.sceneRenderer;
  if (!renderer) throw new Error(`dialog scene: ${path} does not export sceneRenderer`);
  for (const kind of renderer.kinds) {
    if (renderers.has(kind))
      throw new Error(`dialog scene: duplicate renderer for "${kind}" in ${path}`);
    renderers.set(kind, renderer);
  }
}

export function hasSceneRenderer(kind: SceneKind): boolean {
  return renderers.has(kind);
}

export function registeredSceneKinds(): readonly SceneKind[] {
  return [...renderers.keys()];
}

/** The scene drawn as SVG, or null when no renderer covers its kind (never a blank picture). */
export function renderScene(scene: SceneBody): SVGElement | null {
  const renderer = renderers.get(scene.kind);
  return renderer ? renderer.render(scene) : null;
}
