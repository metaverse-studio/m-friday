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
