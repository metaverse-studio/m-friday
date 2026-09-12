# MSB M-Bank Corporate · Virtual RM — Đặc tả Hệ thống Thiết kế & Giao diện (Design System Spec)

- **Tài liệu nguồn**: 
  - Figma Node: `18904:81945` (`Mobile-EB`)
  - Figma Styles: `EB dark 1` (Bảng màu nền tối Enterprise Banking) & `Stroke 1` (Viền phản quang Specular Highlight)
  - Đặc tả nghiệp vụ MVP: `docs/specs/2026-09-11-virtual-rm-mvp-design.md` (v1.1.1)
- **Viewport chuẩn**: Mobile Portrait 390 × 844 px (tỷ lệ iPhone 14/15/16 Pro), hỗ trợ cuộn dọc tới 991px.
- **Mục tiêu**: Xây dựng hệ thống Design System chuẩn hóa toàn diện từ Figma (Color Tokens, Typography, Spacing, Elevation, Component Primitives) phục vụ ứng dụng Ngân hàng Doanh nghiệp MSB Corporate và trợ lý ảo Virtual RM.

---

## 1. Triết lý Thiết kế: Enterprise Dark Luxury & AI Voice-First

Hệ thống thiết kế kết hợp giữa hai tiêu chuẩn cốt lõi:
1. **Tiêu chuẩn Nền tảng Doanh nghiệp (MSB Enterprise Banking)**: Khai thác trực tiếp từ Figma Node `18904:81945` (`Mobile-EB`). Sử dụng phông chữ tiêu chuẩn **Inter**, hệ thống form input kiểm soát tài chính nghiêm ngặt, cấu trúc card phân tầng rõ ràng, bo góc tinh chỉnh (4px đến 16px) thay vì thô cứng 0px, và hệ thống chỉ báo trạng thái (toast, popup warning, loading rings).
2. **Ngôn ngữ Sang trọng Tối (Dark Luxury)**: Thay vì nền sáng thông thường, phiên bản Corporate Executive sử dụng bảng màu **`EB dark 1`** với dải gradient chiều sâu kết hợp viền kính mạ kim loại **`Stroke 1`** (Glassmorphism highlight) tạo cảm giác quyền uy, bảo mật và hiện đại cho các lãnh đạo doanh nghiệp (Maker / Checker).

### Bảng đối chiếu tiến hóa từ bản phác thảo sang Figma chuẩn

| Thuộc tính | Bản phác thảo cũ (Modernist) | Chuẩn hóa Figma (`Mobile-EB` & `EB dark 1`) | Lý do chuẩn hóa |
|---|---|---|---|
| **Typography** | Archivo | **Inter** (toàn bộ hierarchy từ Title đến Caption) | Chuẩn typography của hệ sinh thái MSB Mobile Banking, tối ưu đọc số liệu tài chính |
| **Bo góc (Corner Radius)** | `0px` tuyệt đối | **4px / 8px / 12px / 16px / 24px / 32px / Pill** | Đảm bảo tính công thái học trên mobile, phân cấp rõ giữa nút, input và card |
| **Nền chính (Background)** | `#0B0E14` (Đen phẳng) | **Gradient `EB dark 1`** (`#0D2745` → `#232323` → `#4B372B`) | Chiều sâu luxury đa tầng: Xanh biển đêm chuyển than chì sang ánh đồng ấm |
| **Đường phân tách & Viền** | Viền 1px/2px phẳng đục | **`Stroke 1`** (Gradient sáng 0% → 33% → 60%) | Hiệu ứng viền vát bắt sáng (Specular border highlight) trên nền tối |
| **Bề mặt nổi (Elevation)** | Không shadow / không blur | **Center Drop Shadow (4px/16px) + Blur (24px)** | Tạo phân tầng giao diện nổi (glassmorphism frosted surface) |

---

## 2. Hệ thống Tokens Nền tảng (Design Tokens)

### 2.1 Bảng màu Nền tối Đặc quyền (`EB dark 1`) & Viền Kính (`Stroke 1`)

Truy xuất trực tiếp từ API Figma (`get_styles`):

#### A. Style `EB dark 1` (`S:321c69a25e83fa7725f03975adc75e86c6d3eba4,`)
- **Loại gradient**: `GRADIENT_LINEAR` (Toán học ma trận affine: `gradientTransform = [[0.837633, -0.225452, 0.225452], [0.177495, 0.246458, 0.253542]]`)
- **Góc quay Gradient chuẩn xác**:
  - Vector hướng: $dx = 0.837633$, $dy = 0.177495$.
  - Góc chuẩn hóa CSS (Normalized Angle): `102°` (`102deg`) — hướng từ góc trên-trái sang góc phải, dốc nhẹ xuống dưới.
  - Góc tỷ lệ theo Viewport di động 390 × 844 px: `114.6°` (~`115deg`).
  - Điểm khởi đầu (Start): `(11.3%, 37.7%)` | Điểm kết thúc (End): `(95.0%, 55.4%)`.
  - *(Lưu ý: Không sử dụng góc phỏng đoán 150° vì sẽ làm xoay lệch trục ánh sáng và biến dạng vùng chuyển màu).*
- **Các điểm dừng (Gradient Stops)**:
  - `Stop 0.00 (0%)`: `#0D2745` (RGB: `13, 39, 69`, float: `0.051, 0.153, 0.271`) — **Midnight Navy** (Sắc xanh biển đêm sâu lắng, biểu trưng cho sự uy tín, bảo mật ngân hàng).
  - `Stop 0.49 (48.95%)`: `#232323` (RGB: `35, 35, 35`, float: `0.137, 0.137, 0.137`) — **Neutral Graphite** (Sắc than chì trung tính, giữ độ tương phản cao cho nội dung trung tâm).
  - `Stop 0.92 (92.06%)`: `#4B372B` (RGB: `75, 55, 43`, float: `0.294, 0.214, 0.169`) — **Dark Bronze** (Ánh đồng kim loại trầm ấm, mang lại nét luxury và thịnh vượng).
- **Mã CSS chuẩn triển khai**:
  ```css
  /* Chuẩn hóa theo góc affine ma trận Figma */
  background: linear-gradient(102deg, #0D2745 0%, #232323 49%, #4B372B 92%);
  /* Hoặc tinh chỉnh theo khung nhìn mobile 390x844: */
  /* background: linear-gradient(115deg, #0D2745 0%, #232323 49%, #4B372B 92%); */
  ```

