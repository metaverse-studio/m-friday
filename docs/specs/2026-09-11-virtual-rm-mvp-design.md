# TÀI LIỆU ĐẶC TẢ THIẾT KẾ KỸ THUẬT (SPECIFICATION)
## DỰ ÁN: MVP VIRTUAL RM (TRỢ LÝ QUAN HỆ KHÁCH HÀNG ẢO) - MSB CORPORATE BANKING

- **Mã dự án**: `MSB-VIRTUAL-RM-MVP`
- **Phiên bản**: `1.1.0`
- **Ngày lập**: 11/09/2026
- **Ngày cập nhật**: 12/09/2026
- **Tác giả**: Antigravity Assistant & Mr Z
- **Ngân hàng**: Ngân hàng TMCP Hàng Hải Việt Nam (Maritime Bank - MSB)

### Nhật ký thay đổi

| Phiên bản | Thay đổi |
|---|---|
| 1.0.0 | Bản đầu: 8 phân đoạn demo tuyến tính, tech stack, nhận diện thương hiệu |
| 1.1.0 | Mở rộng thành **thư viện 17 intent gọi ngẫu nhiên**; thay `/api/agent` bằng kiến trúc nhận diện 3 tầng + numeric guard; thêm streaming TTS và cache ấm; bổ sung chương chống rủi ro sân khấu; thay tiêu chí nghiệm thu định tính bằng ngưỡng đo được; vá 2 lỗi số học của v1.0.0 |

### Mục đích sử dụng

Sản phẩm này là **demo trình diễn** (pitch) trước lãnh đạo và khách hàng doanh nghiệp MSB, không phải nền móng sản phẩm thương mại. Mọi quyết định thiết kế trong tài liệu này ưu tiên theo thứ tự:

1. **Không vấp trên sân khấu** — mọi thành phần đều có đường lui
2. **Trình diễn được nhiều phiên liên tiếp** mà không lặp lại y hệt
3. **Fidelity thị giác và âm thanh** ở mức ngân hàng cao cấp
4. Khả năng tiến hóa thành sản phẩm thật — *không phải* mục tiêu của bản MVP này

---

### 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU

#### 1.1. Bối cảnh & Mục tiêu
Dự án nhằm xây dựng một phiên bản MVP ứng dụng Mobile Banking dành riêng cho Khách hàng Doanh nghiệp của MSB (**MSB M-Bank Corporate**), tích hợp **Virtual RM (Trợ lý Quan hệ Khách hàng Ảo)** tương tác hai chiều bằng Giọng nói (**Voice-to-Voice tiếng Việt**) với độ trễ thấp (< 1.5s).

Hệ thống đóng vai trò như một Giám đốc Quan hệ Khách hàng số tận tâm, chủ động phục vụ đối tượng **Checker** (Người phê duyệt cấp cao: CFO, Kế toán trưởng, Chủ tài khoản), hỗ trợ tra cứu dòng tiền, cố vấn tài chính tự động (bán chéo Chứng chỉ tiền gửi - CCTG), kiểm tra hạn mức & phê duyệt Thư tín dụng (L/C) và Bảo lãnh ngân hàng (Bank Guarantee), cảnh báo rủi ro tỷ giá và giao dịch bất thường, cũng như chuyển tiếp cuộc gọi khi cần gặp RM thực tế.

#### 1.2. Chân dung Người dùng (User Persona)
- **Họ tên / Danh xưng**: **Mr Z** (Anh Z).
- **Vai trò**: Giám đốc Tài chính (CFO) kiêm Checker cấp 1 tại Công ty CP Công Nghệ & Thương Mại Á Châu (Doanh nghiệp SME Priority tại MSB).
- **Nhu cầu chính**:
  - Nhanh chóng nắm bắt trạng thái hoạt động tài chính đầu ngày mà không cần mở hàng chục menu phức tạp.
  - Tương tác rảnh tay (Hands-free Voice) khi đang di chuyển hoặc ngồi trên xe.
  - Phê duyệt tức thì các giao dịch trọng yếu (L/C, Bảo lãnh hợp đồng) bằng sinh trắc học chuẩn FIDO.
  - Tối ưu hóa nguồn tiền nhàn rỗi (Dòng tiền thặng dư) để sinh lời tối đa.
  - Được cảnh báo sớm về rủi ro tỷ giá và giao dịch đáng ngờ trước khi đặt bút ký.

#### 1.3. Chân dung Người trình diễn (Presenter Persona)

Đây là persona thứ hai mà v1.0.0 bỏ sót, nhưng lại quyết định phần lớn thiết kế:

- Trình diễn **nhiều phiên liên tiếp** trong cùng một buổi, trước những nhóm khán giả khác nhau.
- **Không đi theo thứ tự cố định** — nhảy thẳng vào kịch bản mà khán giả trước mặt quan tâm nhất.
- **Không thuộc lòng câu lệnh** — màn hình phải gợi ý bước tiếp theo.
- Làm việc trong môi trường **wifi hội trường không ổn định** và **tiếng ồn nền cao**.
- Có thể bị khán giả hỏi xen câu ngoài kịch bản, và không được phép để lộ rằng hệ thống không trả lời được.

---

### 2. PHẠM VI NGHIỆP VỤ & THƯ VIỆN KỊCH BẢN

#### 2.1. Thay đổi nền tảng so với v1.0.0

v1.0.0 mô tả một kịch bản tuyến tính 8 bước. v1.1.0 tổ chức lại thành **thư viện 17 intent độc lập**, mỗi intent chạy được ở bất kỳ thời điểm nào, không phụ thuộc thứ tự.

Lý do: presenter cần demo ngẫu nhiên nhiều phiên. Một kịch bản tuyến tính buộc phải chạy lại từ đầu mỗi lần muốn cho xem một tính năng ở giữa.

Hệ quả ràng buộc lên toàn hệ thống:
- Không intent nào được giả định intent khác đã chạy trước đó.
- State phiên phải **reset sạch** được trong một thao tác.
- Lời thoại phải **sinh động** để phiên thứ hai không nghe giống hệt phiên thứ nhất.

#### 2.2. Danh mục 17 Intent

