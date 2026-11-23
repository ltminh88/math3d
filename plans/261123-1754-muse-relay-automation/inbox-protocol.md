# Hộp thư {MUSE}

Issue này là kênh nói chuyện giữa **reviewer** và **{MUSE}**, thay cho việc anh chủ dự án chép tay giữa các tab.
Bảng điều phối chung vẫn là issue #11 (trạng thái phase, chỗ CI, bàn giao hạn mức).

## Định dạng tin

Dòng đầu mỗi comment:

```
[người gửi→người nhận] LOẠI #số
```

- Người gửi/nhận: `reviewer`, `muse-88`, `muse-min`.
- `#số`: số thứ tự tăng dần **của người gửi** trong hộp thư này (reviewer đếm riêng, Muse đếm riêng).
- LOẠI:

| LOẠI | Dùng khi |
|---|---|
| `TASK` | reviewer giao việc |
| `ACK` | bên nhận xác nhận đã đọc `TASK`/`QUESTION`/`HANDOFF`, ghi `ACK #số-của-tin-đó` |
| `REPORT` | Muse báo tiến độ ở một điểm dừng |
| `QUESTION` | hỏi bên kia, đang chờ trả lời |
| `ANSWER` | trả lời `QUESTION #số` |
| `HANDOFF` | bàn giao việc (hạn mức ≥ 99% hoặc đổi người) |
| `BLOCKED` | kẹt, cần reviewer quyết |
| `STOP` | reviewer yêu cầu dừng vòng lặp |

Ví dụ:

```
[reviewer→muse-min] TASK #3
Phase 22: ... (nhánh, file sở hữu, tiêu chí xong)
```

```
[muse-min→reviewer] REPORT #7
PR #63 head abc1234 (sha đủ 40 ký tự ở dòng dưới), CI run 4514..., trạng thái: đang chạy / xanh / đỏ (lý do)
Hạn mức: 41%
```

## Quy tắc

1. Chỉ đọc hộp thư ở **điểm dừng**: vừa push, vừa mở PR, CI vừa bắt đầu/xong, đang chờ, hoặc kẹt. Không bỏ dở việc giữa chừng để đọc thư.
2. Đọc mọi comment mới hơn tin cuối mình đã xử lý; `ACK` mỗi `TASK`/`QUESTION`/`HANDOFF` ngay ở điểm dừng gần nhất.
3. `REPORT` giữ đủ những gì trước đây gửi cho anh chủ dự án: PR, **head sha đầy đủ**, CI run id + kết quả, gates đã chạy, hạn mức %.
4. Quy tắc hạn mức như cũ: từ 90% push sau mỗi commit; tới 99% commit + push WIP, ghi "Bàn giao" trên #11, gửi `HANDOFF` ở đây rồi dừng.
5. Kẹt sau 2 lần thử → gửi `BLOCKED` (đã thử gì, lỗi gì), không thử lần 3 theo cùng cách.
6. Không deploy `--prod`. Chỉ deploy preview.
7. Không sửa `.github/workflows`, không chụp lại parity: việc của reviewer.

## Bảo mật (repo PUBLIC)

- Không dán token, mật khẩu, khoá, nội dung file `.env*`, thông tin cá nhân.
- Không chép bài tập, số liệu, chữ trong SGK vào comment.
- Không gắn `@tên` thật; dùng tag văn bản như trên.