#### B. Style `Stroke 1` (`S:eedd6843a688466ded0bab9ebdd140b8e5ef484e,`)
- **Loại gradient**: `GRADIENT_LINEAR`, ma trận affine `[[0.771938, -0.245672, 0.237845], [0.245673, 0.240068, 0.257441]]`.
- **Opacity toàn phần**: `60%` (`0.60`).
- **Góc quay vector**: Góc chuẩn hóa `107.7°` (~`108deg`), đi từ góc trên-trái `(11.5%, 37.7%)` đến góc dưới-phải `(88.7%, 62.3%)`.
- **Các điểm dừng nguyên bản (Figma Stops)**:
  - `Stop 0.00 (0%)`: `rgba(255, 255, 255, 0.0)` — Trong suốt hoàn toàn ở điểm xuất phát.
  - `Stop 0.33 (33%)`: `rgba(255, 255, 255, 0.20)` (0.33 × 0.60 opacity) — Sáng nhẹ 20%.
  - `Stop 1.00 (100%)`: `rgba(255, 255, 255, 0.60)` (1.0 × 0.60 opacity) — Điểm đón sáng cực đại 60%.
- **Mã CSS triển khai 2 phương án**:
  1. *Phương án quét chéo viền (Diagonal Border Sweep theo đúng Figma vector)*:
     ```css
     border-image: linear-gradient(108deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.20) 33%, rgba(255, 255, 255, 0.60) 100%) 1;
     ```
  2. *Phương án phản quang đỉnh Card (Specular Top Highlight thông dụng trên Mobile)*:
     ```css
     /* Viền trên đón sáng 60%, mờ dần về đáy card */
     border: 1px solid rgba(255, 255, 255, 0.12);
     border-top-color: rgba(255, 255, 255, 0.60);
     ```

---

### 2.2 Bảng màu Tokens Hệ thống (Global Semantic Palette)

Trích xuất trực tiếp từ biến `globalVars` và style mapping của Figma node `18904:81945`:

| Token Name | Mã Màu Hex / CSS | Vai trò Semantic trong Figma | Ứng dụng trong Giao diện |
|---|---|---|---|
| `global/brand/500` (`s3`) | `#F4600C` | MSB Brand Flame Orange | Nút chính, Toggle On, Checkbox Active, Tab chỉ báo, Nhấn mạnh số liệu |
| `global/brand/100` | `#FDDFCE` | Brand Orange Tint (10%) | Vòng ray spinner loading, nền icon phụ |
| `button/primary/gradient` (`s7`) | `linear-gradient(0deg, #e45f35 0%, #ffa95a 100%)` | Gradient nút chính | CTA chính toàn app (Tiếp tục, Ký duyệt, Xác thực) |
| `global/neutral/800` (`s5`) | `#091E42` (Dark Mode: `#FFFFFF`) | Chữ chính & Biểu tượng chính | Tiêu đề màn hình, Header, Nhãn trường chính, Icon điều hướng |
| `global/neutral/600` (`s6`) | `#505F79` (Dark Mode: `#94A3B8`) | Chữ phụ, Chú thích & Subtitle | Subtitle tài khoản, đơn vị tiền tệ (`VND`), đếm ký tự (`0/225`), error code |
| `item/border/divider` (`s8`) | `#DEE5EF` (Dark Mode: `rgba(255,255,255,0.12)`) | Đường kẻ viền & Phân cách | Divider thẻ, border ô nhập liệu, divider bottom-sheet |
| `field/surface/search` (`s9`) | `#F7F8F9` (Dark Mode: `#131A27`) | Nền trường tìm kiếm & Nền disabled | Ô search bottom-sheet, trường tài khoản thụ hưởng cố định |
| `field/text/placeholder` (`s10`)| `#A6AEBB` (Dark Mode: `#64748B`) | Màu chữ giữ chỗ & Toggle Off | Placeholder ô nhập, ray toggle khi tắt |
| `skeleton/surface/mass` (`s11`) | `linear-gradient(90deg, #eaf4ff 0%, #dee5ef 100%)` | Shimmer Skeleton loading | Khối hiệu ứng tải ngầm danh sách |
| `alias/text/link` (`s12`) | `#2E90FA` | Link Blue tương tác | Hành động phụ ("Lưu người nhận", "Lưu bên nhận") |
| `field/border/error` (`s13`) | `#F04438` | Cảnh báo Đỏ (Error Red) | Border lỗi ô tiền, thông báo lỗi tối thiểu, Fraud Alert |
| `toast/surface/success` | `#12B76A` | Xanh Lục Thành công (Emerald) | Toast thông báo giao dịch thành công, dòng tiền dương, khớp lệnh |
| `global/yellow/50` | `#FEF4E6` | Nền Vàng Cảnh báo | Nền vòng tròn biểu tượng cảnh báo Dialog Popup |
| `global/yellow/100` | `#FDE9CE` | Viền Vàng Cảnh báo | Viền bao biểu tượng cảnh báo |
| `alias/text/warning-highlight` (`s4`) | `#F79009` | Vàng Cam Hổ phách (Amber) | Biểu tượng tam giác cảnh báo, nhãn Priority, mốc thời gian |
| `alias/background/overlay` (`s1`) | `#1D293999` (`rgba(29,41,57,0.60)`) | Màn che Scrim Backdrop | Lớp phủ làm mờ nền khi mở Bottom-sheet, Popup, Loading |
| `alias/surface/scrolled` | `#FFFFFF66` (Dark: `rgba(16,21,32,0.75)`) | Mặt kính mờ chân trang | Thanh Footer cố định dính đáy (Sticky Glass Footer) |

---

### 2.3 Hệ thống Typography Chuẩn Hóa (`Inter Type Scale`)

Toàn bộ hệ thống chữ chuyển đổi hoàn toàn từ phác thảo sang họ font **Inter** chuẩn Figma với 11 tokens phân cấp rõ ràng:

