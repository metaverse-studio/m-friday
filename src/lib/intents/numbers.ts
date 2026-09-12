/** Khớp chuỗi số có thể chứa dấu chấm, phẩy hoặc gạch chéo ở giữa */
const NUMBER_PATTERN = /\d+(?:[.,/:]\d+)*/g

export function trimTrailingSeparator(token: string): string {
  return token.replace(/[.,/:]+$/, '')
}

export function extractNumberTokens(text: string): string[] {
  return (text.match(NUMBER_PATTERN) ?? []).map(trimTrailingSeparator)
}
