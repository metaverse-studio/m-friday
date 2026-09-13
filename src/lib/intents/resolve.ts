import { BUSINESS_INTENT_IDS, getIntent } from './registry'
import { parseSlots } from './slots'
import type { IntentId, SlotSpec, SlotValues } from './types'

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

export type Turn = {
  intentId: IntentId
  slots: SlotValues
  /** Lượt sửa tham số của intent đang hiển thị, không mở widget mới */
  refinement: boolean
}

export type ResolveContext = {
  /** Intent đang hiển thị trên màn hình, nếu có */
  activeIntent?: IntentId | null
  /** Slot Friday vừa hỏi và đang chờ khách trả lời */
  pendingSlot?: { intentId: IntentId; slot: SlotSpec; filled: SlotValues } | null
}

/** Đọc slot của một intent ra khỏi câu nói */
function slotsOf(id: IntentId, normalized: string): SlotValues {
  const specs = getIntent(id).slots
  return specs ? parseSlots(specs, normalized) : {}
}

/**
 * Tầng 2 trước, tầng 3 sau. Mọi lỗi đều rơi về UNKNOWN
 * để guardrail chạy thay vì hiển thị lỗi lên màn hình.
 */
export async function resolveTurn(
  text: string,
  context: ResolveContext = {},
): Promise<Turn> {
  const normalized = normalizeVi(text)
  const { activeIntent, pendingSlot } = context

  // Đang chờ một slot cụ thể: câu này trả lời câu hỏi của Friday trước đã.
  // Nếu không đọc ra giá trị thì mới xét như một lượt bình thường.
  if (pendingSlot) {
    const value = pendingSlot.slot.parse(normalized)
    if (value !== null) {
      return {
        intentId: pendingSlot.intentId,
        slots: {
          ...pendingSlot.filled,
          ...slotsOf(pendingSlot.intentId, normalized),
          [pendingSlot.slot.id]: value,
        },
        refinement: false,
      }
    }
  }

  const byKeyword = matchKeyword(text)
  if (byKeyword) {
    return { intentId: byKeyword, slots: slotsOf(byKeyword, normalized), refinement: false }
  }

  /**
   * Lượt tinh chỉnh: câu không khớp intent nào, nhưng intent đang hiển thị có
   * slot và câu này nói ra một giá trị cho nó. "200 nghìn thôi" sửa lệnh FX
   * đang xem chứ không phải một yêu cầu mới — đây là chỗ Friday nghe ra được
   * rằng khách đang nói tiếp, không phải đổi chuyện.
   */
  if (activeIntent) {
    const refined = slotsOf(activeIntent, normalized)
    if (Object.keys(refined).length > 0) {
      return { intentId: activeIntent, slots: refined, refinement: true }
    }
  }

  try {
    const response = await fetch('/api/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
    if (!response.ok) return { intentId: 'UNKNOWN', slots: {}, refinement: false }
    const data = (await response.json()) as { intentId?: IntentId }
    const intentId = data?.intentId ?? 'UNKNOWN'
    return { intentId, slots: slotsOf(intentId, normalized), refinement: false }
  } catch (error) {
    console.error('[resolve] tầng 3 thất bại:', error)
    return { intentId: 'UNKNOWN', slots: {}, refinement: false }
  }
}
