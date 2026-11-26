# Researcher 02 — Pedagogy: add/sub with regrouping ≤1000 + length m/dm/cm/mm

Scope: weak grade 2–3 learner, KNTT curriculum, tap-only items (MCQ / number pad / tap tiles).
Confidence tags: [src] = cited; [prior] = established knowledge, not re-verified this run.

## 1. Error patterns + one-line diagnostic item

### Addition / subtraction (Brown & Burton "bugs", catalogued in MalruleLib; IRIS error analysis)
| Error (bug) | Diagnostic item (wrong answer the bug produces) |
|---|---|
| Forget the carry (write column sum, no carry) | 47+38 → bug 75 (or 715 if writes "15") |
| Carry but not added to next column | 256+178 → bug 324 |
| Smaller-from-larger in every column | 52−27 → bug 35 (correct 25) |
| Borrow but forget to decrement the lender | 63−28 → bug 45 (correct 35) |
| Zero in top: 0−n written as n / stops borrowing at 0 | 403−158 → bug 355 (correct 245) |
| Zero in top: writes 0 (0−n=0) | 305−127 → bug 202 (correct 178) |
| Place-value misalignment (3-digit + 2-digit) | 146+29 placed left-aligned → bug 436 (correct 175) |
| Two regroupings, second one dropped | 385+247 → bug 532 (correct 632) |
Sources: [MalruleLib arXiv](https://arxiv.org/pdf/2601.03217), [IRIS ?p=107126](https://iris.peabody.vanderbilt.edu/?p=107126), [Watson et al. 2018 — failing to regroup is 2nd most common error G1–4](https://core.ac.uk/download/154277561.pdf).
Diagnosis rule: score digit-by-digit right→left; need 3–5 items of the same type before labelling a bug ([IRIS p07](https://iris.peabody.vanderbilt.edu/module/dbi2/cresource/q2/p07/), [IRIS case study](https://iris.peabody.vanderbilt.edu/wp-content/uploads/pdf_case_studies/ics_matherr.pdf)). → Build MCQ distractors FROM these bugs so the chosen wrong option names the bug.
Caution: "cross out zero, write 9" taught as a rote rule breeds misuse; pair with place-value visuals ([CCSD misconceptions](https://issuu.com/ccsd_blast/docs/4.nbt.4-6_math_misconceptions), [CPALMS](https://www.cpalms.org/PreviewStandard/Export/15311)).

### Length conversion [prior]
| Error | Diagnostic item |
|---|---|
| Direction: divides instead of multiplies (big→small) | 3 m = ? cm → bug 3 / 0,03 (correct 300) |
| Wrong factor (10 vs 100) | 4 m = ? dm → bug 400 (correct 40); 2 m = ? cm → bug 20 |
| dm skipped / unknown on the ladder | 1 dm = ? cm (10) and 1 m = ? dm (10) |
| mm↔cm confusion | 5 cm = ? mm → bug 500 (correct 50) |
| Mixed unit concatenation | 1 m 5 cm = ? cm → bug 15 or 150 (correct 105) |
| Mixed unit, ignores the big unit | 2 m 30 cm = ? cm → bug 30 / 32 (correct 230) |
| Compares numbers, ignores units | 9 dm ? 1 m → bug ">" (correct <) |
| Unit choice by object | pencil length ≈ 15 __ (cm vs m vs mm) |

## 2. Varied item formats (each → tap-only adaptation)
1. Column form step-by-step — tap each result digit right→left on number pad; carry/borrow box is a tap-toggle "1".
2. Expanded form — 256+178 = 200+100 | 50+70 | 6+8: tap partial sums from tiles, then total.
3. Base-10 blocks (place-value chart) — tap "đổi 10 chục → 1 trăm" button to regroup; count is shown.
4. Missing digit — 4?7 + 2 5 8 = 7 0 5: tap digit tile for "?".
5. Number line jumps — 385+247: tap jumps +200, +40, +7 from a tile set; landing value auto-shown.
6. Bar model word problem — tap which bar is unknown, then choose operation (+/−), then number pad answer.
7. Estimate / compare — "398+215 gần với 600 hay 700?" tap; "403−158 ? 250" tap < = >.
8. Fix the mistake — show worked column with a bug; tap the wrong digit, then tap correct digit. (Strong for bug remediation.)
9. True / False — "63−28 = 45 ✓/✗".
10. Matching — drag-free: tap left card then right card (expression ↔ result; 1 m ↔ 10 dm ↔ 100 cm).
11. Ruler reading — image of ruler with object; tap answer "6 cm 4 mm" from tiles or pad (cm + mm fields).
12. Unit ladder / conversion table — staircase m→dm→cm→mm, tap ×10 / ÷10 arrows per step; fill table cells by pad.
13. Ordering mixed lengths — tap in order smallest→largest: 1 m 5 cm, 98 cm, 1 m, 9 dm 9 cm.
14. Choose the right unit — object picture + "dài khoảng 2 __" tap m/dm/cm/mm.
15. Odd-one-out — which is NOT equal to 1 m: 10 dm / 100 cm / 1000 mm / 100 mm.
16. Operations on lengths — 3 m 20 cm + 45 cm = ? (pad two fields m, cm) — bridges both topics.

## 3. Sequencing, tiers, spacing
Add/sub tiers (CRA order: blocks → visual chart → pure column) [prior, consistent with KNTT order]:
- T0 no regrouping ≤1000 (warm-up, confidence).
- T1 one regrouping, units→tens (47+38, 146+29). T2 one regrouping, tens→hundreds (256+172).
- T3 two regroupings (385+247; 532−178). T4 zero in middle/end of minuend (403−158, 500−236, 1000−?).
- T5 mixed: missing digit, fix-the-mistake, word problems at T1–T4 numbers.
Subtraction lags addition by one tier; introduce T4 only after T3 ≥80%.
Length tiers: L0 unit sense (choose unit, ruler) → L1 single-step adjacent units (m↔dm, dm↔cm, cm↔mm) → L2 non-adjacent (m↔cm, dm↔mm, m↔mm) → L3 compare/order across units → L4 mixed units (1 m 5 cm ↔ 105 cm, both directions; watch the internal zero) → L5 add/sub of lengths + word problems.
Mastery gate per tier: ~80% over last 8–10 items, no repeated same-bug error.
Spacing / interleaving ([IES practice guide: space learning, interleave worked examples](https://ies.ed.gov/ncee/wwc/PracticeGuide/1); Rohrer interleaving studies [prior]):
- Short sessions: 10–15 min, ~12–20 items; daily or ≥4×/week beats one long block.
- Composition per session: ~60% current tier, ~25% review of earlier tiers, ~15% the other topic (interleave add/sub with length).
- Blocked practice only when a tier is first introduced (first 4–6 items), then interleave.
- Review schedule for mastered tier/bug: 1 → 3 → 7 → 14 days (Leitner-style); a wrong answer drops the item/bug back to box 1.
- After an error: show the bug-specific hint / worked example, then a near-identical retry item; never 3+ fails in a row (auto step down a tier).
- Mix in "fix the mistake" items targeting the child's own detected bug.

## 4. KNTT curriculum order (partially verified)
- Toán 2 KNTT, Chủ đề 11 "Độ dài và đơn vị đo độ dài": Bài 55 "Đề-xi-mét. Mét. Ki-lô-mét" ([loigiaihay](https://loigiaihay.com/giai-bai-55-de-xi-met-met-ki-lo-met-toan-2-ket-noi-tri-thuc-voi-cuoc-song-a86706.html)). cm already from grade 1.
- Toán 2 KNTT, Chủ đề 12 "Phép cộng, phép trừ trong phạm vi 1000": Bài 59 cộng không nhớ ([loigiaihay](https://loigiaihay.com/giai-bai-59-phep-cong-khong-nho-trong-pham-vi-1000-toan-2-ket-noi-tri-thuc-voi-cuoc-song-a86710.html)); next lessons (likely Bài 60 cộng có nhớ, 61 trừ không nhớ, 62 trừ có nhớ) [prior, not verified].
- Toán 3 KNTT Bài 2 "Ôn tập phép cộng, phép trừ trong phạm vi 1000" — items like 146+29, 394−158 ([vietjack](https://vietjack.com/toan-3-kn/bai-2-on-tap-phep-cong-phep-tru-trong-pham-vi-1000.jsp)). Good anchor for item numbers.
- mm: Toán 3 KNTT Bài 30 "Mi-li-mét" ([loigiaihay](https://loigiaihay.com/Trac-nghiem-toan-3-bai-30-ket-noi-tri-thuc-co-dap-an-a130675.html)). (A grade-2 mm page exists on vietjack but likely another series — [vietjack](https://vietjack.com/giai-bai-tap-toan-2/mi-li-met-trang-153.jsp).)
- Implication: dm/m/km + regrouping ≤1000 are grade-2 content; mm and mixed-unit conversion (incl. mm) are grade-3. Grade 2 ranges: lengths in whole units, sums/differences ≤1000.

## Unresolved questions
1. Exact KNTT Toán 2 lesson numbers for cộng/trừ có nhớ ≤1000 and whether "zero in middle" (403−158) is explicitly taught in grade 2 or only grade 3 review — check the official SGK table of contents.
2. Does KNTT grade 2 include mixed-unit forms like "1 m 5 cm", or only grade 3? (affects L4 gating per grade).
3. Child's actual bug profile — run a 10–12 item diagnostic (one per bug above) before fixing tier start.
4. Vietnamese decimal comma convention irrelevant at this level, but confirm no decimals appear in length items.
