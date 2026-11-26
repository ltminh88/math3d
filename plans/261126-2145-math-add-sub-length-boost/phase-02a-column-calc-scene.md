# Phase 2A: column-calc scene (đặt tính, step by step)

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1A](phase-01a-add-sub-bug-catalogue-and-formats.md); author decision D4
- Research: [codebase](research/researcher-01-codebase-add-sub-length-report.md) §2 (no column
  scene; `place-value` nearest base), [pedagogy](research/researcher-02-pedagogy-add-sub-length-report.md) §2.1, §2.8
- Reuse: `place-value-scene-svg.ts` layout, `dialog-scene-registry.ts` glob registration,
  `src/ui/kit/number-pad.ts`

## Overview
- Date: 2026-11-26
- Description: a new `column-calc` scene and skill `add-sub-column`: the child fills the result
  right→left one digit at a time, with a tap-toggle carry/borrow mark; the scene highlights the
  current column and fills digits as they are answered.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane A, muse-88
- Effort: 1.25d

## Key Insights
- Digit-by-digit scoring (right→left) is how bugs are diagnosed in research §1; a wrong digit in
  column k maps to forgot-carry / borrow-no-decrement / zero bugs directly.
- Steps are already sequential (`ReasoningItem.steps`); each column = one `number` step (0–9 pad)
  plus, when regrouping applies, one `verdict`-style "nhớ 1?" step. No new step kind needed.
- The scene must reflect progress: scene data gets `filled` digits from the runner state, or the
  renderer reads the answered-step count (check what `step-card` exposes; prefer the existing hook).
- "Fix the mistake" reuses the same scene with a pre-filled buggy row (statement for `verdict`).

## Requirements
- Functional
  - Scene `{kind:'column-calc', op:'+'|'-', top, bottom, filled: number[], carries: number[],
    focusCol, buggy?: number[]}` (plain data).
  - SVG renderer: digits aligned by place (fixes misaligned-columns), carry marks small above,
    current column highlighted, ≥ 44 px tap areas where tappable.
  - `add-sub-column` generator (ladder T0–T4): steps per column; wrong digit → bug tag from the
    catalogue when the digit matches a bug's digit.
  - `add-sub-find-error` T2+ shows the buggy row in this scene.
  - Strings: "Hàng đơn vị", "Có nhớ 1 không?" style prompts, vi + en.
- Non-functional: tap-only; `tap()` e2e; no key hints on coarse pointers; files < 200 lines.

## Architecture
- Generator → item with `scene: column-calc` + N steps → dialog scene registry draws the SVG →
  after each step the runner re-renders with `filled` updated.

## Related code files
- Create: `src/arithmetic/add-sub-column-generator.ts` (+ test),
  `src/ui/dialog-scenes/scenes/column-calc-scene-svg.ts`, `column-calc-scene-types.ts`,
  `tests/e2e/add-sub-column.spec.ts`
- Modify: `arithmetic-skill-entries.ts` (append id), `arithmetic-item-for-skill.ts`,
  `add-sub-error-generators.ts`, `add-sub-format-strings.ts`
- Delete: none

## Implementation Steps
1. Branch `muse/add-sub-column`. Confirm how a scene re-renders between steps; reuse it.
2. Scene types + generator (columns, carries, step list) with tests for 385+247, 403−158.
3. SVG renderer; unit snapshot of the SVG string for 2 fixtures.
4. Wire find-error buggy row.
5. E2E: play one column item to the end by `tap()` on 4 projects.
6. Gates; PR with `parity-change`, list the new shots.

## Todo list
- [ ] Scene types + generator + tests
- [ ] SVG renderer
- [ ] find-error uses the scene
- [ ] E2E 4 projects
- [ ] Gates green, PR (`parity-change`)

## Success Criteria
- A child can finish 403−158 column by column by taps only; each wrong digit records a bug.
- Scene readable at mobile-pixel width (≤ 4 digits + sign fits).

## Risk Assessment
- Too many steps per item (5-digit = 5+ steps) tires the child. Mitigation: column items only ≤ 3
  digits for B2; 4/5-digit skills keep the single-answer pad.
- Scene re-render not supported mid-item. Mitigation: fall back to one scene per step (same data
  with `filled` precomputed), still plain data.

## Security Considerations
- None.

## Next steps
- 3A puts `add-sub-column` into play; 7 recaptures parity.
