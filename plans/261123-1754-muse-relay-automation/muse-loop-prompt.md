# Lệnh lặp cho Muse (anh dán vào tab Muse, thay {MUSE} và {INBOX})

> Chỉ dán khi Muse đang **không** làm dở việc.

```
Từ giờ em không cần anh chép tin nữa. Em nói chuyện với reviewer qua hộp thư GitHub:
issue #{INBOX} trên ltminh88/math3d (Hộp thư {MUSE}). Đọc kỹ thân issue (giao thức) trước.

Vòng lặp của em:
1. Đang code → cứ làm. Đọc hộp thư ở điểm dừng (vừa push, mở PR, CI bắt đầu/xong, kẹt) VÀ mỗi lần
   em kiểm CI hay kiểm tiến trình tác nhân con — đang chờ cũng là điểm dừng.
2. Ở điểm dừng: đọc mọi comment mới trong #{INBOX} kể từ tin cuối em đã xử lý
   (gh issue view {INBOX} --repo ltminh88/math3d --comments), ACK các TASK/QUESTION/HANDOFF, làm theo.
3. Gửi REPORT ở mỗi điểm dừng quan trọng (gh issue comment {INBOX} --repo ltminh88/math3d --body-file ...),
   dòng đầu đúng định dạng: [{MUSE}→reviewer] LOẠI M<số> (mã tin không có dấu #; tin của reviewer mã R<số>).
4. Không có việc → chạy nền `sleep 600` rồi kiểm lại. Đang chờ CI → `sleep 300` rồi kiểm CI và hộp thư.
5. LUÔN kết thúc mỗi lượt bằng một lệnh sleep chạy nền — kể cả ngay sau REPORT hay khi việc đã xong.
   Quên bật thì vòng lặp chết, không ai đánh thức em được.
   Chờ reviewer gộp PR hay trả lời KHÔNG phải là xong việc — vẫn phải ngủ nền.
6. Dừng vòng lặp khi: nhận STOP, hoặc hạn mức ≥ 99% (sau khi đã HANDOFF + "Bàn giao" trên #11).

Giữ nguyên mọi quy tắc cũ: không deploy --prod, không sửa .github/workflows, không chụp parity,
không chép nội dung SGK, repo public nên không dán bí mật. Nếu anh nhắn trực tiếp trong tab này,
tin của anh ưu tiên hơn hộp thư.

Bắt đầu: đọc #{INBOX}, gửi một REPORT ngắn (đang làm gì, hạn mức %), rồi vào vòng lặp.
```