| # | Intent ID | Nhóm | Widget hiển thị | FIDO |
|---|---|---|---|---|
| 1 | `FIDO_LOGIN` | Sự kiện hệ thống | Radar quét sinh trắc học | — |
| 2 | `GREETING` | Sự kiện hệ thống | Bubble + lời chào theo giờ thật | — |
| 3 | `CASH_FLOW` | Phân tích | Biểu đồ dòng tiền 7 ngày | |
| 4 | `PERIOD_COMPARE` | Phân tích | Biểu đồ cột đôi tháng này / cùng kỳ | |
| 5 | `OBLIGATION_CALENDAR` | Phân tích | Timeline nghĩa vụ chi sắp tới | |
| 6 | `TXN_HISTORY` | Phân tích | Bảng kê biến động số dư VND & USD | |
| 7 | `RECENT_ACTIONS` | Phê duyệt | Thẻ tóm tắt phiên + hàng chờ duyệt | |
| 8 | `TRADE_FINANCE` | Phê duyệt | Hạn mức L/C & Bảo lãnh | |
| 9 | `FRAUD_ALERT` | Phê duyệt | Thẻ cảnh báo đỏ giao dịch bất thường | |
| 10 | `APPROVE_FIDO` | Phê duyệt | Modal ký duyệt sinh trắc học | ✓ |
| 11 | `REJECT_ORDER` | Phê duyệt | Modal trả lệnh + ghi chú bằng giọng nói | ✓ |
| 12 | `SUGGEST_CCTG` | Tư vấn | Card Chứng chỉ tiền gửi MSB Corporate | ✓ |
| 13 | `FX_FORWARD` | Tư vấn | Tỷ giá USD/VND + đặt lệnh kỳ hạn | ✓ |
| 14 | `LOAN_BALANCE` | Tư vấn | Khế ước nhận nợ, lãi suất, đáo hạn | |
| 15 | `CALL_HOTLINE` | Hỗ trợ | Modal gọi thoại + chuông thật | |
| 16 | `SESSION_SUMMARY` | Hỗ trợ | Tóm tắt phiên + gửi báo cáo email | |
| 17 | `UNKNOWN` | Dự phòng | Thẻ chuyển tiếp RM thật | — |

Cách đếm: **2 sự kiện hệ thống** (số 1–2, không kích hoạt bằng giọng nói) + **14 intent nghiệp vụ** (số 3–16, gọi được bằng cả giọng nói lẫn chip) + **1 trạng thái dự phòng** (`UNKNOWN`, chỉ tự kích hoạt khi ba tầng nhận diện đều trượt, không xuất hiện trong chip hay ngăn kéo).

Con số **14** là số kịch bản presenter chủ động trình diễn được, và là mẫu số của mọi tiêu chí nghiệm thu ở §7.

#### 2.3. Đặc tả chi tiết từng Intent

##### `FIDO_LOGIN` — Khởi động & Đăng nhập Sinh trắc học
- **Giao diện**: Màn hình khóa MSB Dark Luxury, nhận diện sẵn tài khoản doanh nghiệp của Mr Z.
- **Hành động**: Chạm nút "Xác thực FIDO Biometric".
- **Cơ chế**: Gọi WebAuthn thật (xem §6.4). Radar sóng vàng kim `#FBB03B` và cam MSB `#EB5824` chạy trong lúc chờ.
- **Ràng buộc kỹ thuật bắt buộc**: Đây là user gesture duy nhất được đảm bảo trước khi phát âm thanh. Handler của nút này **phải** mở khóa `AudioContext` và xin quyền micro (xem §6.1). **Không được phép bỏ qua màn hình này** để vào thẳng Dashboard.

##### `GREETING` — Lời chào Thông minh theo Thời gian Thực
- **Kích hoạt**: Tự động ngay sau khi `FIDO_LOGIN` thành công.
- **Hiển thị**: Floating Bubble Virtual RM phát sáng theo nhịp thở.
- **Lời thoại (mẫu, LLM diễn đạt lại mỗi phiên)**: *"Chào buổi sáng Mr Z. Chúc anh một ngày làm việc hiệu quả tại MSB Corporate. Em là Mai — Trợ lý Quan hệ Khách hàng Doanh nghiệp của anh."*
- **Ghi chú**: "Buổi sáng / chiều / tối" lấy từ giờ hệ thống thật, không hardcode.

##### `RECENT_ACTIONS` — Báo cáo Tác vụ Gần đây
- **Câu lệnh mẫu**: *"Phiên sáng nay thế nào?"*, *"Có gì chờ anh duyệt không?"*
- **Lời thoại**: *"Trong phiên sáng nay, hệ thống đã thực hiện thành công 12/12 lệnh hạch toán với tổng giá trị 48,5 tỷ VNĐ. Hiện có 02 lệnh thanh toán quốc tế và 01 đề nghị phát hành bảo lãnh đang chờ anh phê duyệt ạ."*
- **Widget**: Thẻ tóm tắt, cho phép chạm xem chi tiết từng lệnh chờ.

##### `CASH_FLOW` — Báo cáo Dòng tiền
- **Câu lệnh mẫu**: *"Báo cáo dòng tiền gần đây của công ty"*, *"Tuần này thu chi thế nào?"*
- **Widget**: Biểu đồ dòng tiền 7 ngày — Tổng thu 65,0 tỷ; Tổng chi 46,8 tỷ; Thặng dư ròng +18,2 tỷ VNĐ.
- **Lời thoại**: *"Báo cáo Mr Z, trong 7 ngày qua dòng tiền doanh nghiệp đang thặng dư ròng 18,2 tỷ VNĐ, các khoản thu từ đối tác phân phối đã về đầy đủ đúng hạn."*

