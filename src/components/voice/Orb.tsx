'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useSession } from '@/lib/session'

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
          className="absolute inset-0 z-40 flex flex-col items-center justify-between bg-[#0D2745]/95 p-6 pt-12 pb-8 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <p className="font-bold text-[10px] leading-none tracking-[0.2em] text-msb-gold uppercase">
            ĐANG THU ÂM · TIẾNG VIỆT
          </p>

          <div className="flex flex-col items-center my-auto w-full max-w-sm">
            {/* Concentric spinning square orb */}
            <div
              onClick={handleStop}
              className="relative w-[210px] h-[210px] flex items-center justify-center cursor-pointer my-5 active:scale-95 transition-transform"
              title="Chạm để gửi lệnh giọng nói"
            >
              {/* Radial glow */}
              <div className="absolute inset-4 bg-[radial-gradient(circle_at_50%_45%,rgba(247,144,9,0.9)_0%,rgba(244,96,12,0.55)_45%,rgba(244,96,12,0)_74%)] blur-[7px] animate-[orbPulse_2.2s_ease-in-out_infinite]" />

              {/* Square 1 */}
              <div className="absolute inset-0 border-2 border-msb-gold/35 rounded-[24px] animate-[orbSpin_11s_linear_infinite]" />

              {/* Square 2 */}
              <div className="absolute inset-[30px] border border-white/25 rounded-[16px] animate-[orbSpinR_7s_linear_infinite]" />

              {/* Square 3 */}
              <div className="absolute inset-[62px] border border-msb-gold/50 rounded-[12px] animate-[orbSpin_5s_linear_infinite]" />

              {/* Center wave bars */}
              <span className="relative flex items-end gap-0.5 h-[34px]">
                <i className="w-[3px] h-full bg-white rounded-full animate-[waveBar_0.62s_ease-in-out_infinite]" />
                <i className="w-[3px] h-full bg-white rounded-full animate-[waveBar_0.62s_ease-in-out_0.08s_infinite]" />
                <i className="w-[3px] h-full bg-msb-gold rounded-full animate-[waveBar_0.62s_ease-in-out_0.16s_infinite]" />
                <i className="w-[3px] h-full bg-white rounded-full animate-[waveBar_0.62s_ease-in-out_0.24s_infinite]" />
                <i className="w-[3px] h-full bg-white rounded-full animate-[waveBar_0.62s_ease-in-out_0.32s_infinite]" />
              </span>
            </div>

            {/* Transcript */}
            <p className="font-bold text-[18px] md:text-[20px] leading-[1.35] tracking-[-0.01em] text-center text-white min-h-[52px] px-4 m-0">
              {transcript || 'Đang nghe…'}
            </p>

            <p className="mt-3 font-normal text-[11.5px] leading-[1.5] text-center text-white/50">
              Chạm orb hoặc bấm nút bên dưới khi nói xong · tự động gửi sau 5 giây
            </p>
          </div>

          <div className="w-full max-w-sm flex flex-col gap-2">
            <button
              type="button"
              onClick={handleStop}
              className="w-full p-3.5 px-5 btn-primary-msb shadow-[0_4px_16px_rgba(244,96,12,0.35)] font-bold text-[12.5px] leading-none tracking-[0.08em] uppercase text-white transition-all cursor-pointer text-center"
            >
              NÓI XONG · GỬI YÊU CẦU →
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="w-full p-2.5 rounded-[8px] bg-transparent text-white/50 hover:text-white/80 font-semibold text-[11px] leading-none tracking-[0.08em] uppercase transition-colors cursor-pointer text-center"
            >
              HỦY BỎ
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
