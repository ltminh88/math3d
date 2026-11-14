// ParityDriver implementation (see tests/parity/scenarios/parity-scenarios.ts) that writes
// per-shot artifacts: <scenario>--<shot>.canvas.png | .dom.png | .json | .scene.json
// Time only moves through window.__parityStep (tools/recovery/capture-parity-virtual-clock.js).
// Avoids Playwright actionability checks: they wait on rendering/stability, which never settles
// against a virtual clock (and must not advance the page anyway).
import { createHash } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { waitForUsedFontFaces } from './capture-fonts-snapshot.mjs';
import {
  dumpSceneGraph,
  labelAnchorPoint,
  quizAnswerIndex,
  snapshotDomState,
} from './capture-page-probes.mjs';

// Canvas hidden (not masked: a mask paints over overlays too); page background shows through.
// transition:none ends any running CSS transition (spec: changing transition-property cancels
// it), so world labels stop holding compositor layers whose raster offset depends on real-time
// history. Deterministic: every origin runs the same protocol at the same virtual frame.
// backdrop-filter:none is the same class of fix for the blur: the dialog/top-bar glass blurs
// the backdrop on the GPU (SwiftShader on Linux), and the blur raster varies by ±1 level
// run to run over the whole blurred area (menus--book-welcome 15.7% in CI run 43435349261,
// reproduced locally: menus--book 16.7% between two identical captures) while the shot JSON
// stays byte-exact. dialog::backdrop carries its own blur(4px) and is not matched by `*`,
// so it is listed explicitly — it alone covered 43–59% of the pixels outside the dialog.
// animation:none is the same fix for composited-layer animations (dialog pop, map-in,
// float-up): the virtual clock pins their CSS time, but the compositor still rasters the
// layer with a real-time-dependent offset, so DOM shots render them at their settled state.
// box-shadow:none / text-shadow:none are the same fix for GPU blurs: the dialog's
// `box-shadow: 0 30px 100px` falloff raster varies by ±1 on SwiftShader (help shot: 63.7%
// of the shadow zone, decaying 88% at the dialog edge to 18% 100px out, while the dialog
// interior is 0%), and the one 8px-blur caption text-shadow is the same class. The *values*
// stay gated exactly: the style tag is removed before snapshotDomState, so cssHash keeps
// covering the animation/backdrop-filter/box-shadow/text-shadow shorthands (keyframe bodies
// are not rendered in DOM shots — that is the trade-off for determinism here).
const DOM_ONLY_CSS =
  '#world{visibility:hidden!important}*,*::before,*::after,dialog::backdrop{transition:none!important;animation:none!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important;box-shadow:none!important;text-shadow:none!important}';

const sha256 = (text) => createHash('sha256').update(text).digest('hex');

export function createParityDriver({ page, scenarioId, outDir, written }) {
  const flush = (settleMs = 0) => page.evaluate((ms) => window.__parityFlush(ms), settleMs);
  const frames = (n) => page.evaluate((count) => window.__parityStep(count), n);
  const settleThenFrame = async () => {
    await flush();
    await frames(1);
  };
  const write = (name, data) => {
    writeFileSync(join(outDir, name), data);
    written.push(name);
  };

  // DOM overlay shot: canvas hidden by a temporary stylesheet (no transition touches #world).
  async function screenshotDom(file) {
    const style = await page.addStyleTag({ content: DOM_ONLY_CSS });
    // Let the compositor commit the de-layered state before the shot.
    await flush(250);
    write(file, await page.screenshot({ caret: 'initial' }));
    await style.evaluate((el) => el.remove());
  }

  const driver = {
    frames,
    async click(selector) {
      const count = await page.locator(selector).count();
      if (!count) throw new Error(`[${scenarioId}] click: ${selector} not found`);
      await page.locator(selector).first().dispatchEvent('click');
      await settleThenFrame();
    },
    async press(key) {
      await page.keyboard.press(key);
      await settleThenFrame();
    },
    async waitFrames(predicate, maxFrames) {
      for (let i = 1; i <= maxFrames; i++) {
        await frames(1);
        if (await page.evaluate(predicate)) return i;
      }
      throw new Error(`[${scenarioId}] predicate not met in ${maxFrames} frames: ${predicate}`);
    },
    async hold(keys, n) {
      for (const k of keys) await page.keyboard.down(k);
      await flush();
      await frames(n);
      for (const k of keys) await page.keyboard.up(k);
    },
    async holdUntil(keys, predicate, maxFrames) {
      for (const k of keys) await page.keyboard.down(k);
      await flush();
      try {
        return await driver.waitFrames(predicate, maxFrames);
      } finally {
        for (const k of keys) await page.keyboard.up(k);
      }
    },
    async tapLabelAnchor(selector, offsetY = 0) {
      const p = await page.evaluate(labelAnchorPoint, [selector, offsetY]);
      if (p?.hit !== 'world') {
        throw new Error(
          `[${scenarioId}] anchor of ${selector} not on canvas: ${JSON.stringify(p)}`,
        );
      }
      await page.mouse.click(p.x, p.y);
      await settleThenFrame();
    },
    async answer(correct) {
      const index = await page.evaluate(quizAnswerIndex, correct);
      if (index < 0) throw new Error(`[${scenarioId}] no ${correct ? 'correct' : 'wrong'} answer`);
      await page.locator('.answer').nth(index).dispatchEvent('click');
      await settleThenFrame();
    },
    async capture(shot, options = {}) {
      const base = `${scenarioId}--${shot}`;
      // One frame: count its WebGL draws and read its pixels in the same task as the render.
      const { gl, png } = await page.evaluate(() => {
        window.__parityGl.reset();
        const dataUrl = window.__parityStep(1, true);
        return {
          gl: { calls: window.__parityGl.calls, triangles: window.__parityGl.triangles },
          png: dataUrl,
        };
      });
      write(`${base}.canvas.png`, Buffer.from(png.slice(png.indexOf(',') + 1), 'base64'));
      // Every face the shown text uses is loaded (no fallback glyphs) before the DOM shot.
      await page.evaluate(waitForUsedFontFaces);
      await screenshotDom(`${base}.dom.png`);
      // screenshotDom removes the suppression tag, which restarts the animations it had
      // turned off — and the virtual clock's animationstart listener re-pins them only
      // when the event is dispatched, which can race the snapshot below. The snapshot
      // then reads a real-time phase (a few ms into a restarted animation) instead of
      // the pinned virtual time, so cssHash varied run to run on shots taken while an
      // animation was freshly started (menus--first-frame, language-en--welcome). Re-pin
      // synchronously here: every animation is paused at a deterministic virtual
      // currentTime before any computed style is read.
      await page.evaluate(() => window.__paritySyncAnimations());
      const dom = await page.evaluate(snapshotDomState);
      const { computedStyles, ...rest } = dom;
      // PARITY_DEBUG_CSS=1 keeps the full computed-style text to diff a cssHash mismatch.
      if (process.env.PARITY_DEBUG_CSS) write(`${base}.styles.txt`, computedStyles);
      const record = { scenario: scenarioId, shot, gl, cssHash: sha256(computedStyles), ...rest };
      write(`${base}.json`, `${JSON.stringify(record, null, 1)}\n`);
      if (options.scene) {
        const scene = await page.evaluate(dumpSceneGraph);
        if (scene) write(`${base}.scene.json`, `${JSON.stringify(scene)}\n`);
      }
    },
  };
  return driver;
}
