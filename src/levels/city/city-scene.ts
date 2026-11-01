// City level scene (own chunk): builds the street, the parcels, the windows building and the HUD,
// wires the shared input facade and the panel to the round controller, and ends with the
// celebration ("Về cổng" exits as completed after every round was recorded).
import { Scene } from 'three';
import { LEVEL_COMPLETE_BONUS } from '../shared/level-run-result';
import type { LevelContext, LevelModule, LevelSession } from '../shared/level-types';
import { CityBuildingView } from './city-building-view';
import { buildingFrame, CityCamera, STREET_FRAME } from './city-camera';
import { showCityCelebration } from './city-celebration';
import { planCityRun, startCityReasoningRound } from './city-compare-round';
import { buildCityDiorama } from './city-diorama-builder';
import { wireCityInput } from './city-input';
import { CityLabels } from './city-labels';
import { CityPanel } from './city-panel';
import { CityRoundController } from './city-round-controller';
import { CityRoundFlow } from './city-round-flow';
import { CityStreetView } from './city-street-view';
import { cityStrings } from './city-strings';
import { installCityTestHook } from './city-test-hook';
import './city-hud-and-panel.css';
import './city-labels-celebration-responsive.css';

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';
/** Building shown fully lit behind the celebration card. */
const CELEBRATION_BUILDING = { floors: 8, perFloor: 7 } as const;

function start(ctx: LevelContext): LevelSession {
  const ts = cityStrings(ctx.defineStrings);
  const scene = new Scene();
  scene.name = 'city';
  const { root, houses, sun } = buildCityDiorama(scene);
  const street = new CityStreetView(ctx.reducedMotion);
  const building = new CityBuildingView();
  root.add(street.group, building.group);
  const view = new CityCamera();
  const labels = new CityLabels(ctx.ui);
  const cityRun = planCityRun(ctx.learning, ctx.definition);
  const flow = new CityRoundFlow(cityRun.rounds, () => performance.now(), cityRun.total);
  let reasoned = false;
  // Created before the number pad: both listen on document, and the 3D keyboard layer must see
  // Enter first (it leaves Enter to the pad unless a parcel, house or floor has 3D focus).
  const interaction = ctx.input.createInteraction(view.camera);
  const controller: { current?: CityRoundController } = {};
  const run = (fn: (c: CityRoundController) => void) => () => {
    if (controller.current) fn(controller.current);
  };
  const panel = new CityPanel(ctx.ui, ts, {
    onChoice: (value) => controller.current?.answer(value),
    onLight: run((c) => c.light()),
    onHint: run((c) => c.hint()),
    onNext: run((c) => c.next()),
    onSubmit: (value) => controller.current?.answer(value),
  });
  let size = { width: 1, height: 1 };
  let doneCard: HTMLElement | undefined;

  const frame = (): void => {
    const canvas = ctx.canvas.getBoundingClientRect();
    // What covers the canvas: VLM's line on top, and the panel (or the celebration card) on the
    // right when it stands there (wide, short landscape) or along the bottom (portrait).
    const cover = doneCard ?? (panel.panel.hidden ? undefined : panel.panel);
    const box = cover?.getBoundingClientRect();
    // By its centre: the card pops in scaled about its centre, and a centred card is at the bottom.
    const right = !!box && box.left + box.width / 2 > canvas.left + canvas.width * 0.6;
    const guide = panel.guide.getBoundingClientRect();
    view.setArea({
      ...size,
      coverTop: guide.height > 0 ? Math.max(0, guide.bottom - canvas.top + 6) : 0,
      coverRight: box && right ? canvas.right - box.left + 8 : 0,
      coverBottom: box && !right ? canvas.bottom - box.top + 8 : 0,
    });
    labels.place(view.camera);
  };

  const c = new CityRoundController(ctx, ts, flow, panel, street, building, houses, {
    onChanged(newRound) {
      refresh();
      if (newRound) {
        const windows = c.round?.kind === 'windows';
        view.setFrame(windows ? buildingFrame(building.width, building.height) : STREET_FRAME);
      }
      frame();
    },
    onLevelDone(earned, stars) {
      interaction.setPickables([]);
      interaction.setZones([]);
      labels.set([]);
      const { reasoning } = cityRun;
      if (reasoning && !reasoned) {
        // The last round: the parcel puzzle, then this celebration with its outcome counted.
        reasoned = true;
        startCityReasoningRound(ctx, ts, panel, c, { ...cityRun, reasoning }, () =>
          this.onLevelDone(c.tally.earned(), c.tally.stars()),
        );
        frame();
        return;
      }
      panel.hide();
      panel.say(ts('doneTitle'));
      street.hide();
      houses.visible = false;
      building.show(CELEBRATION_BUILDING.floors, CELEBRATION_BUILDING.perFloor);
      building.lightAll();
      view.setFrame(buildingFrame(building.width, building.height));
      ctx.audio.celebrate();
      ctx.announce(ts('doneTitle'));
      const bonus = ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
      const exit = () => ctx.exit({ completed: true });
      doneCard = showCityCelebration(ctx.ui, ts, earned, stars, exit, bonus);
      doneCard.addEventListener('animationend', frame, { once: true });
      frame();
    },
  });
  controller.current = c;

  function refresh(): void {
    const windows = c.round?.kind === 'windows';
    const active = c.active;
    interaction.setPickables(active ? (windows ? building.pickables() : street.pickables()) : []);
    interaction.setZones(active && !windows ? street.zones() : []);
    labels.set(windows ? building.labels(c.floorSteps, c.bandTexts) : street.labels());
  }

  wireCityInput(ctx, ts, interaction, c, panel, street, refresh);
  if (import.meta.env.MODE === 'test') {
    ctx.disposer.onDispose(installCityTestHook(c, street, building, view.camera, ctx.canvas));
  }
  c.startRound();
  panel.say(ts('intro'));
  ctx.announce(ts('intro'));
  let frames = 0;
  let maxCalls = 0;

  return {
    scene,
    camera: view.camera,
    update(dt) {
      c.update(dt);
      const moving = street.animating;
      street.update(dt);
      if (moving) labels.place(view.camera);
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
      labels.destroy();
    },
  };
}

const cityModule: LevelModule = { start };
export default cityModule;
export { start };
