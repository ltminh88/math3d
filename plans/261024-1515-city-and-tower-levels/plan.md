---
title: City and Tower levels (full map)
status: in-progress
priority: P1
created: 2026-10-24
effort: ~40h
branch: main
blockedBy: []
relatesTo: plans/261018-1917-recover-and-continue-math-game/
---

# City and Tower levels: "Thành Phố Con Số" + "Tháp Toán Học"

Every map region except Khu Vườn gets a level. Quest chain: bridge → field → forest → **city → tower** → done. The "Sắp ra mắt" badges go away.

## Decisions (author, 2026-10-24)
- Scope: City + Tower only; Khu Vườn Bên Sông stays as it is.
- Content: City = tables 6–9 (parcel delivery by house number, lighting windows on a building). Tower = final challenge, multiplication and division mixed over tables 2–9, climbing floor by floor.
- Same host, reward and style rules as field/forest: phase 13 level host, `scoring.ts` per answer, one-time +50 XP/+10 coins from the host, recovered palette/fonts/CSS, VLM framing via `tc('guideName')`.

## Phases
| # | Phase | Effort | Status |
|---|---|---|---|
| 01 | [Gates, progression and quest chain for city/tower](phase-01-gates-progression-and-quest-chain.md) | 6h | Done (city-tower-p01) |
| 02 | [City level: Thành Phố Con Số](phase-02-city-level.md) | 14h | Done (city-level) |
| 03 | [Tower level: Tháp Toán Học](phase-03-tower-level.md) | 15h | Done (tower-level) |
| 04 | [Merge, full-chain e2e, parity re-baseline, author review](phase-04-merge-e2e-parity-and-author-review.md) | 5h | In progress (merged and verified; QA fixes merged, tag `qa-fixes`; author review pending) |

## Dependencies and parallel groups
- 01 first: the registry refuses a level whose gate is not in `LEVEL_GATES`, and the gate requirement type must accept `forest`/`city`.
- 02 ∥ 03 in separate worktrees after 01. Ownership: 02 → `src/levels/city/**`, `tests/e2e/city-*`; 03 → `src/levels/tower/**`, `tests/e2e/tower-*`. Neither edits shared code, so neither runs parity.
- 04 after both: merge, fix cross-level e2e expectations, one parity re-baseline, author screenshot review.

## Constraints carried over
- `REGIONS` stays byte-equal (golden test); gates are built after the scatter pass, with obstacle circles appended (no RNG shift).
- Each level is its own chunk, uses at most 60 draw calls, and gives back every geometry after 10 enter/exit cycles.
- Keys are listened for on `document` with `ctx.disposer.signal`. Levels never call `openDialog` or touch renderer global state, and call `exit({completed:true})` only after recorded rounds.
- e2e uses its own `E2E_PORT` per worktree; ports 4180/4190 are the author's preview.
- Known parity effect: any new world object reshuffles the quiz content in the seeded playthrough (three's `generateUUID` draws from the seeded `Math.random`). The re-baseline must say so.

## Out of scope
- Khu Vườn level, new regions, Supabase/accounts (old plan phases 16–17), Vercel deploy (old phase 18).
