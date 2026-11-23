---
title: SGK Toán 3 KNTT full coverage — practise every lesson B1–B81 in textbook order
description: Fix the daily-practice crash, add structured lesson metadata + an "Ôn theo bài" lesson mode, six new skill families (numbers, arithmetic, fractions, time, money, data), one lenient save-code bump, and two chapter-3 regions for HK2.
status: in-progress
priority: P1
effort: 130h
branch: main
tags: [learning, curriculum, kntt, lesson-mode, skills, save-code, regions, muse]
created: 2026-11-21
---

# SGK KNTT full coverage

Author: "con tôi cần thực hành hết tất cả từ đầu đến cuối". Inputs: [gap report](../reports/261121-0915-sgk-kntt-toan3-curriculum-gap.md), [research 01](research/researcher-01-hk1-missing-lessons.md), [research 02](research/researcher-02-hk2-missing-topics.md), [scout](scout/scout-01-integration-points.md).

## Key decisions
1. **Phase 00 hotfix first, alone.** One pure dispatcher `src/practice/item-for-skill.ts` (reasoning/geo/meas); daily drops skills whose item has a scene but no dialog renderer instead of throwing. RED unit + e2e first. Ships before anything else (live crash).
2. **Lesson data is inverted, not shared.** Skills carry `lessons: {book, n[]}`; a static 81-row table (`kntt-lessons-tap1/2.ts`) holds title paraphrase, chủ đề, kind `skills | mix | tables`. Lesson→skills is *derived* from the catalog, so family phases never edit the table. Luyện tập chung / ôn tập / B20 vẽ = `mix` of listed lessons.
3. **Ôn theo bài** = lesson picker 1→81 grouped by 16 chủ đề, runs 6 items through the extracted daily run loop; introduces untaught skills (unlike daily). Progress ⭐1–3 derived from Leitner boxes (no storage). Coverage test: each practicable lesson has ≥1 generated skill.
4. **Six families, one folder each**, same shape as `src/measurement/`. Items stay `ReasoningItem` (+ optional plain-data `scene`); two inputs (thương + dư) = two steps. MCQ / number pad only; clock is MCQ in v1 (drag hands later).
5. **Save code: exactly one bump, M3D5, lenient.** Well-formed unknown skill/level ids are *skipped*, not rejected; cap is a constant. Every later id/level lands with no further bump. Must merge before the first production deploy carrying new ids. (Per-PR bumps would mean ~10 versions to decode forever.)
6. **Placement.** All 81 lessons live in lesson mode (+ daily once attempted). HK1 gaps get no new 3D content. HK2 gets **2 regions** after the scatter: *Chợ Phiên Tí Hon* (money, time, calendar, data/chance) and *Lâu Đài Số* (numbers to 100 000, big arithmetic, rounding, Roman). REGIONS golden byte-equal, ≤60 draw calls, leak specs. Unlock after cave stage 1 (chapter 3).
7. **Serialization of shared files**: only 00, 01, 02, 06, 18, 21 touch shared files. Phase 02 creates per-family `*-skill-entries.ts` + `*-item-for-skill.ts` (empty) and wires catalog, dispatcher, sticker topics, pool counter once; dialog scene renderers self-register by `import.meta.glob`. Family phases touch only `src/<family>/**` and their own renderer file.
8. **Number ceiling**: the ≤100 content rule stays for legacy families; new families use the lesson's range (1 000 / 10 000 / 100 000). Time allows giờ↔phút only. (Author to confirm, Q1.)
9. **Copyright**: types only, own numbers/contexts; scans stay in (author-local folder outside the repo), never committed, never quoted in code/tests/PRs.

