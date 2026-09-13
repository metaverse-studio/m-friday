import { create } from 'zustand'
import { nextChipsFor } from './intents/chips'
import type { IntentId, SlotSpec, SlotValues } from './intents/types'

export type Phase = 'locked' | 'dashboard'

const INITIAL_CHIPS: IntentId[] = ['CASH_FLOW', 'RECENT_ACTIONS', 'TRADE_FINANCE']

/** Slot Friday vừa hỏi và đang chờ khách trả lời */
export type PendingSlot = {
  intentId: IntentId
  slot: SlotSpec
  /** Các slot đã điền được từ câu nói ban đầu */
  filled: SlotValues
}

type SessionState = {
  phase: Phase
  activeIntent: IntentId | null
  /** Tham số của intent đang hiển thị, widget đọc thẳng từ đây */
  activeSlots: SlotValues
  pendingSlot: PendingSlot | null
  chips: IntentId[]
  history: IntentId[]
  isListening: boolean
  isSpeaking: boolean
  /** Đã nhận lệnh nhưng chunk audio đầu tiên chưa kịp phát */
  isThinking: boolean
  drawerOpen: boolean
  /** Hộp hướng dẫn cài lên màn hình chính, mở tự động hoặc do khách bấm nút */
  installPromptOpen: boolean
  lastLatencyMs: number | null
  fidoPrompt: { label: string; onConfirm: () => void } | null
  currentLine: string
  transcript: string

  unlock: () => void
  runIntent: (id: IntentId, slots?: SlotValues) => void
  /** Cập nhật tham số mà không mở lượt mới — dùng cho lượt tinh chỉnh */
  refineSlots: (slots: SlotValues) => void
  setPendingSlot: (pending: PendingSlot | null) => void
  setListening: (value: boolean) => void
  setSpeaking: (value: boolean) => void
  setThinking: (value: boolean) => void
  toggleDrawer: (value: boolean) => void
  setInstallPromptOpen: (value: boolean) => void
  recordLatency: (ms: number) => void
  setCurrentLine: (line: string) => void
  setTranscript: (text: string) => void
  requestFido: (label: string, onConfirm: () => void) => void
  closeFido: () => void
  resetSession: () => void
}

const DEFAULT_LINE =
  'Chào buổi sáng Mr Stark. Chúc anh một ngày làm việc hiệu quả tại MSB Business. Em là Friday — Trợ lý Quan hệ Khách hàng Doanh nghiệp của anh.'

export const useSession = create<SessionState>((set) => ({
  phase: 'locked',
  activeIntent: null,
  activeSlots: {},
  pendingSlot: null,
  chips: INITIAL_CHIPS,
  history: [],
  isListening: false,
  isSpeaking: false,
  isThinking: false,
  drawerOpen: false,
  installPromptOpen: false,
  lastLatencyMs: null,
  fidoPrompt: null,
  currentLine: DEFAULT_LINE,
  transcript: '',

  unlock: () => set({ phase: 'dashboard' }),

  runIntent: (id, slots = {}) =>
    set((state) => {
      const history = id === 'GREETING' ? state.history : [...state.history, id]
      const next = nextChipsFor(id, history)
      return {
        activeIntent: id === 'GREETING' ? null : id,
        activeSlots: slots,
        pendingSlot: null,
        chips: next.length > 0 ? next : state.chips,
        history,
        drawerOpen: false,
      }
    }),

  refineSlots: (slots) =>
    set((state) => ({ activeSlots: { ...state.activeSlots, ...slots }, pendingSlot: null })),

  setPendingSlot: (pending) => set({ pendingSlot: pending }),

  setListening: (value) => set({ isListening: value }),
  setSpeaking: (value) => set({ isSpeaking: value }),
  setThinking: (value) => set({ isThinking: value }),
  toggleDrawer: (value) => set({ drawerOpen: value }),
  setInstallPromptOpen: (value) => set({ installPromptOpen: value }),
  recordLatency: (ms) => set({ lastLatencyMs: ms }),
  setCurrentLine: (line) => set({ currentLine: line }),
  setTranscript: (text) => set({ transcript: text }),
  requestFido: (label, onConfirm) => set({ fidoPrompt: { label, onConfirm } }),
  closeFido: () => set({ fidoPrompt: null }),

  /**
   * Đưa phiên về trạng thái sạch để demo lại từ đầu.
   * Giữ nguyên phase dashboard và cache audio — presenter
   * không phải đăng nhập lại giữa hai lượt trình diễn.
   */
  resetSession: () =>
    set({
      activeIntent: null,
      activeSlots: {},
      pendingSlot: null,
      chips: INITIAL_CHIPS,
      history: [],
      isListening: false,
      isSpeaking: false,
      isThinking: false,
      drawerOpen: false,
      lastLatencyMs: null,
      fidoPrompt: null,
      currentLine: DEFAULT_LINE,
      transcript: '',
    }),
}))
