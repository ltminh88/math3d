# Research 02: KNTT reasoning ranges, verified (phase 01)

Date 2026-10-31. 4 web calls (loigiaihay TOC, vietjack B25 search, vietjack tổng hợp CĐ4, vietjack B38 search, vietjack B39). [V] = read from source this run; [K] = still model knowledge.

## Lesson titles (Tập 1) [V]
Source: https://loigiaihay.com/sgk-toan-3-ket-noi-tri-thuc-c813.html
- B3 Tìm thành phần trong phép cộng, phép trừ · B13 Tìm thành phần trong phép nhân, phép chia
- B23 Nhân số có hai chữ số với số có một chữ số · B24 Gấp một số lên một số lần · B25 Phép chia hết, phép chia có dư · B26 Chia số có hai chữ số cho số có một chữ số · B27 Giảm một số đi một số lần · B28 Bài toán giải bằng hai bước tính (all in CĐ4 "Phép nhân, phép chia trong phạm vi 100")
- B38 Biểu thức số. Tính giá trị của biểu thức số · B39 So sánh số lớn gấp mấy lần số bé · B42 Ôn tập biểu thức số
- B20 still missing from the page (only matters for geometry, phase 02).

## Ranges
| Item | Finding | Game range (author cap ≤100 everywhere) |
|---|---|---|
| B24/B27/B28 [V] | CĐ4 exercises stay ≤100 (largest seen 80; distractor 90). Examples: 12 cúc, hồng gấp 3 lần → 36, 48; bố 42 tuổi giảm 6 lần → 7, +5 = 12; 42 dưa giảm 7 lần → 6. https://vietjack.com/toan-3-kn/trac-nghiem-bai-tap-tong-hop-phep-nhan-phep-chia-trong-pham-vi-100.jsp | factors 2-9, two-step results ≤100 |
| B25 [V] | "số dư luôn bé hơn số chia"; examples 45 : 6, 31 : 5, 56 cá / 8 → 7 rổ; max remainder for divisor 6 is 5 (65 = 10 × 6 + 5). Context "cần thêm 1 xe" not in the quiz page → kept as [K] (classic KNTT/VBT task). https://vietjack.com/toan-3-kn/bai-25-phep-chia-het-phep-chia-co-du.jsp | divisor 2-9, remainder 1..d-1, total ≤100 |
| B38 [V] | Bracket examples within 100: (15 + 5) : 5, 32 − (25 + 4), 16 + (40 − 16), 40 : (11 − 3), 45 : (5 + 4). Rule: brackets first. Book range is ≤1000; capped at 100 by the author. https://vietjack.com/toan-3-kn/bai-38-bieu-thuc-so-tinh-gia-tri-cua-bieu-thuc-so.jsp | 2 ops (tier 1-2), 3 ops / one bracket pair (tier 3) |
| B39 [V] | Numbers 2-32, "gấp mấy lần" answers 2-10; the lesson contrasts "hơn bao nhiêu" (24 − 6 = 18) with "gấp mấy lần" (24 : 6 = 4) on the same pair. https://vietjack.com/toan-3-kn/bai-39-so-sanh-so-lon-gap-may-lan-so-be.jsp | big = small × n ≤100, n 2-10; `wp-difference-compare` uses this contrast |
| B3/B13 [K] | Not fetched. B13 within the tables (≤90); B3 book range ≤1000 → capped at 100. | sums ≤100; products ≤100 |
| Patterns [K] | No dedicated lesson in the TOC (confirmed: no title mentions dãy số); exercises appear in luyện tập. | +/− steps 1-11, table counting, 5 terms ≤100 |

## Decisions locked in `src/reasoning/reasoning-ranges.ts`
- Tier 1 factors 2-5, small totals (≤30 for remainders); tier 2 factors 2-9; tier 3 same numbers, more reasoning (3 ops, brackets, hidden middle term, expression choice).
- Misconceptions used: cộng thay vì nhân, trừ thay vì chia, hiệu vs thương (B39), dư ≥ số chia (B25), làm tròn xuống (cần mấy xe), trái sang phải, bỏ qua ngoặc (B38), đảo phép tính khi tìm x.
