'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useSession } from '@/lib/session'
import { HologramRM } from './HologramRM'

type Props = {
  onCancel?: () => void
  onStop?: () => void
}

export function Orb({ onCancel, onStop }: Props) {
  const isListening = useSession((s) => s.isListening)
  const transcript = useSession((s) => s.transcript)
  const setListening = useSession((s) => s.setListening)
  const setTranscript = useSession((s) => s.setTranscript)

  const handleCancel = () => {
    if (onCancel) {
      onCancel()
    } else {
      setListening(false)
      setTranscript('')
    }
  }

  const handleStop = () => {
    if (onStop) {
      onStop()
    } else {
      handleCancel()
    }
  }

  return (
    <AnimatePresence>
      {isListening && (
        <motion.div
          className="absolute inset-0 z-40 flex flex-col items-center justify-between bg-[#0D2745]/95 p-6 pt-10 pb-8 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="font-bold text-caption tracking-[0.2em] text-msb-gold uppercase">
            ĐANG THU ÂM · TIẾNG VIỆT
          </p>

          <div className="flex flex-col items-center my-auto w-full max-w-sm">
            {/* 3D Hologram RM Visual */}
            <div className="my-2 flex flex-col items-center">
              <HologramRM
                size={230}
                interactive={true}
                onClick={handleStop}
                showStatusBadge={true}
              />
            </div>

            {/* Transcript */}
            <p className="font-bold text-title tracking-[-0.01em] text-center text-white min-h-[52px] px-4 m-0">
              {transcript || 'Đang nghe…'}
            </p>

            <p className="mt-3 font-normal text-caption text-center text-white/50">
              Chạm orb hoặc bấm nút bên dưới khi nói xong · tự động gửi sau 5 giây
            </p>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-2">
            <button
              type="button"
              onClick={handleStop}
              className="w-full p-3.5 px-5 btn-primary-msb shadow-[0_4px_16px_rgba(244,96,12,0.35)] font-bold text-caption tracking-[0.08em] uppercase text-white transition-all cursor-pointer text-center"
            >
              NÓI XONG · GỬI YÊU CẦU →
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full p-2.5 rounded-[8px] bg-transparent text-white/50 hover:text-white/80 font-semibold text-caption tracking-[0.08em] uppercase transition-colors cursor-pointer text-center"
            >
              HỦY BỎ
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
