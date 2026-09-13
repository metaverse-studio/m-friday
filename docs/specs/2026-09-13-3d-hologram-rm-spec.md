# Đặc tả Kỹ thuật: 3D Hologram Virtual RM Friday (MSB Business)

- **Ngày ban hành**: 2026-09-13
- **Tác giả**: Friday Architecture Team
- **Tiêu chuẩn áp dụng**: `3dviz-pro-max` (look-profile: `knowledge.style-holographic`)
- **Trạng thái**: Bản thảo đề xuất (Draft)

---

## 1. Mục tiêu & Bối cảnh

Nâng cấp giao diện trực quan của trợ lý ảo **Friday** (Virtual RM) từ biểu tượng 2D phẳng (`Orb.tsx`) thành mô hình **3D Hologram (Synthetic Financial Core)** tương tác thời gian thực bằng WebGL (Three.js).
Hologram đóng vai trò là đại diện thị giác trung tâm của Friday, phản hồi trạng thái hoạt động của hệ thống (Nghe, Nghĩ, Nói, Cảnh báo rủi ro) và cho phép CFO/Kế toán trưởng tương tác trực tiếp qua cử chỉ chuột, cảm ứng và âm thanh.

---

## 2. Thiết kế Hình thái Visual (Geometry & Layers)

### 2.1 Cấu trúc Hình học
1. **Emitter Base (Bệ phát quang)**:
   - Một đĩa tròn đa giác mờ nằm ở đáy (`CylinderGeometry` dẹt hoặc `RingGeometry`), phát ánh sáng uplight hướng lên.
   - Thể hiện sự neo đậu vật lý của hình chiếu trong không gian buồng lái (Cockpit).
2. **Central Financial Core (Lõi Bát diện MSB)**:
   - Dựng từ `OctahedronGeometry` hoặc `IcosahedronGeometry` tinh chỉnh theo tỷ lệ lăng kính.
   - Cấu tạo 2 lớp:
     - *Lớp khung dây (Wireframe Mesh)*: `MeshBasicMaterial` màu Cyan lượng tử (`#3FD0FF`), `wireframe: true`.
     - *Lớp lõi năng lượng (Inner Energy Core)*: Khối đa diện nhỏ hơn bên trong, màu vàng kim MSB (`#E2B357`), `transparent: true`, `opacity: 0.65`, `blending: AdditiveBlending`.
3. **Triple Orbital Rings (3 Vòng Quỹ đạo Dữ liệu)**:
   - Dựng từ `TorusGeometry` siêu mỏng với 3 bán kính và góc nghiêng khác nhau:
     - *Ring 1 (Dòng tiền / Cash Flow)*: Nghiêng $25^\circ$, xoay trục X-Y tốc độ $0.8\text{ rad/s}$.
     - *Ring 2 (Phê duyệt / Approvals)*: Nghiêng $-40^\circ$, xoay nghịch chiều tốc độ $-0.6\text{ rad/s}$.
     - *Ring 3 (Hạn mức & Ngoại hối / Trade Limits)*: Nghiêng $70^\circ$, xoay trục Y-Z tốc độ $0.4\text{ rad/s}$.
4. **Data Particles Cloud (Đám mây Hạt Dữ liệu)**:
   - `Points` chứa 200–300 hạt photon nhỏ li ti phân bố theo khối cầu xung quanh lõi (`PointsMaterial` với kích thước hạt thay đổi theo nhịp thở).
5. **Scanline & Ethereal Waves**:
   - Vòng sóng phẳng quét dọc theo trục Y giả lập hiệu ứng chiếu lăng kính quét dữ liệu.

### 2.2 Bảng màu & Vật liệu
- **Nền Void**: Sapphire `#04070F` đến `#0B1C33` (trong suốt, hòa nhập với UI nền).
- **Màu chủ đạo**:
  - Cyan Hologram: `#3FD0FF` (tượng trưng cho số hóa, công nghệ).
  - MSB Gold: `#E2B357` (tượng trưng cho giá trị tài chính, đẳng cấp doanh nghiệp).
  - MSB Orange: `#F4600C` (tượng trưng cho năng lượng hành động, kích hoạt lệnh).
  - Alert Red/Amber: `#FF4D4F` / `#FA8C16` (cảnh báo gian lận, rủi ro).
