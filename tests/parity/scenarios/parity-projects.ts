// Shared parity environment: browser projects, seed, clock. Used by the live capture script
// (tools/recovery/capture-live-baselines.mjs) and by local parity specs (phase 02+).
// Self-contained on purpose: node imports this .ts directly (type stripping), so no value imports.

export type ParityProjectName = 'desktop-chromium' | 'mobile-pixel';

export interface ParityProject {
  name: ParityProjectName;
  /** Expected value of the game's `lowPower` matchMedia switch. */
  lowPower: boolean;
  viewport: { width: number; height: number };
  deviceScaleFactor: 1;
  isMobile: boolean;
  hasTouch: boolean;
}

export const PARITY_PROJECTS: readonly ParityProject[] = [
  {
    name: 'desktop-chromium',
    lowPower: false,
    viewport: { width: 1280, height: 720 },
    deviceScaleFactor: 1,
    isMobile: false,
    hasTouch: false,
  },
  {
    // Pixel 7 geometry at dpr 1 so canvas pixels are not resampled.
    name: 'mobile-pixel',
    lowPower: true,
    viewport: { width: 412, height: 839 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  },
];

/** SwiftShader WebGL: deterministic software rendering on one machine + Chromium build. */
export const PARITY_LAUNCH_ARGS = [
  '--use-gl=angle',
  '--use-angle=swiftshader',
  '--enable-unsafe-swiftshader',
  '--ignore-gpu-blocklist',
];

export const PARITY_LIVE_ORIGIN = 'https://math.aigame3d.com';
/** mulberry32 seed for Math.random (see tools/recovery/capture-parity-hooks.js). */
export const PARITY_SEED = 20261018;
/** Fake wall clock start (2026-10-18T12:00:00Z); time stays paused, advanced frame by frame. */
export const PARITY_CLOCK_START = Date.UTC(2026, 9, 18, 12, 0, 0);
/** Playwright's fake requestAnimationFrame fires every 16 ms of fake time. */
export const PARITY_FRAME_MS = 16;
