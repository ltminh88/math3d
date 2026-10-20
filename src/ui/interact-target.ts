// The `#interact` button and the E key act on the nearest interactable in reach (VLM, level
// gates, later the shop stall). For VLM the button keeps its recovered markup byte for byte;
// other targets show their own label.
import type { Interactable } from '../world/world-interactables';
import { getWorld } from './game-state';
import { talkToGuide } from './guide-dialog';
import { byId, icon } from './icons';

/** VLM's reach: the recovered `nearMilo()` distance (strictly closer than 3.1). */
export const GUIDE_REACH = 3.1;

let guideHtml: string | undefined;
let shown = '';

/** Registers VLM as the interactable that wins near ties (call once the world exists). */
export function registerGuideInteractable(): void {
  const world = getWorld();
  world.registerInteractable({
    id: 'vlm',
    position: { x: world.milo.position.x, z: world.milo.position.z },
    radius: GUIDE_REACH,
    priority: 0,
    label: () => 'VLM',
    onInteract: talkToGuide,
  });
}

/** Shows/hides the interact button for `target` (DOM touched only when the target changes). */
export function renderInteractButton(target: Interactable | undefined, paused: boolean): void {
  const button = byId('interact');
  button.hidden = !target || paused;
  if (!target) return;
  // Captured after the shell was translated, so the VLM prompt stays in the current language.
  guideHtml ??= button.innerHTML;
  const key = target.id === 'vlm' ? 'vlm' : `${target.id}|${target.label()}`;
  if (key === shown) return;
  shown = key;
  if (target.id === 'vlm') {
    button.innerHTML = guideHtml;
    return;
  }
  button.innerHTML = `<kbd>E</kbd> <span></span> ${icon('arrow')}`;
  (button.querySelector('span') as HTMLElement).textContent = target.label();
}

/** E key / interact button: use the nearest interactable, else nudge the player toward VLM. */
export function interactWithNearest(): void {
  const world = getWorld();
  if (!world.active || world.paused) return;
  const target = world.nearestInteractable();
  if (target) target.onInteract();
  else talkToGuide();
}
