// Garden level scene (own chunk): builds the garden, the flower row, the balance and the seed
// bags, plans six rounds over the pattern / unknown / expression skills (kinds rotating, tiers by
// skill box) and wires the panel, the step cards, keys and the celebration ("Về cổng" exits as
// completed after every round was recorded).
import { Scene } from 'three';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { GardenBalanceView } from './garden-balance-view';
import { GardenCamera } from './garden-camera';
import { showGardenCelebration } from './garden-celebration';
import { buildGardenDiorama } from './garden-diorama-builder';
import { listenGardenKeys } from './garden-input';
import { GardenPanel } from './garden-panel';
import { GardenPatternRowView } from './garden-pattern-row-view';
import { gardenPromptRenderer } from './garden-prompt-render';
import { GardenRoundController, type GardenViews } from './garden-round-controller';
import { GardenRoundFlow } from './garden-round-flow';
import { gardenSkillPool, planGardenRounds } from './garden-round-plan';
import { GardenSeedBagView } from './garden-seed-bag-view';
import { gardenStrings } from './garden-strings';
import { installGardenTestHook } from './garden-test-hook';
import './garden-level.css';
import './garden-celebration-and-responsive.css';

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

function start(ctx: LevelContext): LevelSession {
  const gs = gardenStrings(ctx.defineStrings);
  const render = gardenPromptRenderer(gs);
  const scene = new Scene();
  scene.name = 'garden';
  const { sun } = buildGardenDiorama(scene);
  const views: GardenViews = {
    row: new GardenPatternRowView(ctx.reducedMotion),
    balance: new GardenBalanceView(ctx.reducedMotion),
    bags: new GardenSeedBagView(ctx.reducedMotion),
  };
  scene.add(views.row.group, views.balance.group, views.bags.group);
  const view = new GardenCamera();
  const rounds = ctx.definition.rounds;
  const planned = ctx.learning.planSession(gardenSkillPool(), rounds);
  const plan = planGardenRounds(planned, ctx.learning.stats(), ctx.learning.rng, rounds);
  const flow = new GardenRoundFlow(plan, () => performance.now());
  const controller: { current?: GardenRoundController } = {};
  const panel = new GardenPanel(ctx.ui, gs, {
    onHint: () => controller.current?.hint(),
    onNext: () => controller.current?.next(),
  });
  let size = { width: 1, height: 1 };
  let doneCard: HTMLElement | undefined;

  const frame = (): void => {
    const canvas = ctx.canvas.getBoundingClientRect();
    // What covers the canvas: VLM's line on top, and the panel (or the celebration card) on the
    // right when it stands there (wide, short landscape) or along the bottom (portrait).
    const cover = doneCard ?? (panel.panel.hidden ? undefined : panel.panel);
    const box = cover?.getBoundingClientRect();
    const right = !!box && box.left + box.width / 2 > canvas.left + canvas.width * 0.6;
    const guide = panel.guide.getBoundingClientRect();
    view.setArea({
      ...size,
      coverTop: guide.height > 0 ? Math.max(0, guide.bottom - canvas.top + 6) : 0,
      coverRight: box && right ? canvas.right - box.left + 8 : 0,
      coverBottom: box && !right ? canvas.bottom - box.top + 8 : 0,
    });
  };

  const c = new GardenRoundController(ctx, gs, flow, panel, views, render, {
    onLevelDone(earned, stars) {
      panel.hide();
      panel.say(gs('doneTitle'));
      views.row.group.visible = true;
      views.row.show([]);
      ctx.audio.celebrate();
      ctx.announce(gs('doneTitle'));
      const bonus = ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
      const exit = () => ctx.exit({ completed: true });
      doneCard = showGardenCelebration(ctx.ui, gs, earned, stars, exit, bonus);
      frame();
    },
  });
  controller.current = c;
  listenGardenKeys(c, ctx.ui, ctx.disposer.signal);
  if (import.meta.env.MODE === 'test') {
    ctx.disposer.onDispose(installGardenTestHook(flow, views, render));
  }

  c.startRound();
  panel.say(gs('intro'));
  ctx.announce(gs('intro'));
  let frames = 0;
  let maxCalls = 0;

  return {
    scene,
    camera: view.camera,
    update(dt, time) {
      c.update(dt);
      views.row.update(dt, time);
      views.balance.update(dt);
      views.bags.update(dt);
      frames += 1;
      if (frames % 30 === 0) frame();
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
      c.destroy();
      panel.destroy();
    },
  };
}

const gardenModule: LevelModule = { start };
export default gardenModule;
export { start };
