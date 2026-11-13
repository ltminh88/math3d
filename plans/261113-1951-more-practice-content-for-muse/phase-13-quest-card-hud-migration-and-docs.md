# Phase 13: Quest card / HUD copy / migration / docs

## Context links
- [plan.md](plan.md), [phase-00-design.md](phase-00-design.md),
  phases 03–10 (one per level),
  [phase-11-daily-practice-with-vlm.md](phase-11-daily-practice-with-vlm.md),
  [phase-12-sticker-book-mastery.md](phase-12-sticker-book-mastery.md)
- `src/ui/quest-chain.ts`, `quest-chain-stage.ts`
  (`QUEST_CHAPTERS`: 2 chapters, ≤ 5 cells per chapter, "Chương n · k/m"),
  `quest-chain-strings.ts`
- `src/ui/hud.ts`, `src/ui/game-state.ts`, `src/ui/progress-sync.ts`
- `src/levels/shared/level-gates.ts`, `level-progression.ts`
  (`gateStatus`: locked / coming-soon / open / completed)
- `docs/code-standards.md`, `docs/project-changelog.md`
  (both must describe the new stages + daily practice when this phase lands)

## Overview
- Priority P1. Status **not started**. Depends on 03–12 (it integrates
  what they built; it builds no stage, daily or sticker behaviour itself).
  Effort **7 h** (branch `muse/quest-hud-docs`, one PR).
- One integration phase: the quest card learns about stages, existing
  saves are verified end to end, and the docs describe the new world.
  Small by design — if it grows past ~800 lines, it splits by surface
  (quest card first, docs last).

## Key Insights
- The quest chain's unit is still the *level*, not the stage: the chain
  advances when stage 1 completes, exactly as today. Stages are shown
  *inside* the current level's card (a sub-line), not as new chain cells
  — the chain row is capped at 5 cells per chapter for a 412 px phone,
  and 44 stage cells would not fit and would confuse the "what do I do
  next" question. The card's job is "next step"; the gate's job is "which
  stage".
- A gate that is `completed` today must never *look* locked or finished
  after this change: it is "completed · Chặng 1/6" with the next stage
  open. The `gateStatus` return values do not change (`locked` /
  `coming-soon` / `open` / `completed`); what changes is the *copy* for
  `completed` (it now names the next stage) and a new `stage` field on
  the gate's pop-panel data.
- Docs are a deliverable of this phase, not an afterthought in phase 14:
  `code-standards.md` must describe the stage model, the daily planner
  and the sticker derivation (so the next agent does not re-invent them),
  and `project-changelog.md` must record the behaviour change for
  existing players (stage 1 inherits stars; daily unlock; M3D4).

## Requirements
- **Quest card**: the current level's card gains a sub-line "Chặng {n}/{m}
  · {stars} sao" (from `stageStars`) and, once all stages of a level are
  done, "Đã qua hết các chặng!". The chapter row ("Chương n · k/m") and
  its ≤ 5 cells are unchanged. The daily reminder line (phase 11) and the
  sticker-book button (phase 12) are finalised here for copy and
  placement — one line each.
- **Gate pop-panel**: shows the next stage ("Chặng 2/6 — Vào chơi") and,
  for a fully completed level, "Chơi lại chặng…" (replay picker for
  completed stages, tap list, ≥ 44 px rows). Replaying a stage never
  re-locks anything and never re-pays the first-completion bonus.