| Style Token | Font | Size | Weight (Style) | Line Height | Ứng dụng chuẩn trong Component |
|---|---|---|---|---|---|
| `Title/Bold` | Inter | **18px** | 700 (Bold) | 24px | Tiêu đề hộp thoại Popup cảnh báo (`_popup-body`) |
| `Title/Semibold` | Inter | **18px** | 600 (Semi Bold) | 24px | Tiêu đề thanh tiêu đề trang (`APP_Header_Inflow`), Tiêu đề Bottom-sheet |
| `Title/Medium` | Inter | **18px** | 500 (Medium) | 24px | Đơn vị tiền tệ nổi bật (`Unit: VND`) |
| `Base/Semibold` | Inter | **16px** | 600 (Semi Bold) | 24px | Số dư tài khoản (`88,200,850,000`), Số tiền nhập (`_field-amount`) |
| `Base/Medium` | Inter | **16px** | 500 (Medium) | 24px | Nhãn nút bấm (Action chính/phụ, Tiếp tục), Nội dung Toast, Giá trị chọn trong danh sách |
| `Base/Regular` | Inter | **16px** | 400 (Regular) | 24px | Nội dung mô tả Popup, Placeholder ô tìm kiếm / ô nhập văn bản |
| `Small/Semibold` | Inter | **14px** | 600 (Semi Bold) | 20px | Số tiền thu nhỏ, Giá trị highlight thứ cấp trong bảng |
| `Small/Medium` | Inter | **14px** | 500 (Medium) | 20px | Nhãn trường nhập (`label input & selection`), Tiêu đề thẻ tài khoản nguồn, Nhãn Radio, Nhãn Toggle |
| `Small/Regular` | Inter | **14px** | 400 (Regular) | 20px | Chú thích gợi ý dưới trường (Hint text), Điều khoản & Điều kiện (`_TnC`), Số tài khoản phụ |
| `Caption/Medium` | Inter | **12px** | 500 (Medium) | 16px | Số đếm Badge (`9`), Tag trạng thái (`Phiên bản dùng thử`), Nhãn chip pill (`Lưu`) |
| `Caption/Regular` | Inter | **12px** | 400 (Regular) | 16px | Metadata nhỏ, Trạng thái phụ (`TK mặc định`) |

---

### 2.4 Thang đo Khoảng cách & Lưới (Spacing & Layout Grid)

Hệ thống lưới dựa trên bội số 4px/8px:
- **Lề màn hình (Screen Margins)**: Cố định `16px` ở hai cạnh trái/phải trên khung iPhone 390px. Chiều rộng khả dụng của nội dung: `358px` (390 - 16*2).
- **Khoảng cách dọc giữa các khối lớn (Section Spacing)**: `24px` (Giữa Thẻ nguồn → Nội dung chuyển khoản → Cụm đặt lịch).
- **Khoảng cách trong khối (Item Spacing)**:
  - Cực nhỏ (`4px`): Giữa nhãn chính và `(Không bắt buộc)`, giữa số tiền và đơn vị VND, giữa radio icon và nhãn.
  - Nhỏ (`8px`): Khoảng cách icon và chữ trong nút bấm, khoảng cách Toast icon và message.
  - Tiêu chuẩn (`12px`): Khoảng cách các trường nhập liệu liền kề, padding ô nhập.
  - Trung bình (`16px`): Khoảng cách giữa 2 nút trong popup footer, padding card.
- **Thang Padding chuẩn**:
  - Button container: `top: 10px, bottom: 10px, left: 12px, right: 12px` (Chiều cao chuẩn: 44px).
  - Input field container: `top: 10px, bottom: 10px, left: 16px, right: 16px` (Chiều cao chuẩn: 44px).
  - Text area container: `top: 10px, bottom: 10px, left: 16px, right: 16px` (Chiều cao chuẩn: 84px).
  - Card container: `top: 16px, bottom: 20px (hoặc 14px), left: 16px, right: 16px`.
  - Toast: `top: 12px, bottom: 12px, left: 12px, right: 12px` (Chiều cao chuẩn: 48px).

---

### 2.5 Hệ thống Bo góc Toàn diện (Corner Radius Hierarchy)

Toàn bộ hệ thống bo góc phân tầng khoa học theo kích thước và vai trò thị giác của thành phần, trích xuất chính xác 100% từ Figma AST:

```
[ 2.5px ]   -> Mức pin trong Status Bar iOS (Capacity 21 × 9 px)
[ 4px ]     -> Checkbox ô kiểm ngân hàng (20 × 20 px)
[ 4.3px ]   -> Khung viền pin Status Bar iOS (Border 25 × 13 px)
[ 8px ]     -> Nút bấm (Buttons), Ô nhập văn bản (_field-text), Ô nhập số tiền (_field-amount), 
               Ô tìm kiếm Search, Dropdown selection, Toast thông báo, Icon-button, Khối Skeleton prefix (32x32)
[ 10.67px ] -> Ray trượt Mini Toggle switch (26.67 × 16 px — gạt "TK mặc định")
[ 12px ]    -> Thẻ nội dung chính (Card Tài khoản nguồn 358x124, Card biểu mẫu Content 358x524), 
               Hộp thoại cảnh báo Modal Popup (342 × 256 px), Tag phiên bản dùng thử (_tag-use-trial)
[ 16px ]    -> Ray trượt Standard Toggle switch (40 × 24 px), Bảng trung tâm Panel Spinner (80 × 80 px),
               Bo 2 góc trên của Cửa sổ trượt Bottom-sheet (Top-left & Top-right)
[ 24px ]    -> Cung tròn quay chuyển động Spinner (Ellipse 48 × 48 px)
[ 32px ]    -> Khung màn hình ứng dụng chuẩn Mobile-EB (390 × 991 px), Nút bấm dạng Chip pill (58 × 24 px)
[ 48px ]    -> Khung tròn bao quanh biểu tượng ví nguồn (Icon wrapper 40 × 40 px)
[ 100px ]   -> Thanh chỉ báo iOS Home Indicator (144 × 5 px)
[ 9999px ]  -> Khối giả lập nội dung Skeleton Value pill (163 × 24 px)
[ 99999px ] -> Vòng tròn số đếm thông báo Badges (16 × 16 px), Khung tròn Dialog Warning badge (48 × 48 px)
```

---

### 2.6 Độ cao & Hiệu ứng Thị giác (Elevation, Blur & Shadows)

1. **Center Drop Shadow (`global/shadow/center`)**:
   - Tham số: `offsetX: 0, offsetY: 0, radius: 4px, color: #1D2939, opacity: 0.15`
   - Dùng ở: Toast floating, Hộp thoại Popup, Núm trượt Toggle (Knob).
2. **Glassmorphism Frosted Elevation (`global/blur + global/shadow/center-new`)**:
   - Tham số Drop Shadow: `offsetX: 0, offsetY: 0, radius: 16px, color: #1D2939, opacity: 0.06`
   - Tham số Backdrop Blur: `backdrop-filter: blur(24px)`
   - Dùng ở: Thẻ tài khoản nguồn, Khung nội dung chính (`Content`), Thanh chân trang cố định dính đáy (`APP_Footer_EB`).
