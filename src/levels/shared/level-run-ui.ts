// DOM side of a level run: the overlay root levels draw their UI into, the host's "back to the
// world" button, and hiding the world HUD/top bar while the level owns the screen. Focus moves
// into the layer on mount (keyboard and screen-reader users land in the level) and goes back to
// where it was on unmount.
import { byId, icon } from '../../ui/icons';
import { tl } from './level-host-strings';

export interface LevelRunUi {
  readonly root: HTMLElement;
  unmount(): void;
}

/** Mounts the overlay over the world canvas; `onLeave` ends the run as not completed. */
export function mountLevelRunUi(title: string, onLeave: () => void): LevelRunUi {
  const shell = byId('world').parentElement as HTMLElement;
  const canvas = byId('world');
  const hud = byId('hud');
  const canvasLabel = canvas.getAttribute('aria-label') ?? '';
  const previousFocus = document.activeElement as HTMLElement | null;
  const root = document.createElement('section');
  root.className = 'level-layer';
  root.tabIndex = -1;
  root.setAttribute('aria-label', title);
  const leave = document.createElement('button');
  leave.type = 'button';
  leave.className = 'tool-button level-leave';
  leave.innerHTML = `${icon('close')}<span></span>`;
  (leave.lastElementChild as HTMLElement).textContent = tl('leave');
  leave.addEventListener('click', onLeave);
  root.append(leave);
  shell.append(root);
  shell.classList.add('in-level');
  hud.hidden = true;
  canvas.setAttribute('aria-label', title);
  root.focus({ preventScroll: true });
  return {
    root,
    unmount() {
      root.remove();
      shell.classList.remove('in-level');
      hud.hidden = false;
      canvas.setAttribute('aria-label', canvasLabel);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    },
  };
}