##### `OBLIGATION_CALENDAR` — Lịch Nghĩa vụ Chi sắp tới **[MỚI v1.1.0]**
- **Câu lệnh mẫu**: *"Sắp tới công ty phải chi những gì?"*, *"Lịch thuế và lương thế nào?"*
- **Widget**: Timeline nghĩa vụ chi 30 ngày tới.
- **Lời thoại**: *"Trong 30 ngày tới công ty có hai nghĩa vụ lớn: thuế GTGT quý III đến hạn ngày 20/09 khoảng 2,8 tỷ, và chi lương ngày 25/09 là 4,1 tỷ cho 320 nhân sự. Cộng với dự phòng chi vận hành 3,2 tỷ, tổng nhu cầu là 10,1 tỷ. Số dư hiện tại 27,5 tỷ hoàn toàn đủ đáp ứng ạ."*
- **Vai trò trong kiến trúc**: Intent này tồn tại để **vá lỗ hổng logic của v1.0.0** — nó cung cấp căn cứ cho việc vì sao `SUGGEST_CCTG` khuyến nghị đúng 15 tỷ chứ không phải toàn bộ thặng dư.

##### `SUGGEST_CCTG` — Tư vấn Tối ưu Vốn bằng Chứng chỉ Tiền gửi
- **Cơ chế**: Chủ động đề xuất sau `CASH_FLOW`, hoặc gọi trực tiếp.
- **Lời thoại**: *"Số dư khả dụng của công ty hiện là 27,5 tỷ. Sau khi trừ thuế, lương và dự phòng vận hành khoảng 10,1 tỷ, anh còn dư khoảng 17,4 tỷ nhàn rỗi. Em gợi ý anh trích 15 tỷ mua Chứng chỉ tiền gửi MSB kỳ hạn 15 ngày, lãi suất ưu đãi 5,4%/năm, dự tính đem lại 33,3 triệu VNĐ, vẫn giữ đệm thanh khoản 2,4 tỷ. Anh có muốn xem chi tiết gói này không ạ?"*
- **Widget**: Card CCTG MSB Corporate — số tiền, lãi suất, ngày đáo hạn, lợi tức dự kiến, nút *"Duyệt mua ngay"*.
- **Yêu cầu FIDO**: ✓ trước khi xác nhận mua.
- **Phép tính bắt buộc khớp**: `15.000.000.000 × 5,4% × 15/365 = 33.287.671 ≈ 33,3 triệu VNĐ`.

##### `TRADE_FINANCE` — Hạn mức L/C & Bảo lãnh Ngân hàng
- **Câu lệnh mẫu**: *"Kiểm tra hạn mức L/C và bảo lãnh cho anh"*
- **Widget & lời thoại**:
  - Hạn mức L/C khả dụng: **18,0 tỷ** / tổng **50,0 tỷ VNĐ**
  - Hạn mức Bảo lãnh khả dụng: **11,5 tỷ** / tổng **30,0 tỷ VNĐ**
  - Đang chờ duyệt: **01 L/C Nhập khẩu Siemens AG (250.000 USD)** và **01 Bảo lãnh thực hiện hợp đồng Dự án KCN VSIP III (5,2 tỷ VNĐ)**

##### `FX_FORWARD` — Phòng ngừa Rủi ro Tỷ giá **[MỚI v1.1.0]**
- **Câu lệnh mẫu**: *"Tỷ giá đang thế nào?"*, *"Khóa tỷ giá cho lô Siemens"*
- **Bối cảnh**: Nối thẳng vào khoản L/C Siemens 250.000 USD trong `TRADE_FINANCE`.
- **Lời thoại**: *"Tỷ giá bán USD/VND của MSB hiện là 26.180, đã tăng 1,5% trong hai tuần qua. Khoản thanh toán Siemens 250 nghìn USD đáo hạn 25/09 — nếu tỷ giá giữ xu hướng này, công ty sẽ đội thêm khoảng 98 triệu VNĐ. Em gợi ý anh khóa tỷ giá kỳ hạn ở mức 26.310, chi phí chỉ 32,5 triệu, tiết kiệm được khoảng 65 triệu ạ."*
- **Widget**: Đường tỷ giá USD/VND 14 ngày + bảng so sánh hai kịch bản + nút *"Đặt lệnh kỳ hạn"*.
- **Yêu cầu FIDO**: ✓
- **Phép tính bắt buộc khớp**:
  - Chi phí khóa kỳ hạn: `250.000 × (26.310 − 26.180) = 32.500.000 VNĐ`
  - Rủi ro nếu thả nổi (tăng tiếp 1,5%): `250.000 × 26.180 × 1,5% ≈ 98.175.000 VNĐ`
  - Tiết kiệm ròng: `98,2 − 32,5 ≈ 65,7 triệu VNĐ`

##### `FRAUD_ALERT` — Cảnh báo Giao dịch Bất thường **[MỚI v1.1.0]**
- **Câu lệnh mẫu**: *"Có gì bất thường không?"*, *"Cảnh báo rủi ro"*
- **Lời thoại**: *"Em phát hiện một điểm anh nên xem kỹ. Có lệnh chuyển 850 triệu VNĐ tới tài khoản thụ hưởng lần đầu phát sinh giao dịch, do Maker Trần Thị B tạo lúc 23:47 tối qua — ngoài giờ hành chính. Ba dấu hiệu này cùng xuất hiện nên em tạm giữ lệnh lại, chờ anh xác nhận ạ."*
- **Widget**: Thẻ cảnh báo viền đỏ, liệt kê 3 dấu hiệu rủi ro, nút *"Xem chi tiết"* và *"Trả lệnh về Maker"*.
- **Vai trò**: Đổi màu câu chuyện từ "AI bán chéo sản phẩm" sang "AI bảo vệ tiền của doanh nghiệp". Đây là intent có sức thuyết phục cao nhất với khán giả cấp quản trị.

##### `APPROVE_FIDO` — Ký duyệt Sinh trắc học
- **Câu lệnh mẫu**: *"Duyệt bảo lãnh VSIP III bằng FIDO"*
- **Cơ chế**: Modal sinh trắc học mô phỏng (xem §6.4), sau đó cập nhật trạng thái hàng chờ và hạn mức khả dụng.
- **Yêu cầu FIDO**: ✓

