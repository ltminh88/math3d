# Researcher-02: Toán 3 KNTT tập 2 — missing topics, exercise types (dạng bài)
Source: scanned PDF, 8 tiles (~32 pages) sampled at r70. Everything below is generic TYPES, no book exercise data.
Confidence: [R]=read on page, [I]=inferred from CT GDPT 2018 / pattern, unverified (pages not sampled).

## Cross-cutting UI conventions in the book (reuse in game)
- Recurring form tags: "Số ?" (fill number), "Đ, S ?" (true/false), ">, <, = ?" (compare), "Chọn câu trả lời đúng" (A-D MCQ), "Đặt tính rồi tính", "Tính nhẩm (theo mẫu)". [R]
- Every lesson = Khám phá (concept) -> Hoạt động (guided) -> Luyện tập. Word problems use a recurring set of characters (game uses its own cast).
- Touch hard spots: vertical (đặt tính) arithmetic with carry; analog clock hands; calendar grid. Others are fine as MCQ/number pad.

## CĐ8 (tr.4-16)
### B45 số 4 chữ số, số 10 000 (tr.4-8) [R]
- Range 1000..9999, then 10 000 ("mười nghìn").
- Forms: (1) bảng hàng nghìn/trăm/chục/đơn vị with khối 1000/100/10/1 -> read/write number; (2) given "a nghìn b trăm c chục d đơn vị" -> write number + read aloud (zeros in middle, e.g. 0 trăm); (3) số tròn nghìn on a road/sign sequence 1000,2000..; (4) number line of the last few numbers before 10 000; (5) 10 khối nghìn = 10 000. [R]
- Visual: base-10 blocks + place-value table (reusable component). Number line with ticks.
- Hard: reading aloud in Vietnamese (zero handling "không trăm", "lẻ", "mốt/tư/lăm") -> show text options not audio.
- Interaction: kéo thả khối vào cột hàng (tap +/- per column, stepper); nhập số; MCQ for "đọc là".
- Skills: `place-value-4digit-build` (T1), `read-write-4digit` (T1-2, zero-in-middle = T2), `number-line-to-10000` (T1), `ten-thousand-concept` (T1).

### B46 so sánh trong phạm vi 10 000 (tr.9-11) [R p.9]
- Rule shown: fewer digits = smaller; same digit count -> compare left->right by column. Table of columns used.
- Forms: >,<,= between two numbers (two 4-digit numbers; 3-digit vs 4-digit); [I] xếp thứ tự tăng/giảm 3-4 numbers, tìm số lớn nhất/bé nhất, compare expression vs number (sum of round thousands + hundreds vs "a nghìn b trăm") [I].
- Interaction: chọn dấu (3 buttons); sắp xếp = kéo thẻ số vào dải; "tìm lớn nhất" = chạm thẻ.
- Skills: `compare-4digit` (T1: differ at thousands; T2: differ at tens/units; T3: 3-digit vs 4-digit, equal-prefix traps), `order-4digit-asc-desc` (T2-3).

### B47 số La Mã (tr.12-14) [R p.12,14]
- Range: I..XX (book table I-X, XI-XX, 1-20 shown). Only symbols I, V, X.
- Forms: (1) read analog clock with Roman numerals face -> giờ (hour-only A-D clocks); (2) find missing Roman in a consecutive sequence in the teens; (3) sắp thứ tự 4 Roman numbers in 11..20; (4) match Roman-face clock to digital time on the hour, incl. afternoon 24h times (kim giờ chỉ the 12h-equivalent); (5) maze: path through Roman 1..20 ascending. [R]
- Rule: IV=4, IX=9, subtractive only before V/X; XIV, XIX, XX.
- Hard: Roman clock face rendering -> draw SVG with Roman labels; clock matching with 24h needs sáng/chiều awareness.
- Interaction: chọn đáp án (Arabic <-> Roman both directions); sequence-fill = 3-4 options; clock = MCQ giờ.
- Skills: `roman-numeral-1-10` (T1), `roman-numeral-11-20` (T2), `roman-order-sequence` (T2), `roman-clock-hour` (T3).

### B48 làm tròn đến hàng chục, hàng trăm (tr.15-16) [R p.15]
- Convention: look at the digit right of target place; <5 làm tròn xuống, >=5 làm tròn lên (digit 5 rounds UP). Round 4-digit numbers to tens (up and down cases). Hundreds [I]: look at tens digit.
- Context: "khoảng" — approximate distance/quantity.
- Forms: [I] làm tròn each number to tens/hundreds; "số nào làm tròn thành X"; ước lượng tổng/tích đến hàng trăm; Đ/S about rounding.
- Skills: `round-to-tens` (T1 within 100s; T2 4-digit; T3 digit 5 and 9s carry, e.g. rounding up across a thousand), `round-to-hundreds` (T2/T3), `round-estimate-context` (T3).
- Interaction: nhập số / MCQ 3 options (down, up, distractor = truncated wrong direction). Number-line "which tens is nearer" helpful visual.

