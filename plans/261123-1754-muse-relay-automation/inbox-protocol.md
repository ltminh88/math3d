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
5. **Vòng lặp không bao giờ tự tắt**: mọi lượt — kể cả ngay sau khi gửi `REPORT` hay khi việc đã xong — đều kết thúc bằng một lệnh `sleep` chạy nền (300 s khi chờ CI, 600 s khi rảnh). Không có lệnh ngủ nền thì không gì đánh thức Muse được nữa. Chỉ dừng khi nhận `STOP` hoặc hạn mức ≥ 99%.
6. Kẹt sau 2 lần thử → gửi `BLOCKED` (đã thử gì, lỗi gì), không thử lần 3 theo cùng cách.
7. Không deploy `--prod`. Chỉ deploy preview.
8. Không sửa `.github/workflows`, không chụp lại parity: việc của reviewer.

## Bảo mật (repo PUBLIC)

- Không dán token, mật khẩu, khoá, nội dung file `.env*`, thông tin cá nhân.
- Không chép bài tập, số liệu, chữ trong SGK vào comment.
- Không gắn `@tên` thật; dùng tag văn bản như trên.
