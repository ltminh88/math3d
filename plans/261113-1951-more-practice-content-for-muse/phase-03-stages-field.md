# Phase 03: Stages — field (Cánh Đồng Phép Tính)

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md) (stage table, no-time-pressure rule),
  [phase-01-measure-pools-stage-model-and-save-code-m3d4.md](phase-01-measure-pools-stage-model-and-save-code-m3d4.md)
  (stage model, `level-stages.ts`, host `ctx.stage`)
- `src/levels/field/*` (`field-round-flow.ts`, `field-reasoning-round.ts`,
  `field-stage.ts`), `src/levels/shared/level-stages.ts`,
  `level-run-tally.ts`, `step-miss-budget.ts`
- `src/levels/shared/reasoning-round-panel.ts`,
  `reasoning-round-slot.ts` (shared reasoning-round framework),
  `src/ui/kit/*` (step kit: number pad, choice buttons, multi-select,
  verdict buttons)
- `tests/e2e/field-level.spec.ts`, `tests/e2e/field-level-leak.spec.ts`

## Overview
- Priority P1. Status **not started**. Depends on 01 (stage model).
  Effort **10 h** (branch `muse/stages-field`, one PR into `main`).
- Give the field 6 stages (6 runs, 30 fresh rounds). Stage 1 is the
  current run, unchanged in content, order and rewards; the chain still
  unlocks after stage 1. One level, one PR — phases 03–10 are one phase
  per level so each is small enough to review (PR #1 review, point 3).

## Stage table — question type already exists, or new
Verified against the code (not assumed). "ĐÃ CÓ" names the file that
already implements the type; "MỚI" names what is built and how it reuses
the shared framework instead of a per-level custom UI (PR #1 review,
point 2).

| Stage | Content (5 rounds) | Type | File / reuse |
|---|---|---|---|
| S1 | Planting grid, build-then-total; equations; recall | ĐÃ CÓ | `field-round-flow.ts` (`build \| equations \| recall`) — stage 1 is byte-for-byte today's run |
| S2 | Commutativity — same plot, equation in both orders | ĐÃ CÓ | `field-round-flow.ts` (`equations`: both correct options offered) — emphasis only, no new code path |
| S3 | Missing factor ("3 × ? = 12") on the plot | **MỚI** | New round type in `field-round-flow.ts` (pure type + answer path + hint ladder). UI reuses the existing number pad + plot — no new widget. This is the one genuinely new interaction in this phase. |
| S4 | Word problems, tables 3–4 | **MỚI (đấu nối)** | Reuses the shared reasoning-round framework: `mountReasoningRound` (`levels/shared/reasoning-round-panel.ts`) + step kit (`ui/kit/`). `FIELD_REASONING_SKILLS` grows from `['wp-times-then-add', 'pattern-skip-count']` (`field-reasoning-round.ts`) with `wp-more-less-then-total`, `wp-unit-then-times`. No field-specific panel. |
| S5 | Recall, no planting drag | ĐÃ CÓ | `field-round-flow.ts` (`recall`, box ≥ 3). "Faster" = the drag step is skipped, **not** a time limit (see the rule below). |
| S6 | Mastery — mixed 3–4 + the reasoning round | ĐÃ CÓ | `field-round-flow.ts` + `field-reasoning-round.ts` (reasoning round already ends the run once tables are known) |

## Key Insights
- The planner already takes a pool and a length (`planSession(pool,
  length)`), and `planFieldRounds` already turns planned facts into
  rounds. A stage is a *different call* to the same machinery (different
  pool slice / format mix), not a new level. The stage plan
  (`field-stage-plan.ts`, pure, seeded) is where stage content lives; the
  scene, camera, hints and celebration stay shared.
- Field's pool is the thinnest in the game (tables 3, 4 → 18 mul facts),
  so its stages lean hardest on *format* variety rather than new facts.
  The one new format (S3 missing factor) is a pure round type first and
  a UI question second: the pad and the plot already exist.
- Stars are per stage (`stageStars`), best-kept. The celebration card
  shows the stage's stars and "Chặng {n}/6"; the first-completion bonus
  (+50 XP / +10 coins) is paid on stage 1 only (phase 01).

## No time pressure (rule)
No countdown timer, no penalty for a slow answer, no copy that hurries the
child — in any stage, including S5. "Nhanh hơn" in S5 means the planting
drag is skipped (the child answers on the pad straight away); it never
means a time limit. The Leitner thresholds (`advanceMs`, `fluentMs`) stay
internal and invisible. If a future reviewer proposes a timed mode, that is
a new design decision, not a change inside this phase.

## Requirements
- **Stage plan** (`src/levels/field/field-stage-plan.ts`, pure, seeded):
  stage → pool + format mix + tier floor; round count = the level's
  `rounds` (5). Later stages plan from the full pool with the stage's
  format mix; tiers come from the Leitner box, never from the stage
  number. Due/weak facts come first, as `planSession` already does;
  stages never reset a box.
- **S3 missing factor**: new `FieldRoundType` value in
  `field-round-flow.ts` with its own hint ladder (rung ≥ 2 never shows the
  answer), answered on the existing number pad, plot shown as today.
- **S4 word problems**: the reasoning round (today the last round, only
  once tables are known) becomes a regular round kind in S4, mounted
  through the shared `mountReasoningRound` + step kit. No field-specific
  panel is built.
- **Stage dressing, cheap only**: inside the field's own diorama builder
  (crop/plot tint per stage). No world-scatter change, no new meshes that
  push the level over 60 draw calls, no memory growth across enter/exit
  (leak spec runs per stage, not just stage 1).
- **Gate + celebration**: entering the gate plays the next uncompleted
  stage (`nextStage`); the gate pop-panel and the celebration card name
  the stage ("Chặng 2/6") in `vi` (source) + `en`. A completed stage can
  be replayed from the gate (replay keeps the best stars; replay pays
  per-question rewards only).
- **Tests**: unit tests for `field-stage-plan.ts` (stage → pool/format,
  deterministic for a seed, every number ≤ 100) + for the S3 round type
  (answer path, hint ladder); e2e on all 4 projects (desktop, phone,
  tablet portrait/landscape) playing stage 1 *and* one later stage via
  the `seedStageProgress` hook, asserting `stageStars` in the store, gate
  text, and ≤ 60 draw calls; leak spec extended to enter/exit a later
  stage. Touch: every new control ≥ 44 px, tap-only playable, no key
  hints on `(pointer: coarse)`.
- **Preview deploy**: deploy a preview of this branch
  (`npx vite build --outDir .preview/deploy --emptyOutDir`, then
  `npx vercel@65.9.0 deploy .preview/deploy --yes --project mathgame`,
  **no `--prod`**) and put its URL in the pull request, so the author can
  let the child play the new stages early.

## Visible changes in the world outside the levels
- Gate pop-panel for the field gate: "Chặng {n}/6" + next-stage line.
- Field celebration card: stage stars line ("Chặng {n}/6 · {sao} sao").
- Nothing else in the world changes (no new gate, sign, road or scatter).
  The parity reviewer re-shoots the field gate pop-panel and the
  celebration card; these are intentional changes.

## Architecture
```
src/levels/field/field-stage-plan.ts (new, pure)
src/levels/field/index.ts (mod: stages: 6)
src/levels/field/field-round-flow.ts (mod: S3 round type)
src/levels/field/field-reasoning-round.ts (mod: S4 skill list)
src/levels/field/field-scene.ts (mod: accept ctx.stage)
src/levels/field/field-strings.ts (mod: "Chặng {n}/6" vi/en)
src/levels/field/field-celebration.ts (mod: stage stars line)
tests/e2e/field-level.spec.ts (mod: stage coverage)
tests/e2e/field-level-leak.spec.ts (mod: later stage)
```
The level keeps its own chunk; no shared-level code is forked. Files
< 200 lines, kebab-case.

## Related code files
- Modify: the field folder + its e2e specs listed above.
- Create: `field-stage-plan.ts` (+ co-located test).
- Delete: none.

## Implementation Steps
1. RED stage-plan tests (S1 identical to today's rounds for a fixed seed —
   parity of stage 1 is a test, not an assumption); GREEN.
2. S3 missing-factor round type (pure first, then pad wiring + hint
   ladder); S4 reasoning-round wiring (extend the skill list, mount
   through the shared panel).
3. Gate text + celebration stage line; replay path (best stars kept).
4. Leak spec for a later stage; draw-call check per stage.
5. Lint, typecheck, unit, build, golden `--check` (no world change:
   byte-identical expected), e2e on 4 projects, preview deploy + URL in PR.

## Todo list
- [ ] field stage plan (S1 parity test first)
- [ ] S3 missing-factor round type
- [ ] S4 word-problem wiring (shared reasoning round)
- [ ] gate / celebration stage text + replay
- [ ] e2e + leak, 4 projects
- [ ] preview deploy + URL in PR

## Success Criteria
- Stage 1 is behaviour-identical to today for a fixed seed (unit test
  proves it; the existing e2e spec still passes unmodified for stage 1).
- Stages 2–6 play end to end on all 4 projects by tap alone; `stageStars`
  recorded; gates show the next stage; replays keep best stars.
- ≤ 60 draw calls per stage; no memory growth across enter/exit of any
  stage; every number a child sees ≤ 100.
- No countdown, no slow-answer penalty, no hurrying copy in any stage.
- Changed lines under ~800 without tests; PR carries a preview URL.

## Scope Contract
- Changed: the field folder (stage plan, S3 type, S4 wiring, strings,
  celebration) + its e2e specs.
- Impacted: the gate pop-panel text, the celebration card, the store's
  `stageStars` (written, not redefined — phase 01).
- Will verify: unit (stage plan, S3 type), e2e (4 projects, incl. leak),
  golden check, preview playthrough by the author.
- Deliberately skipped: other levels (phases 04–10), daily (11), stickers
  (12), quest-card changes beyond the stage line (13), any world/scatter
  change, any per-level custom UI for S4 (shared reasoning round instead).

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Stage 1 accidentally changes (regression for existing players) | M | H | S1 parity unit test; existing e2e untouched for S1 |
| Field S3–S5 feel identical (18 facts, same plot) | H | M | Format rotation is the content; author playthrough on the preview judges it — if it fails, S5 becomes a word-problem stage instead |
| S3's hint ladder leaks the answer | M | H | Hint ladder per round kind; rung ≥ 2 never shows the answer (tested) |
| E2E time grows (2 stages × 4 projects) | M | M | Later-stage e2e uses `seedStageProgress` + `teleportToGate`; only stage 1 walks the full entry path |

## Security Considerations
- None: no input parsing, no save-code change, no network.

## Next steps
- 04 (forest) after this lands; 13 integrates the gate/quest text; 14
  runs the full 44-run chain e2e.
