# Hướng dẫn Trình diễn MSB Virtual RM

## Trước buổi demo 30 phút

1. **Kiểm tra thiết bị**: ưu tiên iPhone. Xác nhận đã bật khóa màn hình và đăng ký Face ID.
2. **Khởi động máy chủ**:
   ```bash
   bun run build && bun run start
   bunx cloudflared tunnel --url http://localhost:3000
   ```
3. **Cài PWA**: mở URL tunnel trên Safari → Chia sẻ → Thêm vào MH chính. Mở app từ màn hình chính, không mở trong trình duyệt.
4. **Đăng nhập một lần** để đăng ký credential sinh trắc học. Quan sát prompt hiện ra trông thế nào và mất mấy bước.
5. **Làm ấm cache**: mở ngăn kéo "Tất cả", chạy lần lượt 14 lệnh. Mỗi lệnh chờ nghe hết lời thoại.
6. **Kiểm tra độ trễ**: đọc chỉ số mờ ở chân màn hình, phải dưới 1.500ms.
7. **Chạm "Bắt đầu phiên mới"** để về trạng thái sạch.

## Trong lúc demo

- **Không thoát app** giữa các phiên. Dùng "Bắt đầu phiên mới" trong ngăn kéo.
- **Môi trường ồn**: dùng chip thay vì micro. Kịch bản chạy giống hệt nhau.
- **Khán giả hỏi câu lạ**: cứ để RM trả lời — nó sẽ chuyển sang RM thật một cách chuyên nghiệp. Đó là tính năng, không phải lỗi.
- **RM nói dài**: chạm vào Orb để ngắt.

## Ba kịch bản mạnh nhất theo loại khán giả

| Khán giả | Thứ tự nên chạy |
|---|---|
| Lãnh đạo ngân hàng | Cảnh báo bất thường → Gợi ý CCTG → Khóa tỷ giá Siemens |
| Khách hàng doanh nghiệp | Dòng tiền 7 ngày → Lịch chi sắp tới → Gợi ý CCTG |
| Bộ phận kỹ thuật | Dòng tiền (bằng giọng nói) → hỏi một câu ngoài kịch bản → Hạn mức L/C |

## Khi có sự cố

| Hiện tượng | Xử lý |
|---|---|
| Không nghe thấy gì | Thoát app, mở lại, đăng nhập lại — bước đăng nhập là thứ mở khóa âm thanh |
| Micro không nhận | Chuyển sang dùng chip, không cần nói gì với khán giả |
| Lời thoại nghe đều đều | Đó là câu mẫu dự phòng, LLM đang lỗi. Demo vẫn chạy đủ |
| App đứng | Tải lại trang, đăng nhập lại. Cache vẫn còn nên vẫn nhanh |
