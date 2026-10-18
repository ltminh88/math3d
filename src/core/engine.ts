import { PerspectiveCamera, type WebGLRenderer } from 'three';
import { getLanguage, onLanguageChange } from '../i18n/i18n';
import { initAnnouncer } from '../ui/kit/aria-announcer';
import { createFadeTransition } from '../ui/kit/fade-transition';
import { createLayer } from '../ui/kit/overlay-root';
import { tk } from '../ui/kit/ui-kit-strings';
import { AudioEngine } from './audio/audio-engine';
import { bindAudioGestureUnlock } from './audio/audio-gesture-unlock';
import { createBrowserNarrator } from './audio/speech-narrator';
import { attachContextLossHandler } from './context-loss-handler';
import type { Engine, EngineOptions } from './engine-types';
import { GameLoop } from './game-loop';
import { InteractionController } from './input/interaction-controller';
import { PointerInput } from './input/pointer-input';
import { AdaptiveQuality } from './quality/adaptive-quality';
import { loadTierIndex, saveTierIndex, tierAt } from './quality/quality-tiers';
import { applyPixelRatio, createRenderer, resizeRenderer } from './renderer-factory';
import { SceneManager } from './scene-manager';
import { TweenManager } from './tween-manager';
import { isWebGLAvailable, showWebGLFallback } from './webgl-support-check';

export type { Engine, EngineOptions } from './engine-types';

type ResizeListener = (width: number, height: number) => void;

/** Wires renderer, loop, scenes, input, audio and quality together. Null when WebGL is missing. */
export function createEngine(options: EngineOptions): Engine | null {
  const { host, uiRoot } = options;
  if (!isWebGLAvailable()) {
    showWebGLFallback(uiRoot);
    return null;
  }

  let tier = tierAt(loadTierIndex());
  let renderer: WebGLRenderer;
  try {
    renderer = createRenderer(host, tier);
  } catch (error) {
    console.error('[engine] renderer creation failed', error);
    showWebGLFallback(uiRoot);
    return null;
  }

  const camera = new PerspectiveCamera(
    40,
    host.clientWidth / Math.max(1, host.clientHeight),
    0.1,
    300,
  );
  const canvas = renderer.domElement;
  // Focusable so keyboard users can always Tab back into the scene and use the arrow keys.
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label', tk('playArea'));
  initAnnouncer(document);
  const input = new PointerInput(canvas);
  const interaction = new InteractionController(input, camera, document);
  const audio = new AudioEngine(options.audioStore);
  const narrator = createBrowserNarrator({
    getLanguage,
    isMuted: () => audio.isMuted(),
    isReadAloudEnabled: options.isReadAloudEnabled ?? (() => true),
  });
  const stopAudioUnlock = bindAudioGestureUnlock({
    target: document,
    audio,
    doc: document,
    onFirstActivation: () => narrator.unlock(),
  });
  const stopLanguageWatch = onLanguageChange(() => narrator.languageChanged());
  const tweens = new TweenManager();
  const fade = createFadeTransition(uiRoot);
  const resizeListeners = new Set<ResizeListener>();

  const scenes: SceneManager = new SceneManager({
    transition: fade,
    onBeforeInit: () => {
      input.reset();
      interaction.reset();
      tweens.clear();
    },
    createContext: ({ scene, disposer, params }) => {
      const ui = createLayer(uiRoot, 'scene');
      disposer.onDispose(() => ui.remove());
      return {
        renderer,
        camera,
        scene,
        input,
        interaction,
        audio,
        narrator,
        tweens,
        ui,
        disposer,
        requestRender: () => loop.requestRender(),
        getQuality: () => tier,
        onResize: (listener) => {
          resizeListeners.add(listener);
          disposer.onDispose(() => resizeListeners.delete(listener));
        },
        params,
        store: options.store,
      };
    },
  });

  let adaptive = true;
  const quality = new AdaptiveQuality({
    initialTier: loadTierIndex(),
    onTierChange: (index) => {
      saveTierIndex(index);
      tier = tierAt(index);
      applyPixelRatio(renderer, tier);
      handleResize();
    },
  });

  const loop = new GameLoop(
    renderer,
    {
      update: (dt) => {
        const tweening = tweens.hasActive();
        tweens.update(dt);
        return scenes.update(dt) || tweening;
      },
      render: () => {
        const active = scenes.currentThreeScene();
        if (active) renderer.render(active, camera);
      },
      onRenderedFrame: (ms) => {
        if (adaptive) quality.sample(ms);
      },
    },
    document,
  );

  function handleResize(): void {
    const { width, height } = resizeRenderer(renderer, host);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    for (const listener of [...resizeListeners]) listener(width, height);
    loop.requestRender();
  }

  const observer = new ResizeObserver(handleResize);
  observer.observe(host);
  const stopInteractionRender = interaction.events.on(() => loop.requestRender());

  const detachContextLoss = attachContextLossHandler(canvas, {
    onLost: () => loop.stop(),
    onRestored: () => {
      scenes
        .reinit()
        .catch((error) =>
          console.error('[engine] scene re-init after context restore failed', error),
        )
        .finally(() => loop.start());
    },
  });

  return {
    renderer,
    camera,
    scenes,
    loop,
    tweens,
    audio,
    narrator,
    input,
    interaction,
    getQuality: () => tier,
    setAdaptiveQuality: (enabled) => {
      adaptive = enabled;
    },
    dispose: () => {
      loop.dispose();
      scenes.dispose();
      stopAudioUnlock();
      audio.dispose();
      observer.disconnect();
      stopInteractionRender();
      stopLanguageWatch();
      detachContextLoss();
      narrator.dispose();
      interaction.dispose();
      input.dispose();
      fade.destroy();
      tweens.clear();
      renderer.dispose();
      canvas.remove();
    },
  };
}
