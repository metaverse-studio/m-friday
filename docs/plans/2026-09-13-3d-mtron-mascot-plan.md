# Kế hoạch Triển khai: 3D Linh vật M-Tròn Thay Thế Hologram RM

- **Ngày lập**: 2026-09-13
- **Tác giả**: Antigravity Pair Programmer
- **Tài liệu đặc tả**: `docs/specs/2026-09-13-3d-mtron-mascot-spec.md`
- **Tiêu chuẩn**: `3dviz-pro-max`
- **Trạng thái**: Đang thực thi

---

## 1. Mục tiêu
Thay thế lõi bát diện hologram cũ bằng mô hình 3D linh vật M-Tròn procedural sống động bằng Three.js WebGL:
- Thân cầu cam MSB bóng bẩy với mạch điện tử vi mạch phát sáng.
- Mắt kính Visor công nghệ cao viền kim loại bạc, hiển thị mắt to tròn kawaii chớp nháy và HUD quét dữ liệu.
- Logo MSB phát sáng trên trán.
- Áo choàng đỏ siêu nhân phấp phới sóng vải động học.
- Đôi găng tay và đôi giày robot mạ bạc cử động nhịp nhàng.
- Hiệu ứng bệ chiếu hologram, bụi photon dữ liệu.
- Biểu cảm mượt mà theo các trạng thái âm thanh: IDLE, LISTENING, THINKING, SPEAKING, ALERT.

---

## 2. Kế hoạch Các Bước Triển Khai

### Bước 1: Xây dựng Module Mô hình 3D M-Tròn (`src/components/voice/mtron-mascot.ts`)
1. **Procedural Geometry & Shaders / Materials**:
   - Thân hình cầu cam MSB với vật liệu men bóng `MeshPhysicalMaterial`.
   - Vi mạch điện tử vi tính và nụ cười được render qua canvas texture 2D độ nét cao.
   - Visor kính cyber trong suốt phản chiếu ánh sáng và khung viền kim loại bạc có khớp tai.
   - HUD screen động: mắt anime chibi to tròn với 2 đốm sáng phản chiếu, hỗ trợ chớp mắt, liếc mắt theo chuột, hiển thị thanh sóng âm / radar / khung ngắm mục tiêu.
   - Logo MSB trán: khối trụ & hạt tròn phát sáng trắng rực rỡ kèm point light cục bộ.
   - Áo choàng đỏ siêu nhân: lưới đa giác `PlaneGeometry` với thuật toán mô phỏng sóng vải thời gian thực.
   - Găng tay và giày robot kim loại bạc với dải đèn phản lực cam MSB.
2. **Animation Controller**:
   - Hàm `update(elapsedTime, delta, state, pointerRot)` cập nhật toàn bộ chuyển động lơ lửng, chao lượn, cử động tay chân, sóng áo choàng, chớp mắt và nhịp nói.
   - Hàm `dispose()` dọn sạch textures, geometries, materials phòng tránh rò rỉ bộ nhớ.

### Bước 2: Tích hợp Scene M-Tròn vào `hologram-scene.ts`
1. **Hệ thống Ánh sáng 3 chiều**: Key light, fill light, rim light và ambient light tôn dáng khối cầu bóng và áo choàng.
2. **Bệ chiếu Hologram & Bụi hạt Photon**: Giữ phong cách cyber trợ lý ảo RM Friday.
3. **Điều khiển Tương tác Chuột / Cảm ứng**:
   - Kéo xoay 360 độ (drag to rotate) mượt mà.
   - Di chuột / nghiêng điện thoại (gyroscope) dõi mắt và nghiêng người theo.
4. **State Transitions**:
   - Chuyển màu và nhịp điệu mượt mà giữa IDLE, LISTENING, THINKING, SPEAKING, ALERT.

### Bước 3: Hoàn thiện Component `HologramRM.tsx`
1. Cập nhật nhãn trạng thái và accessibility.
2. Đảm bảo không vi phạm quy tắc cấm hardcode số liệu JSX (`hardcoded-numbers.test.ts`).

### Bước 4: Kiểm thử và Xác minh Chất lượng
1. Chạy `bun test` và `bun test src/components/hardcoded-numbers.test.ts`.
2. Chạy `bun run build` đảm bảo không lỗi TypeScript hay đóng gói Next.js.
3. Báo cáo kết quả theo tiêu chuẩn khắt khe.
