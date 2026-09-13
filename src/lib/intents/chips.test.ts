import { describe, expect, test } from 'bun:test'
import { nextChipsFor } from './chips'
import { BUSINESS_INTENT_IDS } from './registry'
import type { IntentId } from './types'

describe('nextChipsFor', () => {
  test('luôn trả đúng ba chip', () => {
    for (const id of BUSINESS_INTENT_IDS) {
      expect(nextChipsFor(id, [id])).toHaveLength(3)
    }
  })

  test('không bao giờ gợi ý UNKNOWN', () => {
    for (const id of BUSINESS_INTENT_IDS) {
      expect(nextChipsFor(id, [id])).not.toContain('UNKNOWN')
    }
  })

  /** Đây là lỗi của bảng nextChips cứng: xem rồi vẫn được mời xem lại */
  test('không gợi ý nội dung đã xem khi còn lựa chọn khác', () => {
    const history: IntentId[] = ['CASH_FLOW', 'TXN_HISTORY']
    const chips = nextChipsFor('TXN_HISTORY', history)
    expect(chips).not.toContain('CASH_FLOW')
    expect(chips).not.toContain('TXN_HISTORY')
  })

  test('xem cảnh báo gian lận xong thì mời xử lý nó', () => {
    const chips = nextChipsFor('FRAUD_ALERT', ['FRAUD_ALERT'])
    expect(chips[0]).toBe('REJECT_ORDER')
  })

  test('xem hạn mức xong thì mời ký duyệt bảo lãnh đang chờ', () => {
    const chips = nextChipsFor('TRADE_FINANCE', ['TRADE_FINANCE'])
    expect(chips).toContain('APPROVE_FIDO')
  })

  test('việc đã làm rồi thì không mời lại', () => {
    const history: IntentId[] = ['FRAUD_ALERT', 'REJECT_ORDER']
    expect(nextChipsFor('REJECT_ORDER', history)).not.toContain('REJECT_ORDER')
  })

  test('phiên dài thì mời chốt phiên ở chip cuối', () => {
    const history: IntentId[] = [
      'CASH_FLOW',
      'TXN_HISTORY',
      'LOAN_BALANCE',
      'RECENT_ACTIONS',
      'TRADE_FINANCE',
    ]
    expect(nextChipsFor('TRADE_FINANCE', history)[2]).toBe('SESSION_SUMMARY')
  })

  test('xem hết mọi nội dung vẫn trả đủ ba chip', () => {
    const chips = nextChipsFor('CASH_FLOW', [...BUSINESS_INTENT_IDS])
    expect(chips).toHaveLength(3)
  })

  test('chỉ trả về intent có thật', () => {
    const chips = nextChipsFor('CASH_FLOW', ['CASH_FLOW'])
    for (const id of chips) {
      expect(BUSINESS_INTENT_IDS).toContain(id)
    }
  })
})
