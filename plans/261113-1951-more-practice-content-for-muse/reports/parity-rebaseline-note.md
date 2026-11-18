# Parity re-baseline note — "more practice" batch (phases 01–13, PRs #13–#26)

Intentional visible changes merged in this batch. The reviewer re-shoots the
parity baselines for exactly these changes; no other visual change is expected.
Parity itself is the reviewer's run (`npm run test:parity`, Mac baselines) — this
phase does not run it or touch its baselines.

## Intentional visible changes

| Change | Introduced by | Recapture |
|---|---|---|
| Gate label gains the stage line: "Cổng đã mở · Chặng 1/N" once open, "Đã hoàn thành ★★☆ · Chặng n/N" once done (field 6, forest 6, city 6, tower 6, garden 5, valley 5, workshop 5, cave 5) | Stage phases: field #8, forest #14, city #13, tower #15, garden #17, valley #16, workshop #18, cave #20 | Field stage line re-shot at 4aec6fa; the same label pattern on the other gates is covered by the re-shoots below |
| Celebration card stage line: "Chặng n/m · {stars} sao" for the stage just played | Stage phases #13–#20 (same PRs as above) | Quest-card baselines re-shot after #23 (cf154ac) |
| Quest-card stage sub-line: "Chặng n/m · s/3m sao" (denominator included); "Đã qua hết các chặng!" once every stage of the level is done | Phase 13, PR #23 | cf154ac "recapture Mac baselines for the quest card stage line (phase 13)" |
| Map detail panel: unfinished multi-stage level shows its next stage + "Vào chơi"; finished level shows "Chơi lại chặng…" with one row per completed stage | Phase 13, PR #23 | cf154ac |
| Quest-card daily line: "Hôm nay: chưa luyện / đã luyện ✓" | Phase 11 (daily practice) | 0ea461d "recapture Mac baselines for daily practice UI"; 29715a1 "recapture Mac baselines for daily locked line" |
| HUD daily button: "Luyện tập hôm nay" | Phase 11 (daily practice) | 0ea461d |
| VLM daily entry (the daily loop is reachable by talking to VLM) | Phase 11 (daily practice) | 0ea461d |
| Sticker-book button on the quest card | Phase 12 (stickers) | 8fe460b "recapture Mac baselines for sticker book UI" |
| Garden gate label lifted 56 px (no longer overlapped by "Pattern Garden"); bridge count translated in English mode | Issue #7 fix, PR #21 | 0eacae1 "recapture Mac baselines for issue #7 (garden gate label lift, English bridge count)" |
| Quest step aria-labels "Chặng n" → "Thử thách n" ("Stage n" → "Challenge n"); "Thử thách cuối đã mở!" | PR #26 | ec63acd "recapture Mac baselines for the challenge aria labels" — **no visible change** (aria-labels only), but the parity HTML changed, so the baselines were re-shot |

## Baseline status

- Latest baselines on `main` ec63acd (the #26 recapture). The reviewer re-shot
  after #21, after #23 and after #26, as listed above.
- Everything else in the batch is level code, strings or test-only: the levels
  run behind their gates, so no parity scenario shows them (the same reasoning
  as the chapter-2 re-baseline note).
- CI runs parity with `parity skipping` by design on these PRs; the reviewer's
  Mac run is the check that passes.
