// Jug + thermometers pictures (phase 04): the workshop's own SVG views, re-classed
// for the dialog (marks, water level and mercury column exactly as in the level).
import type { SceneBody } from '../../../geometry/geo-scene-types';
import { MIN_UNIT_PX } from '../../../geometry/geometry-ranges';
import {
  createJugView,
  createThermometersView,
} from '../../../levels/workshop/workshop-instruments-view';
import type { DialogSceneRenderer } from '../dialog-scene-registry';
import { workshopSvg, ws } from '../dialog-scene-svg';

type Jug = Extract<SceneBody, { kind: 'jug' }>;
type Thermometers = Extract<SceneBody, { kind: 'thermometers' }>;

function renderJug(scene: Jug): SVGElement {
  const svg = workshopSvg(createJugView({ ...scene, minUnitPx: MIN_UNIT_PX }, ws));
  if (!svg) throw new Error('dialog scene: jug view has no svg');
  return svg;
}

function renderThermometers(scene: Thermometers): SVGElement {
  const svg = workshopSvg(createThermometersView({ ...scene, minUnitPx: MIN_UNIT_PX }, ws));
  if (!svg) throw new Error('dialog scene: thermometers view has no svg');
  return svg;
}

export const sceneRenderer: DialogSceneRenderer = {
  kinds: ['jug', 'thermometers'],
  render(scene) {
    if (scene.kind === 'jug') return renderJug(scene);
    return renderThermometers(scene as Thermometers);
  },
};
