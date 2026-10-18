# Phase 10: three 0.180.0 -> 0.186.1 bump and visual re-baseline

## Context links
- [plan.md](plan.md) · [research 02 §2 migration r180->r186](research/researcher-02-recovery-tooling-and-parity.md)
- Depends on: 09. Parallel with: 11 (G4).

## Overview
- Date: 2026-10-18
- Description: Upgrade `three` + `@types/three` to 0.186.x in one step (guide allows <=10 releases), fix deprecations, explain every visual diff, re-baseline with user sign-off.
- Priority: P2
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- r181 PBR energy conservation: rough `MeshStandardMaterial` (roughness > 0.5, i.e. almost everything low-poly here) renders brighter. Main visual risk.
- r182 `PCFSoftShadowMap` deprecated for WebGLRenderer -> `PCFShadowMap` (now soft); edge look shifts.
- r183 `Clock` deprecated -> `Timer` (keep `min(dt, 0.05)` semantics; `Timer.update()` each frame).
- r185 `inverseTransformDirection` GLSL deprecation: sky dome ShaderMaterial source checked; r185 `matrixWorldNeedsUpdate` for `matrixAutoUpdate=false` objects (merged statics/instanced) checked.
- Live site stays on r180 forever -> after this phase the oracle is the r180 local baseline set (tag `recovered-r180`), not live.

## Requirements
- Zero three deprecation warnings in console during full parity run.
- Re-baseline only diffs explained by r181/r182; DOM-only shots must stay <= 0.002.
- Decision recorded (Unresolved Q2): accept new look, or retune light intensity/roughness to approximate r180 (max 2h timebox).

## Architecture
- `package.json` versions; `src/world/world-renderer-setup.ts` (shadow type), `src/world/world-frame-loop.ts` (Timer), any `matrixAutoUpdate=false` sites.
- `tests/parity/baselines/local/**` regenerated; side-by-side diff report (r180 vs r186 PNGs) in `reports/three-r186-visual-diff.md` for sign-off.

## Related code files
- Create: diff report. Modify: `package.json`, `package-lock.json`, `src/world/**` (listed), local baselines. Delete: none.

## Implementation Steps
1. Bump deps; `npm run typecheck` (types may change signatures).
2. Grep checklist: `PCFSoftShadowMap`, `new Clock`, `inverseTransformDirection`, `matrixAutoUpdate = false`, `onBeforeCompile`, `dispose` subclasses.
3. Run parity vs r180 local baselines with temp loose tolerance (canvas 0.05) -> collect diff images.
4. Optional retune (timebox) if user wants r180 look.
5. User sign-off; regenerate baselines; restore strict tolerance (0.002). Commit + tag `three-r186`.

## Todo list
- [ ] bump + typecheck
- [ ] deprecation fixes
- [ ] diff report
- [ ] sign-off (+ optional retune)
- [ ] re-baseline

## Success Criteria
- Full parity run: 0 deprecation warnings (console listener asserts), structural JSON equal (draw calls, triangles, instance counts unchanged), canvas diffs vs r180 <= 0.05 before re-baseline, DOM shots <= 0.002.
- After re-baseline: `npm run test:parity` green at 0.002.
- 60 s idle on desktop + iPad: no fps drop > 10% vs r180 (frame-stats from old dev bench kept in 11).

## Scope Contract
- Changed: engine version + 3 world files. Impacted: every 3D frame. Will verify: structural + pixel + perf smoke. Skipped: pure-logic goldens (engine-independent) still run in CI anyway.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Brighter look unacceptable to author | M | M | retune timebox; else stay on 0.180.0 (pin) and defer bump |
| Timer semantics change dt | L | M | movement trace scenarios compare positions |
| Hidden API break (types) | L | L | typecheck + parity |
Rollback: revert to tag `recovered-r180` (pin 0.180.0).

## Security Considerations
- Dependency update: `npm audit` clean for three; lockfile reviewed.

## Next steps
- 12 starts gameplay changes on r186 baselines.
