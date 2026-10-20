// Settings dialog (sound/music switches, progress summary, save, save-code export, menu, reset)
// and the reset confirmation. Also wires the top-bar sound button and the jump/zoom buttons.
// Sound and music live in the app settings store; progress in the game store.
import { appSettings } from '../store/app-settings';
import { emptyProgressRecords } from '../store/profile-replacement';
import { openDialog } from './dialog';
import { defaultProgressView, gameState, getWorld } from './game-state';
import { refreshHud } from './hud';
import { byId, icon } from './icons';
import { returnToMenu } from './menu-language-start';
import { connectedStore, factCountsView, flushProgress, replaceAllProgress } from './progress-sync';
import { openSaveCodeExport } from './save-code-dialog';
import { ts } from './save-code-strings';
import { showToast } from './toast-and-persist';

function settingsBodyHtml(): string {
  const { sound, music } = appSettings.get();
  const stats = Object.values(factCountsView());
  const attempts = stats.reduce((sum, stat) => sum + stat.attempts, 0);
  const correct = stats.reduce((sum, stat) => sum + stat.correct, 0);
  return `<div class="settings-row"><span>Hiệu ứng âm thanh</span><button id="toggle-sound" class="switch" role="switch" aria-checked="${sound}" aria-label="Hiệu ứng âm thanh"><i></i></button></div><div class="settings-row"><span>Nhạc nền nhẹ nhàng</span><button id="toggle-music" class="switch" role="switch" aria-checked="${music}" aria-label="Nhạc nền"><i></i></button></div><div class="progress-summary"><span><strong>${gameState.progress.xp}</strong>XP tích lũy</span><span><strong>${attempts}</strong>Lượt trả lời</span><span><strong>${attempts ? Math.round((correct / attempts) * 100) : 0}%</strong>Trả lời đúng</span></div><p class="book-note">Tiến trình tự lưu trên trình duyệt này, không cần tài khoản. Xóa dữ liệu trình duyệt sẽ xóa tiến trình.</p><button id="save-now" class="secondary wide">${icon('save')} Lưu tiến trình</button><button id="export-save-code" class="secondary wide">${icon('save')} ${ts('exportButton')}</button><button id="return-menu" class="text-button centered">Về màn hình chính</button><button id="reset-progress" class="text-button danger centered">${icon('reset')} Chơi lại từ đầu</button>`;
}

/** Wipes progress: fresh profile, bridge reset, player back at the start, back to the menu. */
function confirmReset(): void {
  gameState.progress = defaultProgressView();
  void replaceAllProgress(emptyProgressRecords());
  const world = getWorld();
  world.setBridge(0);
  world.player.position.set(-6, 0, 6);
  world.setAvatar(gameState.progress.avatar);
  world.resetCamera();
  returnToMenu();
  showToast('Một hành trình mới đang chờ bạn!');
}

function openResetConfirm(): void {
  openDialog(
    'Bắt đầu lại hành trình?',
    '<p class="dialog-copy">XP, xu, cây cầu và lịch sử luyện tập trên thiết bị này sẽ bị xóa. Không thể hoàn tác.</p><button id="confirm-reset" class="primary danger-bg wide">Xóa tiến trình và chơi lại</button><button id="cancel-reset" class="text-button centered">Giữ lại hành trình</button>',
    'reset',
  );
  byId('cancel-reset').onclick = openSettings;
  byId('confirm-reset').onclick = confirmReset;
}

/** Opens settings (also on Esc and, as in the original, whenever the window loses focus). */
export function openSettings(): void {
  openDialog('Một chút cài đặt', settingsBodyHtml(), 'settings');
  const audio = gameState.audio;
  byId('toggle-sound').onclick = () => {
    audio.unlock();
    audio.enabled = appSettings.update({ sound: !appSettings.get().sound }).sound;
    refreshHud();
    openSettings();
  };
  byId('toggle-music').onclick = () => {
    audio.unlock();
    audio.music(appSettings.update({ music: !appSettings.get().music }).music);
    openSettings();
  };
  byId('save-now').onclick = () => {
    void flushProgress().then((ok) => {
      if (ok && connectedStore()?.persistent) {
        showToast('Đã lưu hành trình của bạn trên thiết bị này.');
      } else if (ok) {
        showToast(ts('notPersistent'));
      }
    });
  };
  byId('export-save-code').onclick = () => void openSaveCodeExport();
  byId('return-menu').onclick = returnToMenu;
  byId('reset-progress').onclick = openResetConfirm;
}

export function wireSettingsAndToolbar(): void {
  byId('settings').onclick = openSettings;
  byId('sound').onclick = () => {
    gameState.audio.unlock();
    appSettings.update({ sound: !appSettings.get().sound });
    refreshHud();
  };
  byId('jump').onclick = () => getWorld().jump();
  byId('zoom-in').onclick = () => getWorld().zoom(-8);
  byId('zoom-out').onclick = () => getWorld().zoom(8);
}
