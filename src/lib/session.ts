import { create } from 'zustand'
import { getIntent } from './intents/registry'
import type { IntentId } from './intents/types'

export type Phase = 'locked' | 'dashboard'

const INITIAL_CHIPS: IntentId[] = ['CASH_FLOW', 'RECENT_ACTIONS', 'TRADE_FINANCE']

type SessionState = {
  phase: Phase
  activeIntent: IntentId | null
  chips: IntentId[]
  history: IntentId[]
  isListening: boolean
  isSpeaking: boolean
  drawerOpen: boolean
  lastLatencyMs: number | null
  fidoPrompt: { label: string; onConfirm: () => void } | null
  currentLine: string
  transcript: string

  unlock: () => void
  runIntent: (id: IntentId) => void
  setListening: (value: boolean) => void
  setSpeaking: (value: boolean) => void
  toggleDrawer: (value: boolean) => void
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
  chips: INITIAL_CHIPS,
  history: [],
  isListening: false,
  isSpeaking: false,
  drawerOpen: false,
  lastLatencyMs: null,
  fidoPrompt: null,
  currentLine: DEFAULT_LINE,
  transcript: '',

  unlock: () => set({ phase: 'dashboard' }),

  runIntent: (id) =>
    set((state) => {
      const next = getIntent(id).nextChips
      return {
        activeIntent: id === 'GREETING' ? null : id,
        chips: next.length > 0 ? next : state.chips,
        history: id === 'GREETING' ? state.history : [...state.history, id],
        drawerOpen: false,
      }
    }),

  setListening: (value) => set({ isListening: value }),
  setSpeaking: (value) => set({ isSpeaking: value }),
  toggleDrawer: (value) => set({ drawerOpen: value }),
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
      chips: INITIAL_CHIPS,
      history: [],
      isListening: false,
      isSpeaking: false,
      drawerOpen: false,
      lastLatencyMs: null,
      fidoPrompt: null,
      currentLine: DEFAULT_LINE,
      transcript: '',
    }),
}))
