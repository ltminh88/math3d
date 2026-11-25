# R21 — Rà soát lời thoại cho trẻ 7–9 tuổi (muse-min)

- Ngày: 2026-11-25. Nhánh: `muse-min/dialogue-polish` (từ main 8e7a564, sau PR #69).
- Nhiệm vụ: R21 (reviewer, #64). Trả lời QUESTION M19: ANSWER R24.
- Phạm vi: chuỗi vi trong `*-strings.ts` (họ bài học + màn chơi + UI/nhiệm vụ) và chuỗi vi viết cứng
  trong `src/ui/quiz-answer.ts`, `src/quiz/hint-text.ts`. Không đổi nội dung toán, độ khó,
  generator, RNG, golden. Không viết lại tiếng Anh.

## Quyết định R24 đã áp dụng

- Q1 — Xưng hô: tất cả gọi trẻ là **"bạn"** (VLM là bạn đồng hành). Đổi "con"/"bé"/"em" chỉ trẻ
  sang "bạn" (cả Học tiếp/daily). Giữ "con" không phải gọi trẻ (con vật, con số, con đường).
  "mình" là VLM tự xưng — giữ nguyên. Câu sau khi đổi phải tự nhiên, không thay máy móc.
- Q2 — Chỉ sửa câu chữ, giữ giải thích chung. Giải thích riêng theo skill là task sau;
  mục 5 liệt kê 10 nhóm skill nên có giải thích riêng nhất (gợi ý thôi, không viết).
- Q3 — Có rà `quiz-answer.ts` + `hint-text.ts` (chỉ chữ, không đổi logic);
  `legacy-translations-en.ts` chỉ kiểm đủ khoá, không viết lại.

## Cách làm

1. **Khảo sát:** 1.534 giá trị chuỗi vi trong các file `*-strings.ts` (họ bài học ~600,
   màn chơi ~620, UI ~300) + 81 tiêu đề bài + ~25 key gợi ý chung. Lời thoại trong phạm vi
   ~330 key (hint/ask/explain/wrong/story/prompt/guide/correct/encourage/finish).
2. **Kiểm cơ học (probe tạm, đã xoá):** sinh item cho 136/136 skill × 3 tier × 4 seed
   (1.632 item, 6.838 prompt) — **0 lỗi** placeholder sót, danh từ chưa dịch, rò key,
   khoảng trắng, số dính đơn vị, `undefined`/`NaN`. Đợt sửa này chỉ là câu chữ, không sửa lỗi cơ học.
3. **Rà câu chữ:** đọc hết 1.419 chuỗi vi — 0 lỗi chính tả/dấu; 3 câu dài; vài từ khó +
   thuật ngữ chưa thống nhất (chi tiết trong `~/workspace/p21r21-wording-scan.md`).
4. **Sửa theo 4 nhóm song song** (họ bài học, màn chơi, UI/nhiệm vụ, kho legacy), mỗi nhóm
   tự kiểm typecheck + vitest phần mình; gom lại, cập nhật test expectation, chạy full gates.
5. **Kiểm tra cắt chữ** bằng probe Playwright thật ở mobile-pixel 412×915 và tablet-portrait 834px
   (xem mục 4).

## 1. Chuỗi đã sửa — 41 chuỗi vi + 1 CSS

### Họ bài học (9 chuỗi)

| File / key | Cũ | Mới | Lý do |
|---|---|---|---|
| fractions `wpShare` | Có {count} {item}. Hoa chia cho em 1/{n} số đó. | …Hoa chia cho bạn 1/{n} số đó. | R24 Q1: "em" ở đây là trẻ chơi |
| fractions `askWpGive` | Em được mấy {item}? | Bạn được mấy {item}? | R24 Q1 |
| numbers `askMissingArabic` | …Viết bằng số thường (ví dụ 7). | …Viết bằng số (ví dụ 7). | "số thường" không phải thuật ngữ chuẩn |
| time `roman24Story` | Buổi chiều đồng hồ có số La Mã chỉ như hình bên. | Buổi chiều, đồng hồ số La Mã chỉ như hình bên. | Thiếu dấu phẩy sau "Buổi chiều", "chỉ" treo |
| reasoning `unknownWpSubPack` | {who1} có một số {item}. … Bây giờ {who1} còn {b} hộp, mỗi hộp có {c} {item}. | {who1} có một số hộp như nhau, mỗi hộp có {c} {item}. … Bây giờ {who1} còn {b} hộp. | Hộp xuất hiện đột ngột ở câu cuối; đã kiểm generator khớp toán (còn lại = b×c, ban đầu = a + b×c); mirror `unknownWpMulBoxes` |
| word-problem-context `wpDivideThenSub` (×4: gốc/Harvest/Make/Pack) | …{who1} đã dùng/ăn/lấy ra số {item} bằng số {item} của {who2}. | Số {item} {who1} đã dùng/ăn/lấy ra bằng số {item} của {who2}. | Câu cuối lặp "số {item}" nặng, đọc rối |

### Màn chơi + gợi ý (12 chuỗi)

| File / key | Cũ | Mới | Lý do |
|---|---|---|---|
| city `hintFive` | Mốc dễ nhớ: {a} × 5 = {five}… | Nhớ số này nhé: {a} × 5 = {five}… | "mốc" là từ lạ với trẻ 7–9 |
| tower `hint4MulUp/Down`, `hint4DivUp/Down` (×4) | Mốc dễ nhớ: … | Nhớ số này nhé: … | Như trên |
| forest `guideFamily` | …Một phép nhân cho ta hai phép chia! | …cho mình hai phép chia! | "ta" trang trọng → "mình" (VLM tự xưng) |
| tower `guideFamily` | Một phép nhân cho ta hai phép chia đó! | …cho mình hai phép chia đó! | Như trên |
| tower `promptFamily` | Ba số {a}, {b} và {p} là một nhà. … | …là một gia đình phép tính. … | Thống nhất thuật ngữ với forest `familyPrompt`; en sẵn "are one family" nên càng khớp |
| workshop `keysHelp` | Phím: gõ số rồi Enter · 1–4 chọn đáp án · → đi tiếp · Space đặt một hàng · H gợi ý | Gõ số rồi Enter để trả lời. Phím 1–4 để chọn, → đi tiếp, Space đặt một hàng, H gợi ý. | Câu cũ 23 từ, dạng liệt kê khó đọc → 2 câu ngắn |
| workshop-hint `h3Unit` | Đơn vị diện tích mang tên ô vuông dùng để đo. | Đơn vị diện tích là ô vuông dùng để đo. | "mang tên" rườm rà, gây khó hiểu |
| workshop-hint `h3CmToMm` | {n} cm là {n} lần 10 mm. | {n} cm bằng {n} × 10 mm. | Viết thẳng phép tính, trẻ nhìn là thấy cách đổi |
| numberfort `intro` | Lâu đài mở rồi! Mỗi câu trả lời đúng là một viên đá bạn đặt lên tường thành, đủ sáu viên thì lâu đài hoàn thành. (22 từ) | Lâu đài mở rồi! Mỗi câu đúng là một viên đá bạn đặt lên tường thành. Đủ sáu viên thì lâu đài hoàn thành. | Tách thành 2 câu ngắn; giữ "bạn" (nhất quán với market `intro`) |

### UI / chuỗi nhiệm vụ (20 chuỗi)

| File / key | Cũ | Mới | Lý do |
|---|---|---|---|
| quest-chain `copyTower` | Thử thách cuối đã mở! …tới ngọn tháp cao nhất… | Thử thách cuối của chương 1 đã mở! … | Trùng câu với `copyCave`; tháp là cuối chương 1 |
| quest-chain `copyCave` | Thử thách cuối đã mở! …tới hang đá… | Thử thách cuối của chương 2 đã mở! … | Hang là cuối chương 2 |
| quest-chain `copyNumberfort` | …về phía tháp, rồi rẽ sang lâu đài… | …về phía tháp. Rẽ sang lâu đài… | Câu 22 từ → tách 2 câu |
| quest-chain `guideGarden` | …luyện thêm phép nhân cùng mình nhé! | …luyện thêm dãy số cùng mình nhé! | Vườn là quy luật/dãy số |
| quest-chain `guideValley` | …phép nhân… | …hình học… | Thung lũng là hình học |
| quest-chain `guideWorkshop` | …phép nhân… | …đo lường… | Xưởng là đo lường |
| quest-chain `guideCave` | …phép nhân… | …đố vui… | Hang là đố vui |
| quest-chain `guideMarket` | …luyện thêm phép nhân cùng mình nhé! | …luyện thêm cùng mình nhé! | Chợ trộn đồng hồ/lịch/tiền/dữ liệu — bỏ chủ đề cho đúng |
| quest-chain `guideNumberfort` | …phép nhân… | …số lớn… | Lâu đài là số lớn |
| quest-chain `guideComingSoon` | …bạn luyện thêm phép nhân cùng mình nhé? | …bạn luyện thêm cùng mình nhé? | Câu chung, bỏ chủ đề sai |
| sticker-book `eyebrow` | BỘ SƯU TẬP CỦA CON | BỘ SƯU TẬP CỦA BẠN | R24 Q1 |
| sticker-book `earnedLine` | {name} — con đã thuộc! | {name} — bạn đã thuộc! | R24 Q1 |
| sticker-book `earningLine` | Con vừa dán được hình {name}! | Bạn vừa dán được hình {name}! | R24 Q1 |
| sticker-book `bookNote` | …hình con đã dán được… | …hình bạn đã dán được… | R24 Q1 |
| lesson-practice `allDone` | Con đã luyện xong hết các bài rồi! | Bạn đã luyện xong hết các bài rồi! | R24 Q1 |
| lesson-practice `finishCoins` | Bài này con được +{coins} xu. | Bài này bạn được +{coins} xu. | R24 Q1 |
| daily-practice `locked` | …sau khi con xong chặng 1… | …sau khi bạn xong chặng 1… | R24 Q1 |
| daily-practice `alreadyDone` | Hôm nay con đã luyện rồi. … | Hôm nay bạn đã luyện rồi. … | R24 Q1 |
| daily-practice `streak` | Con đã luyện {n} ngày liên tiếp! | Bạn đã luyện {n} ngày liên tiếp! | R24 Q1 |
| daily-practice `finishCoins` | Hôm nay con được +{coins} xu. | Hôm nay bạn được +{coins} xu. | R24 Q1 |

### Kho legacy (0 chuỗi đổi — đã đạt chuẩn)

- `src/ui/quiz-answer.ts` (9 chuỗi): câu ≤ 8 từ, không có "con"/"bé"/"em" gọi trẻ, "Mình" là VLM
  tự xưng, không nói đáp án ('↻ Chưa đúng rồi. Mình cùng đếm lại nhé!'). Giữ nguyên.
- `src/quiz/hint-text.ts` (3 mức gợi ý): ngắn, dẫn từng bước, mức 1–2 không lộ đáp án; mức
  mặc định là đáp án đầy đủ theo đúng thiết kế thang gợi ý (rung 3+). **Không được sửa:**
  `quiz.golden.test.ts` assert `hintText` khớp từng chữ với `tests/parity/golden/hint-ladder.json`
  (golden — cấm đổi); bản EN của 3 câu này đi qua regex `SENTENCE_RULES` — đổi chữ vi sẽ
  làm regex trượt, EN hiện tiếng Việt.

## 2. Tiếng Anh lỗi thời sau khi sửa vi (chỉ ghi chú, không viết lại en theo R21)

- fractions `wpShare`/`askWpGive`: en vẫn "Hoa gives her little brother…" / "How many {item}
  does he get?" — không còn khớp vi "bạn".
- reasoning `unknownWpSubPack`: en vẫn mắc đúng lỗi hộp xuất hiện đột ngột như vi cũ.
- workshop-hint `h3Unit`: en "Area units are named after the square used to measure." trong
  khi vi mới nói đơn vị *là* ô vuông (nghĩa dạy học tương đương).
- quest-chain `guide*` (en): vẫn "practise multiplication together!" trong khi vi đã đổi chủ đề
  theo màn; `copyTower`/`copyCave` (en) vẫn "The last challenge is open!" — đúng nhưng kém cụ
  thể hơn vi (chương 1/2).
- Các chuỗi `con` → `bạn` thì en vốn đã dùng "you" nên không lệch.

## 3. Chỉ cập nhật test (test-only, theo phê duyệt sẵn)

- Unit: `src/numbers/rounding-roman-generators.test.ts:187` ("số thường" → "số");
  `src/ui/daily-practice-guide-section.test.ts:11,29`, `src/ui/daily-practice-strings.test.ts:45–46`
  ("con" → "bạn"); comment ở `src/ui/sticker-guide-section.ts:2`.
- E2E: `tests/e2e/daily-practice.spec.ts` (locked/streak/alreadyDone),
  `tests/e2e/daily-sticker-combined.spec.ts:142`, `tests/e2e/save-migration-m3d3-to-m3d4.spec.ts:89`
  (locked), `tests/e2e/sticker-book.spec.ts` (earnedLine/earningLine).
- Không đụng `tests/**/lesson-walkthrough*` (muse-88).

## 4. Kiểm tra cắt chữ ở màn hẹp

Probe Playwright thật (mobile-pixel 412×915 + tablet-portrait 834px), đã xoá sau khi chạy:

- `.lesson-row__title`: **34/81 tiêu đề bị cắt ở 412px** trước khi sửa (danh sách: "Tìm thành
  phần trong phép cộng, trừ", "Bảng nhân 2, 5 và bảng chia 2, 5", "Hình tròn, tâm, bán kính,
  đường kính", "Khối lập phương, khối hộp chữ nhật", "Nhân số hai chữ số với số một chữ số",
  "Phép chia hết, phép chia có dư", "Chia số hai chữ số cho số một chữ số", "Bài toán giải bằng
  hai bước tính", "Nhân số ba chữ số với số một chữ số", "Chia số ba chữ số cho số một chữ số",
  "Ôn tập nhân, chia phạm vi 100, 1 000", "Các số có bốn chữ số, số 10 000", "So sánh các số
  trong phạm vi 10 000", "Làm tròn số đến hàng chục, hàng trăm", "Diện tích hình chữ nhật,
  hình vuông", "Phép cộng/trừ trong phạm vi 10 000", "Nhân/Chia số bốn chữ số với/cho số một
  chữ số", "Các số có năm chữ số, số 100 000", "So sánh các số trong phạm vi 100 000",
  "Làm tròn đến hàng nghìn, chục nghìn", "Phép cộng/trừ trong phạm vi 100 000", "Thực hành
  xem đồng hồ, xem lịch", "Nhân/Chia số năm chữ số với/cho số một chữ số", "Thu thập số liệu,
  bảng số liệu", "Khả năng xảy ra của một sự kiện", "Thực hành thu thập, đọc bảng số liệu",
  "Ôn tập cộng, trừ trong phạm vi 100 000", "Ôn tập nhân, chia trong phạm vi 100 000",
  "Ôn tập bảng số liệu, khả năng xảy ra"). **Cách sửa:** `src/styles/lesson-practice.css` —
  `.lesson-row__title` bỏ ellipsis một dòng, cho phép xuống tối đa 2 dòng
  (`-webkit-line-clamp: 2`). Probe chạy lại sau sửa: **0/81 tiêu đề bị cắt ở 412px**.
  Ở tablet-portrait 0/81 bị cắt ngay từ đầu (dialog rộng hơn). Tiêu đề bài giữ nguyên
  (không rút gọn — đã ≤ 40 ký tự, là diễn đạt tên bài).
- `.quest-steps.chain-row > span`, `.quest-stage`, `.quest-head .eyebrow`: 0 cắt ở cả 2 viewport.
- `.area-label strong` (`#area-name`): 0 cắt ở cả 2 viewport ("Làng Khởi Đầu" vừa; tên dài nhất
  "Thung Lũng Hình Học" chưa đo trực tiếp vì cần đi tới vùng đó — theo CSS ≤700px max-width
  198px, font 13.5px, ước tính vừa).

## 5. Nhóm skill nên có giải thích riêng khi sai (gợi ý cho task sau, theo R24 Q2)

Giải thích chung hiện nay ("Chưa đúng rồi, thử lại nhé") không nói sai ở đâu. 10 nhóm nên
viết giải thích riêng nhất, theo thứ tự ưu tiên gợi ý:

1. `unknown-add-sub` / `unknown-mul-div` (+ dạng word-problem) — nhầm phép toán ngược
   (cộng ↔ trừ, nhân ↔ chia) khi tìm thành phần chưa biết.
2. `wp-times-then-sub` / `wp-divide-then-sub` — bài toán 2 bước: làm bước nào trước, số
   trung gian có nghĩa gì.
3. `geo-midpoint-length` — dùng tính chất trung điểm (AM = AB/2) thay vì chỉ trừ/cộng độ dài.
4. `meas-area-equal` / `meas-area-count` — kết luận bằng/không bằng sau khi đếm ô; đếm sót ô.
5. Phân số chia đều (`wpShare`…) — "1/n của cả phần" khác "n cái"; nhầm tử/mẫu.
6. Đồng hồ số La Mã / sáng–chiều (`roman24`, `sang-chieu-24h`) — nhầm số La Mã kề nhau,
   nhầm buổi.
7. Tiền (`money-change`, cộng tiền) — trả lại thừa/thiếu, chọn tờ tiền nào gộp đủ.
8. Đọc bảng số liệu (`data-*`) — cộng nhầm hàng/cột, đọc sai tiêu đề bảng.
9. Cộng/trừ có nhớ (`add-sub` 3 chữ số) — nhớ sang hàng nào, quên nhớ.
10. Chia có dư (`div-remainder`) — số dư phải bé hơn số chia; nhầm thương với số dư.

## 6. Cần reviewer quyết (không tự sửa trong R21)

1. **2 khoảng trống EN trong kho legacy** (đều chạm golden, mọi cách sửa đều vỡ test golden
   bảng/corpus nên cần reviewer chọn hướng + re-baseline nếu cần):
   - Toast lên cấp (`quiz-answer.ts:90`, 'Bạn đã đạt cấp {n}. Thật tuyệt vời!'): `showToast`
     dùng `translateText` (tra cứu toàn chuỗi) mà chuỗi đầy đủ không có key chính xác — chỉ có
     2 mảnh substring cho `translateLongText`. Người dùng EN thấy toast này bằng tiếng Việt.
     Hướng sửa: đổi toast sang `translateLongText`, hoặc thêm key chính xác.
   - 'Trình duyệt chưa cho phép lưu. Tiến trình chỉ được giữ trong lần chơi này.'
     (`progress-sync.ts:42`, `daily-practice.ts:58,109`, `lesson-picker.ts:79`,
     `lesson-practice.ts:49`): không có key nào cả; corpus golden ghi `Cn = Ln` = nguyên văn.
2. **Save-code M3D1- vs M3D6:** chuỗi hướng phụ huynh vẫn nói mã bắt đầu bằng M3D1-
   (`importIntro`, `errorFormat`, `errorPrefix`) trong khi export hiện viết M3D6; import chấp
   nhận M3D1–M3D6 nên không vỡ, chỉ lệch ví dụ. (Ngoài phạm vi R21 vì hướng phụ huynh.)
3. **`askLeftOver` ('Cả nhà còn lại bao nhiêu {item}?'):** dùng chung cho cả story hai bạn lẫn
   "cả nhà" — cần tách key riêng, không phải sửa câu chữ. Ghi nhận cho task sau.
4. **Kiểm đủ khoá `legacy-translations-en.ts` (160 keys):** mọi arg tĩnh của `translateText(...)`
   trong `src/` đều có key (0 thiếu); 5 key mồ côi (chuỗi vi không còn dùng, giữ lại vì test
   golden bắt bảng phải bằng corpus từng chữ) — không xoá được.
5. Quirk EN đã biết (không phải lỗi R21): câu gợi ý ở EN hiện nửa Việt nửa Anh vì
   `SENTENCE_RULES` chạy sau bước substring đã đổi 'viên đá' → 'stones' nên regex không khớp;
   sửa = đổi logic translator, ngoài R21.

## 7. Để nguyên + lý do (đã rà, không sửa)

- 81 tiêu đề bài: sạch (B39 "Số lớn gấp mấy lần số bé" — "bé" là tính từ chỉ số nhỏ).
- "con" còn lại đều là danh từ: con cá/chó/mèo/gà/vịt/lợn/bò, con búp bê, con vật, con xúc xắc,
  con số, con đường. "bé hơn/bé nhất" là tính từ toán học.
- Thuật ngữ KNTT lớp 3 giữ nguyên: số hạng, thừa số, số bị trừ, chu vi, diện tích…
- `askLeft` vs `askLeftCheck`, ẩn dụ "anh em" (forest) vs "làm ngược lại" (tower),
  "kĩ" (đọc kĩ…): giữ nguyên — có thể là scaffolding/thiết kế có chủ ý.
- Tower `claimTrue`: đã kiểm, không phải lỗi. Cave `guideRemainder`: như `askLeftCheck`.
- `shop-strings.ts`: chỉ nhãn ngắn + tên vật phẩm, đã dùng "bạn" sẵn; `notEnough` là câu gợi
  ý chung để kiếm xu, không gắn cờ.
- `save-code-strings.ts`: hướng phụ huynh, ngoài phạm vi — không sửa (xem mục 6.2).

## Gates

- Lint: 0 lỗi + 9 warnings (baseline). Typecheck: 0 lỗi.
- Vitest full (`npx vitest run --testTimeout=30000`): **189/189 file, 1314/1314 test xanh**
  (2026-11-25, log `~/workspace/p21r21-test-full.log`).
- Build: OK. Golden `--check`: byte-identical.
- E2E local: probe cắt chữ mobile-pixel 1/1 xanh (81 tiêu đề, 0 cắt). E2E đầy đủ để CI chạy.
