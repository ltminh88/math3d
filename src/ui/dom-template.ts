// Static game shell (recovered verbatim): every element id the UI looks up is defined here.
// Whitespace and attribute order are part of the DOM parity contract; do not reformat.
import { COMING_SOON_REGIONS, LEVEL_GATES, REGIONS, type Region } from '../config/regions';
import { getLegacyLanguage } from '../i18n/legacy-translator';
import { tl } from '../levels/shared/level-host-strings';
import { icon } from './icons';
import { ts } from './save-code-strings';

/** Regions with a floating world label (all but the starting village). */
export const LABELED_REGIONS: readonly Region[] = REGIONS.filter((r) => r.id !== 'village');

/** The full shell markup; static strings only (no user input reaches innerHTML). */
export const gameShellHtml = (): string => `
  <main class="game-shell">
    <canvas id="world" aria-label="Làng Khởi Đầu 3D. Di chuyển bằng WASD, phím mũi tên hoặc chạm xuống đất."></canvas>
    <div id="loading" class="loading"><span class="loading-crown">${icon('crown')}</span><strong>Đang mở cánh cổng…</strong></div>
    <header class="topbar">
      <a class="brand" href="/" aria-label="math3d"><span class="brand-mark">${icon('crown')}</span><span class="brand-text">math<b>3d</b></span></a>
      <div id="area-label" class="area-label" hidden><span id="area-icon" class="area-icon">🏡</span><span><strong id="area-name">Làng Khởi Đầu</strong><small id="area-sub">KHÁM PHÁ · HỌC HỎI · TRƯỞNG THÀNH</small></span></div>
      <div class="top-right"><span class="village-status"><i></i>Làng Khởi Đầu</span><button id="language" class="icon-button language-button" title="Switch language" aria-label="Switch language">${getLegacyLanguage() === 'vi' ? 'EN' : 'VI'}</button><button id="sound" class="icon-button" title="Bật / tắt âm thanh" aria-label="Tắt âm thanh">${icon('sound')}</button><button id="settings" class="icon-button" title="Cài đặt" aria-label="Cài đặt">${icon('settings')}</button></div>
    </header>
    <section id="welcome" class="welcome">
      <div class="chapter"><span></span> MỘT CUỘC PHIÊU LƯU NHỎ</div>
      <h1>math<span>3d</span></h1>
      <p><strong>Vương Quốc Cửu Chương</strong><br>Mỗi phép nhân, một điều kỳ diệu.<br>Cùng VLM xây cầu và khám phá ngôi làng!</p>
      <div class="choose-label">Chọn người bạn đồng hành</div>
      <div class="avatar-options" role="group" aria-label="Chọn nhân vật"><button id="boy" class="avatar-option" aria-pressed="true"><span>👦</span>Nhà thám hiểm</button><button id="girl" class="avatar-option" aria-pressed="false"><span>👧</span>Nhà khám phá</button></div>
      <button id="play" class="primary play-button">Bắt đầu phiêu lưu ${icon('arrow')}</button>
      <button id="learn-welcome" class="text-button">${icon('book')} Khám phá bảng cửu chương</button>
      <button id="import-save-code" class="text-button">${icon('save')} ${ts('importButton')}</button>
      <div class="welcome-notes"><span>✦ Học qua những chuyến đi</span><span>Không giới hạn thời gian</span></div>
    </section>
    <div id="world-caption" class="world-caption"><span>0${(REGIONS.at(-1) as Region).world}</span><div>Vương Quốc Cửu Chương<small>${REGIONS.length} vùng đất · Bảng ×2 – ×10</small></div></div>
    <div id="hud" class="hud" hidden>
      <div class="hud-left">
        <div class="player-card"><span id="avatar-face" class="avatar-face">👦</span><div class="player-info"><strong><span id="player-name">Nhà thám hiểm</span> <span class="level-badge" title="Cấp độ"><span id="level">1</span></span></strong><div class="xp-track" role="progressbar" aria-label="Tiến độ cấp độ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="xp-fill"></i></div><small id="xp-text">0 / 100 XP</small></div><div id="wallet" class="wallet" title="xu">${icon('coin')}<strong id="coins">0</strong></div></div>
        <aside id="quest-card" class="quest-card"><button id="quest-toggle" class="quest-head" aria-expanded="true" aria-controls="quest-body"><span class="eyebrow">${icon('flag')} CHUYẾN PHIÊU LƯU ĐẦU TIÊN</span><span class="chevron">${icon('chevron')}</span></button><h2 id="quest-title">Một cây cầu, ngàn niềm vui</h2><div id="quest-body" class="quest-body"><p id="quest-copy">VLM đang chờ bạn bên dòng sông. Đến gần và chào bạn ấy nhé!</p><div id="quest-steps" class="quest-steps"></div></div><div class="quest-bottom"><span id="quest-progress">Gặp người dẫn đường</span><span class="reward">${icon('star')} +10 XP / câu</span></div></aside>
      </div>
      <button id="minimap" class="minimap" aria-label="Mở bản đồ thế giới" title="Bản đồ (M)"><canvas id="minimap-canvas"></canvas><span class="minimap-ring"></span><span class="minimap-key"><kbd>M</kbd></span></button>
      <button id="milo-label" class="world-label" aria-label="Nói chuyện với VLM"><span class="milo-dot">!</span><strong>VLM</strong><small>Người dẫn đường</small></button>
      <div id="bridge-label" class="world-label landmark"><strong>Cây cầu tình bạn</strong><small id="bridge-count">0 / 6 đoạn cầu</small></div>
      ${LABELED_REGIONS.map((r) => `<div id="${r.id}-label" class="world-label landmark region-label"><span class="region-icon">${r.icon}</span><strong>${r.name}</strong><small>${r.subtitle}</small>${COMING_SOON_REGIONS.has(r.id) ? `<em class="coming-soon">${tl('comingSoon')}</em>` : ''}</div>`).join('')}
      ${LEVEL_GATES.map((g) => `<div id="gate-${g.levelId}-label" class="world-label landmark region-label gate-label"><span class="region-icon">🔒</span><strong></strong><small class="gate-state"></small></div>`).join('')}
      <div class="bottom-bar"><div class="controls-hint"><span class="key-group"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span>Di chuyển</span><span class="divider"></span><kbd>Space</kbd><span>Nhảy</span><span class="divider"></span><kbd>M</kbd><span>Bản đồ</span><span class="divider"></span><span>Kéo chuột để xoay</span></div><div class="toolbar"><div class="zoom-group"><button id="zoom-in" class="icon-button" aria-label="Phóng to" title="Phóng to">${icon('plus')}</button><button id="zoom-out" class="icon-button" aria-label="Thu nhỏ" title="Thu nhỏ">${icon('minus')}</button></div><button id="open-map" class="tool-button">${icon('map')}<span>Bản đồ</span></button><button id="learn" class="tool-button">${icon('book')}<span>Sổ cửu chương</span></button><button id="help" class="icon-button" aria-label="Hướng dẫn chơi" title="Hướng dẫn chơi">${icon('help')}</button></div></div>
      <button id="interact" class="interact" hidden><kbd>E</kbd> Nói chuyện với VLM ${icon('arrow')}</button>
      <div id="touch-controls" class="touch-controls"><div id="joystick" class="joystick" role="group" aria-label="Cần điều khiển di chuyển"><div id="joystick-knob"></div></div><button id="jump" class="jump-button" aria-label="Nhảy">${icon('jump')}</button></div>
    </div>
    <section id="world-map" class="map-overlay" role="dialog" aria-modal="true" aria-labelledby="map-title" hidden>
      <canvas id="map-canvas" aria-label="Bản đồ Vương Quốc Cửu Chương"></canvas>
      <div class="map-head"><div class="dialog-eyebrow">BẢN ĐỒ THẾ GIỚI</div><h2 id="map-title">Vương Quốc Cửu Chương</h2><p>Chạm vào một vùng đất để xem thông tin.</p></div>
      <button id="close-map" class="dialog-close map-close" aria-label="Đóng bản đồ">${icon('close')}</button>
      <aside class="map-panel"><div id="map-regions" class="map-regions"></div><div id="map-detail" class="map-detail"></div></aside>
    </section>
    <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
    <footer id="menu-footer" class="menu-footer"><span><b>math</b>3d</span><span>Một thế giới nhỏ. Những khám phá lớn.</span><span>Lưu trên thiết bị này ${icon('save')}</span></footer>
    <dialog id="dialog" aria-labelledby="dialog-title"><button id="close-dialog" class="dialog-close" aria-label="Đóng">${icon('close')}</button><div id="dialog-content"></div></dialog>
  </main>`;
