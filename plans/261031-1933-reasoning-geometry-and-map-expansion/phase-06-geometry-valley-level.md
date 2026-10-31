# Phase 06: Geometry valley level "Thung Lũng Hình Học" (KNTT B16–B21)

## Context links
- [plan.md](plan.md), [01](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md), [02](phase-02-geometry-and-measurement-generators.md), [03](phase-03-map-expansion-regions-gates-and-quest-chain.md)
- Reference: `src/levels/city/**` (3D tap/drag/keyboard facade via `ctx.input.createInteraction`), `src/levels/tower/**`
- Verification report from 02 (terms, ranges, square-as-rectangle)

## Overview
- Date 2026-10-31. Priority P1. Status pending. Review: not started. Depends on 01, 02, 03. Parallel with 04, 05, 07, 08.
- Story: the valley's shape stones were scattered by the wind. VLM and the child find midpoints, measure circles, test corners with a big ê ke, sort shapes and build boxes to rebuild the stone garden.

## Key Insights
- Hands-on beats reading: each round has one simple 3D action, then an answer step; the action must work by tap (2.5.7) — no precise dragging on phones.
- Right angle on a rotated shape is the core misconception; the ê ke snaps to a corner on tap and shows ✓/✗ fit.
- Midpoint: the child taps one of N marked points on a log (evenly spaced ticks), so precision is never the obstacle.
- Readability on phones: top-down-ish camera, thick outlines, labels as DOM chips (like city labels), ≥44 px tap proxies.

## Requirements
- `index.ts`: `{id:'valley', regionId:'valley', rounds:6, requires:'garden', load: () => import('./valley-scene')}`.
- Skill pool: all `geo-*` ids; tiers per box; kinds rotated.
- Round kinds:
  - (a) Trung điểm: log AB with ticks (even length 2–20 cm); tap M, then "AM = ? cm" (pad).
  - (b) Hình tròn: pond with centre O and ropes; identify tâm/bán kính/đường kính (choice) or R↔D value (pad; distractor = swap).
  - (c) Góc vuông với ê ke: 3–4 rotated corners/shapes; tap a corner to place the ê ke, then mark Vuông/Không vuông (verdict); tier 2+: count right angles in a shape (pad).
  - (d) Phân loại hình: shapes on the ground; "chọn tất cả hình chữ nhật/tam giác/tứ giác" (multi-select by tapping shapes or the cards) or count shapes in a composite (tier 3).
  - (e) Khối hình: pick the khối lập phương vs hộp chữ nhật among 3 blocks (choice); tier 2+: mặt/cạnh/đỉnh count (pad), faces highlight on tap.
- Rotate control (optional view turn): on-screen ⟲/⟳ buttons (R key on desktop).
- Hints: encourage → definition chip ("góc vuông vừa khít ê ke") → visual aid (highlight equal halves / diameter through O / ê ke outline) → 3 misses reveal.
- Look: valley palette from 03 builder, instanced stones/ticks; ≤60 draw calls. Test hook `window.__valley`.
- Touch: every action by tap (corner, point, shape, buttons); keys optional (arrows to move focus, Enter, digits, 1–4, H, R); targets ≥44 px; no key hints on coarse pointers.

## Architecture
```
src/levels/valley/index.ts  valley-scene.ts  valley-round-flow.ts  valley-hints.ts  valley-diorama-builder.ts
src/levels/valley/valley-segment-view.ts  valley-circle-view.ts  valley-set-square-view.ts  valley-shapes-view.ts  valley-solids-view.ts
src/levels/valley/valley-panel.ts  valley-input.ts  valley-labels.ts  valley-celebration.ts  valley-strings.ts  valley-test-hook.ts  valley-level.css
src/levels/valley/valley-round-flow.test.ts  valley-hints.test.ts  valley-set-square-fit.test.ts
tests/e2e/valley-level.spec.ts  valley-level-leak.spec.ts
```

## Related code files
- Create: above. Modify: none. Delete: none.

## Implementation Steps
1. RED round flow (kinds, tiers, outcomes with `sk:` keys); RED ê ke fit (pure: corner angle within ±1° of 90 after rotation); GREEN.
2. RED hints (no rung ≥2 gives the answer); GREEN.
3. Views + diorama (scene descriptors from 02 → meshes); labels; tap proxies.
4. Panel/input with step kit; rotate buttons; celebration + exit.
5. e2e on desktop (keyboard), phone + tablet portrait + tablet landscape (taps only): seed garden done → valley gate → 6 rounds incl. ê ke and multi-select → back; `valley` completed; workshop gate opens; ≤60 draw calls; leak 10 cycles.
6. Screenshots `reports/valley-screens/` incl. rotated-corner round on phone + tablets.

## Todo list
- [ ] round flow + ê ke fit + tests
- [ ] hints + tests
- [ ] views, diorama, labels
- [ ] panel, input, rotate buttons
- [ ] celebration
- [ ] e2e 4 projects + leak
- [ ] screenshots

## Success Criteria
- Unit + valley e2e green on desktop, phone, tablet portrait, tablet landscape; own chunk; ≤60 draw calls; no leaks; terms match the 02 verification report.
- Touch: no step needs a keyboard or a drag; targets ≥44 px; no key hints on coarse pointers; layout verified at tablet portrait + landscape.

## Scope Contract
- Changed: new folder + its e2e.
- Impacted: progression (workshop gate).
- Will verify: unit + valley e2e on 4 projects + leak.
- Deliberately skipped: parity (09), other levels.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Small corners/points hard to tap on phones | M | H | Tap proxies ≥44 px, focus ring, card alternatives |
| 3D perspective distorts right angles | M | M | Near top-down camera for angle rounds; ê ke check is logical, not visual |
| Too many concepts in one level | M | M | Tiers: tier 1 only a–c; author review |

## Security Considerations
- None.

## Next steps
- 09 merge.
