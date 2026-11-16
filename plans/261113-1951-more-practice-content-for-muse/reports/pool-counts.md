# Pool counts — before / after (phases 01–02)

Measured with `tools/practice/pool-counter.ts`: 10,000 seeded draws per skill × tier
(seed 20261113) and per fact pool. A signature is the visible prompt (story key +
params, every step prompt + correct answer, and the scene for geometry/measurement);
wrong options are not part of a signature. `median before repeat` is the median draws
before an exact repeat over 20 trials (cap 1000; `>1000` means more than half the
trials never repeated within the cap).

Phase 02 re-measured with the same method and seed and filled the "after" column;
the tier columns of the Skills table are the phase-01 before numbers, the story
contexts column is the current (phase-02) list.

## Skills

| skill | family | tier 1 | tier 2 | tier 3 | story contexts (wp only) |
|---|---|---|---|---|---|
| wp-times-then-add | word-problem | 1296 (med 27.5) | 2306 (med 40.5) | 2298 (med 41) | wpTimesThenAdd, wpTimesThenAddCakes, wpTimesThenAddChairs, wpTimesThenAddHarvest |
| wp-divide-then-add | word-problem | 378 (med 16) | 1436 (med 37) | 2298 (med 41) | wpDivideThenAdd, wpDivideThenAddHarvest, wpDivideThenAddMake, wpDivideThenAddPack |
| wp-more-less-then-total | word-problem | 5692 (med 96) | 8358 (med 237) | 8358 (med 224) | wpLessThenTotal, wpLessThenTotalHarvest, wpLessThenTotalMake, wpMoreThenTotal, wpMoreThenTotalHarvest, wpMoreThenTotalMake |
| wp-unit-then-times | word-problem | 1636 (med 50) | 4022 (med 82.5) | 4042 (med 68.5) | wpUnitThenTimes, wpUnitThenTimesPack, wpUnitThenTimesShop, wpUnitThenTimesStore |
| wp-times-compare | word-problem | 126 (med 11.5) | 510 (med 20.5) | 976 (med 27) | wpCompareClasses, wpCompareCrates, wpCompareGardens, wpTimesCompare |
| div-rem-floor | remainder | 432 (med 25.5) | 3057 (med 59) | 2394 (med 78.5) | — |
| div-rem-ceil | remainder | 72 (med 13) | 534 (med 28.5) | 403 (med 23) | — |
| unknown-add-sub | unknown | 1482 (med 39.5) | 5743 (med 93.5) | 4522 (med 86) | — |
| unknown-mul-div | unknown | 64 (med 9) | 288 (med 19) | 2154 (med 41) | — |
| pattern-add | pattern | 332 (med 21.5) | 409 (med 25) | 515 (med 25.5) | — |
| pattern-sub | pattern | 332 (med 21.5) | 409 (med 25) | 515 (med 25.5) | — |
| pattern-skip-count | pattern | 112 (med 13.5) | 149 (med 16) | 149 (med 16) | — |
| expr-order | expression | 5791 (med 103) | 5808 (med 111) | 9773 (med 541.5) | — |
| expr-brackets | expression | 6963 (med 92.5) | 6851 (med 76.5) | 8211 (med 140) | — |
| expr-from-story | expression | 5917 (med 97.5) | 5857 (med 102) | 8290 (med 184.5) | — |
| choose-all-correct | logic | 7238 (med 48) | 8101 (med 102) | 8086 (med 111.5) | — |
| tf-explain | logic | 803 (med 34) | 2693 (med 52.5) | 3038 (med 44.5) | — |
| wp-difference-compare | word-problem | 126 (med 11.5) | 510 (med 20.5) | 976 (med 27) | wpCompareClasses, wpCompareCrates, wpCompareGardens, wpDifferenceCompare |
| geo-midpoint | geometry | 6 (med 4) | 10 (med 5) | 57 (med 6.5) | — |
| geo-circle-parts | geometry | 5949 (med 138.5) | 5949 (med 138.5) | 5913 (med 88) | — |
| geo-radius-diameter | geometry | 10 (med 5) | 24 (med 6) | 32 (med 6.5) | — |
| geo-right-angle | geometry | 96 (med 15) | 9997 (med >1000) | 9959 (med 990) | — |
| geo-count-right-angles | geometry | 292 (med 12.5) | 6676 (med 123) | 10000 (med >1000) | — |
| geo-shape-classify | geometry | 9999 (med >1000) | 9979 (med >1000) | 9999 (med >1000) | — |
| geo-shape-count | geometry | 195 (med 15.5) | 436 (med 9.5) | 714 (med 8.5) | — |
| geo-solid-identify | geometry | 513 (med 8.5) | 9995 (med >1000) | 9992 (med >1000) | — |
| geo-solid-parts | geometry | 27 (med 6.5) | 1511 (med 39) | 207 (med 16.5) | — |
| meas-ruler-read | measurement | 45 (med 9.5) | 405 (med 28) | 1416 (med 45) | — |
| meas-mm-convert | measurement | 20 (med 6) | 6007 (med 48.5) | 5274 (med 84) | — |
| meas-gram | measurement | 600 (med 25) | 9562 (med 472.5) | 496 (med 30.5) | — |
| meas-ml | measurement | 9 (med 4.5) | 7 (med 3) | 93 (med 7.5) | — |
| meas-temperature | measurement | 8 (med 5) | 9991 (med >1000) | 296 (med 21) | — |
| meas-perimeter-polygon | measurement | 7760 (med 125) | 7694 (med 168.5) | 9076 (med 306) | — |
| meas-perimeter-rect | measurement | 189 (med 15) | 189 (med 14) | 189 (med 14) | — |
| meas-perimeter-square | measurement | 19 (med 5) | 19 (med 6) | 19 (med 6) | — |
| meas-area-count | measurement | 9388 (med 201) | 9986 (med >1000) | 10000 (med >1000) | — |
| meas-area-rect | measurement | 36 (med 7) | 36 (med 7.5) | 120 (med 7) | — |
| meas-area-square | measurement | 9 (med 4) | 9 (med 5) | 7 (med 4) | — |
| meas-wp-fence | measurement | 170 (med 15.5) | 510 (med 24) | 170 (med 15) | — |

