// Service-worker registration + update prompt (phase 18 / TASK R22).
//
// The worker is registered with skipWaiting OFF (vite.config.ts: registerType 'prompt'),
// so a new build never swaps itself in under a playing child: when the waiting worker
// reports a new version, this module shows a game-style toast with a big reload button.
// Registration is off in dev (no sw.js is generated there) and off in test builds unless
// the offline e2e spec opts in with `?pwa=1`, so the other e2e specs never run under a
// service worker.
import { registerSW } from 'virtual:pwa-register';
import { createUiButton } from './kit/ui-button';
import { sw } from './sw-update-prompt-strings';
import './sw-update-prompt.css';

/** Minimal document surface the prompt needs (real `document` satisfies it). */
export interface PromptDocument {
  createElement(tag: string): HTMLElement;
  getElementById(id: string): HTMLElement | null;
}

type RegisterSWOptions = Parameters<typeof registerSW>[0];
type RegisterFn = (options: RegisterSWOptions) => ReturnType<typeof registerSW>;

/** True when the app should register the service worker for this build + URL. */
export function shouldRegisterServiceWorker(mode: string, search: string): boolean {
  if (mode === 'development') return false;
  if (mode === 'production') return true;
  return new URLSearchParams(search).has('pwa');
}

export interface SwUpdatePrompt {
  show(): void;
  hide(): void;
  reloadButton: HTMLButtonElement;
  laterButton: HTMLButtonElement;
  message: HTMLElement;
}

/**
 * Builds the update prompt inside `root` (hidden until `show()`). The reload button
 * calls `onReload`; the later button just hides the prompt until the next page load,
 * when a still-waiting worker reports itself again.
 */
export function mountSwUpdatePrompt(
  root: HTMLElement,
  onReload: () => void,
  doc: Document = document,
): SwUpdatePrompt {
  root.setAttribute('role', 'alertdialog');
  root.setAttribute('aria-label', sw('message'));
  const message = doc.createElement('p');
  message.className = 'sw-update-message';
  message.textContent = sw('message');
  const actions = doc.createElement('div');
  actions.className = 'sw-update-actions';
  const reloadButton = createUiButton(
    { label: sw('reload'), variant: 'primary', onClick: onReload },
    doc,
  );
  reloadButton.id = 'sw-update-reload';
  const laterButton = createUiButton(
    { label: sw('later'), variant: 'secondary', onClick: () => hide() },
    doc,
  );
  laterButton.id = 'sw-update-later';
  actions.appendChild(reloadButton);
  actions.appendChild(laterButton);
  root.appendChild(message);
  root.appendChild(actions);
  const show = (): void => {
    root.hidden = false;
    reloadButton.focus();
  };
  const hide = (): void => {
    root.hidden = true;
  };
  return { show, hide, reloadButton, laterButton, message };
}

export interface ServiceWorkerDeps {
  registerFn?: RegisterFn;
  mode?: string;
  search?: string;
  doc?: Document;
}

/**
 * Registers the service worker (once per page load) and shows the update prompt when
 * a new version is waiting. Does nothing when the gate in
 * `shouldRegisterServiceWorker` is off or the shell has no prompt element.
 */
export function registerServiceWorker(deps: ServiceWorkerDeps = {}): void {
  const mode = deps.mode ?? import.meta.env.MODE;
  const search = deps.search ?? globalThis.location?.search ?? '';
  if (!shouldRegisterServiceWorker(mode, search)) return;
  const doc = deps.doc ?? document;
  const root = doc.getElementById('sw-update-prompt');
  if (!root) return;
  let updateSW: (reload?: boolean) => Promise<void> = () => Promise.resolve();
  const { show } = mountSwUpdatePrompt(
    root,
    () => {
      void updateSW(true);
    },
    doc,
  );
  const registerFn = deps.registerFn ?? registerSW;
  updateSW = registerFn({
    onNeedRefresh: () => show(),
    // The browser only checks for a new worker on navigation when it has not
    // checked in the last 24 h, so a child who played yesterday would not see
    // today's build until tomorrow. Asking explicitly on every load makes the
    // toast appear on the first load after a deploy instead. A failed check
    // (offline) is ignored — the old worker keeps serving the precache.
    onRegisteredSW: (_swUrl, registration) => {
      void registration?.update().catch(() => undefined);
    },
    onRegisterError: (error: unknown) => console.error('[sw] registration failed', error),
  });
}