## CĐ10 (tr.38-51) phạm vi 10 000 — B54 cộng, B55 trừ, B56 nhân [R], B57 chia [R]
- B54 cộng: 4-digit + 4-digit, written method with carry (carry through 3 columns); sum up to 9999 (sum <=10 000 [I]). Word theme: two group sizes, total. [R]
- B55 trừ: 4-digit - 4-digit and -3/2-digit with borrow (borrow in units & tens; 4-digit − 2-digit; 4-digit − 4-digit). Theme: two heights, difference. [R]
- B56 nhân: 4-digit x 1-digit (result < 10 000); tính nhẩm số tròn nghìn x 1-digit ("a nghìn x b = ab nghìn"); perimeter of square with side 4-digit. Carry limit: 4-digit product stays in 4 digits at this level (book tasks with carry across tens/hundreds present). [R]
- B57 chia: 4-digit : 1-digit, write division (zero in quotient; quotient 3-digit when first digit < divisor). Remainder cases (table Số bị chia/Số chia/Thương/Số dư; "chia thành nhóm còn dư mấy"). Tính nhẩm round thousands : digit. Compare expression (round thousands : digit) vs number. "Gấp n lần" problems (3x, 4x of a quantity). [R]
- Tiers per op: T1 no carry/no borrow; T2 one carry/borrow; T3 carry through 2-3 columns, zero in middle (e.g. round thousands − 4-digit). Divide: T1 exact, quotient 4-digit; T2 quotient 3-digit; T3 zero in quotient and remainder.
- Word themes (generic): group sizes, heights, splitting people into groups with leftovers, ages, "gấp n lần" distances, packing items into boxes, cloth per outfit (chia có dư).
- Touch interaction: DO NOT build full column-input first. Suggest 2 modes: (a) "result only" nhập số with number pad (simple, T1-2); (b) column mode: tap digit boxes right-to-left with auto carry marker shown, only for T3. For division use bảng Số bị chia/Số chia/Thương/Số dư with 2 number inputs (thương, dư) — easy.
- Skills: `add-4digit-written` (T1-3), `sub-4digit-written` (T1-3), `mul-4digit-by-1digit` (T1-3), `mul-round-thousands-mental` (T1), `div-4digit-by-1digit` (T1-3), `div-with-remainder-4digit` (T2-3), `div-mental-thousands` (T1), `compare-expressions-4digit` (T3), `word-problem-add-sub-10000`, `word-problem-mul-div-10000` (T2-3), `times-as-many-problem` (T2).

## CĐ11 số 5 chữ số, đến 100 000 (tr.56-65)
### B59 (tr.56-59) [R]
- 5 digits, 10 000..100 000; hàng chục nghìn column; blocks 10 000. Read 5-digit numbers, incl. zero in middle. Round ten-thousands sequence on a chain 10 000, 20 000 ... 100 000 (find ?) [R].
- Forms: MCQ on the ten-thousands digit (trap: 100 000 has 6 digits); phân tích 5-digit number into sum of place values ("Số ?" in a slot); Đ/S about a run of consecutive 5-digit numbers (consecutive reasoning). [R]
- Skills: `place-value-5digit` (T1), `expand-5digit` (T2), `read-write-5digit` (T2 zero in middle T3), `consecutive-5digit-reasoning` (T3), `round-thousands-chain-10000-100000` (T1).
### B60 so sánh (tr.62) [R]
- Đ/S on inequalities, >,<,= between numbers, comparing number vs its expanded form, "pick the bigger branch" -> sort/compare among 5-digit set. Same rule as B46 (digit count, then left to right).
- Skills: `compare-5digit` (T1 diff at tens of thousands; T2 diff at lower place; T3 vs expanded form), `order-5digit` (T2-3), `max-min-5digit-from-digits` [I] (T3).
### B61 làm tròn đến hàng nghìn, chục nghìn (tr.65) [R]
- Round 5-digit and 4-digit numbers to thousands and to ten-thousands. Same <5 down / >=5 up. MCQ "rounded quantity to ten-thousands" (wrong options show other roundings); "three answers all correct, differing only by rounding place" (identify which place each used: hundreds / thousands / ten-thousands); same number rounded to two places; edge case: 4-digit near 10 000 rounding up across the boundary. [R]
- Skills: `round-to-thousands` (T1/T2; crossing boundary to 10 000 = T3), `round-to-ten-thousands` (T2/T3), `identify-rounding-place` (T3), `round-word-problem-kg-km` (T2).
- Interaction: MCQ 4 options, plus nhập số; number-line optional.

