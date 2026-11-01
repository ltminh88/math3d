# Review: chapter 2 (adce2f3..f52909e)

## Review Summary
Verdict: DONE_WITH_CONCERNS. Critical 0 · High 2 · Medium 5 · Low 7.
Generators, save code M3D3, purity, test-hook stripping and the 3D disposal hold up. Both Highs are in the shared reasoning round used by field, forest, city and tower: a rung-3 hint that states the step-1 answer, and a number-pad key listener left behind when the child leaves a level mid-round. Most Mediums are in the cave and valley hint ladders, plus one touch-layout bug in the workshop.

## Scope
- 212 non-test src files, ~19.4k lines added. I read: shared reasoning round (flow/slot/panel/strings), the bridge quiz word problem (quiz-*, quiz-word-problem-*), garden/valley/workshop/cave flows, controllers, hints and plans, ui/kit step card + number pad, store save-code v2/v3 + codec, learning fact-key/planner/tiers, the level-gate config, the quest-chain stage, world-frame-hook. I skimmed the world/map expansion.
- Probes run (node/tsx, nothing written to the repo):
  - All 39 skill generators × 3 tiers × 1500 seeds (175,500 items): rendered story, prompts, options, statements, fix answers and `work`. 0 numbers >100, 0 render errors, no kg↔g / l↔ml / m↔mm conversions.
  - Every geo/meas scene field shown to the child: max ≤100.
  - Workshop hint rungs 2–3 over all 12 meas skills × 3 tiers × 800 seeds: no >100, no bad render. Answer matches were coincidences, except L13.
  - Reasoning-round rung 3 vs the step-1 answer (H1).
  - Workshop tile-grid width (M6).
- Production build (`vite build`, output to scratchpad): no `__game/__garden/__valley/__valleyPlan/__workshop/__cave/__city/__tower/__field/__reasoning` in any chunk. Check 7 passes.
- Not done: running the app on real devices, draw-call counts (I trust the phase notes and e2e), or a line-by-line read of the world builders (goldens are green).

## Assessment
Things I checked and found sound:
- Numbers stay ≤100 everywhere.
- Purity holds: no three/DOM imports in learning, reasoning, geometry, measurement or store (settings-store localStorage is from before this change).
- Every file is <200 lines, except one at exactly 200 (L14).
- Each round records one outcome under `sk:<id>`, and reveal paths record not-correct, in garden, valley, workshop, cave, the reasoning round and the quiz.
- M3D3 decode is strict: catalog id, no repeats, range checks, unknown keys rejected. M3D2 keeps a frozen level set (same set as before) and M3D1 is untouched.
- New level keys listen on `document` with `ctx.disposer.signal`.
- Key hints are hidden on `(pointer: coarse)`, and the quest card swaps in touch text.
- KNTT: the square is never offered as a rectangle, and the generators use "two radii". The cave hint breaks the radii rule (M4).

## Critical
None.

## High
1. **Reasoning round rung 3 states the step-1 answer at tier 1.**
   - Where: `src/levels/shared/reasoning-round-strings.ts:78-92` (`FIRST_STEP_SKILLS`, `firstStep` "bước đầu tiên ra {first}" with `work[0]`).
   - Probe: for `wp-times-then-add`, `expr-order` and `expr-brackets` at tier 1, step 1 (`askOther` / `askPart`) has answer == `work[0]` in 500/500 seeds. At tiers 2–3 it happens only by chance.
   - Tier 1 is the default for a skill never seen (box 1). So the first reasoning round in field (wp-times-then-add) and tower (expr-*) hands over the answer at rung 3, and the round is still recorded `correct: true`. The Leitner box does not move (`usedHint`), but the correct count and the tally do. Same defect class as prior-review High 2.
   - The text is also per item, not per step (`reasoningHint(item, rung)`): on step 2 the child gets step 1's number again.
   - Fix: make the hint step-aware. Pass the step index; on step 1 show the operation with "?" (e.g. "a × n = ?"), and give `{first}` only once step 1 is done. Add a unit test: for every skill, tier and step, no rung text contains the current step's answer as the step's own result.

2. **Number-pad `document` keydown leaks when the child leaves an old level during its reasoning round.**
   - Where: `src/ui/kit/number-pad.ts:105-126` uses its own `AbortController`, aborted only by `destroy()`. The reasoning panel is destroyed only from `onNext` (`field-reasoning-round.ts:67`, `forest-remainder-round.ts:70`, `city-compare-round.ts:66`, `tower-expression-floor.ts:66`). No level `dispose()` calls it; field/forest/city/tower dispose only their own panel.
   - What happens: tap "Về thế giới" while a number step is live, and the orphaned pad keeps listening (`activeInput: true`, focus on body). From then on it:
     - takes digits and Enter anywhere and calls `preventDefault`;
     - submits answers to a dead flow, which calls `ctx.learning.record` after `close()`;
     - starves every later pad: the new pad checks `defaultPrevented`, so keyboard digits stop working in garden/cave/workshop/valley until reload.
   - The leak specs don't catch it: they never seed mastery and leave mid-round.
   - Fix: keep the `ReasoningRoundPanel` and destroy it in each level's `dispose()`, or `ctx.disposer.onDispose(() => panel.destroy())` inside `mountReasoningRound`. Also accept a `signal` in `createNumberPad` / `createStepCard` and tie it to the level signal. Add an e2e: seed mastery, open field, reach the reasoning round, go back, enter garden, type digits, expect the garden pad to get them.

