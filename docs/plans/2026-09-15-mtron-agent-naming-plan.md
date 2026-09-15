# Kế hoạch Triển khai: Đổi tên Agent thành M-Tròn & Chuẩn hóa Phát âm TTS

## 1. Mục đích
Thay thế tên Trợ lý ảo `Friday` sang `M-Tròn` trên toàn bộ UI/UX, logic hội thoại, đồng thời đảm bảo audio tổng hợp (TTS) đọc thành `"em tròn"` / `"Em Tròn"` theo yêu cầu.

## 2. Các bước thực hiện
1. **Xây dựng module ngữ âm**:
   - Viết `src/lib/audio/pronunciation.ts` với hàm `normalizePronunciation`.
   - Viết bộ unit test `src/lib/audio/pronunciation.test.ts` kiểm thử các trường hợp viết hoa/thường/tiêu đề.
2. **Tích hợp pipeline TTS & Script**:
   - Tích hợp `normalizePronunciation` vào `src/app/api/tts/route.ts`.
   - Tích hợp `normalizePronunciation` vào `scripts/build-fallback-audio.ts`.
3. **Cập nhật Logic Hội thoại & Persona**:
   - `src/app/api/reply/route.ts`: Chỉ dẫn Persona trong Prompt là `M-Tròn (phát âm là "em tròn")`.
   - `src/lib/session.ts`: Đổi `DEFAULT_LINE` sang `M-Tròn`.
   - `src/lib/intents/registry.ts`: Đổi `GREETING.fallbackLine` sang `M-Tròn`.
4. **Cập nhật Giao diện (UI)**:
   - `src/components/Dashboard.tsx`: Đổi tên HUD, avatar letter từ `F` sang `M`, cập nhật câu chào card Cockpit.
   - `src/components/widgets/HotlineWidget.tsx`: Đổi text avatar RM sang `M-Tròn`.
   - `src/components/voice/HologramRM.tsx`: Cập nhật tooltip sang `Trợ lý ảo M-Tròn`.
5. **Cập nhật Unit Tests & Tái sinh Fallback Audio**:
   - Cập nhật assertion trong `src/lib/intents/reply.test.ts` và `src/lib/audio/splitSentences.test.ts`.
   - Chạy script sinh lại `public/audio/fallback/GREETING.mp3`.
6. **Kiểm chứng Toàn diện**:
   - `bun test`: Toàn bộ 204 tests pass.
   - `bun x tsc --noEmit`: Typecheck sạch 100%.
   - `bun run build`: Next.js Turbopack build thành công.