## Phases
| # | Phase | Lane | Deps | Eff | Status |
|---|---|---|---|---|---|
| 00 | [Daily crash hotfix + dispatcher](phase-00-daily-practice-crash-hotfix-and-dispatcher.md) | muse-88 | — | 3h | done (#31) |
| 01 | [Structured lesson metadata + 81-lesson table](phase-01-structured-lesson-metadata-and-lesson-table.md) | muse-min | — | 4h | done (#32) |
| 02 | [Family scaffolding + registries](phase-02-new-family-scaffolding-and-registries.md) | muse-min | 00,01 | 5h | done (#33) |
| 03 | [Save code M3D5 lenient](phase-03-save-code-m3d5-lenient-decoder.md) | muse-min | — | 4h | done (#35) |
| 04 | [Dialog scene registry + geo/meas in daily](phase-04-dialog-scene-registry-geo-meas-in-daily.md) | muse-88 | 00 | 6h | done (#34) |
| 05 | [Lesson planner (pure)](phase-05-lesson-planner-pure.md) | muse-min | 02 | 3h | done (#36) |
| 06 | [Ôn theo bài UI](phase-06-lesson-mode-ui-on-theo-bai.md) | muse-88 | 04,05 | 6h | done (#43) |
| 07 | [Numbers: place value, compare, order](phase-07-numbers-place-value-compare-order.md) | muse-88 | 02 | 5h | done (#39) |
| 08 | [Numbers: rounding, Roman](phase-08-numbers-rounding-and-roman.md) | muse-88 | 07 | 4h | done (#55) |
| 09 | [Arithmetic: add/sub](phase-09-arithmetic-add-sub.md) | muse-88 | 02 | 5h | done (#48) |
| 10 | [Arithmetic: mul/div ≤1000](phase-10-arithmetic-mul-div-to-1000.md) | muse-88 | 09 | 6h | done (#51) |
| 11 | [Arithmetic: mul/div ≤100 000](phase-11-arithmetic-mul-div-large-numbers.md) | muse-88 | 10 | 4h | done (#58) |
| 12 | [Fractions 1/2..1/9](phase-12-fractions-unit-fractions.md) | muse-min | 02 | 4h | done (#37) |
| 13 | [Time + calendar](phase-13-time-clock-and-calendar.md) | muse-min | 02 | 5h | done (#38) |
| 14 | [Money (VND)](phase-14-money-vietnamese-notes.md) | muse-min | 02 | 4h | done (#40) |
| 15 | [Data + chance](phase-15-data-tables-and-chance.md) | muse-min | 02 | 4h | done (#41) |
| 16 | [Scenes: blocks, number line, fractions](phase-16-dialog-scenes-numbers-and-fractions.md) | muse-min | 04,07,12 | 6h | done (#44) |
| 17 | [Scenes: clock, calendar, money, data](phase-17-dialog-scenes-clock-calendar-money-data.md) | muse-min | 04,13,14,15 | 6h | done (#42) |
| 18 | [Chapter-3 regions config](phase-18-chapter-3-regions-config.md) | muse-min + reviewer | 03 | 6h | done (#56) |
| 19 | [Level: Chợ Phiên Tí Hon](phase-19-level-market-cho-phien.md) | muse-min | 17,18 | 8h | done (#59) |
| 20 | [Level: Lâu Đài Số](phase-20-level-number-fort-lau-dai-so.md) | muse-88 | 08,11,16,18 | 8h | done (#61) |
| 22 | [Shop: VLM red scarf visible](phase-22-shop-red-scarf-visible.md) | muse-min | — | 2h | done (#49) |
| 23 | [Shop: wear many items (per body spot) + save code M3D6](phase-23-shop-multi-equip-and-save-code-m3d6.md) | muse-min | 22 | 6h | done (#50) |
| 24 | [Shop: 8–12 new items](phase-24-shop-new-items.md) | muse-min | 23 | 5h | done (#52) |
| 25 | [Level pinch/wheel/button zoom](phase-25-level-pinch-zoom.md) | first free Muse | — | 5h | done (#47, #54) |
| 21 | [Close-out: coverage, docs, e2e, parity, staging](phase-21-close-out-coverage-docs-parity-staging.md) | reviewer | all | 6h | in progress (#65) |

## Lanes / order (child is around B23–B30 now → HK1 gaps first)
Split by file ownership + deps only (both agents same machine, both run e2e); ~53h each.
```
muse-88 : 00 ─ 04 ─ 07 ─ 06 ─ 09 ─ 10 ─ 11 ─ 08 ─ 18 ─ 20     (numbers, arithmetic → Lâu Đài Số)
muse-min: 01 ─ 03 ─ 02 ─ 05 ─ 12 ─ 13 ─ 14 ─ 15 ─ 17 ─ 16 ─ 22 ─ 23 ─ 24 ─ 19 (… → shop issue #45 → Chợ Phiên)
reviewer: parity recapture after 06, 18, 19, 20; workflows; 21
```
Gate: 03 merged before any production deploy that contains 07+ ids. 02 is the only phase that may conflict with 00/01 (rebase).

## Rules (binding, every phase)
RED-first; oracles independent of generators; vi for 7–9 + en mirror; touch ≥44 px; 4 Playwright projects; files <200 lines; conventional commits; parity untouched unless the phase says "reviewer recaptures"; never edit `.github/workflows` (reviewer).

## Author questions — reviewer defaults (follow the textbook; author may override)
Q1 yes, lesson range; time giờ↔phút, ngày↔tháng only. Q2 MCQ only in v1. Q3 two regions, names as planned. Q4 after cave stage 1. Q5 notes only (book has no coins). Q6 all 81 open (author: "thực hành hết tất cả"). Q7 unit fractions only (book).

## Original questions
1. Lift ≤100 to the lesson range for new families? Allow giờ↔phút / ngày↔tháng in time?
2. Drag clock hands in v1, or MCQ only (plan: MCQ)?
3. Two new regions (plan) or three (separate data place)? Names OK: Chợ Phiên Tí Hon, Lâu Đài Số?
4. Chapter 3 unlock: after cave stage 1 (plan) or right after the bridge?
5. Money: notes 1 000–500 000 only, or also 100/200/500 đ coins?
6. Lesson mode open for all 81 lessons from day one (plan), or only up to a "đang học bài" marker?
7. Fractions: unit fractions only (plan) — confirm no 2/3.
