import { FrameStats } from './frame-stats';

/** Refresh interval for the on-screen readout. */
const REFRESH_MS = 1000;

/**
 * Dev-only frame-time probe (replaces the old bench page). Enabled with `?debug=fps`;
 * main.ts imports it behind `import.meta.env.DEV`, so production bundles never contain it.
 */
export function startFpsOverlay(doc: Document = document): () => void {
  const win = doc.defaultView;
  if (!win) return () => {};
  const stats = new FrameStats();
  const box = doc.createElement('div');
  box.setAttribute('aria-hidden', 'true');
  box.style.cssText =
    'position:fixed;left:8px;bottom:8px;z-index:99999;padding:4px 8px;border-radius:6px;' +
    'background:rgba(0,0,0,.7);color:#7fff7f;font:12px/1.3 monospace;pointer-events:none;white-space:pre';
  doc.body.append(box);

  let last = win.performance.now();
  let lastPaint = last;
  let raf = 0;
  const tick = (now: number): void => {
    stats.add(now - last);
    last = now;
    if (now - lastPaint >= REFRESH_MS) {
      const s = stats.summary();
      box.textContent =
        `${s.avgFps.toFixed(0)} fps  avg ${s.avgMs.toFixed(1)} ms\n` +
        `p95 ${s.p95Ms.toFixed(1)}  max ${s.maxMs.toFixed(1)}  slow ${(s.slowShare * 100).toFixed(0)}%`;
      stats.reset();
      lastPaint = now;
    }
    raf = win.requestAnimationFrame(tick);
  };
  raf = win.requestAnimationFrame(tick);

  return () => {
    win.cancelAnimationFrame(raf);
    box.remove();
  };
}
