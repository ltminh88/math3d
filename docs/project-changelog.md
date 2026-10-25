# Project changelog

## 2026-10-26 — QA fixes (tag `qa-fixes`)

Fixes for the full QA playthrough (`plans/261024-1515-city-and-tower-levels/reports/qa-full-playthrough.md`),
merged from `fix/app-shell-qa` and `fix/level-qa-fixes`.

### Major
| ID | Fix | Commit |
|---|---|---|
| M-1 | Field: a plot turn still running when the next round starts is dropped, so the plot always matches its prompt. | a13768c |
| M-2 | Save codes: export writes `M3D2` (levels, owned/equipped cosmetics, full fact stats, session count); `M3D1` still decodes. | 431c475 |
| M-3 | Field: the sun's shadow map is disposed on exit (+2 textures per visit before). | 36e84c6 |
| M-4 | E2E: the mobile field leak failure was the world camera settling, not a leak; field/city/tower leak specs share a settled baseline (`tests/e2e/settled-renderer-memory.ts`) and check textures. | 36e84c6 |
| M-5 | Field on phones: the camera frames the plot in the free canvas area (Pixel 7 planting pitch 24 → 58 px). | 0c4032e |
| M-6 | City on phones: framing excludes VLM's line, so a 10-floor building's top floor stays visible. | 150437b |
| M-7 | City in short landscape: compact scrollable panel on the right, street on the left. | 150437b, 74e5b3c |

### Minor
- m-1 field tips no longer offer R while planting; m-2 the pad clears on reveal (a13768c).
- m-3 forest runs vary their facts; "Gần đúng rồi" only for answers one away (7110088).
- m-4 tower hint button is spent after the last rung (ed74e42).
- m-5 tower/city rung-4 hints start from ×2 or ×5; ×10 only near 10 (466084c).
- m-9 English title, subtitle, sound label translated; the division level is "Sharing Forest" (8f225f6).
- m-10 Tab out of the page no longer opens Settings (cd9dbfc).
- m-11 phone one-time growth: same cause as M-4 (36e84c6).
- m-12 celebrations show the first-clear bonus on all four levels, via `LevelContext.firstCompletion` (bb051b3, 85715ee, a13768c).

### Polish
- p-5 square plots get their own praise and hint (a13768c); p-6 44 px touch hit areas for the top bar and quest toggle (6710b03); p-7 the quest card names the E key only on fine pointers (fad772e); p-8 field exposes `data-max-draw-calls` (36e84c6).

### Not addressed
- m-6 (stuck at the river), m-7 (respawn at village start), m-8 (mid-level rewards, product decision), p-1–p-4, p-9.

### Parity
- Local baselines re-baselined for the English strings, the mobile quest card and the touch hit-area CSS; see `plans/261024-1515-city-and-tower-levels/reports/parity-rebaseline-qa-fixes.md`.
