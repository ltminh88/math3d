// Field level round lifecycle: build/equations/recall rounds over the planned facts (the last one
// may be the reasoning round), answers and hints through the pure round flow, rewards via
// learning.record (scoring.ts), one restored patch per round, and the celebration.
import type { LevelContext } from '../shared/level-types';
import type { AnswerWidget } from './field-answer-widgets';
import type { FieldDiorama } from './field-diorama-builder';
import { applyHintPlan, hintPlan } from './field-hints';
import type { FieldHud } from './field-hud';
import type { PlantingInput } from './field-planting-input';
import type { ProjectedLabels } from './field-projected-labels';
import { planFieldRun, startFieldReasoningRound } from './field-reasoning-round';
import { mountRoundAnswer } from './field-round-answer';
import { showFieldCelebration, showRoundResult } from './field-round-feedback';
import * as flow from './field-round-flow';
import { createRunTally } from './field-run-tally';
import { tf, tipWithKeys } from './field-strings';
import * as model from './planting-grid';
import type { GridView } from './planting-grid-view';

export type FieldPhase = 'planting' | 'answer' | 'solved' | 'reasoning' | 'done';

export interface FieldGameParts {
  ctx: LevelContext;
  view: GridView;
  hud: FieldHud;
  labels: ProjectedLabels;
  diorama: FieldDiorama;
  planting: PlantingInput;
}

