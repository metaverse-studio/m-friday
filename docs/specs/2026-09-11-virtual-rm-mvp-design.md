# TÀI LIỆU ĐẶC TẢ THIẾT KẾ KỸ THUẬT (SPECIFICATION)
## DỰ ÁN: MVP VIRTUAL RM (TRỢ LÝ QUAN HỆ KHÁCH HÀNG ẢO) - MSB CORPORATE BANKING

- **Mã dự án**: `MSB-VIRTUAL-RM-MVP`
- **Phiên bản**: `1.0.0`
- **Ngày lập**: 11/09/2026
- **Tác giả**: Antigravity Assistant & Mr Z
- **Ngân hàng**: Ngân hàng TMCP Hàng Hải Việt Nam (Maritime Bank - MSB)

---

### 1. TỔNG QUAN DỰ ÁN & MỤC TIÊU

#### 1.1. Bối cảnh & Mục tiêu
Dự án nhằm xây dựng một phiên bản MVP ứng dụng Mobile Banking dành riêng cho Khách hàng Doanh nghiệp của MSB (**MSB M-Bank Corporate**), tích hợp **Virtual RM (Trợ lý Quan hệ Khách hàng Ảo)** tương tác hai chiều bằng Giọng nói (**Voice-to-Voice tiếng Việt**) với độ trễ thấp (< 1.5s).

Hệ thống đóng vai trò như một Giám đốc Quan hệ Khách hàng số tận tâm, chủ động phục vụ đối tượng **Checker** (Người phê duyệt cấp cao: CFO, Kế toán trưởng, Chủ tài khoản), hỗ trợ tra cứu dòng tiền, cố vấn tài chính tự động (bán chéo Chứng chỉ tiền gửi - CCTG), kiểm tra hạn mức & phê duyệt Thư tín dụng (L/C) và Bảo lãnh ngân hàng (Bank Guarantee), cũng như chuyển tiếp cuộc gọi khi cần gặp RM thực tế.

#### 1.2. Chân dung Người dùng (User Persona)
- **Họ tên / Danh xưng**: **Mr Z** (Anh Z).
- **Vai trò**: Giám đốc Tài chính (CFO) kiêm Checker cấp 1 tại Công ty CP Công Nghệ & Thương Mại Á Châu (Doanh nghiệp SME Priority tại MSB).
- **Nhu cầu chính**: 
  - Nhanh chóng nắm bắt trạng thái hoạt động tài chính đầu ngày mà không cần mở hàng chục menu phức tạp.
  - Tương tác rảnh tay (Hands-free Voice) khi đang di chuyển hoặc ngồi trên xe.
  - Phê duyệt tức thì các giao dịch trọng yếu (L/C, Bảo lãnh hợp đồng) bằng sinh trắc học chuẩn FIDO.
  - Tối ưu hóa nguồn tiền nhàn rỗi (Dòng tiền thặng dư) để sinh lời tối đa.

---

### 2. PHẠM VI NGHIỆP VỤ & KỊCH BẢN DEMO CHI TIẾT

Kịch bản demo được thiết kế theo luồng chuẩn khép kín gồm 8 phân đoạn:

#### Phân đoạn 1: Khởi động & Đăng nhập Sinh trắc học FIDO
- **Giao diện**: Màn hình khóa đẳng cấp MSB Dark Luxury.
- **Trạng thái**: Nhận diện tài khoản doanh nghiệp của Mr Z.
- **Hành động**: Chạm nút "Xác thực FIDO Biometric".
- **Hiệu ứng**: Quét Face ID / Touch ID với radar sóng vàng kim (`#FBB03B`) và cam MSB (`#EB5824`). Khi thành công, phát âm thanh xác nhận và chuyển vào Dashboard chính.

#### Phân đoạn 2: Lời chào Thông minh theo Thời gian Thực
- **Kích hoạt**: Tự động khi vào Dashboard.
- **Virtual RM**: Xuất hiện biểu tượng **Floating Bubble Virtual RM** phát sáng breathing.
- **Voice phát ra**: *"Chào buổi sáng Mr Z. Chúc anh một ngày làm việc hiệu quả tại MSB Corporate. Em là Mai - Trợ lý Quan hệ Khách hàng Doanh nghiệp của anh."*

