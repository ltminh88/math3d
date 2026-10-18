// Parity init script: a fully virtual clock. Nothing in the page observes real time.
// Playwright's page.clock leaks a few real milliseconds between install and pause on every new
// document, which shifts requestAnimationFrame phase and the game's Clock.getDelta() values.
// - performance.now / Date / Date.now  -> virtual time (Date starts at __PARITY_CLOCK_START__)
// - setTimeout / setInterval / rAF     -> queued, fired only by window.__parityStep(frames)
// - CSS animations + transitions       -> paused and seeked to virtual time every frame
// window.__parityStep(n, grab) advances n frames of 16 ms; with grab=true it returns the #world
// canvas as a PNG data URL read in the same task as the last render (exact WebGL pixels).
(() => {
  const FRAME_MS = 16;
  const start = window.__PARITY_CLOCK_START__ ?? Date.UTC(2026, 9, 18, 12, 0, 0);
  let now = 0;

  const realSetTimeout = window.setTimeout.bind(window);
  const realRaf = window.requestAnimationFrame.bind(window);
  performance.now = () => now;
  const RealDate = Date;
  class VirtualDate extends RealDate {
    constructor(...args) {
      if (args.length) super(...args);
      else super(start + now);
    }
    static now() {
      return start + now;
    }
  }
  window.Date = VirtualDate;

  let nextId = 1;
  const timers = new Map(); // id -> { due, fn, args, interval }
  let frameCallbacks = new Map(); // id -> fn
  const addTimer = (fn, delay, args, interval) => {
    const id = nextId++;
    const ms = Math.max(0, Number(delay) || 0);
    timers.set(id, { due: now + ms, fn, args, interval: interval ? Math.max(1, ms) : 0 });
    return id;
  };
  window.setTimeout = (fn, delay, ...args) => addTimer(fn, delay, args, false);
  window.setInterval = (fn, delay, ...args) => addTimer(fn, delay, args, true);
  window.clearTimeout = (id) => timers.delete(id);
  window.clearInterval = (id) => timers.delete(id);
  window.requestAnimationFrame = (fn) => {
    const id = nextId++;
    frameCallbacks.set(id, fn);
    return id;
  };
  window.cancelAnimationFrame = (id) => frameCallbacks.delete(id);

  const runDueTimers = () => {
    for (;;) {
      let pick;
      for (const [id, t] of timers) {
        if (t.due <= now && (!pick || t.due < pick[1].due)) pick = [id, t];
      }
      if (!pick) return;
      const [id, t] = pick;
      if (t.interval) t.due += t.interval;
      else timers.delete(id);
      if (typeof t.fn === 'function') t.fn(...t.args);
    }
  };

  const animationStart = new WeakMap();
  const syncAnimations = () => {
    for (const a of document.getAnimations()) {
      let t0 = animationStart.get(a);
      if (t0 === undefined) {
        t0 = now;
        animationStart.set(a, t0);
      }
      if (a.playState !== 'paused') a.pause();
      a.currentTime = now - t0;
    }
  };

  // Pause anything the browser starts between steps (or during load) as soon as it starts.
  for (const type of ['animationstart', 'transitionrun']) {
    document.addEventListener(type, syncAnimations, true);
  }

  // Let queued real tasks (e.g. dialog 'close' events) and the compositor settle; virtual time
  // does not move. Called after every interaction and before every screenshot.
  window.__parityFlush = (settleMs = 0) =>
    new Promise((resolve) =>
      realSetTimeout(() => realRaf(() => realRaf(() => realSetTimeout(resolve, settleMs))), 0),
    );
  window.__parityNow = () => now;
  window.__paritySyncAnimations = syncAnimations;
  window.__parityStep = (frames, grab = false) => {
    // Adopt animations started since the last step at the current time first, so their start
    // never depends on whether the browser's animationstart event raced ahead of this call.
    syncAnimations();
    for (let i = 0; i < frames; i++) {
      now += FRAME_MS;
      runDueTimers();
      const callbacks = frameCallbacks;
      frameCallbacks = new Map();
      for (const fn of callbacks.values()) fn(now);
      syncAnimations();
    }
    return grab ? document.getElementById('world')?.toDataURL('image/png') : undefined;
  };
})();
