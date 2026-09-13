# Kế hoạch Triển khai: 3D Hologram Virtual RM Friday (Three.js WebGL)

- **Ngày lập**: 2026-09-13
- **Tài liệu đặc tả**: `docs/specs/2026-09-13-3d-hologram-rm-spec.md`
- **Tiêu chuẩn**: `3dviz-pro-max`
- **Trạng thái**: Chờ phê duyệt (Pending Approval)

---

## 1. Mục tiêu

Tích hợp mô hình 3D Hologram đại diện cho RM ảo Friday vào hệ thống giao diện `demo-virtual-rm`, thay thế cho biểu tượng vòng xoay 2D tĩnh hiện tại trong `Orb.tsx` và tạo điểm nhấn trực quan ở chế độ Cockpit/Greeting của Dashboard.

---

## 2. Các Bước Thực Hiện Cụ Thể

### Giai đoạn 1: Chuẩn bị Thư viện & Hạ tầng
1. **Cài đặt dependencies**:
   - Chạy lệnh: ` bun add three` và ` bun add -D @types/three`.
   - Kiểm tra `package.json` và đảm bảo tương thích hoàn toàn với Next.js 16 + React 19.

### Giai đoạn 2: Xây dựng Component 3D Hologram (`HologramRM.tsx`)
1. **Khởi tạo Canvas & WebGL Context**:
   - Tạo file `src/components/voice/HologramRM.tsx`.
   - Khởi tạo `THREE.Scene`, `THREE.PerspectiveCamera`, `THREE.WebGLRenderer` gắn vào React `useRef<HTMLDivElement>`.
   - Hỗ trợ resize tự động theo kích thước container (ResizeObserver).
2. **Dựng Geometry & Shaders / Materials**:
   - **Central Core**: Khối bát diện wireframe ngoài (Cyan `#3FD0FF`) + khối đa diện đặc mờ bên trong (Gold `#E2B357`).
   - **Orbital Rings**: 3 vòng `TorusGeometry` xoay theo 3 trục độc lập.
   - **Particle Cloud**: `Points` 250 hạt chuyển động theo hình cầu.
   - **Projector Base**: Đĩa phát sáng mờ ở đáy.
3. **Animation Loop & State Transitions**:
   - Kết nối với store `useSession`: `isListening`, `isSpeaking`, `activeIntent`.
   - Chuyển màu mượt mà (Color Lerp) khi đổi trạng thái (Cyan $\rightarrow$ Gold $\rightarrow$ Amber Alert).
   - Biến thiên dao động (sway & amplitude) theo trạng thái.
4. **Pointer & Touch Tracking**:
   - Lắng nghe sự kiện `pointermove` trên canvas để nghiêng nhẹ cụm hologram theo hướng di chuyển chuột/chạm.
5. **Dọn dẹp tài nguyên (Disposal)**:
   - Viết hàm `cleanup` giải phóng bộ nhớ WebGL khi component unmount.

### Giai đoạn 3: Tích hợp vào Giao diện Dashboard & Orb
1. **Cập nhật `Orb.tsx`**:
   - Thay thế animation CSS 2D cũ bằng component `HologramRM` với kích thước phù hợp (đường kính ~220px - 260px).
   - Bảo toàn toàn bộ chức năng: hiển thị transcript, nút "NÓI XONG · GỬI YÊU CẦU", nút "HỦY BỎ".
   - Chạm trực tiếp vào Hologram để ngắt lời hoặc hoàn tất nói.
2. **Hiển thị tại Cockpit Canvas (Dashboard.tsx)**:
   - Trong màn hình chào mừng mở phiên (khi chưa kích hoạt intent cụ thể), hiển thị Hologram 3D tương tác tại trung tâm thay cho avatar icon tĩnh chữ "F", tăng tính hiện đại và sống động cho sản phẩm.

### Giai đoạn 4: Kiểm thử & Nghiệm thu
1. **Kiểm tra biên dịch & Type Check**:
   - Chạy ` bun run build` hoặc ` bun x tsc --noEmit`.
2. **Kiểm tra hiệu năng**:
   - Đảm bảo 60fps mượt mà, không giật lag.
   - Kiểm tra không rò rỉ bộ nhớ (memory leak) khi mở/đóng Orb nhiều lần.
3. **Xác minh tương tác**:
   - Di chuột $\rightarrow$ hologram nghiêng theo.
   - Bấm "CHẠM ĐỂ NÓI" $\rightarrow$ hologram chuyển sang sắc vàng MSB, hạt co cụm, vòng xoay dao động.
   - Chạm vào hologram $\rightarrow$ ngắt lời hoặc hoàn tất câu nói.