##### `REJECT_ORDER` — Trả lệnh về Maker kèm Lý do **[MỚI v1.1.0]**
- **Câu lệnh mẫu**: *"Trả lệnh số 3 cho kế toán, ghi chú thiếu hóa đơn đầu vào"*
- **Cơ chế**: Trích phần ghi chú từ câu nói, hiển thị trong modal để Mr Z xác nhận trước khi gửi.
- **Lời thoại**: *"Em đã trả lệnh số 3 về cho Maker Trần Thị B kèm ghi chú 'thiếu hóa đơn đầu vào'. Kế toán sẽ nhận được thông báo ngay ạ."*
- **Yêu cầu FIDO**: ✓
- **Vai trò**: v1.0.0 chỉ có duy nhất một hành động ghi (duyệt bảo lãnh). Intent này chứng minh giọng nói dùng để **làm việc**, không chỉ để tra cứu.

##### `LOAN_BALANCE` — Dư nợ Vay & Khế ước **[MỚI v1.1.0]**
- **Câu lệnh mẫu**: *"Dư nợ vay ngắn hạn còn bao nhiêu?"*
- **Lời thoại**: *"Tổng dư nợ vay ngắn hạn của công ty là 42,0 tỷ trên hạn mức 80 tỷ, còn khả dụng 38 tỷ. Công ty đang có 3 khế ước nhận nợ, gần nhất là khế ước 12,5 tỷ lãi suất 6,8%/năm đáo hạn ngày 28/09 ạ."*
- **Widget**: Bảng khế ước — số tiền, lãi suất, ngày giải ngân, ngày đáo hạn, thanh tiến độ hạn mức.

##### `PERIOD_COMPARE` — So sánh Kỳ **[MỚI v1.1.0]**
- **Câu lệnh mẫu**: *"Tháng này so với cùng kỳ năm ngoái thế nào?"*
- **Lời thoại**: *"Tháng 8 năm nay công ty thu về 248 tỷ, tăng 19,8% so với 207 tỷ cùng kỳ năm ngoái. Chi phí là 196 tỷ, tăng 12,6%. Biên dòng tiền được cải thiện từ 5,3% lên 21,0% ạ."*
- **Widget**: Biểu đồ cột đôi + chỉ số tăng trưởng.

##### `TXN_HISTORY` — Lịch sử Biến động Số dư
- **Câu lệnh mẫu**: *"Cho anh xem lịch sử giao dịch gần đây"*
- **Widget**: Bảng kê chi tiết biến động số dư trong ngày của các tài khoản thanh toán VND và USD.

##### `CALL_HOTLINE` — Kết nối Chuyên viên / Tổng đài
- **Câu lệnh mẫu**: *"Kết nối cho anh tới tổng đài"*, *"Gọi cho RM phụ trách"*
- **Widget**: Modal gọi thoại kèm âm thanh chuông thật.
- **Lời thoại**: *"Đang kết nối Mr Z tới Giám đốc QHKH Doanh nghiệp phụ trách: Nguyễn Văn A (0988.123.456), hoặc Hotline MSB Priority 1800 59 9999 ạ."*

##### `SESSION_SUMMARY` — Chốt phiên & Gửi Báo cáo **[MỚI v1.1.0]**
- **Câu lệnh mẫu**: *"Gửi tóm tắt phiên này vào email anh"*
- **Cơ chế**: Tổng hợp các intent đã chạy trong phiên hiện tại thành danh sách, hiển thị toast xác nhận gửi.
- **Lời thoại**: *"Em đã tổng hợp phiên làm việc sáng nay và gửi vào email của anh. Báo cáo gồm tình hình dòng tiền, các lệnh đã phê duyệt và hai khuyến nghị tối ưu vốn ạ."*
- **Vai trò**: Đóng khung demo gọn gàng thay vì kết thúc lơ lửng ở cuộc gọi hotline.

##### `UNKNOWN` — Guardrail cho Câu hỏi ngoài Phạm vi **[MỚI v1.1.0]**
- **Kích hoạt**: Khi cả ba tầng nhận diện đều không khớp intent nào.
- **Lời thoại**: *"Dạ câu này nằm ngoài phạm vi em hỗ trợ trực tiếp. Để đảm bảo chính xác tuyệt đối cho anh, em xin phép chuyển sang anh Nguyễn Văn A — Giám đốc QHKH phụ trách tài khoản của mình. Anh có muốn em kết nối luôn không ạ?"*
- **Widget**: Thẻ chuyển tiếp RM thật.
- **Vai trò**: Đây là **lưới an toàn sân khấu**, không phải tính năng trình diễn. Khi khán giả hỏi xoáy một câu ngoài kịch bản, hệ thống từ chối một cách chuyên nghiệp thay vì bịa số liệu ngân hàng. Việc từ chối đúng cách còn làm tăng độ tin cậy trước khán giả cấp quản trị.

#### 2.4. Bộ Dữ liệu Mô phỏng (Fixtures)

Toàn bộ số liệu demo nằm trong **một nguồn duy nhất** là `src/lib/data/fixtures.ts`. Không component nào được hardcode số liệu.

| Khóa | Giá trị |
|---|---|
| Số dư khả dụng VND | 27,5 tỷ VNĐ |
| Dòng tiền 7 ngày | Thu 65,0 tỷ / Chi 46,8 tỷ / Ròng +18,2 tỷ |
| Phiên hôm nay | 12/12 lệnh hạch toán, 48,5 tỷ |
| Hàng chờ duyệt | 02 thanh toán quốc tế + 01 bảo lãnh |
| Nghĩa vụ chi 30 ngày | Thuế GTGT 20/09: 2,8 tỷ; Lương 25/09: 4,1 tỷ (320 nhân sự); Dự phòng vận hành: 3,2 tỷ |
| CCTG khuyến nghị | 15 tỷ, kỳ hạn 15 ngày, 5,4%/năm, lợi tức 33,3 triệu |
| Hạn mức L/C | Khả dụng 18,0 tỷ / Tổng 50,0 tỷ |
| Hạn mức Bảo lãnh | Khả dụng 11,5 tỷ / Tổng 30,0 tỷ |
| L/C chờ duyệt | Siemens AG, 250.000 USD, đáo hạn 25/09 |
| Bảo lãnh chờ duyệt | KCN VSIP III, 5,2 tỷ VNĐ |
| Tỷ giá USD/VND | Giao ngay 26.180 (bán); Kỳ hạn 25/09: 26.310; Biến động 2 tuần: +1,5% |
| Cảnh báo bất thường | 850 triệu, thụ hưởng lần đầu, Maker Trần Thị B, 23:47 ngày 11/09 |
| Dư nợ vay | 42,0 tỷ / hạn mức 80 tỷ; 3 khế ước; gần nhất 12,5 tỷ @ 6,8%/năm đáo hạn 28/09 |
| So sánh kỳ (T8) | Thu 248 tỷ (+19,8%) / Chi 196 tỷ (+12,6%) |
| RM phụ trách | Nguyễn Văn A — 0988.123.456 |
| Hotline | MSB Priority 1800 59 9999 |

