# Project changelog

## 2026-11-09 — Chapter 2 follow-ups from the author review (tag `chapter2`)

### Added
- Signposts (`config/expansion-signposts.ts`, `world/expansion-signpost-builder.ts`): five wooden posts at the bridge junctions and along the west-bank cave road; arrow boards name each chapter-2 place and point within 30° of it. A floating "Hang Đố Vui · Đi theo biển chỉ đường" label over the west junction (locked look until the bridge quest). +1 draw call (one merged text mesh).

### Changed
- Word problems rewritten in natural language for 7–9-year-olds; kept in practice mode too.
- Misses count per step in the garden, valley, cave, the shared reasoning round, the tower (family and true/false floors) and the forest fact-family card (`levels/shared/step-miss-budget.ts`). The city has only single-step rounds and is unchanged.
- Valley board uses a top-down camera so angles never look skewed.
- True/false "times"/"more than" statements now show the reasoning ("Vì 75 : 25 = 3 nên …") instead of "75 gấp 3 lần 25".
- HUD: logo and VLM label hit areas ≥44 px on phones; player name on one line on phones and tablet portrait (HUD column 300 px at 701–1100 px).

### Fixed
- A tab left open across a deploy could not enter a level ("Chưa mở được màn chơi"): its hashed level chunk was gone. A failed dynamic import now reloads onto the new build once per minute (`core/stale-build-reload.ts`, e2e `stale-build-reload.spec.ts`).

### Testing
- Parity re-baselined (attributed in `parity-rebaseline-chapter2.md`), 20/20; golden byte-identical; unit 720/720; e2e on 4 Playwright projects.
- Deployed to https://math3d-game.vercel.app (dpl_5pZwDPaCiBhFc8UwB8J1B5EV2eZX), smoke test on desktop, Pixel 7 and iPad Pro 11 with 0 errors.

## 2026-11-02 — Chapter 2: reasoning, geometry, measurement, map expansion (tag `chapter2-reviewed`)

Plan: `plans/261031-1933-reasoning-geometry-and-map-expansion/`. Content follows SGK Toán 3 Kết nối tri thức; every number a child sees is ≤100.

### Added
- Skill keys `sk:<id>` from an append-only catalog of 39 skills (`learning/skill-catalog.ts`); tiers from the Leitner box (1–2 → 1, 3–4 → 2, 5 → 3).
- Pure seeded generators: `reasoning/` (two-step word problems, remainders, unknowns, patterns, expressions with brackets, choose-all, true/false + fix), `geometry/` (right angles, midpoint, circle parts, shapes, solids) and `measurement/` (ruler, balance, jug, thermometer, perimeter, area in cm²; cm↔mm only).
- Save code `M3D3` (adds skill stats and the four chapter-2 levels); `M3D1`/`M3D2` decode unchanged.
- Step kit in `ui/kit/` (step card, multi-select, Đúng/Sai buttons; tap-only, ≥44 px).
- Map: three new regions (Thung Lũng Hình Học, Xưởng Đo Đạc, Hang Đố Vui) plus a garden gate, added after the scatter; quest card in two chapters with "Chương n · k/m".
- Levels: garden, valley, workshop, cave; the chain is now 9 stages ending on "Bạn đã qua cả chín chặng!".
- Reasoning rounds in the bridge quiz (word problem every 5th question once a table is mastered) and as the last round of field, forest, city and tower (only after mastery).
- Playwright projects `tablet-portrait` and `tablet-landscape`; the full-chain e2e walks all 9 stages on all four projects.

### Fixed
- Touch: no key hints on coarse pointers (map, book help, field, tower, quiz badges); 44 px leave button in every level; quest cell names no longer clipped on tablets.
- Review (`reports/reviewer-chapter2.md`, table in phase 09): H1 tier-1 reasoning hints no longer give the step answer; H2 the reasoning-round number pad is freed when a level closes; M3 cave hint resets per step; M4 KNTT "two radii" wording; M5 valley tier-3 midpoint not pre-solved; M6 workshop tile grid fits phones; M7 quiz word-problem rung 3 shows the operation with "?".

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
