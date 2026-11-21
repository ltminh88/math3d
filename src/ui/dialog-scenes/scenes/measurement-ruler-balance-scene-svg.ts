// Ruler + balance pictures (phase 04): the workshop's own SVG views, re-classed for the
// dialog. The scene carries no tier, so the ruler always draws its mm ticks (a real
// ruler has them); the object name comes from the story, not the picture.
import type { SceneBody } from '../../../geometry/geo-scene-types';
import { MIN_UNIT_PX } from '../../../geometry/geometry-ranges';
import { createBalanceView } from '../../../levels/workshop/workshop-instruments-view';
import { createRulerView } from '../../../levels/workshop/workshop-ruler-view';
import { renderMeasurementPrompt } from '../../../measurement/measurement-strings';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { workshopSvg, ws } from '../dialog-scene-svg';

type Ruler = Extract<SceneBody, { kind: 'ruler' }>;
type Balance = Extract<SceneBody, { kind: 'balance' }>;

function renderRuler(scene: Ruler): SVGElement {
  // The views take a GeoScene; minUnitPx is only a type tag there, unused at render.
  const svg = workshopSvg(createRulerView({ ...scene, minUnitPx: MIN_UNIT_PX }, 2, '', ws));
  if (!svg) throw new Error('dialog scene: ruler view has no svg');
  return svg;
}

function renderBalance(scene: Balance): SVGElement {
  const noun = renderMeasurementPrompt({ key: 'nounOpt', params: { item: scene.item } });
  const svg = workshopSvg(createBalanceView({ ...scene, minUnitPx: MIN_UNIT_PX }, noun, ws));
  if (!svg) throw new Error('dialog scene: balance view has no svg');
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['ruler', 'balance'],
  render(scene) {
    if (scene.kind === 'ruler') return renderRuler(scene);
    return renderBalance(scene as Balance);
  },
};
