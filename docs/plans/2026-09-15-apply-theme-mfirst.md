# Kế hoạch Apply Theme mFirst cho MSB Virtual RM

Bảng mã màu tham chiếu từ code mobile `MSBAliasColor` (mFirst):
- **Background**: Primary `#13161B`, Secondary `#22262F`, Overlay/Tertiary `rgba(12, 14, 18, 0.60)` (`0x990C0E12`)
- **Brand (Gold Luxury)**: Brand `#BE9A61`, Text Brand `#E5D7C0`, Hover `#725C3A`, Focus `#987B4E`, Pressed `#D8C2A0`
- **Button**: Background Brand Gold `#BE9A61` / Champagne Gradient, Text Button `#13161B`, Icon Button `#13161B`
- **Surface**: Card `rgba(12, 14, 18, 0.40)` (`0x660C0E12`), BottomSheet/Popup/Tooltip `#22262F`, Error `#601B16`, Warning `#633A04`, Success `#07492A`, Info `#123A64`, Toast `#311D02`, Secondary `rgba(255, 255, 255, 0.051)`
- **Border**: Brand `#BE9A61`, Card/Default `rgba(255, 255, 255, 0.25)` (`0x40FFFFFF`), Disable `#61656C`, Focus/Hover `#987B4E`
- **Text & Icon**: Primary `#F0F0F1`, Secondary `#CECFD2`, Disable `#373A41`, Placeholder `#61656C`, Error `#F9B4AF`, Warning `#FCD39D`, Success `#A0E2C3`, Info `#ABD3FD`
- **Highlight Semantic**: Success `#12B76A`, Warning `#F79009`, Error `#F04438`, Info `#2E90FA`

---

## User Review Required

> [!IMPORTANT]
> - Thay thế toàn bộ tông nền **Midnight Navy cũ (`#0D2745`)** bằng sắc đen than chì thượng lưu **`#13161B`** và **`#22262F`** của phân khúc khách hàng ưu tiên **mFirst**.
> - Chuyển toàn bộ màu sắc thương hiệu và nút bấm chính từ màu **Cam MSB cũ (`#F4600C`)** sang **Vàng Champagne Gold (`#BE9A61`)** với chữ nút đậm màu đen than chì **`#13161B`** chuẩn `text.button = Color(0xFF13161B)`.
> - Các thẻ trạng thái nghiệp vụ (Fraud Alert, Reject, FIDO, Drawer, Popups) áp dụng đúng các surface semantic: Surface Error `#601B16`, Surface BottomSheet `#22262F`, Surface Scrim `#0C0E12/60`.
> - Giữ nguyên 100% logic tính toán tài chính và toàn bộ 14 intent.

---

## Proposed Changes

### 1. CSS Pipeline & Design Tokens

#### [MODIFY] [scripts/build-css.ts](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/scripts/build-css.ts)
- Cập nhật `@theme`:
  - `--color-obsidian: #13161B;` (nền chính mFirst)
  - `--color-sapphire: #22262F;` (nền phụ / popup / bottomSheet)
  - `--color-card: #0C0E12;` (nền surface card mFirst)
  - `--color-dialogue: #13161B;`
  - `--color-msb-orange: #BE9A61;` (brand gold mFirst thay thế cam cũ)
  - `--color-msb-tint: #E5D7C0;` (text brand champagne)
  - `--color-msb-gold: #BE9A61;` (brand highlight)
  - `--color-link: #BE9A61;`
  - Bổ sung các token semantic mFirst: surface error `#601B16`, surface warning `#633A04`, surface success `#07492A`, text semantic (`#F9B4AF`, `#FCD39D`, `#A0E2C3`, `#ABD3FD`), text primary `#F0F0F1`, text secondary `#CECFD2`.
- Cập nhật `:root` và utility classes:
  - `--bg-eb-dark-1`: `linear-gradient(115deg, #13161B 0%, #1A1D24 50%, #262019 100%)`
  - `--bg-eb-dark-1-mobile`: `linear-gradient(115deg, #13161B 0%, #1A1D24 50%, #262019 100%)`
  - `--stroke-glass-1`: viền highlight ánh vàng gold mFirst `rgba(190, 154, 97, 0.45)`
  - `--btn-primary-gradient`: `linear-gradient(135deg, #BE9A61 0%, #D8C2A0 50%, #BE9A61 100%)`
  - `.card-glass`: `bg-[#0C0E12]/40 backdrop-blur-[24px] border border-white/15 border-t-[#BE9A61]/35`
  - `.btn-primary-msb`: nền gradient gold, chữ đen `#13161B`, font-bold, shadow `rgba(190, 154, 97, 0.35)`
  - `.btn-secondary-msb`: viền và chữ `#BE9A61`
  - `.chip-pill`: viền `white/15`, chữ `#F0F0F1`, hover viền `#BE9A61` và nền `rgba(190, 154, 97, 0.15)`
