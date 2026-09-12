# MSB Virtual RM — Demo MVP

Trợ lý Quan hệ Khách hàng Ảo tương tác bằng giọng nói tiếng Việt cho Khách hàng
Doanh nghiệp MSB.

## Chạy dự án

```bash
bun install
cp .env.local.example .env.local   # điền GROQ_API_KEY
bun dev
```

Micro, WebAuthn và PWA đều đòi HTTPS. Để kiểm tra trên điện thoại thật:

```bash
bunx cloudflared tunnel --url http://localhost:3000
```

## Kiểm thử

```bash
bun test                                      # test đơn vị
bunx tsc --noEmit                             # kiểm tra kiểu
bun run scripts/check-intent-accuracy.ts      # độ chính xác intent (cần server đang chạy)
bun run scripts/build-fallback-audio.ts       # sinh lại MP3 dự phòng
```

## Tài liệu

- Đặc tả: `docs/specs/2026-09-11-virtual-rm-mvp-design.md`
- Kế hoạch: `docs/plans/`
- Hướng dẫn trình diễn: `docs/plans/2026-09-12-huong-dan-trinh-dien.md`

## Kiến trúc

Lời thoại do LLM sinh mỗi lượt nhưng mọi con số đều bị `numeric guard` đối chiếu
với `src/lib/data/fixtures.ts` trước khi đọc. LLM được đổi cách nói, không được
đổi số liệu. Nhận diện ý định đi qua ba tầng — chip, keyword phía client, rồi LLM —
mỗi tầng hỏng thì rơi xuống tầng dưới.
