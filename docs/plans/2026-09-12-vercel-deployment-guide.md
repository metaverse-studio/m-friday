# Hướng dẫn triển khai Vercel cho MSB Virtual RM (Friday)

## 1. Yêu cầu môi trường (Environment Variables)

Dự án yêu cầu các biến môi trường sau để hoạt động đúng trên Vercel:
- `GROQ_API_KEY` (hoặc `GROQ_API_KEYS`): API key cho Groq (chạy LLM model và STT whisper). Hỗ trợ nhiều key xoay tua ngẫu nhiên (rotate random pick), phân tách bởi dấu phẩy `,` (ví dụ: `key1,key2,key3`).
- `VIENEU_API_KEY` (hoặc `VIENEU_API_KEYS`): API key cho dịch vụ VieNeu TTS (chuyển đổi văn bản thành giọng nói tiếng Việt tự nhiên). Hỗ trợ nhiều key xoay tua ngẫu nhiên phân tách bởi dấu phẩy `,`.
- `TTS_PROVIDER`: Đặt là `vieneu` để sử dụng VieNeu TTS. Nếu không có, sẽ tự động dùng fallback `edge-tts`.
- `VIENEU_VOICE`: (Tùy chọn) Tên giọng đọc VieNeu (mặc định: `Ngọc Lan`).

## 2. Các bước triển khai qua Vercel Dashboard (GitHub)

Đây là cách khuyên dùng nhất vì nó tự động build khi push code mới lên nhánh `main`.

1. **Đẩy mã nguồn lên GitHub**:
   Đảm bảo toàn bộ mã nguồn (bao gồm `bun.lock` và `vercel.json`) đã được commit và push lên một repository trên GitHub.
2. **Thêm dự án trên Vercel**:
   - Truy cập [Vercel Dashboard](https://vercel.com/dashboard).
   - Chọn "Add New..." -> "Project".
   - Import repository từ GitHub chứa mã nguồn dự án.
3. **Cấu hình Framework và Build**:
   - Vercel sẽ tự động phát hiện Next.js và đặt Framework Preset là "Next.js".
   - Nhờ có file `bun.lock`, Vercel sẽ tự động cài đặt `bun` và dùng `bun run build`. Không cần thay đổi Build Command.
4. **Cấu hình Environment Variables**:
   - Trong mục "Environment Variables", thêm đầy đủ các biến môi trường ở phần 1.
5. **Deploy**:
   - Nhấn "Deploy" và chờ Vercel cài đặt dependencies, biên dịch CSS (qua `bun scripts/build-css.ts`) và chạy `next build`.
   - Vercel sẽ tạo các Serverless Functions cho Next.js 16 (App Router).

## 3. Triển khai qua Vercel CLI (Dành cho nhà phát triển)

Nếu bạn muốn deploy trực tiếp từ terminal (local):

1. **Cài đặt Vercel CLI**:
   ```bash
   npm i -g vercel
   # Hoặc dùng bun: bun add -g vercel
   ```
2. **Đăng nhập và Deploy**:
   ```bash
   vercel login
   vercel env pull # Kéo biến môi trường nếu đã cấu hình (tùy chọn)
   vercel
   ```
   - Làm theo các bước hướng dẫn trên terminal.
3. **Deploy lên Production**:
   Khi đã sẵn sàng, deploy thẳng lên production:
   ```bash
   vercel --prod
   ```

## 4. Chi tiết cấu hình đã thiết lập

- **vercel.json**: Đã được thiết lập với preset `nextjs`, cài đặt các Security Headers (X-Frame-Options, X-Content-Type-Options) và cấu hình Cache-Control chống lưu cache cho endpoint `/api/tts` để đảm bảo luồng audio luôn realtime.
- **.vercelignore**: Đã loại bỏ các tệp rác, file nhạy cảm và thư mục nội bộ (vd: `.tmp`, `.gemini`, `docs/specs`, `tests`, `*.log`, `.DS_Store`) khỏi bundle để tối ưu thời gian deploy và bảo mật.
- **Tính tương thích**: Framework hiện tại là Next.js 16 với Turbopack và App Router. Các route handlers (`/api/reply`, `/api/stt`, `/api/tts`, `/api/intent`) đều tương thích tốt với Vercel Node.js Serverless Functions mặc định. `bun` được Vercel tự động nhận diện thông qua file `bun.lock` để xử lý script compile Tailwind CSS trước khi build Next.js.
