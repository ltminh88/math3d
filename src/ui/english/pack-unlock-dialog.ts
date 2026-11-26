// Parent unlock dialog (Phase 3B): "Phụ huynh" → "Mật khẩu gia đình" input.
// Sends no request before the passphrase is entered — the caller's `unlock`
// does the fetch + validate + store. A wrong passphrase shows one gentle
// line; the dialog never shows the passphrase anywhere but its own input.

import type { EnglishPack } from '../../english/english-types';
import type { EnglishPackFetchError } from '../../english/pack/pack-client';
import { createUiButton } from '../kit/ui-button';
import { tei } from './english-strings';

export interface PackUnlockDialogOptions {
  /** Where the <dialog> mounts (must be in the document for showModal). */
  readonly mount: HTMLElement;
  readonly doc?: Document;
  /** Fetch + validate + store for the entered passphrase. */
  readonly unlock: (
    passphrase: string,
  ) => Promise<
    | { readonly ok: true; readonly pack: EnglishPack }
    | { readonly ok: false; readonly error: EnglishPackFetchError }
  >;
  readonly onUnlocked: (pack: EnglishPack) => void;
}

const ERROR_KEY: Record<
  EnglishPackFetchError,
  'unlockWrong' | 'unlockOffline' | 'unlockUnavailable'
> = {
  'bad-passphrase': 'unlockWrong',
  offline: 'unlockOffline',
  'pack-unavailable': 'unlockUnavailable',
  malformed: 'unlockUnavailable',
};

/** Opens the dialog; returns a closer (also closes on Esc / Cancel). */
export function openPackUnlockDialog(options: PackUnlockDialogOptions): () => void {
  const doc = options.doc ?? document;
  const dialog = doc.createElement('dialog');
  dialog.className = 'english-unlock-dialog';
  const title = doc.createElement('h2');
  title.textContent = tei('unlockTitle');
  const input = doc.createElement('input');
  input.type = 'password';
  input.className = 'english-unlock-dialog__input';
  input.placeholder = tei('unlockPassword');
  input.setAttribute('aria-label', tei('unlockPassword'));
  input.autocomplete = 'off';
  const error = doc.createElement('p');
  error.className = 'english-unlock-dialog__error';
  error.setAttribute('role', 'alert');
  error.hidden = true;
  const actions = doc.createElement('div');
  actions.className = 'english-unlock-dialog__actions';
  const submit = createUiButton(
    {
      label: tei('unlockSubmit'),
      onClick: () => {
        void submitPassphrase();
      },
    },
    doc,
  );
  const cancel = createUiButton(
    {
      label: tei('unlockCancel'),
      variant: 'secondary',
      onClick: () => dialog.close(),
    },
    doc,
  );
  actions.append(submit, cancel);
  dialog.append(title, input, error, actions);
  options.mount.appendChild(dialog);

  let busy = false;
  async function submitPassphrase(): Promise<void> {
    if (busy) return;
    const passphrase = input.value.trim();
    if (passphrase === '') return;
    busy = true;
    submit.disabled = true;
    cancel.disabled = true;
    error.hidden = true;
    const result = await options.unlock(passphrase);
    if (result.ok) {
      dialog.close();
      options.onUnlocked(result.pack);
      return;
    }
    error.textContent = tei(ERROR_KEY[result.error]);
    error.hidden = false;
    busy = false;
    submit.disabled = false;
    cancel.disabled = false;
    input.focus();
  }
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      void submitPassphrase();
    }
  });
  dialog.addEventListener('close', () => dialog.remove());
  dialog.showModal();
  input.focus();
  return () => {
    if (dialog.isConnected) dialog.close();
  };
}