#### Phân đoạn 3: Báo cáo Tác vụ Gần đây (Recent Actions)
- **UI Widget**: Thẻ tóm tắt hoạt động phiên giao dịch.
- **Nội dung Voice của RM**: *"Trong phiên sáng nay, hệ thống đã thực hiện thành công 12/12 lệnh hoạch toán với tổng giá trị 48.5 tỷ VNĐ. Hiện có 02 lệnh thanh toán quốc tế và 01 đề nghị phát hành bảo lãnh đang chờ anh phê duyệt ạ."*
- **Tương tác**: Cho phép Mr Z bấm xem chi tiết các lệnh chờ duyệt.

#### Phân đoạn 4: Ra lệnh Giọng nói - Báo cáo Dòng tiền (Cash Flow Analysis)
- **Hành động**: Mr Z bấm giữ mic hoặc kích hoạt Voice Modal và nói: *"Báo cáo dòng tiền gần đây của công ty."*
- **Phản hồi của RM**: Bung ngay **Widget Biểu đồ Dòng tiền 7 ngày** (Tổng thu: 65.0 tỷ VNĐ, Tổng chi: 46.8 tỷ VNĐ, Thặng dư ròng: +18.2 tỷ VNĐ).
- **Lời thoại RM**: *"Báo cáo Mr Z, trong 7 ngày qua dòng tiền doanh nghiệp đang thặng dư ròng 18.2 tỷ VNĐ, các khoản thu từ đối tác phân phối đã về đầy đủ đúng hạn."*

#### Phân đoạn 5: RM Chủ động Tư vấn Tối ưu Vốn - Chứng chỉ Tiền gửi (CCTG)
- **Cơ chế chủ động (Proactive Advisory)**: Sau khi hiển thị dòng tiền, Virtual RM tự động phân tích lịch sử chi tiêu và đưa ra đề xuất đầu tư.
- **Lời thoại RM**: *"Dựa trên lịch sử giải ngân, dự kiến trong 14 ngày tới công ty chỉ cần chi dùng 3.2 tỷ VNĐ. Em gợi ý anh trích 15 tỷ mua Chứng chỉ tiền gửi MSB ngắn hạn lãi suất ưu đãi 5.4%/năm, dự tính đem lại lợi nhuận 33.7 triệu VNĐ. Anh có muốn xem chi tiết gói CCTG này không ạ?"*
- **UI Widget**: Hiển thị **Card Chứng chỉ tiền gửi MSB Corporate** với thông số lãi suất, ngày đáo hạn và nút *"Duyệt mua ngay"*.

#### Phân đoạn 6: Quản lý Thư tín dụng (L/C) & Bảo lãnh Ngân hàng (Bank Guarantee)
- **Hành động**: Mr Z nói: *"Kiểm tra hạn mức L/C và bảo lãnh cho anh."*
- **Phản hồi của RM**:
  - Hạn mức L/C khả dụng: **18.0 tỷ VNĐ** (Tổng hạn mức: 50.0 tỷ).
  - Hạn mức Bảo lãnh khả dụng: **11.5 tỷ VNĐ** (Tổng hạn mức: 30.0 tỷ).
  - Cảnh báo: Có **01 Hợp đồng L/C Nhập khẩu Siemens AG ($250,000 USD)** và **01 Bảo lãnh thực hiện hợp đồng Dự án KCN VSIP III (5.2 tỷ VNĐ)** đang chờ duyệt.
- **Thao tác**: Mr Z có thể nói *"Duyệt bảo lãnh VSIP III bằng FIDO"* để hoàn tất ký duyệt điện tử.

#### Phân đoạn 7: Báo cáo Lịch sử Biến động Số dư
- **Hành động**: Mr Z nói: *"Cho anh xem lịch sử giao dịch gần đây."*
- **UI Widget**: Hiển thị bảng kê chi tiết các giao dịch biến động số dư trong ngày của các tài khoản thanh toán VND và USD.

