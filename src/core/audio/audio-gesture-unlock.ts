/** The slice of AudioEngine the unlock binder drives (fakeable in tests). */
export interface UnlockableAudio {
  isRunning(): boolean;
  /** Create/resume the context; must run synchronously inside a user-activation event. */
  unlock(): Promise<void>;
  suspend(): Promise<void>;
  onStateChange(listener: () => void): () => void;
}

/**
 * Events that grant user activation under the HTML spec. A touch `pointerdown` does NOT, which
 * is why iPad audio never started when we unlocked on pointerdown.
 */
export const ACTIVATION_EVENTS = ['pointerup', 'touchend', 'click', 'keydown'] as const;

// Options object, not `true`: Node's EventTarget (unit tests) fails to match a boolean capture.
const CAPTURE = { capture: true } as const;

export interface GestureUnlockOptions {
  target: EventTarget;
  audio: UnlockableAudio;
  /** Document for visibilitychange: suspend while hidden, try to resume when shown. */
  doc?: EventTarget & { readonly hidden: boolean };
  /** Runs once, inside the first real activation event (speech-synthesis unlock). */
  onFirstActivation?: () => void;
}

/**
 * Keeps activation listeners armed while the AudioContext is not running. iOS suspends or
 * "interrupts" a running context after lock/backgrounding/calls; the next gesture resumes it.
 * Returns a disposer.
 */
export function bindAudioGestureUnlock(options: GestureUnlockOptions): () => void {
  const { target, audio, doc, onFirstActivation } = options;
  let armed = false;
  let firstDone = false;

  const onActivation = (event: Event) => {
    if (event.type === 'keydown' && (event as KeyboardEvent).key === 'Escape') return;
    if (!firstDone) {
      firstDone = true;
      onFirstActivation?.();
    }
    void audio.unlock().then(sync);
  };

  const arm = () => {
    if (armed) return;
    armed = true;
    for (const type of ACTIVATION_EVENTS) target.addEventListener(type, onActivation, CAPTURE);
  };
  const disarm = () => {
    if (!armed) return;
    armed = false;
    for (const type of ACTIVATION_EVENTS) target.removeEventListener(type, onActivation, CAPTURE);
  };
  // Speech still needs its first activation even when audio is already running.
  const sync = () => (audio.isRunning() && firstDone ? disarm() : arm());

  const stopState = audio.onStateChange(sync);
  const onVisibility = () => {
    if (doc?.hidden) void audio.suspend();
    else if (firstDone) void audio.unlock().then(sync);
  };
  doc?.addEventListener('visibilitychange', onVisibility);
  sync();

  return () => {
    disarm();
    stopState();
    doc?.removeEventListener('visibilitychange', onVisibility);
  };
}
