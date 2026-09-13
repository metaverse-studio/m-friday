import { describe, expect, test } from 'bun:test'
import { cctgYield, fxForwardCost, fxSaving, periodGrowthInflow } from '../data/calc'
import { PERIOD_MONTHS } from '../data/fixtures'
import { formatPercent, formatTrieuRaw, formatTy, formatTyRaw } from '../data/format'
import { findViolations } from './guard'
import { allowedNumbersFor, fallbackLineFor } from './registry'
import { AMOUNT_USD_SLOT, PRINCIPAL_SLOT, TERM_DAYS_SLOT } from './slots'

/**
 * Khách đổi tham số thì mọi con số tính lại đều nằm ngoài `allowedNumbers`
 * tĩnh. Không có `derivedNumbers`, guard sẽ chặn sạch câu trả lời của Friday
 * mỗi lần slot khác mặc định — tức là tính năng slot tự vô hiệu hoá chính nó.
 */
describe('Guard nở ra theo slot', () => {
  test('mọi lựa chọn số USD đều lọt guard', () => {
    for (const option of AMOUNT_USD_SLOT.options) {
      const amountUsd = option.value as number
      const allowed = allowedNumbersFor('FX_FORWARD', { amountUsd })
      const line = `Khóa ${formatTrieuRaw(
        fxForwardCost(amountUsd),
      )} triệu chi phí, tiết kiệm ${formatTrieuRaw(fxSaving(amountUsd))} triệu ạ.`
      expect(findViolations(line, allowed)).toEqual([])
    }
  })

  test('mọi tổ hợp gốc và kỳ hạn CCTG đều lọt guard', () => {
    for (const p of PRINCIPAL_SLOT.options) {
      for (const t of TERM_DAYS_SLOT.options) {
        const slots = { principal: p.value as number, termDays: t.value as number }
        const line = `Trích ${formatTyRaw(
          slots.principal,
        )} tỷ kỳ hạn ${slots.termDays} ngày, lợi tức ${formatTrieuRaw(
          cctgYield(slots.principal, slots.termDays),
        )} triệu ạ.`
        expect(findViolations(line, allowedNumbersFor('SUGGEST_CCTG', slots))).toEqual([])
      }
    }
  })

  test('mọi tháng so sánh đều lọt guard', () => {
    for (const month of PERIOD_MONTHS) {
      const line = `Tăng ${formatPercent(periodGrowthInflow(month))} so với cùng kỳ ạ.`
      expect(findViolations(line, allowedNumbersFor('PERIOD_COMPARE', { month }))).toEqual([])
    }
  })

  test('intent không có slot giữ nguyên danh sách tĩnh', () => {
    expect(allowedNumbersFor('CASH_FLOW')).toEqual(allowedNumbersFor('CASH_FLOW', {}))
  })
})

describe('Câu mẫu tính lại theo slot', () => {
  test('câu CCTG bám đúng số tiền và kỳ hạn khách chọn', () => {
    const slots = { principal: 20_000_000_000, termDays: 90 }
    const line = fallbackLineFor('SUGGEST_CCTG', slots)
    expect(line).toContain(formatTy(slots.principal))
    expect(line).toContain('90 ngày')
  })

  test('câu so sánh kỳ bám đúng tháng khách hỏi', () => {
    const line = fallbackLineFor('PERIOD_COMPARE', { month: 'Tháng 6' })
    expect(line).toContain('Tháng 6')
    expect(line).toContain(formatPercent(periodGrowthInflow('Tháng 6')))
  })

  /** Không có slot thì câu phải y hệt bản mặc định đang dùng hôm nay */
  test('không truyền slot thì trả về đúng câu mặc định', () => {
    for (const id of ['SUGGEST_CCTG', 'PERIOD_COMPARE', 'CASH_FLOW'] as const) {
      expect(fallbackLineFor(id)).toBe(fallbackLineFor(id, {}))
    }
  })

  test('mọi câu mẫu theo slot đều tự lọt guard của chính nó', () => {
    for (const month of PERIOD_MONTHS) {
      const slots = { month }
      const violations = findViolations(
        fallbackLineFor('PERIOD_COMPARE', slots),
        allowedNumbersFor('PERIOD_COMPARE', slots),
      )
      expect(violations).toEqual([])
    }

    for (const p of PRINCIPAL_SLOT.options) {
      for (const t of TERM_DAYS_SLOT.options) {
        const slots = { principal: p.value as number, termDays: t.value as number }
        const violations = findViolations(
          fallbackLineFor('SUGGEST_CCTG', slots),
          allowedNumbersFor('SUGGEST_CCTG', slots),
        )
        expect(violations).toEqual([])
      }
    }
  })
})