- **HUD**: the daily button was already decided and built in phase 11
  (author decision 7, PR #1 review). This phase only finalises its copy
  ("Luyện tập hôm nay") and checks it against the quest-card copy — no
  new HUD element is added here.
- **Migration verification (end to end, not just unit)**: a scripted
  check (e2e) that imports a shipped M3D3 code for a profile that
  finished the cave, then asserts: every level shows stage 1 complete
  with its old stars, stages 2+ open at 0, the quest card shows the
  closing card, the cave gate offers stage 2, and daily practice is
  unlocked with a pool drawn from the imported stats. A second check:
  a fresh profile sees stage 1 of field open and daily locked.
- **Docs**: `docs/code-standards.md` gains: the stage model
  (`stages`, `stageStars`, `level-stages.ts`, stage-1 inheritance,
  first-completion bonus on stage 1 only), the daily planner + streak
  rules, the sticker derivation rule + the `shop/` non-import rule
  restated for stickers. `docs/project-changelog.md` gains a dated entry
  for this work (stages, daily, stickers, M3D4, migration behaviour).
- **Tests**: e2e for the quest-card sub-line + gate replay picker on all
  4 projects (tap only on touch); the two migration e2e checks above;
  unit tests for the quest-card stage line (pure `quest-chain-stage.ts`
  helpers). No new test infrastructure.

## Architecture
```
src/ui/quest-chain.ts (mod: stage sub-line)
src/ui/quest-chain-stage.ts (mod: stage-aware helpers, pure)
src/ui/quest-chain-strings.ts (mod: stage lines vi/en)
src/levels/shared/level-gates.ts (mod: pop-panel stage data — verify file)
src/ui/hud.ts (mod: finalise the daily button copy only — the button
  itself was built in phase 11)
docs/code-standards.md (mod)
docs/project-changelog.md (mod)
tests/e2e/quest-chain-stages.spec.ts (new)
tests/e2e/save-migration-m3d3-to-m3d4.spec.ts (new)
```
Files < 200 lines, kebab-case. No world, level-scene or store change in
this phase.

## Related code files
- Modify: files above.
- Create: the two e2e specs.
- Delete: none.

## Implementation Steps
1. Quest-card stage sub-line + gate pop-panel stage text (strings vi/en);
   replay picker for completed stages.
2. HUD copy finalisation (daily button copy, built in phase 11 — no new
   HUD element here).
3. Migration e2e checks (M3D3 import → stages; fresh profile → daily
   locked).
4. Docs (`code-standards.md`, `project-changelog.md`).
5. Lint, typecheck, unit, build, golden `--check`, e2e on 4 projects.
   Deploy a preview of this branch (no `--prod`) and put its URL in the
   pull request.

## Visible changes in the world outside the levels
- Quest card: stage sub-line for the current level ("Chặng {n}/{m} ·
  {sao} sao" / "Đã qua hết các chặng!").
- Gate pop-panel: next-stage line + replay picker for completed stages.
- HUD: no new element here (the daily button came from phase 11); only
  its copy is finalised.
- The parity reviewer re-shoots the quest card and the gate pop-panel;
  these are intentional changes.

## Todo list
- [ ] quest-card stage sub-line
- [ ] gate pop-panel + replay picker
- [ ] HUD daily button copy finalisation
- [ ] migration e2e (M3D3 import + fresh profile)
- [ ] docs
- [ ] preview deploy + URL in PR

## Success Criteria
- A returning player (finished cave, M3D3 code) loses nothing and sees
  the new stages as open; a fresh player sees the intended unlock order.
- Quest card still fits a 412 px phone; chain row still ≤ 5 cells.
- Docs describe the stage model, daily and stickers well enough that a
  new agent could extend them without re-reading the code.
- No new HUD element added here (the daily button came from phase 11).
- The phase's pull request carries a preview-deploy URL (no `--prod`).

## Scope Contract
- Changed: quest card, gate pop-panel, docs, two e2e specs (+ HUD copy
  finalisation only).
- Impacted: every surface that names a level's completion.
- Will verify: e2e (4 projects), migration e2e, golden check.
- Deliberately skipped: any stage/daily/sticker behaviour change (those
  phases own their behaviour; this phase only integrates and documents),
  any visual/world change.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| "Completed" gates read as "done forever" | M | H | Copy names the next stage explicitly; migration e2e asserts the gate offers stage 2 |
| Quest card overflows on phones with the extra lines | M | M | Sub-line is one line; e2e screenshots on phone + tablet portrait (assert no clipping, as chapter 2 did for quest cells) |
| Docs drift from the code (stage rules described wrong) | M | M | Docs quote the pure helpers' names; the reviewer checks docs against `level-stages.ts` |

## Security Considerations
- None: display + docs only; the migration e2e uses a shipped test code,
  never a real player's code.

## Next steps
- 14 (merge, full e2e, parity, staging, author review).
