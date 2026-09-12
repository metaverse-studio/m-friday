import { BUSINESS_INTENT_IDS, getIntent } from './registry'
import type { IntentId } from './types'

/**
 * Bỏ dấu và viết thường để so khớp bền hơn với sai lệch dấu từ STT.
 * Ký tự đ không tách được bằng NFD nên phải thay riêng.
 */
export function normalizeVi(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tầng 2: duyệt intent theo thứ tự ưu tiên trong BUSINESS_INTENT_IDS.
 * Trả về intent đầu tiên khớp, hoặc null để nhường cho tầng 3.
 */
export function matchKeyword(text: string): IntentId | null {
  const normalized = normalizeVi(text)
  for (const id of BUSINESS_INTENT_IDS) {
    if (getIntent(id).keywords.some((pattern) => pattern.test(normalized))) {
      return id
    }
  }
  return null
}

/**
 * Tầng 2 trước, tầng 3 sau. Mọi lỗi đều rơi về UNKNOWN
 * để guardrail chạy thay vì hiển thị lỗi lên màn hình.
 */
export async function resolveIntent(text: string): Promise<IntentId> {
  const byKeyword = matchKeyword(text)
  if (byKeyword) return byKeyword

  try {
    const response = await fetch('/api/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) return 'UNKNOWN'
    const data = (await response.json()) as { intentId?: IntentId }
    return data?.intentId ? data.intentId : 'UNKNOWN'
  } catch (error) {
    console.error('[resolve] tầng 3 thất bại:', error)
    return 'UNKNOWN'
  }
}
