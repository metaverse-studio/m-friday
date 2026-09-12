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
