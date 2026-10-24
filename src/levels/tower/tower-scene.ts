// Tower level scene (own chunk): builds the tower, the floor lights and fallen stones, the HUD,
// plans the seven floors (weak facts first, × and :) and wires answers, keys, the climbing camera
// and the celebration at the beacon.
import { Scene } from 'three';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { showTowerCelebration } from './tower-celebration';
import { TowerClimbCamera } from './tower-climb-camera';
import { buildTowerDiorama } from './tower-diorama-builder';
import { TowerFloorView } from './tower-floor-view';
import { listenTowerKeys } from './tower-keyboard';
import { FLOOR_COUNT } from './tower-layout';
import { TowerPanel } from './tower-panel';
import { TowerQuestionCard } from './tower-question-card';
import { TowerRoundController } from './tower-round-controller';
import {
  planTowerFacts,
  planTowerQuestions,
  TowerRoundFlow,
  towerFactPool,
} from './tower-round-flow';
import { towerStrings } from './tower-strings';
import { installTowerTestHook } from './tower-test-hook';
import './tower-hud-and-answer-panel.css';
import './tower-celebration-and-responsive.css';

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

function start(ctx: LevelContext): LevelSession {
  const ts = towerStrings(ctx.defineStrings);
  const scene = new Scene();
  scene.name = 'tower';
  const { sun } = buildTowerDiorama(scene);
  const floors = new TowerFloorView(scene, ctx.reducedMotion);
  const climb = new TowerClimbCamera(ctx.reducedMotion);
  const stats = ctx.learning.stats();
  const rounds = Math.min(ctx.definition.rounds, FLOOR_COUNT);
  const planned = ctx.learning.planSession(towerFactPool(), rounds);
  const facts = planTowerFacts(planned, stats, ctx.learning.rng, rounds);
  const questions = planTowerQuestions(facts, stats, ctx.learning.rng);
  const flow = new TowerRoundFlow(questions, () => performance.now());
  const controller: { current?: TowerRoundController } = {};
  const panel = new TowerPanel(ctx.ui, ts, {
    onPick: (index) => controller.current?.pick(index),
    onHint: () => controller.current?.hint(),
    onNext: () => controller.current?.next(),
    onSubmit: (value) => controller.current?.submit(value),
    onDigits: (digits) => card.showDigits(digits),
  });
  const card = new TowerQuestionCard(panel.question, ts);
  let size = { width: 1, height: 1 };

  const frame = (): void => {
    // The celebration card takes the panel's place (right side when wide, bottom when narrow).
    const done = ctx.ui.querySelector('.tower-done');
    const box = (done ?? panel.panel).getBoundingClientRect();
    const canvas = ctx.canvas.getBoundingClientRect();
    const shown = !!done || !panel.panel.hidden;
    const wide = shown && box.width < canvas.width * 0.6 && box.top < canvas.top + 120;
    climb.setArea({
      ...size,
      coverRight: wide ? canvas.right - box.left + 8 : 0,
      coverBottom: shown && !wide ? canvas.bottom - box.top + 8 : 0,
    });
  };

  const c = new TowerRoundController(ctx, ts, flow, panel, card, {
    onFloorDone(floor) {
      floors.light(floor);
      climb.climbTo(floor + 1);
    },
    onLevelDone(earned, tally) {
      panel.hide();
      panel.say(ts('doneTitle'));
      floors.celebrate();
      climb.climbTo(FLOOR_COUNT);
      ctx.audio.celebrate();
      ctx.announce(ts('doneTitle'));
      showTowerCelebration(ctx.ui, ts, earned, tally, () => ctx.exit({ completed: true }));
      frame();
    },
  });
  controller.current = c;
  listenTowerKeys(c, ctx.disposer.signal);
  if (import.meta.env.MODE === 'test') {
    ctx.disposer.onDispose(installTowerTestHook(flow, floors, climb));
  }

  c.startRound();
  panel.say(ts('intro'));
  ctx.announce(ts('intro'));
  let frames = 0;
  let maxCalls = 0;

  return {
    scene,
    camera: climb.camera,
    update(dt, time) {
      c.update(dt);
      floors.update(dt, time);
      climb.update(dt);
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
      panel.destroy();
    },
  };
}

const towerModule: LevelModule = { start };
export default towerModule;
export { start };
