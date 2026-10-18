# Phase 02: Engine core, input, audio, UI kit, perf spike gate

## Context links
- [plan.md](./plan.md) · [research 01 §1-§4](research/researcher-01-threejs-game-architecture-report.md)
- Depends on: [phase 01](./phase-01-scaffold-tooling-pwa-i18n.md)

## Overview
- Date: 2026-10-18
- Description: Renderer, loop, scene manager + disposer, shared asset cache, camera fit, tween, unified pointer/drag/tap-select input, WebAudio synth, Web Speech read-aloud (vi-VN), adaptive quality, DOM UI kit. Ends with a **perf spike on the real target devices (iPad 9th gen Safari + Windows Core i5 Chrome/Edge, Intel iGPU)** that gates phase 04.
- Priority: P1
- Implementation status: code done (abfbdba), device perf gate pending
- Review status: not reviewed

## Key Insights
- One scene alive at a time; `goto(id)` = fade out -> `current.dispose()` -> disposer flush -> `next.init()` -> fade in. Shared materials/geometries live in a never-disposed cache; disposer only frees per-scene one-offs.
- Drop zones hit-test by distance/box, not mesh raycast: cheaper and kinder to fat fingers. Snap radius >= 0.8 world units; invisible hit proxies sized >= 48 CSS px on screen.
- Every drag needs a tap-select alternative (tap item -> tap target) and keyboard path (Tab cycles selectables via the controller, Enter picks/drops).
- Budget: <=100 draw calls hub, <=60 per level; Lambert flat shading; instancing for scenery; blob shadows; no post-processing; pixelRatio <= 2 (iPad Retina) adaptive down to 1.
- iOS Safari: AudioContext must be resumed inside the first user gesture.
- Read-aloud: `speechSynthesis` voice list loads async (`voiceschanged`); some browsers lack a vi-VN voice (iPadOS ships 'Linh'; Edge on Windows has vi-VN voices, Chrome on Windows may not) -> read-aloud button hidden when none found (never fall back to an English voice reading Vietnamese). Same first-gesture rule on iOS.

## Requirements
- Functional: scene contract + manager; input emits `pick`, `drag-move`, `drop`, `tap-select` events uniformly for mouse/touch/pen/keyboard; audio presets (correct, gentle-wrong, pick, drop, build-step, star, ui-tap) + short looping background tune with mute/volume; UI kit components accessible (`<button>`, aria-live announcer).
- Functional: read-aloud narrator `speak(text, lang)` used by level kit (04) for question + hint text; picks vi-VN voice (en-* when UI is en); cancels previous utterance; respects master mute and the `readAloud` setting (03 settings store); exposes `isAvailable()` so UI hides the speaker button.
- Functional: WebGL unsupported -> friendly vi/en message (no crash). `webglcontextlost` -> pause; `restored` -> re-init current scene.
- Non-functional: no file >200 lines; render-on-demand in idle level states; `renderer.info.memory` returns to baseline after 10 scene round trips.

## Architecture
```
src/core/
  renderer-factory.ts      WebGLRenderer(antialias:true, powerPreference high), pixelRatio cap
  webgl-support-check.ts   detect + fallback panel
  context-loss-handler.ts
  game-loop.ts             setAnimationLoop, dt clamp 0.05, visibility pause, dirty-flag render-on-demand
  game-scene-contract.ts   interface GameScene { id; init(ctx); update(dt); dispose() }; SceneContext {renderer, camera, input, audio, ui, store?}
  scene-manager.ts         register(id, factory), goto(id, params), current()
  scene-disposer.ts        track(obj|listener AbortController), flush()
  shared-asset-cache.ts    getGeometry(key, build), getMaterial(paletteKey)
  low-poly-palette.ts      named colors
  camera-fit.ts            fit playfield bounds to aspect (landscape + portrait)
  tween-manager.ts         ease fns + tween list updated by loop
  blob-shadow.ts           instanced dark discs
  input/pointer-input.ts   pointer events -> NDC, primary pointer only, touch-action none
  input/raycast-picker.ts  raycast against registered pickables only
  input/drag-controller.ts drag plane projection, snap to nearest drop zone
  input/drop-zone.ts       zone = {center, radius|box, accepts(item)}
  input/tap-select-controller.ts   tap item then tap zone; keyboard focus cycling
  audio/audio-engine.ts    context unlock, master gain, mute persisted via settings
  audio/sfx-presets.ts     oscillator/envelope recipes
  audio/music-loop.ts      pentatonic loop scheduler
  audio/speech-voice-picker.ts   pure: choose best voice for lang from SpeechSynthesisVoice-like list
  audio/speech-narrator.ts       speak/cancel/isAvailable, mute + setting aware, voiceschanged handling
  quality/quality-tiers.ts tier table (pixelRatio, blob shadows, decor)
  quality/adaptive-quality.ts  2s windows after 3s warmup, step down if >36ms, never up twice, persist
src/ui/kit/  overlay-root.ts ui-button.ts speech-bubble.ts number-pad.ts choice-buttons.ts toast.ts fade-transition.ts aria-announcer.ts ui-kit-strings.ts
src/ui/kit/styles/  design-tokens.css ui-kit.css   (56px min tap target, 8px spacing, high contrast)
src/dev/ perf-bench-main.ts perf-bench-scene.ts      (dev-only entry via bench.html; not in build input)
bench.html
```
Data flow: DOM pointer -> pointer-input (NDC) -> raycast-picker -> drag/tap-select controller -> typed events to active scene; scene mutates objects -> marks loop dirty -> render.

