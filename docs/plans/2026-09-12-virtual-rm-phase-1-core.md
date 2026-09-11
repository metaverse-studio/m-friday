# MSB Virtual RM — Phase 1: Nền tảng & Pipeline Thoại

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng xong bộ khung Virtual RM chạy được end-to-end trên điện thoại thật — nói một câu tiếng Việt, nhận diện intent, sinh lời thoại có kiểm chứng số liệu, phát audio streaming, hiển thị widget dòng tiền.

**Architecture:** LLM chỉ làm hai việc tách biệt: phân loại câu nói thành một `intent_id`, và diễn đạt lại lời thoại từ một lát fixtures cố định. Mọi con số nằm trong `fixtures.ts` và được numeric guard kiểm chứng trước khi đọc. Nhận diện intent qua ba tầng (chip → keyword client-side → LLM), mỗi tầng hỏng thì rơi xuống tầng dưới.

**Tech Stack:** Bun 1.4.2 · Next.js 16.3.4 · React 19.3.0 · TypeScript · Tailwind CSS 4.3.3 · Framer Motion 13.2.0 · Zustand 5.0.15 · groq-sdk 1.6.0 · msedge-tts 2.0.7 · lucide-react 1.45.0 · `bun test` (test runner built-in, không thêm Vitest)

**Spec:** `docs/specs/2026-09-11-virtual-rm-mvp-design.md` (v1.1.1)

## Global Constraints

Mọi task đều ngầm chịu các ràng buộc sau. Đọc lại trước khi bắt đầu bất kỳ task nào.

- **Ngôn ngữ giao diện và lời thoại**: 100% tiếng Việt có dấu đầy đủ. Không viết tiếng Việt không dấu trong bất kỳ chuỗi nào hiển thị cho người dùng.
- **Nhân vật**: RM tên **Mai**, luôn xưng "em", gọi người dùng là **"Mr Z"** hoặc **"Anh Z"**.
- **Nguồn số liệu duy nhất**: `src/lib/data/fixtures.ts`. Cấm hardcode số liệu tài chính trong component, trong prompt, hoặc trong test ngoài file này và các test của chính nó.
- **Số dẫn xuất phải tính, không ghi sẵn**: lợi tức CCTG, chênh lệch tỷ giá, phần trăm tăng trưởng đều tính bằng TypeScript từ fixtures.
- **Màu thương hiệu** (dùng đúng mã, không tự chế biến thể):
  - MSB Orange `#EB5824`, MSB Gold `#FBB03B`
  - Nền: Obsidian `#0B0E14`, Sapphire `#101520`, Card `#161E2E`
  - Emerald `#10B981` (dòng tiền dương / thành công)
  - Alert Red `#EF4444` — **chỉ dùng cho `FRAUD_ALERT`**, không dùng nơi khác
- **Route TTS phải chạy Node runtime**: `export const runtime = 'nodejs'`. Edge runtime không chạy được `msedge-tts`.
- **Không hiển thị lỗi lên giao diện**: mọi lỗi ghi `console.error`, giao diện rơi xuống tầng dự phòng im lặng.
- **Biến môi trường**: `GROQ_API_KEY` chỉ đọc phía server. Không bao giờ đặt tiền tố `NEXT_PUBLIC_`.
- **Ngân sách độ trễ**: time-to-first-audio ≤ 1,5s ở p95, đo từ lúc mic dừng tới khi `audio.play()` resolve.

## Sai lệch có chủ đích so với Spec §4.2

Spec liệt kê một route `speak/route.ts` gộp việc sinh lời thoại và tổng hợp giọng nói. Plan này **tách thành hai route**:

- `POST /api/reply` — stream text lời thoại (SSE)
- `POST /api/tts` — nhận **một câu**, trả **một** file MP3

Lý do: gộp lại thì không cache được theo câu (cache key phải là nội dung câu), không test được riêng từng nửa, và không cho phép client cắt câu để phát mảnh đầu sớm. Client đóng vai điều phối. Đây là thay đổi cấu trúc file, không thay đổi hành vi hay ngân sách độ trễ mô tả ở §4.5.

## Sai lệch có chủ đích so với Spec §3.2

Spec liệt kê **Floating Bubble** (bong bóng neo góc phải, phát sáng theo nhịp thở) và **Soundwave Orb** (quả cầu năng lượng trong modal toàn màn hình) là hai thành phần riêng biệt. Plan này **gộp thành một Orb duy nhất** neo giữa cạnh dưới màn hình.

Lý do: trên tỉ lệ điện thoại, một bong bóng góc phải cộng một orb toàn màn hình là hai thứ cùng chức năng chiếm hai chỗ. Orb dưới đáy nằm trong tầm ngón cái, luôn hiển thị, và vẫn giữ hiệu ứng hào quang thở mà spec mô tả. Nếu khi demo thấy thiếu điểm nhấn thị giác, thêm Bubble lại là việc của một task riêng ở Phase 2 — không chặn Phase 1.

---

## Cấu trúc File Phase 1

| File | Trách nhiệm |
|---|---|
| `src/lib/data/fixtures.ts` | Toàn bộ số liệu demo dạng hằng |
| `src/lib/data/format.ts` | Định dạng số sang tiếng Việt (`"18,2 tỷ"`) |
| `src/lib/data/calc.ts` | Các số dẫn xuất (lợi tức, chênh lệch tỷ giá) |
| `src/lib/intents/types.ts` | `IntentId`, `Intent`, `IntentGroup` |
| `src/lib/intents/registry.ts` | 17 intent — trái tim hệ thống |
| `src/lib/intents/resolve.ts` | Tầng 2 keyword + điều phối sang tầng 3 |
| `src/lib/intents/guard.ts` | Numeric guard |
| `src/lib/audio/cache.ts` | Cache audio phía client theo hash text |
| `src/lib/audio/player.ts` | Mở khóa autoplay, hàng đợi phát, barge-in |
| `src/lib/audio/providers/edge-tts.ts` | Cài đặt `TtsProvider` bằng msedge-tts |
| `src/lib/session.ts` | State phiên (Zustand) + reset |
| `src/lib/fido.ts` | Dò khả năng + WebAuthn thật + mô phỏng |
| `src/app/api/stt/route.ts` | Groq Whisper |
| `src/app/api/intent/route.ts` | Tầng 3 phân loại |
| `src/app/api/reply/route.ts` | Sinh lời thoại (SSE) |
| `src/app/api/tts/route.ts` | Một câu → một MP3 (Node runtime) |
| `src/components/fido/LockScreen.tsx` | Màn hình khóa + mở khóa audio |
| `src/components/voice/Orb.tsx` | Quả cầu năng lượng, chạm để ngắt |
| `src/components/voice/ChipBar.tsx` | 3 chip ngữ cảnh + nút Tất cả |
| `src/components/voice/Drawer.tsx` | Ngăn 14 lệnh + Bắt đầu phiên mới |
| `src/components/widgets/CashFlowWidget.tsx` | Widget mẫu chạy end-to-end |

---

### Task 1: Khởi tạo dự án & theme MSB

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Create: `.env.local.example`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: không
- Produces: dự án Next chạy được bằng `bun dev`; các biến màu Tailwind `bg-obsidian`, `bg-sapphire`, `bg-card`, `text-msb-orange`, `text-msb-gold`, `text-signal`, `text-alert`

- [ ] **Step 1: Khởi tạo dự án Next.js**

```bash
cd /Users/bez/Workspace/MSB/repos/demo-virtual-rm
bunx create-next-app@16.3.4 . --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
```

Khi được hỏi ghi đè file có sẵn, giữ lại `docs/` và `.gitignore`.

- [ ] **Step 2: Cài dependency**

```bash
bun add framer-motion@13.2.0 zustand@5.0.15 groq-sdk@1.6.0 msedge-tts@2.0.7 lucide-react@1.45.0
```

- [ ] **Step 3: Khai báo theme MSB trong `src/app/globals.css`**

Thay toàn bộ nội dung file bằng:

```css
@import "tailwindcss";

@theme {
  --color-obsidian: #0B0E14;
  --color-sapphire: #101520;
  --color-card: #161E2E;
  --color-msb-orange: #EB5824;
  --color-msb-gold: #FBB03B;
  --color-signal: #10B981;
  --color-alert: #EF4444;
}

html, body {
  background-color: var(--color-obsidian);
  color: white;
  overscroll-behavior: none;
}
```

- [ ] **Step 4: Viết `src/app/layout.tsx`**

```tsx
import type { Metadata, Viewport } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'MSB M-Bank Corporate',
  description: 'Trợ lý Quan hệ Khách hàng Ảo dành cho Khách hàng Doanh nghiệp MSB',
}

export const viewport: Viewport = {
  themeColor: '#0B0E14',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <body className="min-h-dvh bg-obsidian antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 5: Viết `src/app/page.tsx` tạm để kiểm tra theme**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold text-msb-gold">MSB M-Bank Corporate</h1>
      <p className="text-msb-orange">Trợ lý Quan hệ Khách hàng Ảo</p>
    </main>
  )
}
```

- [ ] **Step 6: Tạo `.env.local.example`**

```bash
# Lấy khóa miễn phí tại https://console.groq.com/keys
GROQ_API_KEY=
```

- [ ] **Step 7: Bổ sung `.gitignore`**

Thêm các dòng sau vào cuối file (giữ nguyên phần đã có):

```
/.tmp
/public/audio/cache
```

- [ ] **Step 8: Chạy thử**

Run: `bun dev`
Expected: mở `http://localhost:3000` thấy nền đen obsidian, chữ vàng kim và cam. Nếu chữ vẫn màu mặc định thì `@theme` chưa được đọc — kiểm tra `globals.css` có được import trong `layout.tsx` không.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: khởi tạo dự án Next.js 16 với theme MSB Dark Luxury"
```

---

### Task 2: Fixtures, định dạng số và các phép tính dẫn xuất

Đây là task quan trọng nhất về mặt đúng đắn. Hai lỗi số học của spec v1.0.0 nằm ở đây, và toàn bộ numeric guard phụ thuộc vào nó.

**Files:**
- Create: `src/lib/data/fixtures.ts`
- Create: `src/lib/data/format.ts`
- Create: `src/lib/data/calc.ts`
- Test: `src/lib/data/calc.test.ts`, `src/lib/data/format.test.ts`

**Interfaces:**
- Consumes: không
- Produces:
  - `fixtures` — object hằng, `FixtureKey = keyof typeof fixtures`
  - `formatTy(n: number): string`, `formatTrieu(n: number): string`, `formatPercent(n: number): string`
  - `cctgYield(): number`, `obligationTotal(): number`, `idleCash(): number`, `fxForwardCost(): number`, `fxFloatRisk(): number`, `fxSaving(): number`

- [ ] **Step 1: Viết test định dạng số trước**

Create `src/lib/data/format.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import { formatPercent, formatTrieu, formatTy } from './format'

describe('formatTy', () => {
  test('rút gọn về một chữ số thập phân, dùng dấu phẩy', () => {
    expect(formatTy(18_200_000_000)).toBe('18,2 tỷ')
  })
  test('bỏ phần thập phân khi tròn số', () => {
    expect(formatTy(15_000_000_000)).toBe('15 tỷ')
  })
  test('làm tròn xuống đúng', () => {
    expect(formatTy(27_540_000_000)).toBe('27,5 tỷ')
  })
})

describe('formatTrieu', () => {
  test('rút gọn về một chữ số thập phân', () => {
    expect(formatTrieu(33_287_671)).toBe('33,3 triệu')
  })
  test('bỏ phần thập phân khi tròn số', () => {
    expect(formatTrieu(32_500_000)).toBe('32,5 triệu')
  })
})