## CĐ12 cộng trừ trong phạm vi 100 000 (tr.70-75)
- B63 cộng [R]: 5-digit + 5-digit, 5-digit + 3/4-digit (and 4-digit + 5-digit); carry chain 3 digits; expression with 3 terms of round thousands / round hundreds; missing-digit "Tìm chữ số" in written addition; word: two groups total; compare which of two 3-term +/- expressions is larger; route with two legs, total; "hiệu của số lớn nhất có 5 chữ số và số bé nhất có 3 chữ số khác nhau" type (max/min by digit-count constraint, then difference) [R].
- B64 trừ [I, not rendered]: same pattern mirrored (borrow chain, 5-digit - 4-digit etc.). Sample missed — unverified.
- Tiers: T1 no carry; T2 1-2 carry; T3 chain carry/borrow, 3-term expressions, missing digit.
- Interaction: number pad for result; "missing digit" = tap-slot with digit keypad; compare expressions = chọn >,<,=.
- Skills: `add-5digit` (T1-3), `sub-5digit` (T1-3), `add-sub-3term-expression-5digit` (T2-3), `missing-digit-written-add` (T3), `compare-expression-values-5digit` (T3), `word-problem-add-sub-100000` (T2-3), `max-min-digit-count-difference` (T3).

## CĐ13 (tr.77-87)
### B66 xem đồng hồ, tháng-năm (tr.77-80) [R]
- Clock: 1 hour = 60 phút, minute ticks; read time to the minute (giờ + phút, both 5-min multiples and arbitrary minutes), "Số ?" for giờ/phút with sáng/chiều; daily activities at a given time sáng/chiều. Elapsed time between 2 clocks (MCQ with 5-min-step options) [R p.82]. Digital 24h clocks (afternoon/evening times, start→end): order activities chronologically [R p.82].
- Calendar [R p.80]: tháng 30/31 ngày (list months), tháng 2 mấy ngày; read a month calendar page: which weekday is last day, what is first day of next month; trips spanning month end (count days inclusive across two months, MCQ).
- Visual: analog clock w/ minute-level ticks; tờ lịch tháng (7 cols, 3 months in year); digital 24h.
- Skills: `read-clock-minute` (T1: giờ đúng/ :30; T2: 5-min multiples; T3: any minute), `clock-sang-chieu-24h` (T2), `elapsed-time-minutes` (T3), `order-times-digital` (T2), `months-30-31-days` (T1), `calendar-weekday-reading` (T2), `days-between-dates-calendar` (T3).
- Interaction: kéo kim đồng hồ (drag minute hand, snap to 1 min; hour hand auto-follows) for "đặt giờ" tasks T2-3 — worth building; reading mode = MCQ 3-4 options (cheap, default). Calendar: tap-on-date highlighting; month list = multi-select chips.
### B67 thực hành xem đồng hồ, lịch (tr.81-84) [R p.82]
- Mostly mixed application: scheduling by digital times, picking all dates of a given weekday in a month calendar (tap dates), elapsed minutes MCQ. [R]
- Skills (above reuse) + `calendar-pick-weekdays` (T2) ; `schedule-order-by-time` (T2).
### B68 tiền Việt Nam (tr.85-87) [R p.85]
- Denominations shown: tờ từ 1 000 đồng lên — 1 000, 2 000, 5 000, 10 000, 20 000, 50 000, 100 000, then 200 000, 500 000 (polymer notes, each face+back). Verify exact first rows 100/200/500 đồng coins are not in this lesson (first rows look like 1 000+, confirm).
- p.86-87 NOT sampled: [I] forms = nhận biết tờ tiền, đổi tiền (one large note = how many smaller notes), tính tiền mua hàng, tiền thừa trả lại, ghép tờ tiền đủ số tiền; a "pay with one large note for n items at a unit price -> change back" type appears in CĐ14 [R p.96] as the typical change problem.
- Hard: reading banknotes images — need 9 note art (use flat colored cards with value text, NOT scans: copyright/legal tender image rules).
- Interaction: chọn tờ tiền (tap notes into a wallet tray, total shown), "đủ/chưa đủ" MCQ, tiền thừa = nhập số.
- Skills: `money-recognize-vnd` (T1), `money-add-notes` (T1-2), `money-exchange-notes` (T2), `money-change-back` (T2-3), `money-pick-notes-for-amount` (T3, min notes = T3 extra).