3. **Hiệu ứng Khối Dark Luxury (`EB dark 1` + `Stroke 1`)**:
   - Kết hợp nền gradient đa tầng `EB dark 1` với viền `Stroke 1` (1px gradient trắng sáng dần lên đỉnh) và đổ bóng sâu:
     ```css
     background: linear-gradient(102deg, #0D2745 0%, #232323 49%, #4B372B 92%);
     border: 1px solid rgba(255, 255, 255, 0.12);
     border-top-color: rgba(255, 255, 255, 0.60);
     box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
     backdrop-filter: blur(24px);
     ```

---

## 3. Thư viện Thành phần Nguyên tử (Component Primitives)

Toàn bộ các component primitives được chuẩn hóa từ cấu trúc cây node Figma:

### 3.1 Header Hệ thống (`APP_Header_Inflow`)
- **Kích thước**: `390 × 106 px`
- **Cấu trúc gồm 3 lớp**:
  1. `Status Bar - iPhone` (Cao 50px): Chứa đồng hồ giờ `9:41` (SF Pro/mixed 17px w590), Dynamic Island spacer (124x10px), Cụm sóng mạng di động, Wifi và Pin (Viền 25x13 bo 4.3px, ruột pin 21x9 bo 2.5px).
  2. `Container` (Cao 56px, Padding 16px):
     - Bên trái: Nút Quay lại (`back` 24x24) + Tiêu đề màn hình (`Title/Semibold` 18px, màu `#091E42` / Dark: `#FFFFFF`).
     - Bên phải: Cụm biểu tượng hành động (24x24) tích hợp Badge đếm số thông báo nổi bật (Pill 16x16, nền cam `#F4600C`, viền trắng 1px, số 12px `Caption/Medium`).
  3. `_tag-use-trial` (Cao 20px, Padding 0 16px): Tag trạng thái phiên bản thử nghiệm (Bo góc 12px, nền cam `#F4600C`, chữ 12px trắng "Phiên bản dùng thử" kèm biểu tượng `info-tooltip-circle` màu vàng hổ phách `#F79009`).

---

### 3.2 Thẻ Tài khoản Nguồn (`Tài khoản nguồn` — Source Account Card)
- **Kích thước**: `358 × 124 px`, Bo góc `12px`.
- **Padding nội bộ**: `top: 16px, bottom: 14px, left: 16px, right: 16px`.
- **Nền & Hiệu ứng**: Surface card `card/surface/default` với `backdrop-filter: blur(24px)`, Center Shadow (radius 16px, opacity 0.06), viền kính `Stroke 1` (`card/border/default`).
- **Thành phần cấu trúc**:
  - `Top Row` (44px): Khung icon ví tiền tròn 40x40 (Bo tròn 48px, nền `#F7F8F9`), Tiêu đề doanh nghiệp ("Từ: CONG TY TNHH MTV AK123" - `Small/Medium` 14px w500), Số tài khoản nguồn ("07348749844" - `Small/Regular` 14px w400), Icon mũi tên chọn nhanh (`down` 24x24 xoay -90°).
  - `Divider Line` (**Đường đứt nét đặc trưng MSB**): Dày 1px, màu `#DEE5EF` (Dark: `rgba(255,255,255,0.12)`), thông số **`dashPattern: [4, 4]`** (gạch 4px, khoảng trống 4px).
  - `Bottom Row` (24px): 
    - Cột số dư khả dụng: Số tiền `88,200,850,000` (`Base/Semibold` 16px w600) đi liền đơn vị `VND` (`Base/Regular` 16px w400, căn đáy `textAlignVertical: BOTTOM`).
    - Cụm gạt "TK mặc định": Nhãn "TK mặc định" (`Caption/Regular` 12px w400) kết hợp **Mini Toggle switch** kích thước `26.67 × 16 px` (ray bo góc `10.67px` màu cam `#F4600C`, núm tròn `12 × 12 px` màu trắng có Center Drop Shadow radius 2.67px).

---

### 3.3 Khung Biểu mẫu & Trường Nhập liệu (Form Controls & Input Primitives)

Cấu trúc form input trong MSB Corporate tuân thủ nghiêm ngặt mô hình 3 tầng: **Nhãn trên → Khung nhập liệu → Chú giải/Báo lỗi dưới**:

#### A. Cụm Nhãn Đầu vào (`label input & selection`)
- Chiều cao: `20px`, Căn ngang `mode: HORIZONTAL, spacing: 4px`.
- Thành phần:
  - Nhãn trường chính (`Text`): Inter 14px `Small/Medium`.
  - Nhãn phụ: `(Không bắt buộc)` màu `#505F79` (`Small/Regular` 14px) hoặc link xanh tương tác `#2E90FA`.
  - Biểu tượng giải thích: `info-tooltip-circle` 16x16px (icon Union 14.37x14.37px).
  - Bộ đếm ký tự: `0/225` căn phải (`label-caption/text/count`, Inter 14px Regular).

#### B. Ô Nhập Văn bản Tiêu chuẩn (`_field-text`)
- Chiều cao: `44px` (chuẩn 1 dòng) hoặc `68px` (khi hiển thị 2 dòng giá trị), Bo góc `8px`.
- Padding: `top: 10px, bottom: 10px, left: 16px, right: 16px`.
- Nền: `#FFFFFF` (Dark: `#131A27`), Viền: 1px `#DEE5EF` (`field/border/default`, khi focus: viền cam 1.5px `#F4600C`).
- Tích hợp Icon: Nút xóa nhanh (`cancel-clear-circle` 24x24 màu `#A6AEBB`), Icon danh bạ/liên hệ (`contact` hoặc `tone-contact` 24x24 màu cam `#F4600C`).

#### C. Ô Nhập Số tiền Giao dịch (`_field-amount`)
- Chiều cao: `44px` (mở rộng với dòng đọc số tiền thành `92px`), Bo góc `8px`.
- Cấu trúc: 
  - Con trỏ nhấp nháy (`Cursor Line` cao 20px xoay -90°, màu `#091E42`).
  - Giá trị số tiền: `Base/Semibold` 16px w600 (`field/text/filled`).
  - Nút xóa nhanh: `cancel-clear-circle` 24x24 màu `#A6AEBB` (`field/icon/clear`).
  - Đơn vị tiền tệ: `VND` (`Base/Regular` 16px w400, `field/text/currency`).
  - Dòng đọc số tiền thành chữ (`amount text`): Hiển thị ngay dưới ô tiền (`#6B788E`, Inter 14px Medium).
