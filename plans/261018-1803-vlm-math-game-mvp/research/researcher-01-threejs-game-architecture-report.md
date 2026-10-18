# Research 01: Three.js + TS + Vite game architecture (kids 7-9, vi, x / ÷)

Date 2026-10-18. Method: 3 tool calls used (help skill, 2 web searches) + established knowledge. Web lookups were thin: see "Limits". Claims marked [K] = from prior knowledge, not re-verified today. Adoption risk is low for the whole stack (all mainstream, 5+ yrs).

## 0. Verified facts (web)
- vite-plugin-pwa 1.2.0 exists (jsDelivr README: https://cdn.jsdelivr.net/npm/vite-plugin-pwa@1.2.0/README.md); builds on Workbox 7; Node >=16 (npm: https://npmjs.com/package/vite-plugin-pwa).
- NOT confirmed: Vite 7 peer-dep range of 1.2.0, current Three.js revision. Run `npm view vite-plugin-pwa peerDependencies version` and `npm view three version` before pinning. One secondary source (mind-verse.de) claims r186 / llms.txt docs since r183, unconfirmed.
- Pin `three` exact (no caret): Three ships breaking changes every release (no semver) [K].

## 1. Project structure
Ranked:
1. **Thin hand-rolled scene manager + Scene interface + tiny typed store** (recommended). ~150 LOC total, zero deps. Fits YAGNI/KISS: 1 hub + N levels.
2. Zustand vanilla (`zustand/vanilla`) for store: only if devtools/persist middleware wanted. ~1KB. Acceptable second choice for the store only.
3. ECS (bitecs/miniplex): overkill for fixed-camera puzzles. Reject.

```
src/
  main.ts                 boot, renderer, loop, manager
  core/ renderer.ts loop.ts scene-manager.ts disposer.ts store.ts i18n.ts audio.ts input.ts
  scenes/ hub/ levels/{stones,crops,fruit}/   each: index.ts (implements GameScene)
  logic/  question-gen.ts distractors.ts leitner.ts scoring.ts   (pure, no three import)
  ui/     overlay.ts hud.ts number-pad.ts  + css/
  locales/ vi.json en.json
```
- `interface GameScene { init(ctx): Promise<void>|void; update(dt): void; onPointer?(e): void; dispose(): void }`
- Manager: `goto(id)` = current.dispose() -> disposer.flush() -> next.init(). One scene alive at a time; fade via CSS overlay, not shader.
- **Disposal**: a `Disposer` (per-scene) with `track(obj)` that registers geometry/material/texture/RenderTarget; `flush()` calls `.dispose()` on each + `scene.clear()`. Share geometry/materials via a cached factory (e.g. `getMat('grass')`) owned by a persistent "assets" module that is never disposed -> disposal only for per-level one-offs. Verify with `renderer.info.memory` (geometries/textures counts) after 10 round trips hub<->level: must return to baseline. Remove DOM listeners in dispose via AbortController.
- **Loop**: single `renderer.setAnimationLoop(t => {dt=min(0.05,(t-last)/1000); scene.update(dt); render})`. Clamp dt. Pause on `visibilitychange`. Render-on-demand for static level states (only render when something moved/tweened): big battery win on phones, adds ~10 LOC (dirty flag).
- **State store**: plain TS module: `state` object + `subscribe(fn)` + `save()` to localStorage (versioned key `vlm-math:v1`, schema `version` field + migrate fn). Holds: profile, per-fact Leitner boxes, stars, unlocked levels, settings (lang, sound, reducedMotion). Wrap localStorage in try/catch (private mode / quota).
- Tweening: write 30-line ease helper or use `@tweenjs/tween.js` (small, mature). Prefer own helper first.

## 2. Unified input
Ranked:
1. **Pointer Events + single Raycaster, with `touch-action: none` on canvas** (recommended). One code path for mouse/touch/pen. `pointerdown/move/up/cancel`, `setPointerCapture` on drag start, track `pointerId` (ignore 2nd finger). Convert to NDC from `getBoundingClientRect`. Drag: on down raycast draggables -> project pointer onto a fixed drag plane (Plane at object height, `ray.intersectPlane`) -> move object; on up raycast drop-zones by distance/box test (NOT mesh raycast: cheaper, more forgiving). Add snap radius >= 0.8 unit + generous invisible hit-proxy meshes (kids' fat fingers; min visual target ~48px CSS). Raycast only on pointerdown + throttled pointermove (rAF-coalesced), against small arrays, not whole scene.
2. Drag libs (three DragControls): rigid, camera-plane based, no snap. Reject.
3. DOM-based drag (HTML draggable elements) for 2D levels: unnecessary; breaks 3D consistency.

**Hub movement**: recommend **tap/click-to-move (point-and-click on ground plane) + optional WASD/arrows on desktop as bonus** (1 extra listener). Reasons: identical on touch and mouse; no joystick occluding small screen; no multi-touch conflict; kids 7-9 handle it well (cf. point-and-click kids' games) [K]. Implementation: raycast ground plane -> target; avatar lerps to target, simple clamp to walkable AABBs/circles (no navmesh; village is small, use 6-8 rectangles + obstacle circles with push-out). Tap on a building = walk then enter. Show a ground ring marker at target. Virtual joystick = rank 2 (precision unnecessary, cost: UI + multi-touch). WASD only = rank 3 (excludes mobile).

## 3. Mobile perf budget (target >=30fps, ~3M VND Android = Mali-G52/Adreno 610-class, 3-4GB) [K]
- `new WebGLRenderer({antialias:false, powerPreference:'high-performance'})`; `setPixelRatio(Math.min(devicePixelRatio, 1.5))` start; adaptive range 0.75-1.5. MSAA off; low-poly flat shading hides aliasing at 1.5x. Alpha off unless needed.
- Budget: **<=100 draw calls hub, <=60 per level; <=100k tris hub, <=30k level; <=50 lights=0**: use 1 AmbientLight/HemisphereLight + 1 DirectionalLight. Materials: `MeshLambertMaterial` (cheaper than Standard) with `flatShading`, or MeshBasic + vertex colors for far/static props. No PBR, no env maps, no post-processing, no transparency sorting storms, no fog (cheap but optional).
- Repeated objects (crops, stones, fruit, trees, fence posts): `InstancedMesh` + per-instance color (`setColorAt`); caution: raycasting an InstancedMesh works (`instanceId`) but draggable items are few -> use plain Mesh for interactables, instancing for scenery.
- Static scenery: merge with `BufferGeometryUtils.mergeGeometries` (vertex colors carry palette) -> 1 draw call per material. Set `matrixAutoUpdate=false` + `updateMatrix()` for static meshes.
- **Shadows**: rank 1 = no real shadow maps; fake blob shadows (flat dark circle mesh under each object, 1 shared geometry, instanced) [recommended]. Rank 2 = single 1024 directional shadow map, static (`autoUpdate=false`, render once) in hub only, high tier only. Rank 3 = dynamic cascades: reject.
- Geometry detail: sphere 8x6 segments, cylinder 8 radial; share geometries.
- **Adaptive quality**: measure avg frame time over 2s windows after first 3s; if >36ms (<28fps) drop tier: pixelRatio 1.5->1.25->1->0.85, then disable blob shadows/hide decor layers; never upshift more than once (avoids oscillation). Persist tier in localStorage. Optional: `PerformanceMonitor`-like logic hand-written (~40 LOC); no lib.
- Handle `webglcontextlost/restored` (mobile Android kills contexts): on restore call `goto(current)` re-init. Texture-less design makes this cheap.
- Cap rAF work: render-on-demand in level scenes while idle; 60fps->30 cap option on very low tier.
- Validate on real device (Chrome remote debugging) + `renderer.info.render.calls/triangles`; Playwright can assert info counts via a debug hook.

## 4. UI layer
Ranked:
1. **HTML/CSS overlay above canvas** (recommended): `<div id="ui">` absolutely positioned, `pointer-events:none` root, `pointer-events:auto` on interactive children. Gets native text rendering (Vietnamese diacritics), a11y (real `<button>`s, focus, aria-live for feedback), IME-free number pad, i18n, zero GPU cost. Number-input: custom on-screen number pad (big buttons) rather than native keyboard (keyboard covers canvas on mobile, `inputmode="numeric"` fallback for desktop typing + Enter).
2. Mixed: in-world 3D labels via CSS2DRenderer (three/examples) for numbers on stone groups: acceptable for few labels; or project vector to screen manually and position DOM nodes (cheaper, no extra renderer). Use sparingly.
3. In-canvas UI (sprites/troika text/canvas textures): reject; text crispness, diacritics, a11y, cost.

- **Fonts**: Baloo 2 (has `vietnamese` subset, rounded/kid-friendly) primary, Nunito as body fallback (also vietnamese subset). Self-host woff2 via `@fontsource/baloo-2` / `@fontsource/nunito` importing only `vietnamese` + `latin` subsets (offline PWA needs self-hosting; no Google CDN). `font-display: swap`; preload the 1-2 weights used. Test strings: "Chia đều cho các bạn thỏ", "Nhân - Chia", "Ầ Ẫ Ợ Ữ Ỵ".
- Tap targets >=48x48 CSS px (prefer 56+ for kids), spacing >=8px (WCAG 2.2 AA 2.5.8 min is 24px; Material 48dp) [K]. Don't rely on drag only: every drag interaction needs tap-select + tap-target alternative (WCAG 2.5.7 Dragging Movements) - also helps low motor control.
- Reduced motion: honor `prefers-reduced-motion` -> disable camera sway/particles/confetti, shorten tweens; plus in-game toggle. Sound toggle + volume; never autoplay audio before first gesture (unlock AudioContext on first pointerdown).
- Colour: don't encode correctness by colour alone (add icon + sound + shake/"tick").
- **i18n vi/en**: tiny own `t(key, params)` over 2 JSON files (+ vi plural-less; no ICU needed). Default `navigator.language` startsWith('vi') ? vi : en, setting persisted. Skip i18next (YAGNI, ~40KB). Numbers displayed plain; avoid thousand separators; "x" shown as "×", division "÷"; vi reading "năm nhân ba bằng mười lăm" if speech later (out of MVP).
- Set `<html lang>` on switch.

## 5. PWA
- `vite-plugin-pwa` 1.2.0 (latest seen; verify via `npm view`), Workbox 7 (generateSW). Check Vite peer-dep first (unconfirmed for Vite 7).
- Rank 1 **generateSW + `registerType:'prompt'`** (recommended): predictable, tiny config; kids mid-level shouldn't be reloaded by autoUpdate. Rank 2 `autoUpdate` + `skipWaiting/clientsClaim` (simpler but may swap code mid-session; acceptable if update applied only on next launch). Rank 3 injectManifest: only if custom SW logic needed (not needed).
```ts
VitePWA({
  registerType: 'prompt',
  includeAssets: ['icons/*.png'],
  manifest: { name:'Làng Toán', short_name:'Làng Toán', lang:'vi', display:'fullscreen',
    orientation:'landscape', theme_color:'#...', background_color:'#...',
    icons:[{192},{512},{512 maskable}] },
  workbox: { globPatterns:['**/*.{js,css,html,woff2,png,svg,json}'],
    cleanupOutdatedCaches:true, navigateFallback:'index.html' }
})
```
- No runtime caching needed: everything precached (no model/texture files -> bundle ~ three (~150-200KB gz, tree-shaken) + fonts + app). Keep precache <1.5MB.
- Update prompt: `import { registerSW } from 'virtual:pwa-register'`; `const update = registerSW({onNeedRefresh(){showToast(()=>update(true))}, onOfflineReady(){toast('Sẵn sàng chơi offline')}})`. Show prompt at hub only (not in level). Add `vite-plugin-pwa/client` types to tsconfig.
- iOS: no beforeinstallprompt; show manual "Add to Home Screen" hint if desired. `display:'fullscreen'` Android; `standalone` fallback. Orientation lock only works in installed fullscreen: design responsive for portrait too (fixed camera must adapt FOV/aspect: compute camera distance from aspect so the playfield bounds always fit).
- `devOptions.enabled:false` by default; test SW with `vite build && vite preview`.
- Host: any static (GitHub Pages needs `base`; Cloudflare Pages / Netlify simplest). HTTPS required for SW.

## 6. Testing
- **Vitest** (node env, no DOM) for `src/logic/*`: question generator (range/uniqueness/no-repeat window), distractor validity (never equals answer, unique, in 1..max, plausibility classes covered), Leitner transitions (promote/demote/due-date with injected clock), scoring. Make RNG injectable (`mulberry32(seed)`) -> deterministic tests; property-style loops over all 9x9 facts (81 mult + 81 div) assert invariants. Keep logic free of `three`/DOM imports so tests are trivial.
- **Playwright** e2e smoke (1-2 specs, Chromium; plus a mobile emulation project e.g. Pixel 5 with `hasTouch`): canvas apps are not DOM-testable, so (a) UI overlay is DOM -> assert via roles/text (`getByRole('button',{name})`); (b) expose `window.__game` debug hook only in dev/test build (`import.meta.env.MODE==='test'`): scene id, store snapshot, `renderer.info`, helper `worldToScreen(id)` so tests can `page.mouse`/`touchscreen.tap` at real coordinates for drag-drop; (c) smoke: boot -> hub renders (canvas non-blank via screenshot pixel check or `__game.sceneId==='hub'`) -> tap building -> level loads -> solve via number pad -> store updated -> reload -> persisted. (d) SwiftShader software GL in CI: use `--use-gl=swiftshader`/`--enable-unsafe-swiftshader` flags if WebGL fails headless; don't screenshot-diff GL output across machines (flaky) - assert state, not pixels. (e) leak check: loop hub<->level 10x, assert `renderer.info.memory.geometries` returns to baseline. 
- Skip: component-level canvas tests, visual regression, coverage targets (YAGNI).

## 7. Pedagogy mechanics
**Facts model**: a "fact" = (a,b,op): mult a×b with a,b in 1..10 (commutative pair pooled as one mastery key `m:3x7` for tracking, but present either order); division derived from same key `d:21/3` (answer 7), linked: a mult fact mastery informs its inverse division fact (start division on facts whose mult is box>=3).

**Distractors** (pick 3 per MC, from different classes, never all same pattern; dedupe; exclude answer; positive; <=100, keep same digit-length ~ plausible):
 1. Neighbour in table: a×(b±1) or (a±1)×b (the common one; use at most 1).
 2. Operation confusion: a+b (e.g. 7×3 -> 10), and for division a×b or a-b.
 3. Digit-swap / tens-slip: 21 -> 12; 56 -> 65; off-by-ten (answer±10).
 4. Cross-table answer: product from the commonly confused fact (6×7=42 vs 6×8=48, 7×8=56 vs 54; "56=7×8 / 54=6×9 / 63=7×9 / 72=8×9" famous mixes). Keep a hard-pairs list.
 5. Same ones digit, nearby tens (answer ±10, ±20) - makes ones-digit guessing useless.
 6. Personal error bank: replay wrong answers this child gave before for this fact (best diagnostic + non-guessable).
 - Guessability checks (unit-test them): answer is not always the median/largest/odd/even-unique; shuffle position uniformly (log position histogram); avoid answer being the only multiple of `a` among options (kids exploit "divisible by a" trick) -> include >=1 distractor that IS a multiple of a or b (class 1/4). Avoid answer being only number in the table's ones-digit pattern (e.g. 5s ends 0/5).
 - Many levels are interaction (not MC) -> free numeric entry/drag results: no guessing at all; use MC only as fallback tier for struggling kids (reduced load).
 - Concrete->abstract ladder (CRA, Bruner): stones/arrays visual first, then symbolic number-only items as mastery rises.

**Leitner mastery (per fact)**: boxes 1-5; correct (first try, no hint, <~8s) -> box+1; correct with hint -> stay; wrong -> box 1 (or box-2 floor 1; gentler, kid-friendly: -1 for 7-9yo is less demoralising [judgment]). Intervals in *sessions* not days (kids irregular): box1 every session, box2 every 2nd, box3 every 4th, box4 every 8th, box5 retired-with-rare-check (or day-based: 0,1,3,7,21 days; pick sessions for MVP). Session mix: ~60% due/weak, ~30% new (max 2-3 new facts/session), ~10% mastered check; interleave tables once 2+ learned. Fast-and-correct latency (<3s) = "fluent" flag, since automaticity matters more than accuracy. Store `{box,lastSeen(sessionNo),streak,avgMs,errs[]}` per key in localStorage (81 keys; trivial). SM-2/FSRS: overkill for 81 facts; reject (KISS).
**Progression**: order by table: 2,5,10 -> 3,4 -> 6,7,8,9 (×1,×0 trivial; squares & doubles first - known fluency order [K]). Level unlock by >=80% facts in box>=3, not by stars alone. Show mastery as visible garden/village growth (intrinsic).
**Hint ladder** (auto-offered after 1st wrong or ~10s idle; each rung lowers star score slightly, never blocks):
 1. Encouragement + re-read the question (voice/text: "Thử lại nào!"), no info.
 2. Visual model: show the groups/array (a rows × b cols) highlighting count.
 3. Skip-count aid: animated "3, 6, 9, 12..." along the groups.
 4. Reveal related known fact (3×6 = 18 -> 3×7 = 18+3) / for division show inverse multiplication.
 5. Worked solution shown + same fact re-queued later in session (counts as wrong for Leitner).
 Never shame: no red X/buzzers; wrong = gentle shake + "gần đúng rồi". Cap 3 attempts then ladder rung 5.

## Recommendation summary (ranked, concrete)
Hand-rolled scene manager + Disposer + plain store; Pointer Events+Raycaster+drag plane with tap alternative; tap-to-move hub (+WASD); pixelRatio<=1.5 adaptive, Lambert flat-shaded, merged static + instanced scenery, blob shadows, <=60-100 draw calls; DOM overlay with self-hosted Baloo 2/Nunito vietnamese subsets, own 2-file i18n; vite-plugin-pwa generateSW + prompt; Vitest on pure logic with seeded RNG + Playwright smoke through a test-only `window.__game` hook; Leitner (5 boxes, session-based) + 6-class distractor mix + 5-rung hint ladder.

## Limits
- Only 2 web searches; neither gave primary confirmation of Three.js current revision or vite-plugin-pwa/Vite 7 peers. Perf numbers (draw calls, tri counts, device class) are experience-based heuristics, not benchmarked on a ~3M VND device: must profile on real hardware early (spike).
- Pedagogy specifics (fluency order, Leitner step-down rule, interval sizing) from general learning-science knowledge, not re-cited today.
- WCAG/Material numbers from memory.

## Unresolved questions
1. Exact versions to pin: `three`, `vite`, `vite-plugin-pwa` (check `npm view`; Vite 7 peer compat).
2. Target devices/browsers concretely (Android Chrome version? WebView? iOS Safari support needed?) - decides WebGL2 baseline and PWA install paths.
3. Is portrait orientation required, or landscape-only? Affects fixed-camera framing per level.
4. Is voice/TTS narration of Vietnamese prompts in scope (non-readers at 7)? Web Speech `vi-VN` availability on cheap Android is spotty.
5. Multi-child profiles per device needed? (store schema: single vs keyed profiles.)
6. Division scope: exact-only (no remainders) for MVP? Affects distractor + level design.
7. Parent/teacher progress view or export? (not covered; would change store/export design.)
