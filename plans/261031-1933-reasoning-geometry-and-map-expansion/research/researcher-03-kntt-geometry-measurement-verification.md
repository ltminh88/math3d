# Research 03: KNTT Toán 3 — verification of geometry + measurement lessons (phase 02)

Date 2026-11-01. Method: lesson pages on vietjack.com (`toan-3-kn/…`) and the loigiaihay table of contents.
Legend: [V] read on a solution page that follows the SGK exercise by exercise; [P] partly verified
(solution page has no theory box, rule read from the worked solutions); [U] unconfirmed.

## Lesson titles (loigiaihay TOC) [V]
B16 Điểm ở giữa, trung điểm của đoạn thẳng · B17 Hình tròn. Tâm, bán kính, đường kính của hình tròn ·
B18 Góc, góc vuông, góc không vuông · B19 Hình tam giác, hình tứ giác. Hình chữ nhật, hình vuông ·
B20 Thực hành vẽ góc vuông, vẽ đường tròn, hình vuông, hình chữ nhật và vẽ trang trí (title from the
vietjack VBT index + quiz page; [P]) · B21 Khối lập phương, khối hộp chữ nhật · B30 Mi-li-mét · B31 Gam ·
B32 Mi-li-lít · B33 Nhiệt độ. Đơn vị đo nhiệt độ · B50 Chu vi hình tam giác, hình tứ giác, hình chữ
nhật, hình vuông · B51 Diện tích của một hình. Xăng-ti-mét vuông · B52 Diện tích hình chữ nhật, diện
tích hình vuông.

## Per lesson
| Bài | What the book does (numbers seen) | Game use |
|---|---|---|
| B16 [V] | "M là điểm ở giữa hai điểm A và B", trung điểm = ở giữa + MA = MB (MA = MB = 3 cm); Đúng/Sai "N là trung điểm của BC" (Sai, NB ≠ NC); dây 20 cm gấp đôi → 2 đoạn 10 cm | AM from AB, AB from AM, Đúng/Sai with fix; even lengths 2–20 |
| B17 [V] | Defines tâm, bán kính (tâm → điểm trên đường tròn), đường kính (qua tâm, nối 2 điểm trên đường tròn); compa. No written "đường kính = 2 × bán kính", but Luyện tập 2 adds two radii (7 + 7 = 14 cm, path 42 cm) | name segments; D = R + R; row of equal circles |
| B18 [V] | "Dùng ê-ke, hãy tìm góc vuông, góc không vuông"; "hình nào có nhiều góc vuông nhất?" (1, 4, 3, 0) | pick right angle (rotated at tier 2+), count right angles, most right angles |
| B19 [V] | "Hình vuông là hình có 4 góc vuông và 4 cạnh có độ dài bằng nhau"; "Hình chữ nhật có 4 góc vuông, 2 cạnh dài … bằng nhau và 2 cạnh ngắn … bằng nhau". Square EGHI is NOT counted among the rectangles ("có 2 hình chữ nhật là MNPQ và RTXY"). Counting triangles/tứ giác in a composite figure | classify; count shapes in a split figure |
| B21 [P] | 8 đỉnh, 6 mặt, 12 cạnh for both solids (vietjack quiz); "mỗi đỉnh 3 bông hoa" → 3 × 8 = 24 | identify solid from dimensions; parts; parts × n |
| B30 [V] | 1 cm = 10 mm, 1 m = 1000 mm; 6 cm = 60 mm; ant 3 cm vs ve sầu 3 mm; 25 mm + 3 mm, 11 mm × 3 | cm ↔ mm (≤ 10 cm), compare cm vs mm, difference in mm |
| B31 [V] | Balance with weights (100 g + 50 g, 20 g + 20 g); 500 g − 250 g; 15 g × 4 = 60 g; 1 kg = 1000 g only implied | read a balance ≤ 100 g, compare, share weight (no kg ↔ g) |
| B32 [V] | 1 l = 1000 ml; jug with marks (500 : 5 = 100 ml a mark); 12 ml × 3; 750 − 350 | jug with marks ≤ 100 ml, pour into cups (no l ↔ ml) |
| B33 [V] | °C; read the scale (30°C, 37°C body); compare 30 > 26 > 10; lowest/highest of 27, 36, 15; 38/39 above normal 37 | read, compare, difference, 0–100 |
| B50 [V] | Triangle 7 + 10 + 14; HCN (dài + rộng) × 2: 6 × 4, (8 + 2) × 2, (15 + 10) × 2; square cạnh × 4 (3 × 4); fence 9 m × 5 m minus 2 m cổng = 26 m; "đổi về cùng một đơn vị" | polygon, rect, square, fence with gate |
| B51 [V] | Area by counting 1 cm² squares (4, 9 ô); compare areas by counting (29 vs 28; 4 = 4); cm² arithmetic 15 cm² × 4 | count ≤ 20 cells, compare, difference |
| B52 [V] | dài × rộng (6 × 3 = 18, 15 × 5 = 75), cạnh × cạnh (8 × 8 = 64, 7 × 7 = 49); cut a 3 cm square from an 8 cm cake → 64 − 9 = 55; square card = 2 × (3 × 6) = 36 | rect/square area ≤ 100, cut-corner, double-area square |

