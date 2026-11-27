# Hộp thư {MUSE}

Issue này là kênh nói chuyện giữa **reviewer** và **{MUSE}**, thay cho việc anh chủ dự án chép tay giữa các tab.
Bảng điều phối chung vẫn là issue #11 (trạng thái phase, chỗ CI, bàn giao hạn mức).

## Định dạng tin

Dòng đầu mỗi comment:

```
[người gửi→người nhận] LOẠI Mã
```

- Người gửi/nhận: `reviewer`, `muse-88`, `muse-min`.
- **Mã tin** = chữ cái của người gửi + số tăng dần trong hộp thư này: reviewer dùng `R1, R2, …`, Muse dùng `M1, M2, …`. **Không dùng dấu `#`** cho mã tin — trên GitHub `#2` tự thành đường dẫn tới issue/PR số 2. Dấu `#` chỉ dùng khi thật sự nói về issue/PR (vd "PR #65").
- Mọi tin đều có mã, để bên kia nhắc lại được.
- LOẠI:

| LOẠI | Dùng khi |
|---|---|
| `TASK` | reviewer giao việc |
| `ACK` | bên nhận xác nhận đã đọc `TASK`/`QUESTION`/`HANDOFF`/`PING`; dòng 2 ghi `đã đọc R5` (mã tin được ACK) |
| `REPORT` | Muse báo tiến độ ở một điểm dừng |
| `QUESTION` | hỏi bên kia, đang chờ trả lời |
| `ANSWER` | trả lời một `QUESTION` (ghi mã tin hỏi) |
| `HANDOFF` | bàn giao việc (hạn mức ≥ 99% hoặc đổi người) |
| `BLOCKED` | kẹt, cần reviewer quyết |
| `WAITING` | Muse đang chờ anh chủ dự án trả lời trong tab (câu hỏi, nút chọn, xin duyệt); dòng 2 chép nguyên câu hỏi và các lựa chọn |
| `PING` | reviewer nhắc một tin chưa được ACK (không phải việc mới) |
| `STOP` | reviewer yêu cầu dừng vòng lặp |

Ví dụ:

```
[reviewer→muse-min] TASK R3
Phase 22: ... (nhánh, file sở hữu, tiêu chí xong)
```

```
[muse-min→reviewer] ACK M6
đã đọc R3
```

```
[muse-min→reviewer] REPORT M7
PR #70 head abc1234 (sha đủ 40 ký tự ở dòng dưới), CI run 4514..., trạng thái: đang chạy / xanh / đỏ (lý do)
Hạn mức: 41%
```

## Quy tắc

1. Đọc hộp thư ở **điểm dừng**: vừa push, vừa mở PR, CI vừa bắt đầu/xong, kẹt — **và mỗi lần kiểm CI hay kiểm tiến trình tác nhân con** (đang chờ cũng là điểm dừng). Không bỏ dở việc đang code giữa chừng để đọc thư.
2. Đọc mọi comment mới hơn tin cuối mình đã xử lý; `ACK` mỗi `TASK`/`QUESTION`/`HANDOFF` ngay ở điểm dừng gần nhất.
3. `REPORT` giữ đủ những gì trước đây gửi cho anh chủ dự án: PR, **head sha đầy đủ**, CI run id + kết quả, gates đã chạy, hạn mức %.
4. Quy tắc hạn mức như cũ: từ 90% push sau mỗi commit; tới 99% commit + push WIP, ghi "Bàn giao" trên #11, gửi `HANDOFF` ở đây rồi dừng.
   **Mỗi `REPORT` ghi hạn mức ĐỌC LẠI THẬT ngay lúc gửi, kèm giờ đọc** (vd `Hạn mức: 93% (đọc 16:20)`) — không chép số của báo cáo trước. Từ 90% không nhận việc song song (rule 11), chỉ làm nốt việc đang dở. Nếu hạn mức hết trước giờ reset: push WIP, rồi chạy **một** lệnh `sleep` nền tới vài phút sau giờ reset (không làm gì khác) để tự chạy lại.
5. **Vòng lặp không bao giờ tự tắt**: mọi lượt — kể cả ngay sau khi gửi `REPORT` hay khi việc đã xong — đều kết thúc bằng một lệnh `sleep` chạy nền (300 s khi chờ CI, 600 s khi rảnh). Không có lệnh ngủ nền thì không gì đánh thức Muse được nữa. **Chờ reviewer gộp PR hay trả lời KHÔNG phải là xong việc** — vẫn phải ngủ nền rồi đọc hộp thư. Chỉ dừng khi nhận `STOP` hoặc hạn mức ≥ 99%.
6. Kẹt sau 2 lần thử → gửi `BLOCKED` (đã thử gì, lỗi gì), không thử lần 3 theo cùng cách.
7. Không deploy `--prod`. Chỉ deploy preview.
8. Không sửa `.github/workflows`, không chụp lại parity: việc của reviewer.
9. **`TASK` của reviewer là đã được duyệt**: ACK rồi bắt tay làm ngay, không hỏi lại anh chủ dự án "có bắt đầu không".
10. **Mỗi khi phải dừng chờ anh chủ dự án** (hỏi trong tab, hiện nút chọn, xin duyệt kế hoạch, xin quyền chạy lệnh): TRƯỚC khi dừng, gửi `WAITING` vào hộp thư này, chép nguyên câu hỏi và các lựa chọn, ghi rõ lựa chọn em đề xuất. Reviewer sẽ báo anh qua Telegram. Vẫn bật `sleep` nền như rule 5.
11. **Không ngồi chờ CI.** PR vừa push và CI đang chạy → làm luôn việc tiếp theo trong một **worktree mới** (không đụng worktree của PR đang chờ):
    - Phase kế tiếp trong lane của mình **không** cần PR đang chờ → nhánh từ main mới nhất.
    - Phase kế tiếp **cần** PR đang chờ → nhánh chồng lên nhánh của PR đó; khi PR đó merge thì rebase lên main trước khi mở PR mới.
    - Chưa có phase nào làm được → việc nhỏ: nit reviewer đã ghi, test còn thiếu, docs. Ghi vào `REPORT`.
    - **Ưu tiên:** CI đỏ / `CHANGES` / `QUESTION` của PR đang chờ luôn trước việc mới. Commit WIP việc mới, sửa PR cũ, push, rồi mới quay lại.
    - **Mỗi Muse giữ 1 chỗ CI:** không mở PR thứ hai khi PR đầu chưa xong CI và chưa merge. Việc mới cứ commit; push nhánh thường không chạy CI (CI chỉ chạy cho PR và main), nên từ 90% hạn mức vẫn push nhánh WIP được, chỉ chưa mở PR.
    - Chỉ làm phase reviewer đã giao trong `TASK` hoặc phase kế tiếp trong lane của mình trên plan; không lấy phase của Muse kia.
    - Vẫn kiểm CI + hộp thư theo rule 1 và 5: giữa các đoạn code, mỗi ~10 phút ghé một lần.

## Bảo mật (repo PUBLIC)

- Không dán token, mật khẩu, khoá, nội dung file `.env*`, thông tin cá nhân.
- Không chép bài tập, số liệu, chữ trong SGK vào comment.
- Không gắn `@tên` thật; dùng tag văn bản như trên.
