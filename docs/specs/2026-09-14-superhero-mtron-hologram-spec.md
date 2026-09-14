# Đặc tả Kỹ thuật: 3D Hologram Linh vật M-Tròn Superhero (MSB Cyber Mascot)

- **Ngày lập**: 2026-09-14
- **Tác giả**: Antigravity Pair Programmer
- **Tham chiếu hình ảnh**: `/Users/bez/Workspace/MSB/repos/demo-virtual-rm/mascot-superhero.webp`
- **Bộ kỹ năng ứng dụng**: `img2threejs`, `3dviz-pro-max`
- **Trạng thái**: Bản đặc tả chính thức (Approved)

---

## 1. Bối cảnh & Vấn đề Cần giải quyết

### 1.1. Hiện trạng
- Mô hình Hologram M-Tròn hiện tại ở Dashboard gặp lỗi thị giác nghiêm trọng khiến **nhân vật không nhìn rõ**:
  1. Mặt kính Visor và mắt bị quay 180° ra phía sau (`rotation.y = Math.PI`), khiến camera chỉ nhìn thấy lưng quả cầu đỏ trơn.
  2. Camera đặt quá xa (`z = 4.3`, FOV 45°), khiến nhân vật bị thu nhỏ chỉ còn ~50px trong khung chứa 150px.
  3. Thiếu hoàn toàn các đặc trưng nhận diện cốt lõi của linh vật siêu anh hùng MSB:
     - Tóc ngọn lửa 3 múi phát sáng trên đỉnh đầu.
     - Dáng đứng siêu nhân dũng mãnh (tay trái giơ nắm đấm chiến thắng, tay phải chống hông).
     - Đôi chân cam và đôi giày bốt mecha hầm hố với đèn LED phát sáng.
     - Cặp động cơ phản lực Jetpack với ngọn lửa năng lượng.
     - Áo choàng hologram phấp phới chuyển sắc rực rỡ.

### 1.2. Mục tiêu
Tái dựng toàn bộ mô hình 3D linh vật M-Tròn theo đúng nguyên mẫu siêu nhân trong `mascot-superhero.webp`:
- Nhân vật hiển thị to rõ, sáng đẹp, chiếm trọn 80-85% khung hình canvas.
- Độ tương phản cao, màu sắc cam MSB `#ff4211` tươi tắn bóng bẩy với lớp phủ men bóng trong suốt (clearcoat).
- Mặt kính Visor cong công nghệ cao quay đúng về phía trước (`+Z`), hiển thị đôi mắt Kawaii Anime to tròn long lanh có đốm sáng kép, kèm các chỉ số HUD cyber nhấp nháy sống động.
- Nụ cười mèo chibi `:3` dưới kính visor.
- Tóc ngọn lửa 3 múi vàng rực trên đầu phát sáng rực rỡ.
- Đôi chân vững chãi với đôi giày bốt mecha sci-fi màu xanh đá có đèn LED cyan.
- Jetpack và áo choàng hologram uyển chuyển phía sau.
- Tương thích đầy đủ vòng lặp animation: chớp mắt, liếc nhìn chuột, lơ lửng bồng bềnh, phản ứng theo các trạng thái âm thanh (`isListening`, `isSpeaking`, `isThinking`, `FRAUD_ALERT`).

---

## 2. Phân rã Hình học & Vật liệu Chi tiết (3D Component Hierarchy)

