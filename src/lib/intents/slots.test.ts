import { describe, expect, test } from 'bun:test'
import { fixtures } from '../data/fixtures'
import { normalizeVi } from './resolve'
import {
  AMOUNT_USD_SLOT,
  MONTH_SLOT,
  PRINCIPAL_SLOT,
  TERM_DAYS_SLOT,
  missingRequiredSlot,
  parseSlots,
  withFallbacks,
} from './slots'

const n = normalizeVi

describe('Slot số USD', () => {
  test('đọc được "200 nghìn USD"', () => {
    expect(AMOUNT_USD_SLOT.parse(n('khóa tỷ giá 200 nghìn USD'))).toBe(200_000)
  })

  test('đọc được dạng viết số đầy đủ "500.000 USD"', () => {
    expect(AMOUNT_USD_SLOT.parse(n('khóa 500.000 USD cho lô hàng'))).toBe(500_000)
  })

  test('đọc được lượt tinh chỉnh không nhắc đơn vị tiền', () => {
    expect(AMOUNT_USD_SLOT.parse(n('100 nghìn thôi'))).toBe(100_000)
  })

  test('trả null khi câu không nhắc tới số tiền', () => {
    expect(AMOUNT_USD_SLOT.parse(n('khóa tỷ giá cho lô Siemens'))).toBeNull()
  })

  test('là slot bắt buộc, vì nó ký một lệnh có thật', () => {
    expect(AMOUNT_USD_SLOT.required).toBe(true)
  })
})

describe('Slot tiền gốc CCTG', () => {
  test('đọc được "20 tỷ"', () => {
    expect(PRINCIPAL_SLOT.parse(n('trích 20 tỷ mua chứng chỉ tiền gửi'))).toBe(
      20_000_000_000,
    )
  })

  test('đọc được số lẻ "12,5 tỷ"', () => {
    expect(PRINCIPAL_SLOT.parse(n('trích 12,5 tỷ thôi'))).toBe(12_500_000_000)
  })

  test('trả null khi không nhắc số tiền', () => {
    expect(PRINCIPAL_SLOT.parse(n('tiền nhàn rỗi nên làm gì'))).toBeNull()
  })
})

describe('Slot kỳ hạn', () => {
  test('đọc được "90 ngày"', () => {
    expect(TERM_DAYS_SLOT.parse(n('kỳ hạn 90 ngày'))).toBe(90)
  })

  test('quy "kỳ hạn 3 tháng" ra 90 ngày', () => {
    expect(TERM_DAYS_SLOT.parse(n('cho em kỳ hạn 3 tháng'))).toBe(90)
  })

  /** "Tháng 8" là tên tháng của PERIOD_COMPARE, không phải kỳ hạn tám tháng */
  test('không nhầm tên tháng thành kỳ hạn', () => {
    expect(TERM_DAYS_SLOT.parse(n('so sánh tháng 8'))).toBeNull()
  })
})

describe('Slot tháng so sánh', () => {
  test('đọc được "tháng 7"', () => {
    expect(MONTH_SLOT.parse(n('so sánh tháng 7 với cùng kỳ'))).toBe('Tháng 7')
  })

  test('bỏ qua tháng không có trong bảng dữ liệu', () => {
    expect(MONTH_SLOT.parse(n('so sánh tháng 2'))).toBeNull()
  })
})

describe('parseSlots và withFallbacks', () => {
  test('đọc nhiều slot từ một câu', () => {
    const slots = parseSlots(
      [PRINCIPAL_SLOT, TERM_DAYS_SLOT],
      n('trích 10 tỷ kỳ hạn 30 ngày'),
    )
    expect(slots).toEqual({ principal: 10_000_000_000, termDays: 30 })
  })

  test('điền mặc định cho slot khách không nhắc tới', () => {
    const filled = withFallbacks([PRINCIPAL_SLOT, TERM_DAYS_SLOT], { termDays: 30 })
    expect(filled.principal).toBe(fixtures.cctg.principal)
    expect(filled.termDays).toBe(30)
  })
})

describe('missingRequiredSlot', () => {
  test('chỉ ra slot bắt buộc còn trống', () => {
    expect(missingRequiredSlot([AMOUNT_USD_SLOT], {})?.id).toBe('amountUsd')
  })

  test('không đòi gì khi slot bắt buộc đã có giá trị', () => {
    expect(missingRequiredSlot([AMOUNT_USD_SLOT], { amountUsd: 100_000 })).toBeNull()
  })

  test('không đòi slot không bắt buộc', () => {
    expect(missingRequiredSlot([PRINCIPAL_SLOT, TERM_DAYS_SLOT], {})).toBeNull()
  })

  test('intent không có slot thì không bao giờ bị chặn', () => {
    expect(missingRequiredSlot(undefined, {})).toBeNull()
  })
})
