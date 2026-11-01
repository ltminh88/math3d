// Valley level scene (own chunk): builds the valley and its stone board, plans the six rounds
// (weak geo-* skills first, kinds taking turns, tiers from the Leitner box) and wires the board
// taps, the step card, keys, the view turn, the garden stones and the celebration.
import { Scene } from 'three';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { ValleyBoardViews } from './valley-board-views';
import { ValleyCamera } from './valley-camera';
import { showValleyCelebration } from './valley-celebration';
import { buildValleyDiorama } from './valley-diorama-builder';
import { ValleyGardenStonesView } from './valley-garden-stones-view';
import { listenValleyKeys } from './valley-input';
import { ValleyPanel } from './valley-panel';
import { ValleyRoundController } from './valley-round-controller';
import { buildValleyRounds, ValleyRoundFlow } from './valley-round-flow';
import { planValleyRounds, type ValleyRoundSpec, valleyFactPool } from './valley-round-plan';
import { valleyStrings, valleyText } from './valley-strings';
import { installValleyTestHook } from './valley-test-hook';
import './valley-level.css';
import './valley-board-targets.css';
import './valley-responsive.css';

const TEST_BUILD = import.meta.env.MODE === 'test';

function planRounds(ctx: LevelContext): ValleyRoundSpec[] {
  const forced = TEST_BUILD ? window.__valleyPlan : undefined;
  if (forced && forced.length > 0) return forced;
  const stats = ctx.learning.stats();
  const rounds = ctx.definition.rounds;
  return planValleyRounds(ctx.learning.planSession(valleyFactPool(stats), rounds), stats, rounds);
}

function start(ctx: LevelContext): LevelSession {
  const vs = valleyStrings(ctx.defineStrings);
  const scene = new Scene();
  scene.name = 'valley';
  const { sun } = buildValleyDiorama(scene);
  const camera = new ValleyCamera(ctx.reducedMotion);
  const flow = new ValleyRoundFlow(buildValleyRounds(planRounds(ctx), ctx.learning.rng), () =>
    performance.now(),
  );
  const ref: { controller?: ValleyRoundController } = {};
  const board = new ValleyBoardViews(
    scene,
    ctx.ui,
    camera,
    ctx.reducedMotion,
    (target) => valleyText(vs, target.name.key, target.name.params),
    (id) => ref.controller?.tap(id),
  );
  const garden = new ValleyGardenStonesView(scene);
  const panel = new ValleyPanel(ctx.ui, vs, {
    onHint: () => ref.controller?.hint(),
    onNext: () => ref.controller?.next(),
    onRotate: (direction) => camera.rotate(direction),
  });
  let size = { width: 1, height: 1 };

  /** Keeps the board in the part of the canvas that VLM's line and the panel leave free. */
  const frame = (): void => {
    const done = ctx.ui.querySelector('.valley-done');
    const box = (done ?? panel.panel).getBoundingClientRect();
    const canvas = ctx.canvas.getBoundingClientRect();
    const shown = !!done || !panel.panel.hidden;
    const wide = shown && box.width < canvas.width * 0.6 && box.top < canvas.top + 140;
    const guide = panel.guide.getBoundingClientRect();
    camera.setArea({
      ...size,
      coverTop: Math.max(0, guide.bottom - canvas.top + 4),
      coverRight: wide ? canvas.right - box.left + 8 : 0,
      coverBottom: shown && !wide ? canvas.bottom - box.top + 8 : 0,
    });
  };

  const controller = new ValleyRoundController(ctx, vs, flow, panel, board, {
    onRoundDone(index) {
      garden.setCount(index + 1);
    },
    onLevelDone(earned, stars) {
      panel.hide();
      panel.say(vs('doneTitle'));
      board.clear();
      camera.frame(9, 5.5);
      ctx.audio.celebrate();
      ctx.announce(vs('doneTitle'));
      const bonus = ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
      showValleyCelebration(ctx.ui, vs, earned, stars, () => ctx.exit({ completed: true }), bonus);
      frame();
    },
  });
  ref.controller = controller;
  listenValleyKeys(controller, ctx.ui, ctx.disposer.signal);
  if (TEST_BUILD) ctx.disposer.onDispose(installValleyTestHook(controller, () => garden.count));

  controller.startRound();
  panel.say(vs('intro'));
  ctx.announce(vs('intro'));
  let frames = 0;
  let maxCalls = 0;

  return {
    scene,
    camera: camera.camera,
    update(dt) {
      controller.update(dt);
      frames += 1;
      // The panel grows and shrinks with the card: re-fit the board now and then (cheap).
      if (frames % 20 === 1) frame();
      if (TEST_BUILD && frames > 2) {
        // The previous frame's level render (the host renders after update).
        const calls = ctx.renderer.info.render.calls;
        maxCalls = Math.max(maxCalls, calls);
        Object.assign(ctx.ui.dataset, { drawCalls: calls, maxDrawCalls: maxCalls });
      }
    },
    resize(width, height) {
      size = { width, height };
      board.labels.setSize(width, height);
      frame();
    },
    dispose() {
      sun.shadow.dispose();
      controller.destroy();
      board.dispose();
      garden.dispose();
      panel.destroy();
    },
  };
}

const valleyModule: LevelModule = { start };
export default valleyModule;
export { start };
