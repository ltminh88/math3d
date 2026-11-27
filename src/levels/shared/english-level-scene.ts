// Shared English level scene (two-modes Phase 1): the lifecycle every
// English book level shares — diorama, the HUD panel framing the run, zoom,
// the run itself, the done card, the test hook, abort-on-exit. The book
// (stages, rounds, stage names) and the level-specific pieces (diorama,
// camera, panel, celebration, strings, test hook) come in through the kit.
// `levels/island/island-scene.ts` is a thin call into it; Phase 3's Look
// level will be another.
import { type Camera, Scene } from 'three';
import type { EnglishBook } from '../../english/english-books';
import type { EnglishRunResult } from '../../ui/english/english-run';
import { startEnglishRun } from '../../ui/english/english-run';
import { LEVEL_COMPLETE_BONUS } from './level-run-result';
import type { LevelContext, LevelModule, LevelSession } from './level-types';
import { attachLevelZoom } from './level-zoom';
import './level-zoom.css';

/** The level's camera/view: the shared scene only drives it, never builds it. */
export interface EnglishLevelView {
  readonly camera: Camera;
  setArea(area: { width: number; height: number; coverRight: number; coverBottom: number }): void;
  setZoomFactor(factor: number): void;
  update(): void;
}

/** The HUD panel framing the run (stage title + the run's own DOM). */
export interface EnglishLevelPanel {
  readonly panel: HTMLElement;
  readonly runRoot: HTMLElement;
  showStage(stage: number, name: string): void;
  say(text: string): void;
  destroy(): void;
}

/** The strings the shared scene itself reads (intro, zoom labels, stage line). */
export interface EnglishLevelStrings {
  readonly intro: string;
  readonly zoomIn: string;
  readonly zoomOut: string;
  stageLine(stage: number, stages: number, stars: number): string;
}

/** What the test hook reads (the level's own hook shapes it for `window`). */
export interface EnglishLevelTestState {
  readonly stage: number;
  readonly total: number;
  readonly done: boolean;
  readonly result: EnglishRunResult | null;
  readonly stars: number;
}

export interface EnglishLevelKit<S extends EnglishLevelStrings = EnglishLevelStrings> {
  readonly book: EnglishBook;
  /** Scene name (`scene.name`). */
  readonly sceneName: string;
  readonly buildDiorama: (scene: Scene) => void;
  readonly createView: () => EnglishLevelView;
  readonly strings: (defineStrings: LevelContext['defineStrings']) => S;
  readonly createPanel: (ui: HTMLElement, strings: S) => EnglishLevelPanel;
  readonly starsForResult: (run: EnglishRunResult) => number;
  readonly showCelebration: (
    root: HTMLElement,
    strings: S,
    run: EnglishRunResult,
    stars: number,
    onBack: () => void,
    bonus: { xp: number; coins: number } | null,
    stageLine: string,
  ) => void;
  /** Test-mode hook installer (receives the live state reader, returns dispose). */
  readonly installTestHook?: (read: () => EnglishLevelTestState) => () => void;
}

const TRACK_DRAW_CALLS = import.meta.env.MODE === 'test';

export function createEnglishLevelScene<S extends EnglishLevelStrings>(
  kit: EnglishLevelKit<S>,
): LevelModule {
  function start(ctx: LevelContext): LevelSession {
    const strings = kit.strings(ctx.defineStrings);
    const scene = new Scene();
    scene.name = kit.sceneName;
    kit.buildDiorama(scene);
    const view = kit.createView();
    // Phase 25b: pinch + wheel + +/− buttons zoom the camera around the
    // auto-fit distance.
    const zoomHandle = attachLevelZoom(ctx.canvas, {
      container: ctx.ui,
      onFactor: (factor) => {
        view.setZoomFactor(factor);
        ctx.ui.dataset.zoomFactor = String(factor);
      },
      zoomInLabel: strings.zoomIn,
      zoomOutLabel: strings.zoomOut,
    });
    ctx.ui.dataset.zoomFactor = '1';
    const panel = kit.createPanel(ctx.ui, strings);
    panel.showStage(ctx.stage, kit.book.stageNames[ctx.stage - 1] ?? kit.book.stageNames[0] ?? '');
    panel.say(strings.intro);
    ctx.announce(strings.intro);
    let size = { width: 1, height: 1 };

    const frame = (): void => {
      // The panel frames the run (and the done card, which replaces the
      // widgets inside it): shift the view out from under the panel, right
      // side when wide, bottom when narrow.
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

    // The run's result, for the test hook and the done card; the run may
    // still be going when the child leaves through the host button — then
    // the card is never shown.
    let result: EnglishRunResult | null = null;
    let stars = 0;
    let disposed = false;
    if (import.meta.env.MODE === 'test' && kit.installTestHook) {
      ctx.disposer.onDispose(
        kit.installTestHook(() => ({
          stage: ctx.stage,
          total: kit.book.rounds,
          done: result !== null,
          result,
          stars,
        })),
      );
    }

    // R73: abort the run when the level exits mid-run — without this the
    // engine's promise dangles (its round waiter never resolves, the
    // speaker is never disposed, the live state stays mid-run). The promise
    // resolves `{completed: false}`; the `.then` below still returns early
    // on `disposed`, so no done card shows.
    const runAbort = new AbortController();
    void startEnglishRun({
      book: kit.book,
      stage: ctx.stage,
      ui: panel.runRoot,
      learning: ctx.learning,
      signal: runAbort.signal,
    }).then((run) => {
      if (disposed) return;
      result = run;
      stars = kit.starsForResult(run);
      // There is nothing left to zoom once the run is done — dispose the
      // zoom group now (its "Về cổng" button would sit under it).
      zoomHandle.dispose();
      const bonus = run.completed && ctx.firstCompletion ? LEVEL_COMPLETE_BONUS : null;
      const exit = () => ctx.exit({ completed: run.completed });
      const stageLine = strings.stageLine(ctx.stage, ctx.definition.stages, stars);
      panel.runRoot.replaceChildren();
      kit.showCelebration(panel.runRoot, strings, run, stars, exit, bonus, stageLine);
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

  return { start };
}
