// Forest level scene (own chunk): builds the clearing, the friends, fruit and HUD, wires the
// shared input facade (drag + tap-select + keyboard) and the number pad to the round controller.
import { Scene } from 'three';
import type { InteractionEvent } from '../../core/input/interaction-types';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { createAnimalMaterial } from './animal-friend-factory';
import { FactFamilyCard } from './fact-family-card';
import { ForestCamera } from './forest-camera';
import { showForestCelebration } from './forest-celebration';
import { ForestCountLabels } from './forest-count-labels';
import { buildForestDiorama } from './forest-diorama-builder';
import { varyForestFacts } from './forest-fact-variety';
import { FRUIT_Y } from './forest-layout';
import { ForestPanel } from './forest-panel';
import { ForestRoundController } from './forest-round-controller';
import { ForestRoundFlow, forestFactPool, planForestRounds } from './forest-round-flow';
import { forestStrings } from './forest-strings';
import { ForestTableView } from './forest-table-view';
import { fruitIndexOf } from './fruit-pile';
import './forest-hud-and-answer-panel.css';
import './forest-labels-celebration-responsive.css';

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

function start(ctx: LevelContext): LevelSession {
  const ts = forestStrings(ctx.defineStrings);
  const scene = new Scene();
  scene.name = 'forest';
  const { root, sun } = buildForestDiorama(scene);
  const table = new ForestTableView(root, createAnimalMaterial(), ts, ctx.reducedMotion);
  const view = new ForestCamera();
  const labels = new ForestCountLabels(ctx.ui);
  const stats = ctx.learning.stats();
  const pool = forestFactPool(stats);
  const planned = ctx.learning.planSession(pool, ctx.definition.rounds);
  const facts = varyForestFacts(planned, pool, ctx.learning.rng);
  const flow = new ForestRoundFlow(planForestRounds(facts, stats), () => performance.now());
  const controller: { current?: ForestRoundController } = {};
  const run = (fn: (c: ForestRoundController) => void) => () => {
    if (controller.current) fn(controller.current);
  };
  // Created before the number pad: both listen on document, and the 3D keyboard layer must see
  // Enter first (it leaves Enter to the pad unless a fruit or friend has 3D focus).
  const interaction = ctx.input.createInteraction(view.camera);
  interaction.setPlaneY(FRUIT_Y);
  const panel = new ForestPanel(ctx.ui, ts, {
    onDeal: run((c) => c.deal()),
    onCheck: run((c) => c.check()),
    onHint: run((c) => c.hint()),
    onNext: run((c) => c.next()),
    onSubmit: (value) => controller.current?.submit(value),
    onDigits: (digits) => card.showDigits(digits),
  });
  const card = new FactFamilyCard(panel.question, ts);
  let size = { width: 1, height: 1 };

  const frame = (): void => {
    const box = panel.panel.getBoundingClientRect();
    const canvas = ctx.canvas.getBoundingClientRect();
    const wide =
      !panel.panel.hidden && box.width < canvas.width * 0.6 && box.top < canvas.top + 120;
    view.setArea({
      ...size,
      coverRight: wide ? canvas.right - box.left + 8 : 0,
      coverBottom: !panel.panel.hidden && !wide ? canvas.bottom - box.top + 8 : 0,
    });
    labels.place(view.camera);
  };

  const c = new ForestRoundController(ctx, ts, flow, panel, card, table, labels, {
    onTableChanged(snap) {
      const active = c.interactive;
      interaction.setPickables(active ? table.props.pickables() : []);
      interaction.setZones(active ? table.zones(c.sharing) : []);
      labels.set(c.round?.kind === 'family' ? [] : table.labels(c.sharing));
      const kind = c.round?.kind === 'pack' ? 'pack' : 'share';
      if (snap) view.setExtent(table.extent(kind, c.sharing.groups));
      labels.place(view.camera);
    },
    onLevelDone(earned) {
      interaction.setPickables([]);
      interaction.setZones([]);
      labels.set([]);
      panel.hide();
      panel.say(ts('doneTitle'));
      table.celebrate();
      ctx.audio.celebrate();
      ctx.announce(ts('doneTitle'));
      const bonus = ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
      showForestCelebration(ctx.ui, ts, earned, () => ctx.exit({ completed: true }), bonus);
      frame();
    },
  });
  controller.current = c;

  const onInput = (event: InteractionEvent): void => {
    const props = table.props;
    if (event.type === 'tap-select') {
      props.setSelected(event.itemId === null ? null : fruitIndexOf(event.itemId));
    } else if (event.type === 'focus') {
      if (event.kind === 'item' && event.id) {
        const p = props.position(fruitIndexOf(event.id));
        props.focus(p ? { x: p.x, z: p.z } : null, 0.6);
      } else if (event.kind === 'zone' && event.id) {
        props.focus(table.zoneCenter(event.id, c.sharing), event.id === 'pile' ? 2.4 : 2);
      } else props.focus(null);
    } else if (event.type === 'drag-move') {
      props.dragTo(fruitIndexOf(event.itemId), event.position);
    } else if (event.type === 'drop' || event.type === 'cancel') {
      props.focus(null);
      props.setSelected(null);
      c.move(fruitIndexOf(event.itemId), event.type === 'drop' ? event.zoneId : null);
    }
  };
  interaction.events.on(onInput);

  c.startRound();
  panel.say(ts('intro'));
  ctx.announce(ts('intro'));
  let frames = 0;
  let maxCalls = 0;

  return {
    scene,
    camera: view.camera,
    update(dt, time) {
      c.update(dt);
      table.update(dt, time);
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
      labels.setSize(width, height);
      frame();
    },
    dispose() {
      sun.shadow.dispose();
      panel.destroy();
      labels.root.remove();
    },
  };
}

const forestModule: LevelModule = { start };
export default forestModule;
export { start };
