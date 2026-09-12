# Kế hoạch Refactor Đồng Bộ Design System Figma cho Virtual RM

Tài liệu tham chiếu: [docs/design/design.md](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/docs/design/design.md) (v1.2.0)  
Mã node Figma: `18904:81945` (`Mobile-EB`) & Style `EB dark 1` (`S:321c69a25e83fa7725f03975adc75e86c6d3eba4,`)

---

## User Review Required

> [!IMPORTANT]
> Toàn bộ front-end sẽ được chuyển đổi sang font **Inter** (thay thế font Archivo cũ) và sử dụng hệ thống bo góc công thái học chuẩn Figma (Cards: `12px`, Buttons/Inputs: `8px`, Chips: `32px` Pill, Bottom-sheet: `16px`) cùng dải nền gradient **`EB dark 1`** kết hợp viền kính bắt sáng **`Stroke 1`**.
>
> Không có thay đổi nào làm ảnh hưởng đến logic tính toán của 14 intents, fixtures hay voice pipeline (STT/TTS).

---

## Proposed Changes

### Giai đoạn 1: CSS Pipeline & Design Tokens

#### [MODIFY] [scripts/build-css.ts](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/scripts/build-css.ts)
- Thay font `--font-sans` sang `Inter`.
- Bổ sung cấu hình `@theme` với màu sắc chuẩn Figma:
  - `--color-obsidian: #0D2745` (tông nền navy tối)
  - `--color-sapphire: #101520`
  - `--color-card: rgba(19, 26, 39, 0.85)`
  - `--color-msb-orange: #F4600C` (brand primary 500)
  - `--color-msb-gold: #F79009` (warning/amber)
  - `--color-signal: #12B76A` (success)
  - `--color-alert: #F04438` (error)
  - `--color-link: #2E90FA`
- Bổ sung `:root` variables:
  - `--bg-eb-dark-1`: `linear-gradient(102deg, #0D2745 0%, #232323 49%, #4B372B 92%)`
  - `--bg-eb-dark-1-mobile`: `linear-gradient(115deg, #0D2745 0%, #232323 49%, #4B372B 92%)`
  - `--stroke-glass-1`: `linear-gradient(180deg, rgba(255, 255, 255, 0.60) 0%, rgba(255, 255, 255, 0.20) 33%, rgba(255, 255, 255, 0) 100%)`
  - `--btn-primary-gradient`: `linear-gradient(0deg, #E45F35 0%, #FFA95A 100%)`
  - Thang bo góc `--radius-xs: 4px`, `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 16px`, `--radius-pill: 32px`
- Bổ sung các class tiện ích:
  - `.card-glass`: `bg-[#131A27]/85 backdrop-blur-[24px] border border-white/12 border-t-white/60 rounded-[12px] shadow-[0_8px_32px_rgba(0,0,0,0.45)]`
  - `.btn-primary-msb`: `bg-gradient-to-t from-[#E45F35] to-[#FFA95A] text-white rounded-[8px] font-medium`
  - `.chip-pill`: `rounded-full border border-white/12 px-3 py-1.5 text-[12px]`
  - 11 class typography Inter: `.font-title-bold`, `.font-base-medium`, `.font-small-regular`, v.v.

#### [MODIFY] [src/app/layout.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/app/layout.tsx)
- Đổi liên kết Google Font từ `Archivo` sang `Inter` (`wght@400;500;600;700`).
- Cập nhật themeColor thành `#0D2745`.

---

### Giai đoạn 2: Khung Nền Ứng Dụng (Shell & Dashboard)

#### [MODIFY] [src/components/Dashboard.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/Dashboard.tsx)
- Đổi nền toàn trang sang gradient `EB dark 1`.
- Khung mobile trung tâm: Bo góc `md:rounded-[32px]`, viền phản quang `md:border-white/12`.
- Header identity bar: Làm mềm vạch chia, icon MSB bo góc nhẹ.
- Balance strip: Cập nhật typography Inter số dư, đơn vị `VND`, màu xanh ngọc `#12B76A`.
- Nút "CHẠM ĐỂ NÓI" (Talk button): Nền gradient cam MSB `btn-primary-gradient`, bo góc `rounded-[8px]`, chiều cao 44px.

