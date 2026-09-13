import { fixtures } from '../data/fixtures'
import { getIntent } from './registry'
import type { IntentId } from './types'

/** Nối danh sách theo cách đọc tiếng Việt: "a, b và c" */
function joinVi(items: string[]): string {
  if (items.length <= 1) return items[0] ?? ''
  return `${items.slice(0, -1).join(', ')} và ${items[items.length - 1]}`
}

/**
 * Agenda mở phiên. Đếm từ fixtures chứ không gõ tay, vì đây là lời hứa đầu
 * phiên — nói có ba việc rồi widget chỉ hiện hai là hỏng ngay câu đầu tiên.
 */
export function sessionAgendaLine(): string {
  const pendingOrders = fixtures.session.pendingInternational + fixtures.session.pendingGuarantee
  // Khoản nào có ngày đến hạn thì đếm; dự phòng vận hành không có ngày
  const dated = [fixtures.obligations.vatDue, fixtures.obligations.payroll].filter(
    (item) => item.date,
  ).length

  const items = [
    `${pendingOrders} lệnh đang chờ anh phê duyệt`,
    'một cảnh báo giao dịch bất thường em đã tạm giữ',
    `${dated} nghĩa vụ chi sắp đến hạn`,
  ]

  return `Sáng nay em có ${items.length} việc cần báo cáo anh: ${joinVi(
    items,
  )}. Anh muốn bắt đầu từ đâu ạ?`
}

/** Các intent đổi trạng thái — nói "đã ký duyệt" thay vì "đã xem" */
function isAction(id: IntentId): boolean {
  return getIntent(id).requiresFido === true
}

/**
 * Câu chốt phiên đọc đúng những gì đã xảy ra trong phiên này.
 *
 * Câu cố định cũ ("Em đã tổng hợp phiên làm việc…") đúng với mọi phiên nên
 * không nói lên điều gì. Một RM thật chốt bằng danh sách việc đã làm.
 */
export function sessionSummaryLine(history: IntentId[]): string {
  const done = history.filter(
    (id) => id !== 'GREETING' && id !== 'FIDO_LOGIN' && id !== 'SESSION_SUMMARY',
  )
  const unique = [...new Set(done)]

  if (unique.length === 0) {
    return 'Dạ phiên này mình chưa xem nội dung nào, anh cần gì em hỗ trợ ngay ạ.'
  }

  const signed = unique.filter(isAction).map((id) => getIntent(id).label.toLowerCase())
  const viewed = unique.filter((id) => !isAction(id)).map((id) => getIntent(id).label.toLowerCase())

  const parts: string[] = []
  if (viewed.length > 0) parts.push(`anh đã xem ${joinVi(viewed)}`)
  if (signed.length > 0) parts.push(`đã ký duyệt ${joinVi(signed)}`)

  return `Dạ em tổng hợp phiên làm việc: ${parts.join(
    ', ',
  )}. Em đã gửi báo cáo vào email của anh, chúc anh một ngày làm việc hiệu quả ạ.`
}
