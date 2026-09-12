import { formatTyRaw } from './format'
import { transactions } from './txns'

const sumByDirection = (direction: 'in' | 'out'): number =>
  transactions
    .filter((txn) => txn.direction === direction)
    .reduce((total, txn) => total + txn.amount, 0)

/** Ngày chốt số liệu của toàn bộ bản demo */
const DEMO_DATE = '12/09'

/** Ba khế ước cộng lại đúng bằng `loan.outstanding` (42 tỷ) */
const loanContracts = [
  { label: 'Khế ước gần nhất', amount: 12_500_000_000, annualRate: 0.068, dueDate: '28/09' },
  { label: 'Khế ước 02', amount: 17_000_000_000, annualRate: 0.068, dueDate: '14/10' },
  { label: 'Khế ước 03', amount: 12_500_000_000, annualRate: 0.068, dueDate: '02/11' },
] as const

export const fixtures = {
  company: {
    name: 'Stark Industry',
    userTitle: 'Mr Stark',
    userRole: 'Giám đốc Tài chính',
  },

  balance: {
    availableVnd: 27_500_000_000,
  },

  cashFlow: {
    days: 7,
    asOfDate: DEMO_DATE,
    inflow: 65_000_000_000,
    outflow: 46_800_000_000,
    net: 18_200_000_000,
    daily: [
      { label: 'T2', inflow: 12_400_000_000, outflow: 8_100_000_000 },
      { label: 'T3', inflow: 8_900_000_000, outflow: 6_700_000_000 },
      { label: 'T4', inflow: 11_200_000_000, outflow: 7_400_000_000 },
      { label: 'T5', inflow: 7_600_000_000, outflow: 5_900_000_000 },
      { label: 'T6', inflow: 10_300_000_000, outflow: 8_200_000_000 },
      { label: 'T7', inflow: 9_100_000_000, outflow: 6_300_000_000 },
      { label: 'CN', inflow: 5_500_000_000, outflow: 4_200_000_000 },
    ],
  },

  /**
   * Lát dữ liệu cho TXN_HISTORY. Số liệu đã quy về đơn vị tỷ dạng chuỗi
   * để LLM chép nguyên văn, khớp đúng allowedNumbers của intent.
   */
  txns: {
    date: DEMO_DATE,
    count: transactions.length,
    totalInTy: formatTyRaw(sumByDirection('in')),
    totalOutTy: formatTyRaw(sumByDirection('out')),
  },

  session: {
    postedCount: 12,
    postedTotal: 12,
    postedValue: 48_500_000_000,
    pendingInternational: 2,
    pendingGuarantee: 1,
  },

  obligations: {
    vatDue: { date: '20/09', amount: 2_800_000_000, label: 'Thuế GTGT quý III' },
    payroll: { date: '25/09', amount: 4_100_000_000, headcount: 320, label: 'Chi lương' },
    operatingReserve: 3_200_000_000,
  },

  cctg: {
    principal: 15_000_000_000,
    termDays: 15,
    annualRate: 0.054,
    bufferKept: 2_400_000_000,
  },

  tradeFinance: {
    lc: { available: 18_000_000_000, total: 50_000_000_000 },
    guarantee: { available: 11_500_000_000, total: 30_000_000_000 },
    pendingLc: { partner: 'Siemens AG', amountUsd: 250_000, dueDate: '25/09' },
    pendingGuarantee: { project: 'KCN VSIP III', amount: 5_200_000_000 },
  },

  fx: {
    spotSellRate: 26_180,
    forwardRate: 26_310,
    twoWeekChangePercent: 1.5,
  },

  fraud: {
    amount: 850_000_000,
    makerName: 'Trần Thị B',
    createdAt: '23:47 ngày 11/09',
    signals: [
      'Tài khoản thụ hưởng lần đầu phát sinh giao dịch',
      'Lệnh tạo ngoài giờ hành chính',
      'Giá trị vượt ngưỡng cảnh báo nội bộ',
    ],
  },

  loan: {
    outstanding: 42_000_000_000,
    limit: 80_000_000_000,
    contractCount: loanContracts.length,
    /** Khế ước xếp theo ngày đáo hạn, phần tử đầu là khoản gần nhất */
    contracts: loanContracts,
    nearest: loanContracts[0],
  },

  periodCompare: {
    month: 'Tháng 8',
    inflowThis: 248_000_000_000,
    inflowLast: 207_000_000_000,
    outflowThis: 196_000_000_000,
    outflowLast: 174_000_000_000,
  },

  contacts: {
    rmName: 'Nguyễn Văn A',
    rmPhone: '0988.123.456',
    hotline: '1800 59 9999',
  },
} as const

export type FixtureKey = keyof typeof fixtures