```
MtronSuperheroModel (Group)
├── BodyCore (Group)
│   ├── BodySphere (SphereGeometry, MeshPhysicalMaterial: cam MSB, clearcoat bóng, texture mạch vàng + miệng cười :3)
│   └── FlameCrest (Group: 3 múi ngọn lửa uốn lượn, MeshPhysicalMaterial vàng kim phát sáng rực rỡ)
├── VisorHeadset (Group)
│   ├── FrameTop & FrameBottom (Beveled Curved Torus/Shapes kim loại xanh xám titanium)
│   ├── VisorGlass (CylinderGeometry cong, MeshPhysicalMaterial cyan trong suốt)
│   ├── HudScreen (CylinderGeometry cong bên trong, CanvasTexture mắt Kawaii + HUD data)
│   └── EarPucks (Trụ kim loại 2 bên thái dương với vòng LED tròn cyan phát quang)
├── Limbs (Group)
│   ├── RightArm (Chống hông: Tube/CapsuleGeometry cam cong + nắm tay tỳ hông)
│   ├── LeftArm (Giơ cao: Tube/CapsuleGeometry cam hướng lên 45° + nắm đấm chiến thắng ✊)
│   ├── Legs (2 ống trụ/capsule cam choãi góc chữ V kiên định)
│   └── Boots (2 bốt mecha màu xanh đá, mũi bọc thép, đèn LED tam giác & tròn cyan, rãnh đế)
├── BackEquipment (Group)
│   ├── JetpackThrusters (2 ống phản lực kim loại xám với vành lửa plasma phát quang)
│   └── IridescentCape (Lưới đa giác vải phấp phới sóng, vật liệu hologram/đỏ chuyển sắc)
└── HologramRig (Group - nằm gọn phía dưới chân)
    ├── BaseDiscs (Vành tròn phát quang hologram đáy)
    ├── LightBeam (Chóp nón hologram dịu nhẹ)
    └── SwirlParticles (Hạt photon lơ lửng quỹ đạo)
```

---

## 3. Hệ thống Chiếu sáng & Góc Camera (Camera & Lighting Rig)

- **Camera**:
  - `PerspectiveCamera(fov: 42, near: 0.1, far: 50)`.
  - Vị trí: `(0, 0.04, 3.65)` - tính toán toán học chính xác để toàn bộ nhân vật (từ đỉnh ngọn lửa y = 1.25, nắm đấm chiến thắng x = 1.0 đến đế giày Mecha và bệ hologram y = -1.12) nằm trọn vẹn trong khung vuông 1:1 với khoảng thở 10% ở cả 4 cạnh, triệt tiêu 100% hiện tượng cắt xén (clipping).
- **Lighting Rig**:
  - `AmbientLight(0xffffff, 1.25)`: Đảm bảo không vùng nào bị đen mờ.
  - `DirectionalLight` (Key Light): `position(2.2, 2.6, 3.2)`, cường độ `2.8`, màu trắng ấm, làm nổi bật men bóng cam và kính visor.
  - `DirectionalLight` (Fill Light): `position(-2.8, 1.2, 2.2)`, cường độ `1.8`, màu xanh cyan `#4de0ff` tạo phong cách sci-fi.
  - `DirectionalLight` (Top Rim Light): `position(0, 3.4, 0.4)`, cường độ `2.4`, màu vàng ấm rọi sáng đỉnh ngọn lửa tóc.
  - `DirectionalLight` (Back Rim Light): `position(0, 1.0, -3.0)`, cường độ `2.2`, màu cam viền áo choàng và động cơ.

---

## 4. Quản lý Tương tác & Trạng thái (Interactivity & State Machine)

- **Chớp mắt & Liếc nhìn**: Chu kỳ chớp mắt 3-4s tự nhiên; đồng tử di chuyển theo hướng chuột nhẹ nhàng.
- **Hành vi theo State**:
  - `IDLE`: Chuyển động lơ lửng nhịp thở ($y = \sin(t \cdot 2) \cdot 0.04$), áo choàng phấp phới nhẹ.
  - `LISTENING`: Thân nghiêng nhẹ về phía trước, mắt mở to chú ý, HUD phát sắc vàng ấm.
  - `THINKING`: Đầu hơi nghiêng, mắt liếc nhẹ, thanh quét laser HUD chạy qua lại.
  - `SPEAKING`: Nhún nhảy theo điệu nói, sóng âm thanh equalizer nhảy trên kính visor giữa 2 mắt.
  - `ALERT (FRAUD_ALERT)`: Rung vi mô cảnh báo, toàn bộ HUD và đèn chuyển sang sắc đỏ cam cảnh báo.
- **Tương tác kéo xoay**: Giữ nguyên tương tác kéo chuột xoay 360° mượt mà có đàn hồi về vị trí ban đầu khi thả chuột.
