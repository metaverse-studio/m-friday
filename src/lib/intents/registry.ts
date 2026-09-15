import { formatPercent, formatTrieu, formatTy, formatTyFixed1 } from '../data/format'
import {
  cashMargin,
  cctgYield,
  fxFloatRisk,
  fxForwardCost,
  fxSaving,
  obligationTotal,
  periodData,
  periodGrowthInflow,
} from '../data/calc'
import { PERIOD_MONTHS, fixtures } from '../data/fixtures'
import { allowedFor, renderNumber } from './allowed'
import { extractNumberTokens } from './numbers'
import {
  AMOUNT_USD_SLOT,
  MONTH_SLOT,
  PRINCIPAL_SLOT,
  TERM_DAYS_SLOT,
  numberSlot,
} from './slots'
import type { Intent, IntentId, SlotValues } from './types'

const f = fixtures

/**
 * Mọi cách đọc hợp lệ của một danh sách số. Dùng cho `derivedNumbers`:
 * mỗi giá trị slot kéo theo một bộ số dẫn xuất, và bộ đó phải lọt guard.
 */
function readings(...values: number[]): string[] {
  return values.flatMap(renderNumber)
}

/** Câu tư vấn CCTG tính theo đúng số tiền và kỳ hạn khách chọn */
function cctgLine(principal: number, termDays: number): string {
  return `Em gợi ý anh trích ${formatTy(
    principal,
  )} mua Chứng chỉ tiền gửi MSB kỳ hạn ${termDays} ngày, lãi suất ${formatPercent(
    f.cctg.annualRate * 100,
  )} một năm, dự tính đem lại ${formatTrieu(cctgYield(principal, termDays))} VNĐ ạ.`
}

/** Câu báo cáo so sánh kỳ của một tháng bất kỳ trong bảng */
function periodLine(month: string): string {
  const { inflowThis, inflowLast } = periodData(month)
  return `Dạ em báo cáo anh, ${month} năm nay công ty thu về ${formatTy(
    inflowThis,
  )}, tăng ${formatPercent(periodGrowthInflow(month))} so với ${formatTy(
    inflowLast,
  )} cùng kỳ năm ngoái ạ.`
}

/**
 * Số dẫn xuất của bảng so sánh kỳ, tính cho cả ba tháng.
 *
 * Kể cả số trong tên tháng: `allowedFor` duyệt giá trị của fixture chứ không
 * duyệt khóa, nên "Tháng 6" nằm ở vị trí khóa thì con số 6 không lọt vào
 * danh sách — và guard chặn đúng câu Friday vừa nói tên tháng khách hỏi.
 */
function periodExtras(): string[] {
  return PERIOD_MONTHS.flatMap((month) => [
    ...extractNumberTokens(month),
    formatPercent(periodGrowthInflow(month)).replace('%', ''),
    formatPercent(cashMargin('this', month)).replace('%', ''),
    formatPercent(cashMargin('last', month)).replace('%', ''),
  ])
}

