// Market level scene (own chunk): builds the stalls, the HUD, plans the six rounds (the
// stage's family, weakest skill first) and wires answers, keys, the framing camera and the
// celebration at the full basket.
import { Scene } from 'three';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { attachLevelZoom } from '../shared/level-zoom';
import '../shared/level-zoom.css';
import { MarketCamera } from './market-camera';
import { showMarketCelebration } from './market-celebration';
import { buildMarketDiorama } from './market-diorama-builder';
import { listenMarketKeys } from './market-input';
import { MarketPanel } from './market-panel';
import { MarketRoundController } from './market-round-controller';
import { planMarketRun } from './market-stage-plan';
import { marketStrings } from './market-strings';
import { installMarketTestHook } from './market-test-hook';
import './market-level.css';

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

function start(ctx: LevelContext): LevelSession {
  const cs = marketStrings(ctx.defineStrings);
  const scene = new Scene();
  scene.name = 'market';
  buildMarketDiorama(scene);
  const view = new MarketCamera();
  // Phase 25b: pinch + wheel + +/− buttons zoom the camera around the auto-fit distance.
  // The market has no drag input, so there is nothing for a pinch to cancel.
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
  const run = planMarketRun(ctx.learning, ctx.definition, ctx.stage);
  const panel = new MarketPanel(ctx.ui, cs, {
    onHint: () => controller.current?.hint(),
    onNext: () => controller.current?.next(),
  });
  let size = { width: 1, height: 1 };

  const frame = (): void => {
    // The celebration card takes the panel's place (right side when wide, bottom when narrow).
    const done = ctx.ui.querySelector('.market-done');
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

  const controller: { current?: MarketRoundController } = {};
  const c = new MarketRoundController(ctx, cs, run.rounds, panel, {
    onRoundDone() {
      zoom.reset();
    },
    onLevelDone(earned, stars) {
      // The celebration's "Về cổng" button sits under the top-bar zoom group on
      // landscape (the group moved there in #60, left 210px, z-index 7): hide the
      // group now — there is nothing left to zoom once the run is done. dispose()
      // removes the group and its listeners; the session's own dispose() calls it
      // again on teardown, which is a no-op on the detached group.
      zoomHandle.dispose();
      panel.hide();
      panel.say(cs('doneTitle'));
      ctx.audio.celebrate();
      ctx.announce(cs('doneTitle'));
      const bonus = ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
      const exit = () => ctx.exit({ completed: true });
      const stageLine = cs('stageLine', { n: ctx.stage, m: ctx.definition.stages, stars });
      showMarketCelebration(ctx.ui, cs, earned, stars, exit, bonus, stageLine, ctx.stage === 1);
      frame();
    },
  });
  controller.current = c;
  listenMarketKeys(c, ctx.ui, ctx.disposer.signal);
  if (import.meta.env.MODE === 'test') {
    ctx.disposer.onDispose(installMarketTestHook(c));
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

const marketModule: LevelModule = { start };
export default marketModule;
export { start };