- **Vật liệu**: Toàn bộ dùng `MeshBasicMaterial` và `PointsMaterial` với:
  - `transparent: true`
  - `depthWrite: false`
  - `blending: THREE.AdditiveBlending`

---

## 3. Hệ thống Trạng thái (State Machine)

Hologram đồng bộ trực tiếp với store `useSession` (`isListening`, `isSpeaking`, `activeIntent`):

| Trạng thái | Điều kiện kích hoạt | Visual Behavior |
| :--- | :--- | :--- |
| **IDLE** | `!isListening && !isSpeaking` | Lõi lơ lửng dao động điều hòa (Harmonic sway: $\Delta y = \sin(t \times 1.8) \times 0.15$), các vòng orbital xoay êm dịu, màu Cyan `#3FD0FF` dịu mát. |
| **LISTENING** | `isListening === true` | Đổi sắc thái toàn bộ sang **MSB Gold** (`#E2B357`), hạt particle co cụm về tâm, các vòng orbital dao động biên độ theo sóng mic. |
| **THINKING** | Sau khi dứt lời, chờ AI xử lý | Lõi bung nhẹ (exploded core), các vòng orbital tăng tốc độ xoay gấp 2.5 lần, quét lăng kính nhanh. |
| **SPEAKING** | `isSpeaking === true` | Lõi phát ra các đợt sóng xung kích (shockwaves) tỏa tròn theo nhịp giọng đọc TTS của Friday, màu hòa quyện Cyan + Gold. |
| **ALERT / RISK** | `activeIntent === 'FRAUD_ALERT'` | Chuyển toàn bộ màu sắc sang **Cam - Đỏ hổ phách**, hiệu ứng nhịp tim nhanh (1.5Hz) và nhiễu nhẹ (jitter). |

---

## 4. Đặc tả Tương tác (Interaction Matrix)

1. **Spatial Pointer Tracking**:
   - Khi di chuột qua canvas, camera / nhóm hologram nghiêng nhẹ theo tọa độ $(x, y)$ chuẩn hóa của con trỏ (lerp factor 0.05).
2. **Direct Action Tap / Click**:
   - Chạm vào hologram:
     - Nếu đang nói (`isSpeaking`) $\rightarrow$ Kích hoạt `cancelListening` / ngắt lời.
     - Nếu đang nghe (`isListening`) $\rightarrow$ Kích hoạt `stopListening` / gửi yêu cầu.
     - Nếu đang nghỉ (`IDLE`) $\rightarrow$ Kích hoạt `startListening` / bắt đầu nói.
3. **Exploded Interactive Data Nodes**:
   - Bấm vào hoặc hover các nút vệ tinh trên vòng orbital để mở trực tiếp các widget:
     - Node Dòng tiền $\rightarrow$ Kích hoạt intent `CASH_FLOW`.
     - Node Phê duyệt $\rightarrow$ Kích hoạt intent `RECENT_ACTIONS`.
     - Node Hạn mức L/C $\rightarrow$ Kích hoạt intent `TRADE_FINANCE`.

---

## 5. Tiêu chuẩn Kỹ thuật & Hiệu năng
- **Renderer**: `THREE.WebGLRenderer` với `alpha: true`, `antialias: true`, `powerPreference: "high-performance"`.
- **Dọn dẹp bộ nhớ**: Gọi `dispose()` đệ quy cho toàn bộ geometry, material, texture khi React unmount; ngắt `cancelAnimationFrame` để tránh memory leak.
- **Tốc độ khung hình**: Đạt 60fps trên cả thiết bị di động tầm trung nhờ hạn chế số lượng vertices (< 3,000 vertices) và không sử dụng post-processing nặng nề.
