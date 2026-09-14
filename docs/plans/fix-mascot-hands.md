# Kế hoạch sửa lỗi 2 bàn tay Mascot Hologram (Hands Refinement Plan)

## 1. Vấn đề hiện tại
1. **Tay giơ lên (Victory Hand)**:
   - Miệng ống cánh tay (`TubeGeometry`) bị cắt phẳng cụt lủn, hở vành ống.
   - Nắm đấm ghép từ các khối cầu rời rạc trông sần sùi lổn nhổn như hạt ngô, chưa liền khối hữu cơ với cánh tay.
2. **Tay chống hông (Akimbo Hand)**:
   - Toàn bộ bàn tay phải bị đặt ở tọa độ nằm sâu bên trong quả cầu thân (`bodyMesh`), khiến bàn tay bị nuốt chửng hoàn toàn.
   - Cánh tay đâm thẳng vào bụng rồi biến mất cụt lủn, không nhìn thấy bàn tay chống nạnh.

## 2. Giải pháp thực hiện

### A. Tay chống hông (Cánh tay phải - viewer nhìn bên trái):
- Điều chỉnh lại đường cong cánh tay `rightArmCurve`: khuỷu tay uốn gập chữ V tự nhiên, cẳng tay hướng về eo trước hông.
- Đưa tọa độ bàn tay phải ra mặt ngoài của body ($X \approx -0.66, Y \approx -0.16, Z \approx 0.40$):
  - Khớp cổ tay bo tròn liền mạch với cẳng tay.
  - Bàn tay Chibi chống nạnh: mu bàn tay tròn múp míp, các ngón tay gập tỳ vào eo và ngón cái tỳ lên trên, nhìn rõ ràng bàn tay chống hông nổi bật trên nền cam của thân.

### B. Tay giơ lên (Cánh tay trái - viewer nhìn bên phải):
- Bịt kín hoàn toàn miệng ống cắt cẳng tay bằng khớp cổ tay bo tròn (`wristJoint`) liền mạch.
- Dựng lại cụm nắm đấm Chibi múp míp:
  - Khối thân nắm đấm (`fistCore`) hình quả trứng/cầu bo cong mềm mại.
  - 4 múi ngón tay (`knuckleArches`) căng mọng xếp theo hình vòm cung từ thấp đến cao (ngón giữa cao nhất), rãnh ngăn cách rõ ràng.
  - Mặt gập ngón tay (`fingerFolds`) cuộn tròn tự nhiên.
  - Ngón cái (`thumbGroup`) gập ngang khóa chặt phía trước.
  - Xoay hướng trực diện và hơi ngửa về camera đúng góc nhìn của ảnh mẫu `mascot-superhero.webp`.

## 3. Tiêu chí kiểm định (Verification)
- `bun test src/components/voice/mtron-mascot.test.ts` pass 100%.
- `bun x tsc --noEmit` không lỗi.
- Chụp ảnh bằng Chrome DevTools MCP, zoom cận cảnh cả 2 bàn tay để xác nhận trực quan.
