# Phase 10: three 0.180.0 -> 0.186.1 bump and visual re-baseline

## Context links
- [plan.md](plan.md) · [research 02 §2 migration r180->r186](research/researcher-02-recovery-tooling-and-parity.md)
- Depends on: 09. Parallel with: 11 (G4).

## Overview
- Date: 2026-10-18
- Description: Upgrade `three` + `@types/three` to 0.186.x in one step (guide allows <=10 releases), fix deprecations, then RETUNE lighting/materials so r186 matches the r180 look (decided 2026-10-18; 2h timebox), re-baseline after author approves screenshots.
- Priority: P2
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- r181 PBR energy conservation: rough `MeshStandardMaterial` (roughness > 0.5, i.e. almost everything low-poly here) renders brighter. Main visual risk.
- r182 `PCFSoftShadowMap` deprecated for WebGLRenderer -> `PCFShadowMap` (now soft); edge look shifts.
- r183 `Clock` deprecated -> `Timer` (keep `min(dt, 0.05)` semantics; `Timer.update()` each frame).
- r185 `inverseTransformDirection` GLSL deprecation: sky dome ShaderMaterial source checked; r185 `matrixWorldNeedsUpdate` for `matrixAutoUpdate=false` objects (merged statics/instanced) checked.
- Live site stays on r180 forever -> oracle here is the renamed r180 local baseline set (tag `renamed-math3d`), not live.
- Retune levers (chosen path): hemisphere/ambient + directional light intensity scaled down to offset r181 energy gain, per-material roughness/color nudge for the large ground/grass/water materials, shadow radius/bias for r182 `PCFShadowMap`. Values live in one place (`src/world/world-lighting-tuning.ts`) so a revert is one file.

## Requirements
- Zero three deprecation warnings in console during full parity run.
- Re-baseline only diffs explained by r181/r182; DOM-only shots must stay <= 0.002.
- Retune to r180 look (validated decision): canvas diff vs r180 baselines as low as reachable within 2h; author approves side-by-side screenshots before re-baseline. Residual diffs accepted by author are listed in the diff report.

## Architecture
- `package.json` versions; `src/world/world-renderer-setup.ts` (shadow type), `src/world/world-frame-loop.ts` (Timer), `src/world/world-lighting-tuning.ts` (new: retune constants), light/material builders reading it, any `matrixAutoUpdate=false` sites.
- `tests/parity/baselines/local/**` regenerated; side-by-side diff report (r180 vs r186 PNGs) in `reports/three-r186-visual-diff.md` for sign-off.

## Related code files
- Create: diff report, `src/world/world-lighting-tuning.ts`. Modify: `package.json`, `package-lock.json`, `src/world/**` (listed), local baselines. Delete: none.

## Implementation Steps
1. Bump deps; `npm run typecheck` (types may change signatures).
2. Grep checklist: `PCFSoftShadowMap`, `new Clock`, `inverseTransformDirection`, `matrixAutoUpdate = false`, `onBeforeCompile`, `dispose` subclasses.
3. Run parity vs r180 local baselines with temp loose tolerance (canvas 0.05) -> collect diff images.
4. Retune (2h timebox): adjust tuning constants, rerun parity, record per-scenario diff before/after in the report.
5. Author approves screenshots; regenerate baselines; restore strict tolerance (0.002). Commit + tag `three-r186`.

## Todo list
- [ ] bump + typecheck
- [ ] deprecation fixes
- [ ] diff report
- [ ] retune to r180 look (2h)
- [ ] author screenshot approval
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
| Retune can't reach r180 look in 2h | M | M | author decides: accept residual diff, or stay on 0.180.0 (pin) and defer bump |
| Timer semantics change dt | L | M | movement trace scenarios compare positions |
| Hidden API break (types) | L | L | typecheck + parity |
Rollback: revert to tag `recovered-r180` (pin 0.180.0).

## Security Considerations
- Dependency update: `npm audit` clean for three; lockfile reviewed.

## Next steps
- 12 starts gameplay changes on r186 baselines.