describe('formatPercent', () => {
  test('dùng dấu phẩy thập phân kiểu Việt Nam', () => {
    expect(formatPercent(19.8)).toBe('19,8%')
  })
  test('bỏ phần thập phân khi tròn số', () => {
    expect(formatPercent(20)).toBe('20%')
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `bun test src/lib/data/format.test.ts`
Expected: FAIL — `Cannot find module './format'`

- [ ] **Step 3: Viết `src/lib/data/format.ts`**

```ts
const TY = 1_000_000_000
const TRIEU = 1_000_000

function viDecimal(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace('.', ',')
}

export function formatTy(amount: number): string {
  return `${viDecimal(amount / TY)} tỷ`
}

export function formatTrieu(amount: number): string {
  return `${viDecimal(amount / TRIEU)} triệu`
}

export function formatPercent(value: number): string {
  return `${viDecimal(value)}%`
}
```

- [ ] **Step 4: Chạy test để xác nhận vượt qua**

Run: `bun test src/lib/data/format.test.ts`
Expected: PASS — 7 test.

- [ ] **Step 5: Viết `src/lib/data/fixtures.ts`**

Mọi giá trị lấy từ bảng §2.4 của spec. Đơn vị là VNĐ nguyên, không rút gọn.

```ts
export const fixtures = {
  company: {
    name: 'Công ty CP Công Nghệ & Thương Mại Á Châu',
    userTitle: 'Mr Z',
    userRole: 'Giám đốc Tài chính',
  },

  balance: {
    availableVnd: 27_500_000_000,
  },

  cashFlow: {
    days: 7,
    inflow: 65_000_000_000,
    outflow: 46_800_000_000,
    net: 18_200_000_000,
    daily: [
      { label: 'T2', inflow: 12_400_000_000, outflow: 8_100_000_000 },
      { label: 'T3', inflow: 8_900_000_000, outflow: 6_700_000_000 },
      { label: 'T4', inflow: 11_200_000_000, outflow: 7_400_000_000 },
      { label: 'T5', inflow: 7_600_000_000, outflow: 5_900_000_000 },
      { label: 'T6', inflow: 10_300_000_000, outflow: 8_200_000_000 },
      { label: 'T7', inflow: 9_100_000_000, outflow: 6_300_000_000 },
      { label: 'CN', inflow: 5_500_000_000, outflow: 4_200_000_000 },
    ],
  },

  session: {
    postedCount: 12,
    postedTotal: 12,
    postedValue: 48_500_000_000,
    pendingInternational: 2,
    pendingGuarantee: 1,
  },

  obligations: {
    vatDue: { date: '20/09', amount: 2_800_000_000, label: 'Thuế GTGT quý III' },
    payroll: { date: '25/09', amount: 4_100_000_000, headcount: 320, label: 'Chi lương' },
    operatingReserve: 3_200_000_000,
  },

  cctg: {
    principal: 15_000_000_000,
    termDays: 15,
    annualRate: 0.054,
    bufferKept: 2_400_000_000,
  },

  tradeFinance: {
    lc: { available: 18_000_000_000, total: 50_000_000_000 },
    guarantee: { available: 11_500_000_000, total: 30_000_000_000 },
    pendingLc: { partner: 'Siemens AG', amountUsd: 250_000, dueDate: '25/09' },
    pendingGuarantee: { project: 'KCN VSIP III', amount: 5_200_000_000 },
  },

  fx: {
    spotSellRate: 26_180,
    forwardRate: 26_310,
    twoWeekChangePercent: 1.5,
  },

  fraud: {
    amount: 850_000_000,
    makerName: 'Trần Thị B',
    createdAt: '23:47 ngày 11/09',
    signals: [
      'Tài khoản thụ hưởng lần đầu phát sinh giao dịch',
      'Lệnh tạo ngoài giờ hành chính',
      'Giá trị vượt ngưỡng cảnh báo nội bộ',
    ],
  },

  loan: {
    outstanding: 42_000_000_000,
    limit: 80_000_000_000,
    contractCount: 3,
    nearest: { amount: 12_500_000_000, annualRate: 0.068, dueDate: '28/09' },
  },

  periodCompare: {
    month: 'Tháng 8',
    inflowThis: 248_000_000_000,
    inflowLast: 207_000_000_000,
    outflowThis: 196_000_000_000,
    outflowLast: 174_000_000_000,
  },

  contacts: {
    rmName: 'Nguyễn Văn A',
    rmPhone: '0988.123.456',
    hotline: '1800 59 9999',
  },
} as const

export type FixtureKey = keyof typeof fixtures
```

Dữ liệu `cashFlow.daily` gồm 7 ngày với tổng thu đúng 65,0 tỷ và tổng chi đúng 46,8 tỷ. Bước tiếp theo có test đối chiếu điều này — nếu cộng tay ra số khác, sửa mảng `daily` chứ đừng sửa `inflow`/`outflow`.

- [ ] **Step 6: Viết test cho các phép tính dẫn xuất**

Đây là các phép tính spec §2.3 yêu cầu phải khớp. Create `src/lib/data/calc.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import {
  cctgYield,
  fxFloatRisk,
  fxForwardCost,
  fxSaving,
  idleCash,
  obligationTotal,
  periodGrowthInflow,
} from './calc'
import { fixtures } from './fixtures'
import { formatTrieu, formatTy } from './format'

describe('CCTG', () => {
  test('lợi tức 15 tỷ, 5,4%/năm, kỳ hạn 15 ngày ra 33,3 triệu', () => {
    expect(Math.round(cctgYield())).toBe(33_287_671)
    expect(formatTrieu(cctgYield())).toBe('33,3 triệu')
  })
})

describe('Nghĩa vụ chi', () => {
  test('tổng nghĩa vụ 30 ngày là 10,1 tỷ', () => {
    expect(obligationTotal()).toBe(10_100_000_000)
    expect(formatTy(obligationTotal())).toBe('10,1 tỷ')
  })

  test('tiền nhàn rỗi đủ mua CCTG 15 tỷ và còn đệm', () => {
    expect(idleCash()).toBe(17_400_000_000)
    expect(idleCash()).toBeGreaterThan(15_000_000_000)
  })
})

describe('FX Forward', () => {
  test('chi phí khóa tỷ giá là 32,5 triệu', () => {
    expect(fxForwardCost()).toBe(32_500_000)
    expect(formatTrieu(fxForwardCost())).toBe('32,5 triệu')
  })

  test('rủi ro nếu thả nổi khoảng 98,2 triệu', () => {
    expect(Math.round(fxFloatRisk())).toBe(98_175_000)
  })

  test('tiết kiệm ròng khoảng 65,7 triệu', () => {
    expect(formatTrieu(fxSaving())).toBe('65,7 triệu')
  })
})

describe('So sánh kỳ', () => {
  test('tăng trưởng dòng thu là 19,8%', () => {
    expect(Number(periodGrowthInflow().toFixed(1))).toBe(19.8)
  })
})

describe('Nhất quán nội bộ của fixtures', () => {
  test('tổng cột thu 7 ngày khớp với inflow', () => {
    const sum = fixtures.cashFlow.daily.reduce((acc, d) => acc + d.inflow, 0)
    expect(sum).toBe(fixtures.cashFlow.inflow)
  })

  test('tổng cột chi 7 ngày khớp với outflow', () => {
    const sum = fixtures.cashFlow.daily.reduce((acc, d) => acc + d.outflow, 0)
    expect(sum).toBe(fixtures.cashFlow.outflow)
  })

  test('thặng dư ròng bằng thu trừ chi', () => {
    const { inflow, outflow, net } = fixtures.cashFlow
    expect(inflow - outflow).toBe(net)
  })

  test('có đúng 7 cột dữ liệu', () => {
    expect(fixtures.cashFlow.daily).toHaveLength(fixtures.cashFlow.days)
  })
})
```

- [ ] **Step 7: Chạy test để xác nhận thất bại**

Run: `bun test src/lib/data/calc.test.ts`
Expected: FAIL — `Cannot find module './calc'`

- [ ] **Step 8: Viết `src/lib/data/calc.ts`**

```ts
import { fixtures } from './fixtures'

const DAYS_PER_YEAR = 365

/** Lợi tức CCTG: gốc × lãi suất năm × (số ngày / 365) */
export function cctgYield(): number {
  const { principal, annualRate, termDays } = fixtures.cctg
  return (principal * annualRate * termDays) / DAYS_PER_YEAR
}

/** Tổng nghĩa vụ chi 30 ngày tới: thuế + lương + dự phòng vận hành */
export function obligationTotal(): number {
  const { vatDue, payroll, operatingReserve } = fixtures.obligations
  return vatDue.amount + payroll.amount + operatingReserve
}

/** Tiền nhàn rỗi thật sự: số dư khả dụng trừ nghĩa vụ sắp tới */
export function idleCash(): number {
  return fixtures.balance.availableVnd - obligationTotal()
}

/** Chi phí khóa tỷ giá kỳ hạn: số USD × điểm kỳ hạn */
export function fxForwardCost(): number {
  const { spotSellRate, forwardRate } = fixtures.fx
  return fixtures.tradeFinance.pendingLc.amountUsd * (forwardRate - spotSellRate)
}

/** Rủi ro nếu thả nổi: giá trị hợp đồng × mức tăng dự kiến */
export function fxFloatRisk(): number {
  const { spotSellRate, twoWeekChangePercent } = fixtures.fx
  const contractValue = fixtures.tradeFinance.pendingLc.amountUsd * spotSellRate
  return contractValue * (twoWeekChangePercent / 100)
}

/** Tiết kiệm ròng khi khóa tỷ giá */
export function fxSaving(): number {
  return fxFloatRisk() - fxForwardCost()
}

/** Tăng trưởng dòng thu so với cùng kỳ, đơn vị phần trăm */
export function periodGrowthInflow(): number {
  const { inflowThis, inflowLast } = fixtures.periodCompare
  return ((inflowThis - inflowLast) / inflowLast) * 100
}
```

- [ ] **Step 9: Chạy test để xác nhận vượt qua**

Run: `bun test src/lib/data/`
Expected: PASS — toàn bộ test format và calc.

Nếu `idleCash()` không ra đúng 17,4 tỷ, kiểm tra lại `balance.availableVnd` = 27,5 tỷ và `obligationTotal()` = 10,1 tỷ. Đây chính là lỗ hổng mà spec v1.1.0 vá — nếu sai, `SUGGEST_CCTG` sẽ khuyến nghị mua nhiều hơn số tiền có.

- [ ] **Step 10: Commit**

```bash
git add src/lib/data
git commit -m "feat: fixtures, định dạng số tiếng Việt và các phép tính dẫn xuất"
```

---

### Task 3: Kiểu dữ liệu và Registry 17 intent

**Files:**
- Create: `src/lib/intents/types.ts`
- Create: `src/lib/intents/registry.ts`
- Test: `src/lib/intents/registry.test.ts`

**Interfaces:**
- Consumes: `FixtureKey` từ Task 2
- Produces:
  - `type IntentId` — union 17 chuỗi
  - `type Intent` — `{ id, label, group, keywords, description, fixtureKey, fallbackLine, allowedNumbers, nextChips, requiresFido? }`
  - `INTENTS: Record<IntentId, Intent>`
  - `BUSINESS_INTENT_IDS: IntentId[]` — 14 intent nghiệp vụ, đúng thứ tự ưu tiên khớp keyword
  - `getIntent(id: IntentId): Intent`

- [ ] **Step 1: Viết `src/lib/intents/types.ts`**

```ts
import type { FixtureKey } from '../data/fixtures'

export type IntentId =
  | 'FIDO_LOGIN'
  | 'GREETING'
  | 'CASH_FLOW'
  | 'PERIOD_COMPARE'
  | 'OBLIGATION_CALENDAR'
  | 'TXN_HISTORY'
  | 'RECENT_ACTIONS'
  | 'TRADE_FINANCE'
  | 'FRAUD_ALERT'
  | 'APPROVE_FIDO'
  | 'REJECT_ORDER'
  | 'SUGGEST_CCTG'
  | 'FX_FORWARD'
  | 'LOAN_BALANCE'
  | 'CALL_HOTLINE'
  | 'SESSION_SUMMARY'
  | 'UNKNOWN'

export type IntentGroup =
  | 'system'
  | 'analysis'
  | 'approval'
  | 'advisory'
  | 'support'
  | 'fallback'

export type Intent = {
  id: IntentId
  /** Chữ hiển thị trên chip và trong ngăn kéo */
  label: string
  group: IntentGroup
  /** Tầng 2: regex chạy trên text đã bỏ dấu, viết thường */
  keywords: RegExp[]
  /** Tầng 3: mô tả đưa cho LLM để phân loại */
  description: string
  /** Lát fixtures duy nhất mà LLM được nhìn thấy khi sinh thoại */
  fixtureKey: FixtureKey | null
  /** Câu dùng khi LLM lỗi hoặc numeric guard loại bỏ output */
  fallbackLine: string
  /** Các chuỗi số được phép xuất hiện trong lời thoại của intent này */
  allowedNumbers: string[]
  /** Ba chip gợi ý sau khi intent chạy xong */
  nextChips: IntentId[]
  /** Cần xác thực sinh trắc học trước khi đổi trạng thái */
  requiresFido?: boolean
}
```

- [ ] **Step 2: Viết test cho registry**

Create `src/lib/intents/registry.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import { BUSINESS_INTENT_IDS, INTENTS, getIntent } from './registry'
import type { IntentId } from './types'

describe('Registry', () => {
  test('có đủ 17 intent', () => {
    expect(Object.keys(INTENTS)).toHaveLength(17)
  })

  test('có đúng 14 intent nghiệp vụ', () => {
    expect(BUSINESS_INTENT_IDS).toHaveLength(14)
  })

  test('intent nghiệp vụ không bao gồm sự kiện hệ thống hay dự phòng', () => {
    expect(BUSINESS_INTENT_IDS).not.toContain('FIDO_LOGIN')
    expect(BUSINESS_INTENT_IDS).not.toContain('GREETING')
    expect(BUSINESS_INTENT_IDS).not.toContain('UNKNOWN')
  })

  test('mỗi intent có id khớp với khóa của nó', () => {
    for (const [key, intent] of Object.entries(INTENTS)) {
      expect(intent.id).toBe(key as IntentId)
    }
  })

  test('mọi intent nghiệp vụ đều có keyword và fallbackLine', () => {
    for (const id of BUSINESS_INTENT_IDS) {
      const intent = getIntent(id)
      expect(intent.keywords.length).toBeGreaterThan(0)
      expect(intent.fallbackLine.length).toBeGreaterThan(0)
    }
  })

  test('nextChips chỉ trỏ tới intent có thật', () => {
    for (const intent of Object.values(INTENTS)) {
      for (const chipId of intent.nextChips) {
        expect(INTENTS[chipId]).toBeDefined()
      }
    }
  })

  test('nextChips không bao giờ chứa UNKNOWN', () => {
    for (const intent of Object.values(INTENTS)) {
      expect(intent.nextChips).not.toContain('UNKNOWN')
    }
  })

  test('các lệnh đổi trạng thái đều yêu cầu FIDO', () => {
    const mustRequireFido: IntentId[] = [
      'APPROVE_FIDO',
      'REJECT_ORDER',
      'SUGGEST_CCTG',
      'FX_FORWARD',
    ]
    for (const id of mustRequireFido) {
      expect(getIntent(id).requiresFido).toBe(true)
    }
  })

  test('fallbackLine luôn xưng em và gọi Mr Z hoặc anh', () => {
    for (const id of BUSINESS_INTENT_IDS) {
      const line = getIntent(id).fallbackLine
      expect(/\b(em|Em)\b/.test(line)).toBe(true)
    }
  })
})
```

- [ ] **Step 3: Chạy test để xác nhận thất bại**

Run: `bun test src/lib/intents/registry.test.ts`
Expected: FAIL — `Cannot find module './registry'`

- [ ] **Step 4: Viết `src/lib/intents/registry.ts`**

Keyword viết ở dạng **không dấu, viết thường** vì `normalizeVi` ở Task 4 sẽ bỏ dấu trước khi so khớp.

```ts
import { formatTrieu, formatTy } from '../data/format'
import { cctgYield, obligationTotal } from '../data/calc'
import { fixtures } from '../data/fixtures'
import type { Intent, IntentId } from './types'

const f = fixtures

export const INTENTS: Record<IntentId, Intent> = {
  FIDO_LOGIN: {
    id: 'FIDO_LOGIN',
    label: 'Đăng nhập',
    group: 'system',
    keywords: [],
    description: 'Sự kiện hệ thống, không kích hoạt bằng giọng nói.',
    fixtureKey: null,
    fallbackLine: '',
    allowedNumbers: [],
    nextChips: [],
  },

  GREETING: {
    id: 'GREETING',
    label: 'Lời chào',
    group: 'system',
    keywords: [],
    description: 'Sự kiện hệ thống, tự chạy sau khi đăng nhập.',
    fixtureKey: 'company',
    fallbackLine:
      'Chào Mr Z. Em là Mai, Trợ lý Quan hệ Khách hàng Doanh nghiệp của anh tại MSB Corporate ạ.',
    allowedNumbers: [],
    nextChips: ['CASH_FLOW', 'RECENT_ACTIONS', 'TRADE_FINANCE'],
  },

  CASH_FLOW: {
    id: 'CASH_FLOW',
    label: 'Dòng tiền 7 ngày',
    group: 'analysis',
    keywords: [/dong tien/, /thu chi/, /bao cao tien/],
    description:
      'Hỏi về dòng tiền vào ra của doanh nghiệp trong tuần hoặc 7 ngày gần nhất.',
    fixtureKey: 'cashFlow',
    fallbackLine: `Báo cáo Mr Z, trong 7 ngày qua dòng tiền doanh nghiệp thặng dư ròng ${formatTy(
      f.cashFlow.net,
    )} VNĐ, các khoản thu từ đối tác đã về đầy đủ đúng hạn ạ.`,
    allowedNumbers: ['7', '65', '46,8', '18,2'],
    nextChips: ['SUGGEST_CCTG', 'OBLIGATION_CALENDAR', 'PERIOD_COMPARE'],
  },

  PERIOD_COMPARE: {
    id: 'PERIOD_COMPARE',
    label: 'So sánh kỳ',
    group: 'analysis',
    keywords: [/so sanh/, /cung ky/, /thang nay so/],
    description: 'So sánh kết quả tháng này với cùng kỳ năm trước.',
    fixtureKey: 'periodCompare',
    fallbackLine:
      'Tháng 8 năm nay công ty thu về 248 tỷ, tăng 19,8% so với 207 tỷ cùng kỳ năm ngoái ạ.',
    allowedNumbers: ['8', '248', '207', '196', '174', '19,8', '12,6'],
    nextChips: ['CASH_FLOW', 'LOAN_BALANCE', 'OBLIGATION_CALENDAR'],
  },

  OBLIGATION_CALENDAR: {
    id: 'OBLIGATION_CALENDAR',
    label: 'Lịch chi sắp tới',
    group: 'analysis',
    keywords: [/nghia vu/, /sap phai chi/, /lich chi/, /thue/, /luong/],
    description:
      'Hỏi về các khoản phải chi sắp tới như thuế, lương, nghĩa vụ tài chính.',
    fixtureKey: 'obligations',
    fallbackLine: `Trong 30 ngày tới công ty cần chi khoảng ${formatTy(
      obligationTotal(),
    )} VNĐ cho thuế, lương và dự phòng vận hành. Số dư hiện tại hoàn toàn đủ đáp ứng ạ.`,
    allowedNumbers: ['30', '20/09', '25/09', '2,8', '4,1', '320', '3,2', '10,1', '27,5'],
    nextChips: ['SUGGEST_CCTG', 'LOAN_BALANCE', 'CASH_FLOW'],
  },

  TXN_HISTORY: {
    id: 'TXN_HISTORY',
    label: 'Lịch sử giao dịch',
    group: 'analysis',
    keywords: [/lich su giao dich/, /bien dong so du/, /sao ke/],
    description: 'Xem lịch sử biến động số dư các tài khoản thanh toán.',
    fixtureKey: 'session',
    fallbackLine:
      'Dạ em đưa lên bảng kê biến động số dư các tài khoản thanh toán VNĐ và USD trong ngày để anh xem ạ.',
    allowedNumbers: [],
    nextChips: ['CASH_FLOW', 'RECENT_ACTIONS', 'PERIOD_COMPARE'],
  },

  RECENT_ACTIONS: {
    id: 'RECENT_ACTIONS',
    label: 'Lệnh chờ duyệt',
    group: 'approval',
    keywords: [/cho duyet/, /cho anh duyet/, /phien sang/, /tac vu/],
    description:
      'Hỏi về tình hình phiên giao dịch hôm nay và các lệnh đang chờ phê duyệt.',
    fixtureKey: 'session',
    fallbackLine: `Trong phiên sáng nay hệ thống đã thực hiện thành công 12/12 lệnh hạch toán với tổng giá trị ${formatTy(
      f.session.postedValue,
    )} VNĐ. Hiện có 02 lệnh thanh toán quốc tế và 01 đề nghị bảo lãnh chờ anh phê duyệt ạ.`,
    allowedNumbers: ['12', '12/12', '48,5', '02', '2', '01', '1'],
    nextChips: ['FRAUD_ALERT', 'TRADE_FINANCE', 'TXN_HISTORY'],
  },

  TRADE_FINANCE: {
    id: 'TRADE_FINANCE',
    label: 'Hạn mức L/C',
    group: 'approval',
    keywords: [/han muc/, /l\/c/, /lc /, /thu tin dung/, /bao lanh/],
    description: 'Kiểm tra hạn mức thư tín dụng và bảo lãnh ngân hàng.',
    fixtureKey: 'tradeFinance',
    fallbackLine:
      'Hạn mức L/C khả dụng của công ty là 18 tỷ trên tổng 50 tỷ, hạn mức bảo lãnh còn 11,5 tỷ trên tổng 30 tỷ ạ.',
    allowedNumbers: ['18', '50', '11,5', '30', '250.000', '250', '5,2', '25/09'],
    nextChips: ['APPROVE_FIDO', 'FX_FORWARD', 'REJECT_ORDER'],
  },

  FRAUD_ALERT: {
    id: 'FRAUD_ALERT',
    label: 'Cảnh báo bất thường',
    group: 'approval',
    keywords: [/bat thuong/, /canh bao/, /dang ngo/, /rui ro giao dich/],
    description: 'Hỏi về giao dịch đáng ngờ hoặc cảnh báo rủi ro gian lận.',
    fixtureKey: 'fraud',
    fallbackLine: `Em phát hiện một lệnh chuyển ${formatTrieu(
      f.fraud.amount,
    )} VNĐ tới tài khoản thụ hưởng lần đầu giao dịch, tạo ngoài giờ hành chính. Em tạm giữ lại chờ anh xác nhận ạ.`,
    allowedNumbers: ['850', '23:47', '11/09'],
    nextChips: ['REJECT_ORDER', 'RECENT_ACTIONS', 'CALL_HOTLINE'],
  },

  APPROVE_FIDO: {
    id: 'APPROVE_FIDO',
    label: 'Duyệt bảo lãnh VSIP III',
    group: 'approval',
    keywords: [/duyet bao lanh/, /duyet bang fido/, /ky duyet/],
    description: 'Phê duyệt một lệnh đang chờ bằng xác thực sinh trắc học.',
    fixtureKey: 'tradeFinance',
    fallbackLine:
      'Em đã ghi nhận phê duyệt của anh. Bảo lãnh thực hiện hợp đồng dự án KCN VSIP III đã được ký duyệt điện tử thành công ạ.',
    allowedNumbers: ['5,2'],
    nextChips: ['RECENT_ACTIONS', 'FRAUD_ALERT', 'SESSION_SUMMARY'],
    requiresFido: true,
  },

  REJECT_ORDER: {
    id: 'REJECT_ORDER',
    label: 'Trả lệnh về Maker',
    group: 'approval',
    keywords: [/tra lenh/, /tra ve ke toan/, /tu choi lenh/, /ghi chu/],
    description: 'Trả một lệnh về cho người tạo kèm lý do.',
    fixtureKey: 'fraud',
    fallbackLine:
      'Em đã trả lệnh về cho Maker kèm ghi chú của anh. Kế toán sẽ nhận được thông báo ngay ạ.',
    allowedNumbers: [],
    nextChips: ['RECENT_ACTIONS', 'FRAUD_ALERT', 'SESSION_SUMMARY'],
    requiresFido: true,
  },

  SUGGEST_CCTG: {
    id: 'SUGGEST_CCTG',
    label: 'Gợi ý CCTG',
    group: 'advisory',
    keywords: [/chung chi tien gui/, /cctg/, /toi uu von/, /tien nhan roi/],
    description:
      'Tư vấn gửi tiền nhàn rỗi vào chứng chỉ tiền gửi để sinh lời.',
    fixtureKey: 'cctg',
    fallbackLine: `Em gợi ý anh trích ${formatTy(
      f.cctg.principal,
    )} mua Chứng chỉ tiền gửi MSB kỳ hạn 15 ngày, lãi suất 5,4% một năm, dự tính đem lại ${formatTrieu(
      cctgYield(),
    )} VNĐ ạ.`,
    allowedNumbers: ['27,5', '10,1', '17,4', '15', '5,4', '33,3', '2,4'],
    nextChips: ['OBLIGATION_CALENDAR', 'LOAN_BALANCE', 'CASH_FLOW'],
    requiresFido: true,
  },

  FX_FORWARD: {
    id: 'FX_FORWARD',
    label: 'Khóa tỷ giá Siemens',
    group: 'advisory',
    keywords: [/ty gia/, /usd/, /ky han/, /forward/, /khoa ty gia/],
    description:
      'Tư vấn phòng ngừa rủi ro tỷ giá cho khoản thanh toán ngoại tệ.',
    fixtureKey: 'fx',
    fallbackLine:
      'Tỷ giá bán USD của MSB hiện là 26.180 và đã tăng 1,5% trong hai tuần qua. Em gợi ý anh khóa tỷ giá kỳ hạn ở mức 26.310 để phòng ngừa rủi ro ạ.',
    allowedNumbers: ['26.180', '26.310', '1,5', '250.000', '250', '25/09', '98,2', '32,5', '65,7'],
    nextChips: ['TRADE_FINANCE', 'CASH_FLOW', 'OBLIGATION_CALENDAR'],
    requiresFido: true,
  },

  LOAN_BALANCE: {
    id: 'LOAN_BALANCE',
    label: 'Dư nợ vay',
    group: 'advisory',
    keywords: [/du no/, /khe uoc/, /vay ngan han/, /no vay/],
    description: 'Hỏi về dư nợ vay và các khế ước nhận nợ.',
    fixtureKey: 'loan',
    fallbackLine: `Tổng dư nợ vay ngắn hạn của công ty là ${formatTy(
      f.loan.outstanding,
    )} trên hạn mức 80 tỷ. Công ty đang có 3 khế ước nhận nợ ạ.`,
    allowedNumbers: ['42', '80', '38', '3', '12,5', '6,8', '28/09'],
    nextChips: ['CASH_FLOW', 'OBLIGATION_CALENDAR', 'SUGGEST_CCTG'],
  },

  CALL_HOTLINE: {
    id: 'CALL_HOTLINE',
    label: 'Gọi RM phụ trách',
    group: 'support',
    keywords: [/tong dai/, /goi cho rm/, /ket noi/, /hotline/, /chuyen vien/],
    description: 'Kết nối tới RM phụ trách hoặc tổng đài MSB.',
    fixtureKey: 'contacts',
    fallbackLine:
      'Đang kết nối Mr Z tới Giám đốc Quan hệ Khách hàng Doanh nghiệp phụ trách là anh Nguyễn Văn A, hoặc Hotline MSB Priority ạ.',
    allowedNumbers: ['0988.123.456', '1800', '59', '9999'],
    nextChips: ['RECENT_ACTIONS', 'CASH_FLOW', 'SESSION_SUMMARY'],
  },

  SESSION_SUMMARY: {
    id: 'SESSION_SUMMARY',
    label: 'Chốt phiên',
    group: 'support',
    keywords: [/tom tat phien/, /gui bao cao/, /chot phien/, /gui email/],
    description: 'Tổng hợp phiên làm việc và gửi báo cáo qua email.',
    fixtureKey: 'session',
    fallbackLine:
      'Em đã tổng hợp phiên làm việc và gửi báo cáo vào email của anh. Chúc anh một ngày làm việc hiệu quả ạ.',
    allowedNumbers: [],
    nextChips: ['CASH_FLOW', 'RECENT_ACTIONS', 'CALL_HOTLINE'],
  },

  UNKNOWN: {
    id: 'UNKNOWN',
    label: 'Chuyển RM thật',
    group: 'fallback',
    keywords: [],
    description:
      'Dùng khi câu hỏi nằm ngoài mọi nghiệp vụ nêu trên. Không suy đoán.',
    fixtureKey: 'contacts',
    fallbackLine:
      'Dạ câu này nằm ngoài phạm vi em hỗ trợ trực tiếp. Để đảm bảo chính xác cho anh, em xin phép chuyển sang anh Nguyễn Văn A, Giám đốc Quan hệ Khách hàng phụ trách tài khoản của mình ạ.',
    allowedNumbers: [],
    nextChips: ['CALL_HOTLINE', 'CASH_FLOW', 'RECENT_ACTIONS'],
  },
}

/**
 * 14 intent nghiệp vụ, xếp theo thứ tự ưu tiên khi khớp keyword.
 * Intent có keyword hẹp và đặc thù đứng trước intent có keyword rộng,
 * tránh việc "duyệt bảo lãnh" bị TRADE_FINANCE nuốt mất vì chứa "bao lanh".
 */
export const BUSINESS_INTENT_IDS: IntentId[] = [
  'APPROVE_FIDO',
  'REJECT_ORDER',
  'FX_FORWARD',
  'SUGGEST_CCTG',
  'FRAUD_ALERT',
  'OBLIGATION_CALENDAR',
  'PERIOD_COMPARE',
  'TXN_HISTORY',
  'LOAN_BALANCE',
  'SESSION_SUMMARY',
  'CALL_HOTLINE',
  'TRADE_FINANCE',
  'RECENT_ACTIONS',
  'CASH_FLOW',
]

export function getIntent(id: IntentId): Intent {
  return INTENTS[id]
}
```

- [ ] **Step 5: Chạy test để xác nhận vượt qua**

Run: `bun test src/lib/intents/registry.test.ts`
Expected: PASS — 8 test.

- [ ] **Step 6: Commit**

```bash
git add src/lib/intents
git commit -m "feat: registry 17 intent với keyword, fallbackLine và chip ngữ cảnh"
```

---

### Task 4: Nhận diện keyword (tầng 2) và bộ 50 câu thử

**Files:**
- Create: `src/lib/intents/resolve.ts`
- Test: `src/lib/intents/phrases.fixture.ts`, `src/lib/intents/resolve.test.ts`

**Interfaces:**
- Consumes: `BUSINESS_INTENT_IDS`, `getIntent` từ Task 3
- Produces:
  - `normalizeVi(s: string): string` — bỏ dấu, viết thường
  - `matchKeyword(text: string): IntentId | null`
  - `TEST_PHRASES: { text: string; expected: IntentId }[]` — 50 câu

- [ ] **Step 1: Viết bộ 50 câu thử**

Create `src/lib/intents/phrases.fixture.ts`. 14 intent × 3 biến thể = 42 câu, cộng 8 câu ngoài phạm vi.

```ts
import type { IntentId } from './types'

export const TEST_PHRASES: { text: string; expected: IntentId }[] = [
  // CASH_FLOW
  { text: 'Báo cáo dòng tiền gần đây của công ty', expected: 'CASH_FLOW' },
  { text: 'Tuần này thu chi thế nào em', expected: 'CASH_FLOW' },
  { text: 'Cho anh xem dòng tiền bảy ngày qua', expected: 'CASH_FLOW' },

  // PERIOD_COMPARE
  { text: 'Tháng này so với cùng kỳ năm ngoái thế nào', expected: 'PERIOD_COMPARE' },
  { text: 'So sánh kết quả với cùng kỳ', expected: 'PERIOD_COMPARE' },
  { text: 'Doanh thu cùng kỳ năm trước bao nhiêu', expected: 'PERIOD_COMPARE' },

  // OBLIGATION_CALENDAR
  { text: 'Sắp tới công ty phải chi những gì', expected: 'OBLIGATION_CALENDAR' },
  { text: 'Lịch chi thuế và lương thế nào', expected: 'OBLIGATION_CALENDAR' },
  { text: 'Nghĩa vụ tài chính tháng này ra sao', expected: 'OBLIGATION_CALENDAR' },

  // TXN_HISTORY
  { text: 'Cho anh xem lịch sử giao dịch gần đây', expected: 'TXN_HISTORY' },
  { text: 'Biến động số dư hôm nay thế nào', expected: 'TXN_HISTORY' },
  { text: 'Mở sao kê tài khoản cho anh', expected: 'TXN_HISTORY' },

  // RECENT_ACTIONS
  { text: 'Có gì chờ anh duyệt không', expected: 'RECENT_ACTIONS' },
  { text: 'Phiên sáng nay thế nào rồi', expected: 'RECENT_ACTIONS' },
  { text: 'Tác vụ gần đây có gì', expected: 'RECENT_ACTIONS' },

  // TRADE_FINANCE
  { text: 'Kiểm tra hạn mức L/C và bảo lãnh cho anh', expected: 'TRADE_FINANCE' },
  { text: 'Hạn mức thư tín dụng còn bao nhiêu', expected: 'TRADE_FINANCE' },
  { text: 'Cho anh xem hạn mức bảo lãnh', expected: 'TRADE_FINANCE' },

  // FRAUD_ALERT
  { text: 'Có giao dịch nào bất thường không', expected: 'FRAUD_ALERT' },
  { text: 'Cảnh báo rủi ro gì không em', expected: 'FRAUD_ALERT' },
  { text: 'Có lệnh nào đáng ngờ không', expected: 'FRAUD_ALERT' },

  // APPROVE_FIDO
  { text: 'Duyệt bảo lãnh VSIP III bằng FIDO', expected: 'APPROVE_FIDO' },
  { text: 'Ký duyệt lệnh này cho anh', expected: 'APPROVE_FIDO' },
  { text: 'Duyệt bảo lãnh đi em', expected: 'APPROVE_FIDO' },

  // REJECT_ORDER
  { text: 'Trả lệnh số ba cho kế toán', expected: 'REJECT_ORDER' },
  { text: 'Từ chối lệnh này ghi chú thiếu hóa đơn', expected: 'REJECT_ORDER' },
  { text: 'Trả về kế toán giúp anh', expected: 'REJECT_ORDER' },

  // SUGGEST_CCTG
  { text: 'Tư vấn chứng chỉ tiền gửi cho anh', expected: 'SUGGEST_CCTG' },
  { text: 'Tiền nhàn rỗi nên làm gì', expected: 'SUGGEST_CCTG' },
  { text: 'Có cách nào tối ưu vốn không', expected: 'SUGGEST_CCTG' },

  // FX_FORWARD
  { text: 'Tỷ giá đang thế nào', expected: 'FX_FORWARD' },
  { text: 'Khóa tỷ giá cho lô hàng Siemens', expected: 'FX_FORWARD' },
  { text: 'Đặt lệnh kỳ hạn USD cho anh', expected: 'FX_FORWARD' },

  // LOAN_BALANCE
  { text: 'Dư nợ vay ngắn hạn còn bao nhiêu', expected: 'LOAN_BALANCE' },
  { text: 'Khế ước nhận nợ nào sắp đáo hạn', expected: 'LOAN_BALANCE' },
  { text: 'Nợ vay hiện tại thế nào', expected: 'LOAN_BALANCE' },

  // CALL_HOTLINE
  { text: 'Kết nối cho anh tới tổng đài', expected: 'CALL_HOTLINE' },
  { text: 'Gọi cho RM phụ trách giúp anh', expected: 'CALL_HOTLINE' },
  { text: 'Cho anh gặp chuyên viên', expected: 'CALL_HOTLINE' },

  // SESSION_SUMMARY
  { text: 'Gửi tóm tắt phiên này vào email anh', expected: 'SESSION_SUMMARY' },
  { text: 'Chốt phiên làm việc hôm nay', expected: 'SESSION_SUMMARY' },
  { text: 'Gửi báo cáo cho anh', expected: 'SESSION_SUMMARY' },

  // Ngoài phạm vi — phải rơi vào UNKNOWN
  { text: 'Cho anh vay hai trăm tỷ', expected: 'UNKNOWN' },
  { text: 'Giá vàng hôm nay bao nhiêu', expected: 'UNKNOWN' },
  { text: 'Mở thẻ tín dụng cá nhân cho anh', expected: 'UNKNOWN' },
  { text: 'Thời tiết Hà Nội thế nào', expected: 'UNKNOWN' },
  { text: 'Kể cho anh một câu chuyện cười', expected: 'UNKNOWN' },
  { text: 'Cổ phiếu MSB hôm nay ra sao', expected: 'UNKNOWN' },
  { text: 'Đặt vé máy bay đi Singapore', expected: 'UNKNOWN' },
  { text: 'Lãi suất vay mua nhà bao nhiêu', expected: 'UNKNOWN' },
]
```

- [ ] **Step 2: Viết test cho `resolve`**

Create `src/lib/intents/resolve.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import { TEST_PHRASES } from './phrases.fixture'
import { matchKeyword, normalizeVi } from './resolve'

describe('normalizeVi', () => {
  test('bỏ dấu tiếng Việt', () => {
    expect(normalizeVi('Dòng tiền')).toBe('dong tien')
  })
  test('chuyển đ thành d', () => {
    expect(normalizeVi('Đặt lệnh')).toBe('dat lenh')
  })
  test('viết thường toàn bộ', () => {
    expect(normalizeVi('BÁO CÁO')).toBe('bao cao')
  })
})

describe('matchKeyword', () => {
  test('trả về null khi không câu nào khớp', () => {
    expect(matchKeyword('giá vàng hôm nay bao nhiêu')).toBeNull()
  })

  test('duyệt bảo lãnh khớp APPROVE_FIDO chứ không phải TRADE_FINANCE', () => {
    expect(matchKeyword('Duyệt bảo lãnh VSIP III bằng FIDO')).toBe('APPROVE_FIDO')
  })

  test('kiểm tra hạn mức bảo lãnh khớp TRADE_FINANCE', () => {
    expect(matchKeyword('Cho anh xem hạn mức bảo lãnh')).toBe('TRADE_FINANCE')
  })
})

describe('Độ phủ bộ 50 câu thử', () => {
  const inScope = TEST_PHRASES.filter((p) => p.expected !== 'UNKNOWN')
  const outOfScope = TEST_PHRASES.filter((p) => p.expected === 'UNKNOWN')

  test('bộ câu thử có đúng 50 câu', () => {
    expect(TEST_PHRASES).toHaveLength(50)
  })

  test('có 8 câu ngoài phạm vi', () => {
    expect(outOfScope).toHaveLength(8)
  })

  test('tầng keyword phủ ít nhất 90% câu trong phạm vi', () => {
    const hit = inScope.filter((p) => matchKeyword(p.text) === p.expected)
    const rate = hit.length / inScope.length
    if (rate < 0.9) {
      const missed = inScope
        .filter((p) => matchKeyword(p.text) !== p.expected)
        .map((p) => `"${p.text}" → ${matchKeyword(p.text) ?? 'null'} (mong đợi ${p.expected})`)
      throw new Error(`Độ phủ ${(rate * 100).toFixed(0)}%. Trượt:\n${missed.join('\n')}`)
    }
    expect(rate).toBeGreaterThanOrEqual(0.9)
  })

  test('không câu ngoài phạm vi nào bị gán nhầm vào intent nghiệp vụ', () => {
    for (const phrase of outOfScope) {
      expect(matchKeyword(phrase.text)).toBeNull()
    }
  })
})
```

- [ ] **Step 3: Chạy test để xác nhận thất bại**

Run: `bun test src/lib/intents/resolve.test.ts`
Expected: FAIL — `Cannot find module './resolve'`

- [ ] **Step 4: Viết `src/lib/intents/resolve.ts`**

```ts
import { BUSINESS_INTENT_IDS, getIntent } from './registry'
import type { IntentId } from './types'

/**
 * Bỏ dấu và viết thường để so khớp bền hơn với sai lệch dấu từ STT.
 * Ký tự đ không tách được bằng NFD nên phải thay riêng.
 */
export function normalizeVi(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tầng 2: duyệt intent theo thứ tự ưu tiên trong BUSINESS_INTENT_IDS.
 * Trả về intent đầu tiên khớp, hoặc null để nhường cho tầng 3.
 */
export function matchKeyword(text: string): IntentId | null {
  const normalized = normalizeVi(text)
  for (const id of BUSINESS_INTENT_IDS) {
    if (getIntent(id).keywords.some((pattern) => pattern.test(normalized))) {
      return id
    }
  }
  return null
}
```

- [ ] **Step 5: Chạy test và vá keyword cho tới khi đạt ngưỡng**

Run: `bun test src/lib/intents/resolve.test.ts`

Test độ phủ in ra danh sách câu trượt kèm intent bị khớp nhầm. Với mỗi câu trượt, sửa `keywords` của intent tương ứng trong `registry.ts`. Hai lỗi thường gặp:

- **Trượt hoàn toàn** (trả `null`): thiếu biến thể. Ví dụ "bảy ngày qua" cần thêm `/bay ngay/` vào `CASH_FLOW`.
- **Khớp nhầm intent khác**: keyword quá rộng. Thu hẹp regex hoặc đẩy intent hẹp lên trước trong `BUSINESS_INTENT_IDS`.

Expected sau khi vá: PASS — độ phủ ≥ 90%, và 8 câu ngoài phạm vi đều trả `null`.

- [ ] **Step 6: Chạy toàn bộ test**

Run: `bun test`
Expected: PASS — tất cả test của Task 2, 3, 4.

- [ ] **Step 7: Commit**

```bash
git add src/lib/intents
git commit -m "feat: nhận diện keyword tầng 2 và bộ 50 câu thử tiếng Việt"
```

---

### Task 5: Numeric guard

**Files:**
- Create: `src/lib/intents/guard.ts`
- Test: `src/lib/intents/guard.test.ts`

**Interfaces:**
- Consumes: `getIntent` từ Task 3
- Produces:
  - `extractNumberTokens(text: string): string[]`
  - `findViolations(text: string, allowed: string[]): string[]`
  - `isSafeReply(text: string, intentId: IntentId): boolean`

- [ ] **Step 1: Viết test trước**

Create `src/lib/intents/guard.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import { extractNumberTokens, findViolations, isSafeReply } from './guard'

describe('extractNumberTokens', () => {
  test('trích số có dấu phẩy thập phân', () => {
    expect(extractNumberTokens('thặng dư 18,2 tỷ')).toEqual(['18,2'])
  })

  test('trích số có dấu chấm phân nhóm', () => {
    expect(extractNumberTokens('tỷ giá 26.180 đồng')).toEqual(['26.180'])
  })

  test('trích nhiều số trong một câu', () => {
    expect(extractNumberTokens('12/12 lệnh, 48,5 tỷ')).toEqual(['12/12', '48,5'])
  })

  test('bỏ dấu câu bám đuôi', () => {
    expect(extractNumberTokens('còn 15 tỷ.')).toEqual(['15'])
  })

  test('trả mảng rỗng khi không có số', () => {
    expect(extractNumberTokens('Dạ em đã ghi nhận ạ')).toEqual([])
  })
})

describe('findViolations', () => {
  test('không báo vi phạm khi mọi số đều hợp lệ', () => {
    expect(findViolations('thặng dư ròng 18,2 tỷ', ['18,2', '7'])).toEqual([])
  })

  test('bắt được số bịa', () => {
    expect(findViolations('thặng dư ròng 4,85 tỷ', ['18,2'])).toEqual(['4,85'])
  })

  test('bắt được nhiều số bịa cùng lúc', () => {
    expect(findViolations('thu 99 chi 88', ['65'])).toEqual(['99', '88'])
  })
})

describe('isSafeReply', () => {
  test('chấp nhận lời thoại dùng đúng số của intent', () => {
    const reply = 'Báo cáo Mr Z, 7 ngày qua dòng tiền thặng dư ròng 18,2 tỷ VNĐ ạ.'
    expect(isSafeReply(reply, 'CASH_FLOW')).toBe(true)
  })

  test('từ chối lời thoại chứa số không có trong fixtures', () => {
    const reply = 'Báo cáo Mr Z, dòng tiền thặng dư ròng 91,7 tỷ VNĐ ạ.'
    expect(isSafeReply(reply, 'CASH_FLOW')).toBe(false)
  })

  test('chấp nhận lời thoại hoàn toàn không có số', () => {
    expect(isSafeReply('Dạ em đã ghi nhận ạ.', 'REJECT_ORDER')).toBe(true)
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `bun test src/lib/intents/guard.test.ts`
Expected: FAIL — `Cannot find module './guard'`

- [ ] **Step 3: Viết `src/lib/intents/guard.ts`**

```ts
import { getIntent } from './registry'
import type { IntentId } from './types'

/** Khớp chuỗi số có thể chứa dấu chấm, phẩy hoặc gạch chéo ở giữa */
const NUMBER_PATTERN = /\d+(?:[.,/:]\d+)*/g

function trimTrailingSeparator(token: string): string {
  return token.replace(/[.,/:]+$/, '')
}

export function extractNumberTokens(text: string): string[] {
  return (text.match(NUMBER_PATTERN) ?? []).map(trimTrailingSeparator)
}

export function findViolations(text: string, allowed: string[]): string[] {
  const allowedSet = new Set(allowed.map(trimTrailingSeparator))
  return extractNumberTokens(text).filter((token) => !allowedSet.has(token))
}

/**
 * Lời thoại chỉ an toàn khi mọi con số trong đó đều nằm trong
 * danh sách cho phép của intent. LLM được đổi cách nói, không được đổi số.
 */
export function isSafeReply(text: string, intentId: IntentId): boolean {
  const violations = findViolations(text, getIntent(intentId).allowedNumbers)
  if (violations.length > 0) {
    console.error(`[guard] ${intentId} sinh số lạ:`, violations, '|', text)
  }
  return violations.length === 0
}
```

- [ ] **Step 4: Chạy test để xác nhận vượt qua**

Run: `bun test src/lib/intents/guard.test.ts`
Expected: PASS — 11 test.

Nếu test `isSafeReply` với `CASH_FLOW` thất bại, kiểm tra `allowedNumbers` của `CASH_FLOW` trong registry có chứa `'7'` và `'18,2'` không.

- [ ] **Step 5: Commit**

```bash
git add src/lib/intents/guard.ts src/lib/intents/guard.test.ts
git commit -m "feat: numeric guard chặn LLM bịa số liệu tài chính"
```

---

### Task 6: Route STT và phân loại intent tầng 3

**Files:**
- Create: `src/app/api/stt/route.ts`
- Create: `src/app/api/intent/route.ts`
- Create: `src/lib/groq.ts`
- Modify: `src/lib/intents/resolve.ts`

**Interfaces:**
- Consumes: `matchKeyword` từ Task 4, `INTENTS`/`BUSINESS_INTENT_IDS` từ Task 3
- Produces:
  - `POST /api/stt` — nhận `FormData` field `audio`, trả `{ text: string }`
  - `POST /api/intent` — nhận `{ text: string }`, trả `{ intentId: IntentId }`
  - `resolveIntent(text: string): Promise<IntentId>` — tầng 2 rồi tầng 3

- [ ] **Step 1: Viết `src/lib/groq.ts`**

```ts
import Groq from 'groq-sdk'

export const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

export const STT_MODEL = 'whisper-large-v3-turbo'
export const LLM_MODEL = 'llama-3.3-70b-versatile'
```

- [ ] **Step 2: Viết `src/app/api/stt/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { STT_MODEL, groq } from '@/lib/groq'

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const audio = form.get('audio')

    if (!(audio instanceof File)) {
      return NextResponse.json({ text: '' })
    }

    const result = await groq.audio.transcriptions.create({
      file: audio,
      model: STT_MODEL,
      language: 'vi',
    })

    return NextResponse.json({ text: result.text.trim() })
  } catch (error) {
    console.error('[stt] thất bại:', error)
    return NextResponse.json({ text: '' })
  }
}
```

Trả chuỗi rỗng thay vì mã lỗi là có chủ đích: client coi chuỗi rỗng là tín hiệu rơi xuống chip bar, không hiển thị lỗi.

- [ ] **Step 3: Viết `src/app/api/intent/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { LLM_MODEL, groq } from '@/lib/groq'
import { BUSINESS_INTENT_IDS, INTENTS, getIntent } from '@/lib/intents/registry'
import type { IntentId } from '@/lib/intents/types'

const CATALOG = BUSINESS_INTENT_IDS.map(
  (id) => `${id}: ${getIntent(id).description}`,
).join('\n')

const SYSTEM_PROMPT = `Bạn là bộ phân loại ý định cho trợ lý ngân hàng doanh nghiệp MSB.

Nhiệm vụ duy nhất: đọc câu nói của khách hàng và trả về đúng MỘT mã ý định.

Danh sách ý định:
${CATALOG}

Quy tắc:
- Chỉ trả về mã ý định, viết hoa, không giải thích, không dấu câu.
- Nếu câu nói không thuộc bất kỳ ý định nào ở trên, trả về UNKNOWN.
- Tuyệt đối không suy đoán. Thà trả UNKNOWN còn hơn đoán sai.`

function coerceIntentId(raw: string): IntentId {
  const candidate = raw.trim().toUpperCase().replace(/[^A-Z_]/g, '')
  if (candidate in INTENTS && candidate !== 'FIDO_LOGIN' && candidate !== 'GREETING') {
    return candidate as IntentId
  }
  return 'UNKNOWN'
}

export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text?: string }
    if (!text?.trim()) {
      return NextResponse.json({ intentId: 'UNKNOWN' satisfies IntentId })
    }

    const completion = await groq.chat.completions.create({
      model: LLM_MODEL,
      temperature: 0,
      max_tokens: 12,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: text },
      ],
    })

    const raw = completion.choices[0]?.message?.content ?? ''
    return NextResponse.json({ intentId: coerceIntentId(raw) })
  } catch (error) {
    console.error('[intent] thất bại:', error)
    return NextResponse.json({ intentId: 'UNKNOWN' satisfies IntentId })
  }
}
```

- [ ] **Step 4: Bổ sung `resolveIntent` vào `src/lib/intents/resolve.ts`**

Thêm vào cuối file:

```ts
/**
 * Tầng 2 trước, tầng 3 sau. Mọi lỗi đều rơi về UNKNOWN
 * để guardrail chạy thay vì hiển thị lỗi lên màn hình.
 */
