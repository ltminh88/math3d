// Island level scene (own chunk): builds the islet diorama, the HUD, and hands the run
// to `startEnglishRun` (Phase 1B engine). The panel frames the run for its whole life:
// the run's widgets mount inside it, and the done card replaces them when the run
// resolves. Leaving through the host's "Về thế giới" button exits uncompleted.
import { Scene } from 'three';
import { ENGLISH_BOOKS } from '../../english/english-books';
import { type EnglishRunResult, startEnglishRun } from '../../ui/english/english-run';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { attachLevelZoom } from '../shared/level-zoom';
import '../shared/level-zoom.css';
import { IslandCamera } from './island-camera';
import { showIslandCelebration } from './island-celebration';
import { buildIslandDiorama } from './island-diorama-builder';
import { IslandPanel } from './island-panel';
import { islandStarsForResult } from './island-result';
import { ISLAND_ROUNDS, islandStageName } from './island-stage-plan';
import { islandStrings } from './island-strings';
import { installIslandTestHook } from './island-test-hook';
import './island-level.css';

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

function start(ctx: LevelContext): LevelSession {
  const cs = islandStrings(ctx.defineStrings);
  const scene = new Scene();
  scene.name = 'island';
  buildIslandDiorama(scene);
  const view = new IslandCamera();
  // Phase 25b: pinch + wheel + +/− buttons zoom the camera around the auto-fit distance.
  // The island has no drag input, so there is nothing for a pinch to cancel.
  const zoomHandle = attachLevelZoom(ctx.canvas, {
    container: ctx.ui,
    onFactor: (factor) => {
      view.setZoomFactor(factor);
      ctx.ui.dataset.zoomFactor = String(factor);
    },
    zoomInLabel: cs('zoomIn'),
    zoomOutLabel: cs('zoomOut'),
  });
  ctx.ui.dataset.zoomFactor = '1';
  const panel = new IslandPanel(ctx.ui, cs);
  panel.showStage(ctx.stage, islandStageName(ctx.stage));
  panel.say(cs('intro'));
  ctx.announce(cs('intro'));
  let size = { width: 1, height: 1 };

  const frame = (): void => {
    // The panel frames the run (and the done card, which replaces the widgets inside
    // it): shift the view out from under the panel, right side when wide, bottom narrow.
    const box = panel.panel.getBoundingClientRect();
    const canvas = ctx.canvas.getBoundingClientRect();
    const shown = !panel.panel.hidden;
    const wide = shown && box.width < canvas.width * 0.6 && box.top < canvas.top + 120;
    view.setArea({
      ...size,
      coverRight: wide ? canvas.right - box.left + 8 : 0,
      coverBottom: shown && !wide ? canvas.bottom - box.top + 8 : 0,
    });
  };

  // The run's result, for the test hook and the done card; the run may still be going
  // when the child leaves through the host button — then the card is never shown.
  let result: EnglishRunResult | null = null;
  let stars = 0;
  let disposed = false;
  if (import.meta.env.MODE === 'test') {
    ctx.disposer.onDispose(
      installIslandTestHook(() => ({
        stage: ctx.stage,
        total: ISLAND_ROUNDS,
        done: result !== null,
        result,
        stars,
      })),
    );
  }

  // R73: abort the run when the level exits mid-run (Phase 3B added `signal`
  // to the port): without this the engine's promise dangles — its round
  // waiter never resolves, the speaker is never disposed, and the live state
  // stays mid-run. The promise resolves `{completed: false}`; the `.then`
  // below still returns early on `disposed`, so no done card shows.
  const runAbort = new AbortController();
  void startEnglishRun({
    book: ENGLISH_BOOKS.cec,
    stage: ctx.stage,
    ui: panel.runRoot,
    learning: ctx.learning,
    signal: runAbort.signal,
  }).then((run) => {
    if (disposed) return;
    result = run;
    stars = islandStarsForResult(run);
    // The celebration's "Về cổng" button sits under the top-bar zoom group on
    // landscape (the same overlap that went red on #59's tablet-landscape shard 2):
    // hide the group now — there is nothing left to zoom once the run is done.
    // dispose() removes the group and its listeners; the session's own dispose()
    // calls it again on teardown, which is a no-op on the detached group.
    zoomHandle.dispose();
    const bonus = run.completed && ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
    const exit = () => ctx.exit({ completed: run.completed });
    const stageLine = cs('stageLine', { n: ctx.stage, m: ctx.definition.stages, stars });
    panel.runRoot.replaceChildren();
    showIslandCelebration(panel.runRoot, cs, run, stars, exit, bonus, stageLine);
    frame();
  });

  let frames = 0;
  let maxCalls = 0;

  return {
    scene,
    camera: view.camera,
    update(_dt, _time) {
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
      disposed = true;
      runAbort.abort();
      zoomHandle.dispose();
      panel.destroy();
    },
  };
}

const islandModule: LevelModule = { start };
export default islandModule;
export { start };
