// Parity scenarios: drive the real UI under a paused fake clock and capture named shots.
// The same list runs against the live site (baselines) and the local build (phase 02+ specs);
// only the ParityDriver implementation differs. Frame counts are part of the contract:
// changing any number here invalidates every committed baseline.

export interface CaptureOptions {
  /** Also dump the scene graph (only possible where window.__parity exposes the world). */
  scene?: boolean;
}

export interface ParityDriver {
  /** Advance the paused fake clock by n animation frames (16 ms each). */
  frames(n: number): Promise<void>;
  /** Dispatch a DOM click on the first element matching selector, then advance 1 frame. */
  click(selector: string): Promise<void>;
  /** Key press (down+up), then advance 1 frame. */
  press(key: string): Promise<void>;
  /** Hold keys for exactly n frames. */
  hold(keys: string[], frames: number): Promise<void>;
  /** Hold keys frame by frame until the in-page JS predicate is true; returns frames used. */
  holdUntil(keys: string[], predicate: string, maxFrames: number): Promise<number>;
  /** Advance frame by frame until the in-page JS predicate is true; returns frames used. */
  waitFrames(predicate: string, maxFrames: number): Promise<number>;
  /** Tap the 3D canvas where the label element is anchored, offsetY px lower (default 0). */
  tapLabelAnchor(labelSelector: string, offsetY?: number): Promise<void>;
  /** Click the correct (or first wrong) quiz answer. */
  answer(correct: boolean): Promise<void>;
  capture(name: string, options?: CaptureOptions): Promise<void>;
}

export interface ParityScenario {
  id: string;
  /** localStorage seeded before any page script runs. */
  storage?: Record<string, string>;
  run(d: ParityDriver): Promise<void>;
}

const save = (patch: Record<string, unknown>) =>
  JSON.stringify({
    version: 1,
    xp: 0,
    coins: 0,
    bridge: 0,
    questAccepted: false,
    questComplete: false,
    avatar: 'boy',
    table: 0,
    sound: true,
    music: false,
    combo: 0,
    questionStats: {},
    review: [],
    started: true,
    ...patch,
  });

const SAVE_KEY = 'aigame3d_multiplication_save';
const DIALOG_OPEN = "document.getElementById('dialog').open";
const NEAR_MILO = "!document.getElementById('interact').hidden";
const EAST_BANK = "document.getElementById('area-name').textContent !== 'Làng Khởi Đầu'";

const bridgeScenario = (n: number): ParityScenario => ({
  id: `bridge-${n}`,
  storage: { [SAVE_KEY]: save({ bridge: n, questAccepted: true, xp: n * 10, coins: n * 5 }) },
  async run(d) {
    await d.frames(30);
    await d.click('#play');
    await d.frames(90);
    await d.capture('play', { scene: true });
  },
});