**Quy tắc nhất quán số liệu**: mọi con số dẫn xuất (lợi tức, chênh lệch tỷ giá, phần trăm tăng trưởng) phải được **tính từ fixtures tại thời điểm chạy**, không ghi sẵn kết quả. Có unit test đối chiếu từng phép tính nêu trong §2.3.

---

### 3. THIẾT KẾ GIAO DIỆN & BẢN SẮC THƯƠNG HIỆU (MSB DARK LUXURY)

#### 3.1. Tone & Mood
- **Định vị**: Ứng dụng ngân hàng doanh nghiệp cao cấp (High-End Corporate Banking), thể hiện sự quyền lực, bảo mật, tinh tế và tốc độ.
- **Màu nền**: Đen Titan / Obsidian (`#0B0E14`), Đen Sapphire (`#101520`), Card nền bóng đêm (`#161E2E`) kết hợp viền kim loại xước mờ `border-white/10`.
- **Màu nhận diện thương hiệu MSB**:
  - **MSB Orange**: `#EB5824` / `#F15A24` (Màu cam rực rỡ đặc trưng của Maritime Bank).
  - **MSB Gold**: `#F59E0B` / `#FBB03B` (Màu vàng kim đẳng cấp dành riêng cho phân khúc Khách hàng Doanh nghiệp Priority).
  - **Emerald Green**: `#10B981` (Chỉ báo giao dịch thành công / Dòng tiền dương).
  - **Alert Red**: `#EF4444` (Chỉ báo cảnh báo rủi ro — dùng riêng cho `FRAUD_ALERT`, không dùng cho mục đích khác để giữ sức nặng của tín hiệu).

#### 3.2. Thành phần Giao diện Trọng tâm
1. **Logo MSB Corporate**: Biểu tượng hình chấm tròn và dải uốn lượn phong cách Maritime Bank với chữ `MSB M-Bank Corporate`.
2. **Virtual RM Floating Bubble**: Bong bóng trợ lý ảo neo góc phải màn hình, có vòng hào quang phát sáng theo nhịp thở (Breathing glow).
3. **Voice Conversation Modal & Soundwave Orb**: Khi mở toàn màn hình, hiển thị quả cầu hạt năng lượng (Glowing Energy Orb) co giãn theo thời gian thực mô phỏng biên độ giọng nói. **Chạm vào orb để ngắt lời RM** (xem §6.3).
4. **Contextual Chip Bar** — thay thế Fail-Safe Bar của v1.0.0 (xem §3.3).
5. **Command Drawer** — ngăn kéo liệt kê đủ 14 lệnh nghiệp vụ (xem §3.4).

#### 3.3. Contextual Chip Bar **[MỚI v1.1.0]**

v1.0.0 thiết kế 4 chip cố định. Với 14 intent nghiệp vụ, 4 chip cố định không đủ chỗ, còn hiển thị cả 14 thì lộ rõ đây là bảng điều khiển demo.

Giải pháp: thanh chip luôn có **3 chip gợi ý theo ngữ cảnh + 1 nút `Tất cả ▸`**. Chip tự đổi theo intent vừa chạy, khớp với bước tiếp theo hợp lý về mặt nghiệp vụ:

| Sau intent | Ba chip gợi ý |
|---|---|
| `GREETING` | Dòng tiền 7 ngày · Lệnh chờ duyệt · Hạn mức L/C |
| `CASH_FLOW` | Gợi ý CCTG · Lịch chi sắp tới · So sánh kỳ |
| `OBLIGATION_CALENDAR` | Gợi ý CCTG · Dư nợ vay · Dòng tiền 7 ngày |
| `SUGGEST_CCTG` | Duyệt mua ngay · Lịch chi sắp tới · Dư nợ vay |
| `RECENT_ACTIONS` | Cảnh báo bất thường · Hạn mức L/C · Lịch sử giao dịch |
| `TRADE_FINANCE` | Duyệt bảo lãnh VSIP III · Khóa tỷ giá Siemens · Trả lệnh về Maker |
| `FX_FORWARD` | Đặt lệnh kỳ hạn · Hạn mức L/C · Dòng tiền 7 ngày |
| `FRAUD_ALERT` | Xem chi tiết · Trả lệnh về Maker · Gọi RM phụ trách |
| `APPROVE_FIDO` | Lệnh chờ duyệt · Cảnh báo bất thường · Chốt phiên |
| `UNKNOWN` | Gọi RM phụ trách · Dòng tiền 7 ngày · Lệnh chờ duyệt |

Cơ chế này phục vụ cả hai persona cùng lúc: với khán giả nó trông như một sản phẩm hiểu ngữ cảnh, với presenter nó là tấm nhắc bài không cần thuộc lòng.

#### 3.4. Command Drawer **[MỚI v1.1.0]**

Nút `Tất cả ▸` mở ngăn kéo trượt từ dưới lên, liệt kê 14 intent nghiệp vụ chia theo 4 nhóm (Phân tích · Phê duyệt · Tư vấn · Hỗ trợ). Dùng khi presenter muốn nhảy cóc sang kịch bản bất kỳ theo yêu cầu khán giả.

Cuối ngăn kéo có nút **"Bắt đầu phiên mới"**: xóa lịch sử hội thoại, đưa chip về trạng thái đầu, khôi phục hàng chờ duyệt và hạn mức về giá trị gốc, **giữ nguyên cache audio**. Cho phép demo lại từ đầu trong vài giây mà không mất lợi thế tốc độ của cache.

---

### 4. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)

#### 4.1. Bảng Công nghệ Lựa chọn

Các version dưới đây đã được kiểm chứng trên registry ngày 12/09/2026, không phải con số ước lượng.

