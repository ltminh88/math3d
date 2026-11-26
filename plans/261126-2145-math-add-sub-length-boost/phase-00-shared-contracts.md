# Phase 0: shared contracts

## Context links
- Parent: [plan.md](plan.md)
- Depends on: none
- Research: [codebase map](research/researcher-01-codebase-add-sub-length-report.md) §1–3,
  [pedagogy](research/researcher-02-pedagogy-add-sub-length-report.md) §1
- Docs: `docs/code-standards.md` (content rules, append-only catalog), `AGENTS.md`

## Overview
- Date: 2026-11-26
- Description: bug ids, device-only bug + recent-outcome tracking, ladder tier function, bug
  explanation registry, length entries hook, content-rule update. No visible UI change.
- Priority: P1 (blocks every other phase)
- Implementation status: pending
- Review status: not reviewed
- Owner: Lane A, muse-88
- Effort: 0.5d

## Key Insights
- `ChoiceOption.misconception` already exists (`reasoning-types.ts:16-45`, incl. `ignore-unit`,
  `read-end-not-length`); append new ids, never rename.
- `FactStat.errs` holds wrong values (numbers), device-only for skills
  (`save-code-v3-skills.ts:3`). Bugs follow the same rule: device-only, no new save version.
- Tier today = box (`skill-tiers.ts`): 1-2→T1, 3-4→T2, 5→T3. Leitner already demotes on wrong
  (box−1). The ladder only adds a recent-window check on top.
- Shared files are edited once here so the two lanes never touch them again.

## Requirements
- Functional
  - Append to `Misconception`: add/sub `forgot-carry`, `carry-not-added`, `smaller-from-larger`,
    `borrow-no-decrement`, `zero-borrow-skip`, `zero-minus-n-zero`, `misaligned-columns`,
    `second-regroup-dropped`; length `unit-direction`, `unit-factor`, `dm-skipped`,
    `mixed-concat`, `mixed-drop-big` (reuse `ignore-unit`).
  - `FactStat.bugs?: Misconception[]` (last 5) and `recent?: number` (bitmask, last 10 first
    tries); `Attempt.bug?`; `leitner-box` keeps both; save code skips them (like `errs`).
  - `ladder-tier.ts`: `ladderTierOf(stat): 0..5` — base `box − 1`; +1 when ≥ 8 of last 10
    correct and box 5 (T5); −1 when the last 3 were wrong; clamp 0..5. `ladderToSkillTier()`
    maps 0-1→1, 2-3→2, 4-5→3 for old generators.
  - `wrong-answer-explanation.ts`: `registerBugExplainer(bug, fn)`; router checks the item's
    chosen-option bug first, then falls back to today's routing.
  - Choice/verdict answer path in the step kit + daily/lesson runners passes the chosen option's
    `misconception` as `Attempt.bug`.
  - `src/measurement/length-skill-entries.ts` (empty array) wired once into `skill-catalog.ts`.
  - `docs/code-standards.md` content rule updated to the D1 answer (if D1 is still open, merge
    without this line; 1B adds it after the decision).
- Non-functional: pure logic, Vitest node, files < 200 lines, golden byte-identical.

## Architecture
- Item → step answer (kit) → `learning.record({…, bug})` → `leitner-box` appends `bugs`,
  shifts `recent` → `ladderTierOf` feeds generators (1A/1B) and weak score (4A).

## Related code files
- Modify: `src/reasoning/reasoning-types.ts`, `src/learning/learning-types.ts`,
  `src/learning/leitner-box.ts`, `src/learning/session-recorder.ts`,
  `src/practice/wrong-answer-explanation.ts`, `src/learning/skill-catalog.ts`,
  the step-kit choice/verdict answer handler in `src/ui/kit/`, `src/ui/daily-skill-item.ts`,
  `src/ui/lesson-practice.ts`, `docs/code-standards.md`
- Create: `src/learning/ladder-tier.ts` (+ test), `src/measurement/length-skill-entries.ts`
- Delete: none

## Implementation Steps
1. Claim on #11; branch `muse/add-sub-length-contracts` from latest main.
2. Append Misconception ids; add `bugs`/`recent` to `FactStat`, `bug` to `Attempt`.
3. Update `leitner-box` (keep last 5 bugs, shift `recent`); tests incl. old stats without fields.
4. Save-code round-trip test: new fields are dropped, decode of M3D2–M3D5 fixtures unchanged.
5. Write `ladder-tier.ts` + table tests (box 1..5 × recent patterns).
6. Bug explainer registry + router fallback test (no bug → today's output byte-equal).
7. Pass the chosen option's bug through the kit, daily and lesson runners.
8. Length entries hook; content rule per D1. Gates; PR (no `parity-change`).

## Todo list
- [ ] Misconception ids appended
- [ ] `bugs` / `recent` / `Attempt.bug` + leitner tests
- [ ] Save-code round-trip unchanged
- [ ] `ladder-tier.ts` + tests
- [ ] Bug explainer registry
- [ ] Bug passed from kit/daily/lesson
- [ ] Length entries hook, code-standards line
- [ ] Gates green, PR

## Success Criteria
- Old saves load and export byte-identical; golden `--check` passes; no parity shot changes.
- A wrong choice in daily practice stores its bug in `factStats[sk:…].bugs`.

## Risk Assessment
- Many levels record wrong answers themselves (`*-round-flow.ts`). Mitigation: only the kit and
  daily/lesson runners pass `bug` now; levels gain it when their lane touches them (3A, 3B).
- IndexedDB stat shape grows. Mitigation: fields optional, readers default to empty.

## Security Considerations
- None (local data, no network).

## Next steps
- Unblocks 1A, 1B, 2B, 4A.
