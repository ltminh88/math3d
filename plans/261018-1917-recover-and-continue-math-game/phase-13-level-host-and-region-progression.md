# Phase 13: Level host inside the recovered world + region progression

## Context links
- [plan.md](plan.md) · [old phase 04 hub/levels shared](../261018-1803-vlm-math-game-mvp/phase-04-hub-map-vlm-guide-story.md) (only `levels/shared` concepts reused; its hub/story dropped, its shop spec moves to [phase 19](phase-19-cosmetics-shop-in-village.md)) · [phase 12](phase-12-store-migration-and-learning-integration.md)
- Depends on: 12. Parallel with: 16 (G6).

## Overview
- Date: 2026-10-18
- Description: Add a level gate in the meadow ("Cánh Đồng Phép Tính") and forest ("Rừng Nhân Chia") regions; walking up to it shows the existing interact button; entering pauses the world and runs a level scene on the same renderer; finishing records `LevelProgress` and returns the player to the gate. Levels self-register.
- Priority: P1
- Implementation status: done (tag phase-13)
- Review status: reviewed (reports/reviewer-phase-13.md); H1, H2, M1-M4, L1, L2, L4, L5, L7 fixed (tag phase-13-reviewed)

## Key Insights
- Keep original world behavior: regions stay walkable exactly as today (they unlock after the bridge quest). Only the level gate is gated: Field gate needs bridge quest complete, Forest gate needs Field completed. City/Tower show "Sắp ra mắt" on their sign; no gate.
- One renderer, two scenes: world loop paused (no render, input detached), level loop owns renderer + canvas; dispose level scene on exit (old `scene-disposer.ts` kept in 11). No second WebGL context (iPad memory).
- Interaction reuse: `#interact` button + proximity check already used for the guide NPC VLM (ex-Milo, renamed in 09) -> generalize to "nearest interactable" (VLM, gates; 19 registers the shop stall) without changing VLM dialog behavior. Registry API `registerInteractable({id, position, radius, label, onInteract})` is the contract 19 consumes.
- Levels use kept `src/core/input/**` (drop-zone, tap-select, raycast-picker, keyboard guard) and `src/ui/kit/{number-pad,choice-buttons,aria-announcer}` restyled with recovered CSS tokens.
- Test builds (`--mode test`) expose `window.__game` (seed progress, teleport, read store) for e2e; absent from prod (asserted in 18).

## Requirements
- `LevelDefinition {id, regionId, tables, rounds, requires: 'bridge'|'field'|null, load(): Promise<LevelModule>}` (dynamic import -> level code split from main bundle).
- `LevelContext`: renderer, canvas, synth audio, game-store, learning API, input helpers, `defineStrings`, announcer, `exit(result)`.
- Result -> `commitSession(delta)` with level progress (stars, bestScore, completedAt) via session recorder; XP/coins rules from `src/learning/scoring.ts` for level rounds ONLY; bridge quest rewards stay frozen as in 12 (+10 XP, +5 coins, combo >= 3, 5 levels) and the host never routes bridge answers through `scoring.ts`.
- Gate visuals: low-poly arch/sign built with recovered primitives; lock icon + label projected like region labels; map detail shows level state.
- World map/minimap: region lock logic unchanged; region detail shows gate state text.

## Architecture
```
src/levels/shared/level-types.ts          LevelDefinition, LevelContext, LevelResult
src/levels/shared/level-registry.ts       import.meta.glob('/src/levels/*/index.ts', {eager:false}) minus shared
src/levels/shared/level-progression.ts    pure: isGateOpen(levelId, progress)
src/levels/shared/level-host.ts           pause world, run level loop, exit/dispose, commit result
src/levels/shared/level-gate-builder.ts   gate mesh in region, interactable registration
src/levels/shared/level-host-strings.ts   defineStrings('levelHost', vi/en)
src/levels/shared/test-debug-hook.ts      window.__game (test mode only)
src/world/world.ts                        + pause()/resume(), interactables registry (VLM + gates; public API for 19)
src/config/regions.ts                     + gate positions for meadow/forest, comingSoon for city/tower
src/ui/world-labels.ts  src/ui/guide-dialog.ts  src/map/map-render.ts   gate label/state, interact routing
```

