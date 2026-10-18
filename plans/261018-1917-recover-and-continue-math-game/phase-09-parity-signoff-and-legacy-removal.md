# Phase 09: Parity sign-off, legacy removal, strict TS, self-hosted fonts

## Context links
- [plan.md](plan.md) · [research 02 §3 D manual play](research/researcher-02-recovery-tooling-and-parity.md) · phases 02-08
- Depends on: 06, 07, 08. Serial (G3), may touch any file.

## Overview
- Date: 2026-10-18
- Description: Close Part A on r180: remove `src/legacy/**` and recovery-only scaffolding from the runtime path, enable strict TS on all recovered modules, switch Google Fonts to self-hosted fontsource (offline PWA), run full parity + manual playthrough, freeze local baselines for CI.
- Priority: P1
- Implementation status: pending
- Review status: not reviewed

## Key Insights
- Live baselines are machine-specific (SwiftShader). After sign-off, generate LOCAL baselines from the recovered build (`tests/parity/baselines/local/`) so CI can run parity against the repo itself; live baselines stay as archived oracle.
- Fonts: fontsource Baloo 2 600/700/800 + Nunito 500/600/700/800/900 (latin + vietnamese). Glyph files may differ in version from Google -> expect tiny DOM text diffs; accept only if <= 0.002 per DOM shot, else keep Google link and record as open item.
- `noUncheckedIndexedAccess` will flag recovered array indexing; fix with explicit guards only where it doesn't change behavior (non-null assertions acceptable where original assumed presence).

## Requirements
- No `src/legacy/**`, no shims, no `.js` app files left; Biome/tsc cover all `src/**`.
- Full parity suite green vs live baselines; manual playthrough checklist (desktop Chrome + iPad Safari): new game, avatar, quest, 6 correct answers, wrong answer hints, bridge built, cross, complete, book, settings, reset, EN toggle, reload keeps progress, old save from live site (copied localStorage) loads identically.
- CI job `parity` (local baselines) added to `.github/workflows/ci.yml`.

## Architecture
```
src/styles/fonts.css                  fontsource weights above (index.html Google link removed)
tests/parity/baselines/local/**       regenerated from recovered build
.github/workflows/ci.yml              + parity job (SwiftShader, Playwright 1.64.1)
docs/recovery-notes.md                id map, quirks kept, how to re-run parity (short)
```

## Related code files
- Create: local baselines, `docs/recovery-notes.md`. Modify: `src/styles/fonts.css`, `index.html`, `tsconfig.json`/`biome.json` (drop legacy excludes), `.github/workflows/ci.yml`, recovered modules for strict fixes. Delete: `src/legacy/**`, `src/legacy/_unminified.js`.

## Implementation Steps
1. Delete legacy folder; fix imports; typecheck strict; lint.
2. Fonts switch; DOM parity check; decide per Key Insights.
3. Full parity vs live (both projects); manual checklist incl. real old-save import (export localStorage from live in browser devtools -> paste in local).
4. Generate local baselines; add CI parity job.
5. Recovery notes doc. Commit + tag `recovered-r180`.

## Todo list
- [ ] legacy removed, strict TS + lint green
- [ ] self-hosted fonts (+ DOM parity)
- [ ] full parity vs live
- [ ] manual playthrough checklist (desktop + iPad)
- [ ] local baselines + CI parity job
- [ ] recovery notes

## Success Criteria
- `npm run lint && npm run typecheck && npm test && npm run build && npm run test:parity` exit 0.
- `find src/legacy` -> not found; `grep -r "fonts.googleapis" index.html src` -> nothing (or recorded exception).
- Checklist signed by user (author) in this phase file.

## Scope Contract
- Changed: build config, fonts, CI. Impacted: whole app. CI change = safety-critical -> full suites (lint, typecheck, unit, e2e, parity) run.
- Skipped: none.

## Risk Assessment
| Risk | L | I | Countermove |
|---|---|---|---|
| Strict-mode fixes alter behavior | M | M | fixes only add guards; parity rerun after |
| Font glyph drift | M | L | threshold rule above; fallback to Google link |
| CI SwiftShader differs from Mac baselines | H | M | CI uses baselines generated in CI container (first run uploads artifact, committed) |
Rollback: tag `recovery-p08` keeps legacy-free state minus strict/fonts; revert individually.

## Security Considerations
- Removing Google Fonts drops third-party request (better privacy, simpler CSP in 18).

## Next steps
- 10 bump three; 11 retire old engine; Part B starts at 12.
