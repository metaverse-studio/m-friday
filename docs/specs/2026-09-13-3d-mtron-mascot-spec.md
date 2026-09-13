# Đặc tả Kỹ thuật: 3D Linh vật M-Tròn (Procedural Mascot 3D Virtual RM Friday)

- **Ngày lập**: 2026-09-13
- **Tác giả**: Antigravity Pair Programmer
- **Tham chiếu hình ảnh**: `/Users/bez/.gemini/antigravity/brain/357de146-647d-4632-9726-6646a006fdc5/.user_uploaded/media_1789314714762.png`
- **Bộ kỹ năng ứng dụng**: `3dviz-pro-max`
- **Trạng thái**: Bản đặc tả chính thức

---

## 1. Bối cảnh & Mục tiêu

Dự án nâng cấp giao diện Hologram RM Friday từ mô hình hình học trừu tượng (bát diện wireframe) sang **Linh vật M-Tròn 3D chân thực** theo nguyên mẫu thiết kế của MSB Digital Bank:
- Thân hình cầu tròn màu cam MSB bóng bẩy với các đường vân vi mạch điện tử phát sáng.
- Mắt kính Visor công nghệ cao (HUD glass viền kim loại bạc, hiển thị đồng tử mắt to tròn dễ thương kết hợp giao diện HUD quét dữ liệu).
- Logo MSB phát sáng trên trán.
- Áo choàng đỏ siêu nhân (cape) bay phấp phới phía sau với mô phỏng sóng vải mềm mại.
- Đôi găng tay và đôi giày robot kim loại bạc công nghệ cao.
- Hiệu ứng hologram, đĩa phát quang bệ đỡ và đám mây photon dữ liệu cyber.
- Đáp ứng đầy đủ các trạng thái tương tác: IDLE, LISTENING, THINKING, SPEAKING, ALERT (FRAUD_ALERT) và tương tác kéo xoay 360 độ bằng chuột / cảm ứng.

---

## 2. Chi tiết Cấu trúc Hình học & Vật liệu 3D (Procedural 3D Model)

### 2.1. Thân hình cầu (M-Tròn Body Sphere)
- **Hình học**: `SphereGeometry(radius: 0.82, widthSegments: 48, heightSegments: 48)`.
- **Vật liệu**: `MeshPhysicalMaterial`:
  - `color`: MSB Brand Orange (`#f4600c` / `#ff5500`).
  - `roughness`: 0.22, `metalness`: 0.12.
  - `clearcoat`: 0.95, `clearcoatRoughness`: 0.15 (tạo lớp men bóng phản chiếu ánh sáng như đồ chơi công nghệ cao / robot bóng bẩy).
  - `emissive`: `#331100`, tăng sáng khi nói hoặc kích hoạt trạng thái.
- **Vi mạch điện tử (Circuit Traces Texture)**:
  - Sinh qua procedural Canvas 2D Texture (512x256), vẽ các đường vi mạch vàng cam (`#ffd060`) phân nhánh mềm mại ở hai bên hông và bụng dưới với các nút tròn vi mạch phát sáng.
- **Miệng cười dễ thương**:
  - Vẽ trực tiếp dưới viền visor dạng đường cong chibi `:3` hoặc nụ cười thân thiện.

### 2.2. Kính Visor & Đồng tử mắt (Cyber HUD Visor & Kawaii Eyes)
- **Khung viền kính (Visor Frame)**:
  - Viền kim loại bạc bao quanh vùng mắt, cong ôm sát mặt cầu (`MeshStandardMaterial`, `color: 0xdce5ef`, `metalness: 0.92`, `roughness: 0.18`).
  - Hai khớp xoay tai hình trụ tròn ở hai bên thái dương với nút đèn viền phát sáng cyan/gold.
- **Mặt kính HUD (Visor Glass)**:
  - Vỏ kính bán trong suốt ánh cyan/xanh điện tử (`MeshPhysicalMaterial`, `transmission: 0.45`, `opacity: 0.55`, `color: 0x3fd0ff`, `roughness: 0.08`, `depthWrite: false`).
- **Đồng tử mắt to tròn (Animated Eyes & HUD Texture)**:
  - Canvas 2D động (512x256) chiếu lên màn hình visor:
    - 2 mắt to tròn anime chibi: tròng đen/xanh thẫm, đốm sáng phản quang kép (1 đốm to góc trên trái, 1 đốm nhỏ góc dưới phải).
    - Họa tiết HUD: khung ngắm mục tiêu `[ + ]`, lưới dữ liệu vi mạch, vòng tròn radar quét.
    - Chớp mắt tự nhiên (blink cycle) mỗi 3-4 giây.
    - Đồng tử liếc nhìn theo con trỏ chuột/hướng tương tác.

### 2.3. Logo MSB phát sáng trên trán (Glowing MSB Emblem)
- **Vị trí**: Trán trên mặt cầu (`Y: ~0.60`, `Z: ~0.64`).
- **Cấu tạo**:
  - Chấm tròn bên trái: `SphereGeometry(0.055)`.
  - Cánh hoa / chữ M cách điệu: 2 khối trụ bo tròn / capsule nghiêng tạo hình biểu tượng MSB.
