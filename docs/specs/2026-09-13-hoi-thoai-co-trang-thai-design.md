# ĐẶC TẢ THIẾT KẾ — ĐỢT 1: HỘI THOẠI CÓ TRẠNG THÁI

- **Mã dự án**: `MSB-VIRTUAL-RM-MVP`
- **Phiên bản**: `2.0.0`
- **Ngày lập**: 13/09/2026
- **Spec gốc**: `docs/specs/2026-09-11-virtual-rm-mvp-design.md` (v1.1.1)

## 1. Vấn đề

Kiến trúc hiện tại là **stateless one-shot**: mỗi lượt bằng đúng một intent, một lát fixture, một câu thoại, một widget. Bốn hệ quả đo được trong mã nguồn:

| Hệ quả | Bằng chứng |
|---|---|
| Không có trí nhớ | `runIntent` không đọc `history`; `/api/reply` chỉ nhận `intentId` |
| Không có tham số | `resolveIntent(text)` trả về `IntentId` rồi vứt bỏ `text` |
| Chip tĩnh | `nextChips` hardcode 3 phần tử mỗi intent trong `registry.ts` |
| Phiên không có hình dạng | 14 lượt rời rạc, không mở đầu, không tổng kết đúng việc đã làm |

Mục tiêu đợt này: **cảm giác thật của một RM** — nhớ ngữ cảnh, hiểu tham số, nối mạch, có mở và có kết.

## 2. Phạm vi

Bốn hạng mục, làm trong một đợt vì dùng chung một đường ống dữ liệu:

- **A — Slot/entity**: câu nói mang theo tham số, chỉ áp cho `FX_FORWARD`, `SUGGEST_CCTG`, `PERIOD_COMPARE`
- **B — Multi-turn**: Friday hỏi ngược khi thiếu slot `required`
- **C — Chip động**: gợi ý tính theo `history` và trạng thái phiên thay vì bảng cứng
- **D — Ngữ cảnh nối lượt**: `/api/reply` biết hai lượt gần nhất
- **G — Vòng đời phiên**: agenda mở phiên, `SESSION_SUMMARY` liệt kê đúng việc đã làm

**Ngoài phạm vi đợt này**: fixtures biến thiên theo seed (hạng mục F). Lý do ở §9.

## 3. Kiểu dữ liệu

### 3.1 Slot

```ts
export type SlotId = 'amountUsd' | 'principal' | 'termDays' | 'month'
export type SlotValue = number | string
export type SlotValues = Partial<Record<SlotId, SlotValue>>

export type SlotOption = { value: SlotValue; label: string }

export type SlotSpec = {
  id: SlotId
  /** Câu Friday hỏi khi slot required mà chưa có giá trị */
  question: string
  /** Lựa chọn hiện trên chip bar lúc chờ — đường lui khi STT hỏng */
  options: SlotOption[]
  /** Giá trị dùng khi khách không nói tới slot này */
  fallback: SlotValue
  /** Bắt buộc phải có trước khi intent được chạy */
  required?: boolean
  /** Bắt giá trị từ câu nói đã bỏ dấu; null nghĩa là không thấy */
  parse: (normalized: string) => SlotValue | null
}
```

`Intent` thêm hai field tuỳ chọn:

```ts
slots?: SlotSpec[]
/** Số dẫn xuất từ slot, cộng vào allowedNumbers khi guard chạy */
derivedNumbers?: (slots: SlotValues) => string[]
```

### 3.2 Bảng slot

| Intent | Slot | required | fallback | Lựa chọn trên chip |
|---|---|---|---|---|
| `FX_FORWARD` | `amountUsd` | ✓ | 250.000 | 100.000 / 250.000 / 500.000 USD |
| `SUGGEST_CCTG` | `principal` | | 15 tỷ | 10 / 15 / 20 tỷ |
| `SUGGEST_CCTG` | `termDays` | | 15 ngày | 15 / 30 / 90 ngày |
| `PERIOD_COMPARE` | `month` | | Tháng 8 | Tháng 6 / 7 / 8 |

`FX_FORWARD` là slot `required` duy nhất: nó ký một lệnh có thật, đoán hộ số tiền là sai bản chất. Hai intent kia chạy mặc định rồi mời chỉnh.

### 3.3 Lượt tinh chỉnh

```ts
export type Turn = { intentId: IntentId; slots: SlotValues; refinement: boolean }
```

Quy tắc phân biệt: câu nói **không khớp keyword nào**, trong khi `activeIntent` là intent có slot, và câu đó parse ra được ít nhất một slot → đây là tinh chỉnh. Giữ nguyên intent, cập nhật slot, không đổi widget.

"200 nghìn thôi" sửa lệnh FX đang hiện. "dòng tiền tuần này" vẫn nhảy intent như thường.

## 4. Luồng

```
chạm nói → STT → resolveTurn(text, activeIntent, pendingSlot)
                     │
                     ├── pendingSlot ≠ null → parse đúng slot đang chờ → chạy intent
                     ├── keyword khớp       → intent + slot parse được từ chính câu đó
                     ├── tinh chỉnh         → giữ intent, đổi slot
                     └── LLM tầng 3         → { intentId, slots } dạng JSON
                                              │
                        thiếu slot required ──┤
                                              │
                              ┌───────────────┴───────────────┐
                              │                               │
                    hỏi ngược + chip đổi              chạy intent
                    thành lựa chọn slot               (widget + thoại)
```

