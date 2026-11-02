# Phase 09: Merge, 9-stage e2e, parity re-baseline, real-input playthrough, deploy, author review

## Context links
- [plan.md](plan.md), phases [01](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md)–[08](phase-08-puzzle-cave-level.md)
- Precedent: `plans/261024-1515-city-and-tower-levels/phase-04-merge-e2e-parity-and-author-review.md`; LAN QA report (commit 03f24d4)
- `docs/recovery-notes.md` (parity method), `docs/code-standards.md`

## Overview
- Date 2026-10-31. Priority P1. Status pending. Review: not started. Depends on 01–08.
- Integrate everything, prove the 9-stage chain on all projects, refresh parity once (attributed), play it for real on a production build on desktop, phone and tablet, deploy to Vercel, and get the author's sign-off.

## Key Insights
- Merge order: 01, 02, 03 (already on main), then 04, 05, 06, 07, 08 (`--no-ff`); conflicts expected only in e2e expectations (gate statuses, closing card).
- Parity diffs expected: quest card chapters, new gate signs, quiz reshuffle from extra world objects; goldens must stay byte-identical.
- Production build has no test hooks → real-input playthrough uses only taps/keys, seeded via save-code import (M3D3) to jump to each chapter.

## Requirements
- `tests/e2e/full-chain.spec.ts`: 9 stages (bridge → cave), gate status, quest card chapter/cells and map per stage on desktop, phone, tablet portrait, tablet landscape; "Sắp ra mắt" absent.
- Review pass (reviewer template) on 04–08 folders + 01/03 shared changes; fix findings; tag `chapter2-reviewed`.
- Parity: one attributed re-baseline; determinism double run (0 diffs); `generate-golden-traces.mjs --check` byte-identical.
- Real-input playthrough on `vite build` preview (no hooks): desktop keyboard + mouse; phone and tablet (portrait + landscape) touch only — Playwright with `tap()`, plus a manual pass on a real tablet/phone over LAN if available. Report + shots in `reports/chapter2-playthrough/`.
- Deploy: `vite build --outDir .preview/deploy` then `npx vercel@65.9.0 deploy .preview/deploy --prod --yes --project mathgame`; smoke the URL (boot, gate, one level round on phone + tablet emulation).
- Docs: `docs/code-standards.md` (levels list, new pure folders, skill keys, tablet projects), `docs/recovery-notes.md` (M3D3, expansion lists, parity re-baseline note), plan statuses; README only if scripts changed.
- Author review: screenshots from 05–08 + playthrough shots; LAN preview on port 4180 with the merged build and the current LAN IP; collect answers to plan.md "Decisions to confirm".

## Architecture
```
tests/e2e/full-chain.spec.ts (mod)  tests/parity/baselines/local/** (re-baseline)
plans/261031-1933-reasoning-geometry-and-map-expansion/reports/chapter2-playthrough/**
docs/code-standards.md  docs/recovery-notes.md (mod)
```

## Related code files
- Modify: e2e expectations, baselines, docs. Create: playthrough report. Delete: none.

## Implementation Steps
1. Merge 04–08 in order; run unit + lint + typecheck + build after each.
2. Fix cross-level expectations; extend full-chain e2e (RED first for the 9 stages); GREEN on 4 projects.
3. Review + fixes.
4. Parity re-baseline (same Mac), determinism run, golden check; commit with the attribution text.
5. Production build playthrough (desktop, phone, tablet portrait/landscape), touch-only on coarse pointers; log any keyboard-only step as a blocker.
6. Deploy to Vercel; smoke test.
7. Docs; tags `chapter2`, `chapter2-reviewed`; author review session.

## Todo list
- [ ] merge 04–08
- [ ] full-chain e2e 4 projects
- [ ] review + fixes
- [ ] parity re-baseline + golden
- [ ] production playthrough desktop/phone/tablet
- [ ] Vercel deploy + smoke
- [ ] docs + tags
- [ ] author review

## Success Criteria
- All gates green: lint, typecheck, unit, build, e2e on desktop, phone, tablet portrait, tablet landscape, parity 20/20 after re-baseline, golden byte-identical, every level ≤60 draw calls, leak specs green.
- Touch: playthrough completes all 9 stages on phone and tablet with taps only; targets ≥44 px; no key hints on coarse pointers; layouts verified at tablet portrait + landscape.
- Author approves look, difficulty tiers and chain order.

