import { BUSINESS_INTENT_IDS, getIntent } from './registry'
import type { IntentId } from './types'

const CHIP_COUNT = 3

/**
 * Luật trạng thái: một RM thật không gợi ý lan man mà bám theo việc đang dở.
 * Xem xong cảnh báo gian lận thì việc kế tiếp là xử lý nó, không phải đi hỏi
 * dư nợ. Mỗi luật chỉ bật khi tiền đề đã xảy ra và hệ quả thì chưa.
 */
const FOLLOW_UPS: { after: IntentId; suggest: IntentId }[] = [
  { after: 'FRAUD_ALERT', suggest: 'REJECT_ORDER' },
  { after: 'TRADE_FINANCE', suggest: 'APPROVE_FIDO' },
  { after: 'SUGGEST_CCTG', suggest: 'OBLIGATION_CALENDAR' },
]

/** Số lượt tối thiểu trước khi đề nghị chốt phiên */
const SUMMARY_AFTER = 5

function push(out: IntentId[], id: IntentId, seen: Set<IntentId>): void {
  if (out.length >= CHIP_COUNT) return
  if (seen.has(id) || out.includes(id)) return
  if (id === 'UNKNOWN') return
  out.push(id)
}

/**
 * Ba chip kế tiếp, tính theo intent vừa chạy và những gì đã xem trong phiên.
 *
 * Bảng `nextChips` trong registry vẫn là thứ tự ưu tiên tự nhiên của từng
 * intent, nhưng nó không biết khách đã xem gì — nên trước đây `TXN_HISTORY`
 * vẫn gợi ý `CASH_FLOW` cả khi lượt đầu phiên đã xem dòng tiền rồi.
 */
export function nextChipsFor(id: IntentId, history: IntentId[]): IntentId[] {
  const seen = new Set(history)
  const out: IntentId[] = []

  // 1. Việc còn dở dang từ những gì đã xem
  for (const rule of FOLLOW_UPS) {
    if (seen.has(rule.after)) push(out, rule.suggest, seen)
  }

  // 2. Thứ tự tự nhiên của intent vừa chạy
  for (const chipId of getIntent(id).nextChips) push(out, chipId, seen)

  // 3. Cùng nhóm nghiệp vụ với intent vừa chạy
  const group = getIntent(id).group
  for (const chipId of BUSINESS_INTENT_IDS) {
    if (getIntent(chipId).group === group) push(out, chipId, seen)
  }

  // 4. Bất kỳ intent nào chưa xem
  for (const chipId of BUSINESS_INTENT_IDS) push(out, chipId, seen)

  // 5. Phiên đã dài thì mời chốt, chiếm đúng chỗ cuối
  if (history.length >= SUMMARY_AFTER && !seen.has('SESSION_SUMMARY')) {
    const withoutLast = out.slice(0, CHIP_COUNT - 1)
    if (!withoutLast.includes('SESSION_SUMMARY')) {
      return [...withoutLast, 'SESSION_SUMMARY']
    }
  }

  // 6. Đã xem hết mọi thứ: quay lại thứ tự tự nhiên thay vì trả mảng rỗng
  if (out.length < CHIP_COUNT) {
    for (const chipId of getIntent(id).nextChips) {
      if (out.length < CHIP_COUNT && !out.includes(chipId)) out.push(chipId)
    }
  }

  return out.slice(0, CHIP_COUNT)
}
