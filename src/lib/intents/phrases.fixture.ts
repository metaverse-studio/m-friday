import type { IntentId } from './types'

export const TEST_PHRASES: { text: string; expected: IntentId }[] = [
  // CASH_FLOW
  { text: 'Báo cáo dòng tiền gần đây của công ty', expected: 'CASH_FLOW' },
  { text: 'Tuần này thu chi thế nào em', expected: 'CASH_FLOW' },
  { text: 'Cho anh xem dòng tiền bảy ngày qua', expected: 'CASH_FLOW' },

  // PERIOD_COMPARE
  { text: 'Tháng này so với cùng kỳ năm ngoái thế nào', expected: 'PERIOD_COMPARE' },
  { text: 'So sánh kết quả với cùng kỳ', expected: 'PERIOD_COMPARE' },
  { text: 'Doanh thu cùng kỳ năm trước bao nhiêu', expected: 'PERIOD_COMPARE' },

  // OBLIGATION_CALENDAR
  { text: 'Sắp tới công ty phải chi những gì', expected: 'OBLIGATION_CALENDAR' },
  { text: 'Lịch chi thuế và lương thế nào', expected: 'OBLIGATION_CALENDAR' },
  { text: 'Nghĩa vụ tài chính tháng này ra sao', expected: 'OBLIGATION_CALENDAR' },

  // TXN_HISTORY
  { text: 'Cho anh xem lịch sử giao dịch gần đây', expected: 'TXN_HISTORY' },
  { text: 'Biến động số dư hôm nay thế nào', expected: 'TXN_HISTORY' },
  { text: 'Mở sao kê tài khoản cho anh', expected: 'TXN_HISTORY' },

  // RECENT_ACTIONS
  { text: 'Có gì chờ anh duyệt không', expected: 'RECENT_ACTIONS' },
  { text: 'Phiên sáng nay thế nào rồi', expected: 'RECENT_ACTIONS' },
  { text: 'Tác vụ gần đây có gì', expected: 'RECENT_ACTIONS' },

  // TRADE_FINANCE
  { text: 'Kiểm tra hạn mức L/C và bảo lãnh cho anh', expected: 'TRADE_FINANCE' },
  { text: 'Hạn mức thư tín dụng còn bao nhiêu', expected: 'TRADE_FINANCE' },
  { text: 'Cho anh xem hạn mức bảo lãnh', expected: 'TRADE_FINANCE' },

  // FRAUD_ALERT
  { text: 'Có giao dịch nào bất thường không', expected: 'FRAUD_ALERT' },
  { text: 'Cảnh báo rủi ro gì không em', expected: 'FRAUD_ALERT' },
  { text: 'Có lệnh nào đáng ngờ không', expected: 'FRAUD_ALERT' },

  // APPROVE_FIDO
  { text: 'Duyệt bảo lãnh VSIP III bằng FIDO', expected: 'APPROVE_FIDO' },
  { text: 'Ký duyệt lệnh này cho anh', expected: 'APPROVE_FIDO' },
  { text: 'Duyệt bảo lãnh đi em', expected: 'APPROVE_FIDO' },

  // REJECT_ORDER
  { text: 'Trả lệnh số ba cho kế toán', expected: 'REJECT_ORDER' },
  { text: 'Từ chối lệnh này ghi chú thiếu hóa đơn', expected: 'REJECT_ORDER' },
  { text: 'Trả về kế toán giúp anh', expected: 'REJECT_ORDER' },

  // SUGGEST_CCTG
  { text: 'Tư vấn chứng chỉ tiền gửi cho anh', expected: 'SUGGEST_CCTG' },
  { text: 'Tiền nhàn rỗi nên làm gì', expected: 'SUGGEST_CCTG' },
  { text: 'Có cách nào tối ưu vốn không', expected: 'SUGGEST_CCTG' },

  // FX_FORWARD
  { text: 'Tỷ giá đang thế nào', expected: 'FX_FORWARD' },
  { text: 'Khóa tỷ giá cho lô hàng Siemens', expected: 'FX_FORWARD' },
  { text: 'Đặt lệnh kỳ hạn USD cho anh', expected: 'FX_FORWARD' },

  // LOAN_BALANCE
  { text: 'Dư nợ vay ngắn hạn còn bao nhiêu', expected: 'LOAN_BALANCE' },
  { text: 'Khế ước nhận nợ nào sắp đáo hạn', expected: 'LOAN_BALANCE' },
  { text: 'Nợ vay hiện tại thế nào', expected: 'LOAN_BALANCE' },

  // CALL_HOTLINE
  { text: 'Kết nối cho anh tới tổng đài', expected: 'CALL_HOTLINE' },
  { text: 'Gọi cho RM phụ trách giúp anh', expected: 'CALL_HOTLINE' },
  { text: 'Cho anh gặp chuyên viên', expected: 'CALL_HOTLINE' },

  // SESSION_SUMMARY
  { text: 'Gửi tóm tắt phiên này vào email anh', expected: 'SESSION_SUMMARY' },
  { text: 'Chốt phiên làm việc hôm nay', expected: 'SESSION_SUMMARY' },
  { text: 'Gửi báo cáo cho anh', expected: 'SESSION_SUMMARY' },

  // Ngoài phạm vi — phải rơi vào UNKNOWN
  { text: 'Cho anh vay hai trăm tỷ', expected: 'UNKNOWN' },
  { text: 'Giá vàng hôm nay bao nhiêu', expected: 'UNKNOWN' },
  { text: 'Mở thẻ tín dụng cá nhân cho anh', expected: 'UNKNOWN' },
  { text: 'Thời tiết Hà Nội thế nào', expected: 'UNKNOWN' },
  { text: 'Kể cho anh một câu chuyện cười', expected: 'UNKNOWN' },
  { text: 'Cổ phiếu MSB hôm nay ra sao', expected: 'UNKNOWN' },
  { text: 'Đặt vé máy bay đi Singapore', expected: 'UNKNOWN' },
  { text: 'Lãi suất vay mua nhà bao nhiêu', expected: 'UNKNOWN' },
]