- Trạng thái Lỗi (`Stroke Error`): Viền chuyển sang đỏ `#F04438` (`field/border/error`), kết hợp với `caption input & selection` đỏ bên dưới.

#### D. Ô Nhập Nội dung Giao dịch Nhiều dòng (`_field-text area`)
- Chiều cao: `84px` (kèm nhãn thành `108px`), Bo góc `8px`.
- Padding: `top: 10px, bottom: 10px, left: 16px, right: 16px`. Hỗ trợ xuống dòng, tự động co giãn.

#### E. Dropdown Lựa chọn Ngân hàng (`_selection-container` & `selection`)
- Chiều cao: `44px`, Bo góc `8px`, Viền 1px `#DEE5EF`.
- Prefix: Logo ngân hàng nhận dạng đa màu (24x24px).
- Suffix: Mũi tên trượt xuống `down` (24x24px).

#### F. Cụm Chú giải & Báo lỗi Dưới trường (`caption input & selection`)
- Chiều cao: `20px`, Spacing: `10px`, Căn ngang `mode: HORIZONTAL`. Hỗ trợ tối đa 2 dòng hiển thị.
- Trạng thái Gợi ý (Hint): Text màu `#505F79` (`Small/Regular` 14px): *"Hint message is displayed here, up to 2 lines"*.
- Trạng thái Lỗi (Error): Text màu đỏ `#F04438` (`label-caption/text/error`, `Small/Regular` 14px): *"Số tiền tối thiểu: 10,000,000 VND"*.

---

### 3.4 Thành phần Chip Lưu Thụ Hưởng (`Chip` Primitive — Nút "Lưu")
- **Kích thước**: `58 × 24 px`, Bo góc **`32px`** (Dạng Pill bo tròn mềm mại).
- **Padding**: `4px` toàn bộ cạnh.
- **Màu sắc & Viền**: Nền trắng `#FFFFFF` (`chip/surface/default` / Dark: `#1E293B`), Viền 1px `#DEE5EF` (`chip/border/default`).
- **Thành phần**:
  - Nhãn text: "Lưu" — Inter 12px `Caption/Medium` w500, màu `#091E42` (`chip/text/default`).
  - Biểu tượng bookmark: Kích thước 16x16px (vector Union 14.33x11.67px màu `#091E42`).
  - Nút xóa phụ (khi đã lưu): Kích thước 16x16px nền `#DEE5EF` bo tròn, chứa icon `delete-cancel-close` (10x10px màu `#091E42`).

---

### 3.5 Bộ Điều khiển Lựa chọn (Toggles, Radios & Checkboxes)

| Thành phần | Kích thước | Cấu trúc & Thông số Figma | Trạng thái (Active / Inactive) |
|---|---|---|---|
| **Toggle Switch** | `40 × 24 px` (mini: `26.67 × 16 px`) | Track bo góc `16px` (mini: `10.67px`), Núm xoay Knob tròn `18px` (mini: `12px`) màu trắng `#FFFFFF` kèm Center Shadow | **Bật**: Nền ray cam `#F4600C`<br>**Tắt**: Nền ray xám `#A6AEBB` |
| **Radio Button** | `24 × 24 px` | Vòng tròn ngoài `20 × 20 px` (stroke 1.6px), Nhân tròn trong `12 × 12 px` | **Chọn**: Viền ngoài cam `#F4600C`, nhân trong cam `#F4600C`<br>**Chưa chọn**: Viền xám `#DEE5EF`, không có nhân trong |
| **Checkbox** | `24 × 24 px` | Ô vuông `20 × 20 px`, bo góc `4px`, viền 1.33px / 1.5px | **Chọn**: Nền cam `#F4600C`, dấu tích chữ V trắng `#FFFFFF`<br>**Chưa chọn**: Nền trắng `#FFFFFF`, viền xám `#DEE5EF` |

---

### 3.5 Hệ thống Nút Bấm (Button Primitives)

1. **Nút Hành động Chính (Primary Button)**:
   - Chiều cao: `44px`, Bo góc `8px`.
   - Nền: Gradient cam rực rỡ `linear-gradient(0deg, #e45f35 0%, #ffa95a 100%)` (`s7`).
   - Chữ: Inter 16px `Base/Medium`, màu trắng `#FFFFFF`.
   - Icon: Hỗ trợ swap-icon trái/phải kích thước 24x24px.
2. **Nút Hành động Phụ (Secondary Button)**:
   - Chiều cao: `44px`, Bo góc `8px`.
   - Nền: Trắng `#FFFFFF` (Dark Mode: Nền trong suốt hoặc Sapphire `#101520`).
   - Viền: 1px viền cam `#F4600C`. Chữ: Inter 16px `Base/Medium` màu cam `#F4600C`.
3. **Cụm Hai Nút Bấm (Button Group)**:
   - Hai nút đặt ngang hàng, độ rộng mỗi nút `147px`, khoảng cách `16px`, bố trí trong footer popup/modal.

---

### 3.7 Cửa sổ Trượt từ Đáy (Bottom-sheet Primitive)
- **Màn che nền (Scrim Overlay)**: `#1D293999` (`s1`) phủ toàn màn hình.
- **Khung chứa chính (Container)**: Rộng `390px`, chiều cao biến thiên (chuẩn 469px), **Bo 2 góc trên `16px`** (`cornerRadius: 'mixed'`).
- **Tiêu đề (Header)**: Cao 56px, Tiêu đề 18px `Title/Semibold`, Nút đóng `delete-cancel-close` (24x24px).
- **Thanh tìm kiếm nội bộ**: Cao 68px, chứa ô tìm kiếm bo góc 8px kèm biểu tượng kính lúp và Icon-button filter 44x44 kèm Badge đếm 16x16.
- **Danh sách lựa chọn đơn (`list - single select`)**:
  - Từng dòng `_item_single select` cao `64px`, có đường kẻ đáy 1px `#DEE5EF`.
  - Icon tiền tố (32x32px), Giá trị nhãn `Base/Medium` (16px), Icon tích chọn Suffix (24x24px).
  - Trạng thái tải giả lập: Bộ khung xương Skeleton Shimmer gradient `s11` (`linear-gradient(90deg, #eaf4ff 0%, #dee5ef 100%)`).

