# QA chơi thật trên bản production qua LAN — math3d

Ngày: 2026-10-31 · Bản build: `http://192.168.2.15:4180/` (bundle `index-my2XmY1A.js`, đã có commit `ade75e7` sửa `crypto.randomUUID`) · Chromium headless + SwiftShader
Thiết bị: desktop 1280×800 (bàn phím + chuột), Pixel 7 (cảm ứng: cần điều khiển ảo, chạm). Mỗi lượt dùng một hồ sơ trình duyệt mới (IndexedDB trống).
Script: `.preview/play/` (`play.js`, `stages.js`, `level-stages.js`, `lib.js`). Bản production không có hook kiểm thử (`__game`, `__field`… đều không có), nên chỉ dùng thao tác thật.

Cách đi trong thế giới: đọc vị trí các nhãn nổi trên màn hình (VLM, cầu, cổng, vùng) để biết mình đang đứng đâu, rồi giữ WASD (desktop) hoặc kéo cần điều khiển (phone) theo đường. Trong màn chơi: đọc đề trên màn hình, tự tính đáp án, mỗi màn cố ý trả lời sai một lần rồi bấm Gợi ý.

## 1. Kết quả

Cả hai lượt đều **chơi xong toàn bộ chuỗi**: VLM → xây cầu 6 đoạn → qua cầu → Cánh Đồng → (tải lại trang) → Rừng → Thành Phố → Tháp → thẻ "Bạn đã qua cả năm chặng!". **0 lỗi console, 0 page error** ở cả hai lượt.

Thời gian từng chặng (giây, đồng hồ thật; SwiftShader chạy chỉ 1–10 khung hình/giây nên đi bộ chậm hơn máy thật nhiều):

| Chặng | Desktop | Phone |
|---|---|---|
| Màn hình tiêu đề → vào game | 34 | 26 |
| Nói chuyện với VLM | 4 | 7 |
| Xây cầu (6 câu, có sai + gợi ý) | 56 | 50 |
| Qua cầu (kể cả thử đi thẳng sang đông) | 63 | 39 |
| Đi tới cổng Cánh Đồng | 68 | 61 |
| Màn Cánh Đồng (5 luống) | 15 | 55 |
| Tải lại trang + kiểm tra tiến trình | 34 | 19 |
| Đi tới cổng Rừng (xuất phát lại từ làng) | 106 | 93 |
| Màn Rừng (5 lượt) | 58 | 68 |
| Đi tới cổng Thành Phố | 103 | 79 |
| Màn Thành Phố (5 lượt) | 46 | 48 |
| Đi tới cổng Tháp | 70 | 72 |
| Màn Tháp (7 tầng) | 43 | 66 |
| **Tổng** | **≈ 11 phút** | **≈ 11 phút** |

Sao nhận được: Cánh Đồng ★☆☆, Rừng ★★☆, Thành Phố ★☆☆, Tháp ★★☆ (cả hai thiết bị).

**Tiến trình sau khi tải lại trang (sau màn Cánh Đồng): giữ nguyên.** Thẻ nhiệm vụ vẫn là "Rừng Nhân Chia / Đến Cổng Rừng Nhân Chia", cổng Cánh Đồng "Đã hoàn thành ★☆☆", cổng Rừng "Cổng đã mở", cấp 2 · 100/150 XP · 75 xu như trước. Người chơi xuất hiện lại ở làng (-6, 6) (đã biết, m-7).

Video:
- Desktop: `.preview/play/videos/desktop/page@eadc5e54322e7a373bba554a9265368b.webm`
- Phone: `.preview/play/videos/phone/page@e81f1efa93c57540dec6c8c183a09e40.webm` (file 1,4 KB cùng thư mục là trang trống của hồ sơ, bỏ qua)

Ảnh: `reports/lan-playthrough-shots/{desktop,phone}-NN-*.png` (00 tiêu đề, 02 cầu xong, 04 qua cầu, 10/11 tới và vào từng cổng, 12/13 xong từng màn, 20 sau tải lại, 30 cuối).

## 2. Lỗi và chỗ vướng

Không có Blocker trên bản build này. Lỗi "mình chơi không được" của tác giả rất có thể là lỗi `crypto.randomUUID` trên http LAN: trang ở `http://192.168.x.x` có `isSecureContext = false`, `crypto.randomUUID` không tồn tại (đã kiểm tra trong trình duyệt). Bản đang chạy trên 4180 đã có hàm thay thế (`src/store/new-id.ts`, commit `ade75e7`) và không còn lỗi. Bản build cũ hơn thì tôi không kiểm tra lại.

### Minor

