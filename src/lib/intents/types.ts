import type { FixtureKey } from '../data/fixtures'

export type IntentId =
  | 'FIDO_LOGIN'
  | 'GREETING'
  | 'CASH_FLOW'
  | 'PERIOD_COMPARE'
  | 'OBLIGATION_CALENDAR'
  | 'TXN_HISTORY'
  | 'RECENT_ACTIONS'
  | 'TRADE_FINANCE'
  | 'FRAUD_ALERT'
  | 'APPROVE_FIDO'
  | 'REJECT_ORDER'
  | 'SUGGEST_CCTG'
  | 'FX_FORWARD'
  | 'LOAN_BALANCE'
  | 'CALL_HOTLINE'
  | 'SESSION_SUMMARY'
  | 'UNKNOWN'

export type IntentGroup =
  | 'system'
  | 'analysis'
  | 'approval'
  | 'advisory'
  | 'support'
  | 'fallback'

export type SlotId = 'amountUsd' | 'principal' | 'termDays' | 'month'

export type SlotValue = number | string

export type SlotValues = Partial<Record<SlotId, SlotValue>>

export type SlotOption = {
  value: SlotValue
  /** Chữ trên chip lúc Friday chờ, cũng là cách đọc số cho người nghe */
  label: string
}

export type SlotSpec = {
  id: SlotId
  /** Câu Friday hỏi khi slot `required` mà khách chưa nói tới */
  question: string
  /**
   * Lựa chọn hiện trên chip bar lúc chờ. Đây là đường lui bắt buộc:
   * STT hỏng giữa lượt hỏi ngược mà không có nút bấm thì phiên demo kẹt cứng.
   */
  options: SlotOption[]
  /** Giá trị dùng khi khách không nói tới slot này */
  fallback: SlotValue
  /** Bắt buộc phải có trước khi intent được chạy */
  required?: boolean
  /** Bắt giá trị từ câu nói đã bỏ dấu; null nghĩa là câu này không nhắc tới */
  parse: (normalized: string) => SlotValue | null
}

export type Intent = {
  id: IntentId
  /** Chữ hiển thị trên chip và trong ngăn kéo */
  label: string
  group: IntentGroup
  /** Tầng 2: regex chạy trên text đã bỏ dấu, viết thường */
  keywords: RegExp[]
  /** Tầng 3: mô tả đưa cho LLM để phân loại */
  description: string
  /** Lát fixtures duy nhất mà LLM được nhìn thấy khi sinh thoại */
  fixtureKey: FixtureKey | null
  /** Câu dùng khi LLM lỗi hoặc numeric guard loại bỏ output */
  fallbackLine: string
  /**
   * Không cho LLM diễn đạt lại, luôn đọc đúng `fallbackLine`.
   *
   * Dành cho câu tự giới thiệu thương hiệu — tên trợ lý, tên ngân hàng,
   * chức danh. Đó là nội dung nhận diện, sai một chữ là sai thông điệp.
   * Ngoài ra `description` của các intent hệ thống là chú thích kỹ thuật
   * ("Sự kiện hệ thống, tự chạy sau khi đăng nhập"), đưa vào prompt thì LLM
   * sẽ thuyết minh về cơ chế hệ thống thay vì chào khách.
   */
  fixedLine?: boolean
  /** Các chuỗi số được phép xuất hiện trong lời thoại của intent này */
  allowedNumbers: string[]
  /** Ba chip gợi ý sau khi intent chạy xong */
  nextChips: IntentId[]
  /** Cần xác thực sinh trắc học trước khi đổi trạng thái */
  requiresFido?: boolean
  /** Dòng mô tả hiển thị trên màn hình xác thực FIDO */
  fidoLabel?: string
  /**
   * FIDO được kích hoạt bằng nút bấm bên trong widget (người dùng phải
   * đọc số liệu trước khi ký), không chặn ngay đầu lượt thoại.
   */
  fidoInWidget?: boolean
  /** Tham số khách có thể nói kèm, ví dụ số USD muốn khóa tỷ giá */
  slots?: SlotSpec[]
  /**
   * Câu mẫu tính lại theo slot. `fallbackLine` là bản của giá trị mặc định;
   * khi khách đổi tham số mà câu mẫu đứng im thì Friday đọc một đằng, widget
   * vẽ một nẻo — đúng kiểu lệch số mà numeric guard không bắt được.
   */
  dynamicLine?: (slots: SlotValues) => string
  /**
   * Số sinh ra từ giá trị slot, cộng vào `allowedNumbers` khi guard chạy.
   * Tính bằng code chứ không chép tay — chép tay là chỗ danh sách lệch khỏi
   * dữ liệu, và khi lệch thì guard chặn sạch câu trả lời của Friday.
   */
  derivedNumbers?: (slots: SlotValues) => string[]
}
