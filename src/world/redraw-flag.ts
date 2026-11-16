// One-shot "the paused world needs one fresh frame" flag. While the world is paused the
// frame loop skips its render (each software-rendered frame costs seconds), so a redraw
// only happens when something asks for one: entering pause, a resize, a context restore,
// a scene change while paused, or a parity capture. Pure logic: no three.js, no DOM.
export class RedrawFlag {
  private pending = false;

  /** Ask for one fresh frame on the next loop tick. */
  request(): void {
    this.pending = true;
  }

  /** True once per request; consumes the flag. */
  take(): boolean {
    const pending = this.pending;
    this.pending = false;
    return pending;
  }
}
