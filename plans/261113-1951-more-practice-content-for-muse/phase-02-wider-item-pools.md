# Phase 02: Wider item pools

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md)
- `plans/261113-1951-more-practice-content-for-muse/reports/pool-counts-before.md`
  (phase 01's measured before-counts — the bar this phase must clear)
- `src/reasoning/*-generators.ts`, `reasoning-ranges.ts`,
  `reasoning-strings.ts`, `reasoning-distractors.ts`
- `src/geometry/*-generators.ts`, `polygon-templates.ts`,
  `geometry-ranges.ts`
- `src/measurement/*-generators.ts`, `measurement-ranges.ts`
- `src/learning/question-generator.ts`, `distractor-picker.ts`,
  `curriculum-tables.ts` (mul/div fact pools per level)
- Chapter 2 research: `researcher-02-kntt-reasoning-verification.md`,
  `researcher-03-kntt-geometry-measurement-verification.md` (KNTT wording
  and ranges the new contexts must stay inside)

## Overview
- Priority P1. Status **not started**. Depends on 01 (counter + catalog
  freeze). Parallel with 03 (different folders; 03 consumes the widened
  generators but its stage *formats* do not depend on the new contexts).
- Widen the pools *inside* the existing generators — more story contexts,
  shapes and scene variants — so no child sees the same visible prompt
  twice within three runs of a level. No new skill ids (phase 01 froze
  that question), no new numbers above 100, no new unit conversions.

## Key Insights
- A "distinct item" is what the child sees: template + numbers + scene.
  The mul/div fact pools are already large (tower: 144 mul/div facts) but
  the *reasoning* pools are template-thin: each word-problem skill has
  essentially one story sentence with varying numbers, so a child
  replays the same sentence with different numbers and it *feels* like a
  repeat even when the numbers differ. Widening therefore means new
  contexts first, new number ranges almost never.
- Tiers raise reasoning, never number size (`skill-tiers.ts`,
  `reasoning-ranges.ts`). A tier-3 item must still be ≤ 100 everywhere,
  including intermediates — every new context is checked by the same
  1000-seed oracle tests the generators already have.
- Geometry/measurement pools are scene-bound: a new shape variant is a
  row in `polygon-templates.ts` or a solid/decor variant, not a new
  generator. Measurement's narrowest skills (`meas-temperature`: 6 places;
  `meas-gram`: fixed weight set) widen by *combination* (place × temp,
  weights × target), not by new ranges.
- Distractors stay misconception-based (`reasoning-distractors.ts`,
  `geometry-distractors.ts`); new contexts must not introduce a new
  distractor class without naming its misconception.

## Requirements
- **Target (per skill × tier, from the phase-01 counter):** distinct
  visible signatures ≥ 24 for every reasoning skill, ≥ 12 for every
  geometry/measurement skill — enough that a skill appearing ~1× per run
  does not repeat an exact prompt within three runs of its level
  (3 runs × ~6 rounds, skill share ≤ 1/3 of rounds). Any skill that
  cannot reach its target after widening is listed in the after-report
  with the reason (e.g. a genuinely finite KNTT set) and the stage plans
  in phases 03/04 are adjusted to use it less often — the shortfall is
  reported, not hidden.
