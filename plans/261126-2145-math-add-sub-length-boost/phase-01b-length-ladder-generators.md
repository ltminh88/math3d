# Phase 1B: length ladder generators (m, dm, cm, mm)

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 0](phase-00-shared-contracts.md); author decision D1 (blocking)
- Research: [codebase](research/researcher-01-codebase-add-sub-length-report.md) §1 (length),
  [pedagogy](research/researcher-02-pedagogy-add-sub-length-report.md) §1–4
- Reuse: `src/measurement/length-and-unit-generators.ts` (124), `measurement-distractors.ts`,
  `measurement-ranges.ts`, `measurement-strings.ts` (156)

## Overview
- Date: 2026-11-26
- Description: new `meas-len-*` skills over the ladder L0–L5 (unit sense → adjacent → far →
  compare/order → mixed units → add/sub of lengths), bug-tagged distractors and per-bug explanations.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane B, muse-min
- Effort: 1.5d

## Key Insights
- Only cm↔mm exists today; no `dm` string anywhere. Old ids keep their rules (≤100).
- KNTT frame: m, dm are grade-2 content reviewed in Toán 3 T1 B7; mm in T1 B30 (1 cm = 10 mm,
  1 m = 1000 mm). New ids carry `lessons: [T1 B7, T1 B30]` as fits each id.
- Whole numbers only, no decimals ("0,03" is a bug, never an option shown as an answer).
- Mixed units hide internal zeros: 1 m 5 cm = 105 cm is the classic trap (`mixed-concat` → 15/150).

## Requirements
- Functional (rules per D1 recommended answer; adjust if the author decides otherwise)
  - Ids (append via `length-skill-entries.ts`): `meas-len-ladder` (fill one ladder step, ×10/÷10),
    `meas-len-convert` (adjacent units), `meas-len-convert-far` (m↔cm, dm↔mm, m↔mm),
    `meas-len-compare` (< = > across units), `meas-len-order` (smallest→largest; `order` step
    from 2B, choice fallback until it lands), `meas-len-choose-unit` (object → m/dm/cm/mm),
    `meas-len-mixed` (1 m 5 cm ↔ 105 cm both ways), `meas-len-add-sub` (same/mixed units + word problems).
  - Ladder L0–L5 from `ladderTierOf`; L2+ only allows m↔mm; numbers ≤ 1000.
  - `length-bug-catalogue.ts`: wrong value per bug (`unit-direction`, `unit-factor`,
    `dm-skipped`, `mixed-concat`, `mixed-drop-big`, `ignore-unit`); choices tagged.
  - `meas-ruler-read` T3: answer "6 cm 4 mm" as two number steps (cm then mm) — same id.
  - `wrong-answer-length.ts`: per-bug explanation via the ladder picture in words
    ("1 m = 10 dm = 100 cm"), registered with Phase 0's registry; also covers `meas-mm-convert`
    and `meas-ruler-read` (no explainer today).
  - Object list for choose-the-unit: own everyday objects (bút chì, bàn học, cửa, con kiến…).
- Non-functional: pure, seeded, < 200 lines per file, strings vi + en, "bạn".

## Architecture
- `length-skill-entries.ts` → `length-item-for-skill.ts` (wired in `practice/item-for-skill.ts`
  measurement branch) → generators → items with optional `length-ladder` scene (drawn in 2B;
  item stays valid without the renderer by omitting the scene until 2B merges).

## Related code files
- Create: `src/measurement/length-ladder-generators.ts`, `length-compare-order-generators.ts`,
  `length-mixed-unit-generators.ts`, `length-bug-catalogue.ts`, `length-units.ts`
  (factor table, formatting "1 m 5 cm"), `length-item-for-skill.ts`, `length-strings.ts`,
  `src/practice/wrong-answer-length.ts` (+ tests for each)
- Modify: `length-skill-entries.ts`, `measurement-ranges.ts` (new `LENGTH_LADDER_MAX = 1000`),
  `length-and-unit-generators.ts` (ruler T3 two steps), the measurement dispatch in
  `practice/item-for-skill.ts` (one line), `docs/code-standards.md` if Phase 0 left it open
- Delete: none

## Implementation Steps
1. Read D1 answer in plan.md; branch `muse-min/length-ladder`.
2. `length-units.ts` + bug catalogue with table tests (3 m→300 cm, 4 m→40 dm, 1 m 5 cm→105 cm).
3. Generators per id and per ladder level; property tests: answers ≤ 1000, whole, distinct options.
4. Ruler T3 two-step answer.
5. Explanations + registry; hint rung ≥ 2 never shows the answer.
6. Entries + dispatcher; lesson-coverage test passes for B7/B30.
7. E2E: each new id via lesson run by `tap()`. Gates; PR.

## Todo list
- [ ] Units + bug catalogue
- [ ] 8 generators over L0–L5
- [ ] Ruler cm + mm
- [ ] Explanations
- [ ] Entries + dispatcher + lesson refs
- [ ] E2E, gates green, PR

## Success Criteria
- All new ids generate valid items over 1 000 seeds; every wrong option's bug matches its value.
- Lesson runs for B7 and B30 include the new ids.

## Risk Assessment
- D1 answered "keep ≤100, no m↔mm". Mitigation: drop `meas-len-convert-far` m↔mm cases and cap at
  100; ids stay (append-only), content shrinks.
- B7 is a `mix` lesson with `mixOf: []`; mapping new ids there may change B7 behaviour.
  Mitigation: check `kntt-lesson-index` coverage tests; if needed map to B30 only.

## Security Considerations
- None.

## Next steps
- 2B scenes/steps, 3B workshop, 5B diagnostic.
