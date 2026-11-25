# R23 phần A — đo hiệu năng từng màn + bản đồ thế giới

muse-min — TASK R23 (reviewer, #64), nhánh `muse-min/perf-pass` (từ main a0a01ff).
Ngày đo: 2026-11-25. Probe đo: `tests/e2e/perf-pass-probe.spec.ts` (tạm, đã xóa sau khi
đo; dữ liệu thô: `~/workspace/p21r23-perf-<project>.jsonl` — 33/33 test xanh).
Kiểm lại 5 ô lệch: `tests/e2e/perf-pass-verify.spec.ts` (tạm, đã xóa; 5/5 test xanh,
dữ liệu thô: `~/workspace/p21r23-perf-verify.jsonl`).

## Cách đo

- Mỗi màn: boot một lần, seed tiến độ mở cổng (`bridgeComplete` + các màn trước đã xong),
  vào/ra màn 3 lần. Ghi `data-draw-calls` / `data-max-draw-calls` trên `.level-layer`
  (số draw call của frame trước, theo `renderer.info.render.calls`) và
  `renderer.info.memory` (geometries/textures) trong màn, cộng bộ nhớ thế giới trước lần
  vào đầu và sau lần ra thứ 3 (đợi 8 s + đọc lại sau 1 s để ổn định; không dùng
  `settledMemory` vì máy đo chạy SwiftShader ~1 fps nên chờ 40 khung hình quá lâu).
- Ngưỡng: draw call tối đa ≤ 60 mỗi màn; rò = geometries/textures sau 3 vòng vào/ra
  tăng so với trước lần vào đầu.
- Thế giới: camera cố định (distance 42, pitch 1,35 top-down, yaw 0) tại 3 điểm chuẩn
  spawn (-6, 0,5), Chợ (-32, -30), Lâu Đài (61, -2); trung vị 5 mẫu `render.calls`
  (công thức của `chapter3-regions.spec.ts`).
- FPS: giữ phím W đi thẳng 10 s trong thế giới, đếm `requestAnimationFrame`.

## Lưu ý về máy đo

Máy đo là VM 1,5 CPU + SwiftShader (WebGL phần mềm). FPS tuyệt đối ở đây KHÔNG đại
diện cho máy thật (iPad/điện thoại chạy GPU thật nhanh hơn nhiều); số FPS chỉ để so
tương đối giữa các màn/profile trên cùng máy đo. Draw call và geometries/textures thì
không phụ thuộc tốc độ khung hình nên so được trực tiếp với ngưỡng.

`lowPower` (quyết bởi `matchMedia('(max-width: 900px), (pointer: coarse)')`): cả 3
profile đo đều là lowPower (tablet-portrait 834px, tablet-landscape + mobile-pixel
coarse pointer), nên scatter rút gọn giống nhau; desktop-chromium (không lowPower)
không nằm trong phạm vi đo của R23.

`bridge` không có scene màn riêng — đó là chặng nhiệm vụ trong thế giới
(`bridgeComplete` chỉ là cờ mở cổng field); đo qua điểm spawn của thế giới.

## Bảng 1 — từng màn: draw call tối đa + bộ nhớ (3 vòng vào/ra)

Draw call = tối đa trong 3 vòng (`data-max-draw-calls`). "Trong màn" = geometries /
textures lúc đang ở trong màn (ổn định cả 3 vòng trừ chỗ ghi chú). "Trước → sau" =
bộ nhớ thế giới trước lần vào đầu → sau lần ra thứ 3.

### tablet-portrait

| Màn | Draw call tối đa | Trong màn (geo/tex) | Trước → sau (geo) | Trước → sau (tex) | Rò? |
|---|---|---|---|---|---|
| field | 40 | 314 / 22 | 290 → 290 | 20 → 20 | không |
| forest | 12 | 292–294 / 21 | 288 → 288 | 19 → 19 | không |
| city | 6 | 301 / 27 | 297 → 298 | 24 → 25 | +1/+1 (*) |
| tower | 5 | 303 / 29 | 300 → 300 | 27 → 27 | không |
| garden | 8 | 293 / 22 | 289 → 289 | 20 → 20 | không |
| valley | 4 | 301 / 29 | 298 → 299 | 26 → 27 | +1/+1 (*) |
| workshop | 9 | 295 / 21 | 288 → 288 | 19 → 19 | không |
| cave | 3 | 293 / 20 | 290 → 290 | 20 → 20 | không |
| market | 2 | 290 / 19 | 288 → 288 | 19 → 19 | không |
| numberfort | 2 | 301 / 27 | 299 → 299 | 27 → 27 | không |

### tablet-landscape

| Màn | Draw call tối đa | Trong màn (geo/tex) | Trước → sau (geo) | Trước → sau (tex) | Rò? |
|---|---|---|---|---|---|
| field | 43 | 324 / 29 | 300 → 300 | 27 → 27 | không |
| forest | 12 | 304–306 / 29 | 300 → 300 | 27 → 27 | không |
| city | 6 | 302 / 29 | 299 → 299 | 27 → 27 | không |
| tower | 5 | 302 / 29 | 299 → 299 | 27 → 27 | không |
| garden | 8 | 302–303 / 29 | 299 → 299 | 27 → 27 | không |
| valley | 4 | 302 / 29 | 300 → 300 | 27 → 27 | không |
| workshop | 9 | 307 / 29 | 300 → 300 | 27 → 27 | không |
| cave | 3 | 302 / 27 | 299 → 299 | 27 → 27 | không |
| market | 2 | 302 / 27 | 300 → 300 | 27 → 27 | không |
| numberfort | 2 | 302 / 27 | 300 → 300 | 27 → 27 | không |

### mobile-pixel

| Màn | Draw call tối đa | Trong màn (geo/tex) | Trước → sau (geo) | Trước → sau (tex) | Rò? |
|---|---|---|---|---|---|
| field | 40 | 301 / 15 | 277 → 277 | 13 → 13 | không |
| forest | 10 | 281–282 / 15 | 277 → 277 | 13 → 13 | không |
| city | 6 | 292 / 22 | 288 → 289 | 20 → 20 | +1/0 (*) |
| tower | 5 | 299 / 28 | 295 → 296 | 25 → 26 | +1/+1 (*) |
| garden | 8 | 280–281 / 15 | 277 → 277 | 13 → 13 | không |
| valley | 4 | 296 / 26 | 294 → 294 | 24 → 24 | không |
| workshop | 9 | 284 / 15 | 277 → 277 | 13 → 13 | không |
| cave | 3 | 283 / 14 | 280 → 280 | 14 → 14 | không |
| market | 2 | 279 / 13 | 277 → 277 | 13 → 13 | không |
| numberfort | 2 | 296–297 / 24–25 | 290 → 295 | 21 → 25 | +5/+4 (*) |

(*) Xem mục "Kiểm lại các ô lệch" — tất cả đều là nhiễu ổn định (settle noise), không
phải rò: cùng một màn đo 0/0 ở profile khác, và kiểm lại bằng ổn định dài đều về 0
(trừ numberfort mobile-pixel: +1/+1 một lần duy nhất, phẳng qua các vòng).

## Bảng 2 — thế giới (draw call tại 3 điểm chuẩn) + FPS đi bộ

| Profile | Spawn (-6, 0,5) | Chợ (-32, -30) | Lâu Đài (61, -2) | Geometries / textures tại spawn | FPS đi bộ 10 s (số khung / frame giữa) |
|---|---|---|---|---|---|
| tablet-portrait | 273 | 160 | 236 | 290 / 20 | 0,65 (8 khung / 1717 ms) |
| tablet-landscape | 306 | 168 | 267 | 300 / 27 | 0,74 (8 khung / 1500 ms) |
| mobile-pixel | 233 | 157 | 228 | 277 / 13 | 1,07 (11 khung / 833 ms) |

Tham chiếu (chapter3-regions, desktop-chromium 2026-11-23): spawn 312–314, Chợ 168–169,
Lâu Đài 270; geometries 304, textures 27; ngưỡng guard hiện tại: spawn ≤ 334, Chợ ≤ 177,
Lâu Đài ≤ 278, geometries ≤ 308, textures ≤ 27. Cả 3 profile đo đều nằm trong ngưỡng
(trừ geometries/textures tại điểm Lâu Đài trên mobile-pixel: 289/20 — vẫn dưới ngưỡng).
Landscape cao hơn portrait vì khung nhìn rộng hơn (nhiều vật trong frustum hơn);
mobile-pixel thấp nhất vì khung nhìn hẹp nhất. FPS ~0,65–1,07 là giới hạn của
SwiftShader trên máy đo, không phải của game trên máy thật.

## Kiểm lại các ô lệch (verify bằng ổn định dài)

5 ô lệch ở bảng 1 được đo lại với cách ổn định chắc hơn: đọc memory mỗi 5 s đến khi
3 lần đọc liên tiếp giống hệt nhau (tối đa 12 lần) trước lần vào đầu và sau lần ra
thứ 3, đồng thời ghi memory sau mỗi lần ra để phân biệt rò tăng dần theo vòng với
một lần tăng duy nhất rồi phẳng:

| Ô | Baseline (ổn định) | Sau mỗi lần ra (vòng 1/2/3) | Sau lần ra thứ 3 (ổn định) | Kết luận |
|---|---|---|---|---|
| city / tablet-portrait | 298 / 26 | 298/26, 298/26, 298/26 | 298 / 26 | 0/0 — nhiễu ổn định |
| valley / tablet-portrait | 299 / 27 | 299/27, 299/27, 299/27 | 299 / 27 | 0/0 — nhiễu ổn định |
| city / mobile-pixel | 289 / 20 | 289/20, 289/20, 289/20 | 289 / 20 | 0/0 — nhiễu ổn định |
| tower / mobile-pixel | 296 / 26 | 296/26, 296/26, 296/26 | 296 / 26 | 0/0 — nhiễu ổn định |
| numberfort / mobile-pixel | 294 / 24 | 295/25, 295/25, 295/25 | 295 / 25 | +1/+1 một lần, phẳng qua các vòng |

Giải thích: ở lần đo đầu, baseline đọc sau 8 s cố định (~8 khung hình trên SwiftShader)
chưa ổn định — thế giới vẫn đang tải (upload on first sight) vật thể gần cổng sau khi
dịch chuyển. Baseline ổn định dài cao hơn (city portrait 298/26 thay vì 297/24) và
mọi lần ra đều trở đúng về baseline. Numberfort mobile-pixel còn +1/+1: một geometry
+ một texture tải lên sau lần vào đầu và không tăng thêm qua các vòng — là vật thể
thế giới gần cổng Lâu Đài lần đầu lọt vào tầm nhìn khi camera trở về sau khi ra khỏi
màn, không phải rò theo vòng. Bằng chứng độc lập: leak spec của CI cho cả 4 màn này
(10 lần vào/ra, `settledMemory`, so bằng tuyệt đối với baseline) đều xanh trên main
(run 45516228986, 8/8 e2e shard xanh).

## Phát hiện

1. **Không màn nào vượt 60 draw call.** Cao nhất là field: 40 (portrait/mobile),
   43 (landscape). Các màn còn lại ≤ 12. Không cần gộp mesh / instancing.
2. **Không màn nào rò bộ nhớ.** Sau kiểm lại bằng ổn định dài, mọi màn đều trở về
   đúng baseline sau mỗi lần ra; số dư duy nhất là +1/+1 một lần ở numberfort trên
   mobile-pixel (phẳng qua các vòng, xem trên).
3. **Thế giới nằm trong ngưỡng guard hiện có** ở cả 3 profile (spawn ≤ 306 so với
   ngưỡng 334; Chợ ≤ 168 so với 177; Lâu Đài ≤ 267 so với 278).
4. **FPS trên máy đo ~0,65–1,07** — đây là trần của SwiftShader, không đo được FPS
   thật của game; cần đo lại trên máy thật (iPad/điện thoại) nếu reviewer muốn số FPS
   có ý nghĩa. Không có hành động sửa chữa nào từ số FPS này.

## Sửa chữa

Không có — không màn nào vượt ngưỡng, không rò thật. Không đổi hình ảnh, không cần
nhãn `parity-change` cho PR này.

## Test chặn

- Mới: `tests/e2e/level-draw-calls.spec.ts` — 10 test (mỗi màn 1 lần vào), assert
  `data-max-draw-calls ≤ 60`. Chạy local tablet-portrait: 10/10 xanh.
- Mới: `tests/e2e/field-level-leak.spec.ts`, `tests/e2e/forest-level-leak.spec.ts` —
  field và forest là 2 màn duy nhất chưa có leak spec; mẫu theo
  `city-level-leak.spec.ts`, 3 vòng vào/ra theo tiêu chí R23 (các leak spec cũ dùng
  10 vòng). **Không chạy local** (quy tắc máy này: `*-leak.spec.ts` để CI kiểm) —
  CI là kiểm chứng.
- Giữ nguyên: 8 leak spec cũ (city, tower, garden, valley, workshop, cave, market,
  numberfort) + guard draw call thế giới trong `chapter3-regions.spec.ts`.

## Gates local

- `npm run lint` → 0 lỗi + 9 warnings (baseline cũ: 8 CSS + 1 `noUselessTernary`).
- `npm run typecheck` → 0 lỗi.
- `npm run build` → OK.
- `node tools/recovery/golden/generate-golden-traces.mjs --check` → byte-identical.
- `npx playwright test tests/e2e/level-draw-calls.spec.ts --project=tablet-portrait --workers=1` → **10/10 xanh** (15,7 phút).
  - Lần chạy đầu: 9/10 — workshop lỗi `data-draw-calls` không xuất hiện trong 30 s.
    Chẩn đoán bằng probe tạm (đã xóa): scene workshop VẪN set attribute, nhưng khung hình
    đầu của nó tốn ~3–6 s/khung trên SwiftShader (biên dịch shader + shadow pass) nên
    frame thứ 3 (mốc bắt đầu ghi dataset) chỉ tới sau ~12 s, và khi máy tải nặng thì
    quá 30 s. Đây là chậm của máy đo, không phải lỗi game (leak spec workshop của CI
    vẫn xanh). Sửa: timeout của expect trong guard spec là 120 s (chỉ workshop cần
    tới, các màn khác vẫn xong trong ~1 s); chạy lại 10/10 xanh.
- `npx vitest run --testTimeout=30000` → 191/191 file, 1329 pass + 1 expected fail (1330), exit 0.
- Leak spec mới (field/forest): không chạy local, để CI.