**L-1 Nút "Sao chép mã" (xuất mã lưu) không làm gì khi chạy qua http LAN.**
- Tái hiện: chạy qua `http://192.168.2.15:4180` → Cài đặt → "Xuất mã lưu" → "Sao chép mã".
- Mong đợi: mã được chép, hiện thông báo "Đã sao chép mã lưu."
- Thực tế: không thông báo, không chép gì. Trên http thì `navigator.clipboard` là `undefined`; `navigator.clipboard?.writeText(r).then(…, () => document.execCommand('copy'))` bị optional chaining cắt luôn cả chuỗi, nên đường dự phòng `execCommand` không bao giờ chạy. Đổi máy qua LAN, trẻ phải tự chọn và chép mã bằng tay.
- Mã: `src/ui/save-code-dialog.ts:107-111`. Ảnh: `desktop-40-save-code-copy-on-http.png`. Console: không có lỗi.
- Liên quan: trên http cũng không có service worker (`'serviceWorker' in navigator` = false), nên không cài được PWA / chơi offline qua LAN. Đây là giới hạn của trình duyệt, không phải lỗi code.

**L-2 (m-6, vẫn còn) Đi thẳng sang bờ bên kia thì kẹt ở bờ sông.**
- Tái hiện: xây xong cầu, đứng cạnh VLM, giữ hướng đông (desktop: D/W kết hợp theo góc camera; phone: kéo cần sang phải) khoảng 40 khung hình.
- Thực tế: desktop dừng ở ≈(3.3, 6.9), phone ≈(3.6, 2.2), đúng mép sông; cầu nằm ở z≈0. Lái về phía cầu (z≈0) thì qua được ngay trong lần đầu, ở cả hai thiết bị. Vướng nhưng không chặn.
- Ảnh: `desktop-03-stuck-riverbank-straight-east.png`, `phone-03-stuck-riverbank-straight-east.png`.

**L-3 (m-7, vẫn còn) Tải lại trang là về làng.** Sau khi tải lại, đường từ làng tới cổng Rừng mất 93–106 s (gấp rưỡi chặng tới Cánh Đồng). Tiến trình vẫn còn nguyên. Ảnh `*-20-after-reload.png`.

### Polish (nội dung và gợi ý)

- **P-1 Câu hỏi xây cầu lặp lại**: desktop 6 câu chỉ có 3 đáp số 20, 2, 20, 2, 16, 2. Gợi ý bậc 3 và 4 lặp nguyên văn bậc 2 ("2 nhóm, mỗi nhóm 10 viên đá: 2 × 10 = 20…"). Ảnh `desktop-01-bridge-wrong-and-hint.png`.
- **P-2 Cánh Đồng lặp phép tính**: desktop trong 5 luống có 3 × 3 hai lần, 3 × 5 hai lần.
- **P-3 Tháp: gợi ý bậc 2 nói về phép chia khi câu hỏi là phép nhân**: đề "2 × 2 = ?" (chọn kết quả) mà gợi ý 2 lại là "Nghĩ ngược lại: số nào chia cho 2 thì được 2?". Trẻ 7 tuổi dễ rối. Ảnh `desktop-11c-tower-wrong-and-hints.png`. Mã: `src/levels/tower/tower-hints.ts`.
- **P-4 Tháp lặp tầng**: phone tầng 2 và tầng 6 đều là "? × 5 = 10". Đáp án nhiễu đôi khi quá xa ("71" cho 3 × 8; "1" cho 2 × 2).
- **P-5 Phone: thẻ nhiệm vụ thu gọn** chỉ còn "Đến Cổng Rừng Nhân Chia", phần chỉ đường ("đi theo con đường bên kia cầu tới khu rừng xanh…") phải bấm mũi tên mới thấy. Nhân vật cũng bị cây che khi đứng ở cổng Cánh Đồng. Ảnh `phone-13-field-back-in-world.png`.

### Đã kiểm tra và không phải lỗi

- Phone, Cánh Đồng: trong lượt chạy chính có 14/23, 23/37, 20/33 lần chạm vào ô trống là trồng được. Tôi chạy thêm (`.preview/play/probe-field-touch.js`) khi camera đã đứng yên: 9/9 lần chạm đều trồng được, và `elementFromPoint` ở mọi ô đều là `CANVAS`, không có nhãn nào che. Những lần chạm trượt là do ảnh chụp lấy vị trí ô lúc camera còn đang dịch khung, ở tốc độ 1 khung hình/giây. Đây là hiện tượng của môi trường thử, không phải lỗi game.

## 3. Phạm vi và giới hạn

- Không có hook nên vị trí người chơi được suy ra từ nhãn nổi trên màn hình (sai số khoảng ±0,3 đơn vị). Tôi không đánh giá được việc trẻ có tự tìm ra đường hay không; chỉ ghi lại thẻ nhiệm vụ/VLM có chỉ đúng cổng tiếp theo (có, ở mọi chặng).
- Thành Phố: giao hàng bằng thẻ chọn số nhà (game cho phép: "Chọn số nhà ở bảng cũng được"), chưa thử kéo gói hàng trong 3D. Rừng: chia bằng nút "Chia mỗi bạn một quả", chưa thử kéo quả.
- SwiftShader chỉ đạt 1–10 khung hình/giây (máy đang bận vì có bộ e2e khác chạy cùng lúc), nên thời gian ở bảng chậm hơn máy thật.

**Status:** DONE_WITH_CONCERNS
