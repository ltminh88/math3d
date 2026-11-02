# Chơi thật cả chuỗi 9 chặng trên bản production — chương 2 (phase 09 phần 2)

Ngày 2026-11-02 · nhánh `feat/ch2-p09-parity-playthrough` · bản build `npx vite build --outDir .preview/prod` + `vite preview --port 4182` (không có hook kiểm thử: `window` chỉ có `__THREE__` của three.js, không có `__game`/`__garden`/…) · Chromium headless + SwiftShader (1–10 khung hình/giây, nên thời gian chậm hơn máy thật nhiều).

Bốn hồ sơ: desktop 1280×720 (bàn phím + chuột), mobile-pixel (Pixel 7, chỉ chạm), tablet-portrait và tablet-landscape (iPad Pro 11 trên Chromium, chỉ chạm). Mỗi lượt là một hồ sơ trình duyệt mới.

Script (không commit, nằm ở `.preview/play-ch2/` trong worktree): `play-chain-runner.js` (chạy theo chặng), `world-walk-stages.js` (tiêu đề, VLM, xây cầu, đi đến cổng), `chapter1-level-stages.js` (Cánh Đồng → Tháp, dựa trên script QA LAN cũ), `chapter2-level-stages.js` + `step-card-player.js` + `screen-math-reader.js` + `valley-and-workshop-boards.js` (Khu Vườn → Hang), `screen-audit-checks.js` (kiểm tra mỗi màn hình), `tap-to-walk.js`, `gen-ch2-code.ts` (mã M3D3 đầu chương 2).

Cách chơi: đi trong thế giới bằng cách đọc vị trí các nhãn nổi trên màn hình rồi giữ WASD (desktop) hoặc kéo cần điều khiển (chạm); ở bờ tây (đường tới Hang) không còn nhãn nào trong khung hình nên script chạm xuống đất để đi (tính năng chạm-để-đi của game). Trong màn chơi: đọc đề và các thẻ trên màn hình rồi tự tính; câu đầu mỗi màn cố ý trả lời sai rồi bấm Gợi ý đủ 3 bậc. Câu nào script không đọc được (cần nhìn hình: vạch nước trong bình, thước kẻ, câu chữ mới) thì đoán — game lộ đáp án sau 3 lần sai, nên vẫn qua được.

## 1. Kết quả theo hồ sơ

| Hồ sơ | Chương 1 (cầu → Tháp) | Chương 2 (Vườn → Hang → thẻ kết) | Lỗi console / page error | Sao chương 2 (Vườn, Thung Lũng, Xưởng, Hang) |
|---|---|---|---|---|
| desktop | chơi từ đầu, một phiên liền | cùng phiên, xong, thẻ "Bạn đã qua cả chín chặng!" | 0 / 0 | ★★☆ ★★☆ ★☆☆ ★☆☆ |
| tablet-landscape | chơi từ đầu, một phiên liền | cùng phiên, xong, thẻ kết đúng | 0 / 0 | ★★☆ ★★☆ ★☆☆ ★☆☆ |
| tablet-portrait | chơi từ đầu; cùng phiên qua Vườn, Thung Lũng, Xưởng; script lạc đường trên đường tới Hang (giới hạn của script, xem m-3) | chạy lại từ mã M3D3 dán ở "Nhập mã lưu": xong, thẻ kết đúng | 0 / 0 | ★★☆ ★★☆ ★☆☆ ★☆☆ |
| mobile-pixel | chơi từ đầu, xong Tháp | từ mã M3D3: xong, thẻ kết đúng | 0 / 0 | ★★☆ ★★☆ ★☆☆ ★★☆ |

Chỉ có cảnh báo hiệu năng của SwiftShader (`GPU stall due to ReadPixels`), không có lỗi. Không chặng nào cần bàn phím trên thiết bị chạm: số nhập bằng bàn số, thẻ chọn, Đúng/Sai, chọn nhiều + Xong, ê-ke, viên đá, tâm hình tròn, ô gạch, đi vòng hàng rào — tất cả bằng chạm. Mỗi cổng mở đúng thứ tự, thẻ nhiệm vụ chỉ đúng cổng tiếp theo ở mọi chặng.

Sau khi merge main (từ ngữ tự nhiên, ngân sách sai theo từng bước, bảng Thung Lũng nhìn thẳng từ trên) tôi build lại và chơi lại Khu Vườn + Thung Lũng trên mobile-pixel và tablet-portrait: xong, 0 lỗi; ảnh `*-20-valley-*` của hai hồ sơ này là bản sau merge.

Thời gian (giây, đồng hồ thật, desktop / tablet-landscape): xây cầu 61 / 95, các màn chương 1 14–113, các màn chương 2 16–70; đi bộ dài nhất là từ Xưởng (đông nam) về Hang (bờ tây): 634 / 286.

## 2. Kiểm tra từng màn hình

Mỗi 5 giây và ở mỗi lượt, script đo: nút < 44 px (đo cả vùng chạm thật bằng `elementFromPoint`, vì nút trên thanh trên cùng có vùng chạm mở rộng), chữ chỉ phím trên con trỏ thô (`kbd`, "phím", "Enter", "nhấn X"), chữ bị cắt / tràn ra ngoài màn hình (trừ nhãn nổi của thế giới), số > 100 trong khung câu hỏi.

