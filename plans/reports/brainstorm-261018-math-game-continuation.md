# Brainstorm: phát triển tiếp game 3D học toán "Vương Quốc Cửu Chương"

Ngày: 2026-10-18 · Nguồn: https://math.aigame3d.com (chỉ có bản deploy, không có source)

## 1. Game gốc đang có gì (bằng chứng từ bundle)

Đã tải `index.html`, `/assets/index-CO4MPNqj.js` (568 KB, minified), `/assets/index-D1ngBGok.css` (30 KB). Không có manifest/robots/sitemap (SPA trả về HTML cho mọi đường dẫn). Không có file `.glb/.gltf`, ảnh, âm thanh nào được tham chiếu.

| Hạng mục | Bằng chứng | Kết luận |
|---|---|---|
| Tên / chủ đề | `<title>Math AI Game 3D - Vương Quốc Cửu Chương</title>`, meta: "game 3D giúp trẻ học phép nhân qua phiêu lưu và nhiệm vụ xây cầu" | Chỉ dạy phép nhân (bảng cửu chương) |
| Engine | 116 lần `THREE`, chuỗi `"180"` (REVISION), không có React/Vue/R3F/Babylon/Unity | **Three.js r180 thuần + Vite** (tên file hash kiểu Vite), UI là HTML/DOM + template string |
| Mô hình 3D | 0 GLTF, 16 `InstancedMesh`, 1 `CanvasTexture`, có shadowMap | Toàn bộ thế giới dựng bằng geometry thủ tục (low-poly), không asset ngoài |
| Âm thanh | `class` dùng `AudioContext` + `OscillatorNode` sine; nhạc nền là 8 nốt lặp mỗi 850ms | Âm thanh tổng hợp, không file audio |
| Ngôn ngữ | `lang="vi"`, map `jl` dịch VI→EN, key `aigame3d_language` | Tiếng Việt chính, có tiếng Anh |
| Font | Google Fonts `Baloo 2` + `Nunito` (cả hai hỗ trợ tiếng Việt) | Phụ thuộc mạng để tải font |
| Nhân vật | "Nhà thám hiểm" / "Nhà khám phá" (2 avatar), NPC dẫn đường **Milo** (mũ xanh) | |
| Điều khiển | WASD/mũi tên, chạm đất để đi, joystick cảm ứng, Space nhảy, E nói chuyện, M bản đồ, kéo xoay camera, lăn chuột zoom | Có tính đến mobile |
| Màn chơi duy nhất | "Cây cầu tình bạn": `yt=6` đoạn cầu; mỗi câu đúng xây 1 đoạn. Câu hỏi: "Mình cần **N viên đá**. Phép nhân nào đúng?" chọn 1 trong 3 | Bài trắc nghiệm 3 đáp án |
| Cách sinh câu hỏi | `ll(a,b)`: đáp án đúng `a×b`, nhiễu là `a×(b−1)` và `a×(b+1)`; bảng `[2..10]`, thừa số `1..10` | Nhiễu luôn là "hàng xóm" trong cùng bảng → đoán theo độ lớn cũng được |
| Gợi ý 3 bậc | 1) "Có a nhóm, mỗi nhóm b viên đá. Hãy đếm từng nhóm" 2) "Cộng các nhóm lại: b + b + … = ?" 3) đưa luôn đáp án | Sư phạm đúng: nhân = cộng lặp |
| Ôn tập | `questionStats` (attempts/correct/wrong/responseTime) theo id `m{a}_{b}`; hàng đợi `review` tối đa 30; 70% câu kế tiếp lấy từ review | Có mầm "lặp lại ngắt quãng" đơn giản |
| Phần thưởng | +10 XP, +5 xu, combo ≥3; cấp theo XP `[0,100,250,450,700]` (5 cấp) | Xu chưa tiêu vào đâu |
| Chế độ khác | "Sổ cửu chương" (chọn bảng ×2–×10, trộn bảng, dấu ✓), "Không giới hạn thời gian" | |
| Lưu tiến trình | `localStorage` key `aigame3d_multiplication_save`, có validate dữ liệu khi đọc | Không tài khoản, xóa trình duyệt là mất |
| Vùng đất đã "dự định" | Bản đồ có 7 vùng: Làng Khởi Đầu, Khu Vườn Bên Sông (thế giới 1), **Cánh Đồng Phép Tính** (TG02, "ruộng phép tính và cổng vào thế giới thứ hai"), **Rừng Nhân Chia** (TG03, "phép nhân và phép chia"), **Thành Phố Con Số** (TG04, "tòa nhà mang số, quảng trường đài phun nước"), **Tháp Toán Học** (TG05, "đá số lơ lửng"). Tất cả `unlock:"bridge"` | Các vùng 2–5 chỉ là khu đất đi được + nhãn "Chào mừng đến …" — **không có gameplay** |
| Lỗi trình duyệt | "Chưa mở được thế giới 3D — hãy bật tăng tốc đồ họa…" | Có xử lý fallback WebGL |