| Thành phần | Công nghệ lựa chọn | Lý do & Vai trò |
|---|---|---|
| **Runtime & Package Manager** | **Bun 1.4.2** | Tốc độ cài đặt package và khởi chạy siêu tốc. |
| **Frontend Framework** | **Next.js 16.3.4 + React 19.3.0** | Server Components, App Router, tối ưu hóa cho PWA Fullscreen. |
| **Styling & UI Effects** | **Tailwind CSS + Framer Motion 13.2.0 + Lucide Icons** | Hiệu ứng chuyển động mượt mà 60fps, giao diện Dark Luxury sắc sảo. |
| **Speech-to-Text (STT)** | **Groq Whisper-large-v3-turbo** qua `groq-sdk@1.6.0` | Nhận diện tiếng Việt chuyên ngành tài chính, độ trễ ~300ms. |
| **Intent Classification** | **Groq API — Llama 3.3 70B** | Chỉ phân loại intent, **không sinh số liệu**. Output bị ràng buộc trong danh sách 17 intent ID. |
| **Response Generation** | **Groq API — Llama 3.3 70B** | Diễn đạt lời thoại từ fixtures, chịu ràng buộc numeric guard (§4.4). |
| **Text-to-Speech (TTS)** | **Edge-TTS** qua `msedge-tts@2.0.7` (giọng `vi-VN-HoaiMyNeural` / `vi-VN-NamMinhNeural`) | Miễn phí, chất lượng studio, không cần API key. Đặt sau lớp `TtsProvider` để thay thế được. |
| **Nền tảng Triển khai** | **Vercel Hobby + Cloudflare Tunnel** | Tự động cấp HTTPS bắt buộc cho Microphone/WebAuthn/PWA. |

**Ràng buộc runtime**: route TTS **phải** chạy trên Node runtime (`export const runtime = 'nodejs'`), không phải Edge runtime, vì `msedge-tts` cần WebSocket client của Node.

**Rủi ro đã biết**: Edge-TTS là API không chính thức của Microsoft và có thể bị chặn bất kỳ lúc nào. Toàn bộ mã gọi TTS nằm sau interface `TtsProvider` trong một file duy nhất, cho phép đổi sang Google Cloud TTS hoặc FPT.AI mà không sửa phần còn lại của hệ thống.

#### 4.2. Cấu trúc Thư mục **[MỚI v1.1.0]**

```
src/
  app/
    page.tsx                    # Shell: lock screen → dashboard
    api/
      stt/route.ts              # Groq Whisper
      intent/route.ts           # Phân loại → intent_id (KHÔNG sinh lời thoại)
      speak/route.ts            # Sinh lời thoại + streaming TTS (Node runtime)
  lib/
    intents/
      registry.ts               # 17 intent — trái tim hệ thống
      resolve.ts                # Nhận diện 3 tầng + validate
      guard.ts                  # Numeric guard
    data/
      fixtures.ts               # TOÀN BỘ số liệu demo, nguồn duy nhất
    audio/
      player.ts                 # Unlock autoplay, hàng đợi, barge-in
      cache.ts                  # Cache ấm theo hash text
      providers/
        edge-tts.ts             # Cài đặt TtsProvider hiện tại
    session.ts                  # State phiên + reset
  components/
    widgets/                    # Một file mỗi widget
    voice/                      # Orb, Modal, ChipBar, Drawer
    fido/                       # WebAuthn thật + modal mô phỏng
public/
  audio/fallback/               # MP3 dự phòng cho từng intent
```

Nguyên tắc: thêm kịch bản thứ 18 chỉ cần thêm một object vào `registry.ts` và một component widget. Không sửa `resolve.ts`, không sửa `player.ts`.

#### 4.3. Nhận diện Intent 3 Tầng **[THAY THẾ §4.2 của v1.0.0]**

v1.0.0 để LLM trả về một JSON gồm cả `voice_reply`, `action_type` và `action_payload`. Kiến trúc đó cho LLM ba cơ hội làm hỏng demo cùng lúc: nói sai số, chọn sai widget, và trả về JSON không parse được.

v1.1.0 thu hẹp vai trò LLM xuống **một chuỗi duy nhất**:

| Tầng | Cơ chế | Độ trễ | Khi nào dùng |
|---|---|---|---|
| 1. Chip | Chạm chip → có sẵn `intent_id` | 0ms | Bỏ qua cả STT lẫn LLM |
| 2. Keyword | Regex tiếng Việt trên text STT, **chạy client-side** | ~5ms | Câu lệnh chuẩn và biến thể phổ biến |
| 3. LLM | Groq phân loại vào 17 intent | ~150ms | Chỉ khi tầng 2 trượt |

Tầng 3 trả về **duy nhất một `intent_id`**, được đối chiếu ngược lại registry. Trả về bất cứ thứ gì ngoài danh sách → ép thành `UNKNOWN` → chạy guardrail. LLM không có đường nào làm hỏng màn hình.

Tầng 2 chạy hoàn toàn phía client nên chip và câu lệnh chuẩn **không cần mạng để nhận diện**.

#### 4.4. Sinh Lời thoại & Numeric Guard **[MỚI v1.1.0]**

Lời thoại **được LLM sinh mỗi lần**, không phát băng ghi sẵn — nếu không, phiên demo thứ hai sẽ nghe giống hệt phiên thứ nhất và khán giả nhận ra ngay.

Ràng buộc đặt lên LLM:

1. **Giới hạn tầm nhìn dữ liệu**: LLM chỉ nhận đúng lát fixtures của intent đang chạy (`fixtureKey`), không nhận toàn bộ. Hỏi dòng tiền thì trong tay nó không có số liệu L/C để mà nói nhầm sang.
2. **Cấm suy diễn số học**: system prompt cấm tuyệt đối việc tự cộng trừ, ước lượng, quy đổi tỷ giá. Mọi con số dẫn xuất được tính sẵn bằng TypeScript và đưa vào như dữ liệu.
3. **Numeric guard**: sau khi sinh, trích mọi con số trong output và đối chiếu với tập số hợp lệ của intent đó. Có số lạ → sinh lại một lần → vẫn sai thì dùng `fallbackLine` tĩnh.
4. **`max_tokens ≈ 120`**: chặn câu lan man, giữ nhịp demo.

