import type { SceneTransition } from '../../core/scene-manager';

const FADE_MS = 280;

function prefersReducedMotion(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Full-screen veil used between scenes. Resolves even if transitionend never fires. */
export function createFadeTransition(root: HTMLElement): SceneTransition & { destroy(): void } {
  const veil = root.ownerDocument.createElement('div');
  veil.className = 'kit-fade';
  veil.setAttribute('aria-hidden', 'true');
  root.appendChild(veil);

  const fadeTo = (visible: boolean): Promise<void> =>
    new Promise((resolve) => {
      if (veil.classList.contains('kit-fade--on') === visible || prefersReducedMotion()) {
        veil.classList.toggle('kit-fade--on', visible);
        resolve();
        return;
      }
      const done = () => {
        clearTimeout(timer);
        veil.removeEventListener('transitionend', done);
        resolve();
      };
      const timer = setTimeout(done, FADE_MS + 100);
      veil.addEventListener('transitionend', done);
      veil.classList.toggle('kit-fade--on', visible);
    });

  return {
    out: () => fadeTo(true),
    in: () => fadeTo(false),
    destroy: () => veil.remove(),
  };
}
