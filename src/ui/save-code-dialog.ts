// Save codes in the UI: "Nhập mã lưu" on the start screen (paste -> confirm overwrite when there
// is progress -> import) and "Xuất mã lưu" in settings (code + copy button). Export writes M3D2
// (levels and cosmetics included); import also takes old M3D1 codes. A bad code never touches
// the store; the error is shown in the dialog.
import '../styles/save-code-dialog.css';
import { appSettings } from '../store/app-settings';
import {
  type DecodedSaveCode,
  decodeSaveCode,
  encodeSaveCodeV2,
  importOfDecodedSaveCode,
  SaveCodeError,
} from '../store/save-code-codec';
import { closeDialog, openDialog } from './dialog';
import { gameState } from './game-state';
import { byId, icon } from './icons';
import { connectedStore, factCountsView, flushProgress, replaceAllProgress } from './progress-sync';
import { renderProgress } from './render-progress';
import { saveCodeErrorText, ts } from './save-code-strings';
import { openSettings } from './settings-dialog';
import { showToast } from './toast-and-persist';

function showError(text: string): void {
  const box = byId('save-code-error');
  box.textContent = text;
  box.hidden = false;
}

function hasProgress(): boolean {
  const p = gameState.progress;
  return (
    p.xp > 0 ||
    p.coins > 0 ||
    p.bridge > 0 ||
    p.questAccepted ||
    p.started ||
    Object.keys(factCountsView()).length > 0
  );
}

async function applyImport(decoded: DecodedSaveCode, draft: string): Promise<void> {
  // Through the store API (one transaction, new active profile), never localStorage.
  const { records, audio } = importOfDecodedSaveCode(decoded, Date.now());
  if (!(await replaceAllProgress(records))) {
    openSaveCodeImport(draft);
    showError(ts('errorStore'));
    return;
  }
  appSettings.update({ sound: audio.sound, music: audio.music });
  gameState.audio.enabled = audio.sound;
  renderProgress();
  closeDialog();
  showToast(ts('imported'));
}

function confirmOverwrite(decoded: DecodedSaveCode, draft: string): void {
  openDialog(
    ts('overwriteTitle'),
    `<p class="dialog-copy">${ts('overwriteCopy')}</p><button id="overwrite-yes" class="primary danger-bg wide">${ts('overwriteYes')}</button><button id="overwrite-no" class="text-button centered">${ts('overwriteNo')}</button>`,
    'save-code',
  );
  byId('overwrite-yes').onclick = () => void applyImport(decoded, draft);
  byId('overwrite-no').onclick = () => openSaveCodeImport(draft);
}

function submitImport(): void {
  const draft = byId<HTMLTextAreaElement>('save-code-input').value;
  let decoded: DecodedSaveCode;
  try {
    decoded = decodeSaveCode(draft);
  } catch (err) {
    showError(saveCodeErrorText(err instanceof SaveCodeError ? err.reason : 'payload'));
    return;
  }
  if (hasProgress()) confirmOverwrite(decoded, draft);
  else void applyImport(decoded, draft);
}

/** Start screen: paste a code. */
export function openSaveCodeImport(draft = ''): void {
  openDialog(
    ts('importTitle'),
    `<p class="dialog-copy">${ts('importIntro')}</p><textarea id="save-code-input" class="save-code-input" spellcheck="false" autocomplete="off" autocapitalize="off" aria-label="${ts('codeLabel')}"></textarea><p id="save-code-error" class="feedback gentle save-code-error" role="alert" hidden></p><button id="save-code-confirm" class="primary wide">${ts('importConfirm')} ${icon('arrow')}</button>`,
    'save-code',
  );
  const input = byId<HTMLTextAreaElement>('save-code-input');
  input.value = draft;
  input.focus();
  byId('save-code-confirm').onclick = submitImport;
}

/** Settings: show the current progress as a code (pending answers are committed first). */
export async function openSaveCodeExport(): Promise<void> {
  await flushProgress();
  const store = connectedStore();
  if (!store) return;
  const { sound, music } = appSettings.get();
  const code = encodeSaveCodeV2(store.getSnapshot(), { sound, music });
  openDialog(
    ts('exportTitle'),
    `<p class="dialog-copy">${ts('exportIntro')}</p><textarea id="save-code-output" class="save-code-input" readonly spellcheck="false" aria-label="${ts('codeLabel')}"></textarea><button id="save-code-copy" class="primary wide">${icon('save')} ${ts('copy')}</button><button id="save-code-back" class="text-button centered">${ts('back')}</button>`,
    'save-code',
  );
  // Set as a value, never through innerHTML/translation, so the code stays byte-exact.
  const output = byId<HTMLTextAreaElement>('save-code-output');
  output.value = code;
  byId('save-code-copy').onclick = () => {
    output.select();
    navigator.clipboard?.writeText(code).then(
      () => showToast(ts('copied')),
      () => document.execCommand?.('copy'),
    );
  };
  byId('save-code-back').onclick = openSettings;
}