export const PARITY_SCENARIOS: readonly ParityScenario[] = [
  {
    id: 'welcome',
    async run(d) {
      await d.frames(1);
      await d.capture('t0', { scene: true });
      await d.frames(124);
      await d.capture('t2s');
      await d.frames(250);
      await d.capture('t6s');
      await d.frames(375);
      await d.capture('t12s');
    },
  },
  {
    id: 'avatar',
    async run(d) {
      await d.frames(30);
      await d.capture('boy');
      await d.click('#girl');
      await d.capture('girl');
      await d.click('#play');
      await d.frames(60);
      await d.capture('girl-play');
    },
  },
  {
    id: 'menus',
    async run(d) {
      await d.frames(30);
      await d.click('#learn-welcome');
      await d.capture('book-welcome');
      await d.click('#close-dialog');
      await d.click('#play');
      await d.capture('first-frame');
      await d.frames(90);
      await d.capture('play-settled', { scene: true });
      await d.press('m');
      await d.frames(2);
      await d.capture('map-open');
      await d.click('[data-region="forest"]');
      await d.capture('map-region-forest');
      await d.press('Escape');
      await d.click('#learn');
      await d.capture('book');
      await d.click('[data-table="7"]');
      await d.capture('book-table-7');
      await d.click('#close-dialog');
      await d.click('#help');
      await d.capture('help');
      await d.click('#close-dialog');
      await d.click('#settings');
      await d.capture('settings');
      await d.click('#reset-progress');
      await d.capture('reset-confirm');
      await d.click('#cancel-reset');
      await d.click('#close-dialog');
      await d.capture('back-to-play');
    },
  },
  {
    // accept quest -> 6 correct + 2 wrong -> cross bridge; storage writes recorded throughout.
    id: 'playthrough',
    async run(d) {
      await d.frames(30);
      await d.click('#play');
      await d.frames(30);
      await d.holdUntil(['w', 'd'], NEAR_MILO, 400);
      await d.frames(2);
      await d.capture('near-milo');
      await d.press('e');
      await d.capture('milo-dialog');
      await d.click('#accept-quest');
      await d.capture('quiz-q1');
      for (const level of [1, 2, 3]) {
        await d.click('#hint');
        await d.capture(`quiz-hint-${level}`);
      }
      await d.answer(false);
      await d.capture('quiz-wrong');
      await d.answer(true);
      await d.capture('quiz-correct');
      await d.click('#next-question');
      await d.answer(false);
      await d.answer(true);
      for (let q = 3; q <= 6; q++) {
        await d.click('#next-question');
        await d.answer(true);
        if (q === 3 || q === 6) await d.capture(`quiz-correct-${q}`);
      }
      await d.click('#next-question');
      await d.frames(60);
      await d.capture('bridge-built', { scene: true });
      // Zoom out so the bridge label is on screen in portrait too (camera distance 42 -> 74).
      for (let i = 0; i < 4; i++) await d.click('#zoom-out');
      await d.frames(60);
      // Step south first so the straight tap-to-move path clears Milo's collision circle.
      await d.hold(['s'], 15);
      await d.frames(2);
      await d.tapLabelAnchor('#bridge-label');
      await d.waitFrames(EAST_BANK, 600);
      await d.holdUntil(['d'], DIALOG_OPEN, 400);
      await d.capture('quest-complete');
      await d.click('#keep-playing');
      await d.frames(30);
      await d.capture('after-quest');
    },
  },
  {
    // Movement (phase 06 step 5, landed in 09), compared at fixed clock steps.
    // Keyboard walk: hold D for 2 s from the spawn (-6, 6); at the default camera
    // yaw D runs south-east straight to the river bank by the unbuilt bridge.
    id: 'walk-to-bridge',
    async run(d) {
      await d.frames(30);
      await d.click('#play');
      // 40 frames (640 ms): the area badge 'arrive' keyframe (600 ms) has finished. At 30 frames
      // the shot landed on its last overshoot frames, whose start frame races by one (math3d).
      await d.frames(40);
      await d.capture('start', { scene: true });
      await d.hold(['d'], 63);
      await d.capture('walk-1s', { scene: true });
      await d.hold(['d'], 62);
      await d.capture('walk-2s', { scene: true });
      await d.frames(30);
      await d.capture('settled');
    },
  },
  {
    // Tap-to-move: tap the ground 60 px below Milo's label anchor (the label covers the anchor
    // itself); the player walks there (destination cleared on arrival or when blocked).
    id: 'tap-to-milo',
    async run(d) {
      await d.frames(30);
      await d.click('#play');
      await d.frames(40); // past the 600 ms area-badge keyframe, see walk-to-bridge
      await d.tapLabelAnchor('#milo-label', 60);
      await d.capture('tap', { scene: true });
      await d.frames(30);
      await d.capture('walk-0_5s', { scene: true });
      await d.frames(30);
      await d.capture('walk-1s', { scene: true });
      await d.frames(60);
      await d.capture('arrived', { scene: true });
    },
  },
  bridgeScenario(0),
  bridgeScenario(3),
  bridgeScenario(6),
  {
    id: 'language-en',
    storage: { aigame3d_language: 'en' },
    async run(d) {
      await d.frames(30);
      await d.capture('welcome');
      await d.click('#play');
      await d.frames(60);
      await d.capture('play');
      await d.click('#learn');
      await d.capture('book');
      await d.click('#close-dialog');
      await d.click('#settings');
      await d.capture('settings');
    },
  },
];
