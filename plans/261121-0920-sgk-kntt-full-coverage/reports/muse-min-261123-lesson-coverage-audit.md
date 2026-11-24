# Kiểm độ phủ 81 bài — audit (phase 21, phần đầu)

- Ngày: 2026-11-23. Người làm: muse-min.
- Nền: main `a5c140f` (sau khi PR #59 phase 19 gộp).
- Phạm vi: chỉ đọc và lập báo cáo, KHÔNG sửa `src/`.
- Bản quyền: chỉ ghi số bài và tên skill/id, không chép đề, số liệu hay câu chữ trong sách.

## Kết quả tóm tắt

- **80/81 bài vào được chế độ “Ôn theo bài”. Chỉ B7 thiếu** (xem “Bài THIẾU” cuối file).
- Generator: 0 lỗi runtime — mọi skill đều sinh câu được ở cả 3 tier (thử tier 1–3 × seed 0, 1, 7); mọi fact nhân/chia đều dựng được câu hỏi.
- Renderer: 0 lỗi — mọi item sinh ra đều hiển thị được trong hộp thoại (kiểm ở box 1 và box 5).
- Không có skill mồ côi: cả 127 skill trong catalog đều có ít nhất một bài dùng tới.
- 9 bài trên đã dày lên nhờ R8 (2026-11-24): mỗi bài có 2 skill khác dạng, lượt ôn 6 câu (2 skill × 3 lượt).

## Phương pháp

Với từng bài B1–B81, lấy khóa từ `skillsOfLesson(n)` trong `src/learning/kntt-lesson-index.ts`
(skill trong catalog trỏ tới bài + fact nhân/chia nếu bài dạng `tables` + hợp các bài nguồn nếu bài dạng `mix`), rồi kiểm 4 cột:

1. **Skill** — có ≥ 1 skill/fact trỏ tới bài không.
2. **Generator** — khóa có generator không (`hasGenerator` trong `lesson-planner.ts`: fact bảng luôn có; skill có khi họ của nó đã sinh) VÀ chạy thật `itemForSkill(id, rng, tier)` không ném lỗi ở tier 1–3 (seed 0, 1, 7); fact kiểm thêm `buildDailyQuestion` không ném lỗi.
3. **Renderer** — item sinh ra hiển thị được trong hộp thoại không (`dialogRenderable`: item không scene luôn hiển thị; item có scene thì loại scene phải có renderer trong `dialog-scene-registry`). Kiểm ở box 1 (chưa học) và box 5 (đã thuộc). Fact bảng luôn hiển thị (hộp thoại quiz).
4. **Ôn theo bài** — `planLessonRun(n, {}, seed, { renderable: isKeyRenderable })` cho ≥ 1 câu không (đúng điều kiện picker ở `src/ui/lesson-picker.ts`: 0 khóa lên lịch được thì hàng bài hiện “Sắp có”, bị vô hiệu). Số câu ghi theo lượt chạy với bài chưa học (box 1).

Kiểm chứng thêm (chạy tạm trên máy, không commit):

- **Bỏ lối thoát trong `lesson-coverage.test.ts`**: đổi `lessonPasses` thành chỉ `keys.some(hasGenerator)` rồi chạy file test — test “every practicable lesson passes” vẫn XANH; chỉ test “a lesson with no skills passes vacuously” đỏ (đúng như thiết kế, vì đó chính là khẳng định của lối thoát). File test đã hoàn nguyên bằng `git checkout` ngay sau khi chạy.
- **Probe loại scene**: sinh 1 item cho mỗi skill × 3 tier (127 skill → 381 item): 135 item có scene, thuộc 25 loại (`angles`, `bag`, `balance`, `cells`, `circle`, `circle-row`, `clock`, `data-table`, `dice`, `figure`, `fraction-pick`, `fraction-set`, `fraction-shape`, `jug`, `month-calendar`, `notes`, `number-line`, `place-value`, `rect`, `ruler`, `segment`, `shapes`, `side-polygon`, `solids`, `tally`, `thermometers`), tất cả đều có renderer, 0 item không hiển thị được. Cột Renderer vì vậy không phải đúng một cách rỗng.
- File probe tạm (`coverage-audit-probe.test.ts`, `coverage-scene-probe.test.ts`) đã xóa sau khi chạy; cây làm việc chỉ còn file báo cáo này.

## Bảng 81 bài

Cột Generator/Renderer ghi dạng ✓ đủ/tổng (số khóa có generator / hiển thị được trên tổng số khóa của bài).
Cột “Ôn theo bài” ghi số câu của một lượt chạy với bài chưa học; “Sắp có” nghĩa là picker hiện bài ở trạng thái vô hiệu.

| Bài | Skill | Generator | Renderer | Ôn theo bài | Ghi chú |
|---|---|---|---|---|---|
| B1 | `num-read-write-1000`, `num-place-value-1000`, `num-neighbors-1000`, `num-compare-1000`, `num-order-1000`, `num-sequence-1000` | ✓ 6/6 | ✓ 6/6 | ✓ 6 câu |  |
| B2 | `add-sub-mental-round`, `add-sub-1000`, `add-sub-1000-wp`, `add-sub-1000-chain`, `add-sub-find-error`, `add-missing-digit` | ✓ 6/6 | ✓ 6/6 | ✓ 6 câu |  |
| B3 | `unknown-add-sub`, `unknown-add-sub-wp` | ✓ 1/1 | ✓ 1/1 | ✓ 6 câu | R8 (2026-11-24): thêm skill thứ hai — lượt ôn 6 câu (2 skill × 3 lượt). |
| B4 | bảng 2, 5: 17 nhân + 18 chia; skill: `pattern-skip-count` | ✓ 36/36 | ✓ 36/36 | ✓ 6 câu |  |
| B5 | bảng 3: 9 nhân + 9 chia; skill: `pattern-skip-count` | ✓ 19/19 | ✓ 19/19 | ✓ 6 câu |  |
| B6 | bảng 4: 9 nhân + 9 chia; skill: `pattern-skip-count` | ✓ 19/19 | ✓ 19/19 | ✓ 6 câu |  |
| B7 | — (không có skill/fact nào) | ✗ 0/0 | ✗ 0/0 | Sắp có | Không thực hành được: bài ôn tập hình học và đo lường, nội dung lớp 2, không có skill lớp 3 nào trỏ tới (mixOf rỗng). |
| B8 | hợp B1, B2, B3, B4, B5, B6, B7 (16 skill); riêng: `pattern-add`, `pattern-sub` | ✓ 82/82 | ✓ 82/82 | ✓ 6 câu |  |
| B9 | bảng 6: 9 nhân + 9 chia; skill: `pattern-skip-count` | ✓ 19/19 | ✓ 19/19 | ✓ 6 câu |  |
| B10 | bảng 7: 9 nhân + 9 chia; skill: `pattern-skip-count` | ✓ 19/19 | ✓ 19/19 | ✓ 6 câu |  |
| B11 | bảng 8: 9 nhân + 9 chia; skill: `pattern-skip-count` | ✓ 19/19 | ✓ 19/19 | ✓ 6 câu |  |
| B12 | bảng 9: 9 nhân + 9 chia; skill: `pattern-skip-count` | ✓ 19/19 | ✓ 19/19 | ✓ 6 câu |  |
| B13 | `unknown-mul-div`, `unknown-mul-div-wp` | ✓ 1/1 | ✓ 1/1 | ✓ 6 câu | R8 (2026-11-24): thêm skill thứ hai — lượt ôn 6 câu (2 skill × 3 lượt). |
| B14 | `fraction-read`, `fraction-shaded`, `fraction-pick-picture`, `fraction-of-set-circle`, `fraction-of-set-number`, `fraction-wp` | ✓ 6/6 | ✓ 6/6 | ✓ 6 câu |  |
| B15 | hợp B9, B10, B11, B12, B13, B14 (8 skill) | ✓ 74/74 | ✓ 74/74 | ✓ 6 câu |  |
| B16 | `geo-midpoint`, `geo-midpoint-length` | ✓ 1/1 | ✓ 1/1 | ✓ 6 câu | R8 (2026-11-24): thêm skill thứ hai — lượt ôn 6 câu (2 skill × 3 lượt). |
| B17 | `geo-circle-parts`, `geo-radius-diameter` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B18 | `geo-right-angle`, `geo-count-right-angles` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B19 | `geo-shape-classify`, `geo-shape-count` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B20 | hợp B17, B18, B19 (6 skill) | ✓ 6/6 | ✓ 6/6 | ✓ 6 câu | Bài thực hành vẽ hình (không vẽ được trong game); ôn qua skill hình học của B17–B19. |
| B21 | `geo-solid-identify`, `geo-solid-parts` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B22 | hợp B16, B17, B18, B19, B20, B21 (9 skill) | ✓ 9/9 | ✓ 9/9 | ✓ 6 câu |  |
| B23 | `mul-2d-1d`, `mul-tens-mental`, `mul-2d-1d-wp` | ✓ 3/3 | ✓ 3/3 | ✓ 6 câu |  |
| B24 | `wp-times-then-add`, `wp-times-then-sub` | ✓ 1/1 | ✓ 1/1 | ✓ 6 câu | R8 (2026-11-24): thêm skill thứ hai — lượt ôn 6 câu (2 skill × 3 lượt). |
| B25 | `div-rem-floor`, `div-rem-ceil`, `choose-all-correct`, `tf-explain` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B26 | `div-2d-1d`, `div-2d-1d-remainder`, `div-tens-mental`, `div-2d-1d-wp`, `mul-div-find-error` | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu |  |
| B27 | `wp-divide-then-add`, `wp-divide-then-sub` | ✓ 1/1 | ✓ 1/1 | ✓ 6 câu | R8 (2026-11-24): thêm skill thứ hai — lượt ôn 6 câu (2 skill × 3 lượt). |
| B28 | `wp-times-then-add`, `wp-divide-then-add`, `wp-more-less-then-total`, `wp-unit-then-times` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B29 | hợp B23, B24, B25, B26, B27, B28 (16 skill) | ✓ 16/16 | ✓ 16/16 | ✓ 6 câu |  |
| B30 | `meas-ruler-read`, `meas-mm-convert` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B31 | `meas-gram`, `meas-gram-calc` | ✓ 1/1 | ✓ 1/1 | ✓ 6 câu | R8 (2026-11-24): thêm skill thứ hai — lượt ôn 6 câu (2 skill × 3 lượt). |
| B32 | `meas-ml`, `meas-ml-calc` | ✓ 1/1 | ✓ 1/1 | ✓ 6 câu | R8 (2026-11-24): thêm skill thứ hai — lượt ôn 6 câu (2 skill × 3 lượt). |
| B33 | `meas-temperature`, `meas-temperature-compare` | ✓ 1/1 | ✓ 1/1 | ✓ 6 câu | R8 (2026-11-24): thêm skill thứ hai — lượt ôn 6 câu (2 skill × 3 lượt). |
| B34 | hợp B30, B31, B32, B33 (5 skill) | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu | Bài thực hành đo (không thao tác dụng cụ trong game); ôn qua skill đo của B30–B33. |
| B35 | hợp B30, B31, B32, B33, B34 (5 skill) | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu |  |
| B36 | `mul-3d-1d`, `mul-hundreds-mental`, `mul-3d-1d-wp` | ✓ 3/3 | ✓ 3/3 | ✓ 6 câu |  |
| B37 | `div-3d-1d`, `div-3d-1d-remainder`, `div-hundreds-mental`, `div-reduce-times`, `mul-div-find-error` | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu |  |
| B38 | `expr-order`, `expr-brackets`, `expr-from-story`, `choose-all-correct`, `tf-explain` | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu |  |
| B39 | `wp-times-compare`, `choose-all-correct`, `tf-explain`, `wp-difference-compare` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B40 | hợp B36, B37, B38, B39 (15 skill) | ✓ 15/15 | ✓ 15/15 | ✓ 6 câu |  |
| B41 | hợp B4, B5, B6, B9, B10, B11, B12, B13, B23, B25, B26, B36, B37 (21 skill) | ✓ 137/137 | ✓ 137/137 | ✓ 6 câu |  |
| B42 | hợp B38 (5 skill) | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu |  |
| B43 | hợp B16, B17, B18, B19, B21, B30, B31, B32, B33, B34 (14 skill) | ✓ 14/14 | ✓ 14/14 | ✓ 6 câu |  |
| B44 | hợp B8, B15, B22, B29, B35, B40, B41, B42, B43 (65 skill) | ✓ 181/181 | ✓ 181/181 | ✓ 6 câu |  |
| B45 | `num-read-write-10000`, `num-place-value-10000` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B46 | `num-compare-10000`, `num-order-10000` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B47 | `roman-to-number`, `number-to-roman`, `roman-sequence`, `roman-clock-hour` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B48 | `round-tens`, `round-hundreds` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B49 | hợp B45, B46, B47, B48 (10 skill) | ✓ 10/10 | ✓ 10/10 | ✓ 6 câu |  |
| B50 | `meas-perimeter-polygon`, `meas-perimeter-rect`, `meas-perimeter-square`, `meas-wp-fence` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B51 | `meas-area-count`, `meas-area-equal` | ✓ 1/1 | ✓ 1/1 | ✓ 6 câu | R8 (2026-11-24): thêm skill thứ hai — lượt ôn 6 câu (2 skill × 3 lượt). |
| B52 | `meas-area-rect`, `meas-area-square` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B53 | hợp B50, B51, B52 (7 skill) | ✓ 7/7 | ✓ 7/7 | ✓ 6 câu |  |
| B54 | `add-4digit`, `add-sub-10000-wp`, `add-sub-find-error`, `add-missing-digit` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B55 | `sub-4digit`, `add-sub-10000-wp`, `add-sub-find-error`, `add-missing-digit` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B56 | `mul-4d-1d`, `mul-thousands-mental`, `mul-div-large-wp`, `mul-chain-operators` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B57 | `div-4d-1d`, `div-4d-1d-remainder`, `div-thousands-mental`, `mul-div-large-wp`, `mul-chain-operators` | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu |  |
| B58 | hợp B54, B55, B56, B57 (12 skill) | ✓ 12/12 | ✓ 12/12 | ✓ 6 câu |  |
| B59 | `num-read-write-100000`, `num-expand-100000` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B60 | `num-compare-100000`, `num-order-100000` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B61 | `round-thousands`, `round-ten-thousands`, `round-which-place` | ✓ 3/3 | ✓ 3/3 | ✓ 6 câu |  |
| B62 | hợp B59, B60, B61 (7 skill) | ✓ 7/7 | ✓ 7/7 | ✓ 6 câu |  |
| B63 | `add-5digit`, `add-sub-100000-wp`, `add-sub-find-error`, `add-missing-digit` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B64 | `sub-5digit`, `add-sub-100000-wp`, `add-sub-find-error`, `add-missing-digit` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B65 | hợp B63, B64 (5 skill) | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu |  |
| B66 | `clock-read-hour-half`, `clock-read-5min`, `clock-read-minute`, `clock-sang-chieu-24h`, `clock-elapsed-minutes`, `times-order-digital`, `months-days-count`, `calendar-weekday`, `calendar-days-between` | ✓ 9/9 | ✓ 9/9 | ✓ 6 câu |  |
| B67 | hợp B66 (9 skill) | ✓ 9/9 | ✓ 9/9 | ✓ 6 câu | Bài thực hành xem đồng hồ, xem lịch; ôn qua 9 skill của B66. |
| B68 | `money-recognize`, `money-total-notes`, `money-exchange`, `money-change-back`, `money-pick-notes`, `money-wp` | ✓ 6/6 | ✓ 6/6 | ✓ 6 câu |  |
| B69 | hợp B66, B67, B68 (15 skill) | ✓ 15/15 | ✓ 15/15 | ✓ 6 câu |  |
| B70 | `mul-5d-1d`, `mul-div-large-wp`, `mul-chain-operators` | ✓ 3/3 | ✓ 3/3 | ✓ 6 câu |  |
| B71 | `div-5d-1d`, `div-5d-1d-remainder`, `mul-div-large-wp`, `mul-chain-operators` | ✓ 4/4 | ✓ 4/4 | ✓ 6 câu |  |
| B72 | hợp B70, B71 (5 skill) | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu |  |
| B73 | `tally-count`, `table-read`, `table-max-min`, `table-sums`, `table-fill-missing` | ✓ 5/5 | ✓ 5/5 | ✓ 6 câu |  |
| B74 | `chance-bag`, `chance-dice` | ✓ 2/2 | ✓ 2/2 | ✓ 6 câu |  |
| B75 | hợp B73, B74 (7 skill) | ✓ 7/7 | ✓ 7/7 | ✓ 6 câu |  |
| B76 | hợp B45, B46, B47, B48, B59, B60, B61 (17 skill) | ✓ 17/17 | ✓ 17/17 | ✓ 6 câu |  |
| B77 | hợp B54, B55, B63, B64 (8 skill) | ✓ 8/8 | ✓ 8/8 | ✓ 6 câu |  |
| B78 | hợp B56, B57, B70, B71 (10 skill) | ✓ 10/10 | ✓ 10/10 | ✓ 6 câu |  |
| B79 | hợp B16, B17, B18, B19, B21, B30, B31, B32, B33, B34, B50, B51, B52 (21 skill) | ✓ 21/21 | ✓ 21/21 | ✓ 6 câu |  |
| B80 | hợp B73, B74 (7 skill) | ✓ 7/7 | ✓ 7/7 | ✓ 6 câu |  |
| B81 | hợp B49, B53, B58, B62, B65, B69, B72, B75, B76, B77, B78, B79, B80 (78 skill) | ✓ 78/78 | ✓ 78/78 | ✓ 6 câu |  |

## Bài THIẾU

Chỉ 1 bài không vào được “Ôn theo bài”:

| Bài | Lý do | Gợi ý cho phase 21 |
|---|---|---|
| B7 | Bài ôn tập hình học và đo lường, nội dung lớp 2; `mixOf` rỗng nên không có skill/fact nào trỏ tới; `practicable: false`. Không ép skill. | Quyết định một trong hai: (a) gắn B7 với skill hình học/đo lường hiện có (B16–B19, B30–B33) để bài ôn được, hoặc (b) giữ nguyên “Sắp có” và ghi rõ trong tài liệu là bài không thực hành được trong game. |

## Ghi chú thêm cho phase 21

- 9 bài trên đã được làm dày ở R8 (2026-11-24): mỗi bài thêm 1 skill mới (xem bảng), lượt ôn 6 câu (2 skill × 3 lượt).
- B81 hợp 78 skill (qua các bài ôn nguồn); lượt chạy 6 câu vẫn đủ vì planner trải đều theo nguồn.
- B20, B34, B67 là bài thực hành tay (vẽ hình / thao tác dụng cụ đo / xem đồng hồ, lịch thật) nên không có skill riêng; cả ba đều ôn được qua skill của bài nguồn — không thiếu.