## Decisions
- **Hình vuông vs hình chữ nhật (decision 7): KNTT does not call a square a rectangle** (B19 Bài 1 lists
  the square separately and does not count it among the rectangles). Generators therefore never put a
  square in a "chọn hình chữ nhật" option set, never put a rectangle/square in a "chọn hình tứ giác"
  set, and never put a cube in a "chọn khối hộp chữ nhật" set — every option is unambiguous.
- "Đường kính gấp 2 lần bán kính" is not written in B17; items say "đường kính gồm 2 bán kính" (the
  book's 7 + 7 = 14) and ask D = R + R / R = D : 2.
- Terms used: điểm ở giữa, trung điểm, tâm, bán kính, đường kính, góc vuông, góc không vuông, ê-ke,
  hình tam giác, hình tứ giác, hình chữ nhật, hình vuông, khối lập phương, khối hộp chữ nhật, mặt,
  cạnh, đỉnh, mi-li-mét (mm), gam (g), mi-li-lít (ml), độ C (°C), chu vi, diện tích, xăng-ti-mét vuông (cm²).

## Locked ranges (author cap: every number ≤ 100)
Sides 1–20 cm, perimeters ≤ 80 (rect: dài + rộng ≤ 30), midpoint segments even 2–20, radius 1–16
(row of 3 circles ≤ 96), angle choices 45/60/120/135 (+ 75/105 at tier 3) vs 90, rotation 20–70°,
solids ≤ 9 per edge, ruler 0–10 cm (≤ 100 mm), weights 1/2/5/10/20/50 g with sum ≤ 100, jug 100 ml,
°C 0–100, area count ≤ 20 cells, rect/square area ≤ 100 (sides ≤ 10). See
`src/geometry/geometry-ranges.ts`, `src/measurement/measurement-ranges.ts`.

## Still unconfirmed
- B20 exact title wording [P] (not used by any generator).
- B21: SGK text of "6 mặt, 12 cạnh, 8 đỉnh" read only via the vietjack quiz [P].
- B17/B52/B50: rules read from worked solutions, not from the theory box [P].

## Sources
- https://loigiaihay.com/sgk-toan-3-ket-noi-tri-thuc-c813.html
- https://vietjack.com/toan-3-kn/bai-16-diem-o-giua-trung-diem-cua-doan-thang.jsp
- https://vietjack.com/toan-3-kn/bai-17-hinh-tron-tam-ban-kinh-duong-kinh-cua-hinh-tron.jsp
- https://vietjack.com/toan-3-kn/bai-18-goc-goc-vuong-goc-khong-vuong.jsp
- https://vietjack.com/toan-3-kn/bai-19-hinh-tam-giac-hinh-tu-giac-hinh-chu-nhat-hinh-vuong.jsp
- https://vietjack.com/toan-3-kn/trac-nghiem-bai-20-thuc-hanh-ve-goc-vuong-ve-duong-tron.jsp
- https://vietjack.com/toan-3-kn/trac-nghiem-bai-21-khoi-lap-phuong-khoi-hop-hinh-chu-nhat.jsp
- https://vietjack.com/toan-3-kn/bai-30-mi-li-met.jsp · bai-31-gam.jsp · bai-32-mi-li-lit.jsp · bai-33-nhiet-do-don-vi-do-nhiet-do.jsp
- https://vietjack.com/toan-3-kn/bai-50-chu-vi-hinh-tam-giac-hinh-tu-giac-hinh-chu-nhat-hinh-vuong.jsp
- https://vietjack.com/toan-3-kn/bai-51-dien-tich-cua-mot-hinh-xang-ti-met-vuong.jsp
- https://vietjack.com/toan-3-kn/bai-52-dien-tich-hinh-chu-nhat-dien-tich-hinh-vuong.jsp
