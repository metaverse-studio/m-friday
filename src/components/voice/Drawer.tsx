'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { getIntent } from '@/lib/intents/registry'
import type { IntentId } from '@/lib/intents/types'
import { useSession } from '@/lib/session'
import { useVoiceTurn } from '@/lib/useVoiceTurn'

const GROUPS = [
  {
    name: 'PHÂN TÍCH',
    ids: ['CASH_FLOW', 'PERIOD_COMPARE', 'OBLIGATION_CALENDAR', 'TXN_HISTORY'] as IntentId[],
  },
  {
    name: 'PHÊ DUYỆT',
    ids: ['RECENT_ACTIONS', 'TRADE_FINANCE', 'FRAUD_ALERT', 'APPROVE_FIDO', 'REJECT_ORDER'] as IntentId[],
  },
  {
    name: 'TƯ VẤN',
    ids: ['SUGGEST_CCTG', 'FX_FORWARD', 'LOAN_BALANCE'] as IntentId[],
  },
  {
    name: 'HỖ TRỢ',
    ids: ['CALL_HOTLINE', 'SESSION_SUMMARY'] as IntentId[],
  },
]

type Props = {
  onSelect: (id: IntentId) => void
}

export function Drawer({ onSelect }: Props) {
  const open = useSession((s) => s.drawerOpen)
  const toggleDrawer = useSession((s) => s.toggleDrawer)
  const { resetSession } = useVoiceTurn()

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="absolute inset-0 z-50 flex flex-col justify-end bg-[#1D2939]/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => toggleDrawer(false)}
        >
          <motion.div
            className="max-h-[85dvh] w-full max-w-4xl mx-auto overflow-y-auto bg-[#101520] border-t md:border border-white/12 border-t-white/50 rounded-t-[16px] md:rounded-[16px] p-5 md:p-7 pb-8 no-scrollbar shadow-[0_-10px_40px_rgba(0,0,0,0.6)]"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            onClick={(event: any) => event.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/12 pb-3.5">
              <div>
                <p className="font-bold text-[15px] leading-none tracking-[-0.01em] text-white m-0">
                  TẤT CẢ LỆNH NGHIỆP VỤ
                </p>
                <p className="mt-1.5 font-normal text-[10.5px] leading-none tracking-[0.08em] text-white/40 m-0 uppercase">
                  14 KỊCH BẢN · 4 NHÓM
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleDrawer(false)}
                aria-label="Đóng"
                className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 hover:bg-white/20 text-white/80 font-normal text-[13px] cursor-pointer transition-all"
              >
                ✕
              </button>
            </div>

            {/* 4 Groups */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
              {GROUPS.map((group) => (
                <div key={group.name} className="flex flex-col">
                  <p className="mb-2 font-bold text-[9px] leading-none tracking-[0.16em] text-msb-gold uppercase">
                    {group.name}
                  </p>
                  <div className="flex flex-col gap-[1px] bg-white/10 border border-white/10 rounded-[8px] overflow-hidden flex-1">
                    {group.ids.map((id) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          toggleDrawer(false)
                          onSelect(id)
                        }}
                        className="bg-[#131A27] hover:bg-[#1C2536] hover:text-msb-gold p-3 text-left font-medium text-[11.5px] leading-[1.3] text-white/90 transition-colors cursor-pointer"
                      >
                        {getIntent(id).label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Reset Session Button */}
            <button
              type="button"
              onClick={() => {
                resetSession()
                toggleDrawer(false)
              }}
              className="w-full mt-5 p-3.5 flex items-center justify-between rounded-[8px] bg-transparent border border-msb-orange/60 hover:bg-msb-orange/10 font-bold text-[12px] leading-none tracking-[0.08em] uppercase text-msb-orange text-left transition-colors cursor-pointer"
            >
              <span>BẮT ĐẦU PHIÊN MỚI</span>
              <span className="font-normal text-[14px]">↺</span>
            </button>
            <p className="mt-2.5 font-normal text-[10px] leading-[1.5] text-white/35 text-left m-0">
              Xóa hội thoại, khôi phục hàng chờ và hạn mức về gốc, giữ nguyên cache audio.
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