## Medium
3. **Cave: the hint area stays on and the ladder doesn't reset across steps.**
   - Where: `cave-round-controller.ts:86-90` (no `clearHint` on a correct step); `cave-round-flow.ts:59` (stepIndex advances but rung/hintsTaken don't reset); `hint.disabled` stays true "until the next chamber".
   - On 2-step chambers (word problems, tf + fix, perimeter-back, rect-cut with 3 steps), step 2 still shows step 1's hint, with step 1's `{ask}`. If rung 3 was used, step 2 has no hint at all. Prior-review M5 class.
   - Fix: on `correct` without an outcome, clear the hint, re-enable the button and restart the rung (garden does this).

4. **Cave `hint2Circle` contradicts the KNTT decision.**
   - Where: `cave-strings.ts:45` / `:97` — "Đường kính dài gấp đôi bán kính" / "twice the radius".
   - `midpoint-and-circle-generators.ts:1-2` notes that B17 never says "gấp 2 lần" and adds two radii instead.
   - Fix: "Đường kính gồm hai bán kính: bán kính + bán kính." Also, `cave-hints.ts:58` `circleD` builds `nửa của {d}` in Vietnamese even in EN mode; move it into strings.

5. **Valley midpoint: the board gives the answer away.**
   - `valley-figure-view.ts:85-89`: the rung-3 aid colours the log in halves that meet at the true middle. At tier 3 (`midCheck`, is M the midpoint?), where M sits off-centre, this shows the verdict outright.
   - Worse, at tier 3 the round still opens with the `midpoint` action (`valley-figure-layout.ts:47`, `valley-layout-segment-circle.ts:35-43`). The child taps the true middle stone (always stone 3) before being asked whether M is the midpoint, so the verdict is decided before the question.
   - The round is recorded correct.
   - Fix: at tier 3, use no action (or "tap M"). Make the aid colour AM and MB as drawn (from M, not the middle) so the child compares lengths. Consider moving the correct stone off index 3 (e.g. shift the log) so tiers 1–2 aren't "always the centre stone".

6. **Workshop tile grid: the left columns are clipped and can't be reached.**
   - Where: `workshop-board.css:151-155` — fixed 44 px columns with `justify-content: center`.
   - A tier-1 `meas-area-rect` floor can be 10×2 (probe: max 10 columns), i.e. 10×44 + 9×3 = 467 px.
   - Room: the panel content is 364 px on desktop (400 − 2×18) and ~340 px on a Pixel phone.
   - With unsafe `center` the grid overflows on both sides. The panel's `overflow:auto` can't scroll to the left overflow, so the first column(s) can't be tapped. The p07 screenshots only show a 4×3 floor.
   - Fix: `justify-content: safe center`, plus `overflow-x: auto` on a wrapper. Or cap tiled floors at width ≤6 in `workshop-round-plan`, or let columns shrink to `minmax(44px,1fr)` with a scroll. Add a phone e2e with a 10-wide floor.

7. **Bridge quiz word problem: rung 3 is the worked answer and still counts as correct.**
   - Where: `quiz-word-problem-strings.ts:20,23` (`addHint3` / `cmpHint3` show `{answer}`), `:67`; recording in `quiz-answer.ts:117` (`correct: true`, `usedHint: true`).
   - Three hint taps and the child can tap the stated number. This copies the frozen multiplication ladder, but breaks project check 2 for new content.
   - Fix: rung 3 = "{a} × {n} = ? rồi cộng thêm {a}" (no total); keep the worked answer for the post-answer feedback, which already exists.

## Low
8. Workshop reveal runs synchronously inside the card's `submit` (`workshop-round-controller.ts:78`). The card then announces "thử lại" (`step-card.ts:96`) right after the step was revealed, and `pad.clear()` runs on a destroyed pad. Use `queueMicrotask` like garden/valley/cave.
9. Valley `miss()` (`valley-round-controller.ts:59-64`) always pulses the hint button, even after rung 3, when `hint()` does nothing. Pass `rung < VALLEY_HINT_RUNGS`.
10. Per-frame cost in the valley:
    - `ValleyLabels.place` (`valley-labels.ts:107-114`) builds a transform string for every label every frame, even when the camera is still. Write only when the camera or size changed.
    - `valley-camera.ts:78` allocates a `new Vector3` on each `apply` (while turning, plus every 20 frames via `frame()`). Reuse a module vector.
11. `cave-hints.ts:58`: `circleD` is hardcoded Vietnamese (see M4).
12. The miss budget differs by level. The workshop resets misses per step (`workshop-round-flow.ts:97-100`, so a 3-step item allows 9 misses); garden, valley, cave and the reasoning round count 3 per round. Pick one rule and document it in the plan.
13. Workshop `h3Weights` with a single weight reads "Cộng các quả cân: 50." (`workshop-hints.ts:83`), which is the answer. The weight is visible on the scale, so it's harmless. Use `h3Look` when `weights.length === 1`.
14. `src/levels/forest/forest-round-controller.ts` is exactly 200 lines. The rule is <200. Split one helper.

## Edge Cases Turned Up
- Leaving any old level during the reasoning round leaves a live keyboard pad (H2). It is cross-level and lasts until reload.
- Tier-3 valley midpoint: the action step answers the verdict step (M5).
- 2–3 step cave chambers: a stale hint, or none at all, on later steps (M3).
- 10-column tile floors on phone and desktop (M6).
- Garden bag tier 3 (askValue only): rung 3 `hintAfterPart` shows the first part's value. It is an intermediate, not the answer; OK as designed.
- `partOf()` returns `''` when there is no askPart step. `text.replace('', v)` would prepend the value, but it's only reached for `askValue` items, and those have askPart at tier 1 or need none. Worth a guard.
- M3D3: an export with `lastSeenAt` beyond `MAX_EPOCH_SEC` would produce a code the same client rejects. The same risk existed in M3D2 facts; not new.

## Done Well
- The generators are pure, seeded and cap-tested; the 175k-item probe found nothing.
- M3D3 is truly strict (catalog ids, no duplicates, `correct ≤ attempts`, unknown keys rejected). M3D2 now has a frozen level set instead of a live `LEVEL_GATES`, which is the right fix for "never break a shipped format". There is a shipped M3D2 fixture.
- Every round records one outcome under the right key. Reveal = not correct, and hints never promote the box (leitner `clean`).
- Garden clears the hint and resets the rung on step advance. Valley and garden reveal in a microtask after the card's own handling.
- Test hooks are tree-shaken (verified in the prod bundle). Keys use the level signal. Coarse-pointer copy is swapped.
- Valley/workshop baking disposes source geometries and scratch materials on each rebuild.
- The workshop counts tiles without showing the total (lesson from city High 1 applied).

## Actions In Order
1. H2: destroy the reasoning panel on level dispose and give the pad a signal; add an e2e that leaves mid-round.
2. H1: step-aware reasoning hints with no step answer; unit test over all skills, tiers and steps.
3. M3: cave per-step hint reset/clear.
4. M6: tile-grid safe centring / width cap; phone e2e with a wide floor.
5. M5: valley tier-3 midpoint action + aid.
6. M7: quiz word problem rung 3 without the total.
7. M4 + L11: cave circle wording via strings.
8. Lows as time allows (L8 and L10 are cheap).

## Numbers
- Diff: 267 files, +19,405 / −217. 212 non-test src files.
- Generator probe: 175,500 items, 0 numbers >100, 0 render errors. Scene probe: 0 fields >100.
- Workshop hint probe: 12 skills × 3 tiers × 800 seeds × 2 rungs, 0 >100.
- Leak probe (H1): 1500/1500 tier-1 items across the 3 skills reveal step 1 at rung 3.
- Prod bundle: 0 test-hook globals.
- Max tile-grid columns: 10 (467 px); panel content 364 px desktop, ~340 px phone.

## Still Unresolved
- Should the bridge quiz word problem keep the legacy "rung 3 = worked answer" (consistency with × facts) or follow the chapter-2 rule (M7)? I default to the chapter-2 rule.
- Miss budget per step (workshop) vs per round (others): the author should pick one (L12).
- Draw-call counts and the tablet layouts of the new levels weren't re-measured here; I'm relying on the phase-05..08 notes and e2e.

**Status:** DONE_WITH_CONCERNS
**Summary:** Critical 0 · High 2 (reasoning-round rung 3 gives the step-1 answer at tier 1; orphaned number-pad listener after leaving an old level mid-round).
Medium 5 (cave hint not reset per step; cave "gấp đôi bán kính" wording; valley tier-3 midpoint pre-solved; workshop wide tile grid clipped; quiz word-problem rung 3 shows the answer).
Low 7 (workshop sync reveal announcement, valley dead hint pulse, valley per-frame label writes and Vector3, hardcoded vi in cave hint, inconsistent miss budget, single-weight hint, one 200-line file).
