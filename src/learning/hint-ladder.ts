/**
 * Hint ladder state machine (pure).
 *  rung 1 encourage / re-read, 2 show model, 3 skip-count animation,
 *  4 related known fact or inverse multiplication, 5 worked answer + requeue (counts as wrong).
 * A hint is auto-offered after each wrong answer or after 10 s idle; at most 3 attempts.
 */
export type HintRung = 0 | 1 | 2 | 3 | 4 | 5;

export const MAX_ATTEMPTS = 3;
export const IDLE_OFFER_MS = 10_000;
const LAST_TAUGHT_RUNG = 4;

export interface HintState {
  rung: HintRung;
  wrongAttempts: number;
  hintsTaken: number;
  /** Worked answer shown: the question is lost and must be requeued. */
  revealed: boolean;
}

export function createHintState(): HintState {
  return { rung: 0, wrongAttempts: 0, hintsTaken: 0, revealed: false };
}

/** Register a wrong answer. The third wrong answer jumps to rung 5 (worked answer). */
export function recordWrong(state: HintState): HintState {
  if (state.revealed) return state;
  const wrongAttempts = state.wrongAttempts + 1;
  return wrongAttempts >= MAX_ATTEMPTS
    ? { ...state, wrongAttempts, rung: 5, revealed: true }
    : { ...state, wrongAttempts };
}

/** Whether the UI should now offer (not force) the next rung. Each wrong answer earns one offer. */
export function shouldOfferHint(state: HintState, idleMs: number): boolean {
  if (state.revealed || state.rung >= LAST_TAUGHT_RUNG) return false;
  return state.wrongAttempts > state.hintsTaken || idleMs >= IDLE_OFFER_MS;
}

/** Child accepts the offer or asks for help: advance one rung (never past 4; 5 is only reached by failing). */
export function takeHint(state: HintState): HintState {
  if (state.revealed || state.rung >= LAST_TAUGHT_RUNG) return state;
  return { ...state, rung: (state.rung + 1) as HintRung, hintsTaken: state.hintsTaken + 1 };
}

export function isOutOfAttempts(state: HintState): boolean {
  return state.revealed;
}

/** Final per-question result for scoring and the recorder. */
export function toQuestionResult(state: HintState, solved: boolean) {
  return {
    correct: solved && !state.revealed,
    firstTry: state.wrongAttempts === 0,
    usedHint: state.hintsTaken > 0 || state.revealed,
    requeue: state.revealed,
  };
}