- Chạy biên dịch `bun scripts/build-css.ts` vào `src/app/globals.css`.

---

### 2. Khung Nền & Layout Ứng Dụng

#### [MODIFY] [src/app/layout.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/app/layout.tsx)
- Cập nhật `themeColor: '#13161B'`.
- Nền trang `bg-[#13161B]` và chữ `text-[#F0F0F1]`.

#### [MODIFY] [src/components/Dashboard.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/Dashboard.tsx)
- Chuyển toàn bộ các lớp `bg-[#0D2745]` sang `bg-[#13161B]`.
- Cột canvas phải đổi từ `bg-[#090E17]/60` sang `bg-[#0C0E12]/60`.
- Nút "CHẠM ĐỂ NÓI" / Talk Button: chữ `#13161B`, sóng âm (wave bars) màu than chì `#13161B` trên nền vàng gold mFirst.
- Header & identity tags: căn chỉnh hiển thị mFirst luxury.

---

### 3. Voice HUD & Màn Hình Phụ Trợ

#### [MODIFY] [src/components/fido/LockScreen.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/fido/LockScreen.tsx)
- Nền khung `bg-[#13161B]/90`.
- Khung quét sinh trắc học: radar quét và viền ánh kim vàng `#BE9A61` (thay vì `#F79009`).
- Nút bấm `btn-primary-msb` với chữ đen `#13161B` và bóng đổ gold `rgba(190, 154, 97, 0.35)`.

#### [MODIFY] [src/components/fido/FidoModal.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/fido/FidoModal.tsx)
- Màn che Scrim mờ `bg-[#0C0E12]/95 backdrop-blur-md`.
- Radar quét Face ID màu `#BE9A61`.

#### [MODIFY] [src/components/voice/Drawer.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/voice/Drawer.tsx)
- Scrim mờ backdrop `bg-[#0C0E12]/70` (`background.overlay = Color(0x990C0E12)`).
- Container BottomSheet `bg-[#22262F]` (`surface.bottomSheet = Color(0xFF22262F)`).
- Danh sách lệnh `bg-[#13161B] hover:bg-[#22262F] hover:text-[#BE9A61]`.

#### [MODIFY] [src/components/voice/Orb.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/voice/Orb.tsx)
- Nền màn che voice `bg-[#0C0E12]/95 backdrop-blur-md`.
- Nút hoàn thành `btn-primary-msb text-[#13161B]`.

#### [MODIFY] [src/components/pwa/InstallPromptModal.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/pwa/InstallPromptModal.tsx)
- Nền modal popup `bg-[#22262F]` (`surface.popup = Color(0xFF22262F)`).
- Nút cài đặt `btn-primary-msb text-[#13161B]`.

---

### 4. Widgets Nghiệp Vụ

- **[MODIFY] [src/components/widgets/FraudAlertWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/FraudAlertWidget.tsx)**: Nền thẻ đổi sang `bg-[#601B16]/85` (`surface.error = Color(0xFF601B16)`), chữ cảnh báo `text-[#F9B4AF]`.
- **[MODIFY] [src/components/widgets/ApprovalWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/ApprovalWidget.tsx)**: Trạng thái Reject dùng `bg-[#601B16]/85`, ghi chú giọng nói viền `#BE9A61`.
- **[MODIFY] [src/components/widgets/CctgWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/CctgWidget.tsx)**: Badge ưu đãi `bg-msb-gold text-[#13161B]`, nút duyệt mua `btn-primary-msb text-[#13161B]`.
- **[MODIFY] [src/components/widgets/FxForwardWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/FxForwardWidget.tsx)**: Nút đặt lệnh `btn-primary-msb text-[#13161B]`.
- **[MODIFY] [src/components/widgets/HotlineWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/HotlineWidget.tsx)**: Gradient avatar từ `#22262F` đến `#13161B`.
- **[MODIFY] [src/components/widgets/SessionSummaryWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/SessionSummaryWidget.tsx)**: Icon text tương phản chuẩn `#13161B`.
- **[MODIFY] [src/components/widgets/UnknownWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/UnknownWidget.tsx)**: Icon text tương phản `#13161B`.

---

## Verification Plan

### Automated Tests
1. Biên dịch CSS kiểm tra không lỗi token:
   ```bash
    bun run build:css
   ```
2. Chạy toàn bộ test suite (201 tests):
   ```bash
    bun test
   ```
3. Typecheck toàn bộ dự án:
   ```bash
    bun x tsc --noEmit
   ```

### Manual Verification
- Kiểm tra trực quan màu nền `#13161B`, các card `#0C0E12/40`, nút vàng mFirst `#BE9A61` với chữ `#13161B`.
- Kiểm tra Drawer hiển thị đúng `#22262F`.
- Kiểm tra FidoModal, FraudAlertWidget hiển thị đúng tone màu semantic mFirst.