## Fact pools (mul/div)

| level | pool size | distinct in 10,000 draws | median before repeat |
|---|---|---|---|
| field | 17 | 17 | 5.5 |
| forest | 36 | 36 | 6.5 |
| city | 30 | 30 | 6 |
| tower | 116 | 116 | 14.5 |

## Before / after

| skill × tier | before | after |
|---|---|---|
| wp-times-then-add × t1 | 1296 | 2403 (med 47.5) |
| wp-times-then-add × t2 | 2306 | 3615 (med 65.5) |
| wp-times-then-add × t3 | 2298 | 3579 (med 58.5) |
| wp-divide-then-add × t1 | 378 | 880 (med 34.5) |
| wp-divide-then-add × t2 | 1436 | 2884 (med 60) |
| wp-divide-then-add × t3 | 2298 | 4187 (med 69.5) |
| wp-more-less-then-total × t1 | 5692 | 6795 (med 123) |
| wp-more-less-then-total × t2 | 8358 | 8873 (med 198) |
| wp-more-less-then-total × t3 | 8358 | 8861 (med 297) |
| wp-unit-then-times × t1 | 1636 | 5779 (med 98.5) |
| wp-unit-then-times × t2 | 4022 | 8038 (med 158) |
| wp-unit-then-times × t3 | 4042 | 8055 (med 171) |
| wp-times-compare × t1 | 126 | 315 (med 18.5) |
| wp-times-compare × t2 | 510 | 1250 (med 40) |
| wp-times-compare × t3 | 976 | 2263 (med 50.5) |
| div-rem-floor × t1 | 432 | 432 (med 25.5) |
| div-rem-floor × t2 | 3057 | 3057 (med 59) |
| div-rem-floor × t3 | 2394 | 2394 (med 78.5) |
| div-rem-ceil × t1 | 72 | 216 (med 15) |
| div-rem-ceil × t2 | 534 | 1600 (med 46) |
| div-rem-ceil × t3 | 403 | 1208 (med 43.5) |
| unknown-add-sub × t1 | 1482 | 2799 (med 56.5) |
| unknown-add-sub × t2 | 5743 | 7284 (med 160) |
| unknown-add-sub × t3 | 4522 | 6260 (med 141.5) |
| unknown-mul-div × t1 | 64 | 128 (med 13) |
| unknown-mul-div × t2 | 288 | 576 (med 25) |
| unknown-mul-div × t3 | 2154 | 3666 (med 69) |
| pattern-add × t1 | 332 | 332 (med 21.5) |
| pattern-add × t2 | 409 | 409 (med 25) |
| pattern-add × t3 | 515 | 515 (med 25.5) |
| pattern-sub × t1 | 332 | 332 (med 21.5) |
| pattern-sub × t2 | 409 | 409 (med 25) |
| pattern-sub × t3 | 515 | 515 (med 25.5) |
| pattern-skip-count × t1 | 112 | 224 (med 18.5) |
| pattern-skip-count × t2 | 149 | 298 (med 19.5) |
| pattern-skip-count × t3 | 149 | 149 (med 16) |
| expr-order × t1 | 5791 | 5791 (med 103) |
| expr-order × t2 | 5808 | 5808 (med 111) |
| expr-order × t3 | 9773 | 9773 (med 541.5) |
| expr-brackets × t1 | 6963 | 6963 (med 92.5) |
| expr-brackets × t2 | 6851 | 6851 (med 76.5) |
| expr-brackets × t3 | 8211 | 8211 (med 140) |
| expr-from-story × t1 | 5917 | 7330 (med 99.5) |
| expr-from-story × t2 | 5857 | 7411 (med 145.5) |
| expr-from-story × t3 | 8290 | 9375 (med 297) |
| choose-all-correct × t1 | 7238 | 7238 (med 48) |
| choose-all-correct × t2 | 8101 | 8101 (med 102) |
| choose-all-correct × t3 | 8086 | 8086 (med 111.5) |
| tf-explain × t1 | 803 | 803 (med 34) |
| tf-explain × t2 | 2693 | 2693 (med 52.5) |
| tf-explain × t3 | 3038 | 3038 (med 44.5) |
| wp-difference-compare × t1 | 126 | 315 (med 18.5) |
| wp-difference-compare × t2 | 510 | 1250 (med 40) |
| wp-difference-compare × t3 | 976 | 2263 (med 50.5) |
| geo-midpoint × t1 | 6 | 12 (med 5) |
| geo-midpoint × t2 | 10 | 12 (med 5) |
| geo-midpoint × t3 | 57 | 57 (med 6.5) |
| geo-circle-parts × t1 | 5949 | 5949 (med 138.5) |
| geo-circle-parts × t2 | 5949 | 5949 (med 138.5) |
| geo-circle-parts × t3 | 5913 | 5913 (med 88) |
| geo-radius-diameter × t1 | 10 | 12 (med 5) |
| geo-radius-diameter × t2 | 24 | 24 (med 6) |
| geo-radius-diameter × t3 | 32 | 32 (med 6.5) |
| geo-right-angle × t1 | 96 | 96 (med 15) |
| geo-right-angle × t2 | 9997 | 9997 (med >1000) |
| geo-right-angle × t3 | 9959 | 9959 (med 990) |
| geo-count-right-angles × t1 | 292 | 292 (med 12.5) |
| geo-count-right-angles × t2 | 6676 | 6676 (med 123) |
| geo-count-right-angles × t3 | 10000 | 10000 (med >1000) |
| geo-shape-classify × t1 | 9999 | 9999 (med >1000) |
| geo-shape-classify × t2 | 9979 | 10000 (med >1000) |
| geo-shape-classify × t3 | 9999 | 9999 (med >1000) |
| geo-shape-count × t1 | 195 | 195 (med 15.5) |
| geo-shape-count × t2 | 436 | 436 (med 9.5) |
| geo-shape-count × t3 | 714 | 714 (med 8.5) |
| geo-solid-identify × t1 | 513 | 513 (med 8.5) |
| geo-solid-identify × t2 | 9995 | 9995 (med >1000) |
| geo-solid-identify × t3 | 9992 | 9992 (med >1000) |
| geo-solid-parts × t1 | 27 | 27 (med 6.5) |
| geo-solid-parts × t2 | 1511 | 1511 (med 39) |
| geo-solid-parts × t3 | 207 | 207 (med 16.5) |
| meas-ruler-read × t1 | 45 | 45 (med 9.5) |
| meas-ruler-read × t2 | 405 | 405 (med 28) |
| meas-ruler-read × t3 | 1416 | 1416 (med 45) |
| meas-mm-convert × t1 | 20 | 20 (med 6) |
| meas-mm-convert × t2 | 6007 | 6007 (med 48.5) |
| meas-mm-convert × t3 | 5274 | 5274 (med 84) |
| meas-gram × t1 | 600 | 600 (med 25) |
| meas-gram × t2 | 9562 | 9562 (med 472.5) |
| meas-gram × t3 | 496 | 496 (med 30.5) |
| meas-ml × t1 | 9 | 13 (med 5) |
| meas-ml × t2 | 7 | 16 (med 5) |
| meas-ml × t3 | 93 | 93 (med 7.5) |
| meas-temperature × t1 | 8 | 48 (med 12.5) |
| meas-temperature × t2 | 9991 | 9991 (med >1000) |
| meas-temperature × t3 | 296 | 296 (med 21) |
| meas-perimeter-polygon × t1 | 7760 | 7760 (med 125) |
| meas-perimeter-polygon × t2 | 7694 | 7694 (med 168.5) |
| meas-perimeter-polygon × t3 | 9076 | 9076 (med 306) |
| meas-perimeter-rect × t1 | 189 | 189 (med 15) |
| meas-perimeter-rect × t2 | 189 | 189 (med 14) |
| meas-perimeter-rect × t3 | 189 | 189 (med 14) |
| meas-perimeter-square × t1 | 19 | 19 (med 5) |
| meas-perimeter-square × t2 | 19 | 19 (med 6) |
| meas-perimeter-square × t3 | 19 | 19 (med 6) |
| meas-area-count × t1 | 9388 | 9388 (med 201) |
| meas-area-count × t2 | 9986 | 9986 (med >1000) |
| meas-area-count × t3 | 10000 | 10000 (med >1000) |
| meas-area-rect × t1 | 36 | 36 (med 7) |
| meas-area-rect × t2 | 36 | 36 (med 7.5) |
| meas-area-rect × t3 | 120 | 120 (med 7) |
| meas-area-square × t1 | 9 | 27 (med 6.5) |
| meas-area-square × t2 | 9 | 27 (med 8) |
| meas-area-square × t3 | 7 | 14 (med 5) |
| meas-wp-fence × t1 | 170 | 170 (med 15.5) |
| meas-wp-fence × t2 | 510 | 510 (med 24) |
| meas-wp-fence × t3 | 170 | 170 (med 15) |
## Shortfalls (phase 02)

