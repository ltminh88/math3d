# Review: city + tower levels (merged d8ed479, e9ebc46)

Verdict: DONE_WITH_CONCERNS. Critical 0, High 2, Medium 7, Low 6. Host contract fully met. A generator probe over the whole pool found no uniqueness or exact-division bugs (one inverse-outside-pool case, L11).

## High
1. **City windows counter shows the product before any miss.** `city-round-controller.ts:76,90-92`; strings `litCount`/`floorLit` in `city-strings.ts:21,26`. Lighting every floor displays "m tầng sáng · N cửa sổ" = the answer, and the round is recorded as first-try correct. Fix: show lit floors only (no window total); update the `city-level.spec.ts:119` assertion.
2. **Tower hint rung 4 shows the full answer and the floor is still recorded correct.** `tower-hints.ts:35,77-79`. This contradicts the learning-core ladder (rung 4 = strategy, rung 5 = worked answer counts as wrong + requeue). Fix: make rung 4 a strategy (inverse fact with a "?"), and leave the reveal to the three-miss path.

## Medium
3. City reverse-round hints name the correct parcel from rung 2 (`city-hints.ts:50-73`). Give reverse rounds their own rungs; unit-test that no rung ≥2 contains both factors of the correct parcel.
4. City `hintSkip` mentions windows in delivery rounds (`city-strings.ts:37`). Add a parcel-specific key.
5. Tower hint area and rung carry over to the next step of family/claim rounds (`tower-round-controller.ts:100-109`, `tower-panel.ts:100`). Clear on step advance.
6. Tower true claims: tapping "Đúng" is credited as clean recall (`tower-question-formats.ts:137-140`). Don't promote on a verdict-only true claim, or add a confirm step.
7. Tower allocates per frame: `fallenSpot`/`placedSpot` (`tower-floor-view.ts:32-37,124`) and `tower-climb-camera.ts:70`. Precompute or reuse.
8. Tower never announces the equation; answer cards have no aria-label (`tower-round-controller.ts:61`, `tower-answer-buttons.ts:23-25`).
9. Tower leak spec takes its baseline after a warm-up visit, so a first-visit leak is hidden (`tower-level.spec.ts:176-188`). Use the city's settled baseline; also assert textures in both specs.

## Low
10. City drop zones still accept houses already marked wrong (`city-street-view.ts:116-124`).
11. Tower `inverseOf` turns `mul:8x10` into `div:80/10`, outside the pool (`tower-round-flow.ts:36-39`).
12. City `hintTen` wording is ambiguous; pick the factor closest to 10.
13. Text nits: tower `wrong` copy, long tower `intro`, city `hintCommute` phrasing.
14. Tower duplicates the tally/stars logic; city has no star row (inconsistent with tower).
15. Hint key `H` exists in city only.

## Open for the author
- Windows running count: floors only (controller default) vs windows.
- Whether tower rung 4 should ever show the result (controller default: no, strategy only).
- A 10-floor × 9 building on a phone is not verified.
