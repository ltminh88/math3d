# Phase 9: after-report + docs

## Context links
- Parent: [plan.md](plan.md)
- Depends on: Phases 3–8 merged
- Reuse: Phase 1 meter, `docs/code-standards.md`, `docs/project-changelog.md`, parity tooling

## Overview
- Date: 2026-11-27
- Description: re-run the meter with fresh draw on, compare to baseline and targets T1–T4,
  recapture parity for the `parity-change` phases, write the rules into the docs.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: reviewer
- Effort: 0.25d

## Key Insights
- Baseline json from Phase 1 makes the diff mechanical.
- The allow-list of curriculum-bound skills must name a reason per skill.

## Requirements
- Functional
  - `reports/repeat-after.md`: per target pass/fail, top-20 repeaters before vs after.
  - `docs/code-standards.md`: "item variety" rule — new generators need ≥ 2 forms and a meter row;
    `seen` is device-only like `bugs`; fresh draw must accept the first candidate when `seen` is empty.
  - Changelog entry; parity recapture after the content phases.
- Non-functional: docs only + baselines.

## Architecture
n/a.

## Related code files
- Modify: `docs/code-standards.md`, `docs/project-changelog.md`, parity baselines
- Create: `plans/261127-1620-question-variety-anti-repeat/reports/repeat-after.md`

## Implementation Steps
1. `REPEAT_REPORT=1` run with fresh draw; write after-report.
2. Missed targets → follow-up issues on #11 (not more scope here).
3. Parity recapture; docs; PR.

## Todo list
- [ ] After-report
- [ ] Follow-ups filed
- [ ] Parity recapture
- [ ] Docs + changelog, PR

## Success Criteria
- T1 met everywhere; T2–T4 met or each miss has a filed follow-up; parent can be told the numbers.

## Risk Assessment
- Targets too strict for curriculum-bound skills → allow-list with reasons, not padding with odd items.

## Security Considerations
- None.

## Next steps
- Ask the parent after a week of play whether runs feel different (qualitative check).