None. Every skill × tier meets its phase-02 target (reasoning ≥ 24,
geometry/measurement ≥ 12 distinct visible prompts). The skills that were below
target in phase 01 and how phase 02 widened them:

| skill × tier | before | after | how it was widened |
|---|---|---|---|
| geo-midpoint × t1 | 6 | 12 (med 5) | segment lengths 2–24 cm (was 2–12) |
| geo-midpoint × t2 | 10 | 12 (med 5) | segment lengths 2–24 cm (was 2–20) |
| geo-radius-diameter × t1 | 10 | 12 (med 5) | radius 1–12 cm (was 1–10) |
| meas-ml × t1 | 9 | 13 (med 5) | jugs (100 ml, 10 marks) + (50 ml, 5 marks) (was [10]) |
| meas-ml × t2 | 7 | 16 (med 5) | jugs (100 ml, 4/5 marks) + (50 ml, 10 marks) (was [4, 5]) |
| meas-temperature × t1 | 8 | 48 (med 12.5) | thermometer labelled with a place (6 places × 8 values) |
| meas-area-square × t1 | 9 | 27 (med 6.5) | square / tile / card framings |
| meas-area-square × t2 | 9 | 27 (med 8) | square / tile / card framings |
| meas-area-square × t3 | 7 | 14 (med 5) | red/yellow card + tile framings |