- **Word problems** (`src/reasoning/word-problem-generators.ts`): +3–5
  story contexts per skill (6 `wp-*` skills), from KNTT grade-3 contexts
  (SGK B24–B28, B39): different people, objects and places (e.g. packs of
  pencils, rows of chairs, boxes of cakes, teams carrying stones — the
  book's own settings), each with `vi` source + `en` translation in
  `reasoning-strings.ts`. Context is drawn by the seeded rng, so the same
  seed still reproduces the same item.
- **Remainders / unknowns / patterns / expressions / logic**: +2–3
  contexts or surface variants each where the counter shows thinness
  (pattern: new step families within `PATTERN_STEPS`; expressions: new
  story framings in `expr-from-story`; logic: new statement families
  that keep the "explain/fix" step honest — a true/false item must still
  show the reasoning, per the 2026-11-09 changelog fix).
- **Geometry**: +shape/polygon templates (`polygon-templates.ts`) and
  solid variants so `geo-shape-count`, `geo-shape-classify`,
  `geo-solid-identify/parts` clear 12 distinct signatures per tier;
  rotated-figure variants for tier 2+ within the existing
  `ROTATION_RANGE`.
- **Measurement**: combination widening — ruler (new object lengths
  within `RULER_MAX_CM`), balance (new weight combinations within
  `WEIGHTS`), jug (new mark combinations), thermometer (place × temp is
  already 200+; verify, add places only if the counter says the *visible*
  repeat is the place name), perimeter/area (new side sets within
  `SIDE_RANGE` / `AREA_SIDE_MAX`, new fence stories).
- **Tables (mul/div)**: no new facts exist to add (tables 2–9 are finite)
  — widening here is *format* variety, which belongs to phases 03/04
  (stage formats), not this phase. This phase only verifies the fact-pool
  counts per level from `curriculum-tables.ts` and reports them.
- **Tests**: the existing oracle tests (1000 seeds × 3 tiers × skill:
  exact answers, unique options, correct present once, every number /
  intermediate / answer 0–100, deterministic) run unchanged over the
  widened generators; add a test that every new context renders in `vi`
  *and* `en` and that no context's numbers exceed the tier range.
- **Report**: fill in the "after" column of `pool-counts-before.md`
  (renamed `pool-counts.md` in this phase's PR) with before/after counts
  per skill × tier and the repeat-distance median before/after.

## Architecture
```
src/reasoning/word-problem-generators.ts (mod: context tables)
src/reasoning/reasoning-strings.ts (mod: new contexts vi/en)
src/reasoning/unknown-and-pattern-generators.ts (mod, only where thin)
src/reasoning/expression-generators.ts (mod, only where thin)
src/reasoning/logic-statement-generators.ts (mod, only where thin)
src/geometry/polygon-templates.ts (mod: +templates)
src/geometry/shape-generators.ts, solid-generators.ts (mod, only where thin)
src/measurement/*-generators.ts (mod: combination variants)
tools/practice/pool-counter.ts (mod: unchanged interface, re-run)
```
No new files except where a context table grows past 200 lines — then
split by skill family (`reasoning/word-problem-contexts.ts`). Pure logic
stays free of `three` and DOM.

## Related code files
- Modify: the generator + strings files above, `pool-counts.md`.
- Create: none expected (except a split context table if needed).
- Delete: none.

## Implementation Steps
1. Re-run the phase-01 counter; pick the thinnest skills first (lowest
   distinct count per tier). RED: a test asserting the new target count
   for one skill (e.g. `wp-times-then-add` tier 1 ≥ 24); GREEN by adding
   contexts.
2. Per skill family: add contexts/variants, then run the oracle tests
   (1000 seeds × 3 tiers) and the vi/en render test. Every number in a
   new context is checked ≤ 100 by the oracle, not by eye.
3. KNTT check: each new context cites its SGK lesson (same format as the
   catalog's `lesson` field); a context with no lesson cite does not land.
4. Re-run the counter; fill in the after-report; list any skill below
   target with reason + the phase 03/04 adjustment it needs.
5. Lint, typecheck, unit, build, golden `--check` (pure-logic change:
   goldens must be byte-identical; if a generator change reshuffles a
   seeded quiz order, that is a *finding* to report, not a baseline to
   regenerate silently).

## Todo list
- [ ] word-problem contexts (+3–5 per `wp-*` skill)
- [ ] remainder / unknown / pattern / expression / logic variants
- [ ] geometry templates + solid variants
- [ ] measurement combination variants
- [ ] oracle + vi/en tests green
- [ ] after-report with before/after counts; shortfall list

## Success Criteria
- Every skill × tier meets its target, or is on the shortfall list with a
  reason and a phase 03/04 adjustment.
- Oracle tests green (1000 seeds × 3 tiers × every skill); all prompts
  render in vi/en; no number above 100 in any seed.
- No visual change: goldens byte-identical; no parity re-baseline.
- The after-report is the evidence the reviewer checks, not a claim in
  the PR body.

## Scope Contract
- Changed: generator context/variant tables + strings + the counts report.
- Impacted: every level and the bridge quiz that draws from these
  generators (content only — same item shape, same steps, same hints).
- Will verify: unit oracles, vi/en render tests, counter re-run, golden
  check.
- Deliberately skipped: new skill ids, new generator kinds, new round
  formats (phases 03/04), any UI or scene change.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| New context breaks a hint rung (shows the answer) | M | H | Hint tests per skill re-run; rung ≥ 2 never shows the answer (code-standards rule, tested in chapter 2) |
| A context's numbers exceed 100 at tier 3 | M | H | Oracle over 1000 seeds per tier; ranges file is the single source of truth |
| KNTT wording drifts (new contexts sound "made up") | M | M | Lesson cite per context; author review in phase 08 checks wording, not just counts |
| Widening reshuffles seeded quiz order → golden diff | L | M | Golden `--check` in this phase; any diff is reported, never silently re-baselined |

## Security Considerations
- None beyond existing: generators are pure and seeded; no input is
  parsed, no save-code change in this phase.

## Next steps
- 04 consumes the widened pools; 03 uses the verified fact-pool counts.
