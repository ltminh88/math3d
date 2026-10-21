// Pause bookkeeping of World.suspend()/resume(): the world is paused while a level owns the
// renderer and gets its own pause state back afterwards (a dialog or the map closing meanwhile
// may have rewritten `paused`; world input also checks `suspended` for that window).

export interface SuspendableWorld {
  paused: boolean;
  clearInput(): void;
}

export class WorldSuspension {
  private suspendedNow = false;
  private pausedBefore = false;

  get active(): boolean {
    return this.suspendedNow;
  }

  /** False when already suspended (nothing to do). */
  suspend(world: SuspendableWorld): boolean {
    if (this.suspendedNow) return false;
    this.suspendedNow = true;
    this.pausedBefore = world.paused;
    world.paused = true;
    world.clearInput();
    return true;
  }

  /** False when not suspended (nothing to do). */
  resume(world: SuspendableWorld): boolean {
    if (!this.suspendedNow) return false;
    this.suspendedNow = false;
    world.paused = this.pausedBefore;
    world.clearInput();
    return true;
  }
}