## Related code files
- Create: `src/levels/shared/**` + `level-progression.test.ts`, `level-registry.test.ts`. Modify: files listed above. Delete: none.

## Implementation Steps
1. Progression + registry (pure, tested).
2. World pause/resume + interactables; VLM flow unchanged (parity guide-dialog scenario must stay identical).
3. Gate builder + labels; region detail text.
4. Level host loop + dispose + commit; "Sắp ra mắt" toast when level module missing.
5. Test debug hook; e2e `tests/e2e/level-gate.spec.ts`: seeded progress -> teleport to meadow gate -> locked before bridge, open after; enter/exit returns to gate; renderer.info.geometries back to baseline after exit (leak check).

## Todo list
- [x] progression + registry (+ tests)
- [x] world pause/resume, interactables
- [x] gates + labels + map text
- [x] level host + commit
- [x] debug hook + e2e (enter/exit + leak e2e deferred to 14, see notes)

## Success Criteria
- `npm test` + `npm run test:e2e -- level-gate` green; `npm run test:parity`: all original scenarios identical except shots containing the new gates (re-baselined, listed).
- 10x enter/exit: `renderer.info.memory.geometries/textures` return to pre-entry values.

## Scope Contract
- Changed: world (pause, interactables), regions config, labels/map text, new levels/shared. Impacted: VLM interaction, map, every world screenshot near gates.
- Will verify: unit (progression), e2e (gate flow + leak), parity (unchanged scenes).
- Skipped: store tests (untouched).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Interact button conflicts VLM vs gate | M | M | nearest-wins with distance ties to VLM; e2e both |
| Memory leak across level entries | M | H | disposer + leak e2e |
| Gate placement collides with scatter/obstacles | M | L | place on existing plaza/road points; add obstacle circle after scatter (does not shift RNG) |
Rollback: remove gates (config flag) -> world as after 12.

## Security Considerations
- Debug hook compiled only in test mode (`import.meta.env.MODE === 'test'`).

## Next steps
- 14/15 implement levels against `LevelContext`; 19 adds the shop stall via the interactables registry.

## Implementation notes (2026-10-21)
- Host API (`src/levels/shared/level-types.ts`): `LevelDefinition {id, regionId, tables, rounds,
  requires, load()}`; `load()` resolves a `LevelModule {start(ctx) -> LevelSession}`; the host owns
  the frame loop (`session.update(dt, time)` then `renderer.render(session.scene, session.camera)`,
  dt clamped to 0.05) and on exit runs `session.dispose()`, flushes `ctx.disposer` (the scene is
  tracked automatically), unmounts `ctx.ui`, commits, resumes the world. `LevelContext`: renderer,
  canvas, ui (overlay root), audio, learning {stats, sessionNo, planSession(pool, length),
  record(outcome), rng}, input.createInteraction(camera), defineStrings, announce, disposer,
  reducedMotion, exit({completed}). Errors in load/start/update give the world back.
- Registry: definitions are EAGER (`import.meta.glob(..., {eager: true, import: 'default'})`), not
  `eager:false` as sketched: a gate must know whether its level exists before anyone walks up to
  it. `index.ts` must import only types and use `load: () => import('./<id>-scene')` (verified the
  scene lands in its own chunk). Registration refuses a definition whose id/folder, region or
  `requires` disagree with `LEVEL_GATES` (single source for gate placement + requirement).
- Commit: `levelRunToCommit` (recorder.finish + one-time +50 XP/+10 coins on the first completion,
  same constant as the frozen bridge quest) -> `progress-sync.commitLevelRun` (same write queue,
  after pending quiz answers). Round rewards are `scoring.ts` via the recorder; bridge quiz untouched.
  Leaving before any answer commits nothing; an abandoned run keeps its answers, no level entry.