export const INTENTS: Record<IntentId, Intent> = {
  FIDO_LOGIN: {
    id: 'FIDO_LOGIN',
    label: 'Đăng nhập',
    group: 'system',
    keywords: [],
    description: 'Sự kiện hệ thống, không kích hoạt bằng giọng nói.',
    fixtureKey: null,
    fallbackLine: '',

    allowedNumbers: allowedFor(null),
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
      'Chào Mr Stark. Em là M-Tròn, Trợ lý Quan hệ Khách hàng Doanh nghiệp của anh tại MSB Business ạ.',
    fixedLine: true,
    allowedNumbers: allowedFor('company'),
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

    allowedNumbers: allowedFor('cashFlow'),
    nextChips: ['SUGGEST_CCTG', 'OBLIGATION_CALENDAR', 'PERIOD_COMPARE'],
  },

  PERIOD_COMPARE: {
    id: 'PERIOD_COMPARE',
    label: 'So sánh kỳ',
    group: 'analysis',
    keywords: [/so sanh/, /cung ky/, /thang nay so/],
    description: 'So sánh kết quả tháng này với cùng kỳ năm trước.',
    fixtureKey: 'periodCompare',
    fallbackLine: periodLine(f.periodCompare.defaultMonth),
    dynamicLine: (slots) => periodLine(String(slots.month ?? f.periodCompare.defaultMonth)),
    allowedNumbers: allowedFor('periodCompare', periodExtras()),
    nextChips: ['CASH_FLOW', 'LOAN_BALANCE', 'OBLIGATION_CALENDAR'],
    slots: [MONTH_SLOT],
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

    allowedNumbers: allowedFor('obligations', ['30', '10,1', '27,5']),
    nextChips: ['SUGGEST_CCTG', 'LOAN_BALANCE', 'CASH_FLOW'],
  },

  TXN_HISTORY: {
    id: 'TXN_HISTORY',
    label: 'Lịch sử giao dịch',
    group: 'analysis',
    keywords: [/lich su giao dich/, /bien dong so du/, /sao ke/],
    description: 'Xem lịch sử biến động số dư các tài khoản thanh toán.',
    fixtureKey: 'txns',
    fallbackLine:
      'Dạ em đưa lên bảng kê biến động số dư các tài khoản thanh toán VNĐ và USD trong ngày để anh xem ạ.',

    allowedNumbers: allowedFor('txns'),
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

    allowedNumbers: allowedFor('session', ['12/12']),
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

    allowedNumbers: allowedFor('tradeFinance'),
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

    allowedNumbers: allowedFor('fraud'),
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

    allowedNumbers: allowedFor('tradeFinance'),
    nextChips: ['RECENT_ACTIONS', 'FRAUD_ALERT', 'SESSION_SUMMARY'],
    requiresFido: true,
    fidoLabel: `Ký duyệt bảo lãnh ${f.tradeFinance.pendingGuarantee.project} · ${formatTy(
      f.tradeFinance.pendingGuarantee.amount,
    )} VNĐ`,
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
    allowedNumbers: allowedFor('fraud'),
    nextChips: ['RECENT_ACTIONS', 'FRAUD_ALERT', 'SESSION_SUMMARY'],
    requiresFido: true,
    fidoLabel: `Trả lệnh ${formatTrieu(f.fraud.amount)} VNĐ về Maker ${f.fraud.makerName}`,
  },

  SUGGEST_CCTG: {
    id: 'SUGGEST_CCTG',
    label: 'Gợi ý CCTG',
    group: 'advisory',
    keywords: [/chung chi tien gui/, /cctg/, /toi uu von/, /tien nhan roi/],
    description:
      'Tư vấn gửi tiền nhàn rỗi vào chứng chỉ tiền gửi để sinh lời.',
    fixtureKey: 'cctg',
    fallbackLine: cctgLine(f.cctg.principal, f.cctg.termDays),
    dynamicLine: (slots) =>
      cctgLine(
        numberSlot(slots, 'principal') ?? f.cctg.principal,
        numberSlot(slots, 'termDays') ?? f.cctg.termDays,
      ),
    allowedNumbers: allowedFor('cctg', ['27,5', '10,1', '17,4', '33,3']),
    derivedNumbers: (slots) => {
      const principal = numberSlot(slots, 'principal') ?? f.cctg.principal
      const termDays = numberSlot(slots, 'termDays') ?? f.cctg.termDays
      return readings(principal, termDays, cctgYield(principal, termDays))
    },
    nextChips: ['OBLIGATION_CALENDAR', 'LOAN_BALANCE', 'CASH_FLOW'],
    requiresFido: true,
    fidoInWidget: true,
    fidoLabel: `Xác nhận mua Chứng chỉ tiền gửi ${formatTyFixed1(f.cctg.principal)} VNĐ`,
    slots: [PRINCIPAL_SLOT, TERM_DAYS_SLOT],
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

    allowedNumbers: allowedFor('fx', ['250.000', '250', '25/09', '98,2', '32,5', '65,7']),
    derivedNumbers: (slots) => {
      const amountUsd = numberSlot(slots, 'amountUsd') ?? f.tradeFinance.pendingLc.amountUsd
      return [
        amountUsd.toLocaleString('vi-VN'),
        ...readings(
          amountUsd,
          amountUsd / 1000,
          fxForwardCost(amountUsd),
          fxFloatRisk(amountUsd),
          fxSaving(amountUsd),
        ),
      ]
    },
    nextChips: ['TRADE_FINANCE', 'CASH_FLOW', 'OBLIGATION_CALENDAR'],
    requiresFido: true,
    fidoInWidget: true,
    fidoLabel: `Đặt lệnh kỳ hạn USD/VND tại ${f.fx.forwardRate.toLocaleString('vi-VN')}`,
    slots: [AMOUNT_USD_SLOT],
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

    allowedNumbers: allowedFor('loan', ['38', '38,0']),
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

    allowedNumbers: allowedFor('contacts'),
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
    allowedNumbers: allowedFor('session', ['12/12']),
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
    allowedNumbers: allowedFor('contacts'),
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

/** Câu mẫu đã tính theo slot; rơi về `fallbackLine` khi intent không có slot */
export function fallbackLineFor(id: IntentId, slots: SlotValues = {}): string {
  const intent = getIntent(id)
  return intent.dynamicLine ? intent.dynamicLine(slots) : intent.fallbackLine
}

/**
 * Danh sách số hợp lệ đã nở ra theo slot. Không có bước này thì khách đổi
 * tham số là guard chặn sạch câu của Friday, vì mọi con số tính lại đều
 * nằm ngoài `allowedNumbers` tĩnh.
 */
export function allowedNumbersFor(id: IntentId, slots: SlotValues = {}): string[] {
  const intent = getIntent(id)
  if (!intent.derivedNumbers) return intent.allowedNumbers
  return [...new Set([...intent.allowedNumbers, ...intent.derivedNumbers(slots)])]
}
