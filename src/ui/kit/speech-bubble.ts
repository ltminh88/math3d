import { tk } from './ui-kit-strings';

/** What the bubble needs from the narrator (kept narrow so it is easy to fake). */
export interface ReadAloudSource {
  isAvailable(): boolean;
  speak(text: string): boolean;
  onAvailabilityChange(listener: (available: boolean) => void): () => void;
}

export interface SpeechBubbleOptions {
  text: string;
  /** Portrait/avatar element (e.g. a canvas or img of the guide). */
  portrait?: HTMLElement;
  narrator?: ReadAloudSource;
}

export interface SpeechBubble {
  element: HTMLElement;
  setText(text: string): void;
  setPortrait(portrait: HTMLElement | null): void;
  destroy(): void;
}

export function createSpeechBubble(
  options: SpeechBubbleOptions,
  doc: Document = document,
): SpeechBubble {
  const element = doc.createElement('div');
  element.className = 'kit-bubble';
  const slot = doc.createElement('div');
  slot.className = 'kit-bubble__portrait';
  slot.hidden = true;
  const text = doc.createElement('p');
  text.className = 'kit-bubble__text';
  text.textContent = options.text;
  element.append(slot, text);

  let unsubscribe: (() => void) | null = null;
  const narrator = options.narrator;
  if (narrator) {
    const speak = doc.createElement('button');
    speak.type = 'button';
    speak.className = 'kit-button kit-button--secondary kit-bubble__speak';
    speak.textContent = '🔊';
    speak.setAttribute('aria-label', tk('readAloud'));
    speak.hidden = !narrator.isAvailable();
    speak.addEventListener('click', () => {
      narrator.speak(text.textContent ?? '');
    });
    unsubscribe = narrator.onAvailabilityChange((available) => {
      speak.hidden = !available;
    });
    element.appendChild(speak);
  }

  const setPortrait = (portrait: HTMLElement | null) => {
    slot.replaceChildren(...(portrait ? [portrait] : []));
    slot.hidden = portrait === null;
  };
  if (options.portrait) setPortrait(options.portrait);

  return {
    element,
    setText: (value) => {
      text.textContent = value;
    },
    setPortrait,
    destroy: () => {
      unsubscribe?.();
      element.remove();
    },
  };
}
