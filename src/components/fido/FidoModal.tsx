'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useSession } from '@/lib/session'

const SCAN_DURATION_MS = 1_600
const SUCCESS_DISPLAY_MS = 750

export function FidoModal() {
  const prompt = useSession((s) => s.fidoPrompt)
  const closeFido = useSession((s) => s.closeFido)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!prompt) {
      setDone(false)
      return
    }

    setDone(false)
    let closeTimer: ReturnType<typeof setTimeout> | null = null

    const scanTimer = setTimeout(() => {
      setDone(true)
      closeTimer = setTimeout(() => {
        closeFido()
        prompt.onConfirm()
      }, SUCCESS_DISPLAY_MS)
    }, SCAN_DURATION_MS)

    return () => {
      clearTimeout(scanTimer)
      if (closeTimer) clearTimeout(closeTimer)
    }
  }, [prompt, closeFido])

  return (
    <AnimatePresence>
      {prompt && (
        <motion.div
          className="absolute inset-0 z-[60] flex flex-col items-center justify-center gap-8 bg-[#0C0E12]/95 backdrop-blur-md px-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative w-[168px] h-[168px] flex items-center justify-center">
            {/* Outer static box */}
            <div className="absolute inset-0 border border-msb-gold/30 rounded-[16px]" />

            {/* Scanning radar */}
            {!done && (
              <>
                <div className="absolute inset-0 border-2 border-msb-gold rounded-[16px] animate-[scanRing_1s_ease-out_infinite]" />
                <div className="absolute left-2 right-2 h-[2px] bg-msb-gold shadow-[0_0_16px_2px_rgba(190,154,97,0.7)] animate-[scanLine_0.9s_ease-in-out_infinite_alternate]" />
              </>
            )}

            {/* Inner box */}
            <div className="absolute inset-[24px] bg-card/90 rounded-[12px] border border-msb-gold/35 backdrop-blur-sm" />

            {/* Biometric Face SVG */}
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke={done ? '#12B76A' : '#BE9A61'}
              strokeWidth="1.2"
              strokeLinecap="round"
              className="relative transition-colors duration-300"
            >
              <path d="M4 8V6a2 2 0 0 1 2-2h2" />
              <path d="M20 8V6a2 2 0 0 0-2-2h-2" />
              <path d="M4 16v2a2 2 0 0 0 2 2h2" />
              <path d="M20 16v2a2 2 0 0 1-2 2h-2" />
              <circle cx="9.5" cy="11" r=".6" />
              <circle cx="14.5" cy="11" r=".6" />
              <path d="M9.5 15c.8.8 1.6 1.1 2.5 1.1s1.7-.3 2.5-1.1" />
            </svg>
          </div>

          <div className="text-center px-6">
            <p className="font-bold text-small tracking-[-0.01em] text-white m-0">
              {prompt.label}
            </p>
            <p className="mt-2.5 font-semibold text-caption tracking-[0.16em] text-white/50 uppercase">
              {done ? 'XÁC THỰC THÀNH CÔNG' : 'ĐANG XÁC THỰC SINH TRẮC HỌC…'}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
