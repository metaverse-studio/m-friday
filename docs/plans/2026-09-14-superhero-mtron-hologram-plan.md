# Kế hoạch Triển khai: Tái dựng Mô hình 3D Hologram M-Tròn Superhero

- **Ngày lập**: 2026-09-14
- **Dự án**: MSB Virtual RM Friday
- **Tài liệu tham chiếu**: `docs/specs/2026-09-14-superhero-mtron-hologram-spec.md` & `mascot-superhero.webp`
- **Mục tiêu**: Tái cấu trúc `mtron-mascot.ts` và tinh chỉnh `hologram-scene.ts` để nhân vật hiển thị to rõ, sáng rực, chuẩn xác theo hình mẫu siêu nhân.

---

## Danh sách Công việc (Step-by-Step Implementation Plan)

### Bước 1: Khắc phục hệ tọa độ, Camera & Framing trong `hologram-scene.ts`
- **Mục tiêu**: Đưa nhân vật ra chính diện, phóng to rõ ràng, điều chỉnh bệ hologram gọn gàng, triệt tiêu 100% cắt xén (clipping).
- **Hành động**:
  1. Điều chỉnh Camera: FOV 42°, vị trí `(0, 0.04, 3.65)` để nhân vật nằm trọn vẹn từ ngọn lửa đỉnh đầu đến đế giày mecha và bệ hologram.
  2. Nâng bệ chiếu hologram lên `y = -1.12` để nằm khít ngay dưới đế giày bốt nhân vật.
  3. Cải tiến hệ thống ánh sáng 4 điểm (Key, Fill, Top Rim, Back Rim) rực rỡ, khử bóng đen.
- **Kiểm tra**: Canvas render nhân vật to rõ, đầy đủ toàn thân, khoảng thở 10% quanh khung nhìn, không bị cắt xén.

### Bước 2: Tái dựng Khung mặt, Visor & Mắt Kawaii HUD đúng hướng (`+Z`)
- **Mục tiêu**: Mặt kính, HUD và đôi mắt nhìn thẳng về phía camera, long lanh như ảnh mẫu.
- **Hành động**:
  1. Loại bỏ các phép xoay nghịch `rotation.y = Math.PI` khiến kính visor quay ra sau lưng.
  2. Dựng khung viền kính visor kim loại titanium bo góc sắc nét, có hai tai nghe tròn lớn với vòng LED cyan phát quang.
  3. Vẽ texture màn hình HUD mắt Kawaii:
     - 2 mắt to tròn anime chibi long lanh với đốm sáng trắng kép.
     - Đồ họa HUD cyber (sóng âm, thước đo, data ticks, BOOST/MAX bar graph).
     - Nụ cười mèo `:3` xinh xắn bên dưới kính.
  4. Duy trì logic chớp mắt tự nhiên và liếc mắt theo con trỏ.
- **Kiểm tra**: Kiểm tra trên trình duyệt qua chrome-devtools MCP thấy mặt và mắt sáng bừng.

### Bước 3: Dựng Tóc Ngọn Lửa 3 Múi Đặc trưng (Flame Crest)
- **Mục tiêu**: Đỉnh đầu có ngọn lửa 3 múi vàng cam phát sáng rực rỡ.
- **Hành động**:
  1. Tạo cụm ngọn lửa 3 múi (múi giữa cao 0.35, hai múi bên cao 0.25) uốn lượn phong cách mây/lửa MSB.
  2. Áp dụng vật liệu vàng kim phát quang (`emissive: 0xffa000`, `emissiveIntensity: 0.9`).
  3. Tích hợp ánh sáng điểm ấm áp tỏa ra từ ngọn lửa.
- **Kiểm tra**: Đỉnh đầu nổi bật ngọn lửa biểu trưng MSB.

### Bước 4: Dựng Đôi tay Tư thế Siêu anh hùng (Heroic Arms & Stance)
- **Mục tiêu**: Tay phải chống hông kiên định, tay trái giơ nắm đấm chiến thắng `✊` hướng lên.
- **Hành động**:
  1. Tay phải (akimbo): Cánh tay cam gập khuỷu tỳ vào hông.
  2. Tay trái (victory fist): Cánh tay cam giơ chéo lên phía trước 45°, nắm đấm siêu nhân tròn trịa.
  3. Thêm các đường vi mạch vàng phát quang chạy dọc thân áo/cánh tay.
- **Kiểm tra**: Tư thế nhân vật tràn đầy năng lượng và khí chất siêu anh hùng.

### Bước 5: Dựng Đôi chân và Đôi giày Mecha Sci-Fi (Boots & Legs)
- **Mục tiêu**: Hai chân choãi vững vàng, giày bốt mecha hầm hố màu xanh đá có đèn LED cyan.
- **Hành động**:
  1. Hai chân trụ cam nối từ thân cầu xuống cổ chân.
  2. Giày mecha chia khối: Cổ bốt có đèn LED tam giác cyan, thân giày phân lớp kim loại xanh xám, đế giày có rãnh và dải phát quang.
- **Kiểm tra**: Chân và giày đứng cân đối trên bệ hologram.

### Bước 6: Dựng Cặp phản lực Jetpack & Áo choàng Hologram
- **Mục tiêu**: 2 ống phản lực kim loại sau lưng có ngọn lửa plasma và áo choàng hologram mềm mại.
- **Hành động**:
  1. Jetpack gồm 2 ống phản lực kim loại với vòng lửa cam/cyan phát quang mạnh.
  2. Áo choàng hologram gắn sau lưng, mô phỏng sóng vải uốn lượn bay về hướng sau-trái.
- **Kiểm tra**: Góc nhìn 3D xoay quanh thấy trọn vẹn lưng và phản lực.

### Bước 7: Kiểm thử thực tế qua chrome-devtools MCP & Bun Tests
- **Mục tiêu**: Xác thực chất lượng hiển thị trực quan và kiểm tra không gây lỗi hồi quy.
- **Hành động**:
  1. Chạy `bun test` và `bun x tsc --noEmit`.
  2. Dùng chrome-devtools MCP chụp ảnh màn hình dashboard ở `http://localhost:3000/`.
  3. So sánh trực quan với `mascot-superhero.webp`.
