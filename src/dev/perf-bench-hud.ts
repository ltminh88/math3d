import type { Engine } from '../core/engine';
import { FrameStats } from './frame-stats';

const RUN_SECONDS = 60;

export interface HudActions {
  leakCheck: () => Promise<string>;
  cycleTier: () => void;
  toggleScene: () => void;
}

/** Dev overlay: live fps / draw calls / triangles / tier, a 60 s recorded run, leak check. */
export function createBenchHud(engine: Engine, root: HTMLElement, actions: HudActions): void {
  const hud = document.createElement('pre');
  hud.style.cssText =
    'position:absolute;top:8px;right:8px;margin:0;padding:8px;border-radius:8px;background:rgba(0,0,0,.72);color:#9f9;font:12px/1.4 monospace;max-width:46ch;white-space:pre-wrap';
  const bar = document.createElement('div');
  bar.style.cssText = 'position:absolute;left:8px;bottom:8px;display:flex;gap:8px;flex-wrap:wrap';
  const message = document.createElement('div');
  message.style.cssText = 'margin-top:8px;color:#ff9';
  root.append(hud, bar);

  const live = new FrameStats();
  const run = new FrameStats();
  let runStart: number | null = null;
  let last = performance.now();
  let lastPaint = last;
  let report = '';

  const addButton = (label: string, onClick: () => void) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.style.cssText = 'min-height:48px;padding:0 12px;font:600 14px system-ui';
    b.addEventListener('click', onClick);
    bar.appendChild(b);
  };
  addButton('Run 60s', () => {
    // Hold one quality tier for the whole measurement so the result is not a blend of tiers.
    engine.setAdaptiveQuality(false);
    run.reset();
    runStart = performance.now();
    report = '';
  });
  addButton('Leak check x10', () => {
    report = 'leak check running…';
    actions.leakCheck().then(
      (text) => {
        report = text;
      },
      (error: unknown) => {
        report = `leak check failed: ${String(error)}`;
        console.error(error);
      },
    );
  });
  addButton('Next tier (reload)', actions.cycleTier);
  addButton('Switch scene', actions.toggleScene);

  const frame = (now: number) => {
    const ms = now - last;
    last = now;
    live.add(ms);
    if (runStart !== null) {
      run.add(ms);
      if (now - runStart >= RUN_SECONDS * 1000) {
        runStart = null;
        engine.setAdaptiveQuality(true);
        report = `RUN DONE ${JSON.stringify(summaryWithInfo(engine, run))}`;
        console.info(report);
      }
    }
    if (now - lastPaint > 500) {
      lastPaint = now;
      const s = live.summary();
      const { render, memory } = engine.renderer.info;
      const progress =
        runStart === null
          ? ''
          : `\nrecording ${Math.round((now - runStart) / 1000)}/${RUN_SECONDS}s`;
      hud.textContent =
        `fps ${s.avgFps.toFixed(0)}  frame ${s.avgMs.toFixed(1)}ms  p95 ${s.p95Ms.toFixed(1)}ms\n` +
        `calls ${render.calls}  tris ${render.triangles}\n` +
        `geometries ${memory.geometries}  textures ${memory.textures}\n` +
        `tier ${engine.getQuality().id}  dpr ${engine.renderer.getPixelRatio()}${progress}`;
      hud.appendChild(message);
      message.textContent = report;
      live.reset();
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function summaryWithInfo(engine: Engine, stats: FrameStats) {
  const s = stats.summary();
  return {
    avgFps: Number(s.avgFps.toFixed(1)),
    p95Ms: Number(s.p95Ms.toFixed(1)),
    maxMs: Number(s.maxMs.toFixed(1)),
    slowShare: Number(s.slowShare.toFixed(3)),
    frames: s.frames,
    calls: engine.renderer.info.render.calls,
    tier: engine.getQuality().id,
    adaptiveQuality: 'held during run',
    pixelRatio: engine.renderer.getPixelRatio(),
    userAgent: navigator.userAgent,
  };
}
