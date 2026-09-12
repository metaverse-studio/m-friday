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
