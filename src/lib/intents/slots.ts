import { PERIOD_MONTHS, fixtures, isPeriodMonth } from '../data/fixtures'
import type { SlotSpec, SlotValue, SlotValues } from './types'

const TY = 1_000_000_000
const NGHIN = 1_000

/**
 * Số trong câu nói tiếng Việt, đã bỏ dấu. STT trả về đủ kiểu viết:
 * "250.000", "250 nghin", "hai tram nam muoi nghin". Ta chỉ nhận hai dạng
 * đầu — dạng chữ thuần để tầng 3 lo, vì viết bảng số đếm tiếng Việt cho
 * một demo là chi phí không đáng.
 */
const SO = /(\d+(?:[.,]\d+)*)/

function toNumber(raw: string): number {
  // "250.000" là hai trăm năm mươi nghìn, "250,5" là hai trăm năm mươi phẩy năm
  const normalized = raw.includes(',')
    ? raw.replace(/\./g, '').replace(',', '.')
    : raw.replace(/\.(?=\d{3}\b)/g, '')
  return Number(normalized)
}

/** Bắt cụm "<số> <đơn vị>" với các cách viết đơn vị thường gặp từ STT */
function matchWithUnit(text: string, units: string[]): number | null {
  for (const unit of units) {
    const pattern = new RegExp(`${SO.source}\\s*${unit}`, 'i')
    const found = text.match(pattern)
    if (found?.[1]) {
      const value = toNumber(found[1])
      if (Number.isFinite(value)) return value
    }
  }
  return null
}

/**
 * Số USD muốn khóa tỷ giá. Bắt cả "200 nghin usd" lẫn "200.000 usd" —
 * cùng một ý, khác cách STT phiên ra chữ.
 */
function parseAmountUsd(text: string): SlotValue | null {
  const inThousands = matchWithUnit(text, ['nghin usd', 'nghin do', 'k usd'])
  if (inThousands !== null) return inThousands * NGHIN

  const plain = matchWithUnit(text, ['usd', 'do la', 'dola'])
  if (plain !== null) return plain

  // "khoa 200 nghin thoi" — lượt tinh chỉnh, khách không nhắc lại đơn vị tiền
  const bare = matchWithUnit(text, ['nghin'])
  if (bare !== null) return bare * NGHIN

  return null
}

/** Số tiền trích mua chứng chỉ tiền gửi, đơn vị tỷ trong câu nói */
function parsePrincipal(text: string): SlotValue | null {
  const inTy = matchWithUnit(text, ['ty'])
  if (inTy !== null) return Math.round(inTy * TY)
  return null
}

/** Kỳ hạn tính bằng ngày; "3 thang" quy ra 90 ngày cho đúng cách nói */
function parseTermDays(text: string): SlotValue | null {
  const inDays = matchWithUnit(text, ['ngay'])
  if (inDays !== null) return inDays

  const inMonths = matchWithUnit(text, ['thang'])
  // "thang 8" là tên tháng của PERIOD_COMPARE, không phải kỳ hạn
  if (inMonths !== null && /ky han\s*\d+\s*thang/.test(text)) {
    return inMonths * 30
  }
  return null
}

/** Tên tháng cho bảng so sánh kỳ: "thang 7", "so sanh thang 6" */
function parseMonth(text: string): SlotValue | null {
  const found = text.match(/thang\s*(\d{1,2})/)
  if (!found?.[1]) return null
  const candidate = `Tháng ${Number(found[1])}`
  return isPeriodMonth(candidate) ? candidate : null
}

export const AMOUNT_USD_SLOT: SlotSpec = {
  id: 'amountUsd',
  question:
    'Dạ anh muốn khóa tỷ giá cho bao nhiêu đô la Mỹ ạ? Anh nói số tiền hoặc chọn nhanh bên dưới giúp em.',
  options: [
    { value: 100_000, label: '100 nghìn USD' },
    { value: fixtures.tradeFinance.pendingLc.amountUsd, label: '250 nghìn USD' },
    { value: 500_000, label: '500 nghìn USD' },
  ],
  fallback: fixtures.tradeFinance.pendingLc.amountUsd,
  // Lệnh kỳ hạn là một cam kết có thật; đoán hộ số tiền là sai bản chất
  required: true,
  parse: parseAmountUsd,
}

export const PRINCIPAL_SLOT: SlotSpec = {
  id: 'principal',
  question: 'Dạ anh muốn trích bao nhiêu tỷ để mua chứng chỉ tiền gửi ạ?',
  options: [
    { value: 10 * TY, label: '10 tỷ' },
    { value: fixtures.cctg.principal, label: '15 tỷ' },
    { value: 20 * TY, label: '20 tỷ' },
  ],
  fallback: fixtures.cctg.principal,
  parse: parsePrincipal,
}

export const TERM_DAYS_SLOT: SlotSpec = {
  id: 'termDays',
  question: 'Dạ anh muốn kỳ hạn bao nhiêu ngày ạ?',
  options: [
    { value: fixtures.cctg.termDays, label: '15 ngày' },
    { value: 30, label: '30 ngày' },
    { value: 90, label: '90 ngày' },
  ],
  fallback: fixtures.cctg.termDays,
  parse: parseTermDays,
}

export const MONTH_SLOT: SlotSpec = {
  id: 'month',
  question: 'Dạ anh muốn so sánh tháng nào ạ?',
  options: PERIOD_MONTHS.map((month) => ({ value: month, label: month })),
  fallback: fixtures.periodCompare.defaultMonth,
  parse: parseMonth,
}

/** Đọc mọi slot của intent ra khỏi một câu nói đã chuẩn hoá */
export function parseSlots(specs: SlotSpec[], normalized: string): SlotValues {
  const out: SlotValues = {}
  for (const spec of specs) {
    const value = spec.parse(normalized)
    if (value !== null) out[spec.id] = value
  }
  return out
}

/** Điền nốt các slot khách không nhắc tới bằng giá trị mặc định */
export function withFallbacks(specs: SlotSpec[], slots: SlotValues): SlotValues {
  const out: SlotValues = { ...slots }
  for (const spec of specs) {
    if (out[spec.id] === undefined) out[spec.id] = spec.fallback
  }
  return out
}

/** Slot `required` đầu tiên còn trống, hoặc null nếu đã đủ để chạy */
export function missingRequiredSlot(
  specs: SlotSpec[] | undefined,
  slots: SlotValues,
): SlotSpec | null {
  if (!specs) return null
  return specs.find((spec) => spec.required && slots[spec.id] === undefined) ?? null
}

export function numberSlot(slots: SlotValues, id: SlotSpec['id']): number | undefined {
  const value = slots[id]
  return typeof value === 'number' ? value : undefined
}
