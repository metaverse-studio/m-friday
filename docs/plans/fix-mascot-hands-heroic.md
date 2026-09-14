# Kế hoạch Khắc phục Triệt để Lỗi "Bàn tay Chưa Gắn Liền với Cánh tay" trên Mascot M-Tròn

## 1. Nguyên nhân Kỹ thuật Cốt lõi

1. **Tay phải chống hông bị thân cầu nuốt chửng (Body Mesh Occlusion)**:
   - Thân mascot là quả cầu bán kính $R = 0.74$, tâm $(0,0,0)$.
   - Điểm cuối ống cánh tay phải trước đó đặt tại $(-0.62, -0.20, 0.24)$.
   - Khoảng cách đến tâm: $d = \sqrt{(-0.62)^2 + (-0.20)^2 + 0.24^2} \approx 0.694 < 0.74$.
   - **Hệ quả**: Khớp cổ tay và bàn tay phải nằm sâu bên trong lòng quả cầu thân. Bàn tay hoàn toàn bị quả cầu che khuất, mắt người chỉ thấy ống cẳng tay đâm vào bụng biến mất, gây cảm giác "không có bàn tay" và "tay chưa gắn liền".

2. **Khớp cổ tay tay trái giơ cao bị lệch góc tiếp tuyến (Tangent Misalignment)**:
   - Ống cánh tay trái (`TubeGeometry`) có vector tiếp tuyến tại điểm cuối hướng nghiêng lên trên sang phải: $\mathbf{T} \approx (0.388, 0.874, 0.291)$ (nghiêng $\approx 29^\circ$ so với trục Y).
   - Khối cổ tay và cụm bàn tay trước đó dùng góc Euler thủ công `(0.06, -0.20, -0.15)` thay vì align theo vector tiếp tuyến.
   - **Hệ quả**: Khối hình trụ cổ tay bị lệch trục $\approx 30^\circ$ so với miệng ống cánh tay. Tại miệng ống xuất hiện mép gờ sắc và khe bóng tối, khiến bàn tay trông như một khối rời rạc gắn tạm bợ vào đầu ống.

---

## 2. Giải pháp Kỹ thuật Chi tiết

### A. Tay phải chống nạnh (Right Akimbo Hand)
- **Tái lập quỹ đạo đường cong cánh tay (`rightArmCurve`)**:
  - Gốc vai: $(-0.56, 0.10, 0.12)$
  - Cùi chỏ nhô sang bên trái: $(-0.85, -0.06, 0.24)$
  - Đầu cẳng tay vươn ra mặt trước eo: $(-0.54, -0.18, 0.49)$
  - Bán kính thân cầu tại $x = -0.54, y = -0.18$: $z_{surface} = \sqrt{0.74^2 - (-0.54)^2 - (-0.18)^2} \approx 0.473$. Điểm $(-0.54, -0.18, 0.49)$ nằm sát ngay mặt ngoài sườn ($+0.017$), đảm bảo bàn tay tỳ sát lên eo và nổi rõ rệt phía trước camera.
- **Đồng trục hóa cổ tay theo tiếp tuyến (`T_right`)**:
  - Lấy vector tiếp tuyến `T_right = rightArmCurve.getTangent(1.0).normalize()`.
  - Khối cổ tay `CylinderGeometry(0.090, 0.095, 0.06)` cắm sâu vào miệng ống và loe nhẹ ôm vào mu bàn tay.
  - Sử dụng `quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), T_right)` để khớp nối liền mạch $100\%$ không một vết hở.
- **Bàn tay chống nạnh Chibi**:
  - Khối mu bàn tay tròn $R = 0.082$ đặt tiếp nối cổ tay tại $(-0.50, -0.19, 0.52)$.
  - Các đốt ngón tay và ngón cái gập vòm ôm nhẹ lên sườn theo đúng mẫu gốc `ref_full_right_arm.png`.

### B. Tay trái giơ cao (Left Victory Fist ✊)
- **Đồng trục hóa tuyệt đối theo tiếp tuyến (`T_left`)**:
  - Lấy `T_left = leftArmCurve.getTangent(1.0).normalize()` tại điểm cuối `(0.76, 0.44, 0.20)`.
  - Khối cổ tay `leftWristBridge` sử dụng `CylinderGeometry(0.090, 0.096, 0.07, 16)`. Đáy cylinder bán kính $0.090$ khớp khít tuyệt đối với miệng ống `TubeGeometry` bán kính $0.090$.
  - Căn chỉnh góc xoay cổ tay bằng `quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), T_left)`.
  - Khối đế mu bàn tay ($R = 0.088$) và 4 đốt ngón tay CapsuleGeometry xếp vòm tiếp nối thẳng hàng từ cổ tay, ngón cái khóa ngang ở mặt trước.

---

## 3. Các file thay đổi

- **[MODIFY] [src/components/voice/mtron-mascot.ts](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/voice/mtron-mascot.ts)**
- **[MODIFY] [src/components/voice/mtron-mascot.test.ts](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/voice/mtron-mascot.test.ts)**

---

## 4. Kế hoạch Kiểm tra & Xác minh (Verification Plan)

### Automated Tests
- ` bun test src/components/voice/mtron-mascot.test.ts`: Tất cả test case pass 100%.
- ` bun x tsc --noEmit`: Không có bất kỳ lỗi TypeScript nào.

### Visual Verification via Chrome DevTools MCP
- Reload dashboard (`http://localhost:3000/`) trên Page 59.
- Chụp canvas DataURL từ WebGL loop.
- Crop cận cảnh cả 2 bàn tay:
  - `hand_raised_seamless.png`: Xác nhận cổ tay và cánh tay trái nối liền mạch 100%, không bóng gãy góc.
  - `hand_hip_seamless.png`: Xác nhận bàn tay phải chống nạnh nổi rõ rệt trên mạn sườn, liền khối với cẳng tay.