## Scope Contract
- Changed: merges, cross-level expectations, baselines, docs, deploy.
- Impacted: whole game.
- Will verify: full suites on all projects, parity, golden, production playthrough (release/deploy = safety-critical → full).
- Deliberately skipped: none.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Merge conflicts in shared expectations | M | L | Folder ownership; expectation-only conflicts |
| Tablet emulation misses real-device issues (Safari) | M | M | Manual LAN pass on a real tablet; note WebKit not covered |
| Parity flake on new animated DOM | M | L | Existing tolerance rules, explained in the commit |
| Author rejects difficulty | M | M | Ranges/tiers/rounds are data; one-line changes |
| Deploy uses wrong project/outDir | L | M | Exact command from the plan; smoke after deploy |

## Security Considerations
- Deploy only the built `.preview/deploy` folder; no `.env*` beyond the publishable key; confirm `dist/` has no test hooks (`__game`, `__garden`, …).

## Review fixes
Findings from `reports/reviewer-chapter2.md`, fixed on branch `fix/ch2-review` (from main f52909e). Every new regression test failed on the pre-fix code for the reason named.

| Finding | Outcome |
|---|---|
| H2 number-pad keydown leaks when leaving mid reasoning round | Fixed: the reasoning panel destroys itself when the level's disposer signal aborts; `createNumberPad` / `createStepCard` take a caller `signal` (the pad keeps its own controller as fallback); garden, valley, workshop and cave cards pass the level signal too. New e2e `reasoning-round-leave-leak.spec.ts`: leave the field during its reasoning number step, enter the forest, typed digits reach the forest pad and three wrong tries record nothing under the field's `sk:` key (RED before: digits swallowed). |
| H1 reasoning rung 3 states the step-1 answer | Fixed: `reasoning-round-hints.ts` builds rung 3 from the current step: the strategy plus that step's operation with "?" ("3 × 2 = ?", then "6 + 3 = ?"; "29 : 2 = ? (dư ?)"; "34 + 15 = ?", then "49 × 2 = ?"); choice steps get the strategy only. Unit sweep: 9 skills × 3 tiers × 300 seeds × every step × rungs 2-3, every number in a hint is already on screen and none is the current step's answer. |
| M3 cave hint not reset per step | Fixed: the rung restarts on a step advance (hints taken still count), the hint area clears and the button re-enables, as in the garden. Unit test in `cave-round-flow.test.ts`. |
| M6 workshop tile grid clipped | Fixed: tiled rectangles are capped at `TILE_MAX_COLS` = 6 columns of 44 px (282 px fits a phone panel), wider tier-1 floors are redrawn; grid uses `safe center` + `overflow-x: auto`. Unit: plan sweep width ≤ 6 and `tileTargets(10×2)` null; e2e `workshop-level.spec.ts` asserts every cell is inside the panel and ≥ 44 px on all four projects, and taps the last cell. |
| M5 valley tier-3 midpoint pre-solved | Fixed: tier 3 opens with no stone tap (no targets, straight to the Đúng/Sai card); the rung-3 aid colours the log A..M and M..B as drawn (`split` on the log draw), so an off-centre M shows two unequal parts. Unit `valley-layout-segment-circle.test.ts`. Correct stone stays index 3 for tiers 1-2 (reviewer's "consider"; author call). |
| M7 bridge word problem rung 3 shows the answer | Fixed (chapter-2 rule): rung 3 is "Đội Nam: a × n = ?. Cả hai đội: lấy số đó cộng thêm a." / "big : small = ?"; the worked answer stays in the right-answer feedback. Multiplication ladder untouched. Unit `quiz-word-problem-strings.test.ts` (levels 0, 2-5). |
| M4 cave "gấp đôi bán kính" | Fixed: rung 2 "Đường kính dài bằng hai bán kính: bán kính + bán kính."; rung 3 for circleD "bán kính + bán kính = d, tìm bán kính" from the strings table, English "two radii". Unit test in vi and en. |
| L11 cave `circleD` hardcoded vi | Fixed with M4 (no "nửa của" in code). |
| L8 workshop sync reveal | Fixed: reveal runs in a microtask after the card's own handling (skipped if the card changed). No test (announcement order only). |
| L9 valley dead hint pulse | Fixed: a miss offers the hint only while rung < 3. No test (cosmetic). |
| L10 valley per-frame cost | Fixed: labels write transforms only when the camera matrices, size or round change; the camera reuses one direction vector. No test (perf, not behavior). |
| L12 miss budget per step vs per round | Fixed per author (option b): every step (and the valley board action) has its own three tries in garden, valley, cave, workshop and the reasoning round; shared `StepMissBudget` in `src/levels/shared/step-miss-budget.ts`. |
| L13 workshop single-weight rung 3 | Left: the weight is visible on the scale. |
| L14 forest controller at 200 lines | Fixed: auto-deal tick moved to `sharing-model.ts` (`autoDealStep`); controller 199 lines. |

## Next steps
- Supabase sync (SQL fact-key check must include the `sk:` branch).