**Độ tuổi suy ra:** bảng nhân 2–10 + "đếm nhóm/cộng lặp" ⇒ lớp 2–3 (7–9 tuổi). Theo GDPT 2018: lớp 2 học bảng nhân/chia 2 và 5; lớp 3 học bảng 3, 4, 6, 7, 8, 9. Game gốc không ghi độ tuổi — đây là suy luận.

**Không xác định được:** tác giả là ai, có dùng AI runtime không (chữ "AI" trong tên nhưng chỉ có 1 lời gọi `fetch(` và không thấy endpoint AI), hình ảnh thực tế lúc chạy (không chạy trình duyệt), quyền sử dụng tên/nhân vật.

## 2. Phản biện trước khi bàn phương án

1. **Giả định "game hoàn chỉnh = thêm nhiều thế giới" là sai trọng tâm.** Giá trị học nằm ở vòng lặp luyện tập (câu hỏi → phản hồi → ôn lại câu sai). Game gốc đã có mầm này. Thêm 4 thế giới mà vẫn là trắc nghiệm 3 lựa chọn thì chỉ là đổi phông nền.
2. **Trắc nghiệm 3 đáp án yếu.** Đoán bừa đúng 33%; nhiễu `a×(b±1)` cho phép loại trừ bằng ước lượng. Màn mới nên dùng **thao tác trực quan** (kéo/xếp/chia đồ vật) hoặc **nhập số**, trắc nghiệm chỉ để khởi động.
3. **Đi bộ thế giới mở tốn công gấp nhiều lần dạy toán.** Mỗi vùng đi được cần va chạm, camera, joystick, tối ưu mobile. Nên giữ thế giới mở làm **hub**, còn mỗi màn là **diorama camera cố định** — chạm là chơi, nhẹ cho Android yếu.
4. **Bản quyền.** Mình không có source, tên "Vương Quốc Cửu Chương", nhân vật Milo, bố cục bản đồ là của người khác. Dựng lại "theo ý tưởng" thì ổn; sao chép bundle/tên/nhân vật khi chưa có đồng ý thì không. Cần làm rõ trước khi phát hành.
5. **Đừng mở rộng sang nhiều mạch toán cùng lúc.** Phương án "cả chương trình lớp 1–5" nghe hấp dẫn nhưng với một người làm thì đó là 3 game, không phải 1.

## 3. Các phương án

### A. Hoàn thiện Vương Quốc Cửu Chương — một mạch nhân/chia, màn diorama (Three.js thuần + Vite + TS)

