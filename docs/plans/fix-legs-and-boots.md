# Kế hoạch sửa lỗi Chân và Giày bị lệch (Legs and Boots Alignment Plan)

## 1. Vấn đề hiện tại
1. **Ống chân và giày bị lệch trục (Severe Misalignment)**:
   - `legMesh` và `boot` đang được định vị độc lập bằng 2 cặp tọa độ cứng không có liên kết cha-con.
   - Ống chân cắm lệch hẳn ra mép ngoài của giày, để lộ miệng cổ giày rỗng toang hoác.
2. **Góc xoay và tư thế sai lệch**:
   - Hai chân đang dùng chung một hàm đối xứng gương thô sơ, trong khi nhân vật đứng góc 3/4.
   - Chân trái (viewer bên phải) bị bẹp dí, không thể hiện được góc xoay 3/4 nhìn thấy cạnh bên của giày Mecha có đế răng cưa và nút mắt cá.
3. **Hình khối giày Mecha chưa ăn khớp**:
   - Cổ giày chưa có đai ôm khít chân.
   - Lưỡi gà và đèn LED bị văng xa khỏi cổ chân.

## 2. Giải pháp thực hiện
1. **Liên kết cấu trúc theo phân cấp hình học chuẩn (Rigid Kinematic Chain)**:
   - Đặt gốc tọa độ của `bootGroup` tại đúng điểm tiếp giáp cổ chân của mỗi chân.
   - Cổ giày (`collar cuff`) ôm khít 100% quanh ống chân, triệt tiêu hoàn toàn khe hở và hiện tượng lệch tâm.
2. **Căn chỉnh tư thế riêng cho từng chân theo đúng ảnh mẫu gốc**:
   - **Chân phải (viewer bên trái)**:
     - Chân đứng thẳng trụ, hơi choãi nhẹ (-0.30, -0.90, 0.12).
     - Chiếc giày hướng gần như trực diện (xoay nhẹ -10°).
     - Thấy rõ mặt trước giày, lưỡi gà giáp LED cyan và nút mắt cá bên má ngoài.
   - **Chân trái (viewer bên phải)**:
     - Chân choãi ra ngoài (0.35, -0.90, 0.10).
     - Chiếc giày xoay góc 3/4 sang phải (+32°).
     - Thấy rõ cạnh bên giày: đế răng cưa, nút mắt cá cyan, lưỡi gà và mũi giày vươn sang phải chuẩn ảnh mẫu gốc.
3. **Hoàn thiện chi tiết Mecha Cyber Boots**:
   - Đế giày răng cưa dày dặn, cong mũi nhẹ.
   - Đai cổ giày tím xám ôm chân.
   - Đèn LED huy hiệu hình thang trên lưỡi gà và núm tròn mắt cá phát sáng cyan.

## 3. Tiêu chí kiểm định
- `bun test src/components/voice/mtron-mascot.test.ts` pass 100%.
- `bun x tsc --noEmit` không lỗi.
- Chụp ảnh Chrome DevTools MCP, zoom cận cảnh 2 chân và giày để xác nhận ăn khớp hoàn hảo.