LLM được quyền đổi cách nói. Không được quyền đổi số liệu.

#### 4.5. Luồng Xử lý & Ngân sách Độ trễ

```
Mic dừng
   │
   ├─► STT Groq Whisper                            ~300ms
   │
   ├─► Tầng 2 keyword (client)                       ~5ms
   │      └─(trượt)─► Tầng 3 LLM phân loại         ~150ms
   │
   ├─► Tra registry + lấy fixtures                    0ms
   │
   ├─► LLM sinh lời thoại (streaming)
   │      └─► Cắt theo dấu câu, gửi mảnh đầu đi TTS ngay
   │
   ├─► TTS mảnh câu đầu tiên                        ~300ms
   │
   └─► BẮT ĐẦU PHÁT          Time-to-first-audio ≈ 720ms + RTT mạng
          (mảnh 2, 3... sinh và tổng hợp nền, nối vào hàng đợi liền mạch)
```

**Chỉ tiêu đo là thời điểm bắt đầu phát**, không phải thời điểm phát xong toàn bộ câu. Nếu chờ sinh trọn lời thoại rồi mới đọc, ngân sách 1,5s sẽ vỡ — do đó **streaming cắt theo câu là bắt buộc**, không phải tối ưu tùy chọn.

#### 4.6. Cache Ấm **[MỚI v1.1.0]**

Mọi mảnh audio sinh ra được cache theo hash nội dung text, **lưu phía client** bằng Cache API. Đặt ở client chứ không phải server vì đây là điều kiện để chạy được khi mất mạng hoàn toàn — cache trên server không cứu được tình huống đó.

- **Trước buổi demo**: presenter chạy một lượt warm-up 14 kịch bản → cache đầy.
- **Lúc demo**: câu chữ trùng với lần trước thì phát tức thì từ cache; câu biến thể thì sinh live, vẫn nhanh nhờ streaming.
- **Khi mạng chết hoàn toàn**: cache cộng Service Worker đủ chạy trọn kịch bản.

Khác biệt cốt lõi so với pre-render: cache là **kết quả phụ của việc chạy thật**, không phải ràng buộc. Hệ thống vẫn sinh thoại mới mỗi lần, chỉ là không phải trả giá hai lần cho cùng một câu.

---

### 5. HARNESS SYSTEM INSTRUCTIONS (QUY TẮC BỘ NÃO CỦA VIRTUAL RM)

#### 5.1. Nhân vật
- **Tên**: Em Mai — Trợ lý Quan hệ Khách hàng Doanh nghiệp MSB.
- **Xưng hô**: Luôn xưng "em", gọi người dùng là "Mr Z" hoặc "Anh Z".
- **Thái độ**: Chuyên nghiệp, nhã nhặn, sắc bén, nắm chắc số liệu tài chính doanh nghiệp.
- **Nhịp nói**: Câu ngắn, dẫn số liệu trước, khuyến nghị sau. Không dùng từ đệm thừa.

#### 5.2. Ràng buộc cứng
- **Không tự sinh số**: mọi con số phải xuất hiện nguyên văn trong fixtures được cấp. Cấm cộng, trừ, ước lượng, quy đổi.
- **Không bịa khi không biết**: câu hỏi ngoài 17 intent → trả về `UNKNOWN`, không suy đoán.
- **Bảo mật**: yêu cầu xác thực FIDO trước mọi lệnh làm đổi trạng thái — chuyển tiền, mua CCTG, đặt lệnh kỳ hạn, phát hành L/C, giải tỏa bảo lãnh, trả lệnh về Maker.
- **Tư vấn có căn cứ**: khi khuyến nghị tối ưu vốn, luôn viện dẫn nghĩa vụ chi sắp tới làm cơ sở, không khuyến nghị dựa trên thặng dư thuần túy.

#### 5.3. Hai lời gọi LLM tách biệt

| Lời gọi | Đầu vào | Đầu ra | Nhiệt độ |
|---|---|---|---|
| Phân loại | Text STT + danh sách 17 intent kèm mô tả | Một `intent_id` | 0 |
| Sinh thoại | `fixtureKey` của intent + nhân vật | Lời thoại ≤ 120 token | 0.7 |

Tách đôi để mỗi lời gọi có đúng một nhiệm vụ, đúng một ràng buộc, và hỏng độc lập với nhau.

---

### 6. CHỐNG RỦI RO SÂN KHẤU **[MỚI v1.1.0]**

#### 6.1. Autoplay iOS — rủi ro nghiêm trọng nhất

iOS Safari và Chrome chặn phát audio nếu không xuất phát từ user gesture. v1.0.0 quy định lời chào tự phát khi vào Dashboard — điều này **sẽ khiến demo câm ngay ở bước thứ hai**.

Cách vá: nút *"Xác thực FIDO Biometric"* ở màn hình khóa là gesture hợp lệ duy nhất được đảm bảo. Trong đúng handler của nút đó:

1. Khởi tạo một `AudioContext` dùng chung cho toàn app.
2. Phát một buffer rỗng để mở khóa quyền phát.
3. Xin luôn quyền micro (biết sớm nếu bị từ chối, thay vì phát hiện giữa demo).

**Ràng buộc suy ra**: màn hình khóa là bắt buộc về mặt kỹ thuật. Không được phép thêm đường tắt vào thẳng Dashboard.

#### 6.2. Thang suy giảm

Nguyên tắc: mỗi tầng hỏng thì rơi xuống tầng dưới. Không bao giờ có màn hình trắng hay popup lỗi đỏ trước mặt khán giả.

| Thành phần hỏng | Rơi về | Khán giả thấy |
|---|---|---|
| TTS lỗi / bị chặn | Cache → MP3 dự phòng trong `public/audio/fallback/` | Không nhận ra |
| LLM sinh thoại lỗi / rate limit | `fallbackLine` tĩnh trong registry | Câu chữ đều hơn bình thường |
| LLM phân loại lỗi | Tầng 2 keyword | Cần nói đúng câu lệnh chuẩn hơn |
| STT lỗi | Chip bar | Presenter chạm thay vì nói |
| Micro bị từ chối | Chip bar, orb hiển thị "chế độ chạm" | Không có thông báo lỗi |
| Mạng chết hoàn toàn | Service Worker + keyword client-side + cache | Vẫn chạy trọn kịch bản |

