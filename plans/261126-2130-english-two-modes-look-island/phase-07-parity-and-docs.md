# Phase 7: parity + docs

## Context links
- Parent: [plan.md](plan.md)
- Depends on: Phase 2, Phase 3 (parity); docs after Phases 4–6
- Pattern: parent [Phase 5](../261126-0700-english-island/phase-05-parity-and-docs.md)

## Overview
- Date: 2026-11-26
- Description: recapture the Mac parity baselines after each `parity-change` PR; update docs for
  the two modes, the Look island and the per-book pack.
- Priority: P2
- Implementation status: pending
- Owner: reviewer
- Effort: 0.25d

## Key Insights
- Shots that move: welcome (two buttons), new English-home shot (Phase 2), world/map near the two
  islets (Phase 3), sticker book (Phase 4). Golden traces must NOT change — any golden diff is a bug.
- Recapture per merged PR, not in one batch, so a later diff is attributable.

## Requirements
- Functional
  - Parity recapture after Phases 2, 3, 4 merge (`test(parity): recapture baselines after #n`).
  - Docs: `docs/code-standards.md` (English books, `EnglishBook` descriptor, shared English level
    scene, `playMode`, exit target, `en-look-*` append-only), `docs/project-changelog.md`,
    `docs/development-roadmap.md`, `docs/system-architecture.md` (two modes flow),
    `docs/deployment-guide.md` (per-book pack build, `--book` flags), `README.md` if scripts change.
  - Plan status: this plan + parent plan (Phase 6 note: book-aware).
- Non-functional: docs stay true to the merged code; no book text in docs.

## Architecture
- n/a (docs + baselines).

## Related code files
- Modify: parity baselines (Mac), `docs/*.md` above, `plans/261126-2130-english-two-modes-look-island/plan.md`
- Create / Delete: none

## Implementation Steps
1. After each parity PR merges: recapture, check diffs only cover the listed shots, push.
2. After Phases 4–6: update the docs listed above; changelog entry per phase.
3. Mark phases done in plan.md; note on #11.

## Todo list
- [ ] Parity after Phase 2
- [ ] Parity after Phase 3
- [ ] Parity after Phase 4
- [ ] Docs update
- [ ] Plan status + #11

## Success Criteria
- Parity suite green on main; golden `--check` unchanged.
- Docs describe both modes, Look island and per-book pack as shipped.

## Risk Assessment
- Unlisted shot changes hide a regression. Mitigation: compare against the PR's listed shots.

## Security Considerations
- Docs never name the passphrase or quote the book.

## Next steps
- Possible follow-ups (not planned): Look card in mode 1 home; per-child profiles.