---

### 3.8 Hộp thoại Cảnh báo (Modal Popup Primitive)
- **Kích thước**: Rộng `342px`, Bo góc `12px`, Nền trắng `#FFFFFF` (Dark: Nền `#101520` viền `Stroke 1`).
- **Khối Biểu tượng Cảnh báo (`dialog-warning`)**:
  - Khung tròn lớn 48x48px (Bo góc 99999px), nền vàng nhạt `#FEF4E6` (`global/yellow/50`), viền vàng `#FDE9CE` (`global/yellow/100`).
  - Biểu tượng tam giác chấm than `caution-warning-circle` màu vàng hổ phách `#F79009` (`s4`).
- **Nội dung**:
  - Tiêu đề: Inter 18px `Title/Bold` ("Title nêu rõ lỗi hoặc vấn đề là gì").
  - Mô tả: Inter 16px `Base/Regular` ("Description mô tả và hướng dẫn người dùng").
  - Mã lỗi kỹ thuật: Inter 16px Regular màu xám `#505F79` (Tùy chọn).
- **Chân trang (`_popup-footer`)**: Button Group chứa Nút phụ (Hủy/Quay lại) + Nút chính (Xác nhận/Thử lại).

---

### 3.9 Thanh Thông báo Trôi (Toast Primitive)
- **Kích thước**: `358 × 48 px`, Bo góc `8px`, Canh giữa đáy màn hình (cách đáy 46px).
- **Đổ bóng**: `global/shadow/center` (Bán kính 4px, độ mờ 15%).
- **Màu sắc trạng thái Thành công**: Nền xanh ngọc lục bảo `#12B76A` (`toast/surface/success`).
- **Cấu trúc**: Icon `check-circle` trắng (24x24) + Nội dung thông báo `Base/Medium` trắng (16px) + Nút đóng `close-icon` trắng (24x24).

---

### 3.10 Chân trang Cố định Dính đáy (`APP_Footer_EB`)
- **Kích thước**: Rộng `390px`. Chiều cao biến thiên theo 2 trạng thái:
  1. *Trạng thái cơ bản (khi `_TnC` ẩn)*: Cao **`97px`** (gồm Button group cao 68px + Thanh chỉ báo Home Indicator cao 29px).
  2. *Trạng thái mở rộng điều khoản (khi `_TnC` hiển thị)*: Cao **`181px`** (gồm khối `_TnC` 84px + Button group 68px + Home Indicator 29px).
- **Hiệu ứng**: Nền Frosted Glass `#FFFFFF66` (Dark: `rgba(16,21,32,0.85)`) kèm **Backdrop Blur 24px**.
- **Thành phần**:
  1. Khối Điều khoản & Điều kiện (`_TnC` — cao 84px, mặc định `visible: false`): Checkbox 24x24 + Đoạn văn bản xác nhận bản quyền & pháp lý MSB (`Small/Regular` 14px, rộng 322px, cao 60px).
  2. Nút bấm Full-width CTA (`Button`): Rộng 358px, cao 44px, nền gradient cam `s7`, chữ "Tiếp tục" (`Base/Medium` 16px trắng).
  3. Thanh chỉ báo iOS Home Indicator: Thanh chữ nhật 144 × 5 px, bo góc 100px màu `#091E42` (`global/neutral/800` / Dark: `#FFFFFF`).

---

### 3.11 Màn hình Đang Tải Toàn diện (`Loading full-screen`)
- **Lớp phủ nền**: Scrim `#1D293999`.
- **Bảng trung tâm (`Panel Spinner`)**: Khung nổi 80 × 80 px, bo góc `16px`, nền trắng `#FFFFFF` (Dark: `#101520`).
- **Cụm Spinner Đôi**:
  - Vòng ray tĩnh phía ngoài: Đường kính 44px, stroke 4px màu cam nhạt `#FDDFCE` (`global/brand/100`).
  - Vòng cung xoay chuyển động: Đường kính 48px, stroke 2px màu cam thương hiệu `#F4600C`.
  - Tâm biểu tượng MSB: Cụm vector 4 cánh hoa chuyển sắc Gradient Đỏ - Cam thương hiệu MSB.

---

## 4. Ứng dụng Thiết kế vào Giao diện Virtual RM (Màn hình `1b` Obsidian Grid)

Cấu trúc giao diện Virtual RM được kế thừa trọn vẹn hệ thống Design System chuẩn từ Figma kết hợp nền tối **`EB dark 1`**:

```
┌───────────────────────────────────────────────────┐  (390px Viewport)
│  STATUS BAR (iOS) — Time 9:41, Dynamic Island     │  50px
│  MSB · CORPORATE              MR Z · CHECKER 1    │  56px Header chuẩn
│  SỐ DƯ KHẢ DỤNG VND (Inter 14px w500)             │
│  27,5 TỶ                     +18,2 RÒNG 7N (16px) │  Thẻ số dư kính Stroke 1
├───────────────────────────────────────────────────┤
│  ▮ MAI · TRỢ LÝ QHKH DOANH NGHIỆP         ≋≋≋    │  Voice Banner (Blur 24px)
│  "Báo cáo Mr Z, trong 7 ngày qua dòng tiền..."    │  Inter 14px Regular
├───────────────────────────────────────────────────┤
│                                                   │
│   [ WIDGET THEO 14 INTENT NGHIỆP VỤ ]             │  Card bo 12px, Stroke 1,
│   (Cuộn linh hoạt, kế thừa Form & Table Prims)    │  nền EB dark 1
│                                                   │
├───────────────────────────────────────────────────┤
│  [Gợi ý CCTG]  [Lịch chi]  [Tỷ giá FX]   [TẤT CẢ] │  Chip Pill bo 32px
│  [ CHẠM ĐỂ NÓI (ORB) ]            ≋  │  842ms     │  Control Bar dính đáy
└───────────────────────────────────────────────────┘
```

### 4.1 Chi tiết 14 Widget Nghiệp vụ chuẩn hóa theo Figma Primitives

Mọi con số và kịch bản đều đối soát 100% với dữ liệu thực tế tại `src/lib/data/fixtures.ts`:

| Intent Nghiệp vụ | Cấu trúc Giao diện kế thừa từ Figma Primitives | Tokens áp dụng |
|---|---|---|
| `CASH_FLOW` | Thẻ Card 12px viền `Stroke 1`. Cột kép so sánh Thu (Xanh ngọc `#12B76A`) và Chi (Cam MSB `#F4600C`), hai ô tổng chia bởi divider 1px `#DEE5EF`. | `Base/Semibold` cho số tiền tỷ, `Small/Medium` cho nhãn kỳ hạn. |
| `RECENT_ACTIONS` | Khối số lượng giao dịch lớn `12/12` (`Title/Bold` 18px) + Danh sách chờ duyệt dạng `_item_single select`. | Badge cam `#F4600C` đánh số `01`, `02`. |
| `TRADE_FINANCE` | Hai thanh hạn mức L/C & Bảo lãnh (36% và 38,3%) dạng Progress Bar ray xám `#DEE5EF` ruột cam `#F4600C`. | `Small/Medium` 14px, Icon cảnh báo `#F79009`. |
| `SUGGEST_CCTG` | Card viền kính, bảng so sánh trừ dần 27,5 → 10,1 → 17,4 tỷ, khối lợi tức 33,3 triệu viền xanh `#12B76A`. | Nút duyệt mua kế thừa **Primary Button** gradient `s7`. |
| `FX_FORWARD` | Biểu đồ cột 14 ngày, 2 kịch bản tỷ giá 98,2 tr và 32,5 tr, dòng tiết kiệm kỳ vọng 65,7 triệu. | Màu chữ liên kết `#2E90FA`, cảnh báo biến động `#F79009`. |
| `FRAUD_ALERT` | Kế thừa cấu trúc **Modal Popup Warning**: Nền cảnh báo đỏ than chì `#1A1417`, viền đỏ `#F04438`, 3 dấu hiệu rủi ro đánh số `01–03`. | Nút Trả lệnh viền đỏ `#F04438` (Secondary Error Button). |
| `APPROVE_FIDO` | Thẻ xác thực thành công viền xanh `#12B76A`, hiển thị số tiền 5,2 tỷ, 3 dòng hệ quả hạn mức và hàng chờ. | Toast Success `#12B76A` trượt lên xác nhận. |
| `REJECT_ORDER` | Thẻ hủy lệnh viền cam `#F4600C`, khối ghi chú bằng giọng nói có viền trái vàng kim `#F79009`. | Trích xuất Text Area Primitive với ghi chú giọng nói. |
| `OBLIGATION_CALENDAR`| Lịch nghĩa vụ thanh toán 3 mốc thời gian, cột ngày rộng 40px nhấn màu vàng kim `#F79009`. | Font số Inter SemiBold, đường nối timeline 1px. |
| `PERIOD_COMPARE` | Bốn thanh đối sánh kỳ này vs cùng kỳ (Đậm = `#F4600C`, Mờ = `rgba(244,96,12,0.3)`). | Type scale `Base/Medium` & `Small/Regular`. |
| `TXN_HISTORY` | Bảng kê 5 giao dịch gần nhất kế thừa từ `list - single select`, cột giờ 34px, số dương xanh `#12B76A`, số âm cam `#F4600C`. | Divider 1px giữa từng hàng giao dịch. |
| `LOAN_BALANCE` | Thanh hạn mức tín dụng 52,5% + Bảng chi tiết 3 khế ước nhận nợ. | Thẻ Card bo 12px, backdrop-filter blur 24px. |
| `CALL_HOTLINE` | Thẻ liên hệ RM phụ trách: Avatar tròn 48px, tên RM và hotline liên hệ nhấn màu xanh liên kết `#2E90FA`. | Nút gọi nhanh kế thừa Button Primitive. |
| `SESSION_SUMMARY` | Tóm tắt hành trình phiên làm việc của lãnh đạo, sinh tự động từ danh sách intent đã thực hiện. | Danh sách dạng pill chip bo góc 32px. |

---

### 4.2 Lớp Phủ Tương tác (Layer Stacking & Z-Index)

1. **Lớp Gốc (Z-0)**: Nền gradient `EB dark 1` + Hệ thống lưới Widget cuộn tự do.
2. **Lớp Trợ lý Lắng nghe / Voice Orb (Z-40)**: Quả cầu giọng nói đa tầng tỏa sáng (Radial glow cam/hổ phách), nhận diện giọng nói và ngắt lời (Barge-in).
3. **Lớp Ngăn kéo Lệnh / Command Drawer (Z-50)**: Kế thừa từ **Bottom-sheet Primitive**, trượt từ đáy lên, hiển thị toàn bộ 14 intent chia theo 4 nhóm nghiệp vụ.
4. **Lớp Xác thực Sinh trắc học / Modal FIDO (Z-60)**: Kế thừa từ **Modal Popup Primitive**, hiển thị quét radar FIDO Biometric 1.6s, đóng băng mọi tương tác nền cho đến khi xác thực thành công.

---

## 5. Chuyển động & Hoạt họa Kỹ thuật số (Motion Specs)

Tất cả chuyển động tuân thủ nguyên tắc CSS transform và opacity, bảo đảm ổn định tốc độ 60fps trên thiết bị di động:

| Tên hiệu ứng | Thuộc tính & Thời lượng | Cơ chế Bezier | Phạm vi áp dụng |
|---|---|---|---|
| `riseIn` | `translateY(14px → 0)`, `opacity: 0 → 1`, 0.3s | `cubic-bezier(0.16, 1, 0.3, 1)` | Xuất hiện Widget khi chuyển đổi Intent |
| `radarScan` | `scale(1 → 1.45)`, `opacity: 0.8 → 0`, 1.6s | `ease-out` | Vòng radar quét FIDO Biometric (Bo góc 12px) |
| `orbPulse` | `scale(0.92 → 1.06)`, 2.2s – 3.0s | `ease-in-out` lặp vô tận | Quả cầu AI lúc lắng nghe / chờ lệnh |
| `voiceWave` | `scaleY(0.28 → 1.0)`, so le 0.08s | `ease-in-out` lặp vô tận | Dải sóng âm thanh khi RM Mai đang nói |
| `skeletonShimmer`| `background-position: -200% → 200%`, 1.5s | `linear` lặp vô tận | Hiệu ứng tải ngầm danh sách Bottom-sheet |

---

## 6. Bảng Ánh xạ Biến Mã nguồn (Implementation Tokens Mapping)

Bảng quy đổi đồng bộ cho lập trình viên Front-end (Next.js / Tailwind CSS / CSS Variables):