- World: `suspend()/resume()` (the plan's pause/resume; `paused` already names the dialog/map
  freeze), `registerInteractable({id, position, radius, priority?, label(), onInteract})` returns
  its unregister; `nearestInteractable()` = nearest strictly in reach, ties within 0.25 go to the
  lower priority (VLM 0). VLM registers with the recovered 3.1 reach, so its prompt and parity are
  unchanged; the interact button keeps VLM's recovered markup and shows other labels otherwise.
- Gates: meadow (29, -14.5) and forest (37.2, 13.4), both facing the default camera; built after
  the scatter pass (obstacle circles appended, no RNG shift), ~9 meshes each, not merged. Statuses:
  locked (requirement unmet) > coming-soon (level not registered) > open > completed (stars on the
  label). City/Tower: `COMING_SOON_REGIONS` (kept out of `REGIONS`, which is golden-tested) ->
  "Sắp ra mắt" badge on their world label and in the map list/detail; gate regions show
  "Cổng màn chơi: <state>" in the map detail. Map canvas rendering untouched.
- Keyboard: world keys, M, Esc and the blur->settings quirk are ignored while a level runs.
- Test hook `window.__game` (test builds only, dynamic import behind `MODE === 'test'`; prod
  bundle grep-clean): seedProgress, teleport, teleportToGate, gateStatus, levelRunning, snapshot,
  memory (renderer.info.memory for 14's leak check).
- Verification without a shipped level: unit tests drive the host with a real three.js scene
  (disposal counted per geometry, 10 enter/exit cycles, load/start/update failures). A manual
  browser smoke with an uncommitted scratch level confirmed: code-split chunk, HUD/top bar hidden,
  M/E ignored, geometries 272 -> 277 in level -> 272 after exit and after 10 more cycles, commit
  xp 60 / coins 15 / 3 stars / completedAt, gate -> completed, forest -> coming-soon.
- Deferred to 14: e2e enter/exit + renderer.info leak check on the real field level (no stub level
  is shipped; `__game.memory()` is ready for it). 14/15 must update `level-gate.spec.ts`, whose
  "Sắp ra mắt" expectations hold only while the levels are absent.

## Review fixes (2026-10-21, tag phase-13-reviewed)
- H1 fixed: the host stops after `update()` when the run ended (no render, no new frame).
- H2 fixed: level runs go through the pending-commit queue (`src/ui/pending-session-commits.ts`)
  like quiz batches, retried with the same batchId; the view gets XP/coins when the commit lands.
  `commitLevelRun(run, bonus?)` now resolves to the committed delta (or undefined).
- M1 fixed: world pointer/wheel input checks `suspended`; `resume()` gives back the pause state
  from before `suspend()` (`src/world/world-suspension.ts`); the map and the shared dialog
  (except a reload `notice`) refuse to open while a level loads or runs.
- M2 fixed: the first-completion bonus is decided inside the queued commit from the store
  (`firstCompletionBonus`); only a run with stars >= 1 (what sets `completedAt`) gets it.
- M3 fixed: `exit({completed:true})` with no recorded round commits nothing and logs an error.
- M4 fixed: renderer global state is snapshot on enter and restored on exit, before resume
  (`renderer-state-snapshot.ts`, port `saveRendererState`).
- L1 fixed: scene background/environment textures are disposed on exit. L2 fixed: equal-priority
  ties fall back to distance. L4 fixed: the registry names the folder of a missing default export
  or non-function `load`. L5 fixed: focus moves into the level layer and back on unmount.
  L7 fixed: `LevelContext` docs (keys on `document` with `ctx.disposer.signal`, no `openDialog`,
  leave the renderer alone).
- Deferred to phase 18: L3 (no feedback during the level chunk load), L6 (`enter()` returns
  'entered' for a run that exited during `start`).
- Open question answered: `commitSession` keeps the first `completedAt` on replays
  (`progress-repository.ts`: `prev.completedAt || ctx.now`, only when stars >= 1).
- Gates: 362 unit tests, 34 e2e, parity 20/20 with no artifact change.

