# Rà soát câu chữ tự nhiên (trước → sau)

Branch `fix/ch2-natural-wording`. Mục tiêu: câu ngắn, một ý, trẻ 7–9 tuổi đọc một lần là hiểu.
Giữ nguyên số liệu, `{param}`, thuật ngữ KNTT ("gấp mấy lần", "giảm đi … lần", "số dư", "trung
điểm", "bán kính", "chu vi", "diện tích"...). Ví dụ dùng số thật để dễ hình dung.

Thay đổi chung: câu hỏi từng bước giờ nêu rõ đồ vật ("bao nhiêu viên bi?" thay vì "bao nhiêu?");
bước đầu mở bằng "Trước hết, …", bước kết luận mở bằng "Vậy …" hoặc "Hỏi …" (giọng sách KNTT).

## 1. Cầu (bài toán có lời văn trong quiz, cả chế độ luyện tập)

| Khoá | Trước | Sau |
|---|---|---|
| addStory | Đội Mai chở được 6 viên đá. Đội Nam chở được gấp 3 lần đội Mai. | Đội Mai chở được 6 viên đá. Đội Nam chở được **nhiều gấp** 3 lần đội Mai. |
| addAsk | Cả hai đội chở được bao nhiêu viên đá? | **Hỏi** cả hai đội chở được bao nhiêu viên đá? |
| cmpStory | Bờ bên này có 24 viên đá, bờ bên kia có 6 viên đá. | Bờ bên này có 24 viên đá. Bờ bên kia có 6 viên đá. |
| cmpAsk | Số đá bờ bên này gấp mấy lần bờ bên kia? | Số đá **ở** bờ bên này gấp mấy lần bờ bên kia? |
| addHint1 | Đọc lại đề nhé: tìm số đá của đội Nam trước, rồi mới tính cả hai đội. | Đọc lại đề nhé. Trước hết, đội Nam chở được bao nhiêu viên? Sau đó mới tính cả hai đội. |
| addHint2 | Sơ đồ đoạn thẳng: đội Mai là 1 đoạn 6 viên, đội Nam là 3 đoạn như thế. | Vẽ sơ đồ đoạn thẳng: đội Mai là 1 đoạn 6 viên. Đội Nam có 3 đoạn như thế. |
| addHint3 | Đội Nam: 6 × 3 = ?. Cả hai đội: lấy số đó cộng thêm 6. | Đội Nam chở: 6 × 3 = ? Cả hai đội: lấy số vừa tìm cộng thêm 6. |
| cmpHint1 | … thì mình làm phép chia, không phải phép trừ nhé! | … thì mình làm phép chia, không làm phép trừ nhé! |
| cmpHint2 | Sơ đồ đoạn thẳng: đặt mấy đoạn 6 viên nối nhau thì dài bằng đoạn 24 viên? | Vẽ sơ đồ đoạn thẳng: nối mấy đoạn 6 viên thì dài bằng đoạn 24 viên? |
| cmpHint3 | Bờ bên này gấp mấy lần bờ bên kia: 24 : 6 = ? | Lấy số lớn chia cho số bé: 24 : 6 = ? |

## 2. Thử thách suy luận (Cánh Đồng, Rừng, Thành Phố, Tháp, Hang, Vườn) — đề bài

| Khoá | Trước | Sau |
|---|---|---|
| wpTimesThenAdd | Mai có 6 viên bi. Số viên bi của Nam gấp 3 lần số viên bi của Mai. | Mai có 6 viên bi. Nam có **nhiều gấp 3 lần** Mai. |
| wpDivideThenAdd | Mai có 24 cái kẹo. Số cái kẹo của Nam bằng số cái kẹo của Mai giảm đi 3 lần. | Mai có 24 cái kẹo. Lấy số cái kẹo của Mai giảm đi 3 lần thì được số cái kẹo của Nam. |
| wpUnitThenTimes | 4 hộp như nhau có tất cả 24 quả táo. | Có 4 hộp như nhau, đựng tất cả 24 quả táo. |
| wpTimesCompare / wpDifferenceCompare | Rổ to có 24 bông hoa, rổ nhỏ có 6 bông hoa. | Rổ to có 24 bông hoa. Rổ nhỏ có 6 bông hoa. |
| divRemFloor | Có 29 cái kẹo, xếp đều vào các hộp, mỗi hộp 4 cái kẹo. | Có 29 cái kẹo. Mình xếp vào các hộp, mỗi hộp 4 cái kẹo. |
| divRemCeil | Có 30 bạn đi tham quan, mỗi xe chở được 7 bạn. | Có 30 bạn đi tham quan. Mỗi xe chở được 7 bạn. |
| unknownEq | Tìm số thích hợp thay cho dấu ?: ? × 7 = 56 | Dấu ? là số nào? ? × 7 = 56 |
| patternNext | Tìm quy luật rồi điền số: 5, 10, ?, 20 | Các số xếp theo một quy luật. Tìm số còn thiếu nhé: 5, 10, ?, 20 |
| exprStoryShare | Lớp 3A có 12 quyển sách, lớp 3B có 18 quyển sách. Chia đều tất cả cho 3 tổ. | … Gộp lại rồi chia đều cho 3 tổ. |

Không đổi (đã tự nhiên): wpMoreThenTotal, wpLessThenTotal, exprValue, exprStoryEat, chooseAll, tfExplain.

## 3. Thử thách suy luận — câu hỏi từng bước, lựa chọn, câu nhận định

| Khoá | Trước | Sau |
|---|---|---|
| askOther | Nam có bao nhiêu? | Trước hết, Nam có bao nhiêu viên bi? |
| askBoth | Cả hai bạn có tất cả bao nhiêu? | Hỏi cả hai bạn có tất cả bao nhiêu viên bi? |
| pickExpr | Phép tính nào giải được bài này? | Bài này giải bằng phép tính nào? |
| askUnit | Mỗi hộp có bao nhiêu? | Trước hết, mỗi hộp có mấy quả táo? |
| askTotal | 7 hộp như thế có bao nhiêu? | Vậy 7 hộp như thế có bao nhiêu quả táo? |
| askTimes | Rổ to gấp mấy lần rổ nhỏ? | Số bông hoa ở rổ to gấp mấy lần rổ nhỏ? |
| askMore | Rổ to nhiều hơn rổ nhỏ bao nhiêu? | Rổ to có nhiều hơn rổ nhỏ bao nhiêu bông hoa? |
| askBoxes | Xếp được nhiều nhất mấy hộp? | Xếp được nhiều nhất mấy hộp đầy? |
| askLeft | Còn thừa bao nhiêu? | Còn thừa mấy cái kẹo? |
| askLeftCheck | Còn thừa bao nhiêu? (Số dư phải bé hơn 4.) | Còn thừa mấy cái kẹo? Nhớ nhé: số dư phải bé hơn 4. |
| pickBoxesLeft | Chọn kết quả đúng: | Kết quả nào đúng? |
| qr (lựa chọn) | 7 hộp, thừa 1 | 7 hộp, còn thừa 1 |
| askFull | Có thể xếp đầy mấy xe? | Trước hết, có mấy xe chở đủ 7 bạn? |
| askUnknown | Số cần tìm là: | Số còn thiếu là mấy? |
| askPart | Tính trước: 4 × 6 = ? | Trước hết, 4 × 6 bằng bao nhiêu? |
| askTerm | Số thứ 3 là: | Số thứ 3 là số nào? |
| askValue | Giá trị của biểu thức là: | Biểu thức có giá trị bằng bao nhiêu? |
| askLeftOver | Còn lại bao nhiêu? | Cả nhà còn lại bao nhiêu quả táo? |
| askEach | Mỗi tổ được bao nhiêu? | Mỗi tổ được bao nhiêu quyển sách? |
| pickAllTrue | Chọn tất cả các câu đúng rồi bấm Xong. | Chạm vào mọi câu đúng, rồi bấm Xong. |
| isItTrue | Câu này đúng hay sai? | Bạn Nam nói đúng hay sai? |
| fixRem | Số dư đúng của 29 : 4 là: | Vậy 29 : 4 thì dư mấy? |
| fixEq | Giá trị đúng của 6 + 4 × 2 là: | Vậy 6 + 4 × 2 bằng bao nhiêu? |
| fixTimes | 24 gấp 6 mấy lần? | Vậy 24 gấp mấy lần 6? |
| fixMore | 24 hơn 6 bao nhiêu? | Vậy 24 nhiều hơn 6 bao nhiêu? |
| stmtMore | 24 hơn 6 là 18 | 24 nhiều hơn 6 là 18 |

## 4. Gợi ý thử thách suy luận ở các màn cũ (reasoning round)

| Khoá | Trước | Sau |
|---|---|---|
| encourage | Bình tĩnh đọc lại đề nhé: bài cho biết gì, bài hỏi gì? | Đọc lại đề thật chậm nhé. Bài cho biết gì? Bài hỏi gì? |
| lookWp | Vẽ sơ đồ đoạn thẳng: mỗi bạn (mỗi rổ) là một đoạn, “gấp mấy lần” là mấy đoạn bằng nhau. | Vẽ sơ đồ đoạn thẳng nhé. Mỗi bạn (hay mỗi rổ) là một đoạn. Gấp mấy lần thì vẽ bấy nhiêu đoạn bằng nhau. |
| planTimesAdd | Tìm phần của bạn thứ hai trước (phép nhân), rồi cộng với phần của bạn thứ nhất. | Tìm số của bạn thứ hai trước, bằng phép nhân. Sau đó cộng thêm số của bạn thứ nhất. |
| planTimesCompare | “Gấp mấy lần” thì lấy số lớn chia cho số bé, không phải trừ. | Hỏi “gấp mấy lần” thì lấy số lớn chia cho số bé, không làm phép trừ. |
| lookPattern | Xem mỗi số hơn số đứng trước bao nhiêu: đó là bước đếm. | Mỗi số hơn số đứng trước bao nhiêu? Đó là bước đếm. |
| planPattern | Lấy số cuối cùng cộng thêm bước đếm để ra số tiếp theo. | Lấy số đứng trước cộng thêm bước đếm là ra số tiếp theo. |
| lookDiv | Chia đều: lấy tất cả chia cho số mỗi phần. Số dư … | Lấy tất cả chia cho số ở mỗi phần. Số dư luôn bé hơn số chia. |
| planFloor | Thương là số phần đủ, số dư là số còn thừa. | Thương là số hộp xếp đầy. Số dư là số còn thừa. |
| planCeil | Còn thừa dù chỉ một chút thì cần thêm một chỗ nữa đấy! | Còn thừa dù chỉ một bạn thì cũng cần thêm một xe nữa đấy! |
| lookUnknown | Thừa số chưa biết = tích chia cho thừa số kia. | Muốn tìm thừa số, lấy tích chia cho thừa số kia. |
| planUnknown | Thử lại: nhân số vừa tìm với thừa số kia xem có ra tích không. | Thử lại nhé: thay số vừa tìm vào dấu ?, xem hai bên có bằng nhau không. |
| lookExpr | Có ngoặc thì tính trong ngoặc trước; nhân, chia trước rồi mới cộng, trừ. | Có ngoặc thì tính trong ngoặc trước. Nhân, chia trước; cộng, trừ sau. |
| planExpr | Viết kết quả của phần làm trước, rồi tính tiếp từ trái sang phải. | Tính phần làm trước rồi viết kết quả vào. Sau đó tính tiếp từ trái sang phải. |
| lookClaim | Tự tính lại phép tính rồi so với kết quả bạn Nam nói. | Bạn tự tính lại, rồi so với số bạn Nam nói. |
| planClaim | Nếu khác nhau thì câu đó sai: điền kết quả bạn vừa tính. | Hai số khác nhau thì bạn Nam nói sai. Hãy điền số bạn vừa tính. |

## 5. Hang Đố Vui và Khu Vườn Quy Luật (gợi ý)

| Khoá | Trước | Sau |
|---|---|---|
| cave hint2Word | Vẽ sơ đồ đoạn thẳng: mỗi số là một đoạn, số lớn hơn thì đoạn dài hơn. Câu hỏi là: … | Vẽ sơ đồ đoạn thẳng nhé: mỗi số là một đoạn, số lớn thì đoạn dài. Câu hỏi là: … |
| cave hint3First | Gợi ý cách làm: 6 × 3 = ? Sau đó trả lời: … | Làm phép tính này trước: 6 × 3 = ? Rồi trả lời: … |
| cave hint3Radius | Gợi ý cách làm: bán kính + bán kính = 8, tìm bán kính. Sau đó trả lời: … | Bán kính + bán kính = 8. Vậy bán kính dài bao nhiêu? Rồi trả lời: … |
| cave hint3Each | Tính từng câu một. Chỉ chọn câu có kết quả khớp với phép tính. | Tính từng câu một. Câu nào tính ra đúng như đã viết thì mới chọn. |
| cave hint2Tf | Bạn tự tính lại rồi so với số bạn Nam nói nhé. | Bạn tự tính lại, rồi so với số bạn Nam nói nhé. |
| garden hintStoryRead | Đọc lại: có tất cả bao nhiêu, rồi làm gì với số đó? | Đọc lại đề nhé. Lúc đầu có tất cả bao nhiêu? Sau đó chuyện gì xảy ra? |
| garden hintStoryEat | Có 4 túi, mỗi túi 6: tìm số có tất cả trước, rồi bớt số đã dùng. | Có 4 túi, mỗi túi 6. Tìm xem có tất cả bao nhiêu trước, rồi bớt đi số đã dùng. |
| garden hintStoryShare | Gộp hai lớp lại trước (dùng ngoặc), rồi chia đều cho 3 tổ. | Gộp số của hai lớp lại trước (viết trong ngoặc), rồi chia đều cho 3 tổ. |
| garden hintCheck | … Chậu sau cũng cách chậu trước 5. | … Chậu nào cũng cách chậu đứng trước 5. |
| garden hintPartFirst | Bên phải cân có phép tính. Tính 3 × 4 trước nhé. | Bên phải cân có một phép tính. Tính 3 × 4 trước nhé. |

## 6. Hình học và đo lường (Xưởng, Thung Lũng, Hang) — chỉ những câu còn cứng

| Khoá | Trước | Sau |
|---|---|---|
| askLenCm / askLenMm | Vật dài bao nhiêu xăng-ti-mét? | Hỏi bút chì dài bao nhiêu xăng-ti-mét? |
| askItemG | Vật trên cân nặng bao nhiêu gam? | Hỏi quả cam nặng bao nhiêu gam? |
| askHowMuchHeavier | Vật đó nặng hơn bao nhiêu gam? | Vật đó nặng hơn vật kia bao nhiêu gam? |
| askDiffMm | So với cục tẩy, bút chì dài hơn bao nhiêu mi-li-mét? | Hỏi bút chì dài hơn cục tẩy bao nhiêu mi-li-mét? |
| askNumber | Số cần điền là: | Số cần điền là mấy? |
| jugRead / jugMarks | Bình chứa được 100 ml nước, được chia thành 5 vạch đều nhau. | Bình chứa được 100 ml nước. Trên bình có 5 vạch chia đều nhau. |
| jugPour | Bình có 90 ml nước. Rót ra 3 cốc, mỗi cốc 20 ml. | Bình có 90 ml nước. Mình rót ra 3 cốc, mỗi cốc 20 ml. |
| askAreaRectNum / askAreaSquareNum | Số đo diện tích hình chữ nhật là: | Số đo diện tích hình chữ nhật là bao nhiêu? |
| perimMissing | Hình có chu vi 20 cm. Có một cạnh chưa biết độ dài. | Hình có chu vi 20 cm. Một cạnh chưa biết dài bao nhiêu. |
| wireSquare | Uốn một sợi dây dài 20 cm thành một hình vuông, vừa hết dây. | Một sợi dây dài 20 cm. Uốn cả sợi dây thành một hình vuông, vừa hết dây. |
| fenceWall | … Một chiều dài sát tường nhà nên không cần rào. | … Một cạnh dài nằm sát tường nhà, không cần rào. |
| rectCut | … Cắt đi một hình vuông cạnh 3 cm ở một góc. | … Bạn cắt đi một hình vuông cạnh 3 cm ở một góc. |
| midCheck | M là điểm ở giữa hai điểm A và B. AM = 4 cm, MB = 5 cm. | Điểm M nằm giữa hai điểm A và B. AM = 4 cm, MB = 5 cm. |
| fixMid | Đoạn thẳng AB dài 8 cm. Trung điểm cách A bao nhiêu xăng-ti-mét? | Đoạn thẳng AB dài 8 cm. Vậy trung điểm cách A bao nhiêu xăng-ti-mét? |
| pickUnit | Chọn đơn vị đúng của đáp số: | Đáp số tính bằng đơn vị nào? |
| countRight | Dùng ê-ke kiểm tra các góc của hình. | Dùng ê-ke kiểm tra từng góc của hình. |
| decor | Bác Hà gắn 3 bông hoa ở mỗi đỉnh của một khối lập phương. | Bác Hà có một khối lập phương. Bác gắn 3 bông hoa ở mỗi đỉnh. |

## Ghi chú cho tác giả

- Để câu hỏi nêu rõ đồ vật, generator truyền thêm `item` (hoặc `per`) vào ref của câu hỏi; không
  đổi số, thứ tự rút ngẫu nhiên hay đáp án (golden byte-identical, quét "gợi ý không lộ đáp án" vẫn xanh).
- `lookUnknown` chỉ nói cách tìm thừa số, trong khi `unknown-mul-div` còn có dạng `56 : ? = 8`,
  `? : 7 = 8` (từ trước). `planUnknown` giờ là "thay vào dấu ? thử lại" nên đúng cho mọi dạng; tác giả
  cân nhắc có muốn gợi ý riêng theo dạng hay không.
- "Thẻ vàng … gấp đôi thẻ đỏ" giữ nguyên ("gấp đôi" là cách nói tự nhiên).
