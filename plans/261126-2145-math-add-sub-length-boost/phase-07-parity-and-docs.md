# Phase 7: parity and docs (reviewer)

## Context links
- Parent: [plan.md](plan.md)
- Depends on: every UI phase (2A, 2B, 3A, 3B, 5B, 6B) as each merges
- Docs: `docs/code-standards.md`, `docs/project-changelog.md`, `AGENTS.md`

## Overview
- Date: 2026-11-26
- Description: recapture parity baselines after each `parity-change` merge; update docs
  (content rule, step kinds, focus weighting, diagnostic) and the changelog.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed
- Owner: reviewer
- Effort: 0.25d

## Key Insights
- Parity is recaptured on the Mac after merge, per PR, so later PRs diff against fresh shots.
- Docs must state the D1 decision exactly (units, number cap, which ids).

## Requirements
- Functional
  - Recapture after 2A, 2B, 3A, 3B, 5B, 6B (whichever change shots).
  - `code-standards.md`: content rule (D1), step kinds `order` / `match`, daily focus mix
    (6/3/1), bug tracking is device-only, diagnostic cadence.
  - Changelog entries per merged phase; plan status updated.
- Non-functional: golden traces stay byte-identical (no `REGIONS`/`ROADS` change in this plan).

## Architecture
- n/a (process phase).

## Related code files
- Modify: `docs/code-standards.md`, `docs/project-changelog.md`, parity baselines, this plan's `plan.md`
- Create / Delete: none

## Implementation Steps
1. After each UI merge: recapture, commit baselines, note it on #11.
2. After 4A: docs for focus weighting; after 5B: diagnostic.
3. Final: changelog, plan status → done.

## Todo list
- [ ] Parity after each UI merge
- [ ] Code-standards updates
- [ ] Changelog
- [ ] Plan status

## Success Criteria
- Docs match the code; parity green on main after every merge.

## Risk Assessment
- Two UI PRs merge close together. Mitigation: recapture in merge order, one at a time.

## Security Considerations
- None.

## Next steps
- Deploy only on the author's "deploy đi".
