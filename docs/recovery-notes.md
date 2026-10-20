# Recovery notes (math3d, ex "Math AI Game 3D – Vương Quốc Cửu Chương")

The source of the original game (https://math.aigame3d.com) was lost. Only the production
bundle survived. This repo rebuilt it as typed, modular TypeScript on three r180 with
pixel/behavior parity to the live site, then renamed it to **math3d** (guide NPC Milo → **VLM**).
Plan: `plans/261018-1917-recover-and-continue-math-game/` (phases 01-09).

## What was recovered

| Input (committed) | Output |
|---|---|
| `recovered/original/` – prod `index.html`, `index-CO4MPNqj.js`, `index-D1ngBGok.css`, favicon | reference oracle, served locally by the parity tools |
| `recovered/formatted/game-app-section.js` (≈2.5k lines app code) + `three-section.js` (vendored three r180) | `src/config`, `src/save`, `src/game`, `src/quiz`, `src/audio`, `src/i18n/legacy-*`, `src/world`, `src/map`, `src/ui`, `src/webmcp` |
| `recovered/formatted/game-styles.css` | `src/styles/game/NN-*.css` (byte-identical split, `npm run recover:styles:check`) |

`src/legacy/**` (the intermediate unminified chunks and shims) is gone since f3931c9; the app
imports the typed modules directly. Since phase 12 progress lives in IndexedDB (`math3d`) and
settings in `math3d.settings`; the original keys (`aigame3d_*`, save format v1) are only read
once to migrate and are never written again (see "Progress storage and save codes" below).

## Tooling pipeline (`tools/recovery/`)

1. `strip-three.ts` + `strip-three-id-map.ts` – replace the minified vendored three with named
   imports from npm `three@0.180.0`; every minified id is verified by a marker string.
2. `unminify-app.sh` (`npm run recover:legacy`) – wakaru `--level minimal` (syntax only, keeps
   identifiers), Biome format, `split-legacy-chunks.ts` by inventory line ranges.
3. `apply-rename-map.ts` – reviewed rename maps applied with ts-morph's scope-safe rename
   (never text/regex renames). Then modules were moved to TS one group at a time (phases 03-08),
   each swap gated by the parity suite.
4. `split-legacy-styles.ts` – CSS split with a sha256 concat check.
5. `golden/` – runs the ORIGINAL pure functions (save parse, quiz picker, hints, xp, i18n corpus,
   map hit test, …) and writes `tests/parity/golden/*.json`;
   `node tools/recovery/golden/generate-golden-traces.mjs --check` must stay byte-identical.
   Vitest asserts the recovered modules equal these traces (rename applied to expected strings).

## Parity method

- `tools/recovery/capture-live-baselines.mjs` drives seeded, clock-controlled scenarios
  (`tests/parity/scenarios/parity-scenarios.ts`, 10 scenarios × projects `desktop-chromium`
  1280×720 and `mobile-pixel` 412×839, dpr 1) in Chromium with SwiftShader WebGL.
- Determinism: `capture-parity-hooks.js` (mulberry32 `Math.random`, silent AudioContext that
  records synth calls, GL draw-call counters, localStorage write log) and
  `capture-parity-virtual-clock.js` (virtual `performance.now`/`Date`/timers/rAF, CSS animations
  seeked to virtual time; frames advance only via `__parityStep`).
- Per shot: canvas PNG, DOM-overlay PNG, shot JSON (DOM html, computed-style hash, storage, GL
  calls/triangles), per-scenario trace JSON, scene-graph dumps (`window.__parity`, test-mode build).
- Gates (`capture-baseline-compare.mjs`): canvas PNG + all JSON exact; DOM PNGs exact except the
  shots listed in `tests/parity/parity-shot-tolerances.json` (measured raster noise; noisy shots
  pass only when their shot JSON is byte-exact).
- Fonts: the harness serves any Google Fonts request from `tools/recovery/fonts-snapshot/`
  (pinned CSS + woff2), then waits for the used faces. Since the self-hosted switch the app makes
  no Google request; the route stays for the archived live/oracle runs.
- Baselines are machine-specific (Mac + Chromium 156 SwiftShader). Never compare across machines.

### Baseline sets

| Set | Source | Use |
|---|---|---|
| `tests/parity/baselines/live/**` + `oracle-scene/**` | live site / original bundle, 2026-10-19 | archived proof of the recovered-r180 parity; `npm run test:parity:live` is valid only at tag `recovered-r180` |
| `tests/parity/baselines/local/**` | renamed, self-hosted-font build on three r186 with the retuned lighting (`npm run parity:baselines`, phase 10) | current gate: `npm run test:parity` |

After the rename, `walk-to-bridge` and `tap-to-milo` wait 40 frames (was 30) after Play so
their first shot lands after the 600 ms area-badge `arrive` keyframe: its start frame raced by
one frame run to run (transform scale 1.00113 vs 1 on `#area-label`).

Regenerate local baselines only for an intended visual change, on the same Mac, and say why in
the commit. Check determinism after regenerating:
`node tools/recovery/capture-live-baselines.mjs --origin local` (twice, must be 0 diffs).

CI (`.github/workflows/ci.yml`, job `parity`) does not use the committed baselines: on one
runner it renders the base commit and the head commit (`mobile-pixel`, 3 scenario shards) with
the head tooling and requires them to be equal. PR label `parity-change` skips it.

## Tags

| Tag | Commit | Meaning |
|---|---|---|
| `recovery-p03` … `recovery-p08` | per phase | module groups recovered (rollback points) |
| `recovered-r180` | 1291325 | full recovery, original names, author-signed parity vs live |
| `renamed-math3d` | end of phase 09 | rename + self-hosted fonts + local baselines + CI parity |
| `recovery-p10` | end of phase 10 | three 0.186.1, Clock->Timer, PCFShadowMap, lighting retuned to the r180 look (author-approved), local baselines regenerated |

## Preserved quirks (kept for parity, fix only knowingly in phase 12+)

- Fixed in phase 12: the original reload kept only the first 30 `questionStats` entries and 30
  review ids. `parseSave` still does that by default (golden-exact, "legacy v1 compatibility"
  tests); migration and save codes read with `{ cap: false }`. Version ≠ 1 still means defaults.
- Losing window focus while playing opens the settings dialog (`keyboard-joystick.ts`,
  `settings-dialog.ts`).
- The forest region never counts in the scatter exclusion test (`world-scatter-exclusion.ts`).
- Mountains near the river axis are skipped after their random draws, so the RNG order still
  consumes them (`sky-decor-clouds-mountains.ts`). Never reorder `Math.random` calls in world code.
  three itself draws 4 `Math.random` per object UUID, so a three bump that creates extra objects
  shifts the seeded parity stream (r186: the first playthrough quiz question changed).
- Map screen layer inherits the fill style of the previous draw (`map-render-screen-layer.ts`).
- VI→EN DOM translator: plain-object table looked up through the prototype chain; the three
  "viên đá" patterns never match because an earlier rule already rewrote them
  (`legacy-translator.ts`, `legacy-translations-en.ts`).
- World text signs need Baloo 2 loaded before the world is built (`world-text-sign.ts`).
- Reset calls `setBridge(0)` without clearing bridge obstacles; `onFrame` UI work runs every 2nd
  frame (see `research/researcher-01-recovered-code-inventory.md`).

## Rename and fonts (phase 09, after sign-off)

- Rename: i18n strings (vi + EN translator table), `<title>`/meta, PWA manifest, favicon title,
  `src/ui/milo-dialog.ts` → `guide-dialog.ts`. Internal ids (`milo` world field, DOM ids, CSS
  classes, storage keys, scenario names such as `tap-to-milo`) are unchanged on purpose.
- Fonts: Google Fonts `<link>` replaced by `src/styles/fonts.css` (fontsource 5.3.0 woff2,
  latin + vietnamese, same weights as the old Google request: Baloo 2 600/700/800, Nunito
  500-900, so unweighted text still resolves to Nunito 500). Glyph outlines differ slightly from
  Google's build (DOM text raster shifts by a few pixels); canvas and layout JSON are unaffected.

## Progress storage and save codes (phase 12)

- Store: `src/store/**` (IndexedDB `math3d`, memory fallback when IndexedDB is unavailable, with
  a toast). Boot builds the shell and world and hides the loading card synchronously as before,
  then `src/ui/store-boot.ts` opens the store, imports the legacy save once and re-renders
  world + HUD (a few ms later). `<html data-boot>` is `store` until then and `ready` after; the
  parity runner and e2e wait for it. The HUD skips rewriting unchanged icon markup: re-inserting
  icons under the glass (backdrop-filter) buttons changes their raster.
- Parity clock: `__parityFlush` adopts new CSS animations synchronously, so an entrance
  animation (dialog `pop`) always starts at the interaction's virtual time instead of sometimes
  finishing in real time first (phase 12 saw `menus--book-welcome` flip between the two).
- Legacy import (`legacy-save-import.ts`): `aigame3d_multiplication_save` v1 -> a new guest
  profile in one transaction with the marker `meta.legacyImport`. Mapping: avatar ->
  `Profile.avatarId`; xp/coins -> wallet; bridge/questAccepted/questComplete ->
  `LevelProgress{levelId:'bridge', progress, acceptedAt, completedAt, stars}`; table/combo/started
  -> `meta game:<profileId>`; `questionStats m{a}_{b}` -> pooled `mul:{min}x{max}` (sums;
  totalMs = last response time x attempts; lastSeenAt = max); Leitner box: in review -> 1,
  correct >= 3 and no wrong -> 3, correct >= 1 -> 2, else 1. Invalid/unknown-version blobs import
  nothing and write no marker (retried next boot).
- Settings: one source, `math3d.settings` (`src/store/app-settings.ts`); until it is first
  written, language / quest card / sound / music come from the legacy keys.
- Save codes (`save-code-codec.ts`): `M3D1-` + base64url(compact JSON: short keys, defaults
  omitted, facts as `[a, b, correct, wrong, responseMs, lastAnsweredSec, box?]`) + `-` + CRC32
  (8 hex) of the payload; max 4096 chars; decoded through the same v1 validator. Import: start
  screen "Nhập mã lưu"; export: settings "Xuất mã lưu".
- Quiz: facts from the Leitner session planner over the chosen table, options from the
  distractor classes (practice) or expression choice (bridge); rewards stay the original
  (`src/quiz/quiz-rewards.ts`, asserted against the original bundle).
