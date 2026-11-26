# Phase 1A: add/sub bug catalogue and new formats

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 0](phase-00-shared-contracts.md)
- Research: [codebase](research/researcher-01-codebase-add-sub-length-report.md) §1–2,
  [pedagogy](research/researcher-02-pedagogy-add-sub-length-report.md) §1–3
- Reuse: `arithmetic-distractors.ts` (`wrongAddByForgotCarry`, `wrongSubByNoBorrow`,
  `wrongBySlip`), `carry-count.ts`, `wrong-answer-carry*.ts`, `arithmetic-skill-entries.ts`

## Overview
- Date: 2026-11-26
- Description: split `add-sub-generators.ts`, build a pure bug catalogue (one wrong-value
  function per bug), the T0–T5 ladder, five new item formats and per-bug explanations.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane A, muse-88
- Effort: 1.5d

## Key Insights
- Calc items today are number-pad only; distractors exist only in find-error. Bug-tagged
  choices turn every wrong pick into a diagnosis.
- Tier axis stays "regrouping, not size" (`add-sub-generators.ts:2-3`). Ladder: T0 no regroup,
  T1 one regroup units→tens, T2 one regroup tens→hundreds, T3 two regroups, T4 zero in the
  middle/end of the minuend (403−158, 500−236), T5 mixed formats + word problems at T1–T4 numbers.
- Distractor values must differ from the answer and from each other; if two bugs give the same
  value, keep one option and tag the first bug.
- No column scene yet (2A); number line steps ±1 only (`numbers-scene-types.ts:26-34`).

## Requirements
- Functional
  - Split `add-sub-generators.ts` (264) into `add-sub-pair-pickers.ts`, `add-sub-calc-generators.ts`,
    `add-sub-error-generators.ts` (find-error, missing-digit); no behavior change (seed tests equal).
  - `add-sub-bug-catalogue.ts`: `bugValue(bug, a, b, op)` for the 8 add/sub bugs; `bugsFor(a,b,op)`
    lists bugs that apply and give a distinct wrong value.
  - `pickLadderPair(rng, op, ladder)` for T0–T4 (≤1000; 4/5-digit skills keep their range).
  - New skill ids (append, lessons T1 B2): `add-sub-bug-choice` (calc, 4 options, 3 bug-tagged),
    `add-sub-true-false` (verdict + fix, false statements come from a bug),
    `add-sub-compare-estimate` (nearest hundred, < = > with a bug trap),
    `add-sub-number-line` (jumps of 100/10/1, tap the next landing),
    `add-sub-bar-model-wp` (choose bar → choose + or − → number pad).
  - `add-sub-find-error` / `add-missing-digit`: distractors and wrong statements from the catalogue.
  - Number-line scene: optional `jumps: {from, by}[]` (draws arcs; ±1 behaviour unchanged).
  - `wrong-answer-add-sub-bug.ts`: one Vietnamese explanation per bug (vi + en), registered via
    Phase 0's registry; never shows the answer from hint rung 2 up.
- Non-functional: pure, seeded, files < 200 lines, the child is "bạn", own wording (no SGK text).

## Architecture
- `arithmetic-item-for-skill.ts` → generator(rng, ladderTierOf(stat)) → `ReasoningItem` with
  choice options tagged `misconception` → kit records `bug` → explainer by bug.

## Related code files
- Modify: `src/arithmetic/add-sub-generators.ts` (→ split), `arithmetic-skill-entries.ts`,
  `arithmetic-item-for-skill.ts`, `arithmetic-distractors.ts`, `arithmetic-strings.ts` (229: move
  new strings to `add-sub-format-strings.ts`), `src/numbers/numbers-scene-types.ts`,
  `src/ui/dialog-scenes/scenes/number-line-scene-svg.ts`
- Create: `src/arithmetic/add-sub-pair-pickers.ts`, `add-sub-calc-generators.ts`,
  `add-sub-error-generators.ts`, `add-sub-bug-catalogue.ts`, `add-sub-format-generators.ts`,
  `add-sub-bar-model-word-problems.ts`, `add-sub-format-strings.ts`,
  `src/practice/wrong-answer-add-sub-bug.ts` (+ tests for each)
- Delete: none (old file becomes a re-export barrel only if callers need it, < 30 lines)

## Implementation Steps
1. Branch `muse/add-sub-formats`. Split the generator file; seed-equality tests stay green.
2. Bug catalogue + table tests (research §1 items: 47+38→75, 63−28→45, 403−158→355, …).
3. Ladder pair picker T0–T4 with zero-in-the-middle cases; property tests over seeds.
4. Five new generators + ids; strings; dispatcher entries.
5. Upgrade find-error / missing-digit distractors to the catalogue.
6. Number-line `jumps` field + renderer.
7. Per-bug explanations, registry wiring; hint-ladder test (no answer from rung 2).
8. Gates; PR with `parity-change` only if number-line shots move.

## Todo list
- [ ] Split generators, seeds unchanged
- [ ] Bug catalogue + tests
- [ ] Ladder T0–T4 picker
- [ ] 5 new formats + ids + strings
- [ ] find-error / missing-digit upgraded
- [ ] Number-line jumps
- [ ] Per-bug explanations
- [ ] Gates green, PR

## Success Criteria
- Every bug-tagged option's value equals `bugValue` for its bug; all options distinct.
- Each new id playable in a lesson run (B2) on all 4 Playwright projects by `tap()`.
- No file in `src/arithmetic/` over 200 lines.

## Risk Assessment
- Bug values collide or go negative. Mitigation: `bugsFor` filters; tests over 1 000 seeds.
- Lesson-coverage tests demand every B2 id be playable. Mitigation: add ids with generators in one PR.

## Security Considerations
- None.

## Next steps
- 2A (column scene), 4A (weighting), 5B (diagnostic uses `add-sub-bug-choice`).