- **Vật liệu**: `MeshBasicMaterial` màu trắng tinh khiết (`0xffffff`), phát sáng rực rỡ với hiệu ứng hào quang (`emissiveIntensity: 1.5`).

### 2.4. Áo choàng đỏ siêu nhân (Superhero Cape)
- **Vị trí & Neo**: Neo tại phần lưng trên (`Y: 0.35`, `Z: -0.62`), 2 khuy cài kim loại bạc/vàng.
- **Hình học**: `PlaneGeometry(width: 1.9, height: 1.6, 24, 24)`.
- **Mô phỏng sóng vải (Cloth Wave Simulation)**:
  - Trong animation loop, cập nhật từng vertex dựa trên hàm sóng hài:
    $Z_{fold}(x, y, t) = -0.55 - d_{neck} \cdot 0.45 + \sin(x \cdot 4.5) \cdot 0.1 + \sin(t \cdot 3.8 + y \cdot 4.0 - x \cdot 1.5) \cdot A_{wave} \cdot (1 - y_{norm})$
  - Tạo nếp gấp rủ tự nhiên kết hợp hiệu ứng phấp phới theo gió sống động.
- **Vật liệu**: `MeshPhysicalMaterial` đỏ tươi MSB (`#d41824`), hai mặt (`DoubleSide`), `clearcoat: 0.4`, `roughness: 0.38`.

### 2.5. Đôi găng tay robot kim loại bạc (Cyber Hands / Gauntlets)
- **Bố trí**: Lơ lửng tự do hai bên hông với tư thế siêu anh hùng.
  - Tay trái: Tạo dáng giơ ngón chỉ hướng lên hoặc vẫy chào thân thiện.
  - Tay phải: Nắm đấm siêu nhân hoặc mở nhẹ linh hoạt.
- **Chi tiết**: Cổ tay kim loại có viền cam MSB, lòng bàn tay bo tròn, các khớp ngón tay robot mạ bạc sáng bóng (`metalness: 0.94`, `roughness: 0.16`).
- **Chuyển động**: Nhấp nhô nhịp nhàng theo nhịp thở lơ lửng, tạo cử chỉ khi nói chuyện.

### 2.6. Đôi chân / giày robot kim loại bạc (Cyber Boots / Feet)
- **Bố trí**: Nằm dưới thân cầu (`Y: -0.80`, `X: ±0.34`, `Z: 0.15`).
- **Cấu tạo**: Khớp cổ chân hình cầu, thân giày robot phân tầng mạ bạc, đế giày có dải đèn phản lực phát quang cam MSB (`#f4600c`).
- **Chuyển động**: Đung đưa nhịp nhàng theo chuyển động lơ lửng.

---

## 3. Hệ thống Chiếu sáng & Môi trường Hologram

- **Key Light**: `DirectionalLight` (màu trắng ấm, cường độ 1.8) góc trên phải `(2, 3, 3)`.
- **Fill Light**: `DirectionalLight` (màu cyan `#3fd0ff`, cường độ 0.8) góc trái `(-2, 1, 2)`.
- **Rim Light**: `DirectionalLight` (màu cam vàng `#ff6600`, cường độ 1.4) phía sau `(0, 1.5, -2.5)` làm nổi bật viền áo choàng và cạnh kim loại.
- **Base Projector**: Đĩa phát sáng 2 tầng ở chân (`Y = -1.60`) xoay tròn tạo cảm giác hologram được chiếu từ bệ công nghệ.
- **Photon Particles**: Vòng xoáy 120 hạt bụi điện tử chuyển động quỹ đạo quanh linh vật.

---

## 4. Quản lý Trạng thái & Tương tác

| Trạng thái | Biểu hiện M-Tròn | Đèn & HUD | Áo choàng & Tay chân |
| :--- | :--- | :--- | :--- |
| **IDLE** | Lơ lửng êm ái, nhấp nhô nhẹ | HUD cyan, mắt chớp tự nhiên | Áo phấp phới nhẹ, tay chân thả lỏng |
| **LISTENING** | Nghiêng người về phía trước, mắt mở to chú ý | Hào quang vàng MSB, vòng radar mở rộng | Tay hướng nhẹ về phía trước, chú tâm lắng nghe |
| **THINKING** | Đầu nghiêng tò mò, mắt liếc nhẹ góc trên | HUD quét thanh laser, hạt xoay nhanh | Tay chạm nhẹ cằm suy nghĩ |
| **SPEAKING** | Nhún nhảy nhẹ theo nhịp điệu giọng nói | Sóng âm HUD nhấp nhô, miệng mỉm cười | Tay cử động diễn thuyết |
| **ALERT** | Rung giật vi mô cảnh báo | HUD chuyển đỏ cam, biểu tượng `[! CAUTION !]` | Toàn thân căng thẳng, áo giật mạnh |

---

## 5. Tương thích & Tiêu chuẩn

- Kế thừa toàn bộ giao diện điều khiển hiện tại của `HologramRM.tsx` (kích thước `size`, cờ `interactive`, sự kiện `onClick`).
- Tương thích 100% với Next.js 16 + React 19 + Turbopack.
- Hoàn toàn vượt qua kiểm thử `hardcoded-numbers.test.ts`.