## CĐ14 (tr.94-100) [R]
### B70 nhân số 5 chữ số với số 1 chữ số (tr.94-96)
- 5-digit x 1-digit worked example; product < 100 000 (practice items with 0-2 carries and zero digits in multiplicand); chain operators (round thousands x a then x b = tracing flow on arrows); expression 5-digit + 5-digit x digit (mul before add); word: n items at a unit price paid with a large note -> tiền trả lại; two groups, one = k x round thousands, plus another amount -> total.
- Skills: `mul-5digit-by-1digit` (T1 no carry; T2 carry 1-2 cols; T3 chain carry & zero), `mul-chain-operators` (T2 "x a rồi x b"), `expression-mul-add-5digit` (T3), `word-problem-mul-money-change` (T3).
### B71 chia số 5 chữ số cho số 1 chữ số (tr.98-100)
- 5-digit : 1-digit worked examples (exact and with remainder; quotient 4-digit when first digit < divisor); table Số bị chia / Số chia / Thương / Số dư with "Viết là: a : b = q (dư r)"; three divisions -> find largest/smallest result among 3; word: chia đều a 5-digit mass into n vehicles; cloth length into outfits of k m (dư); n items packed k per box.
- Skills: `div-5digit-by-1digit` (T1 exact, quotient 4-digit; T2 quotient 5-digit; T3 zero in quotient), `div-5digit-remainder` (T2-3, nhập thương + dư), `div-compare-results-max-min` (T3), `word-problem-div-100000` (T2-3).
- Interaction: same as CĐ10; two-input thương/dư via number pad; do not demand long-division column UI.

## CĐ15 (tr.103-109)
### B73 thu thập, phân loại, bảng số liệu (tr.103-107) [R]
- Tally records: marks "x" (miss) / "O" (hit) per kid -> count hits. Bảng số liệu (1 row): counts per category (e.g. kinds of farm animals, 2-3 digit counts) -> read value, "loại nhiều nhất/ít nhất", total. Table 2-row: items sold per month for two kinds -> sum per month/per type/both. Fill missing cells (daily max/min temperature over a few days, "ngày nào dưới k°C"); class table (nam, nữ, cả lớp = nam+nữ; fill ? cells, which class most/least, which are equal). [R]
- Visual: table (1-3 rows x 3-5 cols), tally strip. Numbers up to 3 digits.
- Hard: tally marks — render as grid of X/O tokens; counting by tap.
- Skills: `tally-count-from-marks` (T1), `table-read-single-row` (T1), `table-max-min-compare` (T2), `table-two-row-sums` (T2), `table-fill-missing-cell` (T3 uses row/col totals), `table-threshold-question` (T3 "<k°C").
- Interaction: chọn đáp án (MCQ), nhập số; fill-missing = tap cell + keypad.
### B74 khả năng xảy ra (tr.108-109) [R p.109]
- Vocabulary: chắc chắn / có thể / không thể. Setup: bag with mostly one kind of object + one of another kind; pick 2 -> Đ/S statements classified chắc chắn / có thể / không thể. Dice (xúc xắc) 6 faces seen from 2 views -> events possible on one roll; [I] p.108 uses a similar item (box colours, spin).
- Skills: `chance-certain-possible-impossible` (T1 one colour box; T2 two-pick; T3 dice with hidden faces), `chance-dice-faces` (T2-3).
- Interaction: chọn 1 of 3 (chắc chắn / có thể / không thể) per statement; dice faces rendered as SVG with 2 visible views.

## Overall difficulty tier proposal (consistent across topics)
- T1: single-step, no carry/boundary traps, small numbers; T2: one carry/borrow, typical round-edge; T3: chain carry, zero in middle, expressions, 2-step word problem.

## Generation notes (original questions)
- Rounding: define convention in code once: 5 -> up; reuse across `round-*` skills. Generator distractors: truncate, round wrong place, round wrong direction.
- Division: choose divisor 2-9; for T3 force zero in quotient by constructing a = q*d + r.
- Word problems: reuse theme tags (money change, equal groups, population, distance); randomize names/objects; do not reproduce book numbers.
- Roman: generator pool 1..20 only; clock Roman face same SVG as Arabic with labels swapped.

## Coverage limits
- Pages not read: B64 (CĐ12 trừ), B68 p.86-87, B73 p.104/106, B74 p.108, most B46/B48 hundreds-rounding pages, B67 p.81/83-84. Marked [I]. 1 tile per lesson group only.
- 100-dpi legibility: some mini-numbers on clock/calendar unreadable; confirm denominations 100/200/500 đồng coins excluded.

**Status:** DONE_WITH_CONCERNS
**Summary:** Types, ranges, rules, visuals, skill ids and tiers extracted for all requested topics from 8 sampled tiles.
**Concerns:** B64, B68 p.86-87, B74 p.108 and B73 interior pages unread (inferred); report ~150 lines.

## Unresolved questions
1. B64 trừ in 100 000: any special type (e.g. missing-digit subtraction, 100 000 - n)? Need pages 71-76 follow-up.
2. B68 p.86-87: which exact money forms (change, exchange, min notes)? Coins excluded?
3. Is hundreds-rounding scope limited to 3-4 digit numbers (B48 p.16)?
4. Does game want a drag-hand clock (build cost) or MCQ-only for clocks in v1?