#### Phân đoạn 8: Kết nối Chuyên viên / Hotline Tổng đài MSB (Escalation)
- **Hành động**: Mr Z nói: *"Kết nối cho anh tới tổng đài"* hoặc *"Gọi cho RM phụ trách"*.
- **Phản hồi của RM**: Kích hoạt **Modal Gọi thoại Ngân hàng**: *"Đang kết nối Mr Z tới Giám đốc QHKH Doanh nghiệp phụ trách: Nguyễn Văn A (0988.123.456) hoặc Hotline MSB Priority 1800 59 9999"* kèm âm thanh chuông gọi điện thực tế.

---

### 3. THIẾT KẾ GIAO DIỆN & BẢN SẮC THƯƠNG HIỆU (MSB DARK LUXURY)

#### 3.1. Tone & Mood
- **Định vị**: Ứng dụng ngân hàng doanh nghiệp cao cấp (High-End Corporate Banking), thể hiện sự quyền lực, bảo mật, tinh tế và tốc độ.
- **Màu nền**: Đen Titan / Obsidian (`#0B0E14`), Đen Sapphire (`#101520`), Card nền bóng đêm (`#161E2E`) kết hợp viền kim loại xước mờ `border-white/10`.
- **Màu nhận diện thương hiệu MSB**:
  - **MSB Orange**: `#EB5824` / `#F15A24` (Màu cam rực rỡ đặc trưng của Maritime Bank).
  - **MSB Gold**: `#F59E0B` / `#FBB03B` (Màu vàng kim đẳng cấp dành riêng cho phân khúc Khách hàng Doanh nghiệp Priority).
  - **Emerald Green**: `#10B981` (Chỉ báo giao dịch thành công / Dòng tiền dương).

#### 3.2. Thành phần Giao diện Trọng tâm
1. **Logo MSB Corporate**: Biểu tượng hình chấm tròn và dải uốn lượn phong cách Maritime Bank với chữ `MSB M-Bank Corporate`.
2. **Virtual RM Floating Bubble**: Bong bóng trợ lý ảo neo góc phải màn hình, có vòng hào quang phát sáng theo nhịp thở (Breathing glow).
3. **Voice Conversation Modal & Soundwave Orb**: Khi mở toàn màn hình, hiển thị quả cầu hạt năng lượng (Glowing Energy Orb) co giãn theo thời gian thực mô phỏng biên độ giọng nói.
4. **Voice Quick Action Chips (Fail-Safe Bar)**: Dải nút bấm gợi ý lệnh phía dưới màn hình (ví dụ: `[Dòng tiền 7 ngày]`, `[Gợi ý CCTG]`, `[Hạn mức L/C & Bảo lãnh]`, `[Gọi tổng đài]`). Cho phép kích hoạt kịch bản ngay lập tức khi môi trường ồn hoặc mất mic.

---

### 4. KIẾN TRÚC HỆ THỐNG & CÔNG NGHỆ (TECH STACK)

#### 4.1. Bảng Công nghệ Lựa chọn
| Thành phần | Công nghệ lựa chọn | Lý do & Vai trò |
|---|---|---|
| **Runtime & Package Manager** | **Bun (v1.4.2+)** | Tốc độ cài đặt package và khởi chạy siêu tốc. |
| **Frontend Framework** | **Next.js 16.3 + React 19.3** | Server Components, App Router, tối ưu hóa cho PWA Fullscreen. |
| **Styling & UI Effects** | **Tailwind CSS + Framer Motion + Lucide Icons** | Hiệu ứng chuyển động mượt mà 60fps, giao diện Dark Luxury sắc sảo. |
| **Speech-to-Text (STT)** | **Groq Whisper-large-v3-turbo (Free API)** | Nhận diện tiếng Việt chuyên ngành tài chính chuẩn xác 100%, độ trễ < 300ms. |
| **Agent Core & LLM** | **Groq API - Llama 3.3 70B / Gemma 2 (Free Tier)** | Trí tuệ nhân tạo tốc độ cao (250-300 tok/s), kèm bộ System Instruction nghiệp vụ. |
| **Text-to-Speech (TTS)** | **Edge-TTS (Giọng tiếng Việt MS Hoài My/Nam Minh)** | Hoàn toàn miễn phí, âm thanh chuẩn phòng thu studio 48kHz, phát audio tức thì. |
| **Nền tảng Triển khai (Deploy)** | **Vercel Hobby (Free) + Cloudflare Tunnel** | Tự động cấp HTTPS bắt buộc cho Microphone/PWA; test tức thì trên điện thoại thật. |

