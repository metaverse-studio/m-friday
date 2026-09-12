import { fixtures, type FixtureKey } from '../data/fixtures'
import { formatTrieuRaw, formatTyRaw, formatTyRawFixed1 } from '../data/format'
import { extractNumberTokens } from './numbers'

const TY = 1_000_000_000
const TRIEU = 1_000_000

function viDecimal(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return String(rounded).replace('.', ',')
}

/**
 * Mọi cách đọc hợp lệ của một con số trong fixture. Friday nhận fixture
 * dưới dạng JSON thô (65000000000) nên phải tự quy đổi sang "65 tỷ";
 * danh sách này chính là bản nháp quy đổi mà numeric guard chấp nhận.
 */
function renderNumber(value: number): string[] {
  if (!Number.isFinite(value) || value === 0) return []
  const forms: string[] = []

  if (value > 0 && value < 1) {
    // Tỷ lệ lưu dạng thập phân: 0.054 đọc là "5,4" phần trăm
    forms.push(viDecimal(value * 100))
    return forms
  }

  if (value >= TY) {
    forms.push(formatTyRaw(value), formatTyRawFixed1(value))
  } else if (value >= TRIEU) {
    forms.push(formatTrieuRaw(value))
  } else if (value >= 1000) {
    forms.push(value.toLocaleString('vi-VN'), String(value))
    if (value % 1000 === 0) forms.push(viDecimal(value / 1000))
  } else {
    forms.push(viDecimal(value))
    // Đếm lệnh hiển thị hai chữ số: 2 lệnh đọc và viết là "02"
    if (Number.isInteger(value) && value < 10) forms.push(`0${value}`)
  }

  return forms
}

function walk(node: unknown, out: Set<string>): void {
  if (typeof node === 'number') {
    for (const form of renderNumber(node)) out.add(form)
    return
  }
  if (typeof node === 'string') {
    for (const token of extractNumberTokens(node)) out.add(token)
    return
  }
  if (node && typeof node === 'object') {
    for (const value of Object.values(node)) walk(value, out)
  }
}

/**
 * Danh sách số hợp lệ của một intent = mọi con số nằm trong lát fixture mà
 * intent đó được nhìn thấy, cộng thêm các số dẫn xuất phải tính mới ra.
 *
 * Chép tay danh sách này là nguồn sai lệch: sửa fixture mà quên sửa danh sách
 * thì numeric guard chặn sạch câu trả lời của Friday. Ở đây chỉ còn `extras`
 * phải khai báo tay — và mỗi extra đều là số KHÔNG có trong fixture thô.
 */
export function allowedFor(key: FixtureKey | null, extras: string[] = []): string[] {
  const out = new Set<string>(extras)
  if (key) walk(fixtures[key], out)
  return [...out]
}
