// Numberfort level scene (own chunk): builds the castle, the HUD, plans the six rounds (the
// stage's range, weakest skill first) and wires answers, keys, the framing camera and the
// celebration at the finished wall.
import { Scene } from 'three';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { attachLevelZoom } from '../shared/level-zoom';
import '../shared/level-zoom.css';
import { NumberfortCamera } from './numberfort-camera';
import { showNumberfortCelebration } from './numberfort-celebration';
import { buildNumberfortDiorama } from './numberfort-diorama-builder';
import { listenNumberfortKeys } from './numberfort-input';
import { NumberfortPanel } from './numberfort-panel';
import { NumberfortRoundController } from './numberfort-round-controller';
import { planNumberfortRun } from './numberfort-stage-plan';
import { numberfortStrings } from './numberfort-strings';
import { installNumberfortTestHook } from './numberfort-test-hook';
import './numberfort-level.css';

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

function start(ctx: LevelContext): LevelSession {
  const cs = numberfortStrings(ctx.defineStrings);
  const scene = new Scene();
  scene.name = 'numberfort';
  buildNumberfortDiorama(scene);
  const view = new NumberfortCamera();
  // Phase 25b: pinch + wheel + +/− buttons zoom the camera around the auto-fit distance.
  // The numberfort has no drag input, so there is nothing for a pinch to cancel.
  const zoomHandle = attachLevelZoom(ctx.canvas, {
    container: ctx.ui,
    onFactor: (factor) => {
      view.setZoomFactor(factor);
      ctx.ui.dataset.zoomFactor = String(factor);
    },
    zoomInLabel: cs('zoomIn'),
    zoomOutLabel: cs('zoomOut'),
  });
  const zoom = zoomHandle.zoom;
  ctx.ui.dataset.zoomFactor = '1';
  const run = planNumberfortRun(ctx.learning, ctx.definition, ctx.stage);
  const panel = new NumberfortPanel(ctx.ui, cs, {
    onHint: () => controller.current?.hint(),
    onNext: () => controller.current?.next(),
  });
  let size = { width: 1, height: 1 };

  const frame = (): void => {
    // The celebration card takes the panel's place (right side when wide, bottom when narrow).
    const done = ctx.ui.querySelector('.numberfort-done');
    const box = (done ?? panel.panel).getBoundingClientRect();
    const canvas = ctx.canvas.getBoundingClientRect();
    const shown = !!done || !panel.panel.hidden;
    const wide = shown && box.width < canvas.width * 0.6 && box.top < canvas.top + 120;
    view.setArea({
      ...size,
      coverRight: wide ? canvas.right - box.left + 8 : 0,
      coverBottom: shown && !wide ? canvas.bottom - box.top + 8 : 0,
    });
  };

  const controller: { current?: NumberfortRoundController } = {};
  const c = new NumberfortRoundController(ctx, cs, run.rounds, panel, {
    onRoundDone() {
      zoom.reset();
    },
    onLevelDone(earned, stars) {
      panel.hide();
      panel.say(cs('doneTitle'));
      ctx.audio.celebrate();
      ctx.announce(cs('doneTitle'));
      const bonus = ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
      const exit = () => ctx.exit({ completed: true });
      const stageLine = cs('stageLine', { n: ctx.stage, m: ctx.definition.stages, stars });
      showNumberfortCelebration(ctx.ui, cs, earned, stars, exit, bonus, stageLine, ctx.stage === 1);
      frame();
    },
  });
  controller.current = c;
  listenNumberfortKeys(c, ctx.ui, ctx.disposer.signal);
  if (import.meta.env.MODE === 'test') {
    ctx.disposer.onDispose(installNumberfortTestHook(c));
  }

  c.startRound();
  panel.say(cs('intro'));
  ctx.announce(cs('intro'));
  let frames = 0;
  let maxCalls = 0;

  return {
    scene,
    camera: view.camera,
    update(dt, _time) {
      c.update(dt);
      view.update();
      frames += 1;
      if (TRACK_DRAW_CALLS && frames > 2) {
        // The previous frame's level render (the host renders after update).
        const calls = ctx.renderer.info.render.calls;
        maxCalls = Math.max(maxCalls, calls);
        Object.assign(ctx.ui.dataset, { drawCalls: calls, maxDrawCalls: maxCalls });
      }
    },
    resize(width, height) {
      size = { width, height };
      frame();
    },
    dispose() {
      zoomHandle.dispose();
      c.destroy();
      panel.destroy();
    },
  };
}

const numberfortModule: LevelModule = { start };
export default numberfortModule;
export { start };