- **Cốt truyện:** Những viên đá số của vương quốc bị gió bão thổi tung khỏi Tháp Toán Học, mỗi vùng mất một năng lực. Milo cùng bạn nhặt đá, sửa từng vùng, cuối cùng đưa đá về tháp.
- **Các màn:**
  | Vùng | Kỹ năng (GDPT 2018) | Cơ chế tương tác |
  |---|---|---|
  | 1. Cây cầu tình bạn (dựng lại) | Nhân = cộng các nhóm bằng nhau; bảng 2, 5 (lớp 2) | Kéo nhóm đá vào khuôn cầu, rồi chọn/nhập phép nhân (bỏ trắc nghiệm thuần) |
  | 2. Cánh Đồng Phép Tính | Mô hình mảng hàng × cột, tính giao hoán `3×4 = 4×3`; bảng 3, 4 | Kéo thả trồng cây thành ruộng chữ nhật đủ N cây; xoay ruộng 90° thấy giao hoán |
  | 3. Rừng Nhân Chia | Phép chia: chia đều & chia theo nhóm, quan hệ nhân–chia; bảng chia 2–5 rồi 6–9 | Chia quả cho các bạn thú vào giỏ; "gia đình phép tính" `3×4, 4×3, 12:3, 12:4` |
  | 4. Thành Phố Con Số | Nhân/chia số có 2–3 chữ số với số có 1 chữ số, bài toán có lời văn 1–2 bước (lớp 3) | Lắp tầng × phòng cho tòa nhà; đài phun nước "chia nước" có số dư |
  | 5. Tháp Toán Học | Ôn tổng hợp, ưu tiên câu sai (dùng `questionStats`) | Leo tháp, mỗi tầng một câu, tốc độ tăng dần, nhập số |
- **Tuổi:** 7–9 (lớp 2–3), khớp đúng phần nhân/chia của GDPT 2018.
- **Stack:** Three.js r18x thuần + Vite + TypeScript, UI bằng DOM/CSS như bản gốc, geometry thủ tục + `InstancedMesh`, âm thanh WebAudio. Lý do: giống bản gốc nên dựng lại nhanh, bundle nhỏ (~200 KB gzip), không lớp framework giữa.
- **Ưu:** phạm vi gọn, câu chuyện có sẵn khung (bản đồ gốc đã gợi ý), tải nhanh, chạy được Android tầm thấp nếu tắt bóng/giảm pixelRatio.
- **Nhược:** Three.js thuần không có cấu trúc scene/state sẵn → phải tự giữ kỷ luật (scene manager, state store đơn giản). UI DOM chồng lên canvas cần cẩn thận với touch.
- **Rủi ro biên:** iOS Safari chặn AudioContext tới khi chạm (bản gốc đã `unlock()` — giữ lại); font Google cần tự host cho offline (Baloo 2/Nunito có subset vietnamese); kéo thả 3D trên màn nhỏ cần vùng chạm ≥ 44px và raycast trên mặt phẳng ẩn; localStorage có thể bị xóa/chặn trong chế độ ẩn danh → thêm xuất/nhập mã lưu; PWA offline qua `vite-plugin-pwa`.
- **Hợp codebase hiện tại:** thư mục trống, dựng lại từ đầu theo đúng kiến trúc bản gốc.
- **Công sức:** MVP (hub + cầu + cánh đồng + rừng) 12–18 ngày-người; đủ 5 vùng 30–40 ngày. **Rủi ro: thấp–trung bình.**

### B. "Vương Quốc Toán" đa mạch kiến thức (R3F + React)

- **Ý tưởng:** mỗi vùng một mạch: số học (cầu), hình học (thành phố: chu vi/diện tích HCN, hình vuông — lớp 3), đo lường (cánh đồng: kg, l, thời gian), phân số làm quen (rừng: chia bánh 1/2, 1/3), tháp ôn tổng hợp. Tuổi 7–10.
- **Stack:** React Three Fiber + drei + zustand; UI React. Hợp khi nhiều màn hình menu/HUD khác nhau.
- **Ưu:** phủ rộng chương trình, dễ bán với phụ huynh/trường.
- **Nhược:** mỗi mạch cần thiết kế sư phạm riêng, câu chuyện loãng, chủ đề "cửu chương" mất ý nghĩa. R3F thêm ~150 KB và chi phí re-render nếu không cẩn thận trên máy yếu.
- **Công sức:** 60–90 ngày. **Rủi ro: cao** — dễ thành 5 mini-game nửa vời. **Không khuyên.**

### C. Puzzle xây dựng có vật lý (R3F + Rapier)

