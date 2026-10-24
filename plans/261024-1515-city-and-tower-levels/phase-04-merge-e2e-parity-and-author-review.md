# Phase 04: Merge, full-chain e2e, parity re-baseline, author review

## Context links
- [plan.md](plan.md), [02](phase-02-city-level.md), [03](phase-03-tower-level.md)

## Overview
- Priority: P1. Status: pending. Depends on 02 and 03.
- Integrate both levels, prove the whole chain bridge → tower, refresh parity once, and get the author's sign-off on the look.

## Requirements
- Merge 02 then 03 (`--no-ff`), resolving only expectation conflicts. City e2e: the tower gate is `open` after city.
- New e2e `tests/e2e/full-chain.spec.ts` (desktop): seed progression stage by stage, enter each gate briefly, and check the gate status, quest card and map ("Sắp ra mắt" absent everywhere).
- A review pass on both level folders (reviewer template), then fix the findings.
- Parity: one re-baseline, attributed; golden byte-identical.
- Author review: screenshots from 02/03 plus a headed demo run like the bridge/field demo. Restart the LAN preview on port 4180 with the merged build and give the current LAN IP.
- Docs: `docs/code-standards.md` levels list; the old plan's progress note; this plan's statuses; README unchanged unless scripts changed.

## Todo list
- [ ] merge 02, 03
- [ ] full-chain e2e
- [ ] review + fixes
- [ ] parity re-baseline
- [ ] author review (screens + demo + preview link)
- [ ] docs + tags `city-level`, `tower-level`, `full-map`

## Success Criteria
- All gates green (lint, typecheck, unit, build, e2e both projects, parity 20/20, golden).
- Author approves the look and the difficulty.

## Scope Contract
- Changed: merges, cross-level expectations, baselines, docs.
- Impacted: whole game.
- Will verify: full suites.
- Skipped: none.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Author dislikes the look or difficulty | M | M | Screens reviewed before the merge; `rounds` and tables are data |
| Parity flake on new animated DOM | M | L | Structural gating per the existing tolerance rules, explained |

## Security Considerations
- None.

## Next steps
- Back to the old plan's phases 16–18 (Supabase, accounts, Vercel deploy).
