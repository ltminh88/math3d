# Review: phase 13 (79be4b0..aa18656)

Verdict: DONE_WITH_CONCERNS. Critical 0, High 2, Medium 4, Low 7. No finding changes the public level/shop contract (LevelDefinition, LevelModule, LevelContext, LevelSession, registerInteractable, window.__game). Test hook confirmed absent from the prod bundle.

## High
- **H1** `src/levels/shared/level-host.ts:114-122`: `frame()` renders `session.scene` after `update()` even if `update()` called `ctx.exit()`. The disposed scene is re-uploaded to the GPU (leak), flashes for one frame, and an extra rAF is scheduled. Fix: `if (active.ended) return;` after update, before render and before requestFrame; add a unit test.
- **H2** `src/ui/progress-sync.ts:354-362`: `commitLevelRun` calls `enqueue(commitSession)` directly, with no retry. Quiz batches retry via `unsent` with the same batchId. One transient IndexedDB failure loses the run (stars, completedAt, +50 XP/+10 coins). Fix: route through `unsent` + `flushProgress()`.

## Medium
- **M1** World pointer/wheel input (`src/world/world-input.ts`) is gated only on `paused`. `dialog.ts:35` and `map-overlay.ts:119` set `paused=false` while the world is suspended; the map or a dialog can be opened during the level-chunk load. Fix: gate input on `paused || suspended`, restore the saved `paused` in `resume()`, and refuse the map/dialog while a level runs.
- **M2** `level-host-ports.ts:96-99`: the first-completion bonus is decided when the run closes, not inside the queued commit. With a stalled queue, two runs can both get +50/+10. Fix: decide it in the queued job from the snapshot at commit time.
- **M3** `level-run-result.ts:17-25`: `exit({completed:true})` is trusted with zero recorded rounds. Fix: require recorded rounds; otherwise commit as abandoned and log an error.
- **M4** `level-host.ts:127-144`: renderer state (clear color, tone mapping, exposure, shadowMap, pixel ratio, autoClear, render target, viewport) is not restored on exit. Fix: snapshot it on enter and restore it on finish.

## Low
- **L1** Scene background/environment textures are not disposed on exit.
- **L2** `world-interactables.ts:34-37`: on an equal-priority tie, the first registered item wins even when it is farther. Fall back to distance (matters for the phase 19 stall).
- **L3** No feedback during the level chunk load; world keys are dropped meanwhile.
- **L4** Registry: crashes on a missing default export; `load` is not type-checked at runtime.
- **L5** Focus is not moved into the level layer, nor restored on unmount.
- **L6** `enter()` returns 'entered' for a run that exited during `start`.
- **L7** Doc note for levels: listen on `document` with `ctx.disposer.signal`, or an exit keydown bubbles to the world handler after resume.

## Open questions
- Does `commitSession` keep the first `completedAt` on replays?
- e2e and parity were not run by the reviewer (the implementer ran them: 34 e2e, parity 20/20).
