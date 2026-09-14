# Kế hoạch sửa lỗi Chân lệch (Legs Balance & Horizontal Alignment Plan)

## 1. Vấn đề cốt lõi đã đo đạc bằng Grid Analysis
1. **Lệch trục tâm cơ thể (Center-line Asymmetry)**:
   - Chân trái (viewer bên trái) nằm cách trục giữa chỉ ~35px ($X = -0.27$), trong khi chân phải cách tới ~70px ($X = 0.34$). Khe háng bị kéo lệch sang một bên, làm thân và chân mất cân bằng trọng tâm.
2. **Lệch độ cao mặt sàn (Vertical Discrepancy)**:
   - Chiếc giày bên phải đứng cao hơn chiếc giày bên trái, đáy đế giày không nằm trên cùng một mặt phẳng ngang khiến nhân vật như đứng kênh chân.
3. **Lệch góc choãi (Asymmetric Stance Angles)**:
   - Chân trái đứng gần như thẳng đơ (rotation.z = 0.05), trong khi chân phải lại xoạc mạnh (rotation.z = -0.18).

## 2. Giải pháp thực hiện
1. **Cân bằng đối xứng hoàn hảo qua trục giữa X = 0**:
   - Chân phải (viewer bên trái): xuất phát X = -0.24, cổ chân X = -0.32.
   - Chân trái (viewer bên phải): xuất phát X = +0.24, cổ chân X = +0.32.
   - Khoảng cách từ trục giữa đến 2 chân bằng nhau tuyệt đối (0.32 đơn vị).
2. **Đồng bộ góc choãi chữ V (A-Stance)**:
   - Chân phải: rotation.z = +0.15 (choãi sang trái).
   - Chân trái: rotation.z = -0.15 (choãi sang phải).
   - Hai ống chân có kích thước và chiều dài bằng nhau (0.26).
3. **Đồng phẳng tuyệt đối theo trục đứng Y (Level Ground Plane)**:
   - Đáy cổ chân 2 bên cùng ở Y = -0.87.
   - Hai đế giày chạm sàn tại Y = -1.02, rotation.x = 0 và rotation.z = 0 để đế phẳng phiu trên mặt sàn bệ hologram.
   - Chiếc giày trái (viewer bên phải) xoay rotation.y = 0.50 (30°) quanh trục Y để thấy cạnh bên 3/4 mà không làm lệch độ cao đế.

## 3. Tiêu chí kiểm định
- Test unit: bun test pass 100%.
- Vẽ grid lines phân tích ảnh chụp thực tế để chứng minh 2 chân cân đối đối xứng qua trục đỏ và đế giày nằm trên cùng một đường kẻ ngang vàng.