Mọi lỗi được ghi vào console để chẩn đoán sau buổi demo, **không hiển thị lên giao diện**.

#### 6.3. Barge-in

Chạm vào Orb để ngắt lời RM, audio fade out trong 150ms và hàng đợi mảnh câu bị hủy.

**Không bật tự động ngắt theo ngưỡng âm thanh micro.** Hội trường ồn sẽ khiến RM tự cắt lời mình giữa câu — rủi ro lớn hơn lợi ích. Cơ chế tự động để lại sau một cờ cấu hình tắt mặc định.

#### 6.4. Chiến lược FIDO

| Bối cảnh | Cơ chế | Lý do |
|---|---|---|
| `FIDO_LOGIN` (1 lần/phiên) | **WebAuthn thật** | Face ID của iPhone bật lên trước mặt khán giả — khoảnh khắc thuyết phục nhất của demo |
| `APPROVE_FIDO`, `REJECT_ORDER`, mua CCTG, đặt lệnh FX (nhiều lần/phiên) | **Modal mô phỏng** | Lặp Face ID thật 4 lần trong một phiên làm demo chậm và gây ỉ |

WebAuthn thật cần: HTTPS, `rpId` khớp domain triển khai, và credential đã đăng ký sẵn trong bước warm-up trước buổi demo.

**Timeout 3 giây** cho WebAuthn — hết giờ hoặc người dùng hủy thì rơi về animation mô phỏng. Khán giả thấy Face ID thật trong trường hợp tốt, thấy hiệu ứng radar đẹp trong trường hợp xấu, **không bao giờ thấy lỗi**.

#### 6.5. Quy trình Warm-up trước Buổi demo

1. Mở app trên thiết bị demo, đăng nhập để đăng ký credential WebAuthn.
2. Mở Command Drawer, chạy lần lượt 14 intent nghiệp vụ → cache audio đầy, Service Worker cache shell.
3. Kiểm tra time-to-first-audio hiển thị trong console ≤ 1,5s.
4. Chạm "Bắt đầu phiên mới" để về trạng thái sạch.

---

### 7. TIÊU CHÍ NGHIỆM THU (VERIFICATION & ACCEPTANCE CRITERIA)

v1.0.0 dùng tiêu chí định tính ("không rè giật", "mượt mà") không thể kiểm chứng. v1.1.0 thay bằng ngưỡng đo được.

#### 7.1. Hiệu năng

| Hạng mục | Ngưỡng | Cách đo |
|---|---|---|
| Time-to-first-audio | ≤ 1,5s ở p95 | `performance.now()` từ lúc mic dừng tới khi `audio.play()` resolve, ghi console |
| Độ mượt khung hình | Không rớt dưới 55fps | Chrome DevTools Performance, đo trên Orb + chuyển cảnh widget |
| Audio liền mạch | 0 lần đứt quãng giữa các mảnh câu | Nghe kiểm 14 kịch bản |

#### 7.2. Độ chính xác

| Hạng mục | Ngưỡng | Cách đo |
|---|---|---|
| Nhận diện intent | ≥ 95% | Bộ 50 câu thử, chạy bằng script |
| Numeric guard | 0 con số sai lọt qua / 50 lượt | Đối chiếu tự động với fixtures |
| Nhất quán số liệu | 100% phép tính ở §2.3 khớp | Unit test trên `fixtures.ts` |

**Thành phần bộ 50 câu thử**: 14 intent nghiệp vụ × 3 biến thể diễn đạt = 42 câu, cộng 8 câu ngoài phạm vi phải rơi đúng vào `UNKNOWN` (ví dụ: *"Cho anh vay 200 tỷ"*, *"Giá vàng hôm nay bao nhiêu?"*, *"Mở thẻ tín dụng cá nhân cho anh"*).

Tám câu `UNKNOWN` quan trọng không kém 42 câu kia: chúng kiểm chứng rằng hệ thống **từ chối đúng lúc** thay vì gán bừa vào intent gần giống. Bộ câu thử cũng ép việc viết `keywords` phủ đủ biến thể tiếng Việt thay vì đoán.

#### 7.3. Trải nghiệm & Dự phòng

| Hạng mục | Ngưỡng | Cách đo |
|---|---|---|
| PWA installable | Lighthouse PWA pass | Không lộ thanh địa chỉ sau Add to Home Screen |
| Chạy offline | ≥ 12/14 kịch bản | Tắt mạng hoàn toàn, chạy từ cache |
| Không micro | 14/14 kịch bản chạy qua chip | Từ chối quyền micro rồi demo đủ |
| Suy giảm im lặng | 0 popup lỗi hiển thị | Chủ động gây lỗi từng tầng ở §6.2 |
| Autoplay iOS | Lời chào phát được | Kiểm trên iPhone Safari thật, không phải simulator |

#### 7.4. Nhận diện Thương hiệu

- Giao diện full màn hình trên tỉ lệ điện thoại (iPhone/Android), không lộ thanh cuộn trình duyệt.
- Tone màu Dark Luxury chuẩn xác với nhận diện MSB: logo, cam `#EB5824`, vàng kim `#FBB03B`.
- Đỏ cảnh báo `#EF4444` chỉ xuất hiện ở `FRAUD_ALERT`.

---

### 8. PHẠM VI LOẠI TRỪ (OUT OF SCOPE)

Ghi rõ để tránh mở rộng ngoài ý muốn trong lúc triển khai:

- Không tích hợp core banking thật, không gọi API MSB thật.
- Không có đăng nhập nhiều người dùng, không phân quyền Maker/Checker thật.
- Không lưu trữ dữ liệu bền vững — state nằm trong bộ nhớ, mất khi tải lại trang.
- Không có audit trail, không mã hóa dữ liệu khi lưu.
- Không đa ngôn ngữ — chỉ tiếng Việt.
- Không hỗ trợ máy tính để bàn — thiết kế riêng cho tỉ lệ điện thoại.
