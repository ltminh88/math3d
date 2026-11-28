// Level exit target (two-modes Phase 2): where a level run returns when it ends. In normal
// play the run returns to the world; in English mode it returns to the English home, and
// the world stays built but inactive — suspended, never resumed — behind the home. The host
// reads this module on its exit paths; the English home sets it when it opens and clears
// it when the child goes back to the menu.
export type LevelExitTarget = 'world' | 'english-home';

let target: LevelExitTarget = 'world';
let onExitToHome: (() => void) | undefined;

/**
 * Sets where the next level exit lands. The callback runs on every exit while the target
 * is 'english-home' (a child may play several stages in a row); switching back to
 * 'world' clears it.
 */
export function setLevelExitTarget(next: LevelExitTarget, onExit?: () => void): void {
  target = next;
  onExitToHome = next === 'english-home' ? onExit : undefined;
}

export function getLevelExitTarget(): LevelExitTarget {
  return target;
}

/** Shows the English home again after a run, when that is where exits land. */
export function runLevelExitTarget(): void {
  if (target === 'english-home') onExitToHome?.();
}
