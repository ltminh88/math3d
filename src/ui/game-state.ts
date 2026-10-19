// The UI's single mutable state (formerly ~14 module-level lets in the recovered chunk).
// `save` is replaced wholesale on reset, so always read `gameState.save`; never alias it.
import { SynthAudio } from '../audio/synth-audio';
import type { Question, QuizMode } from '../quiz/question-types';
import { loadSave } from '../save/save-storage';
import type { SaveV1 } from '../save/save-types';
import type { WorldPublicApi } from '../world/world-public-api';

/** Kind of content shown in the shared <dialog>; '' when closed. */
export type DialogKind = '' | 'milo' | 'quiz' | 'book' | 'help' | 'settings' | 'reset' | 'complete';

export interface GameState {
  save: SaveV1;
  readonly audio: SynthAudio;
  /** Undefined until bootstrap builds the world (stays undefined when WebGL fails). */
  world: WorldPublicApi | undefined;
  question: Question | undefined;
  quizMode: QuizMode;
  hintLevel: number;
  /** The current question was answered correctly (answers are locked). */
  answered: boolean;
  questionStartedAt: number;
  dialogKind: DialogKind;
  toastTimer: number;
  nearMilo: boolean;
  frameCount: number;
  /** The one-time "storage blocked" toast has been shown. */
  saveFailWarned: boolean;
  /** Region id the player stands in; '' before the first area check. */
  currentRegionId: string;
  mapOpen: boolean;
  selectedRegionId: string | undefined;
}

export const gameState: GameState = {
  save: loadSave(),
  audio: new SynthAudio(),
  world: undefined,
  question: undefined,
  quizMode: 'bridge',
  hintLevel: 0,
  answered: false,
  questionStartedAt: 0,
  dialogKind: '',
  toastTimer: 0,
  nearMilo: false,
  frameCount: 0,
  saveFailWarned: false,
  currentRegionId: '',
  mapOpen: false,
  selectedRegionId: undefined,
};

/**
 * The world, typed as present. Like the original, UI paths that run after a failed WebGL
 * bootstrap throw on access instead of being silently skipped.
 */
export const getWorld = (): WorldPublicApi => gameState.world as WorldPublicApi;