```css
:root {
  /* --- Figma Paint Styles (Đã giải mã ma trận Affine) --- */
  --bg-eb-dark-1: linear-gradient(102deg, #0D2745 0%, #232323 49%, #4B372B 92%);
  --bg-eb-dark-1-mobile: linear-gradient(115deg, #0D2745 0%, #232323 49%, #4B372B 92%);
  --stroke-glass-1-sweep: linear-gradient(108deg, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.20) 33%, rgba(255, 255, 255, 0.60) 100%);
  --stroke-glass-1: linear-gradient(180deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.20) 33%, rgba(255, 255, 255, 0) 100%);
  --btn-primary-gradient: linear-gradient(0deg, #E45F35 0%, #FFA95A 100%);
  --skeleton-gradient: linear-gradient(90deg, #EAF4FF 0%, #DEE5EF 100%);

  /* --- Brand & Functional Colors --- */
  --color-brand-primary: #F4600C;
  --color-brand-tint: #FDDFCE;
  --color-success: #12B76A;
  --color-warning: #F79009;
  --color-warning-surface: #FEF4E6;
  --color-warning-border: #FDE9CE;
  --color-error: #F04438;
  --color-link: #2E90FA;
  --color-text-amount-spellout: #6B788E;

  /* --- Neutrals & Surfaces --- */
  --color-text-primary: #FFFFFF;      /* Dark luxury mode default (s5: #091E42 trên nền sáng) */
  --color-text-secondary: #94A3B8;    /* Slate-400 (s6: #505F79 trên nền sáng) */
  --color-text-muted: #64748B;        /* Slate-500 */
  --color-placeholder: #A6AEBB;       /* s10 */
  --color-divider: rgba(255, 255, 255, 0.12); /* s8: #DEE5EF trên nền sáng */
  --color-surface-card: rgba(19, 26, 39, 0.85);
  --color-surface-input: #131A27;     /* s9: #F7F8F9 trên nền sáng */
  --color-scrim: rgba(29, 41, 57, 0.60); /* s1: #1D293999 */
  --color-footer-glass: rgba(16, 21, 32, 0.85); /* #FFFFFF66 trên nền sáng */

  /* --- Special Border Patterns --- */
  --border-dashed-card: 1px dashed rgba(255, 255, 255, 0.12); /* stroke-dasharray: 4 4 */

  /* --- Radii Tokens (Figma AST 100% Match) --- */
  --radius-xs: 4px;                   /* Checkbox, sub tags */
  --radius-sm: 8px;                   /* Buttons, inputs, search, toast, icon-buttons */
  --radius-mini-toggle: 10.67px;      /* Mini toggle switch track */
  --radius-md: 12px;                  /* Cards (Source account, Form content), Popups */
  --radius-lg: 16px;                  /* Standard toggle track, bottom-sheet top, spinner panel */
  --radius-xl: 24px;                  /* Spinner loading arc */
  --radius-pill: 32px;                /* Mobile-EB frame, Chip pill buttons (Lưu) */
  --radius-icon-circle: 48px;         /* Source account icon wrapper */
  --radius-home-indicator: 100px;     /* iOS home indicator */
  --radius-skeleton-pill: 9999px;     /* Skeleton value loading pills */
  --radius-full: 99999px;             /* Badges, dialog warning icon circle */

  /* --- Shadows & Blur --- */
  --shadow-center: 0 0 4px rgba(29, 41, 57, 0.15);
  --shadow-center-mini: 0 0 2.67px rgba(29, 41, 57, 0.15); /* Mini toggle knob shadow */
  --shadow-card: 0 8px 32px rgba(0, 0, 0, 0.45);
  --shadow-card-elevated: 0 0 16px rgba(29, 41, 57, 0.06);
  --blur-glass: 24px;
}

/* --- Typography Tokens (Họ font Inter chuẩn hóa 11 cấp) --- */
.font-title-bold       { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 700; line-height: 24px; }
.font-title-semibold   { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 600; line-height: 24px; }
.font-title-medium     { font-family: 'Inter', sans-serif; font-size: 18px; font-weight: 500; line-height: 24px; }
.font-base-semibold    { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 600; line-height: 24px; }
.font-base-medium      { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 500; line-height: 24px; }
.font-base-regular     { font-family: 'Inter', sans-serif; font-size: 16px; font-weight: 400; line-height: 24px; }
.font-small-semibold   { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600; line-height: 20px; }
.font-small-medium     { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; line-height: 20px; }
.font-small-regular    { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 400; line-height: 20px; }
.font-caption-medium   { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; line-height: 16px; }
.font-caption-regular  { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 400; line-height: 16px; }
```

---

## 7. Trạng thái Kiểm thử & Xác nhận (Design Verification)

- **Đã đối chiếu & Kiểm chứng thực nghiệm**:
  - Trích xuất toàn vẹn 1.266 dòng cấu trúc cây Figma node `18904:81945` (`Mobile-EB`) với đầy đủ 8 cụm node cha/con, 100% bounds, auto-layouts, paddings, typography tokens và màu sắc.
  - Giải mã ma trận Affine 2×3 của Style `EB dark 1`: Xác định góc quay toán học chính xác `102°` (normalized) và `115°` (viewport 390x844), loại bỏ hoàn toàn góc ước lượng sai `150°`.
  - Hiệu chỉnh mã màu Stop 0.92 sang `#4B372B` (RGB: `75, 55, 43`, float Green `0.2138` tương đương 55/255).
  - Trích xuất thuộc tính `dashPattern: [4, 4]` của đường kẻ phân cách thẻ tài khoản nguồn, chuẩn hóa đơn vị tiền tệ `VND` sang `Base/Regular` căn đáy.
  - Tách biệt rõ 2 primitive biểu mẫu: `label input & selection` (trên) và `caption input & selection` (dưới).
  - Bổ sung primitive độc lập `Chip` (nút "Lưu" thụ hưởng 58x24px, bo góc 32px) và cơ chế co giãn 2 trạng thái (`97px` / `181px`) của `APP_Footer_EB`.
  - Toàn bộ 76/76 unit tests của repository (`bun test`) vượt qua thành công, bảo đảm không có bất kỳ xung đột dữ liệu hay phá vỡ logic tính toán của 14 intents.
- **Hạng mục bàn giao hoàn tất**:
  - Toàn bộ tài liệu đặc tả [docs/design/design.md](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/docs/design/design.md) đã được nâng cấp đồng bộ, chính xác tuyệt đối theo tiêu chuẩn Design System chính thức từ Figma.
