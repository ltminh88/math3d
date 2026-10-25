# Parity re-baseline: QA fixes

Merged main (`fix/app-shell-qa` + `fix/level-qa-fixes`) vs local baselines from c656b28.
First run: 9/20 passed, 11 failed (desktop `language-en`, every mobile scenario). Canvas PNGs,
scene dumps, gl counts, storage and audio were exact everywhere; only DOM shots moved.

## Re-baselined

| Shot(s) | Project | Changed | Cause |
|---|---|---|---|
| `language-en--{welcome,play,book,settings}` | both | json (html, cssHash) + dom.png | 8f225f6: English title "A SMALL ADVENTURE", "Explore multiplication tables", "FIRST ADVENTURE", "Talk to VLM", "Saved on this device" (padded text nodes now translated), "Sharing Forest" (gate name, gate label, lock text), sound `aria-label="Mute sound"`. cssHash moves with the new text widths. |
| `playthrough--{after-quest,quest-complete}` | mobile | json (html, cssHash) + dom.png | fad772e: the quest card on a coarse pointer reads "rồi bấm nút Vào cổng nhé!" (no "nhấn E hoặc"). Plus the hit-area cssHash below. |
| `playthrough--quiz-correct` | mobile | json (cssHash) + dom.png (32 px) | 6710b03: anti-aliasing on the edges/glyphs of the correct card mid-pop; content identical. Deterministic (same 32 px, same box, twice). |
| 40 other mobile shots: `welcome--*`, `avatar--*`, `menus--*`, `walk-to-bridge--*`, `tap-to-milo--*`, `bridge-{0,3,6}--play`, `playthrough--{bridge-built,milo-dialog,near-milo,quiz-q1,quiz-wrong,quiz-hint-1..3,quiz-correct-3,quiz-correct-6}` | mobile | json (cssHash only) | 6710b03: `src/styles/touch-hit-areas.css` under `(pointer: coarse)` gives `.top-right .icon-button` and `.quest-head` `position: relative` and an invisible `::after`. Look unchanged (no pixel diff). |
| `capture-meta.json` | both | capturedAt, durationSec | capture run metadata |

Attribution check: with the `touch-hit-areas.css` import removed (temporary, reverted), the
mobile playthrough showed no cssHash diff and no `quiz-correct` pixel diff; only the expected
quest-card html/pixels remained.

## Kept (not re-baselined)
- desktop `menus--map-open`, `playthrough--{after-quest,bridge-built,near-milo,quest-complete}` dom.png:
  the fresh capture differed by raster noise only; these shots passed parity before the
  re-baseline (structural / within tolerance), so the old files stay.
- mobile `playthrough--near-milo` dom.png: 923 px on the first run (the documented
  `localVsLocalR186` noise of the interact-button pulse, structurally gated); 0 px on rerun.

No tolerance changes. No unexplained diff.
