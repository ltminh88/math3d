# Parity re-baseline, chapter 2 (phase 09)

Date 2026-11-02. Branch `feat/ch2-p09-parity-playthrough` (from main 0c007e8 / tag `chapter2-reviewed`, then main merged at e8d1624: natural wording 8ab6bc0, per-step miss budget 11948c4 + 3b5c375, valley top-down board e8d1624). Machine: the same Mac + Chromium 156 SwiftShader as every earlier local baseline. Previous baseline: cc2a561 (phase 03).

## Before the re-baseline (main as branched, 0c007e8)

`capture-live-baselines.mjs --origin local` against the p03 baselines (run under load, playthrough browsers running): desktop 4 differ, mobile 20 differ.

| Files | Cause |
|---|---|
| mobile `playthrough--quiz-{q1,wrong,hint-1..3,correct,correct-3,correct-6}` DOM PNG (920-1073 px, the answer row) + JSON `cssHash` only; `playthrough--bridge-built` JSON `cssHash` | phase 04 quiz touch badges (7b09841): `@media (pointer: coarse) .answers .answer kbd { display: none }` hides the 1-3 key badges; mobile-pixel is a coarse pointer, the html still holds the 3 `<kbd>` |
| desktop `welcome--t0/t2s/t6s/t12s` DOM 27 px; mobile `language-en--book/play/settings` DOM 6-12 px | raster noise (JSON byte-exact). The desktop welcome noise never came back on a quiet machine; the mobile language-en state did (see determinism) |

Nothing else differed: no other phase 04-08 change reaches a parity scenario (the levels run behind their gates; word problems and reasoning rounds need mastered tables; the quiz content and the RNG stream are unchanged: every html byte-equal). Phase 09 part 1 (44 px leave button: inside levels; quest cell font: `max-width: 1100px` rule, overridden at ≤ 700 px and not reached at 1280 px) and the review fixes (levels only) show nothing.

## The re-baseline (merged main + this branch's fixes)

`npm run parity:baselines`, then every changed file diffed against HEAD (`.preview/play-ch2/parity-baseline-diff-report.mjs`). 67 files changed (+ the two `capture-meta.json`):

| Change | Files | Cause (commit) |
|---|---|---|
| mobile shot JSON, `cssHash` only (html, gl, storage, traces exact) | 46 (every mobile shot) | coarse-pointer style changes: hidden quiz key badges (7b09841) and the new touch hit areas (684f293: `.dialog-close::after`, `.welcome > .text-button { position: relative }` + `::after`); those elements are in every shot's DOM. Desktop (fine pointer) unchanged |
| mobile quiz DOM PNGs | 8 (920-1046 px on the answer row) | hidden key badges (7b09841) |
| desktop `tap-to-milo--*` (55 px, top-right off-edge labels), `menus--map-open` 7 px, `menus--map-region-forest` 3 px, `playthrough--after-quest`/`--quest-complete` 11 px; mobile `menus--book-table-7` 155 px, `menus--map-open` 2 px, `playthrough--near-milo` 156 px, `--after-quest`/`--quest-complete` (badge keyframe layer) | 13 DOM PNGs | known two-state raster noise, all listed in `parity-shot-tolerances.json`; JSON byte-exact; the new baseline holds the other state |
| canvas PNGs, traces, scene dumps | 0 | — |

The other branch fixes (pop panels → `translate`, field tool 44 px, valley panel/chips) are level CSS, not in any scenario. The merged main changes (wording, miss budget, valley board) are level code only: no parity file changed because of them.

## Determinism

Two full `npm run test:parity` runs after the re-baseline (quiet machine): canvas PNGs, shot JSON, traces and scene dumps exact in both. DOM-only noise, all with byte-exact JSON:

- run 1: 19/20, mobile `playthrough--after-quest` 12454 px (3.6%) — the region-badge pop-in layer in its other state, just over the 0.035 structural ceiling. Ceiling 0.035 → 0.073 (rule: max × 2).
- run 2: 19/20, mobile `language-en--book/play/settings` 12/6/12 px at the top-left top-bar glass, the same state the pre-rebaseline run saw → tolerance 1e-4 each.

Recorded as `localVsLocalP09` in `tests/parity/parity-shot-tolerances.json`.

### The four p03 tolerances

| Shot | p03 | Seen again in phase 09 | Decision |
|---|---|---|---|
| desktop `playthrough--quest-complete` structural ceiling 0.009 | 6882 px (off-edge garden gate label) | 11 px in 2 runs; the 6882-px state not in 4 runs | keep: the garden gate label still hangs off the right edge; p03 saw that state in 1 of 3 runs |
| desktop `menus--map-region-forest` 1e-4 | 3 px | 3 px (pre-rebaseline run, run 2) | keep |
| mobile `menus--book-table-7` 9e-4 | 155 px | 155 px (pre-rebaseline run, run 2) | keep |
| mobile `menus--map-open` 1e-4 | 2 px | 2 px (pre-rebaseline run, run 2) | keep |

None can be removed or tightened on this evidence.

## Result

- Final `npm run test:parity` (third full run, with the updated tolerances): **20 passed**; DOM noise only on listed shots, all within their tolerance/ceiling.
- Goldens: `node tools/recovery/golden/generate-golden-traces.mjs --check` byte-identical.
