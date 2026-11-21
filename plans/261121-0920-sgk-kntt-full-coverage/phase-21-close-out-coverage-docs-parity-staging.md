# Phase 21: Close-out — strict coverage, docs, full e2e, parity, staging, author review

## Context links
- [plan.md](plan.md), `src/learning/lesson-coverage.test.ts` (phase 02), `docs/code-standards.md`, `docs/project-changelog.md`

## Overview
P1. Effort 6h. Lane reviewer (Claude). Deps all.

## Key Insights
Escape hatch in the coverage test is removed: every practicable lesson 1–81 must have ≥1 skill with generator *and* dialog renderer.

## Requirements
- Strict coverage test; lesson table spot-check against TOC by author.
- Docs: code-standards (families, scenes, lesson mode, M3D5), changelog, roadmap.
- Full gates: lint, typecheck, test, build, golden `--check`, e2e 4 projects × shards, parity run + any baseline recapture.
- Staging preview; author plays on iPad: "Học tiếp" walks B1→B81.

## Architecture
No new code beyond test hatch removal and doc edits.

## Related code files
Ownership: `src/learning/lesson-coverage.test.ts`, `docs/**`, parity baselines, `.github/workflows/**` if needed.

## Implementation Steps
Remove hatch → fix gaps → docs → full gates → staging → author sign-off → production.

## Todo list
- [ ] strict coverage green
- [ ] docs
- [ ] full e2e + parity
- [ ] staging + author review

## Success Criteria
Every practicable lesson playable in order; author confirms.

## Risk Assessment
| Risk | Countermove |
|---|---|
| A lesson without content discovered late | coverage test lists missing lessons by number |

## Security Considerations
Grep repo for textbook-scan artefacts (pdf/png from math3-sgk) before release.

## Next steps
Later: drag clock hands, column-input arithmetic, coins (if Q2/Q5 say so).
