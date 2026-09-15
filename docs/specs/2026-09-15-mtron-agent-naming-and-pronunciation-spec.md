# Đặc tả Kỹ thuật: Đổi tên Trợ lý ảo thành M-Tròn và Chuẩn hóa Phát âm Giọng nói (TTS)

## 1. Mục tiêu
- Đổi toàn bộ nhận diện tên gọi hiển thị của trợ lý ảo từ `Friday` sang `M-Tròn`.
- Đảm bảo khi phát âm qua giọng đọc nhân tạo (Edge TTS `vi-VN-HoaiMyNeural` hoặc native voice `say -v Linh`), từ `M-Tròn` được đọc tự nhiên thành `"em tròn"` / `"Em Tròn"`, không bị đọc vấp thành "mờ tròn" hoặc "mờ trừ tròn".

## 2. Phạm vi thay đổi

### 2.1. Module Chuẩn hóa Ngữ âm (`src/lib/audio/pronunciation.ts`)
- Hàm `normalizePronunciation(text: string): string` chuyển đổi các biến thể:
  - `M-Tròn` -> `Em Tròn`
  - `M-tròn` -> `em tròn`
  - `m-tròn` -> `em tròn`
  - `M-TRÒN` -> `EM TRÒN`
- Tích hợp tại:
  - `src/app/api/tts/route.ts`: trước khi đưa văn bản vào synthesis pipeline.
  - `scripts/build-fallback-audio.ts`: trước khi sinh các file âm thanh tĩnh định dạng MP3.

### 2.2. Nhận diện Persona & Prompt LLM
- `src/app/api/reply/route.ts`:
  - Khai báo persona hệ thống là: `M-Tròn (phát âm là "em tròn")`.
- `src/lib/session.ts`:
  - Dòng chào mặc định `DEFAULT_LINE` khởi động: `"Chào Mr Stark. Em là M-Tròn, Trợ lý Quan hệ Khách hàng Doanh nghiệp của anh tại MSB Business ạ."`.
- `src/lib/intents/registry.ts`:
  - Cập nhật `GREETING.fallbackLine` với tên `M-Tròn`.

### 2.3. Giao diện Người dùng (UI / HUD / Cockpit)
- `src/components/Dashboard.tsx`:
  - Badge & Dialogue HUD: `M-TRÒN · TRỢ LÝ QHKH DOANH NGHIỆP`, avatar ký tự `M`.
  - Welcome Card: `Em là M-Tròn, Trợ lý Quan hệ Khách hàng Doanh nghiệp của anh.`.
- `src/components/widgets/HotlineWidget.tsx`:
  - Avatar text RM: `RM<br />M-Tròn`.
- `src/components/voice/HologramRM.tsx`:
  - Tooltip: `Linh vật M-Tròn · Trợ lý ảo M-Tròn · Chạm hoặc kéo để tương tác`.

### 2.4. Fallback Audio Cache
- Tái sinh `public/audio/fallback/GREETING.mp3` với câu chào phát âm "Em Tròn" chuẩn tiếng Việt tự nhiên.
