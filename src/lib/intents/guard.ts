import { extractNumberTokens, trimTrailingSeparator } from './numbers'
import { allowedNumbersFor } from './registry'
import type { IntentId, SlotValues } from './types'

export { extractNumberTokens }

export function findViolations(text: string, allowed: string[]): string[] {
  const allowedSet = new Set(allowed.map(trimTrailingSeparator))
  return extractNumberTokens(text).filter((token) => !allowedSet.has(token))
}

/**
 * Lời thoại chỉ an toàn khi mọi con số trong đó đều nằm trong
 * danh sách cho phép của intent. LLM được đổi cách nói, không được đổi số.
 */
export function isSafeReply(
  text: string,
  intentId: IntentId,
  slots: SlotValues = {},
): boolean {
  const violations = findViolations(text, allowedNumbersFor(intentId, slots))
  if (violations.length > 0) {
    console.error(`[guard] ${intentId} sinh số lạ:`, violations, '|', text)
  }
  return violations.length === 0
}
