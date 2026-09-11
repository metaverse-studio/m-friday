# MSB Virtual RM — Phase 2: Kịch bản, PWA & Nghiệm thu

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng 13 widget còn lại, biến ứng dụng thành PWA chạy được offline, và chạy trọn bộ tiêu chí nghiệm thu §7 của spec.

**Architecture:** Mọi widget đọc dữ liệu từ `fixtures.ts` và được đăng ký vào bảng `WIDGETS` trong `WidgetHost.tsx`. Không widget nào gọi API, không widget nào giữ state riêng — chúng là hàm thuần từ fixtures ra JSX. Các lệnh đổi trạng thái đi qua một modal FIDO mô phỏng dùng chung.

**Tech Stack:** Kế thừa Phase 1, bổ sung `@serwist/next@9.5.12` cho Service Worker.

**Spec:** `docs/specs/2026-09-11-virtual-rm-mvp-design.md` (v1.1.1)

**Điều kiện tiên quyết:** Phase 1 đã hoàn thành (`docs/plans/2026-09-12-virtual-rm-phase-1-core.md`), `bun test` xanh, demo chạy end-to-end với `CASH_FLOW`.

## Ghi chú đo đạc từ Phase 1

Điền hai con số này trước khi bắt đầu Task 13 — chúng quyết định có cần tối ưu ở Task 21 hay không:

- Time-to-first-audio đo trên điện thoại thật: `______ ms`
- Độ phủ keyword thực tế trên bộ 50 câu thử: `______ %`

## Global Constraints

Giống Phase 1. Nhắc lại các mục hay bị vi phạm nhất khi dựng widget:

- **Nguồn số liệu duy nhất**: `src/lib/data/fixtures.ts`. Widget **cấm** hardcode con số, kể cả trong nhãn phụ hay chú thích biểu đồ.
- **Số dẫn xuất phải gọi hàm trong `calc.ts`**, không tính tay trong JSX.
- **Alert Red `#EF4444` chỉ dùng cho `FRAUD_ALERT`.** Widget khác cần màu cảnh báo thì dùng `text-msb-orange`.
- **Tiếng Việt có dấu đầy đủ** trong mọi chuỗi hiển thị.
- **Không hiển thị lỗi lên giao diện.** Ghi `console.error` rồi rơi xuống tầng dự phòng.
- Màu: Obsidian `#0B0E14` · Sapphire `#101520` · Card `#161E2E` · MSB Orange `#EB5824` · MSB Gold `#FBB03B` · Emerald `#10B981`

## Quy ước chung cho mọi widget

Mọi widget trong Phase 2 tuân theo cùng một khuôn để giao diện đồng nhất:

```tsx
<motion.section
  initial={{ opacity: 0, y: 16 }}
  animate={{ opacity: 1, y: 0 }}
  className="rounded-2xl border border-white/10 bg-card p-4"
>
  <h2 className="text-sm text-white/60">{/* Tiêu đề */}</h2>
  {/* Nội dung */}
</motion.section>
```

---

## Cấu trúc File Phase 2

| File | Trách nhiệm |
|---|---|
| `src/components/widgets/ObligationWidget.tsx` | Timeline nghĩa vụ chi |
| `src/components/widgets/PeriodCompareWidget.tsx` | Cột đôi so sánh kỳ |
| `src/components/widgets/TxnHistoryWidget.tsx` | Bảng kê biến động số dư |
| `src/components/widgets/RecentActionsWidget.tsx` | Tóm tắt phiên + hàng chờ |
| `src/components/widgets/TradeFinanceWidget.tsx` | Hạn mức L/C & Bảo lãnh |
| `src/components/widgets/FraudAlertWidget.tsx` | Cảnh báo đỏ |
| `src/components/widgets/CctgWidget.tsx` | Card chứng chỉ tiền gửi |
| `src/components/widgets/FxForwardWidget.tsx` | Tỷ giá và lệnh kỳ hạn |
| `src/components/widgets/LoanWidget.tsx` | Khế ước nhận nợ |
| `src/components/widgets/HotlineWidget.tsx` | Modal gọi + chuông |
| `src/components/widgets/SessionSummaryWidget.tsx` | Tóm tắt phiên + gửi email |
| `src/components/widgets/UnknownWidget.tsx` | Chuyển RM thật |
| `src/components/widgets/ApprovalWidget.tsx` | Dùng chung cho duyệt và trả lệnh |
| `src/components/fido/FidoModal.tsx` | Modal sinh trắc học mô phỏng |
| `src/lib/data/txns.ts` | Dữ liệu bảng kê giao dịch |
| `src/app/sw.ts` | Service Worker |
| `public/manifest.json` | Manifest PWA |
| `scripts/check-latency.ts` | Script đo độ trễ |

---

### Task 13: Modal FIDO mô phỏng dùng chung

Bốn intent cần xác thực trước khi đổi trạng thái. Dựng modal trước để các widget sau dùng lại.

**Files:**
- Create: `src/components/fido/FidoModal.tsx`
- Modify: `src/lib/session.ts`

**Interfaces:**
- Consumes: `useSession` từ Phase 1 Task 9
- Produces:
  - State bổ sung: `fidoPrompt: { label: string; onConfirm: () => void } | null`
  - Action bổ sung: `requestFido(label, onConfirm)`, `closeFido()`
  - `<FidoModal />`

- [ ] **Step 1: Bổ sung state FIDO vào `src/lib/session.ts`**

Thêm vào khai báo `SessionState`, ngay sau `lastLatencyMs`:

```ts
  fidoPrompt: { label: string; onConfirm: () => void } | null
```

Thêm vào phần action, sau `recordLatency`:

```ts
  requestFido: (label: string, onConfirm: () => void) => void
  closeFido: () => void
```

Thêm vào object khởi tạo, sau `lastLatencyMs: null,`:

```ts
  fidoPrompt: null,
```

Thêm vào phần cài đặt action, sau `recordLatency`:

```ts
  requestFido: (label, onConfirm) => set({ fidoPrompt: { label, onConfirm } }),
  closeFido: () => set({ fidoPrompt: null }),
```

Thêm `fidoPrompt: null,` vào object trong `resetSession`.

- [ ] **Step 2: Viết `src/components/fido/FidoModal.tsx`**

```tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ScanFace } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSession } from '@/lib/session'

const SCAN_DURATION_MS = 1_400

export function FidoModal() {
  const prompt = useSession((s) => s.fidoPrompt)
  const closeFido = useSession((s) => s.closeFido)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!prompt) {
      setDone(false)
      return
    }
    const timer = setTimeout(() => {
      setDone(true)
      prompt.onConfirm()
      setTimeout(closeFido, 600)
    }, SCAN_DURATION_MS)
    return () => clearTimeout(timer)
  }, [prompt, closeFido])

  return (
    <AnimatePresence>
      {prompt && (
        <motion.div
          className="fixed inset-0 z-60 flex flex-col items-center justify-center gap-6 bg-obsidian/95"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative flex size-36 items-center justify-center rounded-full border border-msb-gold/30 bg-card">
            {!done && (
              <motion.span
                className="absolute inset-0 rounded-full border-2 border-msb-gold"
                animate={{ scale: [1, 1.3], opacity: [0.9, 0] }}
                transition={{ duration: 1, repeat: Infinity, ease: 'easeOut' }}
              />
            )}
            <ScanFace
              className={done ? 'size-14 text-signal' : 'size-14 text-msb-gold'}
              strokeWidth={1.2}
            />
          </div>

          <div className="text-center">
            <p className="text-sm text-white/80">{prompt.label}</p>
            <p className="mt-1 text-xs text-white/45">
              {done ? 'Xác thực thành công' : 'Đang xác thực sinh trắc học…'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 3: Gắn modal vào `src/components/Dashboard.tsx`**

Thêm import:

```tsx
import { FidoModal } from './fido/FidoModal'
```

Thêm `<FidoModal />` ngay trước `<Drawer ... />` trong phần JSX trả về.

- [ ] **Step 4: Chặn intent cần FIDO trong `src/lib/useVoiceTurn.ts`**

Trong `runIntent`, thay dòng `markIntent(id)` bằng:

```ts
      const intent = getIntent(id)
      if (intent.requiresFido) {
        await new Promise<void>((resolve) => {
          store.getState().requestFido(`Xác thực để ${intent.label.toLowerCase()}`, resolve)
        })
      }
      markIntent(id)
```

- [ ] **Step 5: Kiểm tra**

Run: `bun dev`, chạm chip "Gợi ý CCTG" trong ngăn kéo.
Expected: modal quét sinh trắc học hiện ra khoảng 1,4 giây, báo thành công, rồi RM mới nói. Chip không cần FIDO (ví dụ "Dòng tiền 7 ngày") phải chạy thẳng, không hiện modal.

- [ ] **Step 6: Commit**

```bash
git add src/components/fido src/lib/session.ts src/lib/useVoiceTurn.ts src/components/Dashboard.tsx
git commit -m "feat: modal FIDO mô phỏng chặn các lệnh đổi trạng thái"
```

---

### Task 14: Nhóm Phân tích — ba widget

**Files:**
- Create: `src/lib/data/txns.ts`
- Create: `src/components/widgets/ObligationWidget.tsx`
- Create: `src/components/widgets/PeriodCompareWidget.tsx`
- Create: `src/components/widgets/TxnHistoryWidget.tsx`
- Modify: `src/components/widgets/WidgetHost.tsx`

**Interfaces:**
- Consumes: `fixtures`, `formatTy`, `formatPercent`, `obligationTotal`, `periodGrowthInflow`
- Produces: `<ObligationWidget />`, `<PeriodCompareWidget />`, `<TxnHistoryWidget />`, `transactions`

- [ ] **Step 1: Viết `src/lib/data/txns.ts`**

```ts
export const transactions = [
  {
    id: 'TXN-0912-01',
    time: '09:14',
    account: 'VND · 0210 4567 8901',
    description: 'Thu tiền hàng Công ty Phân phối Minh Long',
    amount: 4_200_000_000,
    direction: 'in' as const,
  },
  {
    id: 'TXN-0912-02',
    time: '10:02',
    account: 'VND · 0210 4567 8901',
    description: 'Thanh toán nhà cung cấp Linh kiện Đại Việt',
    amount: 1_850_000_000,
    direction: 'out' as const,
  },
  {
    id: 'TXN-0912-03',
    time: '10:47',
    account: 'USD · 0210 9988 7766',
    description: 'Ký quỹ mở L/C nhập khẩu Siemens AG',
    amount: 1_309_000_000,
    direction: 'out' as const,
  },
  {
    id: 'TXN-0912-04',
    time: '11:20',
    account: 'VND · 0210 4567 8901',
    description: 'Thu công nợ đại lý khu vực miền Trung',
    amount: 2_650_000_000,
    direction: 'in' as const,
  },
  {
    id: 'TXN-0912-05',
    time: '13:35',
    account: 'VND · 0210 4567 8901',
    description: 'Nộp bảo hiểm xã hội tháng 9',
    amount: 640_000_000,
    direction: 'out' as const,
  },
]
```

- [ ] **Step 2: Viết `src/components/widgets/ObligationWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { obligationTotal } from '@/lib/data/calc'
import { fixtures } from '@/lib/data/fixtures'
import { formatTy } from '@/lib/data/format'

