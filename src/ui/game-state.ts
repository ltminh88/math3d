// The UI's single mutable state (formerly ~14 module-level lets in the recovered chunk).
// `progress` is the optimistic view of the game store (progress-sync.ts writes every change
// through and replaces it wholesale on hydrate/reset/import), so always read
// `gameState.progress`; never alias it.
import { SynthAudio } from '../audio/synth-audio';
import type { Question, QuizMode } from '../quiz/question-types';
import { defaultSave } from '../save/save-storage';
import type { ProgressView } from '../store/store-to-save-v1';
import type { WorldPublicApi } from '../world/world-public-api';

/** Kind of content shown in the shared <dialog>; '' when closed. */
export type DialogKind =
  | ''
  | 'milo'
  | 'quiz'
  | 'book'
  | 'help'
  | 'settings'
  | 'reset'
  | 'complete'
  | 'save-code'
  | 'notice'
  | 'shop';

export interface GameState {
  progress: ProgressView;
  readonly audio: SynthAudio;
  /** Undefined until bootstrap builds the world (stays undefined when WebGL fails). */
  world: WorldPublicApi | undefined;
  question: Question | undefined;
  quizMode: QuizMode;
  hintLevel: number;
  /** The current question was answered correctly (answers are locked). */
  answered: boolean;
  questionStartedAt: number;
  /** When the current question was shown (its total time feeds the Leitner box). */
  questionShownAt: number;
  /** Wrong answers given to the current question, in order. */
  wrongAnswers: number[];
  dialogKind: DialogKind;
  toastTimer: number;
  nearMilo: boolean;
  frameCount: number;
  /** The one-time "progress not saved" toast has been shown. */
  saveFailWarned: boolean;
  /** Region id the player stands in; '' before the first area check. */
  currentRegionId: string;
  mapOpen: boolean;
  selectedRegionId: string | undefined;
}

export const defaultProgressView = (): ProgressView => {
  const { xp, coins, bridge, questAccepted, questComplete, avatar, table, combo, started } =
    defaultSave();
  return { xp, coins, bridge, questAccepted, questComplete, avatar, table, combo, started };
};

export const gameState: GameState = {
  progress: defaultProgressView(),
  audio: new SynthAudio(),
  world: undefined,
  question: undefined,
  quizMode: 'bridge',
  hintLevel: 0,
  answered: false,
  questionStartedAt: 0,
  questionShownAt: 0,
  wrongAnswers: [],
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
