# Kế hoạch sửa lỗi Ống cẳng chân và Giày lệch nhau (Shin & Boot Axial Alignment Plan)

## 1. Nguyên nhân cốt lõi qua phân tích hình học
1. **Lệch tâm điểm nối (Off-center Ankle Connection)**:
   - Tâm đáy cẳng chân nghiêng tại $X = \pm 0.226$, nhưng cổ giày lại được đặt ở $X = \pm 0.27$ (lệch $0.044$ đơn vị $\approx 4.4\text{cm}$).
   - Do lệch tâm, mép trong của cẳng chân chòi ra ngoài miệng cổ giày.
2. **Lệch góc xoay trục Y (Yaw Mismatch)**:
   - Chiếc giày trái bị xoay $Y = +0.44\text{ rad}$ ($25.2^\circ$), trong khi cẳng chân có $Y = 0$.
   - Giày xoay đẩy má trong ra phía trước đối diện camera, để lộ toàn bộ khe hở và phần cẳng chân thò ra ngoài.
3. **Cổ giày và gót giày chưa bao trọn 360 độ**:
   - Vành cổ giày và gót giày chưa bao bọc đủ sâu để che kín chân ở mọi góc nhìn.

## 2. Giải pháp kỹ thuật
1. **Khóa khớp cổ chân đồng trục 100% (True Ankle Anchor)**:
   - Cổ chân trái: $P_{ankle, L} = (+0.26, -0.85, 0.05)$.
   - Cổ chân phải: $P_{ankle, R} = (-0.26, -0.85, 0.05)$.
   - Đáy cẳng chân và gốc cổ giày cùng quy về CHÍNH XÁC tọa độ này.
2. **Cân chỉnh góc choãi và hướng cẳng chân (Cylinder Axis & Yaw Alignment)**:
   - Đỉnh cẳng chân cắm ngập vào đáy thân cầu mascot tại $P_{hip} = (\pm 0.20, -0.62, 0.05)$.
   - Đáy cẳng chân kết thúc ngập sâu trong cổ giày tại $P_{footEnd} = (\pm 0.26, -0.88, 0.05)$.
   - Vector cẳng chân được tính toán chính xác để trục hình trụ đi xuyên tâm miệng cổ giày.
   - Đồng bộ góc xoay Y của cẳng chân với giày: Chân phải $Y = -0.16$, Chân trái $Y = +0.20$ (chuẩn ảnh mẫu Chibi Superhero, không bị vẹo quá đà).
3. **Tối ưu bán kính và bao bọc kín 360 độ**:
   - Bán kính đáy cẳng chân: $R_{bottom} = 0.075$.
   - Bán kính trong đai cổ giày: $R_{in} = 0.096$ (lớn hơn cẳng chân $0.021$ đơn vị, ôm khít mà cẳng chân chui lọt $100\%$).
   - Gót giày $R = 0.140$, ống cổ giày cao $0.11$ bọc kín hoàn toàn toàn bộ mặt sau và hai bên má chân.

## 3. Tiêu chí kiểm định
- Unit tests: `bun test src/components/voice/mtron-mascot.test.ts` pass 100%.
- TypeScript: `bun x tsc --noEmit` 0 lỗi.
- Live Browser Verification: Chụp ảnh zoom cận cảnh cổ chân 2 bên, xác nhận không còn bất kỳ điểm thò/lòi nào của cẳng chân ra ngoài giày.