export function ObligationWidget() {
  const { vatDue, payroll, operatingReserve } = fixtures.obligations

  const items = [
    { date: vatDue.date, label: vatDue.label, amount: vatDue.amount, note: '' },
    {
      date: payroll.date,
      label: payroll.label,
      amount: payroll.amount,
      note: `${payroll.headcount} nhân sự`,
    },
    { date: '—', label: 'Dự phòng vận hành', amount: operatingReserve, note: '' },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <h2 className="text-sm text-white/60">Nghĩa vụ chi 30 ngày tới</h2>

      <p className="mt-1 text-2xl font-semibold text-msb-orange">
        {formatTy(obligationTotal())} VNĐ
      </p>

      <ul className="mt-4 space-y-3">
        {items.map((item) => (
          <li key={item.label} className="flex items-start gap-3">
            <span className="w-12 shrink-0 pt-0.5 text-xs text-msb-gold">{item.date}</span>
            <span className="flex-1 text-sm text-white/80">
              {item.label}
              {item.note && <span className="block text-xs text-white/40">{item.note}</span>}
            </span>
            <span className="text-sm text-white/90">{formatTy(item.amount)}</span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/50">
        Số dư khả dụng {formatTy(fixtures.balance.availableVnd)} VNĐ — đủ đáp ứng
      </p>
    </motion.section>
  )
}
```

- [ ] **Step 3: Viết `src/components/widgets/PeriodCompareWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { periodGrowthInflow } from '@/lib/data/calc'
import { fixtures } from '@/lib/data/fixtures'
import { formatPercent, formatTy } from '@/lib/data/format'

export function PeriodCompareWidget() {
  const { month, inflowThis, inflowLast, outflowThis, outflowLast } = fixtures.periodCompare
  const peak = Math.max(inflowThis, inflowLast, outflowThis, outflowLast)

  const pairs = [
    { label: 'Dòng thu', now: inflowThis, before: inflowLast, tone: 'bg-signal' },
    { label: 'Dòng chi', now: outflowThis, before: outflowLast, tone: 'bg-msb-orange' },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <h2 className="text-sm text-white/60">{month} so với cùng kỳ</h2>

      <p className="mt-1 text-2xl font-semibold text-signal">
        +{formatPercent(periodGrowthInflow())}
      </p>

      <div className="mt-4 space-y-4">
        {pairs.map((pair) => (
          <div key={pair.label}>
            <div className="mb-1 flex justify-between text-xs text-white/50">
              <span>{pair.label}</span>
              <span>
                {formatTy(pair.now)} · trước {formatTy(pair.before)}
              </span>
            </div>
            <div className="space-y-1">
              <div
                className={`h-3 rounded ${pair.tone}`}
                style={{ width: `${(pair.now / peak) * 100}%` }}
              />
              <div
                className="h-3 rounded bg-white/15"
                style={{ width: `${(pair.before / peak) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/40">
        Thanh đậm là kỳ này, thanh mờ là cùng kỳ năm trước
      </p>
    </motion.section>
  )
}
```

- [ ] **Step 4: Viết `src/components/widgets/TxnHistoryWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { formatTy } from '@/lib/data/format'
import { transactions } from '@/lib/data/txns'

export function TxnHistoryWidget() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <h2 className="text-sm text-white/60">Biến động số dư trong ngày</h2>

      <ul className="mt-3 divide-y divide-white/5">
        {transactions.map((txn) => (
          <li key={txn.id} className="flex items-start gap-3 py-3">
            <span className="w-11 shrink-0 pt-0.5 text-xs text-white/40">{txn.time}</span>
            <span className="flex-1">
              <span className="block text-sm text-white/85">{txn.description}</span>
              <span className="block text-xs text-white/35">{txn.account}</span>
            </span>
            <span
              className={
                txn.direction === 'in'
                  ? 'shrink-0 text-sm text-signal'
                  : 'shrink-0 text-sm text-msb-orange'
              }
            >
              {txn.direction === 'in' ? '+' : '−'}
              {formatTy(txn.amount)}
            </span>
          </li>
        ))}
      </ul>
    </motion.section>
  )
}
```

- [ ] **Step 5: Đăng ký ba widget vào `src/components/widgets/WidgetHost.tsx`**

Thêm import:

```tsx
import { ObligationWidget } from './ObligationWidget'
import { PeriodCompareWidget } from './PeriodCompareWidget'
import { TxnHistoryWidget } from './TxnHistoryWidget'
```

Bổ sung vào bảng `WIDGETS`:

```tsx
  OBLIGATION_CALENDAR: ObligationWidget,
  PERIOD_COMPARE: PeriodCompareWidget,
  TXN_HISTORY: TxnHistoryWidget,
```

- [ ] **Step 6: Kiểm tra**

Run: `bunx tsc --noEmit && bun dev`

Mở ngăn kéo, chạm lần lượt "Lịch chi sắp tới", "So sánh kỳ", "Lịch sử giao dịch".
Expected: mỗi lệnh hiện widget tương ứng kèm lời thoại. Con số trên widget phải khớp với con số RM đọc — nếu lệch, có chỗ hardcode thay vì đọc fixtures.

- [ ] **Step 7: Commit**

```bash
git add src/lib/data/txns.ts src/components/widgets
git commit -m "feat: ba widget nhóm Phân tích"
```

---

### Task 15: Nhóm Phê duyệt — bốn widget

**Files:**
- Create: `src/components/widgets/RecentActionsWidget.tsx`
- Create: `src/components/widgets/TradeFinanceWidget.tsx`
- Create: `src/components/widgets/FraudAlertWidget.tsx`
- Create: `src/components/widgets/ApprovalWidget.tsx`
- Modify: `src/components/widgets/WidgetHost.tsx`

**Interfaces:**
- Consumes: `fixtures`, `formatTy`, `formatTrieu`, `useSession`
- Produces: bốn component trên; `ApprovalWidget` phục vụ cả `APPROVE_FIDO` và `REJECT_ORDER` qua `useSession().activeIntent`

- [ ] **Step 1: Viết `src/components/widgets/RecentActionsWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Clock } from 'lucide-react'
import { fixtures } from '@/lib/data/fixtures'
import { formatTy } from '@/lib/data/format'

export function RecentActionsWidget() {
  const { postedCount, postedTotal, postedValue, pendingInternational, pendingGuarantee } =
    fixtures.session

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <h2 className="text-sm text-white/60">Phiên giao dịch hôm nay</h2>

      <div className="mt-3 flex items-center gap-2">
        <CheckCircle2 className="size-5 text-signal" strokeWidth={1.6} />
        <span className="text-lg font-semibold text-white">
          {postedCount}/{postedTotal} lệnh hạch toán
        </span>
      </div>
      <p className="mt-1 text-sm text-white/55">
        Tổng giá trị {formatTy(postedValue)} VNĐ
      </p>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-msb-gold" strokeWidth={1.6} />
          <span className="text-sm text-white/80">
            {String(pendingInternational).padStart(2, '0')} lệnh thanh toán quốc tế chờ duyệt
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-msb-gold" strokeWidth={1.6} />
          <span className="text-sm text-white/80">
            {String(pendingGuarantee).padStart(2, '0')} đề nghị phát hành bảo lãnh chờ duyệt
          </span>
        </div>
      </div>
    </motion.section>
  )
}
```

- [ ] **Step 2: Viết `src/components/widgets/TradeFinanceWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { fixtures } from '@/lib/data/fixtures'
import { formatTy } from '@/lib/data/format'

function LimitBar({
  title,
  available,
  total,
}: {
  title: string
  available: number
  total: number
}) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs">
        <span className="text-white/60">{title}</span>
        <span className="text-white/85">
          {formatTy(available)} / {formatTy(total)}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded bg-white/10">
        <div
          className="h-full rounded bg-msb-gold"
          style={{ width: `${(available / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

export function TradeFinanceWidget() {
  const { lc, guarantee, pendingLc, pendingGuarantee } = fixtures.tradeFinance

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <h2 className="text-sm text-white/60">Hạn mức tài trợ thương mại</h2>

      <div className="mt-4 space-y-4">
        <LimitBar title="Thư tín dụng L/C" available={lc.available} total={lc.total} />
        <LimitBar
          title="Bảo lãnh ngân hàng"
          available={guarantee.available}
          total={guarantee.total}
        />
      </div>

      <div className="mt-4 space-y-2 border-t border-white/10 pt-3">
        <p className="text-xs uppercase tracking-wider text-msb-gold/70">Đang chờ duyệt</p>
        <p className="text-sm text-white/80">
          L/C nhập khẩu {pendingLc.partner} —{' '}
          {pendingLc.amountUsd.toLocaleString('vi-VN')} USD, đáo hạn {pendingLc.dueDate}
        </p>
        <p className="text-sm text-white/80">
          Bảo lãnh thực hiện hợp đồng {pendingGuarantee.project} —{' '}
          {formatTy(pendingGuarantee.amount)} VNĐ
        </p>
      </div>
    </motion.section>
  )
}
```

- [ ] **Step 3: Viết `src/components/widgets/FraudAlertWidget.tsx`**

Đây là widget duy nhất được dùng màu `alert`.

```tsx
'use client'

import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'
import { fixtures } from '@/lib/data/fixtures'
import { formatTrieu } from '@/lib/data/format'

export function FraudAlertWidget() {
  const { amount, makerName, createdAt, signals } = fixtures.fraud

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-alert/40 bg-card p-4"
    >
      <div className="flex items-center gap-2">
        <AlertTriangle className="size-5 text-alert" strokeWidth={1.8} />
        <h2 className="text-sm text-alert">Giao dịch cần xem kỹ</h2>
      </div>

      <p className="mt-3 text-2xl font-semibold text-white">{formatTrieu(amount)} VNĐ</p>
      <p className="mt-1 text-sm text-white/55">
        Maker {makerName} · tạo lúc {createdAt}
      </p>

      <ul className="mt-4 space-y-2 border-t border-white/10 pt-3">
        {signals.map((signal) => (
          <li key={signal} className="flex gap-2 text-sm text-white/75">
            <span className="text-alert">•</span>
            {signal}
          </li>
        ))}
      </ul>

      <p className="mt-4 rounded-xl bg-alert/10 px-3 py-2 text-xs text-alert">
        Em đã tạm giữ lệnh này, chờ anh xác nhận
      </p>
    </motion.section>
  )
}
```

- [ ] **Step 4: Viết `src/components/widgets/ApprovalWidget.tsx`**

Một component phục vụ hai intent, vì hai màn hình chỉ khác nhau ở nhãn và màu.

```tsx
'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, Undo2 } from 'lucide-react'
import { fixtures } from '@/lib/data/fixtures'
import { formatTrieu, formatTy } from '@/lib/data/format'
import { useSession } from '@/lib/session'

export function ApprovalWidget() {
  const activeIntent = useSession((s) => s.activeIntent)
  const isReject = activeIntent === 'REJECT_ORDER'

  const { pendingGuarantee } = fixtures.tradeFinance
  const { amount, makerName } = fixtures.fraud

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <div className="flex items-center gap-2">
        {isReject ? (
          <Undo2 className="size-5 text-msb-orange" strokeWidth={1.8} />
        ) : (
          <CheckCircle2 className="size-5 text-signal" strokeWidth={1.8} />
        )}
        <h2 className="text-sm text-white/70">
          {isReject ? 'Đã trả lệnh về Maker' : 'Đã ký duyệt điện tử'}
        </h2>
      </div>

      {isReject ? (
        <>
          <p className="mt-3 text-lg font-medium text-white">{formatTrieu(amount)} VNĐ</p>
          <p className="mt-1 text-sm text-white/55">Trả về cho Maker {makerName}</p>
          <p className="mt-4 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/70">
            Ghi chú: thiếu hóa đơn đầu vào
          </p>
        </>
      ) : (
        <>
          <p className="mt-3 text-lg font-medium text-white">
            {formatTy(pendingGuarantee.amount)} VNĐ
          </p>
          <p className="mt-1 text-sm text-white/55">
            Bảo lãnh thực hiện hợp đồng {pendingGuarantee.project}
          </p>
          <p className="mt-4 rounded-xl bg-signal/10 px-3 py-2 text-sm text-signal">
            Đã xác thực bằng sinh trắc học FIDO
          </p>
        </>
      )}
    </motion.section>
  )
}
```

- [ ] **Step 5: Đăng ký vào `src/components/widgets/WidgetHost.tsx`**

Thêm import:

```tsx
import { ApprovalWidget } from './ApprovalWidget'
import { FraudAlertWidget } from './FraudAlertWidget'
import { RecentActionsWidget } from './RecentActionsWidget'
import { TradeFinanceWidget } from './TradeFinanceWidget'
```

Bổ sung vào bảng `WIDGETS`:

```tsx
  RECENT_ACTIONS: RecentActionsWidget,
  TRADE_FINANCE: TradeFinanceWidget,
  FRAUD_ALERT: FraudAlertWidget,
  APPROVE_FIDO: ApprovalWidget,
  REJECT_ORDER: ApprovalWidget,
```

- [ ] **Step 6: Kiểm tra**

Run: `bunx tsc --noEmit && bun dev`

Chạy lần lượt bốn kịch bản trong ngăn kéo.
Expected: `APPROVE_FIDO` và `REJECT_ORDER` đều hiện modal sinh trắc học trước. Màu đỏ `alert` chỉ xuất hiện ở `FRAUD_ALERT`.

- [ ] **Step 7: Commit**

```bash
git add src/components/widgets
git commit -m "feat: bốn widget nhóm Phê duyệt"
```

---

### Task 16: Nhóm Tư vấn — ba widget

**Files:**
- Create: `src/components/widgets/CctgWidget.tsx`
- Create: `src/components/widgets/FxForwardWidget.tsx`
- Create: `src/components/widgets/LoanWidget.tsx`
- Modify: `src/components/widgets/WidgetHost.tsx`

**Interfaces:**
- Consumes: `cctgYield`, `idleCash`, `obligationTotal`, `fxForwardCost`, `fxFloatRisk`, `fxSaving`
- Produces: ba component trên

- [ ] **Step 1: Viết `src/components/widgets/CctgWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { cctgYield, idleCash, obligationTotal } from '@/lib/data/calc'
import { fixtures } from '@/lib/data/fixtures'
import { formatPercent, formatTrieu, formatTy } from '@/lib/data/format'

export function CctgWidget() {
  const { principal, termDays, annualRate, bufferKept } = fixtures.cctg

  const rows = [
    { label: 'Số dư khả dụng', value: formatTy(fixtures.balance.availableVnd) },
    { label: 'Trừ nghĩa vụ sắp tới', value: `− ${formatTy(obligationTotal())}` },
    { label: 'Tiền nhàn rỗi', value: formatTy(idleCash()) },
  ]

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-msb-gold/30 bg-card p-4"
    >
      <h2 className="text-sm text-msb-gold">Chứng chỉ tiền gửi MSB Corporate</h2>

      <p className="mt-3 text-2xl font-semibold text-white">{formatTy(principal)} VNĐ</p>
      <p className="mt-1 text-sm text-white/55">
        Kỳ hạn {termDays} ngày · lãi suất {formatPercent(annualRate * 100)}/năm
      </p>

      <div className="mt-4 space-y-1.5 border-t border-white/10 pt-3">
        {rows.map((row) => (
          <div key={row.label} className="flex justify-between text-sm">
            <span className="text-white/55">{row.label}</span>
            <span className="text-white/85">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl bg-signal/10 px-3 py-3">
        <p className="text-xs text-white/60">Lợi tức dự kiến</p>
        <p className="mt-0.5 text-lg font-semibold text-signal">
          {formatTrieu(cctgYield())} VNĐ
        </p>
        <p className="mt-1 text-xs text-white/45">
          Vẫn giữ đệm thanh khoản {formatTy(bufferKept)} VNĐ
        </p>
      </div>
    </motion.section>
  )
}
```

- [ ] **Step 2: Viết `src/components/widgets/FxForwardWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { fxFloatRisk, fxForwardCost, fxSaving } from '@/lib/data/calc'
import { fixtures } from '@/lib/data/fixtures'
import { formatPercent, formatTrieu } from '@/lib/data/format'

export function FxForwardWidget() {
  const { spotSellRate, forwardRate, twoWeekChangePercent } = fixtures.fx
  const { pendingLc } = fixtures.tradeFinance

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <h2 className="text-sm text-white/60">Tỷ giá USD/VND</h2>

      <div className="mt-3 flex items-baseline gap-3">
        <span className="text-2xl font-semibold text-white">
          {spotSellRate.toLocaleString('vi-VN')}
        </span>
        <span className="text-sm text-msb-orange">
          +{formatPercent(twoWeekChangePercent)} / 2 tuần
        </span>
      </div>

      <p className="mt-1 text-sm text-white/55">
        Khoản thanh toán {pendingLc.partner} —{' '}
        {pendingLc.amountUsd.toLocaleString('vi-VN')} USD, đáo hạn {pendingLc.dueDate}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3">
        <div className="rounded-xl bg-white/5 p-3">
          <p className="text-xs text-white/50">Thả nổi</p>
          <p className="mt-1 text-base font-medium text-msb-orange">
            {formatTrieu(fxFloatRisk())}
          </p>
          <p className="mt-0.5 text-[11px] text-white/35">chi phí phát sinh</p>
        </div>
        <div className="rounded-xl bg-signal/10 p-3">
          <p className="text-xs text-white/50">Khóa kỳ hạn</p>
          <p className="mt-1 text-base font-medium text-signal">
            {formatTrieu(fxForwardCost())}
          </p>
          <p className="mt-0.5 text-[11px] text-white/35">
            tại {forwardRate.toLocaleString('vi-VN')}
          </p>
        </div>
      </div>

      <p className="mt-3 text-center text-sm text-msb-gold">
        Tiết kiệm khoảng {formatTrieu(fxSaving())} VNĐ
      </p>
    </motion.section>
  )
}
```

- [ ] **Step 3: Viết `src/components/widgets/LoanWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { fixtures } from '@/lib/data/fixtures'
import { formatPercent, formatTy } from '@/lib/data/format'

export function LoanWidget() {
  const { outstanding, limit, contractCount, nearest } = fixtures.loan
  const available = limit - outstanding

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <h2 className="text-sm text-white/60">Dư nợ vay ngắn hạn</h2>

      <p className="mt-3 text-2xl font-semibold text-white">{formatTy(outstanding)} VNĐ</p>
      <p className="mt-1 text-sm text-white/55">
        Trên hạn mức {formatTy(limit)} · còn khả dụng {formatTy(available)}
      </p>

      <div className="mt-3 h-2 overflow-hidden rounded bg-white/10">
        <div
          className="h-full rounded bg-msb-orange"
          style={{ width: `${(outstanding / limit) * 100}%` }}
        />
      </div>

      <div className="mt-4 border-t border-white/10 pt-3">
        <p className="text-xs uppercase tracking-wider text-msb-gold/70">
          {contractCount} khế ước nhận nợ
        </p>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-sm text-white/80">
            Khế ước gần nhất
            <span className="block text-xs text-white/40">
              Đáo hạn {nearest.dueDate} · {formatPercent(nearest.annualRate * 100)}/năm
            </span>
          </span>
          <span className="text-sm text-white/90">{formatTy(nearest.amount)}</span>
        </div>
      </div>
    </motion.section>
  )
}
```

- [ ] **Step 4: Đăng ký vào `src/components/widgets/WidgetHost.tsx`**

Thêm import:

```tsx
import { CctgWidget } from './CctgWidget'
import { FxForwardWidget } from './FxForwardWidget'
import { LoanWidget } from './LoanWidget'
```

Bổ sung vào bảng `WIDGETS`:

```tsx
  SUGGEST_CCTG: CctgWidget,
  FX_FORWARD: FxForwardWidget,
  LOAN_BALANCE: LoanWidget,
```

- [ ] **Step 5: Kiểm tra tính nhất quán số liệu**

Run: `bun dev`, chạy "Gợi ý CCTG".

Đối chiếu thủ công widget với `bun test src/lib/data/calc.test.ts`:
- Tiền nhàn rỗi hiển thị **17,4 tỷ**
- Lợi tức hiển thị **33,3 triệu**
- Số dư 27,5 tỷ trừ nghĩa vụ 10,1 tỷ đúng bằng 17,4 tỷ

Chạy "Khóa tỷ giá Siemens":
- Thả nổi **98,2 triệu**, khóa kỳ hạn **32,5 triệu**, tiết kiệm **65,7 triệu**

Con số trên widget lệch với con số RM đọc nghĩa là có chỗ tính tay trong JSX thay vì gọi `calc.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/components/widgets
git commit -m "feat: ba widget nhóm Tư vấn CCTG, FX Forward và dư nợ vay"
```

---

### Task 17: Nhóm Hỗ trợ và guardrail — ba widget

**Files:**
- Create: `src/components/widgets/HotlineWidget.tsx`
- Create: `src/components/widgets/SessionSummaryWidget.tsx`
- Create: `src/components/widgets/UnknownWidget.tsx`
- Modify: `src/components/widgets/WidgetHost.tsx`
- Add: `public/audio/ringtone.mp3`

**Interfaces:**
- Consumes: `fixtures.contacts`, `useSession().history`, `getIntent`
- Produces: ba component trên

- [ ] **Step 1: Chuẩn bị âm thanh chuông**

Đặt một file chuông điện thoại độ dài 3–5 giây tại `public/audio/ringtone.mp3`. Không có sẵn thì tự sinh bằng ffmpeg:

```bash
mkdir -p public/audio
ffmpeg -f lavfi -i "sine=frequency=425:duration=1" -af "volume=0.3" \
  -f lavfi -i "anullsrc=duration=0.5" -filter_complex "[0][1]concat=n=2:v=0:a=1[a]" \
  -map "[a]" -t 4 -stream_loop 2 public/audio/ringtone.mp3
```

Kiểm tra file phát được: `afplay public/audio/ringtone.mp3`

- [ ] **Step 2: Viết `src/components/widgets/HotlineWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { fixtures } from '@/lib/data/fixtures'

export function HotlineWidget() {
  const { rmName, rmPhone, hotline } = fixtures.contacts
  const ringRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    const audio = new Audio('/audio/ringtone.mp3')
    audio.loop = true
    audio.volume = 0.35
    ringRef.current = audio
    void audio.play().catch((error) => console.error('[hotline] chuông bị chặn:', error))

    return () => {
      audio.pause()
      ringRef.current = null
    }
  }, [])

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4 text-center"
    >
      <motion.div
        className="mx-auto flex size-16 items-center justify-center rounded-full bg-signal/15"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Phone className="size-7 text-signal" strokeWidth={1.6} />
      </motion.div>

      <p className="mt-3 text-sm text-white/60">Đang kết nối</p>
      <p className="mt-1 text-lg font-medium text-white">{rmName}</p>
      <p className="text-sm text-msb-gold">{rmPhone}</p>
      <p className="mt-3 border-t border-white/10 pt-3 text-xs text-white/45">
        Giám đốc Quan hệ Khách hàng Doanh nghiệp phụ trách
        <span className="mt-1 block">Hotline MSB Priority {hotline}</span>
      </p>
    </motion.section>
  )
}
```

- [ ] **Step 3: Viết `src/components/widgets/SessionSummaryWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { MailCheck } from 'lucide-react'
import { getIntent } from '@/lib/intents/registry'
import { useSession } from '@/lib/session'

export function SessionSummaryWidget() {
  const history = useSession((s) => s.history)

  const covered = Array.from(
    new Set(history.filter((id) => id !== 'GREETING' && id !== 'SESSION_SUMMARY')),
  )

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <div className="flex items-center gap-2">
        <MailCheck className="size-5 text-signal" strokeWidth={1.7} />
        <h2 className="text-sm text-white/70">Đã gửi báo cáo phiên làm việc</h2>
      </div>

      {covered.length > 0 ? (
        <ul className="mt-3 space-y-1.5">
          {covered.map((id) => (
            <li key={id} className="flex gap-2 text-sm text-white/75">
              <span className="text-msb-gold">•</span>
              {getIntent(id).label}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-white/45">
          Phiên này chưa có nội dung nghiệp vụ nào để tổng hợp
        </p>
      )}

      <p className="mt-4 border-t border-white/10 pt-3 text-xs text-white/45">
        Báo cáo đã gửi tới hộp thư của Mr Z
      </p>
    </motion.section>
  )
}
```

- [ ] **Step 4: Viết `src/components/widgets/UnknownWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { UserRound } from 'lucide-react'
import { fixtures } from '@/lib/data/fixtures'

export function UnknownWidget() {
  const { rmName, rmPhone } = fixtures.contacts

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <h2 className="text-sm text-white/60">Chuyển tiếp chuyên viên</h2>

      <p className="mt-3 text-sm text-white/75">
        Nội dung này nằm ngoài phạm vi em hỗ trợ trực tiếp. Để đảm bảo chính xác, em xin
        phép chuyển anh sang chuyên viên phụ trách ạ.
      </p>

      <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3">
        <div className="flex size-10 items-center justify-center rounded-full bg-msb-gold/15">
          <UserRound className="size-5 text-msb-gold" strokeWidth={1.6} />
        </div>
        <div>
          <p className="text-sm text-white/90">{rmName}</p>
          <p className="text-xs text-msb-gold">{rmPhone}</p>
        </div>
      </div>
    </motion.section>
  )
}
```

- [ ] **Step 5: Đăng ký và bỏ nhánh dự phòng trong `WidgetHost.tsx`**

Thêm import:

```tsx
import { HotlineWidget } from './HotlineWidget'
import { SessionSummaryWidget } from './SessionSummaryWidget'
import { UnknownWidget } from './UnknownWidget'
```

Bổ sung vào bảng `WIDGETS`:

```tsx
  CALL_HOTLINE: HotlineWidget,
  SESSION_SUMMARY: SessionSummaryWidget,
  UNKNOWN: UnknownWidget,
```

Bảng giờ đã phủ đủ 15 intent có widget, nên đổi khai báo kiểu từ `Partial<Record<...>>` sang bản đầy đủ để TypeScript bắt lỗi thiếu sót. Thay phần đầu file:

```tsx
type WidgetIntentId = Exclude<IntentId, 'FIDO_LOGIN' | 'GREETING'>

const WIDGETS: Record<WidgetIntentId, ComponentType> = {
  // ... 15 mục
}
```

Và đổi thân hàm `WidgetHost`:

```tsx
export function WidgetHost() {
  const activeIntent = useSession((s) => s.activeIntent)
  if (!activeIntent || activeIntent === 'GREETING' || activeIntent === 'FIDO_LOGIN') {
    return null
  }

  const Widget = WIDGETS[activeIntent]
  return <Widget />
}
```

- [ ] **Step 6: Kiểm tra**

Run: `bunx tsc --noEmit`
Expected: nếu thiếu bất kỳ intent nào trong bảng `WIDGETS`, TypeScript báo lỗi ngay tại đây. Đó là mục đích của việc bỏ `Partial`.

Run: `bun dev`, chạy cả ba kịch bản.
Expected: `CALL_HOTLINE` phát chuông; `SESSION_SUMMARY` liệt kê đúng các kịch bản đã chạy trong phiên; chạm "Bắt đầu phiên mới" rồi chạy lại `SESSION_SUMMARY` thì danh sách rỗng.

- [ ] **Step 7: Commit**

```bash
git add public/audio src/components/widgets
git commit -m "feat: ba widget nhóm Hỗ trợ và guardrail, hoàn thiện 15 widget"
```

---

### Task 18: MP3 dự phòng cho mọi intent

Thang suy giảm §6.2 quy định khi TTS hỏng thì rơi về MP3 dự phòng. Task này tạo các file đó.

**Files:**
- Create: `scripts/build-fallback-audio.ts`
- Create: `public/audio/fallback/*.mp3` (15 file)
- Modify: `src/lib/audio/player.ts`

**Interfaces:**
- Consumes: `INTENTS` từ Phase 1 Task 3, `edgeTts` từ Phase 1 Task 7
- Produces: `fallbackUrlFor(intentId): string`; `speak()` nhận thêm tham số `fallbackUrl`

- [ ] **Step 1: Viết `scripts/build-fallback-audio.ts`**

```ts
import { mkdir, writeFile } from 'node:fs/promises'
import { edgeTts } from '../src/lib/audio/providers/edge-tts'
import { INTENTS } from '../src/lib/intents/registry'

const OUTPUT_DIR = 'public/audio/fallback'

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true })

  for (const intent of Object.values(INTENTS)) {
    if (!intent.fallbackLine) continue

    process.stdout.write(`Đang sinh ${intent.id}… `)
    try {
      const audio = await edgeTts.synthesize(intent.fallbackLine)
      await writeFile(`${OUTPUT_DIR}/${intent.id}.mp3`, audio)
      console.log(`xong (${(audio.length / 1024).toFixed(0)} KB)`)
    } catch (error) {
      console.error('thất bại:', error)
    }
  }
}

void main()
```

- [ ] **Step 2: Chạy script**

```bash
bun run scripts/build-fallback-audio.ts
ls -la public/audio/fallback/
```

Expected: 15 file MP3, mỗi file vài chục KB. File 0 byte nghĩa là Edge-TTS đang bị chặn — thử lại sau vài phút hoặc đổi provider theo §4.1 của spec.

- [ ] **Step 3: Bổ sung đường lui vào `src/lib/audio/player.ts`**

Thêm hàm vào cuối file:

```ts
export function fallbackUrlFor(intentId: string): string {
  return `/audio/fallback/${intentId}.mp3`
}
```

Sửa chữ ký `speak` để nhận đường lui:

```ts
export async function speak(
  text: string,
  onFirstAudio?: () => void,
  fallbackUrl?: string,
): Promise<void> {
```

Ngay sau vòng lặp `for (const promise of pending)`, thêm:

```ts
  // Không mảnh nào tổng hợp được — dùng MP3 dựng sẵn
  if (!announced && fallbackUrl) {
    try {
      const response = await fetch(fallbackUrl)
      if (response.ok) {
        onFirstAudio?.()
        await playBlob(await response.blob(), token)
      }
    } catch (error) {
      console.error('[audio] mp3 dự phòng cũng thất bại:', error)
    }
  }
```

- [ ] **Step 4: Truyền đường lui từ `src/lib/useVoiceTurn.ts`**

Sửa lời gọi `speak`:

```ts
      await speak(
        line,
        () => {
          if (startedAt !== undefined) {
            const ms = Math.round(performance.now() - startedAt)
            recordLatency(ms)
            console.info(`[latency] time-to-first-audio: ${ms}ms`)
          }
        },
        fallbackUrlFor(id),
      )
```

Thêm `fallbackUrlFor` vào import từ `./audio/player`.

- [ ] **Step 5: Kiểm tra đường lui thật sự chạy**

Chặn tạm route TTS: mở `src/app/api/tts/route.ts`, thêm `throw new Error('test')` làm dòng đầu trong `try`.

Run: `bun dev`, chạy một kịch bản bất kỳ.
Expected: vẫn nghe được lời thoại (từ MP3 dự phòng), console có `[tts] thất bại`, giao diện **không** hiển thị lỗi nào.

Xóa dòng `throw` sau khi kiểm tra xong.

- [ ] **Step 6: Commit**

```bash
git add scripts public/audio/fallback src/lib/audio/player.ts src/lib/useVoiceTurn.ts
git commit -m "feat: sinh MP3 dự phòng và nối vào thang suy giảm audio"
```

---

### Task 19: PWA và Service Worker

**Files:**
- Create: `public/manifest.json`
- Create: `public/icon-192.png`, `public/icon-512.png`
- Create: `src/app/sw.ts`
- Modify: `next.config.ts`, `src/app/layout.tsx`

**Interfaces:**
- Consumes: không
- Produces: ứng dụng cài được vào màn hình chính, chạy được offline

- [ ] **Step 1: Cài Serwist**

`next-pwa` đã ngừng bảo trì từ 2022 và không tương thích App Router của Next 16.

```bash
bun add @serwist/next@9.5.12
bun add -d serwist@9.5.12
```

- [ ] **Step 2: Tạo icon**

Cần hai icon nền obsidian với chữ MSB màu cam. Sinh nhanh bằng ImageMagick:

```bash
magick -size 512x512 xc:'#0B0E14' \
  -gravity center -pointsize 150 -fill '#EB5824' -annotate 0 'MSB' \
  public/icon-512.png
magick public/icon-512.png -resize 192x192 public/icon-192.png
```

Không có ImageMagick thì dùng bất kỳ ảnh PNG vuông nào đúng kích thước — icon không nằm trong tiêu chí nghiệm thu thị giác.

- [ ] **Step 3: Viết `public/manifest.json`**

```json
{
  "name": "MSB M-Bank Corporate",
  "short_name": "MSB Corporate",
  "description": "Trợ lý Quan hệ Khách hàng Ảo dành cho Khách hàng Doanh nghiệp MSB",
  "start_url": "/",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#0B0E14",
  "theme_color": "#0B0E14",
  "lang": "vi",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

- [ ] **Step 4: Viết `src/app/sw.ts`**

```ts
import { defaultCache } from '@serwist/next/worker'
import type { PrecacheEntry, SerwistGlobalConfig } from 'serwist'
import { Serwist } from 'serwist'

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined
  }
}

declare const self: ServiceWorkerGlobalScope

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: true,
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: defaultCache,
})

serwist.addEventListeners()
```

- [ ] **Step 5: Cấu hình `next.config.ts`**

```ts
import withSerwistInit from '@serwist/next'
import type { NextConfig } from 'next'

const withSerwist = withSerwistInit({
  swSrc: 'src/app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
})

const nextConfig: NextConfig = {}

export default withSerwist(nextConfig)
```

Service Worker bị tắt ở chế độ development để tránh cache làm rối khi đang sửa code. Muốn kiểm tra offline thì phải build production.

- [ ] **Step 6: Khai báo manifest trong `src/app/layout.tsx`**

Bổ sung vào object `metadata`:

```ts
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MSB Corporate',
  },
```

- [ ] **Step 7: Bổ sung `.gitignore`**

```
/public/sw.js
/public/sw.js.map
/public/swe-worker-*.js
```

- [ ] **Step 8: Kiểm tra bản build production**

```bash
bun run build && bun run start
```

Mở `http://localhost:3000`, DevTools → Application → Service Workers.
Expected: service worker trạng thái activated; Manifest hiện tên "MSB M-Bank Corporate" và hai icon.

- [ ] **Step 9: Commit**

```bash
git add next.config.ts public/manifest.json public/icon-*.png src/app/sw.ts src/app/layout.tsx .gitignore
git commit -m "feat: PWA với Serwist service worker và manifest"
```

---

### Task 20: Chạy bộ tiêu chí nghiệm thu

Task này không viết tính năng mới — nó kiểm chứng những gì đã dựng, theo đúng §7 của spec.

**Files:**
- Create: `scripts/check-intent-accuracy.ts`
- Create: `docs/plans/2026-09-12-ket-qua-nghiem-thu.md`

**Interfaces:**
- Consumes: `TEST_PHRASES`, `matchKeyword`
- Produces: báo cáo nghiệm thu có số liệu thật

- [ ] **Step 1: Viết `scripts/check-intent-accuracy.ts`**

Script này đo độ chính xác **qua cả ba tầng**, khác với test đơn vị ở Phase 1 chỉ đo tầng keyword.

```ts
import { TEST_PHRASES } from '../src/lib/intents/phrases.fixture'
import { matchKeyword } from '../src/lib/intents/resolve'
import type { IntentId } from '../src/lib/intents/types'

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3000'

async function classifyViaApi(text: string): Promise<IntentId> {
  const response = await fetch(`${BASE_URL}/api/intent`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  })
  const data = (await response.json()) as { intentId: IntentId }
  return data.intentId
}

async function main() {
  let correct = 0
  let viaKeyword = 0
  const failures: string[] = []

  for (const phrase of TEST_PHRASES) {
    const byKeyword = matchKeyword(phrase.text)
    const actual = byKeyword ?? (await classifyViaApi(phrase.text))
    if (byKeyword) viaKeyword++

    if (actual === phrase.expected) {
      correct++
    } else {
      failures.push(`"${phrase.text}" → ${actual} (mong đợi ${phrase.expected})`)
    }
  }

  const accuracy = (correct / TEST_PHRASES.length) * 100
  console.log(`\nĐộ chính xác: ${accuracy.toFixed(1)}% (${correct}/${TEST_PHRASES.length})`)
  console.log(`Xử lý ở tầng keyword: ${viaKeyword}/${TEST_PHRASES.length}`)

  if (failures.length > 0) {
    console.log('\nCác câu sai:')
    failures.forEach((line) => console.log(`  ${line}`))
  }

  process.exit(accuracy >= 95 ? 0 : 1)
}

void main()
```

- [ ] **Step 2: Chạy đo độ chính xác**

```bash
bun dev   # ở terminal khác
bun run scripts/check-intent-accuracy.ts
```

Expected: độ chính xác ≥ 95%. Chưa đạt thì bổ sung keyword cho các câu sai trong `registry.ts` rồi chạy lại. Ghi lại con số cuối cùng.

- [ ] **Step 3: Đo độ trễ trên điện thoại thật**

```bash
bun run build && bun run start
bunx cloudflared tunnel --url http://localhost:3000
```

Trên iPhone, mở URL tunnel, đăng nhập, rồi nói 10 lượt lệnh khác nhau. Ghi lại 10 con số `[latency]` trong console (kết nối Safari Web Inspector qua cáp, hoặc đọc chỉ số mờ ở chân màn hình).

Tính p95 = giá trị lớn thứ hai trong 10 mẫu.
Expected: ≤ 1.500ms.

Vượt ngưỡng thì kiểm tra theo thứ tự: mảnh câu đầu có quá dài không (giảm `MAX_CHUNK_LENGTH` trong `player.ts`), hay STT chậm (rút thời gian ghi âm từ 5s xuống 4s).

- [ ] **Step 4: Kiểm tra chế độ offline**

Trong DevTools → Network, bật Offline. Chạy lần lượt 14 kịch bản nghiệp vụ từ ngăn kéo.

Expected: ≥ 12/14 kịch bản vẫn phát được âm thanh (từ cache hoặc MP3 dự phòng) và hiện đúng widget. Ghi lại con số thật.

- [ ] **Step 5: Kiểm tra khi không có micro**

Trong cài đặt trình duyệt, chặn quyền micro cho trang. Tải lại và chạy cả 14 kịch bản bằng chip.

Expected: 14/14 chạy đủ. Chạm Orb không gây lỗi hiển thị, chỉ ghi console.

- [ ] **Step 6: Kiểm tra thang suy giảm từng tầng**

Gây lỗi từng thành phần, xác nhận không có lỗi nào lọt lên giao diện:

| Gây lỗi bằng cách | Kết quả mong đợi |
|---|---|
| Đặt `GROQ_API_KEY` sai trong `.env.local` | Lời thoại dùng câu mẫu, vẫn phát được |
| Thêm `throw` vào đầu `/api/tts` | Phát MP3 dự phòng |
| Thêm `throw` vào đầu `/api/stt` | Không phản hồi, chip vẫn chạy bình thường |
| Bật Offline trong DevTools | Chạy từ cache |

- [ ] **Step 7: Kiểm tra độ mượt khung hình**

DevTools → Performance, ghi 10 giây trong lúc mở/đóng ngăn kéo và chuyển widget.
Expected: không có khung nào rớt dưới 55fps. Rớt thì kiểm tra xem có widget nào tính toán trong lúc render không.

- [ ] **Step 8: Kiểm tra PWA trên iPhone**

Mở URL tunnel trên Safari → Chia sẻ → Thêm vào MH chính. Mở app từ màn hình chính.
Expected: chạy toàn màn hình, không lộ thanh địa chỉ, nền obsidian sát mép. Lời chào **phát được âm thanh** sau khi chạm nút đăng nhập.

- [ ] **Step 9: Ghi báo cáo nghiệm thu**

Create `docs/plans/2026-09-12-ket-qua-nghiem-thu.md`, điền số đo thật:

```markdown
# Kết quả nghiệm thu MSB Virtual RM MVP

Ngày đo: ______
Thiết bị: ______
Mạng: ______

## Hiệu năng
| Hạng mục | Ngưỡng | Đo được | Đạt |
|---|---|---|---|
| Time-to-first-audio p95 | ≤ 1.500ms | ___ms | |
| Độ mượt khung hình | ≥ 55fps | ___fps | |
| Audio liền mạch | 0 lần đứt | ___ | |

## Độ chính xác
| Hạng mục | Ngưỡng | Đo được | Đạt |
|---|---|---|---|
| Nhận diện intent | ≥ 95% | ___% | |
| Numeric guard | 0 số sai/50 lượt | ___ | |
| Nhất quán số liệu | 100% | ___ | |

## Trải nghiệm & Dự phòng
| Hạng mục | Ngưỡng | Đo được | Đạt |
|---|---|---|---|
| PWA installable | Pass | | |
| Chạy offline | ≥ 12/14 | ___/14 | |
| Không micro | 14/14 | ___/14 | |
| Suy giảm im lặng | 0 popup lỗi | ___ | |
| Autoplay iOS | Phát được | | |
| FIDO đa nền tảng | iOS + Android | | |

## Hạng mục chưa đạt
(Liệt kê kèm nguyên nhân và hướng xử lý)
```

- [ ] **Step 10: Commit**

```bash
git add scripts docs/plans/2026-09-12-ket-qua-nghiem-thu.md
git commit -m "test: script đo độ chính xác intent và báo cáo nghiệm thu"
```

---

### Task 21: Quy trình warm-up và bàn giao

**Files:**
- Create: `docs/plans/2026-09-12-huong-dan-trinh-dien.md`
- Modify: `README.md`

**Interfaces:**
- Consumes: toàn bộ hệ thống
- Produces: tài liệu vận hành cho presenter

- [ ] **Step 1: Viết `docs/plans/2026-09-12-huong-dan-trinh-dien.md`**

```markdown
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
```

- [ ] **Step 2: Viết `README.md`**

```markdown
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
```

- [ ] **Step 3: Chạy lần kiểm tra cuối**

```bash
bun test && bunx tsc --noEmit && bun run build
```

Expected: tất cả xanh, build thành công.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/plans/2026-09-12-huong-dan-trinh-dien.md
git commit -m "docs: hướng dẫn trình diễn và README"
```

---

## Hoàn thành Phase 2

Hệ thống đã đủ để trình diễn:

- 15 widget phủ toàn bộ intent có giao diện, kiểu dữ liệu ràng buộc không cho thiếu sót
- Modal FIDO mô phỏng chặn bốn lệnh đổi trạng thái
- MP3 dự phòng cho mọi intent, thang suy giảm đã kiểm chứng từng tầng
- PWA cài được vào màn hình chính, chạy được offline
- Bộ tiêu chí nghiệm thu §7 đã chạy với số liệu thật
- Tài liệu vận hành cho presenter

Số liệu nghiệm thu nằm ở `docs/plans/2026-09-12-ket-qua-nghiem-thu.md`. Hạng mục nào chưa đạt thì xử lý trước buổi demo đầu tiên.
