import { describe, expect, test } from 'bun:test'
import { allowedFor } from './allowed'
import { findViolations } from './guard'
import { INTENTS } from './registry'
import type { IntentId } from './types'

const ALL_IDS = Object.keys(INTENTS) as IntentId[]

describe('allowedFor sinh số từ fixture', () => {
  test('quy đổi tỷ, triệu, nghìn và phần trăm theo đúng cách đọc', () => {
    const cashFlow = allowedFor('cashFlow')
    expect(cashFlow).toContain('65') // 65.000.000.000 -> 65 tỷ
    expect(cashFlow).toContain('65,0')
    expect(cashFlow).toContain('46,8')
    expect(cashFlow).toContain('18,2')
    expect(cashFlow).toContain('7') // days

    expect(allowedFor('fraud')).toContain('850') // 850.000.000 -> 850 triệu
    expect(allowedFor('cctg')).toContain('5,4') // 0.054 -> 5,4%
    expect(allowedFor('fx')).toContain('26.180') // nhóm nghìn kiểu Việt
    expect(allowedFor('tradeFinance')).toContain('250.000')
  })

  test('bóc số nằm trong chuỗi: ngày, giờ, số điện thoại', () => {
    expect(allowedFor('obligations')).toContain('20/09')
    expect(allowedFor('fraud')).toContain('23:47')
    expect(allowedFor('contacts')).toContain('0988.123.456')
    expect(allowedFor('periodCompare')).toContain('8') // "Tháng 8"
  })

  test('số đếm dưới 10 cho phép cả dạng hai chữ số', () => {
    const session = allowedFor('session')
    expect(session).toContain('2')
    expect(session).toContain('02')
  })

  test('lát fixture không có số thì danh sách rỗng', () => {
    expect(allowedFor('company')).toEqual([])
    expect(allowedFor(null)).toEqual([])
  })

  test('extras được giữ nguyên văn', () => {
    expect(allowedFor('cctg', ['33,3'])).toContain('33,3')
  })
})

describe('Bất biến: mọi câu mẫu phải lọt qua numeric guard', () => {
  /**
   * Đây là lưới an toàn thay cho việc chép tay allowedNumbers. Sửa fixture
   * hoặc sửa fallbackLine mà quên khai báo số dẫn xuất thì test này đỏ,
   * thay vì để numeric guard chặn Friday ngay trên sân khấu.
   */
  for (const id of ALL_IDS) {
    test(`${id}: fallbackLine không chứa số lạ`, () => {
      const intent = INTENTS[id]
      expect(findViolations(intent.fallbackLine, intent.allowedNumbers)).toEqual([])
    })
  }

  test('intent có lát fixture chứa số thì không được có danh sách rỗng', () => {
    const withNumbers = ALL_IDS.filter(
      (id) => INTENTS[id].fixtureKey && allowedFor(INTENTS[id].fixtureKey).length > 0,
    )
    for (const id of withNumbers) {
      expect(INTENTS[id].allowedNumbers.length).toBeGreaterThan(0)
    }
  })
})
