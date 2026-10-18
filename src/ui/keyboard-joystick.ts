// Keyboard (WASD/arrows, Space, E, M, Esc, quiz keys 1-3), focus/visibility handling and the
// touch joystick. Quirk kept: losing window focus while playing opens the settings dialog.
import { gameState, getWorld } from './game-state';
import { byId } from './icons';
import { closeMap, openMap } from './map-overlay';
import { talkToMilo } from './milo-dialog';
import { openSettings } from './settings-dialog';

const NO_REPEAT_KEYS = ['e', ' ', 'Escape', 'm', 'M'];
const MOVE_KEYS = ['w', 'a', 's', 'd', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '];
const JOYSTICK_RADIUS = 34;
const KNOB_TRAVEL = 30;

function onKeyDown(event: KeyboardEvent): void {
  if (event.repeat && NO_REPEAT_KEYS.includes(event.key)) return;
  if (byId<HTMLDialogElement>('dialog').open) {
    if (gameState.dialogKind === 'quiz' && /^[123]$/.test(event.key)) {
      const answer = document.querySelectorAll<HTMLButtonElement>('.answer')[Number(event.key) - 1];
      if (answer && !answer.disabled) {
        answer.click();
      }
    }
    return;
  }
  if (gameState.mapOpen) {
    if (event.key === 'Escape' || event.key.toLowerCase() === 'm') {
      event.preventDefault();
      closeMap();
    }
    return;
  }
  const world = gameState.world;
  if (!world?.active) return;
  const key = event.key.toLowerCase();
  if (MOVE_KEYS.includes(key)) {
    event.preventDefault();
    world.keys.add(key);
  }
  if (key === ' ') world.jump();
  if (key === 'e') talkToMilo();
  if (key === 'm') openMap();
  if (key === 'escape') {
    event.preventDefault();
    openSettings();
  }
}

function wireFocusAndVisibility(): void {
  window.addEventListener('blur', () => {
    gameState.world?.clearInput();
    if (gameState.world?.active && !gameState.mapOpen && !byId<HTMLDialogElement>('dialog').open) {
      openSettings();
    }
  });
  document.addEventListener('visibilitychange', () => {
    gameState.world?.clearInput();
    if (document.hidden) {
      gameState.audio.music(false);
    } else if (gameState.world?.active) {
      gameState.audio.music(gameState.save.music);
    }
  });
}

function wireJoystick(): void {
  const pad = byId('joystick');
  let activePointer = -1;
  const move = (event: PointerEvent): void => {
    if (event.pointerId !== activePointer) return;
    const rect = pad.getBoundingClientRect();
    let x = (event.clientX - rect.left - rect.width / 2) / JOYSTICK_RADIUS;
    let y = (event.clientY - rect.top - rect.height / 2) / JOYSTICK_RADIUS;
    const length = Math.max(1, Math.hypot(x, y));
    x /= length;
    y /= length;
    getWorld().joystick = { x, y };
    byId('joystick-knob').style.transform = `translate(${x * KNOB_TRAVEL}px,${y * KNOB_TRAVEL}px)`;
  };
  pad.addEventListener('pointerdown', (event) => {
    activePointer = event.pointerId;
    pad.setPointerCapture(event.pointerId);
    move(event);
  });
  pad.addEventListener('pointermove', move);
  for (const type of ['pointerup', 'pointercancel'] as const) {
    pad.addEventListener(type, () => {
      activePointer = -1;
      getWorld().joystick = { x: 0, y: 0 };
      byId('joystick-knob').style.transform = '';
    });
  }
}

export function wireKeyboardAndJoystick(): void {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', (event) =>
    gameState.world?.keys.delete(event.key.toLowerCase()),
  );
  wireFocusAndVisibility();
  wireJoystick();
}
