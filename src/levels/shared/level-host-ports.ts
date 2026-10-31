// Browser wiring of the level host: animation frames, canvas resize, and each run's context
// (overlay UI, synth audio, learning services bound to the active profile, input helpers) plus
// its close step (unmount, commit through progress-sync, HUD + announcement).
import { InteractionController } from '../../core/input/interaction-controller';
import { PointerInput } from '../../core/input/pointer-input';
import type { SceneDisposer } from '../../core/scene-disposer';
import { defineStrings } from '../../i18n/i18n';
import { FLUENCY_ORDER } from '../../learning/curriculum-tables';
import { planSession } from '../../learning/session-planner';
import { createSessionRecorder, type SessionResult } from '../../learning/session-recorder';
import { newId } from '../../store/new-id';
import { gameState } from '../../ui/game-state';
import { refreshHud } from '../../ui/hud';
import { announce } from '../../ui/kit/aria-announcer';
import { commitLevelRun, connectedStore } from '../../ui/progress-sync';
import { showToast } from '../../ui/toast-and-persist';
import type { WorldPublicApi } from '../../world/world-public-api';
import type { LevelHostPorts, LevelRun } from './level-host';
import { gateNameOf, tl } from './level-host-strings';
import { firstCompletionBonus, levelRunToCommit } from './level-run-result';
import { mountLevelRunUi } from './level-run-ui';
import type { LevelDefinition, LevelResult } from './level-types';
import { saveRendererState } from './renderer-state-snapshot';

const byFluency = (tables: readonly number[]): number[] =>
  [...tables].sort((a, b) => FLUENCY_ORDER.indexOf(a) - FLUENCY_ORDER.indexOf(b));

/** Commits the run in the background; a completed run thanks the child with its rewards. */
function commitRun(run: SessionResult, levelId: string): void {
  void commitLevelRun(run, firstCompletionBonus(levelId, run)).then((committed) => {
    refreshHud();
    if (committed && levelId in committed.levels) {
      showToast(tl('levelDone', { xp: committed.xp, coins: committed.coins }));
    }
  });
}

function openLevelRun(
  world: WorldPublicApi,
  definition: LevelDefinition,
  disposer: SceneDisposer,
  exit: (result: LevelResult) => void,
): LevelRun {
  const store = connectedStore();
  if (!store) throw new Error('Game store is not connected');
  const canvas = world.renderer.domElement;
  const sessionNo = store.nextSessionNo();
  const stats = () => store.getSnapshot().factStats;
  const recorder = createSessionRecorder({
    profileId: store.getSnapshot().profile.id,
    levelId: definition.id,
    sessionNo,
    getStat: (key) => stats()[key],
    now: Date.now,
    newId,
  });
  const ui = mountLevelRunUi(gateNameOf(definition.id), () => exit({ completed: false }));
  let closed = false;
  return {
    context: {
      renderer: world.renderer,
      canvas,
      ui: ui.root,
      audio: gameState.audio,
      learning: {
        stats,
        sessionNo,
        rng: Math.random,
        planSession: (pool, length) =>
          planSession({
            stats: stats(),
            pool,
            tables: byFluency(definition.tables),
            sessionNo,
            rng: Math.random,
            length,
          }),
        record: (outcome) => recorder.recordQuestion(outcome),
      },
      input: {
        createInteraction(camera) {
          const pointer = new PointerInput(canvas);
          const interaction = new InteractionController(pointer, camera, document);
          disposer.onDispose(() => {
            interaction.dispose();
            pointer.dispose();
          });
          return interaction;
        },
      },
      defineStrings,
      announce: (message) => announce(message),
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
      firstCompletion: !((store.getSnapshot().levelProgress[definition.id]?.completedAt ?? 0) > 0),
    },
    close(result) {
      if (closed) return;
      closed = true;
      ui.unmount();
      const run = levelRunToCommit(recorder, result);
      if (run) commitRun(run, definition.id);
      announce(tl('backAtGate'));
    },
  };
}

export function createLevelHostPorts(world: WorldPublicApi): LevelHostPorts {
  return {
    world,
    renderer: world.renderer,
    saveRendererState: () => saveRendererState(world.renderer),
    requestFrame: (callback) => requestAnimationFrame(callback),
    cancelFrame: (handle) => cancelAnimationFrame(handle),
    watchResize(onResize) {
      const canvas = world.renderer.domElement;
      const report = () => onResize(canvas.clientWidth, canvas.clientHeight);
      report();
      const observer = new ResizeObserver(report);
      observer.observe(canvas.parentElement ?? canvas);
      return () => observer.disconnect();
    },
    openRun: (definition, disposer, exit) => openLevelRun(world, definition, disposer, exit),
  };
}
