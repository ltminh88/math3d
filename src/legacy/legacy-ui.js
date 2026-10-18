// Legacy chunk "ui" (recovered, mechanically split). Do not hand-edit; swap via shims/ui.js.
import { Vector3 } from 'three';
import { Di, Dt, Ha, Sa, Xm, kr, yt } from './shims/config.js';
import { $m } from './shims/world.js';
import { Ga, Km, Zm } from './shims/save.js';
import { Jm, Qm, eg, tg } from './shims/quiz.js';
import { ng } from './shims/audio.js';
import { Cn, Ln, Va, Wa, rg } from './shims/i18n.js';
import { Jl, Ql, cg, hg, lg } from './shims/map.js';

const cl = {
  crown: '<path d="m3 6 5 4 4-7 4 7 5-4-2 13H5Z"/><path d="M8 15h8"/>',
  book: '<path d="M12 6c-3-2-7-2-10-1v15c3-1 7-1 10 1 3-2 7-2 10-1V5c-3-1-7-1-10 1Zm0 0v15"/>',
  star: '<path d="m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z"/>',
  sound: '<path d="m11 4-6 5H2v6h3l6 5V4Zm4 4c3 2 3 6 0 8m3-11c5 4 5 10 0 14"/>',
  mute: '<path d="m11 4-6 5H2v6h3l6 5V4Zm5 5 6 6m0-6-6 6"/>',
  settings:
    '<path d="M4 7h16M4 17h16"/><circle cx="8" cy="7" r="3"/><circle cx="16" cy="17" r="3"/>',
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  help: '<circle cx="12" cy="12" r="10"/><path d="M9 8a3 3 0 0 1 6 0c0 2-3 2-3 5m0 3v1"/>',
  coin: '<circle cx="12" cy="12" r="9"/><path d="M12 6v12m3-9c-5-3-7 2-3 3s3 5-3 3"/>',
  flag: '<path d="M5 22V3m0 1c5-4 9 4 15 0v10c-6 4-10-4-15 0"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  compass: '<circle cx="12" cy="12" r="10"/><path d="m16 8-3 5-5 3 3-5Z"/>',
  reset: '<path d="M3 10a9 9 0 1 1 2 8M3 3v7h7"/>',
  jump: '<path d="M12 21V3m-6 6 6-6 6 6"/>',
  save: '<path d="M5 3h12l4 4v14H3V3h2Zm2 0v7h10V3M7 21v-7h10v7"/>',
  map: '<path d="m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  minus: '<path d="M5 12h14"/>',
};
const Xe = (i) =>
  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${cl[i] ?? cl.star}</svg>`;
const Y = (i) => document.getElementById(i);
let ie = Km();
const xt = new ng();
let _e;
let jn;
let Kt = 'bridge';
let Yn = 0;
let ya = false;
let ba = 0;
let Xa = '';
let hl = 0;
let ec = false;
let ul = 0;
let dl = false;
let bi = '';
let Dn = false;
let Ei;
const qa = Dt.filter((i) => i.id !== 'village');
const tc = Y('app');
tc.innerHTML = `
  <main class="game-shell">
    <canvas id="world" aria-label="Làng Khởi Đầu 3D. Di chuyển bằng WASD, phím mũi tên hoặc chạm xuống đất."></canvas>
    <div id="loading" class="loading"><span class="loading-crown">${Xe('crown')}</span><strong>Đang mở cánh cổng…</strong></div>
    <header class="topbar">
      <a class="brand" href="/" aria-label="Math AI Game 3D"><span class="brand-mark">${Xe('crown')}</span><span class="brand-text">MATH AI<small>GAME <b>3D</b></small></span></a>
      <div id="area-label" class="area-label" hidden><span id="area-icon" class="area-icon">🏡</span><span><strong id="area-name">Làng Khởi Đầu</strong><small id="area-sub">KHÁM PHÁ · HỌC HỎI · TRƯỞNG THÀNH</small></span></div>
      <div class="top-right"><span class="village-status"><i></i>Làng Khởi Đầu</span><button id="language" class="icon-button language-button" title="Switch language" aria-label="Switch language">${Va() === 'vi' ? 'EN' : 'VI'}</button><button id="sound" class="icon-button" title="Bật / tắt âm thanh" aria-label="Tắt âm thanh">${Xe('sound')}</button><button id="settings" class="icon-button" title="Cài đặt" aria-label="Cài đặt">${Xe('settings')}</button></div>
    </header>
    <section id="welcome" class="welcome">
      <div class="chapter"><span></span> MỘT CUỘC PHIÊU LƯU NHỎ</div>
      <h1>Math AI <br><span>Game</span><sup>3D</sup></h1>
      <p><strong>Vương Quốc Cửu Chương</strong><br>Mỗi phép nhân, một điều kỳ diệu.<br>Cùng Milo xây cầu và khám phá ngôi làng!</p>
      <div class="choose-label">Chọn người bạn đồng hành</div>
      <div class="avatar-options" role="group" aria-label="Chọn nhân vật"><button id="boy" class="avatar-option" aria-pressed="true"><span>👦</span>Nhà thám hiểm</button><button id="girl" class="avatar-option" aria-pressed="false"><span>👧</span>Nhà khám phá</button></div>
      <button id="play" class="primary play-button">Bắt đầu phiêu lưu ${Xe('arrow')}</button>
      <button id="learn-welcome" class="text-button">${Xe('book')} Khám phá bảng cửu chương</button>
      <div class="welcome-notes"><span>✦ Học qua những chuyến đi</span><span>Không giới hạn thời gian</span></div>
    </section>
    <div id="world-caption" class="world-caption"><span>0${Dt.at(-1).world}</span><div>Vương Quốc Cửu Chương<small>${Dt.length} vùng đất · Bảng ×2 – ×10</small></div></div>
    <div id="hud" class="hud" hidden>
      <div class="hud-left">
        <div class="player-card"><span id="avatar-face" class="avatar-face">👦</span><div class="player-info"><strong><span id="player-name">Nhà thám hiểm</span> <span class="level-badge" title="Cấp độ"><span id="level">1</span></span></strong><div class="xp-track" role="progressbar" aria-label="Tiến độ cấp độ" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i id="xp-fill"></i></div><small id="xp-text">0 / 100 XP</small></div><div id="wallet" class="wallet" title="xu">${Xe('coin')}<strong id="coins">0</strong></div></div>
        <aside id="quest-card" class="quest-card"><button id="quest-toggle" class="quest-head" aria-expanded="true" aria-controls="quest-body"><span class="eyebrow">${Xe('flag')} CHUYẾN PHIÊU LƯU ĐẦU TIÊN</span><span class="chevron">${Xe('chevron')}</span></button><h2 id="quest-title">Một cây cầu, ngàn niềm vui</h2><div id="quest-body" class="quest-body"><p id="quest-copy">Milo đang chờ bạn bên dòng sông. Đến gần và chào bạn ấy nhé!</p><div id="quest-steps" class="quest-steps"></div></div><div class="quest-bottom"><span id="quest-progress">Gặp người dẫn đường</span><span class="reward">${Xe('star')} +10 XP / câu</span></div></aside>
      </div>
      <button id="minimap" class="minimap" aria-label="Mở bản đồ thế giới" title="Bản đồ (M)"><canvas id="minimap-canvas"></canvas><span class="minimap-ring"></span><span class="minimap-key"><kbd>M</kbd></span></button>
      <button id="milo-label" class="world-label" aria-label="Nói chuyện với Milo"><span class="milo-dot">!</span><strong>Milo</strong><small>Người dẫn đường</small></button>
      <div id="bridge-label" class="world-label landmark"><strong>Cây cầu tình bạn</strong><small id="bridge-count">0 / 6 đoạn cầu</small></div>
      ${qa.map((i) => `<div id="${i.id}-label" class="world-label landmark region-label"><span class="region-icon">${i.icon}</span><strong>${i.name}</strong><small>${i.subtitle}</small></div>`).join('')}
      <div class="bottom-bar"><div class="controls-hint"><span class="key-group"><kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd></span><span>Di chuyển</span><span class="divider"></span><kbd>Space</kbd><span>Nhảy</span><span class="divider"></span><kbd>M</kbd><span>Bản đồ</span><span class="divider"></span><span>Kéo chuột để xoay</span></div><div class="toolbar"><div class="zoom-group"><button id="zoom-in" class="icon-button" aria-label="Phóng to" title="Phóng to">${Xe('plus')}</button><button id="zoom-out" class="icon-button" aria-label="Thu nhỏ" title="Thu nhỏ">${Xe('minus')}</button></div><button id="open-map" class="tool-button">${Xe('map')}<span>Bản đồ</span></button><button id="learn" class="tool-button">${Xe('book')}<span>Sổ cửu chương</span></button><button id="help" class="icon-button" aria-label="Hướng dẫn chơi" title="Hướng dẫn chơi">${Xe('help')}</button></div></div>
      <button id="interact" class="interact" hidden><kbd>E</kbd> Nói chuyện với Milo ${Xe('arrow')}</button>
      <div id="touch-controls" class="touch-controls"><div id="joystick" class="joystick" role="group" aria-label="Cần điều khiển di chuyển"><div id="joystick-knob"></div></div><button id="jump" class="jump-button" aria-label="Nhảy">${Xe('jump')}</button></div>
    </div>
    <section id="world-map" class="map-overlay" role="dialog" aria-modal="true" aria-labelledby="map-title" hidden>
      <canvas id="map-canvas" aria-label="Bản đồ Vương Quốc Cửu Chương"></canvas>
      <div class="map-head"><div class="dialog-eyebrow">BẢN ĐỒ THẾ GIỚI</div><h2 id="map-title">Vương Quốc Cửu Chương</h2><p>Chạm vào một vùng đất để xem thông tin.</p></div>
      <button id="close-map" class="dialog-close map-close" aria-label="Đóng bản đồ">${Xe('close')}</button>
      <aside class="map-panel"><div id="map-regions" class="map-regions"></div><div id="map-detail" class="map-detail"></div></aside>
    </section>
    <div id="toast" class="toast" role="status" aria-live="polite" hidden></div>
    <footer id="menu-footer" class="menu-footer"><span><b>AI</b>GAME3D<span class="dotcom">.COM</span></span><span>Một thế giới nhỏ. Những khám phá lớn.</span><span>Lưu trên thiết bị này ${Xe('save')}</span></footer>
    <dialog id="dialog" aria-labelledby="dialog-title"><button id="close-dialog" class="dialog-close" aria-label="Đóng">${Xe('close')}</button><div id="dialog-content"></div></dialog>
  </main>`;
Wa(tc);
function In(i) {
  Y('toast').textContent = Cn(i);
  Y('toast').hidden = false;
  clearTimeout(hl);
  hl = window.setTimeout(() => (Y('toast').hidden = true), 4200);
}
function Xt() {
  const i = Zm(ie);
  if (!i && !dl) {
    dl = true;
    In('Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.');
  }
  return i;
}
function fl(i) {
  const e = Y(i);
  e.classList.remove('bump');
  e.offsetWidth;
  e.classList.add('bump');
}
function _n() {
  const i = kr(ie.xp);
  const e = Sa[i - 1];
  const t = Sa[i];
  Y('level').textContent = String(i);
  Y('coins').textContent = String(ie.coins);
  Y('xp-text').textContent = Ln(t ? `${ie.xp - e} / ${t - e} XP` : `${ie.xp} XP · Cấp cao nhất`);
  const n = t ? Math.min(100, ((ie.xp - e) / (t - e)) * 100) : 100;
  Y('xp-fill').style.width = `${n}%`;
  Y('xp-fill').parentElement.setAttribute('aria-valuenow', String(Math.round(n)));
  Y('avatar-face').textContent = ie.avatar === 'girl' ? '👧' : '👦';
  Y('player-name').textContent = ie.avatar === 'girl' ? 'Nhà khám phá' : 'Nhà thám hiểm';
  Y('boy').setAttribute('aria-pressed', String(ie.avatar === 'boy'));
  Y('girl').setAttribute('aria-pressed', String(ie.avatar === 'girl'));
  Y('play').innerHTML = Ln(
    `${ie.started ? 'Tiếp tục phiêu lưu' : 'Bắt đầu phiêu lưu'} ${Xe('arrow')}`,
  );
  Y('quest-copy').textContent = ie.questComplete
    ? 'Bạn đã nối liền hai bờ! Hãy khám phá các vùng đất mới trên bản đồ, hoặc quay lại Milo để luyện tập.'
    : ie.bridge === yt
      ? 'Cây cầu đã sẵn sàng! Hãy đi qua cầu sang khu vườn bên kia sông.'
      : ie.questAccepted
        ? 'Giúp Milo chọn phép nhân đúng. Mỗi câu trả lời sẽ xây thêm một đoạn cầu.'
        : 'Milo đang chờ bạn bên dòng sông. Đến gần và chào bạn ấy nhé!';
  Y('quest-title').textContent = ie.questComplete
    ? 'Cây cầu tình bạn đã hoàn thành!'
    : 'Một cây cầu, ngàn niềm vui';
  Y('quest-progress').textContent = ie.questComplete
    ? '✓ Hoàn thành'
    : ie.bridge === yt
      ? 'Đi qua cầu để hoàn thành'
      : ie.questAccepted
        ? `${ie.bridge} / ${yt} đoạn cầu`
        : 'Gặp người dẫn đường';
  Y('quest-steps').innerHTML = Array.from(
    {
      length: yt,
    },
    (r, s) =>
      `<span class="${s < ie.bridge ? 'done' : ''}" aria-label="Đoạn ${s + 1}: ${s < ie.bridge ? 'đã xây' : 'chưa xây'}">${s < ie.bridge ? Xe('check') : s + 1}</span>`,
  ).join('');
  Y('bridge-count').textContent = `${ie.bridge} / ${yt} đoạn cầu`;
  for (const r of qa) {
    const s = Y(`${r.id}-label`);
    const a = Di(r, ie.questComplete);
    s.classList.toggle('locked', !a);
    s.querySelector('.region-icon').textContent = a ? r.icon : '🔒';
  }
  Y('sound').innerHTML = Xe(ie.sound ? 'sound' : 'mute');
  Y('sound').setAttribute('aria-label', ie.sound ? 'Tắt âm thanh' : 'Bật âm thanh');
  xt.enabled = ie.sound;
  Wa(Y('hud'));
}
function nc(i) {
  Y('quest-card').classList.toggle('collapsed', i);
  Y('quest-toggle').setAttribute('aria-expanded', String(!i));
  try {
    localStorage.setItem('aigame3d_quest_collapsed', i ? '1' : '0');
  } catch {}
}
Y('quest-toggle').onclick = () => nc(!Y('quest-card').classList.contains('collapsed'));
try {
  if (
    localStorage.getItem('aigame3d_quest_collapsed') === '1' ||
    matchMedia('(max-width: 700px)').matches
  ) {
    nc(true);
  }
} catch {}
function Jn(i, e, t) {
  if (Dn) {
    Kr();
  }
  _e.paused = true;
  _e.clearInput();
  Xa = t;
  Y('dialog-content').innerHTML = Ln(`<h2 id="dialog-title">${i}</h2>${e}`);
  const n = Y('dialog');
  if (!n.open) {
    n.showModal();
  }
}
function cr() {
  Y('dialog').close();
}
Y('dialog').addEventListener('close', () => {
  _e.paused = Dn;
  _e.clearInput();
  Xa = '';
  jn = undefined;
});
Y('close-dialog').onclick = cr;
Y('language').onclick = () => {
  rg(Va() === 'vi' ? 'en' : 'vi');
  location.reload();
};
function ug() {
  xt.unlock();
  xt.music(ie.music);
  ie.started = true;
  _e.active = true;
  _e.paused = false;
  _e.setAvatar(ie.avatar);
  Y('welcome').hidden = true;
  Y('hud').hidden = false;
  Y('area-label').hidden = false;
  Y('world-caption').hidden = true;
  Y('menu-footer').hidden = true;
  document.body.classList.add('playing');
  Xt();
  _n();
  bi = '';
  cc();
  requestAnimationFrame(sc);
  In('Chào bạn! Di chuyển đến Milo, hoặc chạm xuống đất để đi.');
}
function pl() {
  cr();
  Kr();
  _e.active = false;
  _e.clearInput();
  Y('welcome').hidden = false;
  Y('hud').hidden = true;
  Y('area-label').hidden = true;
  Y('world-caption').hidden = false;
  Y('menu-footer').hidden = false;
  document.body.classList.remove('playing');
  _n();
  xt.music(false);
}
Y('play').onclick = ug;
for (const i of ['boy', 'girl']) {
  Y(i).onclick = () => {
    ie.avatar = i;
    _e.setAvatar(i);
    _n();
    Xt();
  };
}
function Yr() {
  if (!_e.active || _e.paused) {
    return;
  }
  if (!ec) {
    In('Hãy đến gần Milo — người bạn có chiếc mũ xanh bên bờ sông.');
    return;
  }
  xt.unlock();
  const i = ie.bridge === yt;
  Jn(
    'Chào bạn, mình là Milo!',
    `<div class="dialog-eyebrow">NGƯỜI DẪN ĐƯỜNG CỦA BẠN</div><p class="dialog-copy">${i ? `Cây cầu của chúng mình thật đẹp! ${ie.questComplete ? 'Bạn muốn cùng mình luyện thêm phép nhân không?' : 'Bạn hãy đi qua cầu đến khu vườn bên kia nhé. Mình cũng luôn sẵn sàng luyện tập cùng bạn!'}` : 'Khu vườn bên kia sông đang chờ chúng mình. Hãy giúp mình xây <strong>6 đoạn cầu</strong> bằng những viên đá phép thuật nhé!'}</p><div class="milo-tip"><span>✦</span><p>${i ? 'Cứ thong thả, không cần vội. Mỗi lần thử là một lần bạn tiến bộ!' : 'Chọn phép nhân cho đúng số viên đá. Mỗi câu đúng: <b>+10 XP, +5 xu</b>. Nếu chưa đúng, chúng mình cùng đếm lại!'}</p></div><button id="accept-quest" class="primary wide">${i ? 'Cùng luyện tập' : 'Cùng xây cầu nào!'} ${Xe('arrow')}</button>`,
    'milo',
  );
  Y('accept-quest').onclick = () => {
    ie.questAccepted = true;
    Xt();
    _n();
    Xr(i ? 'practice' : 'bridge');
  };
}
Y('interact').onclick = Yr;
Y('milo-label').onclick = Yr;
function Xr(i, e = '') {
  Kt = i;
  jn = Jm(ie, Kt, e);
  Yn = 0;
  ya = false;
  ba = performance.now();
  const t = jn;
  Jn(
    Kt === 'bridge' ? 'Cùng xây cây cầu!' : 'Mỗi ngày, giỏi hơn một chút',
    `<div class="dialog-eyebrow">${Kt === 'bridge' ? `ĐOẠN CẦU ${ie.bridge + 1} / ${yt}` : t.review ? 'ÔN LẠI PHÉP NHÂN' : 'LUYỆN TẬP CÙNG MILO'}</div><p class="question-intro">${Kt === 'bridge' ? `Mình cần <strong>${t.answer} viên đá</strong>. Phép nhân nào đúng?` : 'Bạn tìm được kết quả không?'}</p><div class="equation">${Kt === 'bridge' ? `<span class="stone-symbol">◆</span> ${t.answer} <small>viên đá</small>` : `${t.a} <span>×</span> ${t.b} <span>=</span> ?`}</div><div class="answers">${t.options.map((n, r) => `<button class="answer" data-value="${n.value}"><kbd>${r + 1}</kbd><span>${n.label}</span></button>`).join('')}</div><div id="feedback" class="feedback" aria-live="polite"></div><div id="hint-area" class="hint-area" hidden></div><div class="quiz-footer"><button id="hint" class="text-button">${Xe('help')} Gợi ý cho mình</button><span>Không giới hạn thời gian</span></div><button id="next-question" class="primary wide" hidden>Tiếp tục ${Xe('arrow')}</button>`,
    'quiz',
  );
  document
    .querySelectorAll('.answer')
    .forEach((n) => (n.onclick = () => fg(Number(n.dataset.value), n)));
  Y('hint').onclick = () => {
    Yn = Math.min(3, Yn + 1);
    ic();
  };
  Y('next-question').onclick = () => {
    if (Kt === 'bridge' && ie.bridge === yt) {
      cr();
      In('Tuyệt vời! Cầu đã xây xong. Cùng đi qua cầu đến khu vườn nhé!');
    } else {
      Xr(Kt, t.id);
    }
  };
}
function ic() {
  if (!jn) {
    return;
  }
  const i = jn;
  const e = Y('hint-area');
  e.hidden = false;
  e.innerHTML = Ln(
    `<p>${tg(i, Yn)}</p><div class="stone-groups" aria-label="${i.a} nhóm, mỗi nhóm có ${i.b} viên đá">${Array.from(
      {
        length: i.a,
      },
      () => `<div class="stone-group">${'<i></i>'.repeat(i.b)}</div>`,
    ).join('')}</div>`,
  );
}
function dg(i) {
  const e = document.createElement('b');
  e.className = 'reward-pop';
  e.textContent = '+10 XP · +5';
  e.insertAdjacentHTML('beforeend', Xe('coin'));
  i.append(e);
  e.addEventListener('animationend', () => e.remove());
}
function fg(i, e) {
  if (!jn || ya || e.disabled) {
    return;
  }
  xt.unlock();
  const t = jn;
  const n = Qm(t, i);
  eg(ie, t, n, performance.now() - ba);
  ba = performance.now();
  if (n) {
    ya = true;
    if (Yn === 0) {
      ie.review = ie.review.filter((s) => s !== t.id);
    }
    const r = kr(ie.xp);
    ie.xp += 10;
    ie.coins += 5;
    if (Kt === 'bridge') {
      ie.bridge = Math.min(yt, ie.bridge + 1);
      _e.setBridge(ie.bridge, true);
    }
    document.querySelectorAll('.answer').forEach((s) => (s.disabled = true));
    e.classList.add('correct');
    dg(e);
    Y('feedback').className = 'feedback success';
    Y('feedback').textContent = Ln(
      `✓ Chính xác! ${t.a} × ${t.b} = ${t.answer}. +10 XP · +5 xu${ie.combo >= 3 ? ` · Combo ${ie.combo}!` : ''}`,
    );
    Y('next-question').hidden = false;
    Y('next-question').innerHTML = Ln(
      `${Kt === 'bridge' && ie.bridge === yt ? 'Khám phá bên kia cầu!' : Kt === 'bridge' ? 'Xây đoạn cầu tiếp theo' : 'Thử thêm một câu'} ${Xe('arrow')}`,
    );
    Y('hint').hidden = true;
    xt.correct();
    _e.burst(_e.player.position.clone().add(new Vector3(0, 1, 0)));
    fl('wallet');
    fl('xp-fill');
    if (kr(ie.xp) > r) {
      xt.celebrate();
      In(`Bạn đã đạt cấp ${kr(ie.xp)}. Thật tuyệt vời!`);
    }
    Y('next-question').focus();
  } else {
    Yn = Math.min(3, Yn + 1);
    e.classList.add('incorrect');
    e.disabled = true;
    Y('feedback').className = 'feedback gentle';
    Y('feedback').textContent = Cn('↻ Chưa đúng rồi. Mình cùng đếm lại nhé!');
    ic();
    xt.hint();
  }
  _n();
  Xt();
}
function $a(i = ie.table || 2) {
  Jn(
    'Sổ cửu chương',
    `<div class="dialog-eyebrow">HỌC TỪNG CHÚT, NHỚ THẬT LÂU</div><div class="table-tabs" role="group" aria-label="Chọn bảng cửu chương">${Ha.map((e) => `<button data-table="${e}" aria-pressed="${e === i}">×${e}</button>`).join('')}</div><div class="multiplication-grid">${Array.from(
      {
        length: 10,
      },
      (e, t) => {
        const n = ie.questionStats[`m${i}_${t + 1}`];
        return `<div class="${n?.correct ? 'known' : ''}"><span>${i} × ${t + 1}</span><b>= ${i * (t + 1)}</b><small>${n?.correct ? '✓' : ''}</small></div>`;
      },
    ).join(
      '',
    )}</div><p class="book-note">Dấu ✓ là phép nhân bạn đã trả lời đúng. Mình luyện thêm nhé?</p><button id="practice-table" class="primary wide">Luyện bảng ×${i} ${Xe('arrow')}</button><button id="practice-all" class="text-button centered">Trộn các bảng ×2 – ×10</button>`,
    'book',
  );
  document
    .querySelectorAll('[data-table]')
    .forEach((e) => (e.onclick = () => $a(Number(e.dataset.table))));
  Y('practice-table').onclick = () => {
    ie.table = i;
    Xt();
    Xr('practice');
  };
  Y('practice-all').onclick = () => {
    ie.table = 0;
    Xt();
    Xr('practice');
  };
}
Y('learn').onclick = () => $a();
Y('learn-welcome').onclick = () => $a();
function pg() {
  Jn(
    'Sẵn sàng phiêu lưu?',
    `<div class="help-list"><div><b>1</b><p><strong>Khám phá ngôi làng</strong>Nhấn WASD / phím mũi tên, hoặc chạm xuống đất để di chuyển. Trên màn hình cảm ứng, dùng cần điều khiển.</p></div><div><b>2</b><p><strong>Làm quen với Milo</strong>Đến gần chiếc mũ xanh rồi nhấn E hoặc nút “Nói chuyện”.</p></div><div><b>3</b><p><strong>Xây cầu bằng phép nhân</strong>Chọn 1 trong 3 đáp án. Cần giúp đỡ? Nhấn “Gợi ý cho mình”.</p></div><div><b>4</b><p><strong>Mở bản đồ thế giới</strong>Nhấn M hoặc chạm vào bản đồ nhỏ ở góc màn hình để xem các vùng đất.</p></div></div><div class="milo-tip"><p><b>Space</b>: nhảy · <b>Kéo trên làng</b>: xoay camera · <b>Lăn chuột</b>: phóng to / thu nhỏ · <b>Esc</b>: tạm dừng.</p></div><button id="understood" class="primary wide">Mình hiểu rồi! ${Xe('check')}</button>`,
    'help',
  );
  Y('understood').onclick = cr;
}
Y('help').onclick = pg;
function Ti() {
  const i = Object.values(ie.questionStats);
  const e = i.reduce((n, r) => n + r.attempts, 0);
  const t = i.reduce((n, r) => n + r.correct, 0);
  Jn(
    'Một chút cài đặt',
    `<div class="settings-row"><span>Hiệu ứng âm thanh</span><button id="toggle-sound" class="switch" role="switch" aria-checked="${ie.sound}" aria-label="Hiệu ứng âm thanh"><i></i></button></div><div class="settings-row"><span>Nhạc nền nhẹ nhàng</span><button id="toggle-music" class="switch" role="switch" aria-checked="${ie.music}" aria-label="Nhạc nền"><i></i></button></div><div class="progress-summary"><span><strong>${ie.xp}</strong>XP tích lũy</span><span><strong>${e}</strong>Lượt trả lời</span><span><strong>${e ? Math.round((t / e) * 100) : 0}%</strong>Trả lời đúng</span></div><p class="book-note">Tiến trình tự lưu trên trình duyệt này, không cần tài khoản. Xóa dữ liệu trình duyệt sẽ xóa tiến trình.</p><button id="save-now" class="secondary wide">${Xe('save')} Lưu tiến trình</button><button id="return-menu" class="text-button centered">Về màn hình chính</button><button id="reset-progress" class="text-button danger centered">${Xe('reset')} Chơi lại từ đầu</button>`,
    'settings',
  );
  Y('toggle-sound').onclick = () => {
    xt.unlock();
    ie.sound = !ie.sound;
    xt.enabled = ie.sound;
    Xt();
    _n();
    Ti();
  };
  Y('toggle-music').onclick = () => {
    xt.unlock();
    ie.music = !ie.music;
    xt.music(ie.music);
    Xt();
    Ti();
  };
  Y('save-now').onclick = () => {
    if (Xt()) {
      In('Đã lưu hành trình của bạn trên thiết bị này.');
    }
  };
  Y('return-menu').onclick = pl;
  Y('reset-progress').onclick = () => {
    Jn(
      'Bắt đầu lại hành trình?',
      '<p class="dialog-copy">XP, xu, cây cầu và lịch sử luyện tập trên thiết bị này sẽ bị xóa. Không thể hoàn tác.</p><button id="confirm-reset" class="primary danger-bg wide">Xóa tiến trình và chơi lại</button><button id="cancel-reset" class="text-button centered">Giữ lại hành trình</button>',
      'reset',
    );
    Y('cancel-reset').onclick = Ti;
    Y('confirm-reset').onclick = () => {
      ie = Ga();
      Xt();
      _e.setBridge(0);
      _e.player.position.set(-6, 0, 6);
      _e.setAvatar(ie.avatar);
      _e.resetCamera();
      pl();
      In('Một hành trình mới đang chờ bạn!');
    };
  };
}
Y('settings').onclick = Ti;
Y('sound').onclick = () => {
  xt.unlock();
  ie.sound = !ie.sound;
  _n();
  Xt();
};
Y('jump').onclick = () => _e.jump();
Y('zoom-in').onclick = () => _e.zoom(-8);
Y('zoom-out').onclick = () => _e.zoom(8);
function rc(i, e = i) {
  const t = _e.player.position;
  return {
    player: {
      x: t.x,
      z: t.z,
      facing: _e.player.rotation.y,
    },
    milo: {
      x: _e.milo.position.x,
      z: _e.milo.position.z,
    },
    bridge: ie.bridge,
    questComplete: ie.questComplete,
    selected: e ? Ei : undefined,
    labels: i,
    translate: Cn,
    time: performance.now() / 1000,
  };
}
function sc() {
  const { ctx: i, w: e, h: t } = Jl(Y('minimap-canvas'));
  const n = _e.player.position;
  Ql(
    i,
    e,
    t,
    {
      cx: n.x,
      cz: n.z,
      scale: e / 70,
      rotation: _e.heading,
    },
    rc(false),
  );
}
function ac() {
  if (!Dn) {
    return;
  }
  const i = Y('map-canvas');
  const { ctx: e, w: t, h: n } = Jl(i);
  Ql(e, t, n, oc(t, n), rc(t > 600, true));
  requestAnimationFrame(ac);
}
function oc(i, e) {
  const t = i > 820;
  const n = lg(t ? i - 360 : i, t ? e : e * 0.62, t ? 56 : 22);
  if (t) {
    n.cx += 180 / n.scale;
  } else {
    n.cz += (e * 0.19) / n.scale;
  }
  return n;
}
function Ya() {
  Y('map-regions').innerHTML = Ln(
    Dt.map((e) => {
      const t = Di(e, ie.questComplete);
      return `<button class="map-region${t ? '' : ' locked'}" data-region="${e.id}" aria-pressed="${Ei === e.id}"><span class="map-region-icon" style="--tint:${e.color}">${t ? e.icon : '🔒'}</span><span><strong>${e.name}</strong><small>${e.subtitle}</small></span>${bi === e.id ? '<em>Bạn ở đây</em>' : ''}</button>`;
    }).join(''),
  );
  const i = Dt.find((e) => e.id === Ei);
  Y('map-detail').innerHTML = i
    ? Ln(
        `<strong>${i.icon} ${i.name}</strong><p>${i.blurb}</p>${Di(i, ie.questComplete) ? '' : `<p class="map-locked">${Xe('lock')} Mở khóa khi hoàn thành Cây cầu tình bạn</p>`}`,
      )
    : '';
  document.querySelectorAll('[data-region]').forEach(
    (e) =>
      (e.onclick = () => {
        Ei = e.dataset.region;
        Ya();
      }),
  );
}
function Ka() {
  if (!(!_e.active || Y('dialog').open)) {
    Dn = true;
    _e.paused = true;
    _e.clearInput();
    Ei = bi || undefined;
    Y('world-map').hidden = false;
    Ya();
    Wa(Y('world-map'));
    Y('close-map').focus();
    requestAnimationFrame(ac);
  }
}
function Kr() {
  if (Dn) {
    Dn = false;
    Y('world-map').hidden = true;
    _e.paused = false;
    _e.clearInput();
  }
}
Y('minimap').onclick = Ka;
Y('open-map').onclick = Ka;
Y('close-map').onclick = Kr;
Y('map-canvas').addEventListener('click', (i) => {
  const e = i.currentTarget;
  const t = e.getBoundingClientRect();
  const n = oc(t.width, t.height);
  const r = cg(n, t.width, t.height, i.clientX - t.left, i.clientY - t.top);
  Ei = hg(r.x, r.z)?.id;
  Ya();
});
document.addEventListener('keydown', (i) => {
  if (i.repeat && ['e', ' ', 'Escape', 'm', 'M'].includes(i.key)) {
    return;
  }
  if (Y('dialog').open) {
    if (Xa === 'quiz' && /^[123]$/.test(i.key)) {
      const t = document.querySelectorAll('.answer')[Number(i.key) - 1];
      if (t && !t.disabled) {
        t.click();
      }
    }
    return;
  }
  if (Dn) {
    if (i.key === 'Escape' || i.key.toLowerCase() === 'm') {
      i.preventDefault();
      Kr();
    }
    return;
  }
  if (!_e?.active) {
    return;
  }
  const e = i.key.toLowerCase();
  if (['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(e)) {
    i.preventDefault();
    _e.keys.add(e);
  }
  if (e === ' ') {
    _e.jump();
  }
  if (e === 'e') {
    Yr();
  }
  if (e === 'm') {
    Ka();
  }
  if (e === 'escape') {
    i.preventDefault();
    Ti();
  }
});
document.addEventListener('keyup', (i) => _e?.keys.delete(i.key.toLowerCase()));
window.addEventListener('blur', () => {
  _e?.clearInput();
  if (_e?.active && !Dn && !Y('dialog').open) {
    Ti();
  }
});
document.addEventListener('visibilitychange', () => {
  _e?.clearInput();
  if (document.hidden) {
    xt.music(false);
  } else if (_e?.active) {
    xt.music(ie.music);
  }
});
const nr = Y('joystick');
let Za = -1;
function lc(i) {
  if (i.pointerId !== Za) {
    return;
  }
  const e = nr.getBoundingClientRect();
  let t = (i.clientX - e.left - e.width / 2) / 34;
  let n = (i.clientY - e.top - e.height / 2) / 34;
  const r = Math.max(1, Math.hypot(t, n));
  t /= r;
  n /= r;
  _e.joystick = {
    x: t,
    y: n,
  };
  Y('joystick-knob').style.transform = `translate(${t * 30}px,${n * 30}px)`;
}
nr.addEventListener('pointerdown', (i) => {
  Za = i.pointerId;
  nr.setPointerCapture(i.pointerId);
  lc(i);
});
nr.addEventListener('pointermove', lc);
for (const i of ['pointerup', 'pointercancel']) {
  nr.addEventListener(i, () => {
    Za = -1;
    _e.joystick = {
      x: 0,
      y: 0,
    };
    Y('joystick-knob').style.transform = '';
  });
}
function Ls(i, e, t, n) {
  const r = _e.project(e);
  const s = Math.max(0, Math.min(1, 1 - (r.distance - 70) / 70));
  i.hidden = n || !r.visible || s <= 0;
  if (!i.hidden) {
    i.style.transform = `translate(${r.x}px,${r.y}px) ${t}`;
    i.style.opacity = String(s);
  }
}
function cc() {
  const i = _e.player.position;
  const e = Xm(i.x, i.z);
  if (e.id === bi) {
    return;
  }
  const t = bi === '';
  bi = e.id;
  Y('area-icon').textContent = e.icon;
  Y('area-name').textContent = Cn(e.name);
  Y('area-sub').textContent = Cn(e.subtitle);
  const n = Y('area-label');
  n.classList.remove('arrive');
  n.offsetWidth;
  n.classList.add('arrive');
  if (!t && _e.active && e.id !== 'village' && e.id !== 'garden' && Di(e, ie.questComplete)) {
    In(Va() === 'vi' ? `Chào mừng đến ${e.name}!` : `Welcome to ${Cn(e.name)}!`);
  }
}
try {
  _e = new $m(Y('world'));
  _e.setBridge(ie.bridge);
  _e.setAvatar(ie.avatar);
  _e.onJump = () => xt.jump();
  _e.onSceneClick = () => Yr();
  _e.onFrame = (i, e) => {
    ec = i;
    if (!(++ul % 2 !== 0 || !_e.active)) {
      Y('interact').hidden = !i || _e.paused;
      Ls(Y('milo-label'), new Vector3(-3, 3.5, 1.5), 'translate(-50%,-100%)', _e.paused);
      Ls(Y('bridge-label'), new Vector3(7, 0.8, 0), 'translate(-50%,15px)', _e.paused);
      for (const t of qa) {
        Ls(
          Y(`${t.id}-label`),
          new Vector3(t.center[0], t.labelHeight, t.center[1]),
          'translate(-50%,-100%)',
          _e.paused,
        );
      }
      Y('milo-label').classList.toggle('near', i);
      cc();
      if (ul % 6 === 0) {
        sc();
      }
      if (_e.active && !_e.paused && ie.bridge === yt && !ie.questComplete && e) {
        ie.questComplete = true;
        ie.xp += 50;
        ie.coins += 10;
        Xt();
        _n();
        xt.celebrate();
        _e.burst(_e.player.position.clone().add(new Vector3(0, 1, 0)));
        Jn(
          'Bạn đã làm được rồi!',
          `<div class="completion-medal">${Xe('crown')}</div><p class="dialog-copy centered">Nhờ bạn, hai bờ đã được nối liền.<br><b>Cây cầu tình bạn</b> đã hoàn thành!</p><div class="completion-rewards"><span>★ +50 XP</span><span>◉ +10 xu</span></div><p class="book-note centered">4 vùng đất mới đã mở trên bản đồ. Nhấn M để xem!</p><button id="keep-playing" class="primary wide">Tiếp tục khám phá ${Xe('arrow')}</button>`,
          'complete',
        );
        Y('keep-playing').onclick = cr;
      }
    }
  };
  Y('loading').hidden = true;
  _n();
} catch (i) {
  Y('loading').innerHTML =
    '<strong>Chưa mở được thế giới 3D</strong><p>Hãy bật tăng tốc đồ họa trong trình duyệt, hoặc thử Chrome / Edge mới hơn.</p><button class="primary" onclick="location.reload()">Thử lại</button>';
  console.error(i);
}

export { ie };
