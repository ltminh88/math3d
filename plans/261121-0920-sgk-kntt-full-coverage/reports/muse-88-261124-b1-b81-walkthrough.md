# Walkthrough "Học tiếp" B1→B81 — báo cáo kiểm thử tự động

- Ngày: 24/11/2026
- Nhánh: `muse/lesson-walkthrough-b1-b81`, từ main `8e7a564` (sau khi PR #69 gộp)
- Nhiệm vụ: TASK R18 qua hộp thư #63 — kiểm thử tự động chế độ "Học tiếp" (Ôn theo bài) đi từ bài 1 tới bài 81, thay phần lớn việc chơi thử trên iPad.
- Người chơi giả lập: trả lời đúng hết, không dùng gợi ý, mỗi lượt 6 câu (đúng như trẻ chơi).

## Kết luận ngắn

- **80/81 bài xong.** Chỉ **B8 kẹt**: chơi đúng hết 20 lượt vẫn chỉ 2 sao, "Học tiếp" chỉ mãi vào B8 và trẻ không bao giờ tới được B9–B81 bằng nút "Học tiếp".
- Không có lỗi render, không có đáp án đúng nào bị chấm sai, không có bài nào không có câu hỏi.
- Tổng cộng cần 167 lượt (1 002 câu đúng) để xong cả 81 bài khi chơi trực tiếp từng bài; bài tốn nhất là B4 (17 lượt).

## Phát hiện 1 — B8 kẹt ở 2 sao (nghiêm trọng, chặn chuỗi "Học tiếp")

B8 "Luyện tập chung" là bài mix của B1–B7 (87 khóa). Để được 3 sao, bài mix cần MỌI khóa đạt hộp ≥ 4. Sau khi chơi xong B1–B7, còn đúng 3 khóa chưa đạt:

- `mul:4x4`, `div:32/4`, `div:36/4` — 3 phép tính bảng 4 còn sót từ B6, mỗi khóa chỉ còn thiếu 1 câu đúng nữa là lên hộp 4.

Nhưng 3 khóa này **không bao giờ xuất hiện** trong các lượt chơi B8: đo được **0 lần được chọn trong 20 lượt** (120 câu). Nguyên nhân nằm ở `planLessonRun` (`src/learning/lesson-planner.ts`):

- Bài mix dàn lượt chơi theo nhóm nguồn (`spreadBySource`): mỗi lượt lấy 1 khóa từ mỗi nhóm nguồn, theo thứ tự nhóm.
- B8 có 8 nhóm nguồn (2 kỹ năng riêng + B1–B7), mà một lượt chỉ có 6 câu → chỉ 6 nhóm đầu được lấy, nhóm thứ 7 và 8 không bao giờ tới lượt.
- Nhóm B6 nằm ngoài 6 nhóm đầu, nên 3 khóa bảng 4 của nó không bao giờ được ôn trong B8.

Đã kiểm chứng tính ổn định: B8 kẹt ở 2 sao với cả 6 hạt giống ngẫu nhiên khác nhau (không phải do may rủi của một lần chạy). Lớp e2e cũng xác nhận qua UI: gieo B1–B7 như trẻ vừa chơi xong (chỉ 3 khóa trên ở hộp 3), chơi B8 đúng hết 3 lượt qua giao diện thì B8 vẫn dưới 3 sao và "Học tiếp" vẫn chỉ vào B8.

Cách vòng qua hiện tại (trẻ phải tự mò): bấm vào hàng B6 chơi lại vài lượt để đưa 3 khóa kia lên hộp 4, rồi quay lại B8 mới xong. "Học tiếp" không hề gợi ý điều này.

Đây là lỗi thiết kế của bộ chia lượt chơi, không phải lỗi dữ liệu của riêng B8: bất kỳ bài mix nào có nhiều hơn 6 nhóm nguồn đều có thể đói khóa theo cùng cơ chế (B41 có 13 nhóm nhưng thoát được vì các khóa của nó đã thuộc hết từ các bài nguồn trước đó). Việc sửa thuộc về người duyệt — xem mục "Câu hỏi" cuối báo cáo. Trong bộ test, lỗi này được ghi lại bằng một test `it.fails` (`src/learning/lesson-walkthrough.test.ts`): test sẽ tự đỏ lên thành "pass bất ngờ" khi planner được sửa, nhắc bỏ `.fails`.

## Phát hiện 2 — B4 cần nhiều lượt nhất (nhận xét, không phải lỗi)

B4 (bảng nhân 2, 5 và bảng chia 2, 5 — 36 khóa) cần **17 lượt (102 câu đúng)** mới đủ 3 sao, vì luật 70% cần 26 khóa đạt hộp 4 mà mỗi lượt chỉ lên được 6 khóa. Các bài bảng khác cần 5–8 lượt. Đây là hệ quả trực tiếp của luật sao hiện tại, không phải lỗi — ghi lại để tác giả biết bài đầu tiên của chuỗi bảng tốn công nhất.

## Phát hiện 3 — Các bài mix "xong sẵn" (đúng thiết kế)

25 bài mix/chủ đề ôn tập có 0 lượt chơi khi tới lượt chúng (B19, B20, B22, B29, B34, B35, B40, B42, B43, B44, B49, B53, B58, B62, B65, B67, B69, B72, B75, B76, B77, B78, B79, B80, B81): các khóa của chúng đã đạt hộp ≥ 4 nhờ chơi các bài nguồn trước đó, nên chúng đã 3 sao ngay khi mở. "Học tiếp" bỏ qua chúng đúng cách. Đây là hành vi đúng — một bài ôn tập mà nội dung đã thuộc thì không cần chơi lại.

## Lớp 1 — Vitest (chạy trong CI, nhanh)

Harness `src/learning/lesson-walkthrough.ts` + test `src/learning/lesson-walkthrough.test.ts`:

- Với mỗi bài 1–81: dựng lượt ôn đúng như `planLessonRun` của "Học tiếp" (chỉ lấy khóa render được, cùng một điều kiện `isKeyRenderable` mà picker và lượt chạy dùng), sinh câu đúng như lượt chạy (`itemForSkill` + tier theo hộp Leitner, `buildDailyQuestion` cho bảng cửu chương), kiểm câu render được (renderer đã đăng ký) và đáp án đúng được oracle của chính họ đó chấm là đúng, rồi ghi một lần trả lời đúng sạch (đúng ngay lần đầu, không gợi ý, 1 000 ms).
- Chạy 2 cách: `walkLessonsInOrder` (chơi trực tiếp từng bài B1→B81 — ra bảng dưới) và `walkLessonChain` (đi theo `nextLesson` như trẻ bấm "Học tiếp" — dừng ở B8).
- Kết quả: 3 test pass, 1 test expected-fail (B8 — xem Phát hiện 1). Không có lỗi render/oracle nào trong 1 002 câu đã chơi. Toàn bộ 81 bài đều có lượt chơi ≥ 1 câu ở lượt đầu (trừ các bài đã xong sẵn). Tổng 167 lượt ≤ ngưỡng 400.

## Lớp 2 — E2E mẫu qua UI (Playwright, desktop + tablet-portrait)

Mẫu 40 bài: bài đầu + bài cuối mỗi chủ đề (16 chủ đề → 32 bài) + 9 bài R8 làm dày (B3, B13, B16, B24, B27, B31, B32, B33, B51; B16 đã là đầu chủ đề 3 nên mẫu riêng thêm 8 bài). Spec `tests/e2e/lesson-walkthrough.spec.ts`, solver dùng chung ở `tests/e2e/lesson-walkthrough-helpers.ts` (giải qua UI bằng bấm/chạm thật, không dùng hook để trả lời; chỉ dùng `window.__lesson` để biết đáp án đúng như mọi spec bài học khác).

Mỗi bài mẫu: gieo các bài trước đó lên 3 sao, kiểm "Học tiếp" chỉ đúng vào bài đó (hoặc bỏ qua nó khi nó đã xong sẵn), chơi 1 lượt qua UI, kiểm kết quả: bài 1–2 kỹ năng thì xong 3 sao và "Học tiếp" chuyển bài; bài 3–6 kỹ năng thì lên 1–2 sao và "Học tiếp" ở lại; bài bảng B9 và bài 9 kỹ năng B66 thì chưa lên sao sau 1 lượt và "Học tiếp" ở lại; các bài mix đã xong sẵn thì "Học tiếp" bỏ qua (với B75, B76, B81 thì cả đoạn cuối đều xong nên picker hiện "đã xong hết", không còn nút "Học tiếp").

Kết quả desktop-chromium (local, workers=1): **12/12 pass trong 22,8 phút** (chạy lại sau rebase lên main `8e7a564` — lần chạy trước đó 9/12, 3 lỗi đều đã rõ nguyên nhân và đã sửa: test tĩnh thiếu B8 trong mẫu, và 2 nhóm mix cuối khi cả đoạn cuối đã xong hết thì picker không còn nút "Học tiếp").

Kết quả tablet-portrait (local, workers=1): **12/12 pass, chia hai lần chạy** — lần chạy full-file 8/12 rồi VM restart kill tiến trình ở phút ~35, lần chạy tiếp 4/4 cho 4 test còn lại (B63–B69, B70–B75, B76/B81, B8). Cả 12 test đều xanh với spec cuối cùng.

**Vì sao bài 1–2 kỹ năng không lên 3 sao trên tablet (không phải lỗi sản phẩm).** Hộp Leitner chỉ tăng khi trả lời một câu trong dưới 8 giây. Đo từ trace của lần chạy tablet đầu: thời gian thực mỗi câu trên tablet là **9–24 giây** (máy ảo yếu + SwiftShader + chờ bấm chạm), nên gần như không có lần trả lời nào được tăng hộp — B24 chơi đúng hết 3 lượt vẫn chỉ 1 sao (chỉ tính số lần đã thử, hộp không nhích). Một trẻ thật trên iPad thật trả lời trong vài giây nên không gặp giới hạn này. Vì vậy spec e2e chia đôi: desktop giữ kiểm tra nghiêm (1 lượt → 3 sao, "Học tiếp" chuyển bài — đã xanh 12/12); tablet chỉ kiểm tra lượt chơi qua chạm chạy xong, sao có tăng, "Học tiếp" xử sự đúng — còn logic lên 3 sao đã được chứng minh bởi lớp vitest (xác định) và desktop. Các nhóm còn lại trên tablet (progress / stays0 / mix / B8) không phụ thuộc vào thời gian trả lời nên giữ nguyên.

Riêng B8 có 1 test riêng: gieo B1–B7 như trẻ chơi xong (3 khóa bảng 4 ở hộp 3), chơi 3 lượt đúng hết qua UI — B8 vẫn dưới 3 sao, "Học tiếp" vẫn chỉ B8. Test này pass trên desktop (xác nhận lỗi qua UI).

## Lớp 3 — Script chạy tay (không vào CI)

`tools/lesson-walkthrough/manual-walkthrough.spec.ts` — chạy bằng lệnh:

```
E2E_PORT=4181 npx playwright test --config playwright.manual.config.ts --project=desktop-chromium --workers=1
```
(Cấu hình `playwright.manual.config.ts` ở gốc repo chỉ đổi `testDir` sang `tools/lesson-walkthrough/`; cấu hình CI không bao giờ chạy file này.)

Đi hết 81 bài qua UI (mỗi bài 1 lượt, gieo các bài trước lên 3 sao), in bảng kết quả ra stdout. Mất khoảng 1 giờ. Bài nào "Học tiếp" không chỉ vào thì chơi trực tiếp từ hàng của bài đó và ghi chú lại. Lỗi ở bài nào thì ghi vào bảng và đi tiếp bài sau (không dừng cả script).

## Bảng 81 bài (lớp vitest, chơi trực tiếp từng bài, trả lời đúng hết)

Cột "Lượt" = số lượt 6 câu cần để đạt 3 sao; "xong sẵn" = đã 3 sao nhờ các bài trước, không cần chơi; "KẸT" = không đạt 3 sao sau 20 lượt.

| Bài | Chủ đề | Dạng | Khóa | Lượt | Câu | Sao | Kết quả | Ghi chú |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| B1 Ôn các số đến 1 000 | 1 | skills | 6 | 3 | 18 | 3★ | xong |  |
| B2 Cộng, trừ trong phạm vi 1 000 | 1 | skills | 6 | 3 | 18 | 3★ | xong |  |
| B3 Tìm thành phần trong phép cộng, trừ | 1 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B4 Bảng nhân 2, 5 và bảng chia 2, 5 | 1 | tables | 36 | 17 | 102 | 3★ | xong |  |
| B5 Bảng nhân 3, bảng chia 3 | 1 | tables | 19 | 8 | 48 | 3★ | xong |  |
| B6 Bảng nhân 4, bảng chia 4 | 1 | tables | 19 | 7 | 42 | 3★ | xong |  |
| B7 Ôn tập hình học và đo lường | 1 | mix | 4 | 2 | 12 | 3★ | xong |  |
| B8 Luyện tập chung | 1 | mix | 87 | 20 | 120 | 2★ | KẸT | stuck at 2★ after 20 runs |
| B9 Bảng nhân 6, bảng chia 6 | 2 | tables | 19 | 7 | 42 | 3★ | xong |  |
| B10 Bảng nhân 7, bảng chia 7 | 2 | tables | 19 | 6 | 36 | 3★ | xong |  |
| B11 Bảng nhân 8, bảng chia 8 | 2 | tables | 19 | 6 | 36 | 3★ | xong |  |
| B12 Bảng nhân 9, bảng chia 9 | 2 | tables | 19 | 5 | 30 | 3★ | xong |  |
| B13 Tìm thành phần trong phép nhân, chia | 2 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B14 Một phần mấy | 2 | skills | 6 | 3 | 18 | 3★ | xong |  |
| B15 Luyện tập chung | 2 | mix | 75 | 3 | 18 | 3★ | xong |  |
| B16 Điểm ở giữa, trung điểm | 3 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B17 Hình tròn, tâm, bán kính, đường kính | 3 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B18 Góc vuông, góc không vuông | 3 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B19 Các hình phẳng cơ bản | 3 | skills | 2 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B20 Thực hành vẽ hình | 3 | mix | 6 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B21 Khối lập phương, khối hộp chữ nhật | 3 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B22 Luyện tập chung | 3 | mix | 10 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B23 Nhân số hai chữ số với số một chữ số | 4 | skills | 3 | 2 | 12 | 3★ | xong |  |
| B24 Gấp một số lên một số lần | 4 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B25 Phép chia hết, phép chia có dư | 4 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B26 Chia số hai chữ số cho số một chữ số | 4 | skills | 5 | 3 | 18 | 3★ | xong |  |
| B27 Giảm một số đi một số lần | 4 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B28 Bài toán giải bằng hai bước tính | 4 | skills | 6 | 3 | 18 | 3★ | xong |  |
| B29 Luyện tập chung | 4 | mix | 18 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B30 Mi-li-mét | 5 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B31 Gam | 5 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B32 Mi-li-lít | 5 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B33 Nhiệt độ | 5 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B34 Thực hành với các đơn vị đo | 5 | mix | 8 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B35 Luyện tập chung | 5 | mix | 8 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B36 Nhân số ba chữ số với số một chữ số | 6 | skills | 3 | 2 | 12 | 3★ | xong |  |
| B37 Chia số ba chữ số cho số một chữ số | 6 | skills | 5 | 3 | 18 | 3★ | xong |  |
| B38 Biểu thức số | 6 | skills | 5 | 3 | 18 | 3★ | xong |  |
| B39 Số lớn gấp mấy lần số bé | 6 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B40 Luyện tập chung | 6 | mix | 15 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B41 Ôn tập nhân, chia phạm vi 100, 1 000 | 7 | mix | 138 | 3 | 18 | 3★ | xong |  |
| B42 Ôn tập biểu thức số | 7 | mix | 5 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B43 Ôn tập hình học và đo lường | 7 | mix | 18 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B44 Ôn tập chung | 7 | mix | 189 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B45 Các số có bốn chữ số, số 10 000 | 8 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B46 So sánh các số trong phạm vi 10 000 | 8 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B47 Số La Mã | 8 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B48 Làm tròn số đến hàng chục, hàng trăm | 8 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B49 Luyện tập chung | 8 | mix | 10 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B50 Chu vi các hình phẳng | 9 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B51 Diện tích, xăng-ti-mét vuông | 9 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B52 Diện tích hình chữ nhật, hình vuông | 9 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B53 Luyện tập chung | 9 | mix | 8 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B54 Phép cộng trong phạm vi 10 000 | 10 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B55 Phép trừ trong phạm vi 10 000 | 10 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B56 Nhân số bốn chữ số với số một chữ số | 10 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B57 Chia số bốn chữ số cho số một chữ số | 10 | skills | 5 | 3 | 18 | 3★ | xong |  |
| B58 Luyện tập chung | 10 | mix | 12 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B59 Các số có năm chữ số, số 100 000 | 11 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B60 So sánh các số trong phạm vi 100 000 | 11 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B61 Làm tròn đến hàng nghìn, chục nghìn | 11 | skills | 3 | 2 | 12 | 3★ | xong |  |
| B62 Luyện tập chung | 11 | mix | 7 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B63 Phép cộng trong phạm vi 100 000 | 12 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B64 Phép trừ trong phạm vi 100 000 | 12 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B65 Luyện tập chung | 12 | mix | 5 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B66 Xem đồng hồ, tháng – năm | 13 | skills | 9 | 5 | 30 | 3★ | xong |  |
| B67 Thực hành xem đồng hồ, xem lịch | 13 | mix | 9 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B68 Tiền Việt Nam | 13 | skills | 6 | 3 | 18 | 3★ | xong |  |
| B69 Luyện tập chung | 13 | mix | 15 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B70 Nhân số năm chữ số với số một chữ số | 14 | skills | 3 | 2 | 12 | 3★ | xong |  |
| B71 Chia số năm chữ số cho số một chữ số | 14 | skills | 4 | 2 | 12 | 3★ | xong |  |
| B72 Luyện tập chung | 14 | mix | 5 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B73 Thu thập số liệu, bảng số liệu | 15 | skills | 5 | 3 | 18 | 3★ | xong |  |
| B74 Khả năng xảy ra của một sự kiện | 15 | skills | 2 | 1 | 6 | 3★ | xong |  |
| B75 Thực hành thu thập, đọc bảng số liệu | 15 | mix | 7 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B76 Ôn tập các số đến 100 000 | 16 | mix | 17 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B77 Ôn tập cộng, trừ trong phạm vi 100 000 | 16 | mix | 8 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B78 Ôn tập nhân, chia trong phạm vi 100 000 | 16 | mix | 10 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B79 Ôn tập hình học và đo lường | 16 | mix | 26 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B80 Ôn tập bảng số liệu, khả năng xảy ra | 16 | mix | 7 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |
| B81 Ôn tập chung | 16 | mix | 83 | 0 | 0 | 3★ | xong sẵn | already 3 stars from earlier lessons |

## File thay đổi (PR này, test-only — không sửa code chạy)

- `src/learning/lesson-walkthrough.ts` — harness chơi hoàn hảo (mới).
- `src/learning/lesson-walkthrough.test.ts` — test vitest 81 bài (mới; 1 test `it.fails` ghi lại lỗi B8).
- `tests/e2e/lesson-walkthrough.spec.ts` — mẫu e2e 40 bài + test riêng B8 (mới).
- `tests/e2e/lesson-walkthrough-helpers.ts` — solver + gieo tiến độ dùng chung cho spec và script tay (mới).
- `tools/lesson-walkthrough/manual-walkthrough.spec.ts` — script chạy tay 81 bài, không vào CI (mới).
- `playwright.manual.config.ts` — cấu hình riêng để chạy script tay (mới; CI không dùng).
- Báo cáo này (mới).

Không sửa `.github/workflows`, không đổi RNG/golden, không thêm thư viện.

## Gates (sau rebase lên main 8e7a564)

- `npm run lint` → exit 0 (9 warning CSS có sẵn).
- `npm run typecheck` → exit 0.
- `npm test` → 1317 passed + 1 expected fail / 1318 (190 files).
- `npm run build` → exit 0.
- `node tools/recovery/golden/generate-golden-traces.mjs --check` → byte-identical.
- E2E local: xem mục Lớp 2. CI sẽ chạy đủ 4 projects.

## Câu hỏi cho người duyệt (về lỗi B8)

Sửa bộ chia lượt chơi cho bài mix như thế nào? Các hướng có thể (chưa chọn — cần người duyệt quyết vì đây là thay đổi hành vi luyện tập, đụng file chung `src/learning/lesson-planner.ts`):

1. **Lấy 6 khóa yếu nhất toàn cục** thay vì 1 khóa mỗi nhóm nguồn (bỏ dàn theo nhóm ở lượt chơi, giữ dàn theo nhóm chỉ để hiển thị/xáo trộn).
2. **Xoay thứ tự nhóm mỗi lượt** để nhóm nào cũng có lúc nằm trong 6 nhóm đầu.
3. **Cho bài mix cần 70% khóa đạt hộp 4** như bài bảng, thay vì 100%.
4. **Tăng số câu mỗi lượt cho bài mix** (ví dụ 8 câu thay vì 6) để đủ phủ các nhóm.

Hướng 1 là trực tiếp nhất với lỗi đã đo: 3 khóa yếu nhất của B8 đều nằm ở nhóm B6, và lượt chơi yếu-nhất-trước sẽ chọn đúng chúng ngay lượt đầu. Dù chọn hướng nào, test `it.fails` trong PR này sẽ bắt đầu pass và nhắc bỏ `.fails`.

## Ghi chú

- 9 bài R8 (B3, B13, B16, B24, B27, B31, B32, B33, B51) sau khi gộp PR #69 đều có 2 kỹ năng (trước là 1), vẫn xong 3 sao trong 1 lượt chơi đúng hết — cả vitest và e2e đều đã chạy lại trên main mới `8e7a564`.
- Bộ test e2e giải bài bằng bấm/chạm thật nhưng KHÔNG bấm gợi ý: một lần bấm gợi ý sẽ đánh dấu lần trả lời đó là `usedHint` và chặn tăng hộp Leitner, nên bài 1–2 kỹ năng sẽ không lên 3 sao sau 1 lượt (đã gặp một lần khi viết test, xem lịch sử PR).
