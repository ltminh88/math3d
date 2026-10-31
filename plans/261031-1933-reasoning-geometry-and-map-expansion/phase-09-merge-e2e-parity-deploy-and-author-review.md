# Phase 09: Merge, 9-stage e2e, parity re-baseline, real-input playthrough, deploy, author review

## Context links
- [plan.md](plan.md), phases [01](phase-01-skill-keys-reasoning-generators-and-save-code-m3d3.md)–[08](phase-08-puzzle-cave-level.md)
- Precedent: `plans/261024-1515-city-and-tower-levels/phase-04-merge-e2e-parity-and-author-review.md`; LAN QA report (commit 03f24d4)
- `docs/recovery-notes.md` (parity method), `docs/code-standards.md`

## Overview
- Date 2026-10-31. Priority P1. Status pending. Review: not started. Depends on 01–08.
- Integrate everything, prove the 9-stage chain on all projects, refresh parity once (attributed), play it for real on a production build on desktop, phone and tablet, deploy to Vercel, and get the author's sign-off.

## Key Insights
- Merge order: 01, 02, 03 (already on main), then 04, 05, 06, 07, 08 (`--no-ff`); conflicts expected only in e2e expectations (gate statuses, closing card).
- Parity diffs expected: quest card chapters, new gate signs, quiz reshuffle from extra world objects; goldens must stay byte-identical.
- Production build has no test hooks → real-input playthrough uses only taps/keys, seeded via save-code import (M3D3) to jump to each chapter.

## Requirements
- `tests/e2e/full-chain.spec.ts`: 9 stages (bridge → cave), gate status, quest card chapter/cells and map per stage on desktop, phone, tablet portrait, tablet landscape; "Sắp ra mắt" absent.
- Review pass (reviewer template) on 04–08 folders + 01/03 shared changes; fix findings; tag `chapter2-reviewed`.
- Parity: one attributed re-baseline; determinism double run (0 diffs); `generate-golden-traces.mjs --check` byte-identical.
- Real-input playthrough on `vite build` preview (no hooks): desktop keyboard + mouse; phone and tablet (portrait + landscape) touch only — Playwright with `tap()`, plus a manual pass on a real tablet/phone over LAN if available. Report + shots in `reports/chapter2-playthrough/`.
- Deploy: `vite build --outDir .preview/deploy` then `npx vercel@65.9.0 deploy .preview/deploy --prod --yes --project mathgame`; smoke the URL (boot, gate, one level round on phone + tablet emulation).
- Docs: `docs/code-standards.md` (levels list, new pure folders, skill keys, tablet projects), `docs/recovery-notes.md` (M3D3, expansion lists, parity re-baseline note), plan statuses; README only if scripts changed.
- Author review: screenshots from 05–08 + playthrough shots; LAN preview on port 4180 with the merged build and the current LAN IP; collect answers to plan.md "Decisions to confirm".

## Architecture
```
tests/e2e/full-chain.spec.ts (mod)  tests/parity/baselines/local/** (re-baseline)
plans/261031-1933-reasoning-geometry-and-map-expansion/reports/chapter2-playthrough/**
docs/code-standards.md  docs/recovery-notes.md (mod)
```

## Related code files
- Modify: e2e expectations, baselines, docs. Create: playthrough report. Delete: none.

## Implementation Steps
1. Merge 04–08 in order; run unit + lint + typecheck + build after each.
2. Fix cross-level expectations; extend full-chain e2e (RED first for the 9 stages); GREEN on 4 projects.
3. Review + fixes.
4. Parity re-baseline (same Mac), determinism run, golden check; commit with the attribution text.
5. Production build playthrough (desktop, phone, tablet portrait/landscape), touch-only on coarse pointers; log any keyboard-only step as a blocker.
6. Deploy to Vercel; smoke test.
7. Docs; tags `chapter2`, `chapter2-reviewed`; author review session.

## Todo list
- [ ] merge 04–08
- [ ] full-chain e2e 4 projects
- [ ] review + fixes
- [ ] parity re-baseline + golden
- [ ] production playthrough desktop/phone/tablet
- [ ] Vercel deploy + smoke
- [ ] docs + tags
- [ ] author review

## Success Criteria
- All gates green: lint, typecheck, unit, build, e2e on desktop, phone, tablet portrait, tablet landscape, parity 20/20 after re-baseline, golden byte-identical, every level ≤60 draw calls, leak specs green.
- Touch: playthrough completes all 9 stages on phone and tablet with taps only; targets ≥44 px; no key hints on coarse pointers; layouts verified at tablet portrait + landscape.
- Author approves look, difficulty tiers and chain order.

## Scope Contract
- Changed: merges, cross-level expectations, baselines, docs, deploy.
- Impacted: whole game.
- Will verify: full suites on all projects, parity, golden, production playthrough (release/deploy = safety-critical → full).
- Deliberately skipped: none.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Merge conflicts in shared expectations | M | L | Folder ownership; expectation-only conflicts |
| Tablet emulation misses real-device issues (Safari) | M | M | Manual LAN pass on a real tablet; note WebKit not covered |
| Parity flake on new animated DOM | M | L | Existing tolerance rules, explained in the commit |
| Author rejects difficulty | M | M | Ranges/tiers/rounds are data; one-line changes |
| Deploy uses wrong project/outDir | L | M | Exact command from the plan; smoke after deploy |

## Security Considerations
- Deploy only the built `.preview/deploy` folder; no `.env*` beyond the publishable key; confirm `dist/` has no test hooks (`__game`, `__garden`, …).

## Next steps
- Supabase sync (SQL fact-key check must include the `sk:` branch).
