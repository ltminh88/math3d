import '../styles/fonts.css';
import '../styles/base-reset.css';
import '../i18n/common-strings';
import { createEngine } from '../core/engine';
import { loadTierIndex, QUALITY_TIERS, saveTierIndex } from '../core/quality/quality-tiers';
import { initLanguage } from '../i18n/i18n';
import { getOverlayRoot } from '../ui/kit/overlay-root';
import { createBenchAltScene } from './perf-bench-alt-scene';
import { createBenchHud } from './perf-bench-hud';
import { createBenchScene } from './perf-bench-scene';

// Dev-only entry (bench.html). Not part of the production build input.

async function boot(): Promise<void> {
  initLanguage(document, window.localStorage, navigator.language);
  const host = document.getElementById('app');
  if (!host) throw new Error('Missing #app');
  const uiRoot = getOverlayRoot();
  const engine = createEngine({ host, uiRoot });
  if (!engine) return; // fallback message already shown

  engine.scenes.register('bench', createBenchScene);
  engine.scenes.register('alt', createBenchAltScene);
  engine.loop.setContinuous(true);
  engine.loop.start();
  await engine.scenes.goto('bench');

  const nextFrames = () =>
    new Promise<void>((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
    );
  const memory = () => {
    const { geometries, textures } = engine.renderer.info.memory;
    return { geometries, textures };
  };

  const leakCheck = async (): Promise<string> => {
    // One warm-up round trip fills the shared cache; that state is the baseline.
    await engine.scenes.goto('alt');
    await nextFrames();
    await engine.scenes.goto('bench');
    await nextFrames();
    const baseline = memory();
    for (let i = 0; i < 10; i++) {
      await engine.scenes.goto('alt');
      await nextFrames();
      await engine.scenes.goto('bench');
      await nextFrames();
    }
    const after = memory();
    const ok = after.geometries === baseline.geometries && after.textures === baseline.textures;
    const text = `LEAK CHECK ${ok ? 'OK' : 'FAIL'} baseline=${JSON.stringify(baseline)} after=${JSON.stringify(after)}`;
    if (ok) console.info(text);
    else console.error(text);
    return text;
  };

  createBenchHud(engine, uiRoot, {
    leakCheck,
    cycleTier: () => {
      saveTierIndex((loadTierIndex() + 1) % QUALITY_TIERS.length);
      window.location.reload();
    },
    toggleScene: () => {
      const next = engine.scenes.current()?.id === 'bench' ? 'alt' : 'bench';
      engine.scenes.goto(next).catch((error) => console.error('[bench] goto failed', error));
    },
  });
}

boot().catch((error) => console.error('[bench] boot failed', error));
