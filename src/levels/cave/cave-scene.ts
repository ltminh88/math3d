// Cave level scene (own chunk): builds the cave, the crystals and the chest, the HUD, plans the
// seven chambers (weakest skill first, the required chapter 2 mix) and wires answers, keys, the
// chamber camera and the celebration at the treasure chest.
import { Scene } from 'three';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { showCaveCelebration } from './cave-celebration';
import { CaveChamberCamera } from './cave-chamber-camera';
import { buildCaveChambers, caveSkillPool, planCaveSkills } from './cave-chamber-formats';
import { CaveCrystalView } from './cave-crystal-view';
import { buildCaveDiorama } from './cave-diorama-builder';
import { listenCaveKeys } from './cave-input';
import { CHAMBER_COUNT, TREASURE_INDEX } from './cave-layout';
import { CavePanel } from './cave-panel';
import { CaveRoundController } from './cave-round-controller';
import { CaveRoundFlow } from './cave-round-flow';
import { caveStrings } from './cave-strings';
import { installCaveTestHook } from './cave-test-hook';
import './cave-level.css';

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

function start(ctx: LevelContext): LevelSession {
  const cs = caveStrings(ctx.defineStrings);
  const scene = new Scene();
  scene.name = 'cave';
  buildCaveDiorama(scene);
  const crystals = new CaveCrystalView(scene, ctx.reducedMotion);
  const walk = new CaveChamberCamera(ctx.reducedMotion);
  const stats = ctx.learning.stats();
  const rounds = Math.min(ctx.definition.rounds, CHAMBER_COUNT);
  const planned = ctx.learning.planSession(caveSkillPool(), rounds);
  const ids = planCaveSkills(planned, stats, ctx.learning.rng, rounds);
  const flow = new CaveRoundFlow(buildCaveChambers(ids, stats, ctx.learning.rng), () =>
    performance.now(),
  );
  const controller: { current?: CaveRoundController } = {};
  const panel = new CavePanel(ctx.ui, cs, {
    onHint: () => controller.current?.hint(),
    onNext: () => controller.current?.next(),
  });
  let size = { width: 1, height: 1 };

  const frame = (): void => {
    // The celebration card takes the panel's place (right side when wide, bottom when narrow).
    const done = ctx.ui.querySelector('.cave-done');
    const box = (done ?? panel.panel).getBoundingClientRect();
    const canvas = ctx.canvas.getBoundingClientRect();
    const shown = !!done || !panel.panel.hidden;
    const wide = shown && box.width < canvas.width * 0.6 && box.top < canvas.top + 120;
    walk.setArea({
      ...size,
      coverRight: wide ? canvas.right - box.left + 8 : 0,
      coverBottom: shown && !wide ? canvas.bottom - box.top + 8 : 0,
    });
  };

  const c = new CaveRoundController(ctx, cs, flow, panel, {
    onChamberDone(i) {
      crystals.light(i);
      walk.goTo(i + 1 < flow.chambers.length ? i + 1 : TREASURE_INDEX);
    },
    onLevelDone(earned, stars) {
      panel.hide();
      panel.say(cs('doneTitle'));
      crystals.celebrate();
      walk.goTo(TREASURE_INDEX);
      ctx.audio.celebrate();
      ctx.announce(cs('doneTitle'));
      const bonus = ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
      const exit = () => ctx.exit({ completed: true });
      showCaveCelebration(ctx.ui, cs, earned, stars, exit, bonus);
      frame();
    },
  });
  controller.current = c;
  listenCaveKeys(c, ctx.ui, ctx.disposer.signal);
  if (import.meta.env.MODE === 'test') {
    ctx.disposer.onDispose(installCaveTestHook(flow, crystals, walk));
  }

  c.startRound();
  walk.goTo(0);
  panel.say(cs('intro'));
  ctx.announce(cs('intro'));
  let frames = 0;
  let maxCalls = 0;

  return {
    scene,
    camera: walk.camera,
    update(dt, time) {
      c.update(dt);
      crystals.update(dt, time);
      walk.update(dt);
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
      c.destroy();
      panel.destroy();
    },
  };
}

const caveModule: LevelModule = { start };
export default caveModule;
export { start };
