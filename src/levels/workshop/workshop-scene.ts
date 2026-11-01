// Workshop level scene (own chunk): builds the shed and the live tools, plans six orders (ruler,
// fence, tiles of the same rectangle, one more, two instruments; weak skills first, tiers by box)
// and wires the boards, step cards, keys, camera and the celebration.
import { Scene } from 'three';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { WorkshopBenchProps } from './workshop-bench-props';
import { WorkshopCamera } from './workshop-camera';
import { showWorkshopCelebration } from './workshop-celebration';
import { buildWorkshopDiorama } from './workshop-diorama-builder';
import { workshopHintStrings } from './workshop-hint-strings';
import { listenWorkshopKeys } from './workshop-input';
import { WorkshopPanel } from './workshop-panel';
import { WorkshopRoundController } from './workshop-round-controller';
import { WorkshopRoundFlow } from './workshop-round-flow';
import { planWorkshopRounds } from './workshop-round-plan';
import { planWorkshopSkills } from './workshop-stations';
import { workshopStrings } from './workshop-strings';
import { installWorkshopTestHook } from './workshop-test-hook';
import './workshop-level.css';
import './workshop-board.css';

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

function start(ctx: LevelContext): LevelSession {
  const ws = workshopStrings(ctx.defineStrings);
  const hs = workshopHintStrings(ctx.defineStrings);
  const scene = new Scene();
  scene.name = 'workshop';
  const { sun } = buildWorkshopDiorama(scene);
  const props = new WorkshopBenchProps(scene, ctx.reducedMotion);
  const view = new WorkshopCamera(ctx.reducedMotion);
  const stats = ctx.learning.stats();
  const skills = planWorkshopSkills(stats, ctx.learning.rng, ctx.definition.rounds);
  const flow = new WorkshopRoundFlow(planWorkshopRounds(skills, stats, ctx.learning.rng), () =>
    performance.now(),
  );
  const controller: { current?: WorkshopRoundController } = {};
  const panel = new WorkshopPanel(ctx.ui, ws, {
    onHint: () => controller.current?.hint(),
    onNext: () => controller.current?.next(),
  });
  let size = { width: 1, height: 1 };

  const frame = (): void => {
    const done = ctx.ui.querySelector('.workshop-done');
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

  const c = new WorkshopRoundController(ctx, ws, hs, flow, panel, {
    onRound(round) {
      props.setStation(round.station, round.item.scene);
      view.focus(round.station);
    },
    onTiles(grids) {
      const grid = grids[0];
      if (!grid) return;
      const cells = grid.cells.filter(([x, y]) => grid.has(x, y));
      const w = Math.max(...grid.cells.map(([x]) => x)) + 1;
      const h = Math.max(...grid.cells.map(([, y]) => y)) + 1;
      props.setTiles(cells, { w, h });
    },
    onLevelDone(earned, stars) {
      panel.hide();
      panel.say(ws('doneTitle'));
      ctx.audio.celebrate();
      ctx.announce(ws('doneTitle'));
      const bonus = ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
      showWorkshopCelebration(
        ctx.ui,
        ws,
        earned,
        stars,
        () => ctx.exit({ completed: true }),
        bonus,
      );
      frame();
    },
  });
  controller.current = c;
  listenWorkshopKeys(c, ctx.ui, ctx.disposer.signal);
  if (import.meta.env.MODE === 'test') ctx.disposer.onDispose(installWorkshopTestHook(c));

  c.startRound();
  panel.say(ws('intro'));
  ctx.announce(ws('intro'));
  let frames = 0;
  let maxCalls = 0;

  return {
    scene,
    camera: view.camera,
    update(dt, time) {
      props.update(dt, time);
      view.update(dt);
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
      sun.shadow.dispose();
      c.clear();
      panel.destroy();
    },
  };
}

const workshopModule: LevelModule = { start };
export default workshopModule;
export { start };
