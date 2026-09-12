const TY = 1_000_000_000
const TRIEU = 1_000_000

function viDecimal(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded)
    ? String(rounded)
    : String(rounded).replace('.', ',')
}

function viFixed1(value: number): string {
  const rounded = Math.round(value * 10) / 10
  return rounded.toFixed(1).replace('.', ',')
}

export function formatTy(amount: number): string {
  return `${viDecimal(amount / TY)} tỷ`
}

export function formatTyRaw(amount: number): string {
  return viDecimal(amount / TY)
}

export function formatTyFixed1(amount: number): string {
  return `${viFixed1(amount / TY)} tỷ`
}

export function formatTyRawFixed1(amount: number): string {
  return viFixed1(amount / TY)
}

export function formatTrieu(amount: number): string {
  return `${viDecimal(amount / TRIEU)} triệu`
}

export function formatTrieuRaw(amount: number): string {
  return viDecimal(amount / TRIEU)
}

export function formatPercent(value: number): string {
  return `${viDecimal(value)}%`
}

/** Chọn đơn vị theo độ lớn: dưới 1 tỷ đọc bằng triệu thay vì "0,6 tỷ" */
export function formatAmountVnd(amount: number): string {
  return Math.abs(amount) >= TY ? formatTy(amount) : formatTrieu(amount)
}