- **Ý tưởng:** cầu/tháp có vật lý thật; sai phép tính thì cầu sập. Thêm màn "cân bằng" (phương trình đơn giản), "máy bắn đá" (ước lượng).
- **Ưu:** ấn tượng, vui, dễ quay video quảng bá.
- **Nhược:** vật lý dạy kỹ năng chơi, không dạy toán — trẻ thử-sai đến khi qua, không cần hiểu. Rapier WASM ~1–2 MB, nặng cho Android rẻ. Khó cân chỉnh độ khó.
- **Công sức:** 35–50 ngày. **Rủi ro: cao.** Đây là phương án đẹp nhưng sai mục tiêu.

### D. Chuyển sang engine (Godot 4 web export / Unity WebGL)

- **Ý tưởng:** làm cùng cốt truyện như A nhưng trong engine có editor.
- **Ưu:** editor cảnh, animation, vật lý sẵn; xuất được app mobile native sau này.
- **Nhược:** bản web nặng (Godot 4 ~30–40 MB, Unity ~10–30 MB), khởi động chậm trên 3G/4G yếu; Godot 4 web cần `SharedArrayBuffer`/COOP-COEP hoặc bản single-thread; nhập tiếng Việt và font fallback phải cấu hình; AI-assisted kém hơn vì nhiều việc nằm trong editor chứ không trong code.
- **Công sức:** 40–60 ngày (+ học engine). **Rủi ro: trung bình–cao.** Chỉ đáng nếu đích cuối là app store, không phải web.

### E. Bản tối giản: bản đồ hub + màn 2.5D, bỏ đi bộ (Three.js thuần)

- **Ý tưởng:** như A nhưng bỏ hẳn nhân vật đi lại; bản đồ là màn chọn vùng 3D xoay được, chạm vào vùng là vào màn.
- **Ưu:** rẻ nhất (MVP 8–12 ngày), chạy mượt máy yếu, dễ cho trẻ 7 tuổi.
- **Nhược:** mất cảm giác "phiêu lưu" vốn là điểm mạnh của bản gốc; khó phân biệt với app luyện tập thường.
- **Rủi ro: thấp.** Là phương án dự phòng nếu A trượt thời gian.

### Bảng so sánh

| | A. Hoàn thiện nhân/chia | B. Đa mạch | C. Vật lý | D. Engine | E. Tối giản |
|---|---|---|---|---|---|
| Tuổi | 7–9 | 7–10 | 8–10 | 7–9 | 7–9 |
| Stack | Three.js+Vite+TS | R3F+zustand | R3F+Rapier | Godot/Unity | Three.js+Vite+TS |
| Bundle (ước) | ~200 KB gz | ~350 KB gz | 1.5–2 MB | 10–40 MB | ~180 KB gz |
| MVP / đầy đủ (ngày) | 12–18 / 30–40 | 25 / 60–90 | 20 / 35–50 | 20 / 40–60 | 8–12 / 20–25 |
| Giá trị sư phạm | Cao, sâu | Rộng, nông | Thấp | Như A | Cao |
| Android yếu | Tốt | Khá | Kém | Kém | Rất tốt |
| Rủi ro | Thấp–TB | Cao | Cao | TB–Cao | Thấp |

Phương án ít phức tạp nhất vẫn đạt yêu cầu: **E**. Phương án nên chọn: **A** (giữ được chất phiêu lưu mà chi phí chỉ hơn E vừa phải).

## 4. Khuyến nghị: Phương án A

**Lý do:**
- Bản đồ gốc đã định sẵn 4 vùng và mô tả của "Rừng Nhân Chia" chỉ thẳng sang phép chia → mạch nhân → mảng → chia → nhân nhiều chữ số → ôn tập là đường nối tự nhiên, khớp lớp 2–3 GDPT 2018.
- Cùng stack với bản gốc → dựng lại cầu nhanh, kế thừa được cách làm nhẹ (geometry thủ tục, âm thanh tổng hợp, không asset).
- Màn diorama camera cố định giới hạn công sức đi bộ/va chạm vào duy nhất hub.

