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

## Review fixes
Findings from `reports/reviewer-city-tower-levels.md`, fixed on main (commits c98fb25, dc008f8, 49c81df, 206b232; tag `full-map-reviewed`).

| Finding | Outcome |
|---|---|
| H1 city windows count shows the product | Fixed: lit floors only, "3/9 tầng sáng"; announcement "Tầng n sáng đèn. Đã sáng a trên b tầng." No window total anywhere. Unit `city-strings.test.ts`, e2e `city-level.spec.ts` asserts the exact text. |
| H2 tower rung 4 shows the answer, floor still correct | Fixed: rung 4 is a strategy from a known fact (× 1, 2, 5, 10) with the result as "?" (e.g. "Mốc dễ nhớ: 8 × 5 = 40. Thêm 2 lần 8 nữa là ra 8 × 7 = ?"). The result only appears on the three-miss path (recorded not correct, Leitner requeue). Unit test sweeps every pool fact × format × step. |
| M3 city reverse hints name the right parcel | Fixed: own rungs (find / compare with p / rule out an untried parcel / "p : t = ?"); unit test: no rung ≥2 names the right parcel or both factors. |
| M4 `hintSkip` mentions windows in delivery | Fixed: `hintCount` for delivery rounds. |
| M5 tower hint carries to next step | Fixed: rung resets and the hint area clears on step advance (hints taken still count). |
| M6 true claim "Đúng" credited as recall | Fixed with a confirm step: after "Đúng" the claim is replaced by the same equation with "?" on the pad; one recorded question. |
| M7 tower per-frame allocations | Fixed: stone spots precomputed, camera target reused. No test (perf, not behavior). |
| M8 tower equation never announced, cards unnamed | Fixed: floor and step equations announced in words ("mấy nhân 7 bằng 56"); cards named "56 (phím 1)". Unit test + e2e aria-label check. |
| M9 tower leak baseline after warm-up | Fixed: `tower-level-leak.spec.ts` uses the settled baseline before the first visit (shared `city-and-tower-settled-memory.ts`); both leak specs assert geometries and textures. |
| L10 wrong houses still accept drops | Fixed: a wrong house (or reverse parcel) leaves the drop zones / picks for that round. |
| L11 inverse of 8 × 10 outside the pool | Fixed: 80 : 8. |
| L12 `hintTen` ambiguous | Fixed: counts back on the factor closest to 10 with clearer wording. |
| L13 text nits | Fixed: tower `wrong` "Chưa đúng, mình thử lại nhé!", shorter tower intro, city `hintCommute` rephrased. |
| L14 tower duplicates tally, city has no stars | Fixed: shared `levels/shared/level-run-tally.ts` (tested) used by city and tower; city celebration shows the star row (e2e: equals stored stars). Field keeps its own tally (out of scope). |
| L15 H key only in city | Fixed: H in tower too; in both levels only while focus is in the level layer (or nowhere). |

Gates: lint 0 errors / 9 pre-existing warnings, typecheck clean, unit 71 files / 473 tests, build ok, e2e 63 passed + 1 skipped (desktop-only full chain) on both projects, parity 20/20 without re-baseline, golden byte-identical.
Screens refreshed: `reports/city-screens/{desktop,mobile}-0{3,4,5}-*.png`, `reports/tower-screens/{desktop,mobile}-05-top-celebration.png`, new `reports/tower-screens/04-hint-rung-4.png`.

## QA fixes
Fixes for `reports/qa-full-playthrough.md` (M-1..M-7, m-1..m-5, m-9..m-12, p-5..p-8), merged on main (tag `qa-fixes`): screenshots 3557ce3, merges 1329a52 (`fix/app-shell-qa`) and ea3bac9 (`fix/level-qa-fixes`), no conflicts; parity 9196d9e. Details: `docs/project-changelog.md`.

Gates on the merged main: lint 0 errors / 9 pre-existing warnings, typecheck clean, unit 77 files / 497 tests, build ok, e2e 77 passed + 5 skipped (project-gated phone/desktop-only specs) of 82, no flake, parity 9/20 → re-baselined (`reports/parity-rebaseline-qa-fixes.md`) → 20/20, golden byte-identical.
Screens: `reports/qa-fix-screens/`. Open: m-6, m-7, m-8, p-1..p-4, p-9.
