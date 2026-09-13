import { describe, expect, test } from 'bun:test'
import { sessionAgendaLine, sessionSummaryLine } from './narration'
import { resolveTurn } from './resolve'
import { AMOUNT_USD_SLOT } from './slots'
import type { IntentId } from './types'

describe('resolveTurn — tầng keyword kèm slot', () => {
  test('đọc intent và tham số từ cùng một câu', async () => {
    const turn = await resolveTurn('Khóa tỷ giá 500.000 USD cho lô Siemens')
    expect(turn.intentId).toBe('FX_FORWARD')
    expect(turn.slots.amountUsd).toBe(500_000)
    expect(turn.refinement).toBe(false)
  })

  test('không có tham số trong câu thì slots rỗng', async () => {
    const turn = await resolveTurn('Khóa tỷ giá cho lô Siemens')
    expect(turn.intentId).toBe('FX_FORWARD')
    expect(turn.slots).toEqual({})
  })

  test('đọc tháng cho câu so sánh kỳ', async () => {
    const turn = await resolveTurn('So sánh tháng 7 với cùng kỳ năm ngoái')
    expect(turn.intentId).toBe('PERIOD_COMPARE')
    expect(turn.slots.month).toBe('Tháng 7')
  })
})

describe('resolveTurn — lượt tinh chỉnh', () => {
  /**
   * Đây là điểm mấu chốt của cả đợt: câu nói tiếp theo không nhất thiết là
   * một yêu cầu mới. "200 nghìn thôi" đang sửa lệnh đang hiển thị.
   */
  test('câu chỉ có số sửa tham số của intent đang hiển thị', async () => {
    const turn = await resolveTurn('200 nghìn thôi', { activeIntent: 'FX_FORWARD' })
    expect(turn.intentId).toBe('FX_FORWARD')
    expect(turn.slots.amountUsd).toBe(200_000)
    expect(turn.refinement).toBe(true)
  })

  test('câu khớp intent khác vẫn nhảy intent chứ không bị coi là tinh chỉnh', async () => {
    const turn = await resolveTurn('Dòng tiền tuần này thế nào', {
      activeIntent: 'FX_FORWARD',
    })
    expect(turn.intentId).toBe('CASH_FLOW')
    expect(turn.refinement).toBe(false)
  })

  test('intent đang hiển thị không có slot thì không có tinh chỉnh', async () => {
    const turn = await resolveTurn('200 nghìn thôi', { activeIntent: 'CASH_FLOW' })
    expect(turn.refinement).toBe(false)
  })
})

describe('resolveTurn — đang chờ trả lời câu hỏi ngược', () => {
  const pendingSlot = {
    intentId: 'FX_FORWARD' as IntentId,
    slot: AMOUNT_USD_SLOT,
    filled: {},
  }

  test('câu trả lời điền đúng slot đang chờ', async () => {
    const turn = await resolveTurn('100 nghìn', { pendingSlot })
    expect(turn.intentId).toBe('FX_FORWARD')
    expect(turn.slots.amountUsd).toBe(100_000)
    expect(turn.refinement).toBe(false)
  })

  test('khách đổi ý sang việc khác thì bỏ lượt chờ', async () => {
    const turn = await resolveTurn('Cho anh xem dòng tiền', { pendingSlot })
    expect(turn.intentId).toBe('CASH_FLOW')
  })
})

describe('Vòng đời phiên', () => {
  /** Nói có ba việc rồi chỉ kể hai là hỏng ngay câu đầu tiên của phiên */
  test('agenda nêu số việc đúng bằng số mục thật sự kể ra', () => {
    const line = sessionAgendaLine()
    expect(line).toContain('3 việc')
    expect(line).toContain('lệnh đang chờ anh phê duyệt')
    expect(line).toContain('cảnh báo giao dịch bất thường')
    expect(line).toContain('nghĩa vụ chi sắp đến hạn')
  })

  test('câu chốt phiên kể đúng việc đã xem', () => {
    const line = sessionSummaryLine(['CASH_FLOW', 'TRADE_FINANCE'])
    expect(line).toContain('dòng tiền 7 ngày')
    expect(line).toContain('hạn mức l/c')
  })

  test('tách việc đã ký khỏi việc chỉ xem', () => {
    const line = sessionSummaryLine(['CASH_FLOW', 'APPROVE_FIDO'])
    expect(line).toContain('đã xem dòng tiền 7 ngày')
    expect(line).toContain('đã ký duyệt duyệt bảo lãnh vsip iii')
  })

  test('không kể trùng khi một nội dung được xem hai lần', () => {
    const line = sessionSummaryLine(['CASH_FLOW', 'CASH_FLOW'])
    expect(line.match(/dòng tiền 7 ngày/g)).toHaveLength(1)
  })

  test('phiên trống không bịa ra việc đã làm', () => {
    expect(sessionSummaryLine([])).toContain('chưa xem nội dung nào')
  })

  test('không tự kể chính lượt chốt phiên', () => {
    const line = sessionSummaryLine(['CASH_FLOW', 'SESSION_SUMMARY'])
    expect(line).not.toContain('chốt phiên')
  })
})