#### [MODIFY] [src/components/fido/LockScreen.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/fido/LockScreen.tsx)
- Màn hình khóa áp dụng gradient `EB dark 1`.
- Thẻ xác thực bo góc `12px`/`16px` viền kính bắt sáng, nút bo góc `8px`.

---

### Giai đoạn 3: Voice & Modal Primitives

#### [MODIFY] [src/components/voice/ChipBar.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/voice/ChipBar.tsx)
- Chips chuyển sang dạng Pill bo tròn `rounded-full` (`32px`), padding theo chuẩn Primitive `Chip`.

#### [MODIFY] [src/components/voice/Drawer.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/voice/Drawer.tsx)
- Cửa sổ trượt Bottom-sheet: Bo 2 góc trên `rounded-t-[16px]`, nền mờ Scrim chuẩn `rgba(29, 41, 57, 0.60)`.
- Các mục danh sách bo góc `8px`, chiều cao dòng 64px, divider kẻ mờ.

#### [MODIFY] [src/components/voice/Orb.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/voice/Orb.tsx)
- Đồng bộ màu gradient và hiệu ứng phát sáng với mã màu MSB `#F4600C` và `#F79009`.

#### [MODIFY] [src/components/fido/FidoModal.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/fido/FidoModal.tsx)
- Khung Modal cảnh báo/xác thực bo góc `12px`, viền kính bắt sáng, radar màu amber `#F79009`.

---

### Giai đoạn 4: Đồng Bộ 14 Intent Widgets

Áp dụng chuẩn Card kính `rounded-[12px]`, viền kính `border border-white/12 border-t-white/60`, nền `bg-[#131A27]/85 backdrop-blur-[24px]` và các nút bấm con `rounded-[8px]`:
- [MODIFY] [src/components/widgets/CashFlowWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/CashFlowWidget.tsx)
- [MODIFY] [src/components/widgets/ObligationWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/ObligationWidget.tsx)
- [MODIFY] [src/components/widgets/PeriodCompareWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/PeriodCompareWidget.tsx)
- [MODIFY] [src/components/widgets/TxnHistoryWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/TxnHistoryWidget.tsx)
- [MODIFY] [src/components/widgets/RecentActionsWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/RecentActionsWidget.tsx)
- [MODIFY] [src/components/widgets/TradeFinanceWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/TradeFinanceWidget.tsx)
- [MODIFY] [src/components/widgets/FraudAlertWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/FraudAlertWidget.tsx)
- [MODIFY] [src/components/widgets/ApprovalWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/ApprovalWidget.tsx)
- [MODIFY] [src/components/widgets/CctgWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/CctgWidget.tsx)
- [MODIFY] [src/components/widgets/FxForwardWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/FxForwardWidget.tsx)
- [MODIFY] [src/components/widgets/LoanWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/LoanWidget.tsx)
- [MODIFY] [src/components/widgets/HotlineWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/HotlineWidget.tsx)
- [MODIFY] [src/components/widgets/SessionSummaryWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/SessionSummaryWidget.tsx)
- [MODIFY] [src/components/widgets/UnknownWidget.tsx](file:///Users/bez/Workspace/MSB/repos/demo-virtual-rm/src/components/widgets/UnknownWidget.tsx)

---

## Verification Plan

### Automated Tests
1. Biên dịch CSS:
   ```bash
    bun run build:css
   ```
2. Chạy toàn bộ test suite dự án:
   ```bash
    bun test
   ```
3. Typecheck / Build xác thực cú pháp:
   ```bash
    bun x tsc --noEmit
   ```

### Manual Verification
- Kiểm tra trực quan màu sắc gradient và viền kính trên giao diện web local `http://localhost:3000`.
- Kiểm tra tính responsive trên cả màn hình di động (390px) và desktop.