Khi chờ slot, chip bar hiển thị `options` của slot cộng nút **Thôi**. Chạm nút Thôi huỷ lượt chờ và trả chip về bình thường. Đây là đường lui bắt buộc: STT hỏng giữa lượt hỏi ngược mà không có đường lui thì phiên demo kẹt cứng.

## 5. Numeric guard với slot

Guard hiện tại chặn mọi con số không nằm trong `intent.allowedNumbers`. Slot sinh số mới (500.000 USD → chi phí kỳ hạn khác, tiết kiệm ròng khác) nên danh sách phải nở ra theo slot:

```ts
allowedNumbersFor(intentId, slots) = intent.allowedNumbers ∪ intent.derivedNumbers(slots)
```

`derivedNumbers` **tính bằng code**, không chép tay — cùng nguyên tắc đã áp cho `allowedFor`. Ví dụ `FX_FORWARD` trả về mọi cách đọc của `amountUsd`, `fxForwardCost`, `fxFloatRisk`, `fxSaving` tại đúng giá trị slot.

Hệ quả: các hàm trong `calc.ts` nhận thêm tham số tuỳ chọn, mặc định vẫn đọc fixtures nên mọi chỗ gọi cũ không đổi.

`fixtures.periodCompare` mở rộng thành bảng ba tháng để slot `month` có dữ liệu thật. Extras `19,8` và `12,6` đang khai báo tay được thay bằng hàm tính cho cả ba tháng.

## 6. Chip động

Bỏ bảng `nextChips` cứng khỏi đường chạy (giữ trong registry làm thứ tự ưu tiên tự nhiên). Hàm `nextChipsFor(intentId, history)` trong `src/lib/intents/chips.ts` chấm điểm ứng viên:

1. Loại mọi intent đã có trong `history`
2. `nextChips` của intent hiện tại đứng trước
3. Cùng `group` với intent hiện tại đứng kế
4. Luật trạng thái: đã xem `FRAUD_ALERT` mà chưa `REJECT_ORDER` → đẩy lên đầu; đã xem `TRADE_FINANCE` mà chưa `APPROVE_FIDO` → đẩy lên đầu; `history.length ≥ 5` → `SESSION_SUMMARY` vào vị trí cuối
5. Cạn ứng viên mới → cho phép lặp lại theo `nextChips` gốc

Luôn trả đúng 3 phần tử, không bao giờ chứa `UNKNOWN`.

## 7. Ngữ cảnh nối lượt

`/api/reply` nhận thêm `{ slots, history }`. `history` truyền xuống dưới dạng **nhãn intent**, không kèm số:

```
Các nội dung đã báo cáo trong phiên: Dòng tiền 7 ngày, Lệnh chờ duyệt.
Được phép nhắc tên các nội dung này để nối mạch, nhưng CẤM nhắc lại con số của chúng.
```

Không truyền số của lượt cũ là điều kiện để guard giữ nguyên độ chặt: guard chỉ biết `allowedNumbers` của intent hiện tại, nên mọi con số từ lượt trước đều là vi phạm.

## 8. Vòng đời phiên

- **Mở phiên**: sau `GREETING`, Friday nêu agenda dựng từ trạng thái fixtures — số lệnh chờ duyệt, số cảnh báo, số nghĩa vụ tới hạn. Câu này `fixedLine` (không qua LLM) vì là khung phiên, không phải nội dung nghiệp vụ.
- **Chốt phiên**: `SESSION_SUMMARY` đọc `history` thật thay vì câu cố định — liệt kê đúng những gì đã xem và đã ký trong phiên.

## 9. Vì sao hoãn hạng mục F

Fixtures biến thiên theo seed đòi hỏi seed **chung giữa server và client**. Hiện `fixtures` là hằng số module-scope, và `registry.ts` dựng `fallbackLine` ngay lúc import. Nếu seed sinh độc lập ở hai phía, `/api/reply` sẽ nói số của bộ fixtures này trong khi widget vẽ số của bộ kia — lệch số giữa lời và hình, đúng thứ mà `hardcoded-numbers.test.ts` sinh ra để ngăn.

Làm đúng cần: `fixtures` → `fixturesFor(seed)`, `fallbackLine` → hàm nhận seed, client sinh seed lúc mount và gửi kèm mọi request. Đó là refactor xuyên suốt hơn 20 file. Tách thành đợt 2, sau khi đợt 1 đã xanh.

## 10. Tiêu chí nghiệm thu

| Hạng mục | Ngưỡng |
|---|---|
| Độ phủ keyword bộ 50 câu | ≥ 90% (giữ nguyên) |
| Parse slot | Mỗi slot có test cho ít nhất 3 cách nói |
| Lượt tinh chỉnh | "200 nghìn thôi" sau `FX_FORWARD` giữ nguyên intent |
| Guard với slot | Số dẫn xuất từ mọi tổ hợp slot đều lọt guard |
| Chip động | Không bao giờ gợi ý intent đã chạy khi còn ứng viên khác |
| Đường lui | Chờ slot luôn có nút Thôi; chạm là thoát sạch trạng thái |
| Test hiện có | `bun test` xanh toàn bộ |
