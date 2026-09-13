import { fixtures, isPeriodMonth, type PeriodMonth } from './fixtures'

const DAYS_PER_YEAR = 365

/**
 * Mọi hàm dưới đây nhận tham số tuỳ chọn để tính theo giá trị slot mà khách
 * vừa nói, và rơi về fixtures khi không có slot. Nhờ vậy các chỗ gọi cũ —
 * widget, fallbackLine trong registry — không phải sửa gì.
 */

/** Lợi tức CCTG: gốc × lãi suất năm × (số ngày / 365) */
export function cctgYield(principal?: number, termDays?: number): number {
  const { annualRate } = fixtures.cctg
  const p = principal ?? fixtures.cctg.principal
  const days = termDays ?? fixtures.cctg.termDays
  return (p * annualRate * days) / DAYS_PER_YEAR
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
export function fxForwardCost(amountUsd?: number): number {
  const { spotSellRate, forwardRate } = fixtures.fx
  const amount = amountUsd ?? fixtures.tradeFinance.pendingLc.amountUsd
  return amount * (forwardRate - spotSellRate)
}

/** Rủi ro nếu thả nổi: giá trị hợp đồng × mức tăng dự kiến */
export function fxFloatRisk(amountUsd?: number): number {
  const { spotSellRate, twoWeekChangePercent } = fixtures.fx
  const amount = amountUsd ?? fixtures.tradeFinance.pendingLc.amountUsd
  return amount * spotSellRate * (twoWeekChangePercent / 100)
}

/** Tiết kiệm ròng khi khóa tỷ giá */
export function fxSaving(amountUsd?: number): number {
  return fxFloatRisk(amountUsd) - fxForwardCost(amountUsd)
}

/** Số liệu một tháng trong bảng so sánh kỳ, rơi về tháng mặc định nếu lạ */
export function periodData(month?: string) {
  const key: PeriodMonth = isPeriodMonth(month)
    ? month
    : (fixtures.periodCompare.defaultMonth as PeriodMonth)
  return fixtures.periodCompare.byMonth[key]
}

/** Biên dòng tiền của một kỳ: (thu − chi) / thu, đơn vị phần trăm */
export function cashMargin(period: 'this' | 'last', month?: string): number {
  const { inflowThis, inflowLast, outflowThis, outflowLast } = periodData(month)
  const inflow = period === 'this' ? inflowThis : inflowLast
  const outflow = period === 'this' ? outflowThis : outflowLast
  return ((inflow - outflow) / inflow) * 100
}

/** Tăng trưởng dòng thu so với cùng kỳ, đơn vị phần trăm */
export function periodGrowthInflow(month?: string): number {
  const { inflowThis, inflowLast } = periodData(month)
  return ((inflowThis - inflowLast) / inflowLast) * 100
}
