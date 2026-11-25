# Khảo sát R42 bước 1 — nhánh trả lời sai trong các màn chơi 3D (chỉ đọc)

Ngày: 2026-11-25. Cơ sở: origin/main `257a230` (merge #77). Nhánh muse-min đã đọc (chỉ để hiểu, không copy):
`muse-min/wrong-answer-explanations` @ `632b22a`. Không sửa code, không commit/push.

## 1. Bộ chọn câu của muse-min (R35 / PR #76) — tóm tắt

- Entry: `explainWrongAnswer(input)` trong `src/practice/wrong-answer-explanation.ts` (nhánh muse-min).
- Input (`WrongAnswerInput`): `{ skillId, tier, item: PracticeItem, stepIndex, answer: StepAnswer, missNumber }`
  → trả `{ key: WrongAnswerKey, params? } | null`. `null` = không có câu riêng → giữ câu chung.
- Hiển thị: `twa(key, params)` (namespace `wrongAnswer`, `src/practice/wrong-answer-strings.ts`,
  ~160 key vi+en, đếm trên nhánh `632b22a`; #11 ghi ~139 ở head cũ `d9d0647`).
- Mẫu nối trong dialog bài học (`src/ui/daily-skill-item.ts:118-130` trên nhánh muse-min):
  gọi selector trong nhánh `verdict === 'wrong'` của `onAnswer`, sau khi `flow.answer` đã đếm
  miss (`missNumber = flow.hint.wrongAttempts`, 1 ở lần sai đầu, 2 ở lần hai; cùng một câu giải
  thích cho cả hai lần — theo R38 Q1). Câu giải thích không bao giờ nói đáp án.
- Selector làm việc trên `playableSteps(item)` (`src/reasoning/reasoning-step-answers.ts`):
  cần một `PracticeItem` (tức `ReasoningItem`, có `skillId`, `tier`, `story`, `steps`, `work`)
  + `stepIndex` của bước đang chơi + đáp án sai thô (`StepAnswer`).

### 10 nhóm R35 (điều kiện rẽ trong `explainWrongAnswer`)

| # | Nhóm (matcher) | Skill id được rẽ tới |
|---|---|---|
| 1 | Tìm thành phần chưa biết (`skillId.startsWith('unknown-')`) | `unknown-add-sub`, `unknown-add-sub-wp`, `unknown-mul-div`, `unknown-mul-div-wp` (mọi id bắt đầu `unknown-`) |
| 2 | Bài toán hai bước | `wp-times-then-sub`, `wp-divide-then-sub` |
| 3 | Trung điểm | `geo-midpoint-length` |
| 4 | Diện tích | `meas-area-count`, `meas-area-equal` |
| 5 | Phân số | `fraction-wp`, `fraction-of-set-number`, `fraction-of-set-circle` |
| 6 | Đồng hồ | `roman-clock-hour`, `clock-sang-chieu-24h` |
| 7 | Tiền | `money-change-back`, `money-total-notes`, `money-pick-notes`, `money-wp` |
| 8 | Số liệu / cơ hội | `tally-count`, `table-read`, `table-max-min`, `table-sums`, `table-fill-missing`, `chance-bag`, `chance-dice` |
| 9 | Cộng trừ có nhớ | `add-sub-1000`, `add-sub-1000-wp`, `add-sub-10000-wp`, `add-sub-100000-wp`, `add-sub-1000-chain`, `add-4digit`, `sub-4digit`, `add-5digit`, `sub-5digit`, `add-sub-find-error`, `add-missing-digit` |
| 10 | Chia có dư | `div-2d-1d-remainder`, `div-3d-1d-remainder`, `div-4d-1d-remainder`, `div-5d-1d-remainder`, `div-rem-floor`, `div-rem-ceil` |

Mọi skill khác → selector trả `null` → giữ câu chung hiện có.

## 2. Bảng theo màn (cơ sở main `257a230`)

Câu chung mặc định ở hầu hết các màn: **“Chưa đúng, mình thử lại nhé!”**.
Ngoại lệ: field (“Chưa đúng rồi, bạn thử lại nhé. Bấm Gợi ý nếu cần!”),
reasoning-round dùng chung (`trr('wrong')` = câu của field),
forest có thêm `wrongClose` (“Gần đúng rồi, mình thử lại nhé!”) khi đáp án lệch 1.

| Màn | Skill hỏi | Nhóm R35 khớp | Điểm chèn (file:dòng, main 257a230) | Câu chung hiện tại | Ghi chú |
|---|---|---|---|---|---|
| Bridge quiz | Chỉ bảng nhân (`a × b`, factKey bảng cửu chương); mỗi 5 câu có 1 bài toán lời văn (`wp-times-then-add`, `wp-times-compare`, `src/quiz/quiz-word-problem-question.ts:14-17`) | Không — cả 2 skill lời văn đều ngoài 10 nhóm; vòng chính không có `skillId`/`PracticeItem` | `src/ui/quiz-answer.ts:103-111` (`onWrong`) | `↻ Chưa đúng rồi. Mình cùng đếm lại nhé!` (bảng); `wordProblemWrong()` (lời văn) | Giữ câu chung. Không có `PracticeItem` để đưa vào selector (câu hỏi là `Question {a, b, answer, factKey, word?}`), nên dù muốn cũng cần adapter — và không nhóm nào khớp. |
| Field (vòng chính) | Chỉ bảng nhân (fact `mul`, `field-round-flow.ts:63` bắt buộc `op === 'mul'`) | Không | `src/levels/field/field-game.ts:125-126` | `tf('wrong')` = câu field (xem trên) | Giữ câu chung. |
| Field (reasoning round) | `wp-times-then-add`, `pattern-skip-count` (S1–3); S4 thêm `wp-more-less-then-total`, `wp-unit-then-times` (`field-stage-plan.ts:21-27`) | Không | Panel dùng chung `src/levels/shared/reasoning-round-panel.ts:97-101` (xem §3) | `trr('wrong')` | Có `ReasoningRoundPlan` đầy đủ (`skillId`, `tier`, `item`) — nối được về mặt kỹ thuật, nhưng selector trả `null` với mọi skill này nên thực tế vẫn hiện câu chung. |
| Forest (vòng chính) | Chia bảng: chia đều / đóng gói / họ phép tính (`share`, `pack`, `family` — `forest-round-texts.ts`) | Không | `src/levels/forest/forest-round-controller.ts:148-155` (`submit`, `wrongFeedbackKey` → `wrong`/`wrongClose`) | `ts('wrong')` / `ts('wrongClose')` (lệch 1) | Giữ câu chung. Vòng chính không có `skillId`/`PracticeItem` (đáp án là số điền ô trống). Lưu ý: `wrongClose` là phản hồi riêng đã có — đừng ghi đè bằng câu chung khi nối reasoning round. |
| Forest (reasoning round) | `div-rem-floor`, `div-rem-ceil` (S1–3); S4 `wp-divide-then-add`, `wp-more-less-then-total` (`forest-stage-plan.ts:25-27`) | **Nhóm 10 (chia có dư)** — S1–3; S4 không | Panel dùng chung `reasoning-round-panel.ts:97-101`, qua `src/levels/forest/forest-remainder-round.ts:32` | `trr('wrong')` | Điểm chèn tốt. |
| City (vòng chính) | Câu đố bưu kiện trên bảng nhân/chia (“gấp mấy lần?”, số còn thiếu) — các kind `deliver`/`windows`/`reverse` (`city-round-flow.ts:20`) | Không | `src/levels/city/city-round-controller.ts:119-125` (`answer(value, moved?)`) | `ts('wrong')` | Giữ câu chung. Vòng chính không có `skillId`/`PracticeItem`. |
| City (reasoning round) | `wp-times-compare`, `unknown-mul-div` (S1–3); S4/S6 `wp-times-then-add`, `wp-unit-then-times`, `wp-times-compare`; S5 `wp-times-then-add` (`city-stage-plan.ts:17-21`) | **Nhóm 1 (`unknown-`)** — chỉ `unknown-mul-div` | Panel dùng chung `reasoning-round-panel.ts:97-101`, qua `src/levels/city/city-compare-round.ts:24` | `trr('wrong')` | Điểm chèn tốt. Matcher nhóm 1 bắt theo tiền tố `unknown-` nên `unknown-mul-div` được rẽ tới `explainUnknown`. |
| Tower (vòng chính) | Bảng nhân/chia 2–9 (`tower-round-flow.ts`: `TOWER_TABLES`, `TowerQuestion`/`TowerStep` riêng) | Không | `src/levels/tower/tower-round-controller.ts:84-90` | `ts('wrong')` | Giữ câu chung. Vòng chính không có `skillId`/`PracticeItem`. |
| Tower (reasoning floor) | `expr-brackets`, `expr-order`, `tf-explain` (S1–3, S6); S4 `wp-times-then-add`, `wp-divide-then-add`, `wp-more-less-then-total`; S5 `div-rem-floor`, `div-rem-ceil` (`tower-stage-plan.ts:17-25`) | **Nhóm 10 (chia có dư)** — chỉ S5 | Panel dùng chung `reasoning-round-panel.ts:97-101`, qua `src/levels/tower/tower-expression-floor.ts:29` (dùng cho mọi stage, kể cả S5) | `trr('wrong')` | Điểm chèn tốt. S5 “forced, same wiring as stage 4” nên cùng một điểm chèn. |
| Garden | 8 skill: `pattern-add`, `pattern-sub`, `pattern-skip-count`, `unknown-add-sub`, `unknown-mul-div`, `expr-order`, `expr-brackets`, `expr-from-story` (`garden-round-plan.ts:19-23`) | **Nhóm 1 (`unknown-`)** — `unknown-add-sub`, `unknown-mul-div` | `src/levels/garden/garden-round-controller.ts:96-100` (`answer(event)`, `flow.submit`) | `gs('wrong')` | Có đủ dữ liệu: `round.skillId` + `round.item` (`ReasoningItem`, `item.tier`) + `event.stepIndex`/`event.answer`; `missNumber = flow.hint.wrongAttempts` (`garden-round-flow.ts:46` có `get hint()`; `submit` dùng `StepMissBudget` như dialog bài học). |
| Valley | 10 skill hình học (`GEOMETRY_SKILLS`): `geo-midpoint`, `geo-midpoint-length`, `geo-circle-parts`, `geo-radius-diameter`, `geo-right-angle`, `geo-count-right-angles`, `geo-shape-classify`, `geo-shape-count`, `geo-solid-identify`, `geo-solid-parts`; S2 chỉ đếm, S3 hình xoay + phần khối, S4 chọn-nhiều (`valley-stage-plan.ts:27-44`) | **Nhóm 3 (trung điểm)** — chỉ `geo-midpoint-length` | Hai nhánh (xem §3): chạm bảng sai `valley-round-controller.ts:73`; đáp án bước sai `:129` | Chạm bảng: `vs('notThere')` (“Chưa phải chỗ này, thử chỗ khác nhé!”); bước sai: `vs('wrong')` | Chỉ nhánh bước sai mới nối được. `round.item` là `GeoItem` (xem §4). |
| Workshop | 16 skill đo lường (`workshop-stations.ts:19-34`): thước, cân, ca, nhiệt kế, chu vi, diện tích, rào | **Nhóm 4 (diện tích)** — `meas-area-count`, `meas-area-equal` | `src/levels/workshop/workshop-round-controller.ts:90-98` (`onAnswer`) | `ws('wrong')`, **nhưng đã có phản hồi riêng theo misconception** (xem §3) | `round.skillId` + `round.tier` + `round.item` (`GeoItem`) + `event` đều có; `missNumber = flow.misses` (public, reset mỗi bước — `workshop-round-flow.ts:96-100`). |
| Cave | 17 skill (`cave-chamber-formats.ts:25-42`): 6 bài toán lời văn 2 bước, `div-rem-floor`, `div-rem-ceil`, `choose-all-correct`, `tf-explain`, 3 biểu thức, 4 hình/đo (`meas-wp-fence`, `meas-perimeter-rect`, `meas-area-rect`, `geo-radius-diameter`) | **Nhóm 10 (chia có dư)** — `div-rem-floor`, `div-rem-ceil` (2/17). Lưu ý: `meas-area-rect` KHÔNG thuộc nhóm 4 (nhóm 4 chỉ `meas-area-count`/`meas-area-equal`); `wp-times-then-add` KHÔNG thuộc nhóm 2 (nhóm 2 chỉ `wp-times-then-sub`/`wp-divide-then-sub`) | `src/levels/cave/cave-round-controller.ts:73-78` (`answer(event)`, `flow.answer(event.answer)`) | `cs('wrong')` | Có đủ dữ liệu: `chamber.skillId` + `chamber.item` (`ReasoningItem`, `item.tier` — item sinh ở tier của Leitner box, `cave-chamber-formats.ts:151`) + `event.stepIndex`/`event.answer`; `missNumber = flow.hint.wrongAttempts` (`cave-round-flow.ts` có `get hint()`). |
| Market | S1 đồng hồ (7 skill), S2 lịch (3), S3 tiền (6), S4 số liệu (7), S5 trộn (`market-stage-plan.ts:24-47`) | **Nhóm 6 (đồng hồ)** — `clock-sang-chieu-24h`, `roman-clock-hour` (S1); **nhóm 7 (tiền)** — `money-total-notes`, `money-change-back`, `money-pick-notes`, `money-wp` (S3); **nhóm 8 (số liệu)** — cả 7 skill S4 (`tally-count`, `table-read`, `table-max-min`, `table-sums`, `table-fill-missing`, `chance-bag`, `chance-dice`); S2 lịch không khớp; `money-recognize`, `money-exchange` không khớp; `time-set-clock` (mới, D17) không khớp | `src/levels/market/market-round-controller.ts:119-123` (`answer(event)`, `flow.answer(event)`) | `cs('wrong')` | Điểm chèn tốt nhất trong các màn: dùng `ReasoningRoundFlow` + `ReasoningRoundPlan` dùng chung, có sẵn `plan.skillId`/`plan.tier`/`plan.item` + `event` + `flow.hint.wrongAttempts`. S5 trộn thừa hưởng cả ba nhóm. |
| Numberfort | S1 số đến 10 000 (10 skill), S2 làm tròn + La Mã (8), S3 ±×: trong 10 000 (8), S4 số đến 100 000 (4), S5 ±×: trong 100 000 (8) (`numberfort-stage-plan.ts:24-87`) | **Nhóm 9 (cộng trừ có nhớ)** — `add-4digit`, `sub-4digit`, `add-sub-10000-wp` (S3), `add-5digit`, `sub-5digit`, `add-sub-100000-wp` (S5); **nhóm 10 (chia có dư)** — `div-4d-1d-remainder` (S3), `div-5d-1d-remainder` (S5). S1/S2/S4 và `mul-*`/`div-*` không dư đều không khớp | `src/levels/numberfort/numberfort-round-controller.ts:119-123` (giống hệt market) | `cs('wrong')` | Như market: `ReasoningRoundPlan` đầy đủ, điểm chèn sẵn. |

## 3. Điểm chèn

### 3a. Một điểm chèn cho 4 màn cũ — panel reasoning dùng chung

`src/levels/shared/reasoning-round-panel.ts:97-101` (`mountReasoningRound`, nhánh `verdict === 'wrong'`
trong `onAnswer`): hiện `say(trr('wrong'), 'gentle')`. Tại đây có đủ mọi input của selector —
`o.plan.skillId`, `o.plan.tier`, `o.plan.item: PracticeItem`, `event.stepIndex`, `event.answer`,
`flow.hint.wrongAttempts` (flow đã đếm miss trước khi trả `'wrong'`, như dialog bài học).
Một lần nối ở đây phủ reasoning round của cả 4 màn:

- field — `src/levels/field/field-reasoning-round.ts:24`
- forest — `src/levels/forest/forest-remainder-round.ts:32`
- city — `src/levels/city/city-compare-round.ts:24`
- tower — `src/levels/tower/tower-expression-floor.ts:29`

### 3b. Market / numberfort — cùng một mẫu, hai file

`market-round-controller.ts:119-123` và `numberfort-round-controller.ts:119-123` giống hệt nhau
(`flow.answer(event)` trên `ReasoningRoundFlow`, `plan` là `ReasoningRoundPlan`). Nối selector
tại nhánh `wrong` của mỗi file, lấy `plan.skillId`/`plan.tier`/`plan.item` + `event` +
`flow.hint.wrongAttempts`.

### 3c. Cave / garden — controller riêng, cùng mẫu

Cave `:73-78`, garden `:96-100`: nhánh `wrong` trong `answer(event)`; dữ liệu có sẵn như bảng §2
(`chamber`/`round` + `event` + `flow.hint.wrongAttempts`).

### 3d. Valley — hai nhánh sai, chỉ một nối được

- Chạm bảng sai (phase `action`): `valley-round-controller.ts:73` → `miss(vs('notThere'))`.
  Đây là chạm vào điểm/góc/hình trên bảng, không phải đáp án của một bước — không có
  `stepIndex`/`StepAnswer` để đưa vào selector. **Giữ nguyên.**
- Đáp án bước sai (step card): `valley-round-controller.ts:129` → `miss(vs('wrong'))`.
  Có `event.stepIndex`/`event.answer` + `round.item` (`GeoItem`) + `flow.hint.wrongAttempts`
  (`valley-round-flow.ts:54` có `get hint()`). Nối được.

### 3e. Workshop — đã có phản hồi riêng theo misconception, cần quyết định cách phối hợp

`workshop-round-controller.ts:90-98`: khi đáp án sai, controller tra `chosen?.misconception`
(`step.options`, `event.answer`) rồi hiện `misconceptionNote(...)` từ
`src/levels/workshop/workshop-hints.ts:166` nếu có, nếu không thì `ws('wrong')`.
Nghĩa là workshop **đã** hiện câu riêng cho một số lỗi (gắn trên phương án), không phải lúc nào
cũng câu chung. Việc nối selector R35 phải quyết định thứ tự ưu tiên với ghi chú này (xem Q1).
Về dữ liệu: đủ hết — `round.skillId`/`round.tier`/`round.item` + `event` + `flow.misses`
(`workshop-round-flow.ts:18,60,96-100`: `misses` public, +1 trong `answer`, reset về 0 ở
`nextStep()` nên `missNumber = flow.misses`).

## 4. Kiểu dữ liệu — `GeoItem` dùng được trực tiếp, không cần adapter

- `PracticeItem = ReasoningItem & { scene?: PracticeScene }` (`src/practice/practice-scene.ts:13`),
  `PracticeScene` chỉ yêu cầu `{ kind: string }`.
- `GeoItem extends ReasoningItem` với `scene: GeoScene` (`src/geometry/geo-scene-types.ts:108-111`);
  `GeoScene` là hợp các object đều có `kind` nên gán được cho `PracticeScene`.
  → `GeoItem` gán được cho `PracticeItem` về mặt cấu trúc; valley/workshop đưa `round.item`
  thẳng vào `explainWrongAnswer` được (cần typecheck xác nhận lúc code).
- `tier` lấy từ `item.tier` (mọi `ReasoningItem` đều có) hoặc từ `plan.tier`/`round.tier`
  nơi có sẵn (market, numberfort, workshop). `stepIndex`/`answer` lấy từ `StepAnswerEvent`
  của step card ở mọi màn dùng card (cave, garden, market, numberfort, valley, workshop,
  panel dùng chung).

## 5. Kết luận khảo sát

- **Nối được ngay (sau khi #76 gộp), selector trả câu riêng cho một số skill:** panel dùng chung
  (forest S1–3, city `unknown-mul-div`, tower S5), garden (`unknown-*`), cave (`div-rem-*`),
  valley bước sai (`geo-midpoint-length`), workshop (`meas-area-count`/`meas-area-equal`),
  market (S1 đồng hồ 2 skill, S3 tiền 4 skill, S4 số liệu 7 skill, S5 trộn), numberfort
  (S3/S5 cộng trừ có nhớ + chia có dư).
- **Giữ câu chung (không nhóm nào khớp hoặc không có dữ liệu đưa vào selector):** vòng chính
  bảng cửu chương của field/forest/city/tower, bridge quiz toàn bộ, valley chạm bảng sai,
  và mọi skill ngoài 10 nhóm (vd. `pattern-*`, `expr-*`, `meas-area-rect`, `wp-times-then-add`,
  `time-set-clock`, `money-recognize`, lịch, La Mã, làm tròn).
- **Không cần mở rộng API selector** theo những gì khảo sát thấy: mọi điểm chèn đều có đủ
  6 input của `WrongAnswerInput`. (Nếu lúc code gặp skill cần matcher mới thì đó là việc của
  muse-min — hỏi trước theo R42 mục 3.)

## 6. Câu hỏi cho điều phối viên (không tự đoán)

- **Q1 — Workshop, thứ tự ưu tiên:** khi đáp án sai vừa khớp misconception note sẵn có
  (`misconceptionNote`, theo phương án đã chọn) vừa khớp nhóm R35 (`meas-area-count`/
  `meas-area-equal`), hiện câu nào trước? (a) câu R35 thay hẳn note cũ; (b) giữ note cũ,
  chỉ dùng câu R35 khi không có note; (c) hiện cả hai (note rồi câu R35, hoặc ngược lại)?
  Ngoài ra `flow.answer` của workshop nhận `wrongValue` đã biến đổi, nhưng selector cần
  `event.answer` thô — controller vẫn có `event` nên không vướng, chỉ cần xác nhận.
- **Q2 — Valley chạm bảng sai:** xác nhận giữ `vs('notThere')` nguyên (không nối selector
  vì không phải đáp án bước).
- **Q3 — Bridge quiz:** xác nhận ngoài phạm vi R42 (không `PracticeItem`, không nhóm khớp).
- **Q4 — Nhóm 1 ở city/garden:** `explainUnknown` (của muse-min) đọc các param `a/s/p/n/q`
  trong item; item của city/garden cùng generator với item bài học nên khả năng cao khớp,
  nhưng lúc nối cần kiểm tra bằng unit test rằng `unknown-mul-div` (city) và `unknown-add-sub`/
  `unknown-mul-div` (garden) thật sự trả về câu riêng (không `null`).
- **Q5 — Lần sai thứ hai:** dialog bài học hiện cùng một câu giải thích cho cả hai lần sai
  (R38 Q1). Các màn có theo cùng chính sách đó không, hay lần hai quay về câu chung?
- **Q6 — E2E ví dụ trong R42** (valley trung điểm, workshop diện tích, market tiền) khớp với
  các điểm chèn đã liệt kê; riêng valley trung điểm chỉ xuất hiện khi skill `geo-midpoint-length`
  được chọn (stage 1 pool / stage 3 xoay?) — lúc viết e2e cần ép skill qua test hook như
  các spec hiện có.
