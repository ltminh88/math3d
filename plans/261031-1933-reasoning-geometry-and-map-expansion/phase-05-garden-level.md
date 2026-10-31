# Phase 05: Garden level "Khu Vườn Quy Luật" (patterns, unknowns, expressions)

## Context links
- [plan.md](plan.md), [01](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md), [03](phase-03-map-expansion-regions-gates-and-quest-chain.md)
- Reference levels: `src/levels/city/**`, `src/levels/tower/**` (multi-step, test hook, leak spec); garden scenery `src/world/regions/village-garden-builder.ts:64-81`

## Overview
- Date 2026-10-31. Priority P1. Status pending. Review: not started. Depends on 01, 03. Parallel with 04, 06–08.
- Story: the riverside garden's gardener planted everything by rules; the rules got muddled. VLM and the child continue flower rows, balance watering cans to find the hidden number, and work out seed-bag expressions step by step.

## Key Insights
- First level of chapter 2: start at tier 1 regardless of table mastery; tiers rise per skill box.
- Expression rounds teach order: the child first taps which part to compute (ngoặc / nhân-chia), then enters its value — the "left-to-right" misconception becomes visible.
- Garden region already exists (unlock 'start'); the gate comes from 03.

## Requirements
- `index.ts`: `{id:'garden', regionId:'garden', rounds:6, requires:'tower', load: () => import('./garden-scene')}` (no tables; skill pool).
- Skill pool: `pattern-add`, `pattern-sub`, `pattern-skip-count`, `unknown-add-sub`, `unknown-mul-div`, `expr-order`, `expr-brackets`, `expr-from-story`; planned via `ctx.learning.planSession(skillKeys, 6)`, rotate kinds (no two in a row).
- Round kinds:
  - (a) Luống hoa quy luật: a row of pots with numbers, 1–2 empty; tap a pot, enter the number (pad) — or choose from 3 seed packets.
  - (b) Cân bình tưới: balance "? + 345 = 800" / "? × 7 = 56"; enter the missing weight; scale levels on success.
  - (c) Túi hạt giống: expression `(28 + 12) × 2 − 15`; step 1 choose the first operation (choice), steps 2–3 values (pad).
- Hints: encourage → rule as words ("mỗi lần thêm 5") / inverse operation / "trong ngoặc trước" → first step worked → 3 misses reveal.
- Look: low-poly garden (recovered garden palette), pots instanced, balance as 3 meshes, VLM via `buildMiloModel`; ≤60 draw calls.
- Touch: everything by tap (pots, packets, pad, hint button, next button); keys optional on desktop (digits, Enter, 1–3, H); targets ≥44 px; no key hints on coarse pointers.
- Test hook `window.__garden` (test build only): state, round kinds, item answers.

## Architecture
```
src/levels/garden/index.ts  garden-scene.ts  garden-round-flow.ts  garden-hints.ts  garden-diorama-builder.ts
src/levels/garden/garden-pattern-row-view.ts  garden-balance-view.ts  garden-panel.ts  garden-input.ts
src/levels/garden/garden-celebration.ts  garden-strings.ts  garden-test-hook.ts  garden-level.css
src/levels/garden/garden-round-flow.test.ts  garden-hints.test.ts
tests/e2e/garden-level.spec.ts  garden-level-leak.spec.ts
```

## Related code files
- Create: above. Modify: none (self-registers). Delete: none.

## Implementation Steps
1. RED round flow: kind rotation, tiers by box, answers from 01 generators, one recorded outcome per round with `sk:` key; GREEN.
2. RED hints (no rung ≥2 shows the answer); GREEN.
3. Diorama + views; panel + input (tap first, then keys).
4. Celebration + `exit({completed:true})`.
5. e2e: seed chapter 1 completed → garden gate (desktop E; phone/tablet `#interact` tap) → 6 rounds (desktop keyboard; phone, tablet portrait, tablet landscape taps only) → back at gate; `garden` completed; valley gate opens; `sk:` keys recorded; ≤60 draw calls; leak 10 cycles with settled baseline.
6. Screenshots `reports/garden-screens/` (desktop, phone, tablet portrait/landscape).

## Todo list
- [ ] round flow + tests
- [ ] hints + tests
- [ ] diorama, views, panel, input
- [ ] celebration
- [ ] e2e 4 projects + leak
- [ ] screenshots

## Success Criteria
- Unit + garden e2e green on desktop, phone, tablet portrait, tablet landscape; lint/typecheck/build clean; own chunk; ≤60 draw calls; no leaks.
- Touch: no step needs a keyboard; targets ≥44 px; no key hints on coarse pointers; layout verified at tablet portrait + landscape.

## Scope Contract
- Changed: new folder + its e2e.
- Impacted: progression (valley gate).
- Will verify: unit + garden e2e on 4 projects + leak.
- Deliberately skipped: parity (09), other levels.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Expressions too abstract for 7-year-olds | M | M | Tier 1 = 2-op without brackets, story framing; author review |
| Balance metaphor confusing | M | L | Show the equation under the scale; hint uses inverse op |
| Panel + pad crowd tablet landscape | L | M | Side panel layout at wide aspect; screenshots |

## Security Considerations
- None.

## Next steps
- 09 merge.