export function createFieldGame({ ctx, view, hud, labels, diorama, planting }: FieldGameParts) {
  const { learning, audio, definition } = ctx;
  const run = planFieldRun(learning, definition);
  const rounds = run.rounds;
  if (rounds.length === 0) throw new Error('Field level: the planner returned no facts');
  const tally = createRunTally();
  let index = 0;
  let phase: FieldPhase = 'planting';
  let state = flow.startRound(rounds[0] as flow.FieldRound);
  let grid = model.createGrid(1, 1);
  let focus: model.GridCell | null = null;
  let widget: AnswerWidget | undefined;
  let startedAt = performance.now();
  let equationShown = true;
  /** Bumped when a round starts or the run ends: a plot turn begun before then is stale. */
  let serial = 0;

  const equationLabel = (suffix: string) => {
    const at = view.worldOf('front');
    const text = `${grid.rows} × ${grid.cols}${suffix}`;
    labels.set(at && equationShown ? [{ text, at, anchor: 'top' }] : []);
  };
  const setFocus = (cell: model.GridCell | null) => {
    focus = cell;
    view.setFocus(cell);
  };
  const clearFocus = () => setFocus(null);
  const dropWidget = () => {
    widget?.destroy();
    widget = undefined;
  };
  const showGrid = (next: model.PlantingGrid) => {
    grid = next;
    view.show(grid);
    planting.refresh();
  };

  function beginRound(i: number): void {
    index = i;
    serial += 1;
    view.stopTurn(); // a turn of the previous plot ends here, never on the new one (QA M-1)
    labels.hide(false);
    const round = rounds[i] as flow.FieldRound;
    state = flow.startRound(round);
    startedAt = performance.now();
    dropWidget();
    clearFocus();
    view.setRowHighlight(false);
    hud.resetRound(i, run.total);
    const [a, b] = round.type === 'recall' ? round.shownOrder : [round.rows, round.cols];
    showGrid(model.createGrid(a, b, round.type !== 'build'));
    equationShown = round.type !== 'equations';
    equationLabel(round.type === 'recall' ? ' = ?' : '');
    if (round.type === 'build') {
      phase = 'planting';
      const title = tf('buildPrompt', { rows: round.rows, cols: round.cols });
      hud.setPrompt(title, tipWithKeys(tf('buildTip'), 'keysTip'));
      hud.speak(i === 0 ? tf('intro') : title);
      hud.setTools({ rotate: false, hint: false });
      planting.enable();
      return;
    }
    const prompt = round.type === 'equations' ? 'equationsPrompt' : 'recallPrompt';
    hud.speak(tf(i === 0 ? 'intro' : prompt));
    askAnswer();
  }

  function askAnswer(): void {
    phase = 'answer';
    hud.setFeedback('', '');
    planting.disable();
    clearFocus();
    const round = state.round;
    hud.setTools({ rotate: true, hint: true });
    if (round.type !== 'equations') equationLabel(' = ?');
    widget = mountRoundAnswer(hud, round, {
      equations: (ids) => settle(flow.answerEquations(state, ids)),
      total: (value) => settle(flow.answerTotal(state, value)),
    });
  }

  function settle(result: { state: flow.RoundState; verdict: flow.Verdict }): void {
    if (phase !== 'answer') return;
    state = result.state;
    if (result.verdict === 'wrong') {
      hud.setFeedback(tf('wrong'), 'gentle');
      widget?.mark(null);
      widget?.setDisabled(false);
      return;
    }
    finishRound(result.verdict === 'correct');
  }

  function finishRound(correct: boolean): void {
    phase = 'solved';
    const outcome = flow.roundOutcome(state, Math.round(performance.now() - startedAt));
    learning.record(outcome);
    tally.add(outcome);
    const { rows, cols, total } = state.round;
    showRoundResult(ctx, hud, widget, state.round, outcome);
    equationShown = true;
    equationLabel(` = ${total}`);
    diorama.restorePatch(index, ctx.reducedMotion);
    const line = rows === cols ? 'squareLine' : 'rotateLine';
    hud.speak(tf(line, { rows: grid.rows, cols: grid.cols, total }));
    const last = index === rounds.length - 1;
    const next = () => (last ? celebrate() : beginRound(index + 1));
    hud.setNext(tf(last && !run.reasoning ? 'finish' : 'next'), next);
    if (correct && rows !== cols) void rotate();
  }

  /** After the plots: the reasoning round on the last patch when planned, then the celebration. */
  function celebrate(): void {
    phase = run.reasoning && phase !== 'reasoning' ? 'reasoning' : 'done';
    serial += 1;
    dropWidget();
    labels.set([]);
    if (phase === 'reasoning' && run.reasoning)
      return void startFieldReasoningRound(ctx, hud, run.reasoning, tally, celebrate);
    for (let i = 0; i < run.total; i++) diorama.restorePatch(i, ctx.reducedMotion);
    showFieldCelebration(ctx, hud, tally);
  }

  async function rotate(): Promise<void> {
    if (view.animating || phase === 'planting' || phase === 'done') return;
    const turnOf = serial;
    labels.hide(true);
    await view.rotate();
    if (turnOf !== serial) return; // a new round started or the run ended while the plot turned
    showGrid(model.rotateGrid(grid));
    labels.hide(false);
    equationLabel(phase === 'solved' ? ` = ${state.round.total}` : ' = ?');
    ctx.announce(tf('rotated', { rows: grid.rows, cols: grid.cols }));
  }

  function hint(): void {
    if (phase !== 'answer') return;
    state = flow.askHint(state);
    const plan = hintPlan(state.hint.rung, grid, view);
    audio.hint();
    applyHintPlan(plan, { hud, view, labels, announce: ctx.announce });
    if (plan.rotate) void rotate();
    hud.setTools({ rotate: true, hint: state.hint.rung < 4 });
  }

  function plant(next: model.PlantingGrid): void {
    if (phase !== 'planting' || next === grid) return;
    showGrid(next);
    audio.jump();
    const count = model.plantedCount(grid);
    hud.setFeedback(tf('planted', { count, total: grid.rows * grid.cols }), '');
    if (model.isFull(grid)) askAnswer();
  }

  return {
    /** Live round state (keyboard layer, test hook). */
    status: () => ({ phase, index, round: state.round, grid, focus, hintRung: state.hint.rung }),
    start: () => beginRound(0),
    plantCell: (row: number, col: number) => plant(model.plantCell(grid, row, col)),
    plantRow: (row: number) => plant(model.plantRow(grid, row)),
    setFocus,
    rotate,
    hint,
    widgetKey: (key: string) => widget?.key(key) ?? false,
    dispose: () => widget?.destroy(),
  };
}

export type FieldGame = ReturnType<typeof createFieldGame>;