| Phát hiện | Hồ sơ | Tình trạng |
|---|---|---|
| F-1 Nút đóng hộp thoại (✕) chỉ 34×34 px, không có vùng chạm mở rộng — mọi hộp thoại (VLM, câu đố xây cầu, sổ cửu chương, hoàn thành cầu) | 3 hồ sơ chạm | **Đã sửa** 684f293 (::after vô hình, 44 px) |
| F-2 Màn hình tiêu đề trên điện thoại: "Khám phá bảng cửu chương" và "Nhập mã lưu" cao 30 px | mobile-pixel | **Đã sửa** 684f293 (vùng chạm 44 px, chia khe 10 px để hai vùng không chồng nhau) |
| F-3 Cánh Đồng: nút "💡 Gợi ý" / "⟳ Xoay ruộng" cao 41 px khi màn hình dọc | mobile-pixel, tablet-portrait | **Đã sửa** 982a99d |
| F-4 Thẻ chúc mừng của Rừng (và Thành Phố trên desktop/tablet, bong bóng lời VLM ở Cánh Đồng) nhảy chỗ: keyframe `pop` ghi đè `transform: translate(-50%…)` nên trong 0,3–0,5 s thẻ lệch nửa thẻ sang phải/xuống rồi giật về giữa; trên điện thoại thẻ Rừng tràn ra ngoài màn hình (x 206..528 / 412) | mobile-pixel (thấy), mọi hồ sơ (cùng nguyên nhân) | **Đã sửa** 1ba0ead (dùng thuộc tính `translate`) |
| F-5 Thung Lũng trên tablet dọc: bảng nhỏ, lệch trái-dưới vì bảng điều khiển là cột phải 360 px | tablet-portrait | **Đã sửa** 43d41c9 (bảng điều khiển nằm dưới, như Khu Vườn) |
| F-6 Thung Lũng, lượt ê-ke: dấu ✓/✗ trên góc đã thử che chữ cái của góc | mọi hồ sơ | **Đã sửa** 43d41c9 (lớp chữ cái nằm trên lớp nút, không nhận chạm) |
| Chữ chỉ phím trên thiết bị chạm | — | không thấy ở màn nào |
| Chữ bị cắt | — | chỉ F-4 |
| Số > 100 trong câu hỏi | — | không có (lớn nhất: 100 mm = ? cm, 100 ml) |

Ngoài lề (không sửa, ghi nhận):
- m-1 Logo "math3d" (liên kết về `/`) 40×40 px trên điện thoại; không phải nút chơi, rời trang nếu chạm nhầm.
- m-2 Nhãn nổi "Nói chuyện với VLM" là nút cao 40 px trên điện thoại; nút chính là nút "Vào/Nói chuyện" ở dưới (đủ lớn).
- m-3 Đường từ Xưởng (đông nam) về Hang (bờ tây) rất dài: phải đi qua cầu, qua làng, theo đường chòi nghỉ; trên đoạn bờ tây không có nhãn nổi nào trong khung hình. Trẻ có bản đồ nhỏ và thẻ nhiệm vụ ("Về làng rồi đi theo con đường qua chòi nghỉ tới hang đá"), nhưng đây là chặng đi bộ dài nhất. Tác giả cân nhắc thêm biển chỉ đường / nhãn vùng Hang (vùng mở rộng không có nhãn nổi như năm vùng gốc).
- m-4 Cánh Đồng trên thiết bị chạm: 14/23 và 29/47 lần chạm vào ô trống trồng được — như QA LAN trước (ảnh chụp lấy vị trí ô khi camera còn dịch khung ở 1–10 khung hình/giây), không phải lỗi game.
- m-5 Thẻ người chơi trên điện thoại: "Nhà thám hiểm" xuống hai dòng khi có huy hiệu cấp + 3 chữ số xu (ảnh `mobile-pixel-30-closing-card.jpg`); đọc được, chỉ là thẩm mỹ.
- m-6 Hang, câu "Chọn tất cả câu đúng": các câu sai dạng "75 gấp 50 lần 25" (lẫn "hơn" với "gấp") — là bẫy cố ý, nhưng tác giả nên xem câu chữ có tự nhiên với trẻ lớp 3 không.

## 3. Script đọc được bao nhiêu

| Màn | Đọc được và tính đúng | Phải đoán |
|---|---|---|
| Khu Vườn | quy luật chậu hoa, cân (? + 9 = 31, 4 × ? = 16), "phần nào trước", phép tính từng bước | sau merge, câu "Trước hết, 9 + 2 bằng bao nhiêu?" (không còn "= ?"): script cũ không đọc, game vẫn đúng |
| Thung Lũng | trung điểm (đá ở giữa A–B), tâm O, ê-ke mọi góc rồi đếm/chọn góc vuông, bán kính/đường kính, AM = AB : 2 | — |
| Xưởng | mm↔cm, chu vi, diện tích, quả cân | đọc vạch nước trong bình (cần nhìn hình) |
| Hang | biểu thức, chia có dư, chu vi hàng rào, "gấp/hơn", Đúng/Sai | một số câu chữ mới |

Đây là giới hạn của script đọc màn hình, không phải lỗi game: mọi câu đoán sai đều được game xử lý đúng (gợi ý, lộ đáp án sau 3 lần sai ở bước đó, vẫn đi tiếp).

## 4. Ảnh

`{desktop,mobile-pixel,tablet-portrait,tablet-landscape}-{00-title,01-bridge-wrong-and-hint,20-valley-wrong-and-hints,30-closing-card}.jpg` (JPEG 55%, 4 ảnh mỗi hồ sơ).

## 5. Giới hạn

- Chromium + SwiftShader, không có WebKit/Safari thật; chưa thử trên máy thật qua LAN.
- Vòng suy luận ở cuối các màn chương 1 (chỉ xuất hiện khi đã thuộc bảng) và bài toán có lời văn mỗi câu thứ 5 khi xây cầu không gặp trong lượt chơi mới; đã có e2e `reasoning-rounds.spec.ts`.
