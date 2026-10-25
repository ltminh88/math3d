// Field level scene (own chunk): stage + diorama + planting grid + HUD wired to the round game.
// Keyboard (WCAG 2.5.7 alternative to dragging): arrows move the cell focus, Enter plants,
// R turns the plot, H asks for a hint, 1-4 + Enter pick equations. Listens on `document` with the
// level disposer's signal, in the capture phase so planting keys never reach the 3D tap layer.
import type { LevelContext, LevelSession } from '../shared/level-types';
import { buildFieldDiorama } from './field-diorama-builder';
import { createFieldGame, type FieldGame } from './field-game';
import { createFieldHud } from './field-hud';
import { createMaterialCache } from './field-materials';
import { createPlantingInput } from './field-planting-input';
import { createProjectedLabels } from './field-projected-labels';
import { createFieldStage } from './field-stage';
import { tf } from './field-strings';
import { installFieldTestHook } from './field-test-hook';
import { isPlanted, moveFocus } from './planting-grid';
import { CELL, createGridView } from './planting-grid-view';

/** Camera framing radius of a plot (same either way round) plus its stakes and basket. */
const frameRadius = (rows: number, cols: number) =>
  Math.max(5.2, 0.5 * Math.hypot(rows, cols) * CELL + 1.8);
/** The celebration pulls back to show every restored patch. */
const CELEBRATION_RADIUS = 11;
/** Test builds: the last level frame's draw calls and the run's maximum on `.level-layer`. */
const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

function handleKey(event: KeyboardEvent, game: FieldGame, ctx: LevelContext): void {
  if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
  const onButton = document.activeElement instanceof HTMLButtonElement;
  const key = event.key;
  const consume = () => event.preventDefault();
  const { phase, grid, focus: current } = game.status();
  if (key === 'r' || key === 'R') {
    void game.rotate();
    consume();
  } else if (key === 'h' || key === 'H') {
    game.hint();
    consume();
  } else if (phase === 'planting') {
    if (key.startsWith('Arrow')) {
      const focus = moveFocus(grid, current, key);
      game.setFocus(focus);
      const state = tf(isPlanted(grid, focus.row, focus.col) ? 'cellDone' : 'cellEmpty');
      ctx.announce(tf('cellFocus', { row: focus.row + 1, col: focus.col + 1, state }));
      consume();
    } else if ((key === 'Enter' || key === ' ') && current && !onButton) {
      game.plantCell(current.row, current.col);
      consume();
    }
  } else if (phase === 'answer' && !(key === 'Enter' && onButton) && game.widgetKey(key)) {
    consume();
  }
}

export function start(ctx: LevelContext): LevelSession {
  const material = createMaterialCache();
  const lowPower = Math.min(window.innerWidth, window.innerHeight) < 600;
  const stage = createFieldStage(lowPower);
  const diorama = buildFieldDiorama(material);
  const view = createGridView(material, ctx.reducedMotion);
  stage.scene.add(diorama.group, view.group);
  const interaction = ctx.input.createInteraction(stage.camera);
  let game: FieldGame | undefined;
  const hud = createFieldHud(ctx.ui, {
    rotate: () => void game?.rotate(),
    hint: () => game?.hint(),
  });
  const labels = createProjectedLabels(hud.root);
  const planting = createPlantingInput(interaction, view, view.basket, {
    plantCell: (row, col) => game?.plantCell(row, col),
    plantRow: (row) => game?.plantRow(row),
  });
  const fieldGame = createFieldGame({ ctx, view, hud, labels, diorama, planting });
  game = fieldGame;
  const size = { width: ctx.canvas.clientWidth, height: ctx.canvas.clientHeight, radius: 0 };
  const frame = (width: number, height: number) => {
    size.width = width;
    size.height = height;
    stage.fit(width, height, size.radius);
    labels.place(stage.camera, width, height);
  };
  fieldGame.start();
  document.addEventListener('keydown', (e) => handleKey(e, fieldGame, ctx), {
    capture: true,
    signal: ctx.disposer.signal,
  });
  if (import.meta.env.MODE === 'test') {
    ctx.disposer.onDispose(installFieldTestHook(fieldGame, view, stage.camera, ctx.canvas));
  }
  let wasAnimating = false;
  let frames = 0;
  let maxCalls = 0;
  return {
    scene: stage.scene,
    camera: stage.camera,
    update(dt) {
      const { grid, phase } = fieldGame.status();
      const radius = phase === 'done' ? CELEBRATION_RADIUS : frameRadius(grid.rows, grid.cols);
      if (radius !== size.radius) {
        // A new round's plot: reframe (turning the plot keeps the radius, so no camera jump).
        size.radius = radius;
        frame(size.width, size.height);
      }
      view.update(dt);
      diorama.update(dt);
      if (wasAnimating && !view.animating) labels.place(stage.camera, size.width, size.height);
      wasAnimating = view.animating;
      frames += 1;
      if (TRACK_DRAW_CALLS && frames > 2) {
        // The previous frame's level render (the host renders after update).
        const calls = ctx.renderer.info.render.calls;
        maxCalls = Math.max(maxCalls, calls);
        Object.assign(ctx.ui.dataset, { drawCalls: calls, maxDrawCalls: maxCalls });
      }
    },
    resize: frame,
    dispose() {
      fieldGame.dispose();
      stage.dispose();
      hud.root.remove();
    },
  };
}
