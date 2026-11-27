# Phase 8: add/sub frames + contexts wider

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1](phase-01-repeat-meter-and-baseline.md); boost
  [2A](../261126-2145-math-add-sub-length-boost/phase-02a-column-calc-scene.md) merged (1A splits
  `add-sub-generators.ts` and adds formats; 2A adds the column generator). Phase 5 helps (longer name/noun lists).
- Research: [baseline](research/researcher-01-repeat-causes-baseline.md) §2–3
- Reuse: `src/arithmetic/add-sub-word-problems.ts` (131, `BIG_CONTEXTS` L17–27, frames L39+),
  1A's `add-sub-pair-pickers.ts` / `add-sub-calc-generators.ts`, `arithmetic-strings.ts`

## Overview
- Date: 2026-11-27
- Description: add/sub numbers already almost never repeat (≈ 2000/2000), but each skill shows
  one or two frames and big-number stories use 3 places. Add frames and contexts so a run of
  B2 / B54–55 / B63–64 reads like different problems.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane A, muse-88 (owns `src/arithmetic/add-sub-*`)
- Effort: 0.75d

## Key Insights
- After 1A there are more formats (bug choice, find-error, true/false). Measure first: this
  phase only fills what the meter still shows as ≤ 2 shapes.
- One-step frames today: add / sub / compare (3). Common grade-3 frames missing: "how many
  more needed" (a + ? = c), "had some, got/gave, now has" with start unknown, "two groups
  together then compare".
- `BIG_CONTEXTS` = Kho / Thư viện / Trường (3) for numbers ≥ 1000 → add farm, factory, stadium,
  bookshop, bakery … with matching give-away verbs.
- `add-sub-mental-round` T1 = 90 items (round tens only) — fine on numbers, add a second form.

## Requirements
- Functional
  - `add-sub-word-problems.ts`: +3 one-step frames (missing addend, start unknown, compare-less),
    each with vi + en strings; numbers per the skill's range (≤ 1000 / 10 000 / 100 000).
  - `BIG_CONTEXTS` 3 → ~8, each with its noun and give verb keys.
  - Mental round: add the "missing number" form at T2+.
  - Sweep: every number within the lesson range; answers ≥ 0; compare frames never equal.
- Non-functional: files < 200 lines (move contexts to `add-sub-story-contexts.ts`).

## Architecture
Same ids; `oneStep` picks from a longer frame list; big numbers pick from a longer context list.

## Related code files
- Create: `src/arithmetic/add-sub-story-contexts.ts`
- Modify: `add-sub-word-problems.ts`, the 1A calc/mental generator file(s), `arithmetic-strings.ts`,
  `add-sub-generators.test.ts` (or its 1A successor)
- Delete: none

## Implementation Steps
1. After 2A merges, branch `muse/add-sub-variety`. Before rows (incl. 1A's new formats).
2. Contexts file + 5 new big contexts.
3. Three frames + strings; mental-round form.
4. Sweep + snapshots; after rows.
5. E2E garden/numberfort + lesson B2; parity (`parity-change` likely for shots that print an
   add/sub word problem — list them).

## Todo list
- [ ] Before rows
- [ ] Big contexts
- [ ] New frames + strings
- [ ] Sweep, after rows, e2e, parity, PR

## Success Criteria
- Every add/sub word-problem skill ≥ 5 shapes; calc skills ≥ 2 forms (with 1A's formats).

## Risk Assessment
- Collides with 1A/2A/3A follow-ups. Mitigation: start only after 2A; 3A can land before or after.
- Frames that make the child subtract when the story says "more" are a known bug source → they
  must map to the 1A bug catalogue (wrong option = named bug), not invent new ones.

## Security Considerations
- Own text only.

## Next steps
- Phase 4 (same lane) after 3A.