No phase 03–10 adjustment is needed: no skill is on a shortfall list. Fact pools are
unchanged (field 17, forest 36, city 30, tower 116) — no new facts exist to add.

### Review fix (2026-11-16)

As first submitted, phase 02 counted three things the child does not see as new
questions, so the counts were prettier than reality. The author caught all three
in review and they are fixed here; the counter below is re-run after the fix
(117 skill × tier rows, only `meas-temperature` t1 changed: 24 → 48):

- `meas-ml` t1: the 5-mark 100 ml jug is gone (20 ml a mark in one step, with no
  lead-in, is tier 2 reasoning). Real expansion instead: a 50 ml jug with 5 marks
  (10 ml a mark, the book's step), so t1 stays 9 + 4 = 13.
- `meas-ml` t2: the 10-mark 100 ml jug is gone (per = 10 makes the `wrong-step`
  distractor, level × 10, equal the right answer). Real expansion instead: a 50 ml
  jug with 10 marks (5 ml a mark, asked per-mark first), so t2 stays 3 + 4 + 9 = 16.
- `meas-temperature` t1: the A/B/C labels are gone (same thermometer, same
  reading). The thermometer is now labelled with a place from `PLACES` and the
  question names it, so t1 is 6 places × 8 values = 48 — a real question each.

The counter counts what the child sees: the signature is the story, every step's
prompt and correct answer, and the whole scene (jug capacity and marks, thermometer
label and reading). A jug's capacity is printed in its story text and on the jug;
a thermometer's place label is drawn under it.

## Catalog freeze decision (phase 01)

**No new skill id is needed.** Every skill × tier can be widened inside its existing
generator, so the M3D4 catalog is exactly the M3D3 catalog (39 ids, append-only).

- Reasoning skills are already above the phase-02 target (≥ 24 distinct per skill ×
  tier) at every tier — the lowest is `unknown-mul-div` t1 at 64. Widening here is
  story contexts, not new ids.
- Geometry/measurement skills below the phase-02 target (≥ 12 per skill × tier) are
  all parametric ranges that widen without a new id: `geo-midpoint` t1 = 6 (segment
  lengths 2, 4, 6, 8, 10, 12), `geo-radius-diameter` t1 = 10, `meas-ml` t1 = 9 /
  t2 = 7 (jug marks 4–5), `meas-temperature` t1 = 8 (multiples of 5 °C),
  `meas-area-square` = 9 / 9 / 7, `meas-mm-convert` t1 = 20. Phase 02 widens the
  ranges; no new concept is needed.
- Word-problem skills have exactly **1 story context each** (verified, not assumed),
  except `wp-more-less-then-total` with 2 (`wpLessThenTotal`, `wpMoreThenTotal`).
  Phase 02 adds +3–5 contexts per `wp-*` skill inside the same generator — new story
  templates under the same skill id.

## Corrections to the design's pool sizes (phase 00)

The design quoted pool sizes without deduplication; the counter measures the real
pools (mul keys dedupe commutative pairs, e.g. 3×4 == 4×3):

| level | design said | measured |
|---|---|---|
| field (mul 3, 4) | 18 | 17 |
| forest (div 2–5) | 72 | 36 (div only; 72 was mul+div) |
| city (mul 6–9) | 36 | 30 |
| tower (mul+div 2–9) | 144 | 116 (mul 44 + div 72) |

This does not change the stage design (the tower pool is still the deepest), but
phase 02's targets and the stage content tables in phases 03–06 use these numbers.
Fact repeats are inherent to fact drills (median 5.5–14.5 draws before a repeat);
the phase-02 work for facts is format variety, not more facts.