**Kiến trúc tối thiểu (để AI-assisted không bị rối):**
- `core/`: renderer + vòng lặp + quản lý scene (hub ↔ màn), input chung (chuột/chạm/kéo).
- `learning/`: sinh câu hỏi theo kỹ năng, thống kê từng phép tính, hàng đợi ôn — thuần TS, không phụ thuộc Three.js, test được bằng Vitest.
- `levels/<vùng>/`: mỗi màn một scene + quy tắc thắng.
- `ui/`: HUD/hội thoại DOM; chuỗi tiếng Việt tập trung một file (dễ thêm tiếng Anh sau).
- `save/`: localStorage có version + migrate + xuất/nhập mã.

**Phạm vi MVP (theo thứ tự làm):**
1. Hub Làng Khởi Đầu + Milo + bản đồ (có thể đơn giản hóa so với gốc).
2. Cây cầu tình bạn — dựng lại, thay trắc nghiệm thuần bằng "kéo nhóm đá → chọn phép nhân", bảng 2 và 5.
3. Cánh Đồng Phép Tính — mô hình mảng + giao hoán, bảng 3, 4.
4. Rừng Nhân Chia — chia đều + gia đình phép tính.
Thành Phố và Tháp để sau khi có phản hồi từ trẻ thật.

**Rủi ro khi làm:**
- Kéo thả 3D trên điện thoại nhỏ khó chịu → làm thử trên máy thật ngay tuần đầu.
- Phạm vi trôi (thêm vùng/mạch) → khóa MVP 4 mục trên.
- Bản quyền tên/nhân vật → đổi tên nếu chưa có đồng ý.

**Đo thành công:**
- Trẻ 7–9 tuổi chơi xong cầu + cánh đồng không cần người lớn hướng dẫn (quan sát 3–5 bé).
- Tỉ lệ đúng của các phép tính trong hàng ôn tăng sau 3 buổi chơi (dữ liệu sẵn trong `questionStats`).
- Tải lần đầu < 3 giây trên 4G, ≥ 30 fps trên Android tầm 3 triệu đồng.

**Bước tiếp theo:** trả lời các câu hỏi dưới → lập plan chi tiết (`/tkm:create-plan --hard`) cho MVP 4 mục.

## 5. Câu hỏi chỉ bạn trả lời được

1. Bạn có quan hệ/được phép từ tác giả gốc không — giữ tên "Vương Quốc Cửu Chương", nhân vật Milo, hay phải đổi tên và nhân vật?
2. Người chơi thật là ai và chơi ở đâu: con em ở nhà trên điện thoại/tablet, hay lớp học trên máy tính phòng máy? (quyết định ưu tiên touch và offline)
3. Có cần tài khoản/đồng bộ nhiều máy hoặc báo cáo cho phụ huynh/giáo viên không, hay chỉ lưu trên máy là đủ?
4. Đích cuối là web thuần, hay sau này lên app store? (nếu app store là bắt buộc thì D cần cân nhắc lại)
5. Bạn có người vẽ/thiết kế âm thanh, hay toàn bộ hình ảnh tiếp tục là low-poly dựng bằng code như bản gốc?

## Quyết định của người dùng (2026-10-18)

- Q: Tên game và nhân vật Milo → A: "đổi là VLM" (đổi tên/nhân vật theo VLM; tên cụ thể cần xác nhận khi lập kế hoạch)
- Q: Người chơi / thiết bị → A: Cả hai như nhau (cảm ứng điện thoại/tablet và chuột/bàn phím máy tính)
- Q: Lưu trữ tiến trình → A: Có tài khoản + đồng bộ nhiều máy (cần backend, vd Supabase)
- Q: Đích phát hành → A: Chỉ web, có PWA
- Hướng được chọn: A (làm tiếp mạch nhân/chia, Three.js + Vite + TS), MVP 4 phần: làng + bản đồ, Cầu, Cánh Đồng, Rừng
- Còn mở: người vẽ/âm thanh → mặc định tiếp tục dựng low-poly bằng code như bản gốc
- Q: Đăng nhập không dùng OTP (trẻ không dùng điện thoại)? → A: Phụ huynh đăng nhập Google hoặc email+mật khẩu một lần trên máy con; trẻ chọn avatar + mật khẩu hình (chạm 3 hình). Bỏ OTP. QR ghép máy và mã lớp để sau MVP.