export async function resolveIntent(text: string): Promise<IntentId> {
  const byKeyword = matchKeyword(text)
  if (byKeyword) return byKeyword

  try {
    const response = await fetch('/api/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    const data = (await response.json()) as { intentId: IntentId }
    return data.intentId
  } catch (error) {
    console.error('[resolve] tầng 3 thất bại:', error)
    return 'UNKNOWN'
  }
}
```

- [ ] **Step 5: Kiểm tra thủ công với khóa Groq thật**

```bash
cp .env.local.example .env.local
# Điền GROQ_API_KEY vào .env.local
bun dev
```

Ở terminal khác:

```bash
curl -s localhost:3000/api/intent -H 'Content-Type: application/json' \
  -d '{"text":"Công ty mình đang có bao nhiêu tiền rảnh chưa dùng tới"}'
```

Expected: `{"intentId":"SUGGEST_CCTG"}` — câu này cố ý không chứa keyword nào, buộc phải đi qua tầng 3.

```bash
curl -s localhost:3000/api/intent -H 'Content-Type: application/json' \
  -d '{"text":"Giá vàng SJC hôm nay bao nhiêu một lượng"}'
```

Expected: `{"intentId":"UNKNOWN"}`

- [ ] **Step 6: Commit**

```bash
git add src/lib/groq.ts src/app/api src/lib/intents/resolve.ts
git commit -m "feat: route STT Groq Whisper và phân loại intent tầng 3"
```

---

### Task 7: Sinh lời thoại và tổng hợp giọng nói

**Files:**
- Create: `src/lib/audio/providers/edge-tts.ts`
- Create: `src/app/api/reply/route.ts`
- Create: `src/app/api/tts/route.ts`

**Interfaces:**
- Consumes: `getIntent` từ Task 3, `isSafeReply` từ Task 5, `fixtures` từ Task 2
- Produces:
  - `type TtsProvider = { synthesize(text: string): Promise<Buffer> }`
  - `edgeTts: TtsProvider`
  - `POST /api/reply` — nhận `{ intentId }`, trả text lời thoại đã qua guard dưới dạng `text/plain` stream
  - `POST /api/tts` — nhận `{ text }`, trả `audio/mpeg`

- [ ] **Step 1: Xác nhận API thật của msedge-tts**

Package này ít tài liệu và API đổi giữa các bản major. Đọc file khai báo kiểu trước khi viết code:

```bash
cat node_modules/msedge-tts/dist/index.d.ts
```

Ghi lại: tên class, chữ ký `setMetadata`, và phương thức sinh audio (`toStream` hay `toFile`), kiểu trả về. Đoạn code ở Step 2 viết theo API phổ biến của dòng 2.x — nếu khai báo kiểu khác, sửa theo khai báo thật chứ không sửa theo code mẫu.

- [ ] **Step 2: Viết `src/lib/audio/providers/edge-tts.ts`**

```ts
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'

export type TtsProvider = {
  synthesize(text: string): Promise<Buffer>
}

export const VOICE_NAME = 'vi-VN-HoaiMyNeural'

/**
 * Edge-TTS là API không chính thức của Microsoft và có thể bị chặn.
 * Toàn bộ phụ thuộc vào nó nằm gọn trong file này — đổi nhà cung cấp
 * chỉ cần viết một object khác thỏa TtsProvider.
 */
export const edgeTts: TtsProvider = {
  async synthesize(text: string): Promise<Buffer> {
    const tts = new MsEdgeTTS()
    await tts.setMetadata(VOICE_NAME, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)

    const { audioStream } = tts.toStream(text)
    const chunks: Buffer[] = []

    return new Promise((resolve, reject) => {
      audioStream.on('data', (chunk: Buffer) => chunks.push(chunk))
      audioStream.on('end', () => resolve(Buffer.concat(chunks)))
      audioStream.on('error', reject)
    })
  },
}
```

- [ ] **Step 3: Viết `src/app/api/tts/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { edgeTts } from '@/lib/audio/providers/edge-tts'

// msedge-tts cần WebSocket client của Node, không chạy được trên Edge runtime
export const runtime = 'nodejs'

export async function POST(request: Request) {
  try {
    const { text } = (await request.json()) as { text?: string }
    if (!text?.trim()) {
      return new NextResponse(null, { status: 204 })
    }

    const audio = await edgeTts.synthesize(text)

    return new NextResponse(new Uint8Array(audio), {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('[tts] thất bại:', error)
    return new NextResponse(null, { status: 204 })
  }
}
```

Trả 204 thay vì 500 là có chủ đích: client coi phản hồi rỗng là tín hiệu dùng MP3 dự phòng.

- [ ] **Step 4: Viết `src/app/api/reply/route.ts`**

```ts
import { NextResponse } from 'next/server'
import { LLM_MODEL, groq } from '@/lib/groq'
import { fixtures } from '@/lib/data/fixtures'
import { isSafeReply } from '@/lib/intents/guard'
import { getIntent } from '@/lib/intents/registry'
import type { IntentId } from '@/lib/intents/types'

const PERSONA = `Bạn là Mai, Trợ lý Quan hệ Khách hàng Doanh nghiệp của ngân hàng MSB.

Cách nói:
- Luôn xưng "em", gọi khách hàng là "Mr Z" hoặc "anh".
- Chuyên nghiệp, nhã nhặn, sắc bén. Câu ngắn, dẫn số liệu trước, khuyến nghị sau.
- Kết câu bằng "ạ" một cách tự nhiên, không lạm dụng.
- Trả lời bằng tiếng Việt có dấu đầy đủ, 2 đến 3 câu.

Ràng buộc tuyệt đối về số liệu:
- CHỈ dùng những con số xuất hiện nguyên văn trong dữ liệu được cấp.
- CẤM cộng, trừ, nhân, chia, ước lượng, làm tròn lại hay quy đổi bất kỳ con số nào.
- Nếu cần một con số không có trong dữ liệu, hãy diễn đạt bằng lời thay vì bịa số.`

function buildUserPrompt(intentId: IntentId): string {
  const intent = getIntent(intentId)
  const slice = intent.fixtureKey ? fixtures[intent.fixtureKey] : {}

  return `Ngữ cảnh: ${intent.description}

Dữ liệu được phép dùng (JSON):
${JSON.stringify(slice, null, 2)}

Các con số được phép xuất hiện trong câu trả lời:
${intent.allowedNumbers.join(', ') || '(không có con số nào)'}

Hãy nói với Mr Z về nội dung này.`
}

async function generateOnce(intentId: IntentId): Promise<string> {
  const completion = await groq.chat.completions.create({
    model: LLM_MODEL,
    temperature: 0.7,
    max_tokens: 120,
    messages: [
      { role: 'system', content: PERSONA },
      { role: 'user', content: buildUserPrompt(intentId) },
    ],
  })
  return completion.choices[0]?.message?.content?.trim() ?? ''
}

export async function POST(request: Request) {
  const { intentId } = (await request.json()) as { intentId: IntentId }
  const intent = getIntent(intentId)

  try {
    let reply = await generateOnce(intentId)

    // Numeric guard: sinh lại đúng một lần, sau đó dùng câu mẫu
    if (!isSafeReply(reply, intentId)) {
      reply = await generateOnce(intentId)
    }
    if (!isSafeReply(reply, intentId)) {
      reply = intent.fallbackLine
    }

    return NextResponse.json({ reply, source: 'llm' })
  } catch (error) {
    console.error('[reply] thất bại, dùng câu mẫu:', error)
    return NextResponse.json({ reply: intent.fallbackLine, source: 'fallback' })
  }
}
```

- [ ] **Step 5: Kiểm tra thủ công**

```bash
bun dev
```

```bash
curl -s localhost:3000/api/reply -H 'Content-Type: application/json' \
  -d '{"intentId":"CASH_FLOW"}'
```

Expected: JSON có `reply` là câu tiếng Việt xưng "em", gọi "Mr Z", và mọi con số thuộc `['7','65','46,8','18,2']`. Gọi lại lần nữa phải ra câu chữ **khác** — đó là mục đích của việc sinh thoại thay vì phát băng.

```bash
curl -s localhost:3000/api/tts -H 'Content-Type: application/json' \
  -d '{"text":"Chào anh Z, em là Mai."}' --output .tmp/test.mp3
afplay .tmp/test.mp3
```

Expected: nghe được giọng nữ miền Bắc đọc rõ tiếng Việt. Nếu file 0 byte, quay lại Step 1 — API của msedge-tts khác với code mẫu.

- [ ] **Step 6: Commit**

```bash
git add src/lib/audio src/app/api/reply src/app/api/tts
git commit -m "feat: sinh lời thoại có numeric guard và tổng hợp giọng nói Edge-TTS"
```

---

### Task 8: Cache audio và bộ phát có hàng đợi

Đây là nơi rủi ro autoplay iOS được xử lý. Sai ở đây thì demo câm trên iPhone.

**Files:**
- Create: `src/lib/audio/cache.ts`
- Create: `src/lib/audio/player.ts`
- Test: `src/lib/audio/splitSentences.test.ts`

**Interfaces:**
- Consumes: không
- Produces:
  - `splitSentences(text: string): string[]`
  - `unlockAudio(): void` — **phải gọi trong user gesture**
  - `speak(text: string, onFirstAudio?: () => void): Promise<void>`
  - `stopSpeaking(): void`
  - `getCached(text): Promise<Blob | null>`, `putCached(text, blob): Promise<void>`

- [ ] **Step 1: Viết test cho việc cắt câu**

Cắt câu là điều kiện để phát mảnh đầu sớm, nên phải đúng. Create `src/lib/audio/splitSentences.test.ts`:

```ts
import { describe, expect, test } from 'bun:test'
import { splitSentences } from './player'

describe('splitSentences', () => {
  test('cắt theo dấu chấm', () => {
    expect(splitSentences('Chào anh Z. Em là Mai.')).toEqual([
      'Chào anh Z.',
      'Em là Mai.',
    ])
  })

  test('cắt theo dấu phẩy khi câu dài', () => {
    const long =
      'Báo cáo Mr Z, trong bảy ngày qua dòng tiền của doanh nghiệp đang thặng dư ròng mười tám phẩy hai tỷ đồng, các khoản thu đã về đủ.'
    const parts = splitSentences(long)
    expect(parts.length).toBeGreaterThan(1)
  })

  test('không cắt số thập phân', () => {
    expect(splitSentences('Thặng dư 18,2 tỷ đồng.')).toEqual([
      'Thặng dư 18,2 tỷ đồng.',
    ])
  })

  test('bỏ qua mảnh rỗng', () => {
    expect(splitSentences('Xong.  ')).toEqual(['Xong.'])
  })

  test('trả mảng rỗng với chuỗi rỗng', () => {
    expect(splitSentences('')).toEqual([])
  })
})
```

- [ ] **Step 2: Chạy test để xác nhận thất bại**

Run: `bun test src/lib/audio/splitSentences.test.ts`
Expected: FAIL — `Cannot find module './player'`

- [ ] **Step 3: Viết `src/lib/audio/cache.ts`**

```ts
const CACHE_NAME = 'msb-rm-tts-v1'

async function hashText(text: string): Promise<string> {
  const bytes = new TextEncoder().encode(text)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32)
}

async function keyFor(text: string): Promise<string> {
  return `/tts-cache/${await hashText(text)}`
}

/**
 * Cache nằm phía client chứ không phải server, vì đây là điều kiện
 * để demo chạy được khi mất mạng hoàn toàn.
 */
export async function getCached(text: string): Promise<Blob | null> {
  if (typeof caches === 'undefined') return null
  try {
    const cache = await caches.open(CACHE_NAME)
    const hit = await cache.match(await keyFor(text))
    return hit ? await hit.blob() : null
  } catch (error) {
    console.error('[cache] đọc thất bại:', error)
    return null
  }
}

export async function putCached(text: string, blob: Blob): Promise<void> {
  if (typeof caches === 'undefined') return
  try {
    const cache = await caches.open(CACHE_NAME)
    await cache.put(
      await keyFor(text),
      new Response(blob, { headers: { 'Content-Type': 'audio/mpeg' } }),
    )
  } catch (error) {
    console.error('[cache] ghi thất bại:', error)
  }
}
```

- [ ] **Step 4: Viết `src/lib/audio/player.ts`**

```ts
import { getCached, putCached } from './cache'

const MAX_CHUNK_LENGTH = 90

let audioContext: AudioContext | null = null
let currentAudio: HTMLAudioElement | null = null
let playToken = 0

/**
 * PHẢI gọi bên trong một user gesture (ví dụ handler của nút đăng nhập).
 * iOS Safari chặn mọi lần phát audio sau đó nếu bước này bị bỏ qua.
 */
export function unlockAudio(): void {
  if (audioContext) return
  try {
    audioContext = new AudioContext()
    const silent = audioContext.createBuffer(1, 1, 22_050)
    const source = audioContext.createBufferSource()
    source.buffer = silent
    source.connect(audioContext.destination)
    source.start(0)
  } catch (error) {
    console.error('[audio] mở khóa thất bại:', error)
  }
}

/**
 * Cắt lời thoại thành mảnh đủ ngắn để tổng hợp nhanh.
 * Ưu tiên dấu chấm, xuống dấu phẩy khi mảnh vẫn quá dài.
 * Không cắt ở dấu phẩy nằm giữa hai chữ số (18,2).
 */
export function splitSentences(text: string): string[] {
  const bySentence = text
    .split(/(?<=[.!?])\s+/)
    .map((part) => part.trim())
    .filter(Boolean)

  const result: string[] = []
  for (const sentence of bySentence) {
    if (sentence.length <= MAX_CHUNK_LENGTH) {
      result.push(sentence)
      continue
    }
    const byComma = sentence
      .split(/(?<=\D),\s+/)
      .map((part) => part.trim())
      .filter(Boolean)
    result.push(...byComma)
  }
  return result
}

async function fetchAudio(text: string): Promise<Blob | null> {
  const cached = await getCached(text)
  if (cached) return cached

  try {
    const response = await fetch('/api/tts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok || response.status === 204) return null

    const blob = await response.blob()
    void putCached(text, blob)
    return blob
  } catch (error) {
    console.error('[audio] tải tts thất bại:', error)
    return null
  }
}

function playBlob(blob: Blob, token: number): Promise<void> {
  return new Promise((resolve) => {
    if (token !== playToken) return resolve()

    const url = URL.createObjectURL(blob)
    const audio = new Audio(url)
    currentAudio = audio

    const cleanup = () => {
      URL.revokeObjectURL(url)
      if (currentAudio === audio) currentAudio = null
      resolve()
    }

    audio.onended = cleanup
    audio.onerror = cleanup
    void audio.play().catch((error) => {
      console.error('[audio] play bị chặn:', error)
      cleanup()
    })
  })
}

/**
 * Phát lời thoại theo mảnh. Mảnh đầu được tải và phát ngay,
 * các mảnh sau tải nền song song rồi phát nối tiếp.
 * onFirstAudio bắn đúng một lần, dùng để đo time-to-first-audio.
 */
export async function speak(text: string, onFirstAudio?: () => void): Promise<void> {
  stopSpeaking()
  const token = ++playToken

  const chunks = splitSentences(text)
  if (chunks.length === 0) return

  const pending = chunks.map((chunk) => fetchAudio(chunk))
  let announced = false

  for (const promise of pending) {
    if (token !== playToken) return
    const blob = await promise
    if (!blob) continue

    if (!announced) {
      announced = true
      onFirstAudio?.()
    }
    await playBlob(blob, token)
  }
}

/** Barge-in: người dùng chạm orb để ngắt lời RM */
export function stopSpeaking(): void {
  playToken++
  if (currentAudio) {
    currentAudio.pause()
    currentAudio.currentTime = 0
    currentAudio = null
  }
}
```

- [ ] **Step 5: Chạy test để xác nhận vượt qua**

Run: `bun test src/lib/audio/splitSentences.test.ts`
Expected: PASS — 5 test.

- [ ] **Step 6: Chạy toàn bộ test**

Run: `bun test`
Expected: PASS — toàn bộ Task 2 đến Task 8.

- [ ] **Step 7: Commit**

```bash
git add src/lib/audio
git commit -m "feat: mở khóa autoplay, cache client và bộ phát audio có hàng đợi"
```

---

### Task 9: State phiên và reset

**Files:**
- Create: `src/lib/session.ts`

**Interfaces:**
- Consumes: `IntentId` từ Task 3
- Produces: `useSession` — Zustand store với
  - state: `phase`, `activeIntent`, `chips`, `history`, `isListening`, `isSpeaking`, `drawerOpen`, `lastLatencyMs`
  - action: `unlock()`, `runIntent(id)`, `setListening(v)`, `setSpeaking(v)`, `toggleDrawer(v)`, `recordLatency(ms)`, `resetSession()`

- [ ] **Step 1: Viết `src/lib/session.ts`**

```ts
import { create } from 'zustand'
import { getIntent } from './intents/registry'
import type { IntentId } from './intents/types'

export type Phase = 'locked' | 'dashboard'

const INITIAL_CHIPS: IntentId[] = ['CASH_FLOW', 'RECENT_ACTIONS', 'TRADE_FINANCE']

type SessionState = {
  phase: Phase
  activeIntent: IntentId | null
  chips: IntentId[]
  history: IntentId[]
  isListening: boolean
  isSpeaking: boolean
  drawerOpen: boolean
  lastLatencyMs: number | null

  unlock: () => void
  runIntent: (id: IntentId) => void
  setListening: (value: boolean) => void
  setSpeaking: (value: boolean) => void
  toggleDrawer: (value: boolean) => void
  recordLatency: (ms: number) => void
  resetSession: () => void
}

export const useSession = create<SessionState>((set) => ({
  phase: 'locked',
  activeIntent: null,
  chips: INITIAL_CHIPS,
  history: [],
  isListening: false,
  isSpeaking: false,
  drawerOpen: false,
  lastLatencyMs: null,

  unlock: () => set({ phase: 'dashboard' }),

  runIntent: (id) =>
    set((state) => {
      const next = getIntent(id).nextChips
      return {
        activeIntent: id,
        chips: next.length > 0 ? next : state.chips,
        history: [...state.history, id],
        drawerOpen: false,
      }
    }),

  setListening: (value) => set({ isListening: value }),
  setSpeaking: (value) => set({ isSpeaking: value }),
  toggleDrawer: (value) => set({ drawerOpen: value }),
  recordLatency: (ms) => set({ lastLatencyMs: ms }),

  /**
   * Đưa phiên về trạng thái sạch để demo lại từ đầu.
   * Giữ nguyên phase dashboard và cache audio — presenter
   * không phải đăng nhập lại giữa hai lượt trình diễn.
   */
  resetSession: () =>
    set({
      activeIntent: null,
      chips: INITIAL_CHIPS,
      history: [],
      isListening: false,
      isSpeaking: false,
      drawerOpen: false,
      lastLatencyMs: null,
    }),
}))
```

- [ ] **Step 2: Kiểm tra biên dịch**

Run: `bunx tsc --noEmit`
Expected: không lỗi.

- [ ] **Step 3: Commit**

```bash
git add src/lib/session.ts
git commit -m "feat: state phiên Zustand với chip ngữ cảnh và reset"
```

---

### Task 10: FIDO và màn hình khóa

**Files:**
- Create: `src/lib/fido.ts`
- Create: `src/components/fido/LockScreen.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `unlockAudio` từ Task 8, `useSession` từ Task 9
- Produces:
  - `hasPlatformAuthenticator(): Promise<boolean>`
  - `authenticate(): Promise<'real' | 'simulated'>`
  - `<LockScreen />`

- [ ] **Step 1: Viết `src/lib/fido.ts`**

```ts
const TIMEOUT_MS = 3_000

/**
 * Dò khả năng thay vì dò hệ điều hành. Cách này xử lý luôn
 * iPhone chưa bật Face ID, Android thiếu Play Services,
 * và máy chưa đăng ký vân tay.
 */
export async function hasPlatformAuthenticator(): Promise<boolean> {
  try {
    if (typeof PublicKeyCredential === 'undefined') return false
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable()
  } catch {
    return false
  }
}

function randomChallenge(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(32))
}

/**
 * Trả về 'real' nếu sinh trắc học thật đã xác thực thành công,
 * 'simulated' trong mọi trường hợp còn lại. Không bao giờ ném lỗi —
 * màn hình khóa phải mở được kể cả khi mọi thứ hỏng.
 */
export async function authenticate(): Promise<'real' | 'simulated'> {
  if (!(await hasPlatformAuthenticator())) return 'simulated'

  try {
    const credential = await navigator.credentials.create({
      publicKey: {
        challenge: randomChallenge(),
        rp: { name: 'MSB M-Bank Corporate' },
        user: {
          id: randomChallenge(),
          name: 'mrz@acom.vn',
          displayName: 'Mr Z',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },
          { type: 'public-key', alg: -257 },
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: TIMEOUT_MS,
      },
    })
    return credential ? 'real' : 'simulated'
  } catch (error) {
    console.error('[fido] rơi về mô phỏng:', error)
    return 'simulated'
  }
}
```

- [ ] **Step 2: Viết `src/components/fido/LockScreen.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { Fingerprint } from 'lucide-react'
import { useState } from 'react'
import { unlockAudio } from '@/lib/audio/player'
import { authenticate } from '@/lib/fido'
import { useSession } from '@/lib/session'

export function LockScreen() {
  const unlock = useSession((s) => s.unlock)
  const [scanning, setScanning] = useState(false)

  async function handleAuthenticate() {
    // Cả hai lệnh dưới PHẢI nằm trong user gesture này.
    // Tách ra chỗ khác là demo sẽ câm trên iOS.
    unlockAudio()
    void navigator.mediaDevices?.getUserMedia({ audio: true }).catch(() => {})

    setScanning(true)
    await authenticate()
    setScanning(false)
    unlock()
  }

  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-10 bg-obsidian px-6">
      <div className="text-center">
        <h1 className="text-xl font-semibold tracking-wide text-white">
          MSB <span className="text-msb-orange">M-Bank</span> Corporate
        </h1>
        <p className="mt-2 text-sm text-white/50">
          Công ty CP Công Nghệ &amp; Thương Mại Á Châu
        </p>
      </div>

      <button
        type="button"
        onClick={handleAuthenticate}
        disabled={scanning}
        className="relative flex size-40 items-center justify-center rounded-full border border-msb-gold/30 bg-card disabled:opacity-90"
      >
        {scanning && (
          <motion.span
            className="absolute inset-0 rounded-full border-2 border-msb-gold"
            animate={{ scale: [1, 1.25], opacity: [0.8, 0] }}
            transition={{ duration: 1.2, repeat: Infinity, ease: 'easeOut' }}
          />
        )}
        <Fingerprint className="size-16 text-msb-gold" strokeWidth={1.2} />
      </button>

      <p className="text-sm text-white/60">
        {scanning ? 'Đang xác thực sinh trắc học…' : 'Chạm để xác thực FIDO Biometric'}
      </p>
    </main>
  )
}
```

- [ ] **Step 3: Nối vào `src/app/page.tsx`**

```tsx
'use client'

import { LockScreen } from '@/components/fido/LockScreen'
import { useSession } from '@/lib/session'

export default function Home() {
  const phase = useSession((s) => s.phase)

  if (phase === 'locked') return <LockScreen />

  return (
    <main className="flex min-h-dvh items-center justify-center">
      <p className="text-msb-gold">Đã đăng nhập. Dashboard sẽ dựng ở Task 11.</p>
    </main>
  )
}
```

- [ ] **Step 4: Kiểm tra trên máy tính**

Run: `bun dev`, mở `http://localhost:3000`
Expected: màn hình khóa hiện vòng tròn vân tay vàng kim. Chạm vào — trên máy tính không có platform authenticator thì `hasPlatformAuthenticator()` trả `false` và chuyển thẳng sang Dashboard, không treo, không báo lỗi.

- [ ] **Step 5: Kiểm tra trên điện thoại thật qua HTTPS**

WebAuthn và micro đều đòi HTTPS. Mở tunnel:

```bash
bunx cloudflared tunnel --url http://localhost:3000
```

Mở URL `https://*.trycloudflare.com` trên iPhone hoặc Android.
Expected: chạm nút → prompt sinh trắc học thật hiện lên. Trên iOS là overlay Face ID; trên Android là bottom sheet Google Credential Manager. Hủy prompt cũng phải vào được Dashboard.

- [ ] **Step 6: Commit**

```bash
git add src/lib/fido.ts src/components/fido src/app/page.tsx
git commit -m "feat: FIDO dò khả năng và màn hình khóa mở khóa autoplay"
```

---

### Task 11: Giao diện thoại — Orb, ChipBar, Drawer

**Files:**
- Create: `src/components/voice/Orb.tsx`
- Create: `src/components/voice/ChipBar.tsx`
- Create: `src/components/voice/Drawer.tsx`

(Dashboard và `page.tsx` được nối ở Task 12 — task này chỉ dựng ba component rời.)

**Interfaces:**
- Consumes: `useSession` từ Task 9, `stopSpeaking` từ Task 8, `INTENTS`/`BUSINESS_INTENT_IDS` từ Task 3
- Produces: `<Orb onPress />`, `<ChipBar onSelect />`, `<Drawer onSelect />`, `<Dashboard />`

- [ ] **Step 1: Viết `src/components/voice/Orb.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { Mic } from 'lucide-react'
import { useSession } from '@/lib/session'

type Props = {
  onPress: () => void
}

export function Orb({ onPress }: Props) {
  const isListening = useSession((s) => s.isListening)
  const isSpeaking = useSession((s) => s.isSpeaking)

  const active = isListening || isSpeaking

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={isSpeaking ? 'Chạm để ngắt lời trợ lý' : 'Chạm để nói'}
      className="relative flex size-24 items-center justify-center rounded-full bg-card"
    >
      <motion.span
        className="absolute inset-0 rounded-full bg-msb-orange/25 blur-xl"
        animate={active ? { scale: [1, 1.3, 1] } : { scale: 1 }}
        transition={{ duration: 1.4, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
      />
      <motion.span
        className="absolute inset-1 rounded-full border border-msb-gold/40"
        animate={active ? { opacity: [0.4, 1, 0.4] } : { opacity: 0.4 }}
        transition={{ duration: 1.4, repeat: active ? Infinity : 0, ease: 'easeInOut' }}
      />
      <Mic className="relative size-8 text-msb-gold" strokeWidth={1.5} />
    </button>
  )
}
```

- [ ] **Step 2: Viết `src/components/voice/ChipBar.tsx`**

```tsx
'use client'

import { ChevronRight } from 'lucide-react'
import { getIntent } from '@/lib/intents/registry'
import type { IntentId } from '@/lib/intents/types'
import { useSession } from '@/lib/session'

type Props = {
  onSelect: (id: IntentId) => void
}

export function ChipBar({ onSelect }: Props) {
  const chips = useSession((s) => s.chips)
  const toggleDrawer = useSession((s) => s.toggleDrawer)

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 pb-2">
      {chips.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => onSelect(id)}
          className="shrink-0 rounded-full border border-white/10 bg-card px-4 py-2 text-sm text-white/85"
        >
          {getIntent(id).label}
        </button>
      ))}
      <button
        type="button"
        onClick={() => toggleDrawer(true)}
        className="flex shrink-0 items-center gap-1 rounded-full border border-msb-gold/30 px-4 py-2 text-sm text-msb-gold"
      >
        Tất cả
        <ChevronRight className="size-4" />
      </button>
    </div>
  )
}
```

- [ ] **Step 3: Viết `src/components/voice/Drawer.tsx`**

```tsx
'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, X } from 'lucide-react'
import { BUSINESS_INTENT_IDS, getIntent } from '@/lib/intents/registry'
import type { IntentGroup, IntentId } from '@/lib/intents/types'
import { useSession } from '@/lib/session'

const GROUP_LABELS: Record<Exclude<IntentGroup, 'system' | 'fallback'>, string> = {
  analysis: 'Phân tích',
  approval: 'Phê duyệt',
  advisory: 'Tư vấn',
  support: 'Hỗ trợ',
}

const GROUP_ORDER = ['analysis', 'approval', 'advisory', 'support'] as const

type Props = {
  onSelect: (id: IntentId) => void
}

export function Drawer({ onSelect }: Props) {
  const open = useSession((s) => s.drawerOpen)
  const toggleDrawer = useSession((s) => s.toggleDrawer)
  const resetSession = useSession((s) => s.resetSession)

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleDrawer(false)}
        >
          <motion.div
            className="max-h-[80dvh] overflow-y-auto rounded-t-3xl bg-sapphire p-5"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-medium text-white">Tất cả lệnh</h2>
              <button type="button" onClick={() => toggleDrawer(false)} aria-label="Đóng">
                <X className="size-5 text-white/60" />
              </button>
            </div>

            {GROUP_ORDER.map((group) => {
              const ids = BUSINESS_INTENT_IDS.filter((id) => getIntent(id).group === group)
              if (ids.length === 0) return null

              return (
                <section key={group} className="mb-5">
                  <h3 className="mb-2 text-xs uppercase tracking-wider text-msb-gold/70">
                    {GROUP_LABELS[group]}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ids.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => onSelect(id)}
                        className="rounded-xl border border-white/10 bg-card px-3 py-2 text-sm text-white/85"
                      >
                        {getIntent(id).label}
                      </button>
                    ))}
                  </div>
                </section>
              )
            })}

            <button
              type="button"
              onClick={resetSession}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-msb-orange/40 py-3 text-sm text-msb-orange"
            >
              <RotateCcw className="size-4" />
              Bắt đầu phiên mới
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
```

- [ ] **Step 4: Kiểm tra biên dịch**

Run: `bunx tsc --noEmit`
Expected: không lỗi. Nếu `GROUP_LABELS` báo lỗi kiểu, kiểm tra `IntentGroup` ở `types.ts` có đúng 6 giá trị không.

- [ ] **Step 5: Commit**

```bash
git add src/components/voice
git commit -m "feat: Orb, ChipBar ngữ cảnh và Command Drawer"
```

---

### Task 12: Nối end-to-end với widget dòng tiền

Task cuối Phase 1. Kết thúc task này, demo chạy được trên điện thoại thật.

**Files:**
- Create: `src/components/widgets/CashFlowWidget.tsx`
- Create: `src/components/widgets/WidgetHost.tsx`
- Create: `src/lib/useVoiceTurn.ts`
- Create: `src/components/Dashboard.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: tất cả các task trước
- Produces:
  - `useVoiceTurn()` → `{ runIntent, startListening }`
  - `<WidgetHost />` — render widget theo `activeIntent`
  - `<Dashboard />`

- [ ] **Step 1: Viết `src/lib/useVoiceTurn.ts`**

Đây là nơi ngân sách độ trễ được đo.

```ts
'use client'

import { useCallback } from 'react'
import { speak, stopSpeaking } from './audio/player'
import { getIntent } from './intents/registry'
import { resolveIntent } from './intents/resolve'
import type { IntentId } from './intents/types'
import { useSession } from './session'

export function useVoiceTurn() {
  const store = useSession

  const runIntent = useCallback(
    async (id: IntentId, startedAt?: number) => {
      const { runIntent: markIntent, setSpeaking, recordLatency } = store.getState()
      markIntent(id)
      setSpeaking(true)

      let line = getIntent(id).fallbackLine
      try {
        const response = await fetch('/api/reply', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ intentId: id }),
        })
        const data = (await response.json()) as { reply: string }
        if (data.reply) line = data.reply
      } catch (error) {
        console.error('[turn] sinh lời thoại thất bại, dùng câu mẫu:', error)
      }

      await speak(line, () => {
        if (startedAt !== undefined) {
          const ms = Math.round(performance.now() - startedAt)
          recordLatency(ms)
          console.info(`[latency] time-to-first-audio: ${ms}ms`)
        }
      })

      store.getState().setSpeaking(false)
    },
    [store],
  )

  const startListening = useCallback(async () => {
    const { isSpeaking, setListening } = store.getState()

    // Barge-in: đang nói mà chạm orb thì ngắt, không mở mic
    if (isSpeaking) {
      stopSpeaking()
      store.getState().setSpeaking(false)
      return
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (error) {
      console.error('[turn] không có micro, dùng chip bar:', error)
      return
    }

    const recorder = new MediaRecorder(stream)
    const chunks: Blob[] = []
    recorder.ondataavailable = (event) => chunks.push(event.data)

    recorder.onstop = async () => {
      stream.getTracks().forEach((track) => track.stop())
      setListening(false)

      const startedAt = performance.now()
      const form = new FormData()
      form.append('audio', new Blob(chunks, { type: 'audio/webm' }), 'speech.webm')

      let text = ''
      try {
        const response = await fetch('/api/stt', { method: 'POST', body: form })
        const data = (await response.json()) as { text: string }
        text = data.text
      } catch (error) {
        console.error('[turn] STT thất bại:', error)
      }

      if (!text) return
      const intentId = await resolveIntent(text)
      await runIntent(intentId, startedAt)
    }

    setListening(true)
    recorder.start()
    setTimeout(() => recorder.state === 'recording' && recorder.stop(), 5_000)
  }, [store, runIntent])

  return { runIntent, startListening }
}
```

- [ ] **Step 2: Viết `src/components/widgets/CashFlowWidget.tsx`**

```tsx
'use client'

import { motion } from 'framer-motion'
import { fixtures } from '@/lib/data/fixtures'
import { formatTy } from '@/lib/data/format'

export function CashFlowWidget() {
  const { daily, inflow, outflow, net } = fixtures.cashFlow
  const peak = Math.max(...daily.map((d) => Math.max(d.inflow, d.outflow)))

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-card p-4"
    >
      <h2 className="text-sm text-white/60">Dòng tiền 7 ngày</h2>

      <p className="mt-1 text-2xl font-semibold text-signal">
        +{formatTy(net)} VNĐ
      </p>

      <div className="mt-4 flex h-28 items-end gap-2">
        {daily.map((day) => (
          <div key={day.label} className="flex flex-1 flex-col items-center gap-1">
            <div className="flex h-24 w-full items-end justify-center gap-0.5">
              <div
                className="w-2 rounded-t bg-signal"
                style={{ height: `${(day.inflow / peak) * 100}%` }}
              />
              <div
                className="w-2 rounded-t bg-msb-orange"
                style={{ height: `${(day.outflow / peak) * 100}%` }}
              />
            </div>
            <span className="text-[10px] text-white/40">{day.label}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-between border-t border-white/10 pt-3 text-sm">
        <span className="text-white/60">
          Thu <span className="text-signal">{formatTy(inflow)}</span>
        </span>
        <span className="text-white/60">
          Chi <span className="text-msb-orange">{formatTy(outflow)}</span>
        </span>
      </div>
    </motion.section>
  )
}
```

- [ ] **Step 3: Viết `src/components/widgets/WidgetHost.tsx`**

Phase 2 sẽ bổ sung 13 widget còn lại vào bảng này.

```tsx
'use client'

import type { ComponentType } from 'react'
import type { IntentId } from '@/lib/intents/types'
import { useSession } from '@/lib/session'
import { CashFlowWidget } from './CashFlowWidget'

const WIDGETS: Partial<Record<IntentId, ComponentType>> = {
  CASH_FLOW: CashFlowWidget,
}

export function WidgetHost() {
  const activeIntent = useSession((s) => s.activeIntent)
  if (!activeIntent) return null

  const Widget = WIDGETS[activeIntent]
  if (!Widget) {
    return (
      <p className="rounded-2xl border border-white/10 bg-card p-4 text-sm text-white/50">
        Widget cho kịch bản này sẽ được dựng ở Phase 2.
      </p>
    )
  }

  return <Widget />
}
```

- [ ] **Step 4: Viết `src/components/Dashboard.tsx`**

```tsx
'use client'

import { useEffect, useRef } from 'react'
import { useVoiceTurn } from '@/lib/useVoiceTurn'
import { useSession } from '@/lib/session'
import { ChipBar } from './voice/ChipBar'
import { Drawer } from './voice/Drawer'
import { Orb } from './voice/Orb'
import { WidgetHost } from './widgets/WidgetHost'

export function Dashboard() {
  const { runIntent, startListening } = useVoiceTurn()
  const lastLatencyMs = useSession((s) => s.lastLatencyMs)
  const greeted = useRef(false)

  useEffect(() => {
    if (greeted.current) return
    greeted.current = true
    void runIntent('GREETING')
  }, [runIntent])

  return (
    <main className="flex min-h-dvh flex-col bg-obsidian">
      <header className="px-4 pt-6">
        <h1 className="text-lg font-semibold text-white">
          MSB <span className="text-msb-orange">M-Bank</span> Corporate
        </h1>
        <p className="text-xs text-white/40">Xin chào Mr Z</p>
      </header>

      <div className="flex-1 space-y-4 px-4 py-6">
        <WidgetHost />
      </div>

      <div className="flex justify-center pb-4">
        <Orb onPress={startListening} />
      </div>

      <ChipBar onSelect={(id) => void runIntent(id)} />
      <Drawer onSelect={(id) => void runIntent(id)} />

      {lastLatencyMs !== null && (
        <p className="pb-2 text-center text-[10px] text-white/25">
          {lastLatencyMs}ms
        </p>
      )}
    </main>
  )
}
```

Chỉ số độ trễ hiển thị rất mờ ở chân màn hình để presenter tự kiểm tra mà khán giả không chú ý. Nếu thấy vướng khi trình diễn, bỏ khối này đi — số liệu vẫn nằm trong console.

- [ ] **Step 5: Nối vào `src/app/page.tsx`**

```tsx
'use client'

import { Dashboard } from '@/components/Dashboard'
import { LockScreen } from '@/components/fido/LockScreen'
import { useSession } from '@/lib/session'

export default function Home() {
  const phase = useSession((s) => s.phase)
  return phase === 'locked' ? <LockScreen /> : <Dashboard />
}
```

- [ ] **Step 6: Chạy toàn bộ test và kiểm tra kiểu**

Run: `bun test && bunx tsc --noEmit`
Expected: PASS, không lỗi kiểu.

- [ ] **Step 7: Nghiệm thu end-to-end trên máy tính**

Run: `bun dev`

1. Chạm nút vân tay → vào Dashboard, **nghe được lời chào**. Không nghe thấy nghĩa là `unlockAudio()` không nằm trong user gesture — quay lại Task 10 Step 2.
2. Chạm chip "Dòng tiền 7 ngày" → nghe lời thoại và thấy biểu đồ.
3. Chạm chip lần nữa → lời thoại phải **khác câu chữ lần đầu**.
4. Mở console, xác nhận có dòng `[latency] time-to-first-audio: ...ms`.
5. Chạm Orb khi RM đang nói → audio ngắt ngay (barge-in).
6. Mở "Tất cả" → thấy 14 lệnh chia 4 nhóm; chạm "Bắt đầu phiên mới" → chip về trạng thái đầu, widget biến mất.

- [ ] **Step 8: Nghiệm thu trên điện thoại thật**

```bash
bunx cloudflared tunnel --url http://localhost:3000
```

Trên iPhone qua Safari:
1. Chạm vân tay → **phải nghe được lời chào**. Đây là bài kiểm tra autoplay iOS, rủi ro nghiêm trọng nhất của dự án.
2. Chạm Orb, nói *"Báo cáo dòng tiền gần đây của công ty"*, chờ 5 giây → nghe phản hồi và thấy widget.
3. Ghi lại con số độ trễ ở chân màn hình. Nếu vượt 1.500ms, ghi lại và xử lý ở Phase 2 — chưa tối ưu vội.

- [ ] **Step 9: Commit**

```bash
git add src/lib/useVoiceTurn.ts src/components src/app/page.tsx
git commit -m "feat: nối pipeline thoại end-to-end với widget dòng tiền"
```

---

## Hoàn thành Phase 1

Sau Task 12, hệ thống đã có:

- Toàn bộ số liệu trong một nguồn duy nhất, có test đối chiếu từng phép tính
- 17 intent với keyword tiếng Việt đạt độ phủ ≥ 90% trên bộ 50 câu thử
- Numeric guard chặn LLM bịa số
- Pipeline thoại hoàn chỉnh: mic → STT → intent → sinh thoại → TTS streaming → phát
- Cache audio phía client, mở khóa autoplay iOS, barge-in
- FIDO dò khả năng với đường lui sang mô phỏng
- Chip ngữ cảnh, ngăn kéo 14 lệnh, reset phiên
- Một widget chạy thật đầu cuối

**Phase 2** dựng 13 widget còn lại, Service Worker cho PWA, MP3 dự phòng, và chạy trọn bộ tiêu chí nghiệm thu §7.

Trước khi sang Phase 2, ghi lại hai con số vào phần ghi chú của plan Phase 2:
- Time-to-first-audio đo được trên điện thoại thật
- Độ phủ keyword thực tế của bộ 50 câu thử