#### 4.2. Luồng Xử lý Dữ liệu (Data Pipeline)
1. **Thu âm (Audio Ingest)**: `MediaRecorder` ghi âm giọng Mr Z dạng WebM/Opus -> Đóng gói `FormData` gửi tới `/api/stt`.
2. **Phiên âm (Transcription)**: `/api/stt` gọi Groq Whisper API trả về chuỗi text tiếng Việt.
3. **Phân tích & Ra quyết định (Agent Harness)**: `/api/agent` nhận text + lịch sử ngữ cảnh -> Groq LLM đối chiếu kiến thức MSB Corporate -> Trả về JSON có cấu trúc:
   ```json
   {
     "voice_reply": "Dạ Mr Z, dòng tiền tuần này đang thặng dư...",
     "action_type": "SHOW_CASH_FLOW" | "SUGGEST_CCTG" | "SHOW_TRADE_FINANCE" | "CALL_HOTLINE",
     "action_payload": { ... }
   }
   ```
4. **Phát âm thanh (Audio Synthesis)**: `/api/tts` nhận `voice_reply` -> sinh audio MP3 phát qua `HTML5 Audio` trên điện thoại song song với hiệu ứng Orb Waveform.
5. **Cập nhật Giao diện (UI Mutation)**: App bắt `action_type` để render widget tương ứng lên màn hình.

---

### 5. HARNESS SYSTEM INSTRUCTIONS (QUY TẮC BỘ NÃO CỦA VIRTUAL RM)

Virtual RM được nạp bộ chỉ dẫn (System Instructions) cố định:
- **Tên**: Em Mai - Trợ lý Quan hệ Khách hàng Doanh nghiệp MSB.
- **Đối tượng phục vụ**: Luôn xưng "em" và gọi người dùng là "Mr Z" hoặc "Anh Z".
- **Thái độ phục vụ**: Chuyên nghiệp, nhã nhặn, sắc bén, nắm chắc số liệu tài chính doanh nghiệp.
- **Quy tắc bảo mật**: Yêu cầu xác thực FIDO trước khi thực hiện các lệnh chuyển tiền, phát hành L/C hoặc giải tỏa bảo lãnh.
- **Quy tắc tư vấn**: Khi phát hiện dòng tiền thặng dư, luôn chủ động khuyến nghị giải pháp Chứng chỉ tiền gửi MSB Corporate để tối ưu dòng vốn cho doanh nghiệp.

---

### 6. TIÊU CHÍ NGHIỆM THU (VERIFICATION & ACCEPTANCE CRITERIA)

1. **Hiển thị Mobile Responsive (PWA)**:
   - Giao diện full màn hình trên tỉ lệ điện thoại di động (iPhone/Android), không lộ thanh cuộn trình duyệt khi thêm vào màn hình chính (Add to Home Screen).
   - Tone màu Dark Luxury chuẩn xác với nhận diện MSB (Logo, màu cam `#EB5824`, vàng kim `#FBB03B`).
2. **Kịch bản Voice-to-Voice Trơn tru**:
   - Nhận diện tốt giọng nói tiếng Việt các lệnh: *"Báo cáo dòng tiền"*, *"Tư vấn chứng chỉ tiền gửi"*, *"Kiểm tra L/C và bảo lãnh"*, *"Gọi tổng đài"*.
   - Giọng đọc phản hồi tự nhiên, chuẩn âm điệu ngân hàng, không rè giật.
3. **Tính năng Dự phòng (Fail-Safe Mode)**:
   - Khi không bật micro hoặc trong môi trường ồn, người dùng bấm vào các chip kịch bản gợi ý trên màn hình vẫn kích hoạt đầy đủ phản hồi giọng nói và hiển thị widget chính xác.
4. **Đăng nhập FIDO & Ký duyệt**:
   - Modal quét sinh trắc học hoạt động mượt mà với hiệu ứng đồ họa công nghệ cao.

---