## Related code files
Create: every file in the tree above, plus tests `src/core/camera-fit.test.ts`, `src/core/tween-manager.test.ts`, `src/core/quality/adaptive-quality.test.ts`, `src/core/input/drop-zone.test.ts`, `src/core/input/tap-select-controller.test.ts`, `src/core/audio/speech-voice-picker.test.ts` (pure parts: state machine, snap math, voice choice).
Modify: none (does not touch `src/main.ts`; bench has its own entry).
Delete: none.

## Implementation Steps
1. Contract + renderer + loop + manager + disposer; verify with a two-scene toggle in the bench.
2. Asset cache + palette + blob shadows + camera fit (bounds-fit math unit-tested for 16:9, 4:3, 9:19.5 portrait).
3. Input: pointer-input, picker, drop zones, drag controller (pointer capture, cancel on `pointercancel`, ignore second finger), tap-select controller with keyboard cycling.
4. Audio engine + presets + music loop; unlock on first `pointerdown`/`keydown`.
4b. Speech voice picker (tested: prefers exact `vi-VN`, then `vi`, else none) + narrator; speaker button in speech bubble only when available.
5. Adaptive quality (pure decision function tested with synthetic frame times; wiring reads `performance.now()`).
6. UI kit: overlay root (pointer-events none root, auto children), speech bubble with portrait slot, number pad (0-9, erase, OK; keyboard digits + Enter + Backspace), choice buttons (2-4), toast, fade, aria announcer. Strings via `defineStrings('uiKit', ...)`.
7. Perf bench scene: low-poly ground + 40 instanced trees + 30 draggable stones + 6 drop zones + speech bubble + number pad; on-screen HUD shows fps, draw calls, tris, tier.
8. **Perf spike gate**: run `npm run dev -- --host` on LAN, open `bench.html` on the iPad 9th gen (Safari; profile via Mac Safari Web Inspector) and the Windows Core i5 machine (Chrome + Edge DevTools Performance). Record results in `plans/261018-1803-vlm-math-game-mvp/reports/perf-spike-report.md`.
9. Leak check in bench: toggle scenes 10x, assert `renderer.info.memory` counts at baseline (log + dev assertion).

## Todo list
- [ ] scene contract, renderer, loop, manager, disposer
- [ ] asset cache, palette, blob shadow, camera fit (+tests)
- [ ] pointer input, picker, drop zone, drag, tap-select (+tests)
- [ ] audio engine, sfx presets, music loop
- [ ] speech voice picker (+tests) + narrator
- [ ] adaptive quality (+tests)
- [ ] UI kit components + styles + strings
- [ ] perf bench + real-device spike report
- [ ] leak check 10 round trips

## Success Criteria
- Perf gate on iPad 9th gen + Windows Core i5 (Intel iGPU, 1080p fullscreen): avg >= 55 fps (p95 frame <= 25 ms) over 60 s bench with dragging; draw calls <= 60; first drag responds without visible lag. Fail -> apply next tier defaults and re-run; still failing -> stop and escalate before 04.
- Drag and tap-select both complete a stone placement with mouse, touch and keyboard.
- `renderer.info.memory.geometries/textures` equal baseline after 10 round trips.
- Audio plays after first tap on iPadOS Safari/Windows Chrome+Edge; mute persists across reload.
- Read-aloud speaks a Vietnamese test sentence on a device with a vi-VN voice; button hidden on a device/browser without one; silent when muted.
- Unit tests green; lint/typecheck green.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| iPad/Intel iGPU < 55 fps | L | M | tiers: pixelRatio 1, antialias off, merged static geometry; fixed-camera dioramas keep tri counts small |
| Drag fiddly on small phones | M | H | big hit proxies, snap radius, tap-select default-visible hint; test on device in this phase |
| Context loss when Safari tab/PWA is backgrounded | M | M | handler re-inits current scene; texture-less design makes it cheap |
| AudioContext blocked | H | L | unlock on first gesture; game fully playable muted |
| No vi-VN voice (e.g. Chrome on Windows) | H | L | hide button; text always shown; recorded voice packs post-MVP if playtest needs |
| iPadOS Safari audio/speech blocked until user gesture; Safari WebGL quirks | H | M | unlock AudioContext + speechSynthesis on first tap (start screen button); test on real iPad each perf gate |
Rollback: revert phase commits; nothing outside `src/core`, `src/ui/kit`, `src/dev`, `bench.html`.

## Security Considerations
- No network. Bench entry excluded from production build input (verify `dist/` has no `bench.html`).

## Next steps
- With 03 done -> phase 04. Perf spike report feeds hub/level budgets.
