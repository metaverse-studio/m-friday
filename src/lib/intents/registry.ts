import { formatTrieu, formatTy } from '../data/format'
import { cctgYield, obligationTotal } from '../data/calc'
import { fixtures } from '../data/fixtures'
import type { Intent, IntentId } from './types'

const f = fixtures

export const INTENTS: Record<IntentId, Intent> = {
  FIDO_LOGIN: {
    id: 'FIDO_LOGIN',
    label: 'Đăng nhập',
    group: 'system',
    keywords: [],
    description: 'Sự kiện hệ thống, không kích hoạt bằng giọng nói.',
    fixtureKey: null,
    fallbackLine: '',
    allowedNumbers: [],
    nextChips: [],
  },

  GREETING: {
    id: 'GREETING',
    label: 'Lời chào',
    group: 'system',
    keywords: [],
    description: 'Sự kiện hệ thống, tự chạy sau khi đăng nhập.',
    fixtureKey: 'company',
    fallbackLine:
      'Chào Mr Stark. Em là Friday, Trợ lý Quan hệ Khách hàng Doanh nghiệp của anh tại MSB Business ạ.',
    allowedNumbers: [],
    nextChips: ['CASH_FLOW', 'RECENT_ACTIONS', 'TRADE_FINANCE'],
  },

  CASH_FLOW: {
    id: 'CASH_FLOW',
    label: 'Dòng tiền 7 ngày',
    group: 'analysis',
    keywords: [/dong tien/, /thu chi/, /bao cao tien/],
    description:
      'Hỏi về dòng tiền vào ra của doanh nghiệp trong tuần hoặc 7 ngày gần nhất.',
    fixtureKey: 'cashFlow',
    fallbackLine: `Dạ em báo cáo Mr Stark, trong 7 ngày qua dòng tiền doanh nghiệp thặng dư ròng ${formatTy(
      f.cashFlow.net,
    )} VNĐ, các khoản thu từ đối tác đã về đầy đủ đúng hạn ạ.`,
    allowedNumbers: ['7', '65', '65,0', '46,8', '18,2'],
    nextChips: ['SUGGEST_CCTG', 'OBLIGATION_CALENDAR', 'PERIOD_COMPARE'],
  },

  PERIOD_COMPARE: {
    id: 'PERIOD_COMPARE',
    label: 'So sánh kỳ',
    group: 'analysis',
    keywords: [/so sanh/, /cung ky/, /thang nay so/],
    description: 'So sánh kết quả tháng này với cùng kỳ năm trước.',
    fixtureKey: 'periodCompare',
    fallbackLine:
      'Dạ em báo cáo anh, Tháng 8 năm nay công ty thu về 248 tỷ, tăng 19,8% so với 207 tỷ cùng kỳ năm ngoái ạ.',
    allowedNumbers: ['8', '248', '207', '196', '174', '19,8', '12,6'],
    nextChips: ['CASH_FLOW', 'LOAN_BALANCE', 'OBLIGATION_CALENDAR'],
  },

  OBLIGATION_CALENDAR: {
    id: 'OBLIGATION_CALENDAR',
    label: 'Lịch chi sắp tới',
    group: 'analysis',
    keywords: [/nghia vu/, /sap phai chi/, /phai chi/, /lich chi/, /thue/, /luong/],
    description:
      'Hỏi về các khoản phải chi sắp tới như thuế, lương, nghĩa vụ tài chính.',
    fixtureKey: 'obligations',
    fallbackLine: `Dạ em báo cáo anh, trong 30 ngày tới công ty cần chi khoảng ${formatTy(
      obligationTotal(),
    )} VNĐ cho thuế, lương và dự phòng vận hành. Số dư hiện tại hoàn toàn đủ đáp ứng ạ.`,
    allowedNumbers: ['30', '20/09', '25/09', '2,8', '4,1', '320', '3,2', '10,1', '27,5'],
    nextChips: ['SUGGEST_CCTG', 'LOAN_BALANCE', 'CASH_FLOW'],
  },

  TXN_HISTORY: {
    id: 'TXN_HISTORY',
    label: 'Lịch sử giao dịch',
    group: 'analysis',
    keywords: [/lich su giao dich/, /bien dong so du/, /sao ke/],
    description: 'Xem lịch sử biến động số dư các tài khoản thanh toán.',
    fixtureKey: 'session',
    fallbackLine:
      'Dạ em đưa lên bảng kê biến động số dư các tài khoản thanh toán VNĐ và USD trong ngày để anh xem ạ.',
    allowedNumbers: [],
    nextChips: ['CASH_FLOW', 'RECENT_ACTIONS', 'PERIOD_COMPARE'],
  },

  RECENT_ACTIONS: {
    id: 'RECENT_ACTIONS',
    label: 'Lệnh chờ duyệt',
    group: 'approval',
    keywords: [/cho duyet/, /cho anh duyet/, /phien sang/, /tac vu/],
    description:
      'Hỏi về tình hình phiên giao dịch hôm nay và các lệnh đang chờ phê duyệt.',
    fixtureKey: 'session',
    fallbackLine: `Dạ em báo cáo anh, trong phiên sáng nay hệ thống đã thực hiện thành công 12/12 lệnh hạch toán với tổng giá trị ${formatTy(
      f.session.postedValue,
    )} VNĐ. Hiện có 02 lệnh thanh toán quốc tế và 01 đề nghị bảo lãnh chờ anh phê duyệt ạ.`,
    allowedNumbers: ['12', '12/12', '48,5', '02', '2', '01', '1'],
    nextChips: ['FRAUD_ALERT', 'TRADE_FINANCE', 'TXN_HISTORY'],
  },

  TRADE_FINANCE: {
    id: 'TRADE_FINANCE',
    label: 'Hạn mức L/C',
    group: 'approval',
    keywords: [/han muc/, /l\/c/, /lc /, /thu tin dung/, /bao lanh/],
    description: 'Kiểm tra hạn mức thư tín dụng và bảo lãnh ngân hàng.',
    fixtureKey: 'tradeFinance',
    fallbackLine:
      'Dạ em báo cáo anh, hạn mức L/C khả dụng của công ty là 18 tỷ trên tổng 50 tỷ, hạn mức bảo lãnh còn 11,5 tỷ trên tổng 30 tỷ ạ.',
    allowedNumbers: ['18', '18,0', '50', '50,0', '11,5', '30', '30,0', '250.000', '250', '5,2', '25/09'],
    nextChips: ['APPROVE_FIDO', 'FX_FORWARD', 'REJECT_ORDER'],
  },

  FRAUD_ALERT: {
    id: 'FRAUD_ALERT',
    label: 'Cảnh báo bất thường',
    group: 'approval',
    keywords: [/bat thuong/, /canh bao/, /dang ngo/, /rui ro giao dich/],
    description: 'Hỏi về giao dịch đáng ngờ hoặc cảnh báo rủi ro gian lận.',
    fixtureKey: 'fraud',
    fallbackLine: `Em phát hiện một lệnh chuyển ${formatTrieu(
      f.fraud.amount,
    )} VNĐ tới tài khoản thụ hưởng lần đầu giao dịch, tạo ngoài giờ hành chính. Em tạm giữ lại chờ anh xác nhận ạ.`,
    allowedNumbers: ['850', '23:47', '11/09'],
    nextChips: ['REJECT_ORDER', 'RECENT_ACTIONS', 'CALL_HOTLINE'],
  },

  APPROVE_FIDO: {
    id: 'APPROVE_FIDO',
    label: 'Duyệt bảo lãnh VSIP III',
    group: 'approval',
    keywords: [/duyet bao lanh/, /duyet bang fido/, /ky duyet/],
    description: 'Phê duyệt một lệnh đang chờ bằng xác thực sinh trắc học.',
    fixtureKey: 'tradeFinance',
    fallbackLine:
      'Em đã ghi nhận phê duyệt của anh. Bảo lãnh thực hiện hợp đồng dự án KCN VSIP III đã được ký duyệt điện tử thành công ạ.',
    allowedNumbers: ['5,2'],
    nextChips: ['RECENT_ACTIONS', 'FRAUD_ALERT', 'SESSION_SUMMARY'],
    requiresFido: true,
  },

  REJECT_ORDER: {
    id: 'REJECT_ORDER',
    label: 'Trả lệnh về Maker',
    group: 'approval',
    keywords: [/tra lenh/, /tra ve ke toan/, /tu choi lenh/, /ghi chu/],
    description: 'Trả một lệnh về cho người tạo kèm lý do.',
    fixtureKey: 'fraud',
    fallbackLine:
      'Em đã trả lệnh về cho Maker kèm ghi chú của anh. Kế toán sẽ nhận được thông báo ngay ạ.',
    allowedNumbers: [],
    nextChips: ['RECENT_ACTIONS', 'FRAUD_ALERT', 'SESSION_SUMMARY'],
    requiresFido: true,
  },

  SUGGEST_CCTG: {
    id: 'SUGGEST_CCTG',
    label: 'Gợi ý CCTG',
    group: 'advisory',
    keywords: [/chung chi tien gui/, /cctg/, /toi uu von/, /tien nhan roi/],
    description:
      'Tư vấn gửi tiền nhàn rỗi vào chứng chỉ tiền gửi để sinh lời.',
    fixtureKey: 'cctg',
    fallbackLine: `Em gợi ý anh trích ${formatTy(
      f.cctg.principal,
    )} mua Chứng chỉ tiền gửi MSB kỳ hạn 15 ngày, lãi suất 5,4% một năm, dự tính đem lại ${formatTrieu(
      cctgYield(),
    )} VNĐ ạ.`,
    allowedNumbers: ['27,5', '10,1', '17,4', '15', '15,0', '5,4', '33,3', '2,4'],
    nextChips: ['OBLIGATION_CALENDAR', 'LOAN_BALANCE', 'CASH_FLOW'],
    requiresFido: true,
  },

  FX_FORWARD: {
    id: 'FX_FORWARD',
    label: 'Khóa tỷ giá Siemens',
    group: 'advisory',
    keywords: [/ty gia/, /usd/, /ky han/, /forward/, /khoa ty gia/],
    description:
      'Tư vấn phòng ngừa rủi ro tỷ giá cho khoản thanh toán ngoại tệ.',
    fixtureKey: 'fx',
    fallbackLine:
      'Tỷ giá bán USD của MSB hiện là 26.180 và đã tăng 1,5% trong hai tuần qua. Em gợi ý anh khóa tỷ giá kỳ hạn ở mức 26.310 để phòng ngừa rủi ro ạ.',
    allowedNumbers: ['26.180', '26.310', '1,5', '250.000', '250', '25/09', '98,2', '32,5', '65,7'],
    nextChips: ['TRADE_FINANCE', 'CASH_FLOW', 'OBLIGATION_CALENDAR'],
    requiresFido: true,
  },

  LOAN_BALANCE: {
    id: 'LOAN_BALANCE',
    label: 'Dư nợ vay',
    group: 'advisory',
    keywords: [/du no/, /khe uoc/, /vay ngan han/, /no vay/],
    description: 'Hỏi về dư nợ vay và các khế ước nhận nợ.',
    fixtureKey: 'loan',
    fallbackLine: `Dạ em báo cáo anh, tổng dư nợ vay ngắn hạn của công ty là ${formatTy(
      f.loan.outstanding,
    )} trên hạn mức 80 tỷ. Công ty đang có 3 khế ước nhận nợ ạ.`,
    allowedNumbers: ['42', '42,0', '80', '38', '3', '12,5', '6,8', '28/09'],
    nextChips: ['CASH_FLOW', 'OBLIGATION_CALENDAR', 'SUGGEST_CCTG'],
  },

  CALL_HOTLINE: {
    id: 'CALL_HOTLINE',
    label: 'Gọi RM phụ trách',
    group: 'support',
    keywords: [/tong dai/, /goi cho rm/, /ket noi/, /hotline/, /chuyen vien/],
    description: 'Kết nối tới RM phụ trách hoặc tổng đài MSB.',
    fixtureKey: 'contacts',
    fallbackLine:
      'Dạ em đang kết nối Mr Stark tới Giám đốc Quan hệ Khách hàng Doanh nghiệp phụ trách là anh Nguyễn Văn A, hoặc Hotline MSB Priority ạ.',
    allowedNumbers: ['0988.123.456', '1800', '59', '9999'],
    nextChips: ['RECENT_ACTIONS', 'CASH_FLOW', 'SESSION_SUMMARY'],
  },

  SESSION_SUMMARY: {
    id: 'SESSION_SUMMARY',
    label: 'Chốt phiên',
    group: 'support',
    keywords: [/tom tat phien/, /gui bao cao/, /chot phien/, /gui email/],
    description: 'Tổng hợp phiên làm việc và gửi báo cáo qua email.',
    fixtureKey: 'session',
    fallbackLine:
      'Em đã tổng hợp phiên làm việc và gửi báo cáo vào email của anh. Chúc anh một ngày làm việc hiệu quả ạ.',
    allowedNumbers: [],
    nextChips: ['CASH_FLOW', 'RECENT_ACTIONS', 'CALL_HOTLINE'],
  },

  UNKNOWN: {
    id: 'UNKNOWN',
    label: 'Chuyển RM thật',
    group: 'fallback',
    keywords: [],
    description:
      'Dùng khi câu hỏi nằm ngoài mọi nghiệp vụ nêu trên. Không suy đoán.',
    fixtureKey: 'contacts',
    fallbackLine:
      'Dạ câu này nằm ngoài phạm vi em hỗ trợ trực tiếp. Để đảm bảo chính xác cho anh, em xin phép chuyển sang anh Nguyễn Văn A, Giám đốc Quan hệ Khách hàng phụ trách tài khoản của mình ạ.',
    allowedNumbers: [],
    nextChips: ['CALL_HOTLINE', 'CASH_FLOW', 'RECENT_ACTIONS'],
  },
}

/**
 * 14 intent nghiệp vụ, xếp theo thứ tự ưu tiên khi khớp keyword.
 * Intent có keyword hẹp và đặc thù đứng trước intent có keyword rộng,
 * tránh việc "duyệt bảo lãnh" bị TRADE_FINANCE nuốt mất vì chứa "bao lanh".
 */
export const BUSINESS_INTENT_IDS: IntentId[] = [
  'APPROVE_FIDO',
  'REJECT_ORDER',
  'FX_FORWARD',
  'SUGGEST_CCTG',
  'FRAUD_ALERT',
  'OBLIGATION_CALENDAR',
  'PERIOD_COMPARE',
  'TXN_HISTORY',
  'LOAN_BALANCE',
  'SESSION_SUMMARY',
  'CALL_HOTLINE',
  'TRADE_FINANCE',
  'RECENT_ACTIONS',
  'CASH_FLOW',
]

export function getIntent(id: IntentId): Intent {
  return INTENTS[id] ?? INTENTS.UNKNOWN
}
