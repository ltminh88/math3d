# Phase 5: parity baselines and docs

## Context links
- Parent: [plan.md](plan.md)
- Depends on: [Phase 1A](phase-01a-island-region-level-shell.md), [Phase 1B](phase-01b-exercise-engine-and-ui.md); docs part also after [Phase 4](phase-04-book-pack-function-deploy.md)
- Docs: `docs/code-standards.md`, `docs/deployment-guide.md`, `docs/project-changelog.md`, `AGENTS.md`

## Overview
- Date: 2026-11-26
- Description: recapture parity baselines after the UI phases merge; document the `english/`
  layer, the content and audio rules, the pack step and env var.
- Priority: P2
- Implementation status: pending
- Review status: n/a (reviewer-owned)
- Owner: reviewer
- Effort: 0.25d

## Key Insights
- Muses never change parity baselines (AGENTS.md); the reviewer recaptures after each
  `parity-change` PR merges.
- The deploy guide must carry the pack step, or the next deploy silently ships without the
  function.

## Requirements
- Functional
  - `npm run parity:baselines` after 1A and 1B merge (and again if 3B or 6 change shots).
  - `docs/code-standards.md`: `english/` layer, own-content-only rule, audio-clip rule, English
    words never through `t()`.
  - `docs/deployment-guide.md`: overlap check, emit step, `ENGLISH_PACK_PASSPHRASE`, curl checks,
    BOA fallback.
  - `docs/project-changelog.md`: one entry per merged phase.
- Non-functional: docs quote no book content.

## Architecture
- No code. Docs mirror what merged; parity baselines follow `AGENTS.md`.

## Related code files
- Modify: `docs/code-standards.md`, `docs/deployment-guide.md`, `docs/project-changelog.md`,
  parity baseline files (via the script)
- Create / delete: none

## Implementation Steps
1. After 1A and 1B merge: run `npm run parity:baselines`; commit the recapture.
2. Update `docs/code-standards.md` (layering + content/audio rules).
3. After Phase 4: update `docs/deployment-guide.md` with the pack steps and env var.
4. Add changelog entries.
5. Open a docs PR; gates green.

## Todo list
- [ ] Parity recapture after 1A + 1B
- [ ] Code standards updated
- [ ] Deployment guide updated
- [ ] Changelog entries

## Success Criteria
- Parity suite green on main after recapture.
- A reader can deploy with the pack from the guide alone.

## Risk Assessment
- Recapturing over a real regression. Mitigation: compare against the PR's listed shots first.

## Security Considerations
- Guide names the env var, never its value.

## Next steps
- None; closes the plan with Phase 6.
