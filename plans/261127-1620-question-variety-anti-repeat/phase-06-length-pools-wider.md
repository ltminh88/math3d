# Phase 6: length pools wider

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1](phase-01-repeat-meter-and-baseline.md)
- Research: [baseline](research/researcher-01-repeat-causes-baseline.md) §2–3
- Reuse: `src/measurement/length-compare-order-generators.ts` (143, `OBJECTS` L107–124),
  `length-and-unit-generators.ts` (130), `length-add-sub-generators.ts` (151, `LEN_OBJECTS` L32),
  `length-ladder-generators.ts` (133), `measurement-distractors.ts` (`LONG_NOUNS` L8),
  `measurement-ranges.ts` (`RULER_MAX_CM = 10`), `length-strings.ts`, `docs/code-standards.md` (D1 rule)

## Overview
- Date: 2026-11-27
- Description: widen the smallest length pools inside D1 (`meas-len-*`: m/dm/cm/mm, integers
  ≤ 1000, m↔mm from L2, no decimals) and the ≤100 rule for the old ids (`meas-ruler-read`,
  `meas-mm-convert`).
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min (owns `src/measurement/length-*`)
- Effort: 0.75d

## Key Insights
- `meas-len-choose-unit` = 14 items: 16 fixed objects each with one length (L107–124).
- `meas-mm-convert` T1 = 20: `n = 1..RULER_MAX_CM (10)` (`length-and-unit-generators.ts:92`).
  The ruler picture limits the *ruler* scene, not the conversion; a no-scene frame can use 1–10 cm
  ↔ 10–100 mm and stay ≤ 100.
- `meas-ruler-read` = 45: 5 nouns × 2–10 cm. Ruler length is the hard limit; more nouns and a
  start offset ≠ 0 (already used at T2) add variety without longer rulers.
- `meas-len-convert-far` = 40: few factor/number combos at L≤1; widen numbers to the D1 cap.
- `LEN_OBJECTS` = 4 for length add/sub stories.

## Requirements
- Functional
  - `OBJECTS` → ~40 objects, each with a **range** (e.g. pencil 12–18 cm, classroom 6–10 m,
    ant 2–5 mm), item draws `n` inside it; mm objects only at L2+ (unchanged rule).
  - `LONG_NOUNS` 5 → ~10 (things that fit a 10 cm ruler).
  - `meas-mm-convert` T1: add the "đổi" frame both ways (cm→mm and mm→cm) with 1–10 cm; T2/T3
    unchanged unless the meter shows < 60.
  - `meas-len-convert-far`: numbers spread to the D1 cap (≤ 1000 both sides).
  - `LEN_OBJECTS` 4 → ~10 (rope, ribbon, cloth, road, fence, wire, track, garden edge …).
  - Sweep test: every generated number ≤ 1000 for `meas-len-*`, ≤ 100 for ruler/mm, no m↔mm
    before L2, no decimals.
- Non-functional: files < 200 lines (move `OBJECTS` to `length-everyday-objects.ts`).

## Architecture
Unchanged flow; data lists grow and two generators draw from ranges instead of fixed values.

## Related code files
- Create: `src/measurement/length-everyday-objects.ts`
- Modify: `length-compare-order-generators.ts`, `length-and-unit-generators.ts`,
  `length-add-sub-generators.ts`, `length-ladder-generators.ts`, `measurement-distractors.ts`,
  `length-strings.ts` / `measurement-strings.ts`, `length-generators.test.ts`
- Delete: none

## Implementation Steps
1. Branch `muse-min/length-variety`. Before rows for every length id.
2. Objects with ranges + strings; choose-unit draws n in range.
3. mm-convert frame, convert-far spread, ruler nouns, `LEN_OBJECTS`.
4. Content-rule sweep (2000 draws × tiers × ladders) green.
5. After rows; e2e workshop/length specs; parity (likely `parity-change` for workshop shots
   that show a length item — name them).

## Todo list
- [ ] Before rows
- [ ] Objects with ranges
- [ ] mm-convert / convert-far / ruler / add-sub lists
- [ ] Content sweep
- [ ] After rows, e2e, parity, PR

## Success Criteria
- T2: every length id × tier ≥ 60 distinct (ruler-read ≥ 60 at T1 counting nouns).
- `meas-len-choose-unit` ≥ 100 distinct; sweep proves D1 and ≤100 rules hold.

## Risk Assessment
- Unrealistic lengths confuse the child (a 9 m pencil). Mitigation: author-checked ranges in one table.
- Bug-catalogue distractors assume fixed values. Mitigation: `length-bug-catalogue.test.ts` stays green.

## Security Considerations
- None.

## Next steps
- Phase 9 after-report.
