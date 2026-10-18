# Phase 11: Retire old-plan engine code, keep reusable parts

## Context links
- [plan.md](plan.md) · [scout reuse map](reports/scout-01-current-repo-reuse-map.md) · [old phase 02](../261018-1803-vlm-math-game-mvp/phase-02-engine-core-input-audio-ui-kit.md)
- Depends on: 09. Parallel with: 10 (G4).

## Overview
- Date: 2026-10-18
- Description: One engine only: the recovered world. Delete old engine pieces the recovered game replaces; keep the parts needed by Field/Forest and account UI, moved/renamed only if necessary.
- Priority: P2
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- KEEP (used by 12-18): `src/core/input/**` (drop-zone, tap-select-controller, raycast-picker, keyboard-target-guard, pointer-input, interaction-controller, typed-emitter), `src/core/audio/audio-gesture-unlock.ts`, `speech-narrator.ts`, `speech-voice-picker.ts`, `src/core/quality/**` (adaptive quality; wire later only if perf needs), `src/core/context-loss-handler.ts`, `webgl-support-check.ts`, `tween-manager.ts`, `scene-disposer.ts`, `shared-asset-cache.ts`, `src/dev/frame-stats.ts`, `src/ui/kit/{number-pad,choice-buttons,aria-announcer}.ts` (restyle to recovered CSS in 14/15).
- RETIRE: `src/core/{engine,game-loop,scene-manager,renderer-factory,camera-fit,blob-shadow,low-poly-palette,game-scene-contract,engine-types}.ts` (+ tests) if nothing kept imports them; `src/core/audio/{audio-engine,music-loop,sfx-presets,audio-settings}.ts` (recovered synth wins); `src/dev/perf-bench-*`, `bench.html`, bench input in `vite.config.ts`; `src/ui/kit/{overlay-root,ui-button,fade-transition,speech-bubble,toast}.ts`, `styles/{ui-kit,design-tokens}.css`; `src/styles/base-reset.css`.
- Verify each "retire" with an import graph check before deleting; if a kept file depends on a retired one, keep the dependency (list it).

## Requirements
- Build, typecheck, unit tests green after deletion; no orphan tests.
- Keep a perf probe: `src/dev/frame-stats.ts` exposed via `?debug=fps` in dev builds only (replaces bench page).

## Architecture
- Unchanged folders for kept code; dev-only probe `src/dev/fps-overlay.ts` (tree-shaken in prod via `import.meta.env.DEV`).

## Related code files
- Create: `src/dev/fps-overlay.ts`. Modify: `vite.config.ts` (remove bench input). Delete: RETIRE list.

## Implementation Steps
1. Import graph (e.g. `npx madge --orphans src` ad hoc, no install) -> confirm list.
2. Delete; fix tests; typecheck.
3. FPS overlay dev probe.
4. Commit `chore: retire old engine` + tag `recovery-p11`.

## Todo list
- [ ] import graph check
- [ ] delete retired files + tests
- [ ] fps dev probe
- [ ] green build

## Success Criteria
- `npm run lint && npm run typecheck && npm test && npm run build` exit 0; `npm run test:parity` unchanged.
- `grep -r "perf-bench\|bench.html" src vite.config.ts` -> nothing; `dist/` has no dev probe (`grep -r fps-overlay dist` empty).

## Scope Contract
- Changed: deletions + vite config (config change = safety-critical -> full unit + e2e + parity run). Impacted: none at runtime (unimported code).
- Skipped: nothing.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Delete something 14/15/17 needed | L | M | KEEP list explicit; git history restores |
Rollback: revert commit.

## Security Considerations
- Dev probe excluded from prod bundle.

## Next steps
- 12-17 reuse kept input/audio/ui-kit parts.
